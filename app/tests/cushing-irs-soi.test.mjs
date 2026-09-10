import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingIrsSoi, yearIrsSoi } from "../app/lib/cushing-irs-soi.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091SOIZ/zip_74023_income_tax_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091SOIZ/zip_74023_income_tax_annual.csv", base), "utf8");

const RETURNS_SUM = 29330;
const AGI_SUM = 1634370;

test("cushing irs soi keeps annual zip 74023 series with dated rows", () => {
  const series = readCushingIrsSoi(frozen);
  assert.equal(series.geography, "ZIP 74023, Oklahoma (Cushing)");
  assert.equal(series.zipCode, "74023");
  assert.equal(series.frequency, "annual");
  assert.equal(
    series.unit,
    "Returns are counts as filed; AGI amounts are thousands of dollars as filed",
  );
  assert.equal(series.rows.length, 7);
  assert.equal(series.rows[0].year, 2016);
  assert.equal(series.rows[6].year, 2022);
  for (let i = 0; i < series.rows.length; i++) {
    assert.equal(series.rows[i].year, 2016 + i);
    assert.ok(
      Number.isSafeInteger(series.rows[i].returns_n1) && series.rows[i].returns_n1 > 0,
    );
    assert.ok(
      Number.isSafeInteger(series.rows[i].agi_thousands_dollars) &&
        series.rows[i].agi_thousands_dollars > 0,
    );
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.returns_n1, 0),
    RETURNS_SUM,
  );
  assert.equal(
    series.rows.reduce((n, row) => n + row.agi_thousands_dollars, 0),
    AGI_SUM,
  );
  // Last year agrees with the frozen IRS SOI ZIP total, not BEA county income.
  assert.deepEqual(yearIrsSoi(series, 2022), {
    year: 2022,
    returns_n1: 4190,
    agi_thousands_dollars: 250763,
  });
});

test("cushing irs soi csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,zip_74023_returns_n1,zip_74023_agi_thousands_dollars");
  assert.equal(lines.length, 8);
  let returnsSum = 0;
  let agiSum = 0;
  for (const line of lines.slice(1)) {
    const [year, returnsN1, agi] = line.split(",");
    const row = yearIrsSoi(readCushingIrsSoi(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(returnsN1), row.returns_n1);
    assert.equal(Number(agi), row.agi_thousands_dollars);
    returnsSum += Number(returnsN1);
    agiSum += Number(agi);
  }
  assert.equal(returnsSum, RETURNS_SUM);
  assert.equal(agiSum, AGI_SUM);
});

test("cushing irs soi fails closed on damage", () => {
  assert.ok(readCushingIrsSoi(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2023, returns_n1: 0, agi_thousands_dollars: 0 });
  assert.equal(readCushingIrsSoi(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingIrsSoi(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2017;
  assert.equal(readCushingIrsSoi(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[6] = structuredClone(copied.rows[5]);
  copied.rows[6].year = 2022;
  assert.equal(readCushingIrsSoi(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing city, Oklahoma";
  assert.equal(readCushingIrsSoi(relabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readCushingIrsSoi(busyRelabeled), null);
  const zipSwapped = structuredClone(frozen);
  zipSwapped.zipCode = "74023 ";
  assert.equal(readCushingIrsSoi(zipSwapped), null);
  const countySwapped = structuredClone(frozen);
  countySwapped.geography = "Payne County, Oklahoma";
  countySwapped.zipCode = "40119";
  assert.equal(readCushingIrsSoi(countySwapped), null);
  const unitSwapped = structuredClone(frozen);
  unitSwapped.unit = "Dollars";
  assert.equal(readCushingIrsSoi(unitSwapped), null);
  const edited = structuredClone(frozen);
  edited.rows[0].returns_n1 = 4201;
  assert.equal(readCushingIrsSoi(edited), null);
  const agiEdited = structuredClone(frozen);
  agiEdited.rows[6].agi_thousands_dollars = 250764;
  assert.equal(readCushingIrsSoi(agiEdited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingIrsSoi(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2023, returns_n1: 4200, agi_thousands_dollars: 251000 });
  assert.equal(readCushingIrsSoi(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[3].agi_thousands_dollars = 0;
  assert.equal(readCushingIrsSoi(zeroed), null);
  assert.equal(readCushingIrsSoi(null), null);
  assert.equal(yearIrsSoi(null, 2022), null);
  assert.equal(yearIrsSoi(readCushingIrsSoi(frozen), 2023), null);
});
