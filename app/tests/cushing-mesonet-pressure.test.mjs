import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayPressure, readMesonetPressureDaily } from "../app/lib/cushing-mesonet-pressure.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091PRESZ/mesonet_oilt_pressure_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091PRESZ/mesonet_oilt_pressure_daily.csv", base), "utf8");

const DAY_COUNT = 4269;
const PAVG_SUM = 12127694;
const NULL_PRESSURE_DAYS = 104;

test("mesonet oilt daily pressure keeps dated pressure series with missing left missing", () => {
  const series = readMesonetPressureDaily(frozen);
  assert.equal(series.runId, "20260910T091PRESZ");
  assert.equal(series.station, "OILT");
  assert.equal(series.label, "Mesonet OILT daily mean station pressure PAVG, dated, 24.3 km, not air temp, not rain, not soil, not humidity, not wind, not busy");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let pavgSum = 0;
  let nullPressure = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(Object.keys(row).sort(), ["date", "pavgInhg"]);
    if (row.pavgInhg === null) {
      nullPressure += 1;
    } else {
      assert.ok(row.pavgInhg >= 25 && row.pavgInhg <= 32);
      pavgSum += Math.round(row.pavgInhg * 100);
    }
  }
  assert.equal(pavgSum, PAVG_SUM);
  assert.equal(nullPressure, NULL_PRESSURE_DAYS);
  // Spot checks: first/last day, whole-station outage day, partial-bad days kept missing.
  assert.deepEqual(dayPressure(series, "2015-01-01"), { date: "2015-01-01", pavgInhg: 29.38 });
  assert.deepEqual(dayPressure(series, "2026-09-01"), { date: "2026-09-01", pavgInhg: 29.09 });
  assert.deepEqual(dayPressure(series, "2026-09-08"), { date: "2026-09-08", pavgInhg: 29.1 });
  assert.deepEqual(dayPressure(series, "2016-02-15"), { date: "2016-02-15", pavgInhg: null });
  assert.deepEqual(dayPressure(series, "2015-01-24"), { date: "2015-01-24", pavgInhg: null });
  assert.deepEqual(dayPressure(series, "2026-07-07"), { date: "2026-07-07", pavgInhg: null });
});

test("mesonet oilt daily pressure csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,pavg_inhg");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readMesonetPressureDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, pavg] = line.split(",");
    const row = dayPressure(series, date);
    assert.ok(row);
    assert.equal(pavg === "" ? null : Number(pavg), row.pavgInhg);
  }
});

test("mesonet oilt daily pressure fails closed on damage", () => {
  assert.ok(readMesonetPressureDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readMesonetPressureDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readMesonetPressureDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  const zi = frozen.rows.findIndex((r) => r.pavgInhg === null);
  assert.ok(zi >= 0);
  filledZero.rows[zi].pavgInhg = 0;
  assert.equal(readMesonetPressureDaily(filledZero), null);
  const sentinel = structuredClone(frozen);
  sentinel.rows[10].pavgInhg = -999;
  assert.equal(readMesonetPressureDaily(sentinel), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", pavgInhg: 29.1 });
  assert.equal(readMesonetPressureDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].pavgInhg = 29.5;
  assert.equal(readMesonetPressureDaily(edited), null);
  const tmaxCopy = structuredClone(frozen);
  tmaxCopy.rows[5].tmaxF = 90;
  assert.equal(readMesonetPressureDaily(tmaxCopy), null);
  const rainCopy = structuredClone(frozen);
  rainCopy.rows[5].rainIn = 0.5;
  assert.equal(readMesonetPressureDaily(rainCopy), null);
  const savgCopy = structuredClone(frozen);
  savgCopy.rows[5].savgF = 70;
  assert.equal(readMesonetPressureDaily(savgCopy), null);
  const havgCopy = structuredClone(frozen);
  havgCopy.rows[5].havgPct = 60;
  assert.equal(readMesonetPressureDaily(havgCopy), null);
  const wspdCopy = structuredClone(frozen);
  wspdCopy.rows[5].wspdMph = 5.5;
  assert.equal(readMesonetPressureDaily(wspdCopy), null);
  const mslpCopy = structuredClone(frozen);
  mslpCopy.rows[5].mslpInhg = 30.1;
  assert.equal(readMesonetPressureDaily(mslpCopy), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "Mesonet OILT daily busy score";
  assert.equal(readMesonetPressureDaily(relabeled), null);
  const cityRelabeled = structuredClone(frozen);
  cityRelabeled.stationName = "Cushing, OK (city station)";
  assert.equal(readMesonetPressureDaily(cityRelabeled), null);
  const kcuhed = structuredClone(frozen);
  kcuhed.station = "CUH";
  assert.equal(readMesonetPressureDaily(kcuhed), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readMesonetPressureDaily(resourced), null);
  assert.equal(readMesonetPressureDaily(null), null);
  assert.equal(dayPressure(null, "2026-09-08"), null);
  assert.equal(dayPressure(readMesonetPressureDaily(frozen), "2026-09-09"), null);
});
