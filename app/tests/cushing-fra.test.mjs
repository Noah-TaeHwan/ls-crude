import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fraIncidentsOn, readCushingFra } from "../app/lib/cushing-fra.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091FRAZ/cushing_fra_incidents.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091FRAZ/cushing_fra_incidents.csv", base), "utf8");

const ROW_COUNT = 3;
const FIRST_DATE = "1976-10-15";
const LAST_DATE = "1982-05-11";

test("cushing fra keeps dated crossing incident list, not throughput", () => {
  const series = readCushingFra(frozen);
  assert.equal(series.runId, "20260910T091FRAZ");
  assert.equal(series.form, "57");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].incidentDate, FIRST_DATE);
  assert.equal(series.rows[0].reportKey, "ATSF24106210197610");
  assert.equal(series.rows[2].incidentDate, LAST_DATE);
  assert.equal(series.rows[2].reportKey, "ATSF140582203198205");
  let killed = 0;
  let injured = 0;
  for (const row of series.rows) {
    assert.match(row.incidentDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(row.form, "57");
    assert.equal(row.filedCity, "CUSHING");
    assert.ok(row.reportKey.length > 0);
    assert.ok(row.highwayUser.length > 0);
    killed += row.killed;
    injured += row.injured;
  }
  assert.equal(killed, 0);
  assert.equal(injured, 1);
  assert.deepEqual(
    fraIncidentsOn(series, "1980-02-25").map((r) => r.reportKey),
    ["ATSF140280206198002"],
  );
  assert.deepEqual(fraIncidentsOn(series, "1975-01-09"), []);
});

test("cushing fra csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "incident_date,form,report_key,railroad,county,filed_city,highway_user,train_speed_mph,killed,injured");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingFra(frozen);
  for (const line of lines.slice(1)) {
    const [incidentDate, form, reportKey] = line.split(",");
    const rows = fraIncidentsOn(series, incidentDate);
    const row = rows.find((r) => r.reportKey === reportKey);
    assert.ok(row);
    assert.equal(form, "57");
  }
});

test("cushing fra fails closed on damage", () => {
  assert.ok(readCushingFra(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingFra(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[2].incidentDate = "1982-05-10";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingFra(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[1].injured = 0;
  assert.equal(readCushingFra(filled), null);
  const edited = structuredClone(frozen);
  edited.rows[0].highwayUser = "Auto";
  assert.equal(readCushingFra(edited), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingFra(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.form = "57-OK";
  assert.equal(readCushingFra(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingFra(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    incidentDate: "1975-01-09",
    form: "57",
    reportKey: "ATSF7015305197501",
    railroad: "ATSF",
    county: "OSAGE",
    filedCity: "QUAY",
    highwayUser: "Auto",
    trainSpeedMph: 25,
    killed: 0,
    injured: 0,
  });
  assert.equal(readCushingFra(invented), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[0].incidentDate = "10/15/1976";
  assert.equal(readCushingFra(reportDated), null);
  assert.equal(readCushingFra(null), null);
  assert.deepEqual(fraIncidentsOn(null, "1980-02-25"), []);
  assert.deepEqual(fraIncidentsOn(readCushingFra(frozen), "1999-01-01"), []);
});
