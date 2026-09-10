import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingEnrollment, schoolYearEnrollment } from "../app/lib/cushing-enrollment.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091PENRZ/cushing_hs_enrollment.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091PENRZ/cushing_hs_enrollment.csv", base), "utf8");

const TOTAL_SUM = 2532;

test("cushing hs enrollment keeps annual school series with 2023-24 missing", () => {
  const series = readCushingEnrollment(frozen);
  assert.equal(series.geography, "Cushing High School");
  assert.equal(series.frequency, "annual school year");
  assert.equal(series.rows.length, 5);
  assert.deepEqual(
    series.rows.map((row) => row.schoolYear),
    ["2019-20", "2020-21", "2021-22", "2022-23", "2024-25"],
  );
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.enrollment) && row.enrollment > 0);
  }
  assert.equal(
    series.rows.reduce((n, row) => n + row.enrollment, 0),
    TOTAL_SUM,
  );
  // The 2023-24 gap stays missing, never 0.
  assert.equal(schoolYearEnrollment(series, "2023-24"), null);
  assert.deepEqual(schoolYearEnrollment(series, "2022-23"), {
    schoolYear: "2022-23",
    enrollment: 530,
  });
});

test("cushing hs enrollment csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "school_year,cushing_high_school_enrollment");
  assert.equal(lines.length, 6);
  let totalSum = 0;
  for (const line of lines.slice(1)) {
    const [schoolYear, enrollment] = line.split(",");
    const row = schoolYearEnrollment(readCushingEnrollment(frozen), schoolYear);
    assert.ok(row);
    assert.equal(Number(enrollment), row.enrollment);
    totalSum += Number(enrollment);
  }
  assert.equal(totalSum, TOTAL_SUM);
});

test("cushing hs enrollment fails closed on damage", () => {
  assert.ok(readCushingEnrollment(frozen));
  const filled = structuredClone(frozen);
  filled.rows.splice(4, 0, { schoolYear: "2023-24", enrollment: 0 });
  assert.equal(readCushingEnrollment(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingEnrollment(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].schoolYear = "2020-21";
  assert.equal(readCushingEnrollment(yearSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[4] = structuredClone(copied.rows[3]);
  copied.rows[4].schoolYear = "2024-25";
  assert.equal(readCushingEnrollment(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readCushingEnrollment(relabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[0].enrollment = 506;
  assert.equal(readCushingEnrollment(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingEnrollment(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ schoolYear: "2025-26", enrollment: 531 });
  assert.equal(readCushingEnrollment(invented), null);
  assert.equal(readCushingEnrollment(null), null);
  assert.equal(schoolYearEnrollment(null, "2022-23"), null);
  assert.equal(schoolYearEnrollment(readCushingEnrollment(frozen), "2025-26"), null);
});
