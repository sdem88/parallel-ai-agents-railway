#!/usr/bin/env node

import * as path from 'path';
import * as os from 'os';

import { Command } from 'commander';

import { PaperIngestor } from './ingestor';

const program = new Command();

const DEFAULT_WATCH_PATH = path.join(os.homedir(), 'Desktop', 'Research Papers', 'TEMP');
const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), 'docs', 'research-insights.md');

program
  .name('research-paper-ingestor')
  .description('CLI to ingest and summarize research papers')
  .version('1.0.0');

program
  .option('--once', 'Process all papers once and exit')
  .option('--watch', 'Watch folder for new papers continuously')
  .option('-i, --input <path>', 'Input folder path', DEFAULT_WATCH_PATH)
  .option('-o, --output <path>', 'Output markdown file', DEFAULT_OUTPUT_PATH)
  .action(async (options) => {
    const ingestor = new PaperIngestor(options.input, options.output);

    if (options.once) {
      console.log('Processing papers in batch mode...');
      await ingestor.processOnce();
      console.log('Batch processing complete.');
      process.exit(0);
    } else if (options.watch) {
      console.log('Starting paper watcher...');
      ingestor.watch();
    } else {
      // Default to --once mode
      console.log('No mode specified, defaulting to --once');
      await ingestor.processOnce();
      process.exit(0);
    }
  });

program.parse(process.argv);
