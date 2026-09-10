import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayFlow, readCushingUsgsDaily } from "../app/lib/cushing-usgs.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091USGSZ/cushing_streamflow_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091USGSZ/cushing_streamflow_daily.csv", base), "utf8");

const ROW_COUNT = 14224;
const THOUSANDTHS_SUM = 24894472300;

test("cushing usgs keeps dated daily flow with nothing filled", () => {
  const series = readCushingUsgsDaily(frozen);
  assert.equal(series.runId, "20260910T091USGSZ");
  assert.equal(series.siteNo, "07161450");
  assert.equal(series.stationName, "Cimarron River near Ripley, OK");
  assert.equal(series.label, "Cushing/Payne USGS streamflow, daily confounder, not busy");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].date, "1987-10-01");
  assert.equal(series.rows[ROW_COUNT - 1].date, "2026-09-09");
  let thouSum = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
    assert.ok(row.dischargeCfs >= 0);
    assert.match(row.approval, /^(A|P)(:e|:\[4\])?$/);
    thouSum += Math.round(row.dischargeCfs * 1000);
  }
  assert.equal(thouSum, THOUSANDTHS_SUM);
  // Spot checks: first/last day, the filed maximum, and the provisional tail.
  assert.deepEqual(dayFlow(series, "1987-10-01"), { date: "1987-10-01", dischargeCfs: 5910, approval: "A" });
  assert.deepEqual(dayFlow(series, "1993-05-10"), { date: "1993-05-10", dischargeCfs: 137000, approval: "A" });
  assert.deepEqual(dayFlow(series, "1990-01-01"), { date: "1990-01-01", dischargeCfs: 1150, approval: "A" });
  assert.deepEqual(dayFlow(series, "2026-09-09"), { date: "2026-09-09", dischargeCfs: 78.4, approval: "P:[4]" });
  assert.equal(dayFlow(series, "1987-09-30"), null);
});

test("cushing usgs csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,discharge_cfs,approval");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingUsgsDaily(frozen);
  assert.ok(series);
  for (let i = 0; i < series.rows.length; i++) {
    const [date, cell, approval] = lines[i + 1].split(",");
    assert.equal(date, series.rows[i].date);
    assert.equal(Number(cell), series.rows[i].dischargeCfs);
    assert.equal(approval, series.rows[i].approval);
  }
});

test("cushing usgs rejects a filled zero and a swapped site", () => {
  const filled = structuredClone(frozen);
  filled.rows[100].dischargeCfs = 0;
  assert.equal(readCushingUsgsDaily(filled), null);
  const swapped = structuredClone(frozen);
  swapped.siteNo = "07163300";
  assert.equal(readCushingUsgsDaily(swapped), null);
});
