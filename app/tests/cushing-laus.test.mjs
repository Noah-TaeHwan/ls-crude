import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { monthUnemploymentRate, readPayneLausMonthly } from "../app/lib/cushing-laus.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091LAUSZ/payne_laus_monthly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091LAUSZ/payne_laus_monthly.csv", base), "utf8");

const DISCLOSED_COUNT = 138;
const RATE_TENTHS_SUM = 4731;

test("payne laus monthly keeps dated county rate series with missing left missing", () => {
  const series = readPayneLausMonthly(frozen);
  assert.equal(series.areaFips, "40119");
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.frequency, "monthly LAUS unemployment rate");
  assert.equal(series.rows.length, 139);
  assert.deepEqual(
    [series.rows[0].period, series.rows[0].unemployment_rate],
    ["2015-01", 3.5],
  );
  assert.deepEqual(
    [series.rows[138].period, series.rows[138].unemployment_rate],
    ["2026-07", 4.5],
  );
  // 2025-10 is published as unavailable (2025 lapse in appropriations): stays missing, never 0.
  assert.deepEqual(monthUnemploymentRate(series, "2025-10"), {
    period: "2025-10",
    unemployment_rate: null,
  });
  for (const row of series.rows) {
    assert.match(row.period, /^\d{4}-(0[1-9]|1[0-2])$/);
    assert.ok(
      row.unemployment_rate === null ||
        (Number.isFinite(row.unemployment_rate) &&
          row.unemployment_rate > 0 &&
          row.unemployment_rate < 100),
    );
  }
  const disclosed = series.rows.filter((row) => row.unemployment_rate !== null);
  assert.equal(disclosed.length, DISCLOSED_COUNT);
  assert.equal(
    disclosed.reduce((n, row) => n + Math.round(row.unemployment_rate * 10), 0),
    RATE_TENTHS_SUM,
  );
  // 2025-03 agrees with the frozen BLS LAUS row, not Cushing city, not statewide.
  assert.deepEqual(monthUnemploymentRate(series, "2025-03"), {
    period: "2025-03",
    unemployment_rate: 2.7,
  });
});

test("payne laus monthly csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "period,unemployment_rate");
  assert.equal(lines.length, 140);
  let disclosed = 0;
  let tenths = 0;
  for (const line of lines.slice(1)) {
    const [period, rate] = line.split(",");
    const row = monthUnemploymentRate(readPayneLausMonthly(frozen), period);
    assert.ok(row);
    assert.equal(rate === "" ? null : Number(rate), row.unemployment_rate);
    if (rate !== "") {
      disclosed += 1;
      tenths += Math.round(Number(rate) * 10);
    }
  }
  assert.equal(disclosed, DISCLOSED_COUNT);
  assert.equal(tenths, RATE_TENTHS_SUM);
});

test("payne laus monthly fails closed on damage", () => {
  assert.ok(readPayneLausMonthly(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneLausMonthly(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[138].period = "2026-06";
  assert.equal(readPayneLausMonthly(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[117].unemployment_rate = 0;
  assert.equal(readPayneLausMonthly(filled), null);
  const copied = structuredClone(frozen);
  copied.rows[50] = structuredClone(copied.rows[49]);
  assert.equal(readPayneLausMonthly(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneLausMonthly(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.areaFips = "40000";
  assert.equal(readPayneLausMonthly(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneLausMonthly(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ period: "2026-08", unemployment_rate: 4.4 });
  assert.equal(readPayneLausMonthly(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[100].unemployment_rate = 9.9;
  assert.equal(readPayneLausMonthly(edited), null);
  assert.equal(readPayneLausMonthly(null), null);
  assert.equal(monthUnemploymentRate(null, "2025-03"), null);
  assert.equal(monthUnemploymentRate(readPayneLausMonthly(frozen), "2026-08"), null);
});
