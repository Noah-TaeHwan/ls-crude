import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { nfipPoliciesOn, readCushingNfipPolicies } from "../app/lib/cushing-nfip-policies.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091NFPPZ/cushing_nfip_policies.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091NFPPZ/cushing_nfip_policies.csv", base), "utf8");

const MONTH_COUNT = 214;
const FIRST_MONTH = "2009-01";
const LAST_MONTH = "2026-10";
const POLICY_SUM = 4039;

test("cushing nfip policies keeps dated payne months, not claims", () => {
  const series = readCushingNfipPolicies(frozen);
  assert.equal(series.runId, "20260910T091NFPPZ");
  assert.equal(series.rows.length, MONTH_COUNT);
  assert.equal(series.rows[0].yearMonth, FIRST_MONTH);
  assert.equal(series.rows[0].policies, 12);
  assert.equal(series.rows[MONTH_COUNT - 1].yearMonth, LAST_MONTH);
  assert.equal(series.rows[MONTH_COUNT - 1].policies, 1);
  let sum = 0;
  for (const row of series.rows) {
    assert.match(row.yearMonth, /^\d{4}-(0[1-9]|1[0-2])$/);
    assert.ok(Number.isInteger(row.policies) && row.policies > 0);
    sum += row.policies;
  }
  assert.equal(sum, POLICY_SUM);
  assert.equal(nfipPoliciesOn(series, "2010-08"), 44);
  assert.equal(nfipPoliciesOn(series, "2009-01"), 12);
  assert.equal(nfipPoliciesOn(series, "2015-01-01"), null);
});

test("cushing nfip policies csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year_month,policies");
  assert.equal(lines.length, MONTH_COUNT + 1);
  const series = readCushingNfipPolicies(frozen);
  for (const line of lines.slice(1)) {
    const [yearMonth, policies] = line.split(",");
    assert.match(yearMonth, /^\d{4}-(0[1-9]|1[0-2])$/);
    assert.equal(nfipPoliciesOn(series, yearMonth), Number(policies));
  }
});

test("cushing nfip policies fails closed on filled months and county swap", () => {
  assert.ok(readCushingNfipPolicies(frozen));
  const shuffled = structuredClone(frozen);
  [shuffled.rows[0], shuffled.rows[1]] = [shuffled.rows[1], shuffled.rows[0]];
  assert.equal(readCushingNfipPolicies(shuffled), null);
  const redated = structuredClone(frozen);
  redated.rows[MONTH_COUNT - 1].yearMonth = "2026-09";
  // Redating the last month breaks the frozen value.
  assert.equal(readCushingNfipPolicies(redated), null);
  const filled = structuredClone(frozen);
  filled.rows.push({ yearMonth: "2008-12", policies: 5 });
  assert.equal(readCushingNfipPolicies(filled), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[10].policies = 0;
  // Filling a disclosed month with 0 breaks the frozen checksum.
  assert.equal(readCushingNfipPolicies(zeroed), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma County, Oklahoma (state OK, countyCode 40109)";
  assert.equal(readCushingNfipPolicies(relabeled), null);
  const city = structuredClone(frozen);
  city.geography = "Cushing city, Oklahoma";
  assert.equal(readCushingNfipPolicies(city), null);
  const claimed = structuredClone(frozen);
  claimed.runId = "20260910T091NFIPZ";
  assert.equal(readCushingNfipPolicies(claimed), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingNfipPolicies(dropped), null);
  const badMonth = structuredClone(frozen);
  badMonth.rows[0].yearMonth = "01/2009";
  assert.equal(readCushingNfipPolicies(badMonth), null);
  assert.equal(readCushingNfipPolicies(null), null);
  assert.equal(nfipPoliciesOn(null, "2009-01"), null);
  assert.equal(nfipPoliciesOn(readCushingNfipPolicies(frozen), "1999-01"), null);
});
