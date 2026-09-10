import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayWind, readMesonetWindDaily } from "../app/lib/cushing-mesonet-wind.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091WSPDZ/mesonet_oilt_wind_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091WSPDZ/mesonet_oilt_wind_daily.csv", base), "utf8");

const DAY_COUNT = 4269;
const WSPD_SUM = 2573065;
const NULL_WIND_DAYS = 272;

test("mesonet oilt daily wind keeps dated wind series with missing left missing", () => {
  const series = readMesonetWindDaily(frozen);
  assert.equal(series.runId, "20260910T091WSPDZ");
  assert.equal(series.station, "OILT");
  assert.equal(series.label, "Mesonet OILT daily mean wind speed WSPD, dated, 24.3 km, not air temp, not rain, not soil, not humidity, not busy");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let wspdSum = 0;
  let nullWind = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(Object.keys(row).sort(), ["date", "wspdMph"]);
    if (row.wspdMph === null) {
      nullWind += 1;
    } else {
      assert.ok(row.wspdMph >= 0 && row.wspdMph <= 100);
      wspdSum += Math.round(row.wspdMph * 100);
    }
  }
  assert.equal(wspdSum, WSPD_SUM);
  assert.equal(nullWind, NULL_WIND_DAYS);
  // Spot checks: first/last day, whole-station outage day, partial-bad day kept missing.
  assert.deepEqual(dayWind(series, "2015-01-01"), { date: "2015-01-01", wspdMph: 2.69 });
  assert.deepEqual(dayWind(series, "2026-09-08"), { date: "2026-09-08", wspdMph: 6.68 });
  assert.deepEqual(dayWind(series, "2016-02-15"), { date: "2016-02-15", wspdMph: null });
  assert.deepEqual(dayWind(series, "2026-07-07"), { date: "2026-07-07", wspdMph: null });
});

test("mesonet oilt daily wind csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,wspd_mph");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readMesonetWindDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, wspd] = line.split(",");
    const row = dayWind(series, date);
    assert.ok(row);
    assert.equal(wspd === "" ? null : Number(wspd), row.wspdMph);
  }
});

test("mesonet oilt daily wind fails closed on damage", () => {
  assert.ok(readMesonetWindDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readMesonetWindDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readMesonetWindDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  const zi = frozen.rows.findIndex((r) => r.wspdMph === null);
  assert.ok(zi >= 0);
  filledZero.rows[zi].wspdMph = 0;
  assert.equal(readMesonetWindDaily(filledZero), null);
  const sentinel = structuredClone(frozen);
  sentinel.rows[10].wspdMph = -999;
  assert.equal(readMesonetWindDaily(sentinel), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", wspdMph: 5.5 });
  assert.equal(readMesonetWindDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].wspdMph = 5.05;
  assert.equal(readMesonetWindDaily(edited), null);
  const tmaxCopy = structuredClone(frozen);
  tmaxCopy.rows[5].tmaxF = 90;
  assert.equal(readMesonetWindDaily(tmaxCopy), null);
  const rainCopy = structuredClone(frozen);
  rainCopy.rows[5].rainIn = 0.5;
  assert.equal(readMesonetWindDaily(rainCopy), null);
  const savgCopy = structuredClone(frozen);
  savgCopy.rows[5].savgF = 70;
  assert.equal(readMesonetWindDaily(savgCopy), null);
  const havgCopy = structuredClone(frozen);
  havgCopy.rows[5].havgPct = 60;
  assert.equal(readMesonetWindDaily(havgCopy), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "Mesonet OILT daily busy score";
  assert.equal(readMesonetWindDaily(relabeled), null);
  const cityRelabeled = structuredClone(frozen);
  cityRelabeled.stationName = "Cushing, OK (city station)";
  assert.equal(readMesonetWindDaily(cityRelabeled), null);
  const kcuhed = structuredClone(frozen);
  kcuhed.station = "CUH";
  assert.equal(readMesonetWindDaily(kcuhed), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readMesonetWindDaily(resourced), null);
  assert.equal(readMesonetWindDaily(null), null);
  assert.equal(dayWind(null, "2026-09-08"), null);
  assert.equal(dayWind(readMesonetWindDaily(frozen), "2026-09-09"), null);
});
