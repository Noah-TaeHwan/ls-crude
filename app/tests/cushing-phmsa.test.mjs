import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { phmsaIncidentsOn, readCushingPhmsa } from "../app/lib/cushing-phmsa.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091PHMSAZ/cushing_phmsa_incidents.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091PHMSAZ/cushing_phmsa_incidents.csv", base), "utf8");

const ROW_COUNT = 141;
const FIRST_DATE = "2010-01-11";
const LAST_DATE = "2025-12-08";
const CAUSE_COUNTS = {
  "EQUIPMENT FAILURE": 62,
  "CORROSION FAILURE": 47,
  "INCORRECT OPERATION": 20,
  "NATURAL FORCE DAMAGE": 4,
  "MATERIAL FAILURE OF PIPE OR WELD": 3,
  "EXCAVATION DAMAGE": 2,
  "OTHER ACCIDENT CAUSE": 2,
  "OTHER OUTSIDE FORCE DAMAGE": 1,
};

test("cushing phmsa keeps dated hl incident list, not throughput", () => {
  const series = readCushingPhmsa(frozen);
  assert.equal(series.runId, "20260910T091PHMSAZ");
  assert.equal(series.system, "HL");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].incidentDate, FIRST_DATE);
  assert.equal(series.rows[0].reportNumber, "20100026");
  assert.equal(series.rows[140].incidentDate, LAST_DATE);
  assert.equal(series.rows[140].reportNumber, "20260005");
  const causes = {};
  for (const row of series.rows) {
    assert.match(row.incidentDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(row.system, "HL");
    assert.ok(row.reportNumber.length > 0);
    assert.ok(row.cause.length > 0);
    // 2012-11-02 rpt 20120341 files an empty NARRATIVE; cause carries the row.
    assert.ok(row.cause.length > 0 || row.narrative.length > 0);
    assert.equal(row.fatalities, 0);
    assert.equal(row.injuries, 0);
    causes[row.cause] = (causes[row.cause] ?? 0) + 1;
  }
  assert.deepEqual(causes, CAUSE_COUNTS);
  // 2017-10-22 is the only date with two incidents; lookup returns both.
  assert.deepEqual(
    phmsaIncidentsOn(series, "2017-10-22").map((r) => r.reportNumber),
    ["20170366", "20170377"],
  );
  assert.deepEqual(phmsaIncidentsOn(series, "2009-12-31"), []);
});

test("cushing phmsa csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "incident_date,system,report_number,cause,narrative,fatalities,injuries");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingPhmsa(frozen);
  for (const line of lines.slice(1)) {
    const [incidentDate, system, reportNumber] = line.split(",");
    const rows = phmsaIncidentsOn(series, incidentDate);
    const row = rows.find((r) => r.reportNumber === reportNumber);
    assert.ok(row);
    assert.equal(system, "HL");
  }
});

test("cushing phmsa fails closed on damage", () => {
  assert.ok(readCushingPhmsa(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingPhmsa(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[140].incidentDate = "2025-12-07";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingPhmsa(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[20].fatalities = 1;
  assert.equal(readCushingPhmsa(filled), null);
  const edited = structuredClone(frozen);
  edited.rows[40].cause = "CORROSION FAILURE";
  assert.equal(readCushingPhmsa(edited), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingPhmsa(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.system = "HL-OK";
  assert.equal(readCushingPhmsa(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingPhmsa(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    incidentDate: "2026-01-05",
    system: "HL",
    reportNumber: "20260099",
    cause: "EQUIPMENT FAILURE",
    narrative: "INVENTED",
    fatalities: 0,
    injuries: 0,
  });
  assert.equal(readCushingPhmsa(invented), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[10].incidentDate = "9/26/2024";
  assert.equal(readCushingPhmsa(reportDated), null);
  assert.equal(readCushingPhmsa(null), null);
  assert.deepEqual(phmsaIncidentsOn(null, "2017-10-22"), []);
  assert.deepEqual(phmsaIncidentsOn(readCushingPhmsa(frozen), "1999-01-01"), []);
});
