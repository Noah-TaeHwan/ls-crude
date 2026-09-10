import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { echoDmrFlowOn, readCushingEchoDmr } from "../app/lib/cushing-echo-dmr.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091DMRZ/cushing_echo_dmr_flow.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091DMRZ/cushing_echo_dmr_flow.csv", base), "utf8");

const ROW_COUNT = 1722;
const NUMERIC_COUNT = 880;
const FIRST_DATE = "2015-01-31";
const LAST_DATE = "2026-07-31";
const SUM_THOUSANDTHS = 7487398621;
const PER_PERMIT = {
  OK0026701: 278,
  OK0043320: 834,
  OK0044598: 278,
  OK0100374: 40,
  OKG270057: 14,
  OKG950028: 278,
};

test("cushing echo dmr keeps dated effluent flow quantities, not inspection counts", () => {
  const series = readCushingEchoDmr(frozen);
  assert.equal(series.runId, "20260910T091DMRZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].monitoringPeriodEnd, FIRST_DATE);
  assert.equal(series.rows[ROW_COUNT - 1].monitoringPeriodEnd, LAST_DATE);
  let numeric = 0;
  let sum = 0;
  const perPermit = {};
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    assert.equal(row.parameterCode, "50050");
    assert.ok(row.permitId in PER_PERMIT);
    assert.match(row.monitoringPeriodEnd, /^\d{4}-\d{2}-\d{2}$/);
    perPermit[row.permitId] = (perPermit[row.permitId] ?? 0) + 1;
    if (row.value === null) {
      assert.ok(row.nodiCode !== null && row.nodiCode.length > 0);
    } else {
      assert.ok(Number.isFinite(Number(row.value)) && Number(row.value) >= 0);
      assert.equal(row.nodiCode, null);
      numeric += 1;
      sum += Number(row.value);
    }
  }
  assert.equal(numeric, NUMERIC_COUNT);
  assert.deepEqual(perPermit, PER_PERMIT);
  assert.equal(Math.floor(sum * 1000 + 0.5), SUM_THOUSANDTHS);
  assert.ok(echoDmrFlowOn(series, LAST_DATE).length >= 2);
  assert.deepEqual(echoDmrFlowOn(series, "2020-06-15"), []);
});

test("cushing echo dmr csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "permit_id,facility_name,city,outfall,parameter_code,monitoring_location,value_type,statistical_base,monitoring_period_end,value,unit,qualifier,nodi_code,nodi_desc,received_date",
  );
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingEchoDmr(frozen);
  const byKey = new Map(series.rows.map((r) => [`${r.monitoringPeriodEnd}|${r.permitId}|${r.outfall}|${r.valueType}`, r]));
  assert.equal(byKey.size, ROW_COUNT);
});

test("cushing echo dmr fails closed on damage", () => {
  assert.ok(readCushingEchoDmr(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingEchoDmr(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[0].monitoringPeriodEnd = "2015-01-30";
  // Redating the first dated row breaks the frozen value.
  assert.equal(readCushingEchoDmr(redated), null);
  const filledZero = structuredClone(frozen);
  const nullIdx = filledZero.rows.findIndex((r) => r.value === null);
  assert.ok(nullIdx >= 0);
  filledZero.rows[nullIdx].value = "0";
  filledZero.rows[nullIdx].nodiCode = null;
  // Filling a disclosed NODI gap with 0 breaks the freeze.
  assert.equal(readCushingEchoDmr(filledZero), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingEchoDmr(relabeled), null);
  const wrongCity = structuredClone(frozen);
  wrongCity.rows[0].city = "CRUSHING";
  // A relabeled non-Cushing row breaks the freeze.
  assert.equal(readCushingEchoDmr(wrongCity), null);
  const inspectionRow = structuredClone(frozen);
  inspectionRow.rows.push({
    permitId: "OK0026701",
    facilityName: "Copied inspection row",
    city: "CUSHING",
    outfall: "001",
    parameterCode: "50050",
    monitoringLocation: "Effluent Gross",
    valueType: "Q1",
    statisticalBase: "MO AVG",
    monitoringPeriodEnd: "2026-01-06",
    value: "19",
    unit: null,
    qualifier: null,
    nodiCode: null,
    nodiDesc: null,
    receivedDate: null,
  });
  // A copied last-inspection count row breaks the freeze.
  assert.equal(readCushingEchoDmr(inspectionRow), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingEchoDmr(dropped), null);
  assert.equal(readCushingEchoDmr(null), null);
  assert.deepEqual(echoDmrFlowOn(null, FIRST_DATE), []);
  assert.deepEqual(echoDmrFlowOn(readCushingEchoDmr(frozen), "1999-01-01"), []);
});
