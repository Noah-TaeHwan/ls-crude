import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingSdwis, sdwisViolationsOn } from "../app/lib/cushing-sdwis.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091SDWISZ/cushing_sdwis_violations.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091SDWISZ/cushing_sdwis_violations.csv", base), "utf8");

const ROW_COUNT = 23;
const FIRST_DATE = "2017-01-01";
const LAST_BEGIN = "2024-10-17";
const ENFORCEMENT_SUM = 4;

test("cushing sdwis keeps dated drinking-water violation list, not cwa", () => {
  const series = readCushingSdwis(frozen);
  assert.equal(series.runId, "20260910T091SDWISZ");
  assert.equal(series.pwsId, "OK2006061");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].complianceBeginDate, FIRST_DATE);
  assert.equal(series.rows[ROW_COUNT - 1].complianceBeginDate, LAST_BEGIN);
  let enforcementSum = 0;
  let mr = 0;
  for (const row of series.rows) {
    assert.equal(row.pwsId, "OK2006061");
    assert.equal(row.systemName, "CUSHING");
    assert.match(row.complianceBeginDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.violationId.length > 0);
    assert.ok(row.federalRule.length > 0);
    assert.ok(row.contaminant.length > 0);
    assert.ok(!row.federalRule.includes("Clean Water Act"));
    assert.ok(Number.isInteger(row.enforcementCount) && row.enforcementCount >= 0);
    enforcementSum += row.enforcementCount;
    if (row.categoryCode === "MR") mr += 1;
    if (row.complianceEndDate !== null) assert.match(row.complianceEndDate, /^\d{4}-\d{2}-\d{2}$/);
    if (row.resolvedDate !== null) assert.match(row.resolvedDate, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(mr, 21);
  assert.equal(enforcementSum, ENFORCEMENT_SUM);
  assert.equal(sdwisViolationsOn(series, FIRST_DATE).length, 21);
  assert.equal(sdwisViolationsOn(series, LAST_BEGIN).length, 2);
  assert.deepEqual(sdwisViolationsOn(series, "2020-06-15"), []);
});

test("cushing sdwis csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "pws_id,system_name,violation_id,compliance_begin_date,compliance_end_date,noncompliance_begin_date,noncompliance_end_date,federal_rule,contaminant,category_code,category_desc,status,resolved_date,enforcement_count",
  );
  assert.equal(lines.length, ROW_COUNT + 1);
  // Contaminant names contain commas, so split rows quote-aware.
  const parseRow = (line) => {
    const cols = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            quoted = false;
          }
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ",") {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    return cols;
  };
  const series = readCushingSdwis(frozen);
  for (const line of lines.slice(1)) {
    const cols = parseRow(line);
    assert.equal(cols.length, 14);
    const beginDate = cols[3];
    const violationId = cols[2];
    assert.ok(sdwisViolationsOn(series, beginDate).find((r) => r.violationId === violationId));
  }
});

test("cushing sdwis fails closed on damage", () => {
  assert.ok(readCushingSdwis(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingSdwis(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[22].complianceBeginDate = "2024-10-16";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingSdwis(redated), null);
  const filledEnd = structuredClone(frozen);
  const nullEndIdx = filledEnd.rows.findIndex((r) => r.complianceEndDate === null);
  assert.ok(nullEndIdx >= 0);
  filledEnd.rows[nullEndIdx].complianceEndDate = "2025-07-15";
  // Filling an undisclosed end date breaks the freeze.
  assert.equal(readCushingSdwis(filledEnd), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingSdwis(relabeled), null);
  const cwaRow = structuredClone(frozen);
  cwaRow.rows.push({
    pwsId: "OK2006061",
    systemName: "CUSHING",
    violationId: "OK0026701",
    complianceBeginDate: "2026-01-06",
    complianceEndDate: null,
    noncomplianceBeginDate: null,
    noncomplianceEndDate: null,
    federalRule: "Clean Water Act",
    contaminant: "NPDES",
    categoryCode: "EVAL",
    categoryDesc: "Base Program - Evaluation",
    status: "No Violation Identified",
    resolvedDate: null,
    enforcementCount: 0,
  });
  // A copied CWA inspection row breaks the freeze.
  assert.equal(readCushingSdwis(cwaRow), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingSdwis(dropped), null);
  assert.equal(readCushingSdwis(null), null);
  assert.deepEqual(sdwisViolationsOn(null, FIRST_DATE), []);
  assert.deepEqual(sdwisViolationsOn(readCushingSdwis(frozen), "1999-01-01"), []);
});
