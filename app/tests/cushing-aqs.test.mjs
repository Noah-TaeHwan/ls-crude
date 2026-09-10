import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingAqs, yearAqsMean } from "../app/lib/cushing-aqs.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091AQSZ/payne_pm25_stillwater_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091AQSZ/payne_pm25_stillwater_annual.csv", base), "utf8");

const MEAN_SUM = 46.525954;

test("payne pm25 keeps annual stillwater series with dated rows", () => {
  const series = readCushingAqs(frozen);
  assert.equal(series.geography, "Payne County, Oklahoma (Stillwater monitor 40-119-0614)");
  assert.equal(series.frequency, "annual summary year");
  assert.equal(series.unit, "ug/m3 (LC)");
  assert.equal(series.rows.length, 5);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [1999, 2000, 2001, 2002, 2003],
  );
  assert.deepEqual(
    series.rows.map((row) => row.obs_count),
    [39, 54, 60, 60, 2],
  );
  const sum = series.rows.reduce((n, row) => n + row.annual_mean_ug_m3, 0);
  assert.ok(Math.abs(sum - MEAN_SUM) < 1e-9);
  // Peak disclosed mean and the partial 2003 row agree with the frozen monitor aggregate.
  assert.equal(yearAqsMean(series, 2000).annual_mean_ug_m3, 10.635185);
  assert.deepEqual(yearAqsMean(series, 2003), {
    year: 2003,
    annual_mean_ug_m3: 6.7,
    obs_count: 2,
    obs_percent: 3,
    completeness: "N",
    certification: "Certified",
    max_daily_ug_m3: 8,
    max_date: "2003-01-03",
  });
  // Gap years stay missing, not zero.
  assert.equal(yearAqsMean(series, 2004), null);
});

test("payne pm25 csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,annual_mean_ug_m3,obs_count,obs_percent,completeness,certification,max_daily_ug_m3,max_date");
  assert.equal(lines.length, 6);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [year, mean, obsCount] = line.split(",");
    const row = yearAqsMean(readCushingAqs(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(mean), row.annual_mean_ug_m3);
    assert.equal(Number(obsCount), row.obs_count);
    totalSum += Number(mean);
  }
  assert.ok(Math.abs(totalSum - MEAN_SUM) < 1e-9);
});

test("payne pm25 fails closed on damage", () => {
  assert.ok(readCushingAqs(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2004, annual_mean_ug_m3: 0, obs_count: 0, obs_percent: 0, completeness: "N", certification: "Certified", max_daily_ug_m3: 0, max_date: "2004-01-01" });
  assert.equal(readCushingAqs(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingAqs(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2000;
  assert.equal(readCushingAqs(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[4] = structuredClone(copied.rows[3]);
  copied.rows[4].year = 2003;
  assert.equal(readCushingAqs(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing city, Oklahoma";
  assert.equal(readCushingAqs(relabeled), null);
  const countyRelabeled = structuredClone(frozen);
  countyRelabeled.geography = "Oklahoma statewide";
  assert.equal(readCushingAqs(countyRelabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readCushingAqs(busyRelabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[1].annual_mean_ug_m3 = 10.635186;
  assert.equal(readCushingAqs(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingAqs(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2024, annual_mean_ug_m3: 8.1, obs_count: 60, obs_percent: 98, completeness: "Y", certification: "Certified", max_daily_ug_m3: 20, max_date: "2024-07-01" });
  assert.equal(readCushingAqs(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[2].annual_mean_ug_m3 = 0;
  assert.equal(readCushingAqs(zeroed), null);
  const unitSwapped = structuredClone(frozen);
  unitSwapped.unit = "ppb";
  assert.equal(readCushingAqs(unitSwapped), null);
  assert.equal(readCushingAqs(null), null);
  assert.equal(yearAqsMean(null, 2002), null);
  assert.equal(yearAqsMean(readCushingAqs(frozen), 2004), null);
});
