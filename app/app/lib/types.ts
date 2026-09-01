export interface DailyFeatureRow {
  date: string;
  ticker: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  rsi_14: number | null;
  slice_score: number | null;
  slice_z: number | null;
  hormuz_count: number | null;
  inflation_count: number | null;
  sample: "in" | "out";
  rsi_position: "long" | "flat" | "short" | null;
}

export interface NewsEventRow {
  id?: string;
  published_at: string;
  title: string;
  url: string | null;
  source: string;
  tags: string[];
}

export interface BaselineSnapshot {
  ticker: string;
  in_sample: { start: string; end: string };
  out_sample: { start: string; end: string | null };
  rows: DailyFeatureRow[];
  news: NewsEventRow[];
}

export interface ActionResult {
  ok: boolean;
  message: string;
}
