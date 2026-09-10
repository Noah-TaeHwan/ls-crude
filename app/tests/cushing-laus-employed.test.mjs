import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { monthEmployed, readPayneLausEmployedMonthly } from "../app/lib/cushing-laus-employed.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091LAUEZ/payne_laus_employed_monthly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091LAUEZ/payne_laus_employed_monthly.csv", base), "utf8");

const DISCLOSED_COUNT = 138;
const EMPLOYED_SUM = 5154289;

test("payne laus employed monthly keeps dated county count series with missing left missing", () => {
  const series = readPayneLausEmployedMonthly(frozen);
  assert.equal(series.areaFips, "40119");
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.frequency, "monthly LAUS employment level");
  assert.equal(series.rows.length, 139);
  assert.deepEqual(
    [series.rows[0].period, series.rows[0].employed],
    ["2015-01", 36075],
  );
  assert.deepEqual(
    [series.rows[138].period, series.rows[138].employed],
    ["2026-07", 38543],
  );
  // 2025-10 is published as unavailable (2025 lapse in appropriations): stays missing, never 0.
  assert.deepEqual(monthEmployed(series, "2025-10"), {
    period: "2025-10",
    employed: null,
  });
  for (const row of series.rows) {
    assert.match(row.period, /^\d{4}-(0[1-9]|1[0-2])$/);
    assert.ok(
      row.employed === null ||
        (Number.isInteger(row.employed) && row.employed >= 1000 && row.employed <= 1000000),
    );
    assert.ok(!("unemployment_rate" in row));
  }
  const disclosed = series.rows.filter((row) => row.employed !== null);
  assert.equal(disclosed.length, DISCLOSED_COUNT);
  assert.equal(
    disclosed.reduce((n, row) => n + row.employed, 0),
    EMPLOYED_SUM,
  );
  // 2025-03 agrees with the frozen BLS LAUS employment row, not Cushing city, not statewide, not the rate.
  assert.deepEqual(monthEmployed(series, "2025-03"), {
    period: "2025-03",
    employed: 40239,
  });
});

test("payne laus employed monthly csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "period,employed");
  assert.equal(lines.length, 140);
  let disclosed = 0;
  let sum = 0;
  for (const line of lines.slice(1)) {
    const [period, count] = line.split(",");
    const row = monthEmployed(readPayneLausEmployedMonthly(frozen), period);
    assert.ok(row);
    assert.equal(count === "" ? null : Number(count), row.employed);
    if (count !== "") {
      disclosed += 1;
      sum += Number(count);
    }
  }
  assert.equal(disclosed, DISCLOSED_COUNT);
  assert.equal(sum, EMPLOYED_SUM);
});

test("payne laus employed monthly fails closed on damage", () => {
  assert.ok(readPayneLausEmployedMonthly(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readPayneLausEmployedMonthly(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[138].period = "2026-06";
  assert.equal(readPayneLausEmployedMonthly(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[117].employed = 0;
  assert.equal(readPayneLausEmployedMonthly(filled), null);
  const copied = structuredClone(frozen);
  copied.rows[50] = structuredClone(copied.rows[49]);
  assert.equal(readPayneLausEmployedMonthly(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneLausEmployedMonthly(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.areaFips = "40000";
  assert.equal(readPayneLausEmployedMonthly(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneLausEmployedMonthly(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ period: "2026-08", employed: 38500 });
  assert.equal(readPayneLausEmployedMonthly(invented), null);
  const edited = structuredClone(frozen);
  edited.rows[100].employed = 99999;
  assert.equal(readPayneLausEmployedMonthly(edited), null);
  // 실업률-인원수 뒤바뀜: 실업률 값이나 실업률 키가 섞이면 거부한다.
  const rateSwap = structuredClone(frozen);
  rateSwap.rows[100].employed = 2.7;
  assert.equal(readPayneLausEmployedMonthly(rateSwap), null);
  const rateKey = structuredClone(frozen);
  rateKey.rows[100] = { period: "2023-05", unemployment_rate: 2.7 };
  assert.equal(readPayneLausEmployedMonthly(rateKey), null);
  assert.equal(readPayneLausEmployedMonthly(null), null);
  assert.equal(monthEmployed(null, "2025-03"), null);
  assert.equal(monthEmployed(readPayneLausEmployedMonthly(frozen), "2026-08"), null);
});
