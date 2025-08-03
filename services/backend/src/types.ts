export interface PaperMeta {
  title: string;
  authors: string[];
  source: string; // file path or DOI
}

export interface InsightSummary {
  meta: PaperMeta;
  insights: string[]; // ≤ 5 bullet strings
}

export interface CompactError {
  error: string;
  context: string;
  action: string;
}