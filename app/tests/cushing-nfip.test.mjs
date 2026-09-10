import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { nfipClaimsOn, readCushingNfip } from "../app/lib/cushing-nfip.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091NFIPZ/cushing_nfip_claims.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091NFIPZ/cushing_nfip_claims.csv", base), "utf8");

const ROW_COUNT = 100;
const FIRST_DATE = "1980-06-19";
const LAST_DATE = "2021-06-27";

test("cushing nfip keeps dated payne claim list, not busy", () => {
  const series = readCushingNfip(frozen);
  assert.equal(series.runId, "20260910T091NFIPZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].dateOfLoss, FIRST_DATE);
  assert.equal(series.rows[0].claimId, "6034961");
  assert.equal(series.rows[99].dateOfLoss, LAST_DATE);
  assert.equal(series.rows[99].claimId, "7928202");
  let nullPaidBuilding = 0;
  let nullPaidContents = 0;
  for (const row of series.rows) {
    assert.equal(row.countyCode, "40119");
    assert.match(row.dateOfLoss, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(row.yearOfLoss, Number(row.dateOfLoss.slice(0, 4)));
    assert.ok(row.ratedFloodZone.length > 0);
    if (row.amountPaidBuilding === null) nullPaidBuilding += 1;
    else assert.ok(row.amountPaidBuilding >= 0);
    if (row.amountPaidContents === null) nullPaidContents += 1;
    else assert.ok(row.amountPaidContents >= 0);
    assert.ok(row.netBuildingPayment >= 0);
    assert.ok(row.netContentsPayment >= 0);
  }
  assert.equal(nullPaidBuilding, 21);
  assert.equal(nullPaidContents, 21);
  assert.deepEqual(
    nfipClaimsOn(series, "1980-06-19").map((r) => r.claimId),
    ["6034961", "6114236", "7336793"],
  );
  assert.deepEqual(nfipClaimsOn(series, "2015-01-01"), []);
});

test("cushing nfip csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "claim_id,county_code,date_of_loss,year_of_loss,rated_flood_zone,amount_paid_building,amount_paid_contents,net_building_payment,net_contents_payment");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingNfip(frozen);
  for (const line of lines.slice(1)) {
    const [claimId, countyCode, dateOfLoss] = line.split(",");
    assert.equal(countyCode, "40119");
    const rows = nfipClaimsOn(series, dateOfLoss);
    const row = rows.find((r) => r.claimId === claimId);
    assert.ok(row);
  }
});

test("cushing nfip fails closed on filled periods and county swap", () => {
  assert.ok(readCushingNfip(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingNfip(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[99].dateOfLoss = "2021-06-26";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingNfip(redated), null);
  const filled = structuredClone(frozen);
  filled.rows.push({
    claimId: "9999999",
    countyCode: "40119",
    dateOfLoss: "2015-06-15",
    yearOfLoss: 2015,
    ratedFloodZone: "X",
    amountPaidBuilding: 100,
    amountPaidContents: 0,
    netBuildingPayment: 100,
    netContentsPayment: 0,
  });
  assert.equal(readCushingNfip(filled), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[5].amountPaidBuilding = 0;
  // Filling a null paid amount with 0 breaks the frozen checksum.
  if (frozen.rows[5].amountPaidBuilding === null) {
    assert.equal(readCushingNfip(zeroed), null);
  }
  const county109 = structuredClone(frozen);
  county109.rows[0].countyCode = "40109";
  assert.equal(readCushingNfip(county109), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma County, Oklahoma (state OK, countyCode 40109)";
  assert.equal(readCushingNfip(relabeled), null);
  const city = structuredClone(frozen);
  city.geography = "Cushing city, Oklahoma";
  assert.equal(readCushingNfip(city), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingNfip(dropped), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[0].dateOfLoss = "06/19/1980";
  assert.equal(readCushingNfip(reportDated), null);
  assert.equal(readCushingNfip(null), null);
  assert.deepEqual(nfipClaimsOn(null, "1980-06-19"), []);
  assert.deepEqual(nfipClaimsOn(readCushingNfip(frozen), "1999-01-01"), []);
});
