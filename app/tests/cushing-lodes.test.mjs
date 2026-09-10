import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readPayneLodesAnnual, yearWorkplaceJobs } from "../app/lib/cushing-lodes.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091LODEZ/payne_lodes_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091LODEZ/payne_lodes_annual.csv", base), "utf8");

const JOBS_SUM = 713340;

test("payne lodes annual keeps dated county series with no filled zeros", () => {
  const series = readPayneLodesAnnual(frozen);
  assert.equal(series.areaFips, "40119");
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.segment, "S000");
  assert.equal(series.jobType, "JT00");
  assert.equal(series.column, "C000");
  assert.equal(series.rows.length, 22);
  assert.equal(series.rows[0].year, 2002);
  assert.equal(series.rows[21].year, 2023);
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.blocks) && row.blocks > 0);
    assert.ok(Number.isSafeInteger(row.jobs) && row.jobs > 0);
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.jobs, 0),
    JOBS_SUM,
  );
  // 2023 agrees with the frozen WAC S000/JT00/C000 cell, not Cushing city, not QCEW.
  assert.deepEqual(yearWorkplaceJobs(series, 2023), { year: 2023, blocks: 701, jobs: 35589 });
  assert.deepEqual(yearWorkplaceJobs(series, 2022), { year: 2022, blocks: 675, jobs: 33401 });
});

test("payne lodes annual csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,payne_workplace_blocks,payne_workplace_jobs");
  assert.equal(lines.length, 23);
  let jobsSum = 0;
  for (const line of lines.slice(1)) {
    const [year, blocks, jobs] = line.split(",");
    const row = yearWorkplaceJobs(readPayneLodesAnnual(frozen), Number(year));
    assert.ok(row);
    assert.equal(row.blocks, Number(blocks));
    assert.equal(row.jobs, Number(jobs));
    jobsSum += Number(jobs);
  }
  assert.equal(jobsSum, JOBS_SUM);
});

test("payne lodes annual fails closed on damage", () => {
  assert.ok(readPayneLodesAnnual(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneLodesAnnual(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[10].year = 2010;
  assert.equal(readPayneLodesAnnual(yearSwapped), null);
  const filled = structuredClone(frozen);
  filled.rows[10].jobs = 0;
  assert.equal(readPayneLodesAnnual(filled), null);
  const copied = structuredClone(frozen);
  copied.rows[21] = structuredClone(copied.rows[20]);
  copied.rows[21].year = 2023;
  assert.equal(readPayneLodesAnnual(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneLodesAnnual(relabeled), null);
  const qcewCopy = structuredClone(frozen);
  qcewCopy.rows[21].jobs = 35001;
  assert.equal(readPayneLodesAnnual(qcewCopy), null);
  const redated = structuredClone(frozen);
  redated.rows[21].year = 2024;
  assert.equal(readPayneLodesAnnual(redated), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneLodesAnnual(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2024, blocks: 700, jobs: 35600 });
  assert.equal(readPayneLodesAnnual(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[0].jobs = 31098;
  assert.equal(readPayneLodesAnnual(edited), null);
  assert.equal(readPayneLodesAnnual(null), null);
  assert.equal(yearWorkplaceJobs(null, 2023), null);
  assert.equal(yearWorkplaceJobs(readPayneLodesAnnual(frozen), 2024), null);
});
