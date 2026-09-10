import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { daySolar, readMesonetSolarDaily } from "../app/lib/cushing-mesonet-solar.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091ATOTZ/mesonet_oilt_solar_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091ATOTZ/mesonet_oilt_solar_daily.csv", base), "utf8");

const DAY_COUNT = 4269;
const ATOT_SUM = 6698585;
const NULL_SOLAR_DAYS = 115;

test("mesonet oilt daily solar keeps dated solar series with missing left missing", () => {
  const series = readMesonetSolarDaily(frozen);
  assert.equal(series.runId, "20260910T091ATOTZ");
  assert.equal(series.station, "OILT");
  assert.equal(series.label, "Mesonet OILT daily total solar radiation ATOT, dated, 24.3 km, not air temp, not rain, not busy");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let atotSum = 0;
  let nullSolar = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(Object.keys(row).sort(), ["atotMjM2", "date"]);
    if (row.atotMjM2 === null) {
      nullSolar += 1;
    } else {
      assert.ok(row.atotMjM2 >= 0 && row.atotMjM2 <= 50);
      atotSum += Math.round(row.atotMjM2 * 100);
    }
  }
  assert.equal(atotSum, ATOT_SUM);
  assert.equal(nullSolar, NULL_SOLAR_DAYS);
  // Spot checks: first/last day, whole-station outage day, partial-bad day kept missing.
  assert.deepEqual(daySolar(series, "2015-01-01"), { date: "2015-01-01", atotMjM2: 2.02 });
  assert.deepEqual(daySolar(series, "2026-09-08"), { date: "2026-09-08", atotMjM2: 20.21 });
  assert.deepEqual(daySolar(series, "2016-02-15"), { date: "2016-02-15", atotMjM2: null });
  assert.deepEqual(daySolar(series, "2015-01-24"), { date: "2015-01-24", atotMjM2: null });
});

test("mesonet oilt daily solar csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,atot_mj_m2");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readMesonetSolarDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, atot] = line.split(",");
    const row = daySolar(series, date);
    assert.ok(row);
    assert.equal(atot === "" ? null : Number(atot), row.atotMjM2);
  }
});

test("mesonet oilt daily solar fails closed on damage", () => {
  assert.ok(readMesonetSolarDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readMesonetSolarDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readMesonetSolarDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  const zi = frozen.rows.findIndex((r) => r.atotMjM2 === null);
  assert.ok(zi >= 0);
  filledZero.rows[zi].atotMjM2 = 0;
  assert.equal(readMesonetSolarDaily(filledZero), null);
  const sentinel = structuredClone(frozen);
  sentinel.rows[10].atotMjM2 = -999;
  assert.equal(readMesonetSolarDaily(sentinel), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", atotMjM2: 20.5 });
  assert.equal(readMesonetSolarDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].atotMjM2 = 15.05;
  assert.equal(readMesonetSolarDaily(edited), null);
  const tmaxCopy = structuredClone(frozen);
  tmaxCopy.rows[5].tmaxF = 90;
  assert.equal(readMesonetSolarDaily(tmaxCopy), null);
  const rainCopy = structuredClone(frozen);
  rainCopy.rows[5].rainIn = 0.5;
  assert.equal(readMesonetSolarDaily(rainCopy), null);
  const savgCopy = structuredClone(frozen);
  savgCopy.rows[5].savgF = 70;
  assert.equal(readMesonetSolarDaily(savgCopy), null);
  const havgCopy = structuredClone(frozen);
  havgCopy.rows[5].havgPct = 60;
  assert.equal(readMesonetSolarDaily(havgCopy), null);
  const wspdCopy = structuredClone(frozen);
  wspdCopy.rows[5].wspdMph = 5.5;
  assert.equal(readMesonetSolarDaily(wspdCopy), null);
  const pavgCopy = structuredClone(frozen);
  pavgCopy.rows[5].pavgIn = 29.5;
  assert.equal(readMesonetSolarDaily(pavgCopy), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "Mesonet OILT daily busy score";
  assert.equal(readMesonetSolarDaily(relabeled), null);
  const cityRelabeled = structuredClone(frozen);
  cityRelabeled.stationName = "Cushing, OK (city station)";
  assert.equal(readMesonetSolarDaily(cityRelabeled), null);
  const kcuhed = structuredClone(frozen);
  kcuhed.station = "CUH";
  assert.equal(readMesonetSolarDaily(kcuhed), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readMesonetSolarDaily(resourced), null);
  assert.equal(readMesonetSolarDaily(null), null);
  assert.equal(daySolar(null, "2026-09-08"), null);
  assert.equal(daySolar(readMesonetSolarDaily(frozen), "2026-09-09"), null);
});
