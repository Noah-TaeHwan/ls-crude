import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayHumidity, readMesonetHumidityDaily } from "../app/lib/cushing-mesonet-humidity.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091HUMZ/mesonet_oilt_humidity_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091HUMZ/mesonet_oilt_humidity_daily.csv", base), "utf8");

const DAY_COUNT = 4269;
const HAVG_SUM = 29276766;
const NULL_HUMIDITY_DAYS = 114;

test("mesonet oilt daily humidity keeps dated humidity series with missing left missing", () => {
  const series = readMesonetHumidityDaily(frozen);
  assert.equal(series.runId, "20260910T091HUMZ");
  assert.equal(series.station, "OILT");
  assert.equal(series.label, "Mesonet OILT daily mean relative humidity HAVG, dated, 24.3 km, not air temp, not rain, not soil, not busy");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let havgSum = 0;
  let nullHumidity = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(Object.keys(row).sort(), ["date", "havgPct"]);
    if (row.havgPct === null) {
      nullHumidity += 1;
    } else {
      assert.ok(row.havgPct >= 0 && row.havgPct <= 100);
      havgSum += Math.round(row.havgPct * 100);
    }
  }
  assert.equal(havgSum, HAVG_SUM);
  assert.equal(nullHumidity, NULL_HUMIDITY_DAYS);
  // Spot checks: first/last day, whole-station outage day, partial-bad day kept missing.
  assert.deepEqual(dayHumidity(series, "2015-01-01"), { date: "2015-01-01", havgPct: 75.69 });
  assert.deepEqual(dayHumidity(series, "2026-09-08"), { date: "2026-09-08", havgPct: 51.19 });
  assert.deepEqual(dayHumidity(series, "2016-02-15"), { date: "2016-02-15", havgPct: null });
  assert.deepEqual(dayHumidity(series, "2026-07-07"), { date: "2026-07-07", havgPct: null });
});

test("mesonet oilt daily humidity csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,havg_pct");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readMesonetHumidityDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, havg] = line.split(",");
    const row = dayHumidity(series, date);
    assert.ok(row);
    assert.equal(havg === "" ? null : Number(havg), row.havgPct);
  }
});

test("mesonet oilt daily humidity fails closed on damage", () => {
  assert.ok(readMesonetHumidityDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readMesonetHumidityDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readMesonetHumidityDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  const zi = frozen.rows.findIndex((r) => r.havgPct === null);
  assert.ok(zi >= 0);
  filledZero.rows[zi].havgPct = 0;
  assert.equal(readMesonetHumidityDaily(filledZero), null);
  const sentinel = structuredClone(frozen);
  sentinel.rows[10].havgPct = -999;
  assert.equal(readMesonetHumidityDaily(sentinel), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", havgPct: 55 });
  assert.equal(readMesonetHumidityDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].havgPct = 50.5;
  assert.equal(readMesonetHumidityDaily(edited), null);
  const tmaxCopy = structuredClone(frozen);
  tmaxCopy.rows[5].tmaxF = 90;
  assert.equal(readMesonetHumidityDaily(tmaxCopy), null);
  const savgCopy = structuredClone(frozen);
  savgCopy.rows[5].savgF = 70;
  assert.equal(readMesonetHumidityDaily(savgCopy), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "Mesonet OILT daily busy score";
  assert.equal(readMesonetHumidityDaily(relabeled), null);
  const cityRelabeled = structuredClone(frozen);
  cityRelabeled.stationName = "Cushing, OK (city station)";
  assert.equal(readMesonetHumidityDaily(cityRelabeled), null);
  const kcuhed = structuredClone(frozen);
  kcuhed.station = "CUH";
  assert.equal(readMesonetHumidityDaily(kcuhed), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readMesonetHumidityDaily(resourced), null);
  assert.equal(readMesonetHumidityDaily(null), null);
  assert.equal(dayHumidity(null, "2026-09-08"), null);
  assert.equal(dayHumidity(readMesonetHumidityDaily(frozen), "2026-09-09"), null);
});
