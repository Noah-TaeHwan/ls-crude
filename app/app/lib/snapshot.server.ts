import { readFile } from "node:fs/promises";
import path from "node:path";

import type { BaselineSnapshot, DailyFeatureRow, NewsEventRow } from "~/lib/types";

function asNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asSample(value: unknown): "in" | "out" {
  return value === "in" ? "in" : "out";
}

function asPosition(value: unknown): DailyFeatureRow["rsi_position"] {
  if (value === "long" || value === "flat" || value === "short") {
    return value;
  }
  return null;
}

export function normalizeFeatureRow(row: Record<string, unknown>): DailyFeatureRow {
  return {
    date: String(row.date ?? ""),
    ticker: String(row.ticker ?? "CL=F"),
    open: asNumber(row.open ?? row.Open),
    high: asNumber(row.high ?? row.High),
    low: asNumber(row.low ?? row.Low),
    close: asNumber(row.close ?? row.Close),
    volume: asNumber(row.volume ?? row.Volume),
    rsi_14: asNumber(row.rsi_14),
    slice_score: asNumber(row.slice_score),
    slice_z: asNumber(row.slice_z),
    hormuz_count: asNumber(row.hormuz_count),
    inflation_count: asNumber(row.inflation_count),
    sample: asSample(row.sample),
    rsi_position: asPosition(row.rsi_position),
  };
}

export function normalizeNewsRow(row: Record<string, unknown>): NewsEventRow {
  const tags = Array.isArray(row.tags)
    ? row.tags.map((tag) => String(tag))
    : [];
  return {
    id: row.id ? String(row.id) : undefined,
    published_at: String(row.published_at ?? ""),
    title: String(row.title ?? ""),
    url: row.url == null ? null : String(row.url),
    source: String(row.source ?? "investing.com"),
    tags,
  };
}

export async function readSnapshotFile(): Promise<BaselineSnapshot> {
  const filePath = path.join(process.cwd(), "public/baseline-snapshot.json");
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as BaselineSnapshot;
  return {
    ...parsed,
    rows: (parsed.rows ?? []).map((row) =>
      normalizeFeatureRow(row as unknown as Record<string, unknown>),
    ),
    news: (parsed.news ?? []).map((row) =>
      normalizeNewsRow(row as unknown as Record<string, unknown>),
    ),
  };
}
