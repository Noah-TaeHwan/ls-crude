import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingTri, yearTriRelease } from "../app/lib/cushing-tri.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091TRIZ/cushing_city_tri_onsite_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091TRIZ/cushing_city_tri_onsite_annual.csv", base), "utf8");

const TOTAL_SUM = 924142;

test("cushing city tri keeps annual city series with dated rows", () => {
  const series = readCushingTri(frozen);
  assert.equal(series.geography, "Cushing city, Oklahoma");
  assert.equal(series.frequency, "annual reporting year");
  assert.equal(series.unit, "lb");
  assert.equal(series.rows.length, 16);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2024],
  );
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.on_site_release_lb) && row.on_site_release_lb >= 0);
    assert.equal(row.facility_count, 1);
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.on_site_release_lb, 0),
    TOTAL_SUM,
  );
  // Peak year and the disclosed 2024 zero agree with the frozen city aggregate.
  assert.deepEqual(yearTriRelease(series, 1992), {
    year: 1992,
    on_site_release_lb: 176921,
    facility_count: 1,
  });
  assert.deepEqual(yearTriRelease(series, 2024), {
    year: 2024,
    on_site_release_lb: 0,
    facility_count: 1,
  });
  // Gap years stay missing, not zero.
  assert.equal(yearTriRelease(series, 2010), null);
});

test("cushing city tri csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,on_site_release_lb,facility_count");
  assert.equal(lines.length, 17);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [year, lb, facilityCount] = line.split(",");
    const row = yearTriRelease(readCushingTri(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(lb), row.on_site_release_lb);
    assert.equal(Number(facilityCount), row.facility_count);
    totalSum += Number(lb);
  }
  assert.equal(totalSum, TOTAL_SUM);
});

test("cushing city tri fails closed on damage", () => {
  assert.ok(readCushingTri(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2023, on_site_release_lb: 0, facility_count: 1 });
  assert.equal(readCushingTri(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingTri(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 1990;
  assert.equal(readCushingTri(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[15] = structuredClone(copied.rows[14]);
  copied.rows[15].year = 2024;
  assert.equal(readCushingTri(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Stillwater, Oklahoma";
  assert.equal(readCushingTri(relabeled), null);
  const countyRelabeled = structuredClone(frozen);
  countyRelabeled.geography = "Payne County, Oklahoma";
  assert.equal(readCushingTri(countyRelabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readCushingTri(busyRelabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[3].on_site_release_lb = 176922;
  assert.equal(readCushingTri(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingTri(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2025, on_site_release_lb: 100, facility_count: 1 });
  assert.equal(readCushingTri(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[5].on_site_release_lb = 0;
  assert.equal(readCushingTri(zeroed), null);
  const unitSwapped = structuredClone(frozen);
  unitSwapped.unit = "tons";
  assert.equal(readCushingTri(unitSwapped), null);
  assert.equal(readCushingTri(null), null);
  assert.equal(yearTriRelease(null, 2003), null);
  assert.equal(yearTriRelease(readCushingTri(frozen), 2010), null);
});
