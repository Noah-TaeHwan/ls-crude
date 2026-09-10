import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { marchEmployment, readPayneQcew } from "../app/lib/cushing-qcew.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260909T091QCEWZ/payne_qcew_2025q1.json", base), "utf8"),
);

test("payne qcew keeps dated county table with suppression as missing", () => {
  const slice = readPayneQcew(frozen);
  assert.equal(slice.areaFips, "40119");
  assert.equal(slice.geography, "Payne County, Oklahoma");
  assert.equal(slice.rows.length, 7);
  assert.equal(marchEmployment(slice, "0", "10"), 35418);
  assert.equal(marchEmployment(slice, "5", "21"), 402);
  assert.equal(marchEmployment(slice, "5", "213112"), 231);
  assert.equal(marchEmployment(slice, "5", "721"), 450);
  assert.equal(marchEmployment(slice, "5", "211"), null);
  assert.equal(marchEmployment(slice, "5", "212"), null);
  assert.equal(
    slice.rows.filter((row) => row.month3 !== null).reduce((n, row) => n + row.month3, 0),
    36783,
  );
});

test("payne qcew fails closed on damage", () => {
  const swapped = structuredClone(frozen);
  [swapped.rows[1], swapped.rows[4]] = [swapped.rows[4], swapped.rows[1]];
  assert.equal(readPayneQcew(swapped), null);
  const reordered = structuredClone(frozen);
  reordered.rows.reverse();
  assert.equal(readPayneQcew(reordered), null);
  const edited = structuredClone(frozen);
  edited.rows[0].month3 = 35419;
  assert.equal(readPayneQcew(edited), null);
  const filled = structuredClone(frozen);
  filled.rows[2].month3 = 0;
  filled.rows[2].disclosed = true;
  assert.equal(readPayneQcew(filled), null);
  const halfFilled = structuredClone(frozen);
  halfFilled.rows[3].month3 = 0;
  assert.equal(readPayneQcew(halfFilled), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneQcew(relabeled), null);
  const redated = structuredClone(frozen);
  redated.year = 2024;
  assert.equal(readPayneQcew(redated), null);
  const wrongQtr = structuredClone(frozen);
  wrongQtr.qtr = 2;
  assert.equal(readPayneQcew(wrongQtr), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readPayneQcew(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ ownCode: "5", industryCode: "211", month1: 100, month2: 100, month3: 100, disclosed: true });
  assert.equal(readPayneQcew(invented), null);
  assert.equal(readPayneQcew(null), null);
  assert.equal(marchEmployment(null, "0", "10"), null);
  assert.equal(marchEmployment(readPayneQcew(frozen), "5", "999"), null);
});
