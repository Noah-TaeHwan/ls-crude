import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayDepth, readCushingUsgsGwDaily } from "../app/lib/cushing-usgs-gw.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091GWZ/cushing_groundwater_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091GWZ/cushing_groundwater_daily.csv", base), "utf8");

const ROW_COUNT = 481;
const HUNDREDTHS_SUM = 347450;

test("cushing usgs gw keeps dated daily depth with nothing filled", () => {
  const series = readCushingUsgsGwDaily(frozen);
  assert.equal(series.runId, "20260910T091GWZ");
  assert.equal(series.siteNo, "360339096450201");
  assert.equal(series.stationName, "18N-05E-03 DDA 1 Cimarron3");
  assert.equal(series.label, "Cushing/Payne USGS groundwater, daily confounder, not busy");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].date, "2017-06-29");
  assert.equal(series.rows[ROW_COUNT - 1].date, "2018-10-22");
  let hundSum = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
    assert.ok(row.depthToWaterFt > 0);
    assert.match(row.approval, /^(A|A:\[4\])$/);
    hundSum += Math.round(row.depthToWaterFt * 100);
  }
  assert.equal(hundSum, HUNDREDTHS_SUM);
  // Spot checks: first/last day and the filed minimum.
  assert.deepEqual(dayDepth(series, "2017-06-29"), { date: "2017-06-29", depthToWaterFt: 6.03, approval: "A:[4]" });
  assert.deepEqual(dayDepth(series, "2018-10-22"), { date: "2018-10-22", depthToWaterFt: 7.49, approval: "A" });
  assert.equal(dayDepth(series, "2017-06-28"), null);
});

test("cushing usgs gw csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,depth_to_water_ft,approval");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingUsgsGwDaily(frozen);
  assert.ok(series);
  for (let i = 0; i < series.rows.length; i++) {
    const [date, cell, approval] = lines[i + 1].split(",");
    assert.equal(date, series.rows[i].date);
    assert.equal(Number(cell), series.rows[i].depthToWaterFt);
    assert.equal(approval, series.rows[i].approval);
  }
});

test("cushing usgs gw rejects a filled zero and streamflow site 07161450", () => {
  const filled = structuredClone(frozen);
  filled.rows[100].depthToWaterFt = 0;
  assert.equal(readCushingUsgsGwDaily(filled), null);
  const swapped = structuredClone(frozen);
  swapped.siteNo = "07161450";
  assert.equal(readCushingUsgsGwDaily(swapped), null);
});
