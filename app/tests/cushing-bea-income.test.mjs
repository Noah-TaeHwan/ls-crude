import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readPayneCountyIncome, yearPersonalIncome } from "../app/lib/cushing-bea-income.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091INCZ/payne_county_personal_income_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091INCZ/payne_county_personal_income_annual.csv", base), "utf8");

const TOTAL_SUM = 85834209;

test("payne county bea income keeps annual county series with dated rows", () => {
  const series = readPayneCountyIncome(frozen);
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.countyCode, "40119");
  assert.equal(series.frequency, "annual");
  assert.equal(series.unit, "Thousands of dollars");
  assert.equal(series.rows.length, 56);
  assert.equal(series.rows[0].year, 1969);
  assert.equal(series.rows[55].year, 2024);
  for (let i = 0; i < series.rows.length; i++) {
    assert.equal(series.rows[i].year, 1969 + i);
    assert.ok(
      Number.isSafeInteger(series.rows[i].personal_income_thousands_dollars) &&
        series.rows[i].personal_income_thousands_dollars > 0,
    );
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.personal_income_thousands_dollars, 0),
    TOTAL_SUM,
  );
  // Last year agrees with the frozen BEA CAINC1 county total, not Cushing city.
  assert.deepEqual(yearPersonalIncome(series, 2024), {
    year: 2024,
    personal_income_thousands_dollars: 4121797,
  });
});

test("payne county bea income csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,payne_county_personal_income_thousands_dollars");
  assert.equal(lines.length, 57);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [year, income] = line.split(",");
    const row = yearPersonalIncome(readPayneCountyIncome(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(income), row.personal_income_thousands_dollars);
    totalSum += Number(income);
  }
  assert.equal(totalSum, TOTAL_SUM);
});

test("payne county bea income fails closed on damage", () => {
  assert.ok(readPayneCountyIncome(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2025, personal_income_thousands_dollars: 0 });
  assert.equal(readPayneCountyIncome(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneCountyIncome(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 1970;
  assert.equal(readPayneCountyIncome(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[55] = structuredClone(copied.rows[54]);
  copied.rows[55].year = 2024;
  assert.equal(readPayneCountyIncome(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing city, Oklahoma";
  assert.equal(readPayneCountyIncome(relabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readPayneCountyIncome(busyRelabeled), null);
  const fipsSwapped = structuredClone(frozen);
  fipsSwapped.countyCode = "40109";
  assert.equal(readPayneCountyIncome(fipsSwapped), null);
  const unitSwapped = structuredClone(frozen);
  unitSwapped.unit = "Dollars";
  assert.equal(readPayneCountyIncome(unitSwapped), null);
  const edited = structuredClone(frozen);
  edited.rows[0].personal_income_thousands_dollars = 121390;
  assert.equal(readPayneCountyIncome(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneCountyIncome(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2025, personal_income_thousands_dollars: 4200000 });
  assert.equal(readPayneCountyIncome(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[5].personal_income_thousands_dollars = 0;
  assert.equal(readPayneCountyIncome(zeroed), null);
  assert.equal(readPayneCountyIncome(null), null);
  assert.equal(yearPersonalIncome(null, 2024), null);
  assert.equal(yearPersonalIncome(readPayneCountyIncome(frozen), 2025), null);
});
