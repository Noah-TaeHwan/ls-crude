import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { monthPrecip, readCushingPrecipMonthly } from "../app/lib/cushing-precip.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091PRCPZ/cushing_precip_monthly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091PRCPZ/cushing_precip_monthly.csv", base), "utf8");

const MONTH_COUNT = 55;
const THOUSANDTHS_SUM = 176524;
const DISCLOSED_MONTHS = 47;
const NULL_MONTHS = 8;

test("cushing precip keeps dated monthly series with missing left missing", () => {
  const series = readCushingPrecipMonthly(frozen);
  assert.equal(series.runId, "20260910T091PRCPZ");
  assert.equal(series.station, "US1OKPY0019");
  assert.equal(series.label, "Cushing CUH precipitation, monthly confounder, not activity");
  assert.equal(series.rows.length, MONTH_COUNT);
  assert.equal(series.rows[0].period, "2017-05");
  assert.equal(series.rows[54].period, "2021-11");
  let thouSum = 0;
  let disclosed = 0;
  let nulls = 0;
  for (const row of series.rows) {
    assert.match(row.period, /^\d{4}-(0[1-9]|1[0-2])$/);
    if (row.precipIn === null) {
      nulls += 1;
    } else {
      assert.ok(row.precipIn >= 0);
      thouSum += Math.round(row.precipIn * 1000);
      disclosed += 1;
    }
  }
  assert.equal(thouSum, THOUSANDTHS_SUM);
  assert.equal(disclosed, DISCLOSED_MONTHS);
  assert.equal(nulls, NULL_MONTHS);
  // Spot checks: first/last month missing, a normal month, the wettest month,
  // an observed-dry zero month (kept, not missing), and a dry winter month.
  assert.deepEqual(monthPrecip(series, "2017-05"), { period: "2017-05", precipIn: null });
  assert.deepEqual(monthPrecip(series, "2017-06"), { period: "2017-06", precipIn: 2.22 });
  assert.deepEqual(monthPrecip(series, "2019-05"), { period: "2019-05", precipIn: 15.791 });
  assert.deepEqual(monthPrecip(series, "2021-09"), { period: "2021-09", precipIn: 0 });
  assert.deepEqual(monthPrecip(series, "2021-02"), { period: "2021-02", precipIn: 0.646 });
  assert.deepEqual(monthPrecip(series, "2021-11"), { period: "2021-11", precipIn: null });
  assert.equal(monthPrecip(series, "2015-01"), null);
});

test("cushing precip csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "period,precip_in");
  assert.equal(lines.length, MONTH_COUNT + 1);
  const series = readCushingPrecipMonthly(frozen);
  assert.ok(series);
  for (let i = 0; i < series.rows.length; i++) {
    const [period, cell] = lines[i + 1].split(",");
    assert.equal(period, series.rows[i].period);
    if (series.rows[i].precipIn === null) {
      assert.equal(cell, "");
    } else {
      assert.equal(Number(cell), series.rows[i].precipIn);
    }
  }
  // Missing months stay empty, the observed-dry month stays an explicit zero.
  const byLine = Object.fromEntries(lines.slice(1).map((l) => l.split(",")));
  assert.equal(byLine["2017-05"], "");
  assert.equal(Number(byLine["2021-09"]), 0);
});
