import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { echoCwaInspectionsOn, readCushingEchoCwa } from "../app/lib/cushing-echo-cwa.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091CWAZ/cushing_echo_cwa_inspections.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091CWAZ/cushing_echo_cwa_inspections.csv", base), "utf8");

const ROW_COUNT = 18;
const FIRST_DATE = "2025-04-10";
const LAST_DATED = "2026-01-06";
const DATED = 4;
const COUNT_SUM = 19;
const FORMAL_SUM = 5;

test("cushing echo cwa keeps dated water inspection list, not air fce", () => {
  const series = readCushingEchoCwa(frozen);
  assert.equal(series.runId, "20260910T091CWAZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].lastInspectionDate, FIRST_DATE);
  assert.equal(series.rows[DATED - 1].lastInspectionDate, LAST_DATED);
  assert.equal(series.rows[ROW_COUNT - 1].lastInspectionDate, null);
  let dated = 0;
  let countSum = 0;
  let formalSum = 0;
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    assert.ok(row.facilityName.length > 0);
    assert.ok(row.sourceId.length > 0);
    assert.ok(!row.sourceId.startsWith("OK0000004"));
    if (row.lastInspectionDate !== null) {
      assert.match(row.lastInspectionDate, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(row.lastInspectionType, "Base Program - Evaluation");
      dated += 1;
    } else {
      assert.equal(row.lastInspectionType, null);
    }
    assert.ok(Number.isInteger(row.inspectionCount) && row.inspectionCount >= 0);
    countSum += row.inspectionCount;
    if (row.formalActions !== null) {
      assert.ok(Number.isInteger(row.formalActions) && row.formalActions >= 0);
      formalSum += row.formalActions;
    }
  }
  assert.equal(dated, DATED);
  assert.equal(countSum, COUNT_SUM);
  assert.equal(formalSum, FORMAL_SUM);
  assert.equal(echoCwaInspectionsOn(series, FIRST_DATE).length, 2);
  assert.deepEqual(echoCwaInspectionsOn(series, "2020-06-15"), []);
});

test("cushing echo cwa csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "facility_name,source_id,registry_id,city,county,permit_status,last_inspection_date,last_inspection_type,inspection_count,cwa_status,formal_actions,total_penalties",
  );
  assert.equal(lines.length, ROW_COUNT + 1);
  // Facility names contain commas, so split rows quote-aware.
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
  const series = readCushingEchoCwa(frozen);
  for (const line of lines.slice(1)) {
    const cols = parseRow(line);
    assert.equal(cols.length, 12);
    const inspectionDate = cols[6] === "" ? null : cols[6];
    const sourceId = cols[1];
    const rows = echoCwaInspectionsOn(series, inspectionDate ?? "");
    if (inspectionDate === null) {
      assert.ok(series.rows.find((r) => r.sourceId === sourceId && r.lastInspectionDate === null));
    } else {
      assert.ok(rows.find((r) => r.sourceId === sourceId));
    }
  }
});

test("cushing echo cwa fails closed on damage", () => {
  assert.ok(readCushingEchoCwa(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingEchoCwa(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[3].lastInspectionDate = "2026-01-05";
  // Redating the last dated row breaks the frozen value.
  assert.equal(readCushingEchoCwa(redated), null);
  const filledDate = structuredClone(frozen);
  const nullDateIdx = filledDate.rows.findIndex((r) => r.lastInspectionDate === null);
  assert.ok(nullDateIdx >= 0);
  filledDate.rows[nullDateIdx].lastInspectionDate = "2020-06-15";
  // Filling an undisclosed date breaks the freeze.
  assert.equal(readCushingEchoCwa(filledDate), null);
  const filledFormal = structuredClone(frozen);
  const nullFormalIdx = filledFormal.rows.findIndex((r) => r.formalActions === null);
  assert.ok(nullFormalIdx >= 0);
  filledFormal.rows[nullFormalIdx].formalActions = 0;
  // Filling an undisclosed formal-action count with 0 breaks the freeze.
  assert.equal(readCushingEchoCwa(filledFormal), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingEchoCwa(relabeled), null);
  const airRow = structuredClone(frozen);
  airRow.rows.push({
    facilityName: "Copied air row",
    sourceId: "OK0000004011900042",
    registryId: "110007388638",
    city: "CUSHING",
    county: "Payne",
    permitStatus: "Operating",
    lastInspectionDate: "1998-11-19",
    lastInspectionType: "Base Program - Evaluation",
    inspectionCount: 1,
    complianceStatus: "No Violation Identified",
    formalActions: null,
    totalPenalties: null,
  });
  // A copied CAA air row breaks the freeze.
  assert.equal(readCushingEchoCwa(airRow), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingEchoCwa(dropped), null);
  assert.equal(readCushingEchoCwa(null), null);
  assert.deepEqual(echoCwaInspectionsOn(null, FIRST_DATE), []);
  assert.deepEqual(echoCwaInspectionsOn(readCushingEchoCwa(frozen), "1999-01-01"), []);
});
