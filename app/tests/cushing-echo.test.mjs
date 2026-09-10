import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { echoInspectionsOn, readCushingEcho } from "../app/lib/cushing-echo.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091ECHOZ/cushing_echo_air_inspections.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091ECHOZ/cushing_echo_air_inspections.csv", base), "utf8");

const ROW_COUNT = 44;
const FIRST_DATE = "1998-11-19";
const LAST_DATED = "2026-05-05";
const DATED_FCE = 29;
const FCE_DISCLOSED = 19;
const FCE_SUM = 33;
const EVAL_DISCLOSED = 24;
const EVAL_SUM = 167;
const RECENT_VIOL_SUM = 0;

test("cushing echo keeps dated air inspection list, not busy", () => {
  const series = readCushingEcho(frozen);
  assert.equal(series.runId, "20260910T091ECHOZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].inspectionDate, FIRST_DATE);
  assert.equal(series.rows[DATED_FCE - 1].inspectionDate, LAST_DATED);
  assert.equal(series.rows[ROW_COUNT - 1].inspectionDate, null);
  let dated = 0;
  let fceDisclosed = 0;
  let fceSum = 0;
  let evalDisclosed = 0;
  let evalSum = 0;
  let violSum = 0;
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    assert.ok(row.facilityName.length > 0);
    assert.ok(row.sourceId.length > 0);
    if (row.inspectionDate !== null) {
      assert.match(row.inspectionDate, /^\d{4}-\d{2}-\d{2}$/);
      dated += 1;
    }
    if (row.fceCount !== null) {
      assert.ok(Number.isInteger(row.fceCount) && row.fceCount >= 0);
      fceDisclosed += 1;
      fceSum += row.fceCount;
    }
    if (row.evalCount !== null) {
      assert.ok(Number.isInteger(row.evalCount) && row.evalCount >= 0);
      evalDisclosed += 1;
      evalSum += row.evalCount;
    }
    violSum += row.recentViolations;
  }
  assert.equal(dated, DATED_FCE);
  assert.equal(fceDisclosed, FCE_DISCLOSED);
  assert.equal(fceSum, FCE_SUM);
  assert.equal(evalDisclosed, EVAL_DISCLOSED);
  assert.equal(evalSum, EVAL_SUM);
  assert.equal(violSum, RECENT_VIOL_SUM);
  assert.ok(echoInspectionsOn(series, FIRST_DATE).length >= 1);
  assert.deepEqual(echoInspectionsOn(series, "2020-06-15"), []);
});

test("cushing echo csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "facility_name,source_id,registry_id,city,county,status,classification,inspection_date,fce_count,last_eval_date,eval_count,last_viol_date,recent_violations,compliance_status",
  );
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingEcho(frozen);
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const inspectionDate = cols[7] === "" ? null : cols[7];
    const sourceId = cols[1];
    const rows = echoInspectionsOn(series, inspectionDate ?? "");
    if (inspectionDate === null) {
      assert.ok(series.rows.find((r) => r.sourceId === sourceId && r.inspectionDate === null));
    } else {
      assert.ok(rows.find((r) => r.sourceId === sourceId));
    }
  }
});

test("cushing echo fails closed on damage", () => {
  assert.ok(readCushingEcho(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingEcho(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[0].inspectionDate = "1998-11-18";
  // Redating the first row breaks the frozen value.
  assert.equal(readCushingEcho(redated), null);
  const filled = structuredClone(frozen);
  const nullIdx = filled.rows.findIndex((r) => r.fceCount === null);
  assert.ok(nullIdx >= 0);
  filled.rows[nullIdx].fceCount = 0;
  // Filling an undisclosed count with 0 breaks the freeze.
  assert.equal(readCushingEcho(filled), null);
  const filledDate = structuredClone(frozen);
  const nullDateIdx = filledDate.rows.findIndex((r) => r.inspectionDate === null);
  assert.ok(nullDateIdx >= 0);
  filledDate.rows[nullDateIdx].inspectionDate = "2020-06-15";
  // Filling an undisclosed date breaks the freeze.
  assert.equal(readCushingEcho(filledDate), null);
  const retyped = structuredClone(frozen);
  retyped.rows[10].classification = "Minor Emissions";
  assert.equal(readCushingEcho(retyped), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingEcho(relabeled), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingEcho(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    facilityName: "Invented Terminal",
    sourceId: "OK0000004011999999",
    registryId: "110000000000",
    city: "CUSHING",
    county: "Payne",
    status: "Operating",
    classification: "Minor Emissions",
    inspectionDate: "2020-06-15",
    fceCount: 1,
    lastEvalDate: "2020-06-15",
    evalCount: 1,
    lastViolDate: null,
    recentViolations: 0,
    complianceStatus: "No Violation Identified",
  });
  // An invented row breaks the freeze.
  assert.equal(readCushingEcho(invented), null);
  const badDate = structuredClone(frozen);
  badDate.rows[0].inspectionDate = "11/19/1998";
  assert.equal(readCushingEcho(badDate), null);
  assert.equal(readCushingEcho(null), null);
  assert.deepEqual(echoInspectionsOn(null, FIRST_DATE), []);
  assert.deepEqual(echoInspectionsOn(readCushingEcho(frozen), "1999-01-01"), []);
});
