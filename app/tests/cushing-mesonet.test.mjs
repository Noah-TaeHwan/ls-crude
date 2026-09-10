import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayWeather, readMesonetDaily } from "../app/lib/cushing-mesonet.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091MESOZ/mesonet_oilt_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091MESOZ/mesonet_oilt_daily.csv", base), "utf8");

const DAY_COUNT = 4269;
const TMAX_SUM = 30206129;
const NULL_TEMP_DAYS = 110;
const NULL_RAIN_DAYS = 127;

test("mesonet oilt daily keeps dated weather series with missing left missing", () => {
  const series = readMesonetDaily(frozen);
  assert.equal(series.runId, "20260910T091MESOZ");
  assert.equal(series.station, "OILT");
  assert.equal(series.label, "Mesonet nearest Cushing daily weather, confounder, not activity");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let tmaxSum = 0;
  let nullTemp = 0;
  let nullRain = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    if (row.tmaxF === null || row.tminF === null || row.tavgF === null) {
      assert.equal(row.tmaxF, null);
      assert.equal(row.tminF, null);
      assert.equal(row.tavgF, null);
      nullTemp += 1;
    } else {
      assert.ok(row.tmaxF >= row.tminF);
      tmaxSum += Math.round(row.tmaxF * 100);
    }
    if (row.rainIn === null) {
      nullRain += 1;
    } else {
      assert.ok(row.rainIn >= 0);
    }
  }
  assert.equal(tmaxSum, TMAX_SUM);
  assert.equal(nullTemp, NULL_TEMP_DAYS);
  assert.equal(nullRain, NULL_RAIN_DAYS);
  // Spot checks: first/last day, a rainy day, an observed-dry zero, an outage day, a rain-gauge-outage day.
  assert.deepEqual(dayWeather(series, "2015-01-01"), { date: "2015-01-01", tmaxF: 31.16, tminF: 24.06, tavgF: 28.27, rainIn: 0.02 });
  assert.deepEqual(dayWeather(series, "2026-09-08"), { date: "2026-09-08", tmaxF: 103.8, tminF: 77.11, tavgF: 89.13, rainIn: 0 });
  assert.deepEqual(dayWeather(series, "2015-01-02"), { date: "2015-01-02", tmaxF: 35.96, tminF: 30.88, tavgF: 33.62, rainIn: 0.25 });
  assert.deepEqual(dayWeather(series, "2016-02-15"), { date: "2016-02-15", tmaxF: null, tminF: null, tavgF: null, rainIn: null });
  assert.deepEqual(dayWeather(series, "2026-07-04"), { date: "2026-07-04", tmaxF: 95.94, tminF: 66.47, tavgF: 81.11, rainIn: null });
});

test("mesonet oilt daily csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,tmax_f,tmin_f,tavg_f,rain_in");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readMesonetDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, tmax, tmin, tavg, rain] = line.split(",");
    const row = dayWeather(series, date);
    assert.ok(row);
    assert.equal(tmax === "" ? null : Number(tmax), row.tmaxF);
    assert.equal(tmin === "" ? null : Number(tmin), row.tminF);
    assert.equal(tavg === "" ? null : Number(tavg), row.tavgF);
    assert.equal(rain === "" ? null : Number(rain), row.rainIn);
  }
});

test("mesonet oilt daily fails closed on damage", () => {
  assert.ok(readMesonetDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readMesonetDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readMesonetDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  const zi = frozen.rows.findIndex((r) => r.rainIn === null);
  assert.ok(zi >= 0);
  filledZero.rows[zi].rainIn = 0;
  assert.equal(readMesonetDaily(filledZero), null);
  const sentinel = structuredClone(frozen);
  sentinel.rows[10].tmaxF = -999;
  assert.equal(readMesonetDaily(sentinel), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", tmaxF: 90, tminF: 70, tavgF: 80, rainIn: 0 });
  assert.equal(readMesonetDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].tmaxF = 99.9;
  assert.equal(readMesonetDaily(edited), null);
  const halfMissing = structuredClone(frozen);
  const hi = frozen.rows.findIndex((r) => r.tmaxF !== null);
  halfMissing.rows[hi].tminF = null;
  assert.equal(readMesonetDaily(halfMissing), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "Mesonet OILT daily busy score";
  assert.equal(readMesonetDaily(relabeled), null);
  const kcuhed = structuredClone(frozen);
  kcuhed.station = "CUH";
  assert.equal(readMesonetDaily(kcuhed), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readMesonetDaily(resourced), null);
  assert.equal(readMesonetDaily(null), null);
  assert.equal(dayWeather(null, "2026-09-08"), null);
  assert.equal(dayWeather(readMesonetDaily(frozen), "2026-09-09"), null);
});
