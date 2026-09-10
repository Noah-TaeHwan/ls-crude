import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingPopulation, yearPopulation } from "../app/lib/cushing-population.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091POPZ/cushing_city_population_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091POPZ/cushing_city_population_annual.csv", base), "utf8");

const TOTAL_SUM = 119988;

test("cushing city population keeps annual city series with dated rows", () => {
  const series = readCushingPopulation(frozen);
  assert.equal(series.geography, "Cushing city, Oklahoma");
  assert.equal(series.frequency, "annual July 1 estimate");
  assert.equal(series.rows.length, 15);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  );
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.population) && row.population > 0);
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.population, 0),
    TOTAL_SUM,
  );
  // Last year agrees with the frozen PEP place total, not Payne County.
  assert.deepEqual(yearPopulation(series, 2024), {
    year: 2024,
    population: 8444,
  });
});

test("cushing city population csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,cushing_city_population");
  assert.equal(lines.length, 16);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [year, population] = line.split(",");
    const row = yearPopulation(readCushingPopulation(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(population), row.population);
    totalSum += Number(population);
  }
  assert.equal(totalSum, TOTAL_SUM);
});

test("cushing city population fails closed on damage", () => {
  assert.ok(readCushingPopulation(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2025, population: 0 });
  assert.equal(readCushingPopulation(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingPopulation(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2011;
  assert.equal(readCushingPopulation(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[14] = structuredClone(copied.rows[13]);
  copied.rows[14].year = 2024;
  assert.equal(readCushingPopulation(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Payne County, Oklahoma";
  assert.equal(readCushingPopulation(relabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readCushingPopulation(busyRelabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[0].population = 7828;
  assert.equal(readCushingPopulation(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingPopulation(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2025, population: 8450 });
  assert.equal(readCushingPopulation(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[5].population = 0;
  assert.equal(readCushingPopulation(zeroed), null);
  assert.equal(readCushingPopulation(null), null);
  assert.equal(yearPopulation(null, 2024), null);
  assert.equal(yearPopulation(readCushingPopulation(frozen), 2025), null);
});
