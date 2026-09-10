import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { quarterEmployment, readPayneQcewQuarterly } from "../app/lib/cushing-qcew-quarterly.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260909T091QCEWQZ/payne_qcew_quarterly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260909T091QCEWQZ/payne_qcew_quarterly.csv", base), "utf8");

const TOTAL_SUM = 1518531;
const MINING_SUM = 24630;

test("payne qcew quarterly keeps dated county series with no filled zeros", () => {
  const series = readPayneQcewQuarterly(frozen);
  assert.equal(series.areaFips, "40119");
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.rows.length, 45);
  assert.deepEqual(
    [series.rows[0].year, series.rows[0].qtr],
    [2015, 1],
  );
  assert.deepEqual(
    [series.rows[44].year, series.rows[44].qtr, series.rows[44].month],
    [2026, 1, 3],
  );
  for (const row of series.rows) {
    assert.equal(row.month, row.qtr * 3);
    for (const cell of [row.totalCovered, row.privateMining21]) {
      assert.ok(cell === null || (Number.isSafeInteger(cell) && cell > 0));
    }
  }
  assert.equal(
    series.rows.filter((row) => row.totalCovered !== null).reduce((n, row) => n + row.totalCovered, 0),
    TOTAL_SUM,
  );
  assert.equal(
    series.rows.filter((row) => row.privateMining21 !== null).reduce((n, row) => n + row.privateMining21, 0),
    MINING_SUM,
  );
  // 2025-Q1 agrees with the frozen one-quarter slice, not Cushing city.
  assert.deepEqual(quarterEmployment(series, 2025, 1), {
    year: 2025,
    qtr: 1,
    month: 3,
    totalCovered: 35418,
    privateMining21: 402,
  });
});

test("payne qcew quarterly csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,qtr,month,total_covered,private_mining_21");
  assert.equal(lines.length, 46);
  let totalSum = 0;
  let miningSum = 0;
  for (const line of lines.slice(1)) {
    const [year, qtr, month, total, mining] = line.split(",");
    const row = quarterEmployment(readPayneQcewQuarterly(frozen), Number(year), Number(qtr));
    assert.ok(row);
    assert.equal(row.month, Number(month));
    assert.equal(total === "" ? null : Number(total), row.totalCovered);
    assert.equal(mining === "" ? null : Number(mining), row.privateMining21);
    if (total !== "") totalSum += Number(total);
    if (mining !== "") miningSum += Number(mining);
  }
  assert.equal(totalSum, TOTAL_SUM);
  assert.equal(miningSum, MINING_SUM);
});

test("payne qcew quarterly fails closed on damage", () => {
  assert.ok(readPayneQcewQuarterly(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneQcewQuarterly(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[10].year = 2016;
  assert.equal(readPayneQcewQuarterly(yearSwapped), null);
  const filled = structuredClone(frozen);
  filled.rows[20].totalCovered = 0;
  assert.equal(readPayneQcewQuarterly(filled), null);
  const copied = structuredClone(frozen);
  copied.rows[30] = structuredClone(copied.rows[29]);
  copied.rows[30].year = 2022;
  copied.rows[30].qtr = 3;
  copied.rows[30].month = 9;
  assert.equal(readPayneQcewQuarterly(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneQcewQuarterly(relabeled), null);
  const redated = structuredClone(frozen);
  redated.rows[44].year = 2025;
  assert.equal(readPayneQcewQuarterly(redated), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneQcewQuarterly(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2026, qtr: 2, month: 6, totalCovered: 35000, privateMining21: 340 });
  assert.equal(readPayneQcewQuarterly(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[40].privateMining21 = 403;
  assert.equal(readPayneQcewQuarterly(edited), null);
  assert.equal(readPayneQcewQuarterly(null), null);
  assert.equal(quarterEmployment(null, 2025, 1), null);
  assert.equal(quarterEmployment(readPayneQcewQuarterly(frozen), 2026, 2), null);
});
