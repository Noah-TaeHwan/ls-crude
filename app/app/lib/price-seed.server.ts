import { open, type FileHandle } from "node:fs/promises";
import path from "node:path";

/** Yahoo CL=F daily seed in the repo. Metadata only — no PnL. */
export const CLF_SEED_RELATIVE_PATH = "research/data/clf-daily-2015-2026.csv";
export const CLF_TICKER = "CL=F";
export const CLF_SEED_COLUMNS = [
  "date",
  "Open",
  "High",
  "Low",
  "Close",
  "Volume",
  "sample",
] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HEAD_BYTES = 2048;
const TAIL_BYTES = 4096;

export interface ClfPriceSeedMeta {
  relativePath: string;
  loaded: boolean;
  ticker: typeof CLF_TICKER;
  columns: readonly string[];
  firstDate: string | null;
  lastDate: string | null;
  inSampleStart: string;
  inSampleEnd: string;
  outSampleStart: string;
}

function resolveSeedPath() {
  return path.resolve(process.cwd(), "..", CLF_SEED_RELATIVE_PATH);
}

function firstDateFromChunk(text: string) {
  for (const line of text.split(/\r?\n/)) {
    const cell = line.split(",")[0]?.trim() ?? "";
    if (DATE_RE.test(cell)) return cell;
  }
  return null;
}

function lastDateFromChunk(text: string) {
  const lines = text.split(/\r?\n/);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const cell = lines[index]?.split(",")[0]?.trim() ?? "";
    if (DATE_RE.test(cell)) return cell;
  }
  return null;
}

async function peekDateRange(handle: FileHandle) {
  const stat = await handle.stat();
  if (stat.size === 0) return { firstDate: null, lastDate: null };

  const headSize = Math.min(HEAD_BYTES, stat.size);
  const head = Buffer.alloc(headSize);
  await handle.read(head, 0, headSize, 0);

  const tailSize = Math.min(TAIL_BYTES, stat.size);
  const tail = Buffer.alloc(tailSize);
  await handle.read(tail, 0, tailSize, stat.size - tailSize);

  return {
    firstDate: firstDateFromChunk(head.toString("utf8")),
    lastDate: lastDateFromChunk(tail.toString("utf8")),
  };
}

export async function readClfPriceSeedMeta(): Promise<ClfPriceSeedMeta> {
  const base: ClfPriceSeedMeta = {
    relativePath: CLF_SEED_RELATIVE_PATH,
    loaded: false,
    ticker: CLF_TICKER,
    columns: CLF_SEED_COLUMNS,
    firstDate: "2015-01-02",
    lastDate: null,
    inSampleStart: "2015-01-01",
    inSampleEnd: "2023-12-31",
    outSampleStart: "2024-01-01",
  };

  try {
    const handle = await open(resolveSeedPath(), "r");
    try {
      const range = await peekDateRange(handle);
      return {
        ...base,
        loaded: true,
        firstDate: range.firstDate ?? base.firstDate,
        lastDate: range.lastDate,
      };
    } finally {
      await handle.close();
    }
  } catch {
    return base;
  }
}
