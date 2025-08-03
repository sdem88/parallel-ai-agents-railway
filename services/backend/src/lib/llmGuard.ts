import fs from 'fs/promises';

import OpenAI from 'openai';

import { InsightSummary, PaperMeta } from '../types';

const DAILY_BUDGET = Number(process.env.DAILY_TOKEN_BUDGET ?? 200_000);
const USAGE_FILE = '/tmp/llm_usage.json';

type Usage = { date: string; tokens: number };

async function load(): Promise<Usage> {
  try {
    return JSON.parse(await fs.readFile(USAGE_FILE, 'utf8'));
  } catch {
    return { date: new Date().toISOString().slice(0, 10), tokens: 0 };
  }
}

async function save(u: Usage) {
  await fs.writeFile(USAGE_FILE, JSON.stringify(u));
}

export async function summariseLLM(text: string, meta: PaperMeta): Promise<InsightSummary> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const usage = await load();

  if (usage.date !== new Date().toISOString().slice(0, 10)) {
    usage.tokens = 0;
    usage.date = new Date().toISOString().slice(0, 10);
  }

  if (usage.tokens >= DAILY_BUDGET) {
    throw new Error('token-budget-exceeded');
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // stubbed by tests
    messages: [
      { role: 'system', content: 'Return JSON matching InsightSummary schema.' },
      { role: 'user', content: `${text}\n\nMeta:${JSON.stringify(meta)}` },
    ],
    response_format: { type: 'json_object' },
  });

  usage.tokens += res.usage?.total_tokens ?? 0;
  await save(usage);

  return JSON.parse(res.choices[0].message.content || '{}');
}
