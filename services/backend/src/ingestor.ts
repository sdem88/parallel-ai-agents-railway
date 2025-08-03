import * as path from 'path';

import * as fs from 'fs-extra';
import * as chokidar from 'chokidar';
import pdf from 'pdf-parse';

import { InsightSummary, PaperMeta, CompactError } from './types';
import { summariseLLM } from './lib/llmGuard';

export class PaperIngestor {
  private watchPath: string;
  private outputPath: string;

  constructor(watchPath: string, outputPath: string) {
    this.watchPath = watchPath;
    this.outputPath = outputPath;
  }

  async processPaper(filePath: string): Promise<void> {
    try {
      const fileExt = path.extname(filePath).toLowerCase();
      let text = '';
      let meta: PaperMeta;

      if (fileExt === '.pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        text = pdfData.text;

        // Extract metadata from PDF
        meta = {
          title: this.extractTitle(pdfData.text) || path.basename(filePath, '.pdf'),
          authors: this.extractAuthors(pdfData.text),
          source: path.basename(filePath),
        };
      } else if (fileExt === '.txt') {
        text = await fs.readFile(filePath, 'utf-8');
        meta = {
          title: this.extractTitle(text) || path.basename(filePath, '.txt'),
          authors: this.extractAuthors(text),
          source: path.basename(filePath),
        };
      } else {
        console.warn(`Skipping unsupported file type: ${filePath}`);
        return;
      }

      // Generate summary using LLM (guarded with token limits)
      const summary = await summariseLLM(text, meta);

      // Append to markdown file
      await this.appendToMarkdown(summary);

      console.log(`Successfully processed: ${filePath}`);
    } catch (error) {
      const compactError: CompactError = {
        error: 'PROCESSING_FAILED',
        context: `Failed to process ${filePath}`,
        action: 'need_supervisor_help',
      };
      console.error('COMPACT_ERROR:', JSON.stringify(compactError));
      throw error;
    }
  }

  private extractTitle(text: string): string {
    // Simple title extraction - look for first line or common patterns
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length > 0) {
      // Check if first line looks like a title (all caps or title case)
      const firstLine = lines[0].trim();
      if (firstLine.length < 200 && firstLine.length > 10) {
        return firstLine;
      }
    }
    return '';
  }

  private extractAuthors(text: string): string[] {
    // Simple author extraction - look for common patterns
    const authorPatterns = [
      /by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g,
      /Authors?:\s*([^\n]+)/i,
      /([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)/g,
    ];

    const authors: string[] = [];
    for (const pattern of authorPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        authors.push(...matches.slice(0, 3)); // Max 3 authors
        break;
      }
    }

    return authors.length > 0 ? authors : ['Unknown'];
  }

  private async appendToMarkdown(summary: InsightSummary): Promise<void> {
    const content = this.formatMarkdown(summary);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(this.outputPath));

    // Append to file
    await fs.appendFile(this.outputPath, content + '\n\n');
  }

  private formatMarkdown(summary: InsightSummary): string {
    const { meta, insights } = summary;

    let markdown = `## ${meta.title}\n`;
    markdown += `- **Authors:** ${meta.authors.join(', ')}\n`;
    markdown += `- **Source:** ${meta.source}\n`;
    markdown += `- **Key insights:**\n`;

    insights.forEach((insight) => {
      markdown += `  - ${insight}\n`;
    });

    return markdown;
  }

  async processOnce(): Promise<void> {
    try {
      await fs.ensureDir(this.watchPath);
      const files = await fs.readdir(this.watchPath);

      for (const file of files) {
        const filePath = path.join(this.watchPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile() && (file.endsWith('.pdf') || file.endsWith('.txt'))) {
          await this.processPaper(filePath);
        }
      }
    } catch (error) {
      const compactError: CompactError = {
        error: 'BATCH_PROCESSING_FAILED',
        context: 'Failed to process papers in batch mode',
        action: 'check_folder_permissions',
      };
      console.error('COMPACT_ERROR:', JSON.stringify(compactError));
      throw error;
    }
  }

  watch(): void {
    console.log(`Watching for papers in: ${this.watchPath}`);

    const watcher = chokidar.watch(this.watchPath, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    watcher
      .on('add', async (filePath: string) => {
        if (filePath.endsWith('.pdf') || filePath.endsWith('.txt')) {
          console.log(`New paper detected: ${filePath}`);
          await this.processPaper(filePath);
        }
      })
      .on('error', (_error) => {
        const compactError: CompactError = {
          error: 'WATCHER_ERROR',
          context: 'File watcher encountered an error',
          action: 'restart_watcher',
        };
        console.error('COMPACT_ERROR:', JSON.stringify(compactError));
      });
  }
}
