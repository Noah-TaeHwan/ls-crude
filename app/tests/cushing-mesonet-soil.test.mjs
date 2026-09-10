import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { daySoil, readMesonetSoilDaily } from "../app/lib/cushing-mesonet-soil.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091SOILZ/mesonet_oilt_soil_daily.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091SOILZ/mesonet_oilt_soil_daily.csv", base), "utf8");

const DAY_COUNT = 4269;
const SAVG_SUM = 25436779;
const NULL_SOIL_DAYS = 188;

test("mesonet oilt daily soil keeps dated soil-temp series with missing left missing", () => {
  const series = readMesonetSoilDaily(frozen);
  assert.equal(series.runId, "20260910T091SOILZ");
  assert.equal(series.station, "OILT");
  assert.equal(series.label, "Mesonet OILT daily soil temperature, dated, 24.3 km, not air temp, not rain, not busy");
  assert.equal(series.rows.length, DAY_COUNT);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows[4268].date, "2026-09-08");
  let savgSum = 0;
  let nullSoil = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(Object.keys(row).sort(), ["date", "savgF"]);
    if (row.savgF === null) {
      nullSoil += 1;
    } else {
      assert.ok(row.savgF > -40 && row.savgF < 130);
      savgSum += Math.round(row.savgF * 100);
    }
  }
  assert.equal(savgSum, SAVG_SUM);
  assert.equal(nullSoil, NULL_SOIL_DAYS);
  // Spot checks: first/last day, whole-station outage day, partial-bad day kept missing.
  assert.deepEqual(daySoil(series, "2015-01-01"), { date: "2015-01-01", savgF: 39.08 });
  assert.deepEqual(daySoil(series, "2026-09-08"), { date: "2026-09-08", savgF: 84.51 });
  assert.deepEqual(daySoil(series, "2016-02-15"), { date: "2016-02-15", savgF: null });
  assert.deepEqual(daySoil(series, "2026-07-07"), { date: "2026-07-07", savgF: null });
});

test("mesonet oilt daily soil csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "date,savg_f");
  assert.equal(lines.length, DAY_COUNT + 1);
  const series = readMesonetSoilDaily(frozen);
  assert.ok(series);
  for (const line of lines.slice(1)) {
    const [date, savg] = line.split(",");
    const row = daySoil(series, date);
    assert.ok(row);
    assert.equal(savg === "" ? null : Number(savg), row.savgF);
  }
});

test("mesonet oilt daily soil fails closed on damage", () => {
  assert.ok(readMesonetSoilDaily(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readMesonetSoilDaily(swapped), null);
  const dropped = structuredClone(frozen);
  dropped.rows.splice(100, 1);
  assert.equal(readMesonetSoilDaily(dropped), null);
  const filledZero = structuredClone(frozen);
  const zi = frozen.rows.findIndex((r) => r.savgF === null);
  assert.ok(zi >= 0);
  filledZero.rows[zi].savgF = 0;
  assert.equal(readMesonetSoilDaily(filledZero), null);
  const sentinel = structuredClone(frozen);
  sentinel.rows[10].savgF = -999;
  assert.equal(readMesonetSoilDaily(sentinel), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ date: "2026-09-09", savgF: 84 });
  assert.equal(readMesonetSoilDaily(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[1000].savgF = 99.9;
  assert.equal(readMesonetSoilDaily(edited), null);
  const tmaxCopy = structuredClone(frozen);
  tmaxCopy.rows[5].tmaxF = 90;
  assert.equal(readMesonetSoilDaily(tmaxCopy), null);
  const relabeled = structuredClone(frozen);
  relabeled.label = "Mesonet OILT daily busy score";
  assert.equal(readMesonetSoilDaily(relabeled), null);
  const cityRelabeled = structuredClone(frozen);
  cityRelabeled.stationName = "Cushing, OK (city station)";
  assert.equal(readMesonetSoilDaily(cityRelabeled), null);
  const kcuhed = structuredClone(frozen);
  kcuhed.station = "CUH";
  assert.equal(readMesonetSoilDaily(kcuhed), null);
  const resourced = structuredClone(frozen);
  resourced.source = "WTI futures";
  assert.equal(readMesonetSoilDaily(resourced), null);
  assert.equal(readMesonetSoilDaily(null), null);
  assert.equal(daySoil(null, "2026-09-08"), null);
  assert.equal(daySoil(readMesonetSoilDaily(frozen), "2026-09-09"), null);
});
