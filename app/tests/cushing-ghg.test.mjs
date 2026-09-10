import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingGhg, yearGhgCo2e } from "../app/lib/cushing-ghg.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091GHGZ/cushing_city_ghg_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091GHGZ/cushing_city_ghg_annual.csv", base), "utf8");

const TOTAL_SUM = 165176.638;

test("cushing city ghg keeps annual city co2e series with dated rows", () => {
  const series = readCushingGhg(frozen);
  assert.equal(series.geography, "Cushing city, Oklahoma");
  assert.equal(series.frequency, "annual reporting year");
  assert.equal(series.unit, "metric tons CO2e (IPCC AR4 GWP)");
  assert.equal(series.rows.length, 4);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2016, 2017, 2018, 2019],
  );
  for (const row of series.rows) {
    assert.ok(typeof row.co2e_metric_tons === "number" && row.co2e_metric_tons > 0);
    assert.equal(row.facility_count, 1);
  }
  const sum = series.rows.reduce((n, row) => n + row.co2e_metric_tons, 0);
  assert.ok(Math.abs(sum - TOTAL_SUM) < 1e-6);
  // Peak year agrees with the frozen city aggregate.
  assert.deepEqual(yearGhgCo2e(series, 2017), {
    year: 2017,
    co2e_metric_tons: 46316.15,
    facility_count: 1,
  });
  assert.deepEqual(yearGhgCo2e(series, 2019), {
    year: 2019,
    co2e_metric_tons: 36271.846,
    facility_count: 1,
  });
  // Gap years stay missing, not zero.
  assert.equal(yearGhgCo2e(series, 2020), null);
  assert.equal(yearGhgCo2e(series, 2015), null);
});

test("cushing city ghg csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,co2e_metric_tons,facility_count");
  assert.equal(lines.length, 5);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [year, co2e, facilityCount] = line.split(",");
    const row = yearGhgCo2e(readCushingGhg(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(co2e), row.co2e_metric_tons);
    assert.equal(Number(facilityCount), row.facility_count);
    totalSum += Number(co2e);
  }
  assert.ok(Math.abs(totalSum - TOTAL_SUM) < 1e-6);
});

test("cushing city ghg fails closed on damage", () => {
  assert.ok(readCushingGhg(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2020, co2e_metric_tons: 0, facility_count: 1 });
  assert.equal(readCushingGhg(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingGhg(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2017;
  assert.equal(readCushingGhg(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[3] = structuredClone(copied.rows[2]);
  copied.rows[3].year = 2019;
  assert.equal(readCushingGhg(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Stillwater, Oklahoma";
  assert.equal(readCushingGhg(relabeled), null);
  const countyRelabeled = structuredClone(frozen);
  countyRelabeled.geography = "Payne County, Oklahoma";
  assert.equal(readCushingGhg(countyRelabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readCushingGhg(busyRelabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[1].co2e_metric_tons = 46316.16;
  assert.equal(readCushingGhg(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingGhg(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2023, co2e_metric_tons: 100, facility_count: 1 });
  assert.equal(readCushingGhg(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[0].co2e_metric_tons = 0;
  assert.equal(readCushingGhg(zeroed), null);
  const unitSwapped = structuredClone(frozen);
  unitSwapped.unit = "lb";
  assert.equal(readCushingGhg(unitSwapped), null);
  // TRI pounds and VOC tons are never valid CO2e values here.
  const triCopy = structuredClone(frozen);
  triCopy.rows[0].co2e_metric_tons = 87666;
  assert.equal(readCushingGhg(triCopy), null);
  const vocCopy = structuredClone(frozen);
  vocCopy.rows[3].co2e_metric_tons = 1206.389;
  assert.equal(readCushingGhg(vocCopy), null);
  assert.equal(readCushingGhg(null), null);
  assert.equal(yearGhgCo2e(null, 2018), null);
  assert.equal(yearGhgCo2e(readCushingGhg(frozen), 2020), null);
});
