import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readPayneCountyHousing, yearHousingUnits } from "../app/lib/cushing-county-housing.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091HUCZ/payne_county_housing_units_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091HUCZ/payne_county_housing_units_annual.csv", base), "utf8");

const TOTAL_SUM = 539269;

test("payne county housing keeps annual county series with dated rows", () => {
  const series = readPayneCountyHousing(frozen);
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.frequency, "annual July 1 estimate");
  assert.equal(series.rows.length, 15);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  );
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.housing_units) && row.housing_units > 0);
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.housing_units, 0),
    TOTAL_SUM,
  );
  // Last year agrees with the frozen PEP county HU total, not Cushing city.
  assert.deepEqual(yearHousingUnits(series, 2024), {
    year: 2024,
    housing_units: 37437,
  });
});

test("payne county housing csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,payne_county_housing_units");
  assert.equal(lines.length, 16);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [year, housingUnits] = line.split(",");
    const row = yearHousingUnits(readPayneCountyHousing(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(housingUnits), row.housing_units);
    totalSum += Number(housingUnits);
  }
  assert.equal(totalSum, TOTAL_SUM);
});

test("payne county housing fails closed on damage", () => {
  assert.ok(readPayneCountyHousing(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2025, housing_units: 0 });
  assert.equal(readPayneCountyHousing(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneCountyHousing(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2011;
  assert.equal(readPayneCountyHousing(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[14] = structuredClone(copied.rows[13]);
  copied.rows[14].year = 2024;
  assert.equal(readPayneCountyHousing(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing city, Oklahoma";
  assert.equal(readPayneCountyHousing(relabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readPayneCountyHousing(busyRelabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[0].housing_units = 34012;
  assert.equal(readPayneCountyHousing(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneCountyHousing(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2025, housing_units: 37500 });
  assert.equal(readPayneCountyHousing(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[5].housing_units = 0;
  assert.equal(readPayneCountyHousing(zeroed), null);
  assert.equal(readPayneCountyHousing(null), null);
  assert.equal(yearHousingUnits(null, 2024), null);
  assert.equal(yearHousingUnits(readPayneCountyHousing(frozen), 2025), null);
});
