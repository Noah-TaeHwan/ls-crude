import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { oshaInspectionsOn, readCushingOsha } from "../app/lib/cushing-osha.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091OSHAZ/cushing_osha_inspections.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091OSHAZ/cushing_osha_inspections.csv", base), "utf8");

const ROW_COUNT = 162;
const FIRST_DATE = "1973-04-25";
const LAST_DATE = "2026-08-14";
const DISCLOSED = 86;
const VIOLATIONS_SUM = 354;

test("cushing osha keeps dated inspection list, not busy", () => {
  const series = readCushingOsha(frozen);
  assert.equal(series.runId, "20260910T091OSHAZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].inspectionDate, FIRST_DATE);
  assert.equal(series.rows[ROW_COUNT - 1].inspectionDate, LAST_DATE);
  let disclosed = 0;
  let sum = 0;
  for (const row of series.rows) {
    assert.match(row.inspectionDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.activityId.length > 0);
    assert.ok(row.inspectionType.length > 0);
    assert.ok(row.establishmentName.length > 0);
    if (row.violations === null) continue;
    assert.ok(Number.isInteger(row.violations) && row.violations >= 0);
    disclosed += 1;
    sum += row.violations;
  }
  assert.equal(disclosed, DISCLOSED);
  assert.equal(sum, VIOLATIONS_SUM);
  assert.ok(oshaInspectionsOn(series, "2024-07-02").length >= 1);
  assert.deepEqual(oshaInspectionsOn(series, "2020-06-15"), []);
});

test("cushing osha csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "inspection_date,activity_id,report_id,inspection_type,scope,sic,naics,violations,establishment_name");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingOsha(frozen);
  for (const line of lines.slice(1)) {
    const [inspectionDate, activityId] = line.split(",");
    const rows = oshaInspectionsOn(series, inspectionDate);
    assert.ok(rows.find((r) => r.activityId === activityId));
  }
});

test("cushing osha fails closed on damage", () => {
  assert.ok(readCushingOsha(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingOsha(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[ROW_COUNT - 1].inspectionDate = "2026-08-13";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingOsha(redated), null);
  const filled = structuredClone(frozen);
  const nullIdx = filled.rows.findIndex((r) => r.violations === null);
  assert.ok(nullIdx >= 0);
  filled.rows[nullIdx].violations = 0;
  // Filling an undisclosed count with 0 breaks the freeze.
  assert.equal(readCushingOsha(filled), null);
  const retyped = structuredClone(frozen);
  retyped.rows[10].inspectionType = "Planned";
  assert.equal(readCushingOsha(retyped), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingOsha(relabeled), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingOsha(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    inspectionDate: "2020-06-15",
    activityId: "9999999.015",
    reportId: "0627700",
    inspectionType: "Planned",
    scope: "Partial",
    sic: "",
    naics: "",
    violations: null,
    establishmentName: "Invented Plant",
  });
  // A filled missing year breaks the freeze.
  assert.equal(readCushingOsha(invented), null);
  const badDate = structuredClone(frozen);
  badDate.rows[0].inspectionDate = "04/25/1973";
  assert.equal(readCushingOsha(badDate), null);
  assert.equal(readCushingOsha(null), null);
  assert.deepEqual(oshaInspectionsOn(null, "2024-07-02"), []);
  assert.deepEqual(oshaInspectionsOn(readCushingOsha(frozen), "1999-01-01"), []);
});
