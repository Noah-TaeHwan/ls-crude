import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dayWeather, readKcuhDaily } from "../app/lib/cushing-kcuh.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091KCUHZ/kcuh_daily_weather.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091KCUHZ/kcuh_daily_weather.csv", base), "utf8");

const DAY_COUNT = 4269;
const MAX_TEMP_SUM = 307313;
const NULL_TEMP_DAYS = 38;
const NULL_PRECIP_DAYS = 3406;

test("kcuh daily keeps dated weather series with missing left missing", () => {
  const series = readKcuhDaily(frozen);
  assert.equal(series.runId, "20260910T091KCUHZ");
  assert.equal(series.station, "CUH");
  assert.equal(series.label, "KCUH daily airport weather, confounder, not activity");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let maxSum = 0;
  let nullTemp = 0;
  let nullPrecip = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    if (row.maxTempF === null || row.minTempF === null) {
      assert.equal(row.maxTempF, null);
      assert.equal(row.minTempF, null);
      nullTemp += 1;
    } else {
      assert.ok(row.maxTempF >= row.minTempF);
      maxSum += Math.round(row.maxTempF);
    }
    if (row.precipIn === null) {
      nullPrecip += 1;
    } else {
      assert.ok(row.precipIn >= 0);
    }
  }
  assert.equal(maxSum, MAX_TEMP_SUM);
  assert.equal(nullTemp, NULL_TEMP_DAYS);
  assert.equal(nullPrecip, NULL_PRECIP_DAYS);
  // Spot checks: first/last day, a rainy day, an observed-dry zero, a trace day, a temp-gap day.
  assert.deepEqual(dayWeather(series, "2015-01-01"), { date: "2015-01-01", maxTempF: 32, minTempF: 24.8, precipIn: null });
  assert.deepEqual(dayWeather(series, "2026-09-08"), { date: "2026-09-08", maxTempF: 102, minTempF: 76.3, precipIn: null });
  assert.deepEqual(dayWeather(series, "2015-04-27"), { date: "2015-04-27", maxTempF: 55.4, minTempF: 48.2, precipIn: 1.12 });
  assert.deepEqual(dayWeather(series, "2016-07-05"), { date: "2016-07-05", maxTempF: 94.82, minTempF: 74.84, precipIn: 0 });
  assert.deepEqual(dayWeather(series, "2017-11-28"), { date: "2017-11-28", maxTempF: 70, minTempF: 53.4, precipIn: null });
  assert.deepEqual(dayWeather(series, "2019-09-14"), { date: "2019-09-14", maxTempF: null, minTempF: null, precipIn: null });
});

test("kcuh daily csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,max_temp_f,min_temp_f,precip_in");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readKcuhDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, max, min, precip] = line.split(",");
    const row = dayWeather(series, date);
    assert.ok(row);
    assert.equal(max === "" ? null : Number(max), row.maxTempF);
    assert.equal(min === "" ? null : Number(min), row.minTempF);
    assert.equal(precip === "" ? null : Number(precip), row.precipIn);
  }
});

test("kcuh daily fails closed on damage", () => {
  assert.ok(readKcuhDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readKcuhDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readKcuhDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  filledZero.rows[0].precipIn = 0;
  assert.equal(readKcuhDaily(filledZero), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", maxTempF: 90, minTempF: 70, precipIn: 0 });
  assert.equal(readKcuhDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].maxTempF = 99.9;
  assert.equal(readKcuhDaily(edited), null);
  const halfMissing = structuredClone(frozen);
  halfMissing.rows[500].minTempF = null;
  assert.equal(readKcuhDaily(halfMissing), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "KCUH daily busy score";
  assert.equal(readKcuhDaily(relabeled), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readKcuhDaily(resourced), null);
  assert.equal(readKcuhDaily(null), null);
  assert.equal(dayWeather(null, "2026-09-08"), null);
  assert.equal(dayWeather(readKcuhDaily(frozen), "2026-09-09"), null);
});
