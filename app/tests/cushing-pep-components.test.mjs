import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readPayneCountyComponents, yearComponents } from "../app/lib/cushing-pep-components.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091COCZ/payne_county_population_components_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(
  new URL("20260910T091COCZ/payne_county_population_components_annual.csv", base),
  "utf8",
);

const BIRTHS_SUM = 11379;
const DEATHS_SUM = 8193;
const NET_MIG_SUM = 3807;

test("payne county components keep annual county series with dated rows", () => {
  const series = readPayneCountyComponents(frozen);
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.countyFips, "40119");
  assert.equal(series.frequency, "annual July 1 estimate");
  assert.equal(series.rows.length, 15);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  );
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.population) && row.population > 0);
    assert.ok(Number.isSafeInteger(row.births) && row.births >= 0);
    assert.ok(Number.isSafeInteger(row.deaths) && row.deaths >= 0);
    assert.equal(row.births - row.deaths, row.natural_change);
    assert.equal(row.international_mig + row.domestic_mig, row.net_mig);
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.births, 0),
    BIRTHS_SUM,
  );
  assert.equal(
    series.rows.reduce((n, row) => n + row.deaths, 0),
    DEATHS_SUM,
  );
  assert.equal(
    series.rows.reduce((n, row) => n + row.net_mig, 0),
    NET_MIG_SUM,
  );
  // Last year agrees with the frozen PEP county row, not Cushing city.
  assert.deepEqual(yearComponents(series, 2024), {
    year: 2024,
    population: 84199,
    births: 748,
    deaths: 689,
    natural_change: 59,
    international_mig: 744,
    domestic_mig: -433,
    net_mig: 311,
  });
});

test("payne county components csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "year,payne_county_population,births,deaths,natural_change,international_mig,domestic_mig,net_mig",
  );
  assert.equal(lines.length, 16);
  let birthsSum = 0;
  let deathsSum = 0;
  let netMigSum = 0;
  for (const line of lines.slice(1)) {
    const [year, population, births, deaths, natural, intl, domestic, net] = line.split(",").map(Number);
    const row = yearComponents(readPayneCountyComponents(frozen), year);
    assert.ok(row);
    assert.equal(population, row.population);
    assert.equal(births, row.births);
    assert.equal(deaths, row.deaths);
    assert.equal(natural, row.natural_change);
    assert.equal(intl, row.international_mig);
    assert.equal(domestic, row.domestic_mig);
    assert.equal(net, row.net_mig);
    birthsSum += births;
    deathsSum += deaths;
    netMigSum += net;
  }
  assert.equal(birthsSum, BIRTHS_SUM);
  assert.equal(deathsSum, DEATHS_SUM);
  assert.equal(netMigSum, NET_MIG_SUM);
});

test("payne county components fail closed on damage", () => {
  assert.ok(readPayneCountyComponents(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({
    year: 2025,
    population: 0,
    births: 0,
    deaths: 0,
    natural_change: 0,
    international_mig: 0,
    domestic_mig: 0,
    net_mig: 0,
  });
  assert.equal(readPayneCountyComponents(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneCountyComponents(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2011;
  assert.equal(readPayneCountyComponents(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[14] = structuredClone(copied.rows[13]);
  copied.rows[14].year = 2024;
  assert.equal(readPayneCountyComponents(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing city, Oklahoma";
  assert.equal(readPayneCountyComponents(relabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readPayneCountyComponents(busyRelabeled), null);
  const fipsSwapped = structuredClone(frozen);
  fipsSwapped.countyFips = "40185";
  assert.equal(readPayneCountyComponents(fipsSwapped), null);
  const edited = structuredClone(frozen);
  edited.rows[0].births = 210;
  assert.equal(readPayneCountyComponents(edited), null);
  const popEdited = structuredClone(frozen);
  popEdited.rows[0].population = 77417;
  assert.equal(readPayneCountyComponents(popEdited), null);
  const brokenArithmetic = structuredClone(frozen);
  brokenArithmetic.rows[5].net_mig = 467;
  assert.equal(readPayneCountyComponents(brokenArithmetic), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneCountyComponents(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    year: 2025,
    population: 84250,
    births: 750,
    deaths: 690,
    natural_change: 60,
    international_mig: 700,
    domestic_mig: -400,
    net_mig: 300,
  });
  assert.equal(readPayneCountyComponents(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[5].population = 0;
  assert.equal(readPayneCountyComponents(zeroed), null);
  assert.equal(readPayneCountyComponents(null), null);
  assert.equal(yearComponents(null, 2024), null);
  assert.equal(yearComponents(readPayneCountyComponents(frozen), 2025), null);
});
