import * as fs from 'fs/promises';
import * as path from 'path';

import { NextApiRequest, NextApiResponse } from 'next';

export interface InsightSummary {
  meta: {
    title: string;
    authors: string[];
    source: string;
  };
  insights: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InsightSummary[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const markdownPath = path.join(process.cwd(), '..', 'docs', 'research-insights.md');
    const markdownContent = await fs.readFile(markdownPath, 'utf-8');

    const summaries = parseMarkdown(markdownContent);
    res.status(200).json(summaries);
  } catch (error) {
    console.error('Failed to read insights:', error);
    res.status(404).json({ error: 'Insights file not found' });
  }
}

function parseMarkdown(content: string): InsightSummary[] {
  const summaries: InsightSummary[] = [];
  const sections = content.split('## ').filter((s) => s.trim());

  for (const section of sections) {
    const lines = section.split('\n').filter((l) => l.trim());
    if (lines.length === 0) continue;

    const title = lines[0];
    let authors: string[] = ['Unknown'];
    let source = 'Unknown';
    const insights: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('- **Authors:**')) {
        authors = line
          .replace('- **Authors:**', '')
          .trim()
          .split(',')
          .map((a) => a.trim());
      } else if (line.startsWith('- **Source:**')) {
        source = line.replace('- **Source:**', '').trim();
      } else if (line.startsWith('- **Key insights:**')) {
        // Start collecting insights
        for (let j = i + 1; j < lines.length; j++) {
          const insightLine = lines[j].trim();
          if (insightLine.startsWith('- ')) {
            insights.push(insightLine.substring(2).trim());
          }
        }
        break;
      }
    }

    if (title) {
      summaries.push({
        meta: { title, authors, source },
        insights,
      });
    }
  }

  return summaries;
}
