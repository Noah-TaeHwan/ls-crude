import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { monthAttention, readKushMonthly } from "../app/lib/cushing-kush.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091KUSHZ/kush_operational_attention_monthly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091KUSHZ/kush_operational_attention_monthly.csv", base), "utf8");

const MONTH_COUNT = 221;
const ARTICLE_SUM = 101;
const ZERO_MONTHS = 144;

test("kush monthly keeps dated attention series with observed zeros", () => {
  const series = readKushMonthly(frozen);
  assert.equal(series.runId, "20260910T091KUSHZ");
  assert.equal(series.label, "KUSH local operational-attention count, not activity");
  assert.equal(series.rows.length, MONTH_COUNT);
  assert.equal(series.rows[0].month, "2008-02-01");
  assert.equal(series.rows[220].month, "2026-06-01");
  let sum = 0;
  let zeros = 0;
  for (const row of series.rows) {
    assert.match(row.month, /^\d{4}-\d{2}-01$/);
    assert.ok(Number.isSafeInteger(row.articleCount) && row.articleCount >= 0 && row.articleCount <= 3);
    sum += row.articleCount;
    if (row.articleCount === 0) zeros += 1;
  }
  assert.equal(sum, ARTICLE_SUM);
  assert.equal(zeros, ZERO_MONTHS);
  // Spot checks: first month, a peak month, and the trailing month.
  assert.deepEqual(monthAttention(series, "2008-02-01"), { month: "2008-02-01", articleCount: 1 });
  assert.deepEqual(monthAttention(series, "2011-05-01"), { month: "2011-05-01", articleCount: 3 });
  assert.deepEqual(monthAttention(series, "2026-06-01"), { month: "2026-06-01", articleCount: 1 });
});

test("kush monthly csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "month,article_count");
  assert.equal(lines.length, MONTH_COUNT + 1);
  let sum = 0;
  for (const line of lines.slice(1)) {
    const [month, count] = line.split(",");
    const row = monthAttention(readKushMonthly(frozen), month);
    assert.ok(row);
    assert.equal(Number(count), row.articleCount);
    sum += Number(count);
  }
  assert.equal(sum, ARTICLE_SUM);
});

test("kush monthly fails closed on damage", () => {
  assert.ok(readKushMonthly(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readKushMonthly(swapped), null);
  const zeroDropped = structuredClone(frozen);
  zeroDropped.rows.splice(3, 1);
  assert.equal(readKushMonthly(zeroDropped), null);
  const zeroToMissing = structuredClone(frozen);
  zeroToMissing.rows[3].articleCount = null;
  assert.equal(readKushMonthly(zeroToMissing), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ month: "2026-07-01", articleCount: 0 });
  assert.equal(readKushMonthly(invented), null);
  const redated = structuredClone(frozen);
  redated.rows[220].month = "2026-05-01";
  assert.equal(readKushMonthly(redated), null);
  const edited = structuredClone(frozen);
  edited.rows[40].articleCount = 2;
  assert.equal(readKushMonthly(edited), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "KUSH local busy score";
  assert.equal(readKushMonthly(relabeled), null);
  const resourced = structuredClone(frozen);
  resourced.source = "KUSH Radio 1600 AM";
  assert.equal(readKushMonthly(resourced), null);
  assert.equal(readKushMonthly(null), null);
  assert.equal(monthAttention(null, "2026-06-01"), null);
  assert.equal(monthAttention(readKushMonthly(frozen), "2026-07-01"), null);
});
