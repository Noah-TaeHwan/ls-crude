import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { monthLaborForce, readPayneLausLaborForceMonthly } from "../app/lib/cushing-laus-labor-force.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091LAUFZ/payne_laus_labor_force_monthly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091LAUFZ/payne_laus_labor_force_monthly.csv", base), "utf8");

const DISCLOSED_COUNT = 138;
const LABOR_FORCE_SUM = 5336427;

test("payne laus labor force monthly keeps dated county count series with missing left missing", () => {
  const series = readPayneLausLaborForceMonthly(frozen);
  assert.equal(series.areaFips, "40119");
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.frequency, "monthly LAUS civilian labor force");
  assert.equal(series.rows.length, 139);
  assert.deepEqual(
    [series.rows[0].period, series.rows[0].labor_force],
    ["2015-01", 37394],
  );
  assert.deepEqual(
    [series.rows[138].period, series.rows[138].labor_force],
    ["2026-07", 40352],
  );
  // 2025-10 is published as unavailable (2025 lapse in appropriations): stays missing, never 0.
  assert.deepEqual(monthLaborForce(series, "2025-10"), {
    period: "2025-10",
    labor_force: null,
  });
  for (const row of series.rows) {
    assert.match(row.period, /^\d{4}-(0[1-9]|1[0-2])$/);
    assert.ok(
      row.labor_force === null ||
        (Number.isInteger(row.labor_force) && row.labor_force >= 1000 && row.labor_force <= 1000000),
    );
    assert.ok(!("unemployment_rate" in row));
    assert.ok(!("employed" in row));
  }
  const disclosed = series.rows.filter((row) => row.labor_force !== null);
  assert.equal(disclosed.length, DISCLOSED_COUNT);
  assert.equal(
    disclosed.reduce((n, row) => n + row.labor_force, 0),
    LABOR_FORCE_SUM,
  );
  // 2025-03 agrees with the frozen BLS LAUS labor-force row, not Cushing city, not statewide, not the rate or employed count.
  assert.deepEqual(monthLaborForce(series, "2025-03"), {
    period: "2025-03",
    labor_force: 41353,
  });
});

test("payne laus labor force monthly csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "period,labor_force");
  assert.equal(lines.length, 140);
  let disclosed = 0;
  let sum = 0;
  for (const line of lines.slice(1)) {
    const [period, count] = line.split(",");
    const row = monthLaborForce(readPayneLausLaborForceMonthly(frozen), period);
    assert.ok(row);
    assert.equal(count === "" ? null : Number(count), row.labor_force);
    if (count !== "") {
      disclosed += 1;
      sum += Number(count);
    }
  }
  assert.equal(disclosed, DISCLOSED_COUNT);
  assert.equal(sum, LABOR_FORCE_SUM);
});

test("payne laus labor force monthly fails closed on damage", () => {
  assert.ok(readPayneLausLaborForceMonthly(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneLausLaborForceMonthly(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[138].period = "2026-06";
  assert.equal(readPayneLausLaborForceMonthly(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[117].labor_force = 0;
  assert.equal(readPayneLausLaborForceMonthly(filled), null);
  const copied = structuredClone(frozen);
  copied.rows[50] = structuredClone(copied.rows[49]);
  assert.equal(readPayneLausLaborForceMonthly(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneLausLaborForceMonthly(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.areaFips = "40000";
  assert.equal(readPayneLausLaborForceMonthly(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneLausLaborForceMonthly(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ period: "2026-08", labor_force: 40300 });
  assert.equal(readPayneLausLaborForceMonthly(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[100].labor_force = 99999;
  assert.equal(readPayneLausLaborForceMonthly(edited), null);
  // 실업률·취업자수-노동력 뒤바뀜: 실업률 값이나 취업자수 값, 다른 지표 키가 섞이면 거부한다.
  const rateSwap = structuredClone(frozen);
  rateSwap.rows[100].labor_force = 2.7;
  assert.equal(readPayneLausLaborForceMonthly(rateSwap), null);
  const rateKey = structuredClone(frozen);
  rateKey.rows[100] = { period: "2023-05", unemployment_rate: 2.7 };
  assert.equal(readPayneLausLaborForceMonthly(rateKey), null);
  const employedKey = structuredClone(frozen);
  employedKey.rows[100] = { period: "2023-05", employed: 38853 };
  assert.equal(readPayneLausLaborForceMonthly(employedKey), null);
  const employedSwap = structuredClone(frozen);
  employedSwap.rows[100].labor_force = 38853;
  assert.equal(readPayneLausLaborForceMonthly(employedSwap), null);
  assert.equal(readPayneLausLaborForceMonthly(null), null);
  assert.equal(monthLaborForce(null, "2025-03"), null);
  assert.equal(monthLaborForce(readPayneLausLaborForceMonthly(frozen), "2026-08"), null);
});
