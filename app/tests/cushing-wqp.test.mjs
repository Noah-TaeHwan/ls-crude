import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingWqp, wqpSamplesOn } from "../app/lib/cushing-wqp.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091WQPZ/cushing_wqp_ph.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091WQPZ/cushing_wqp_ph.csv", base), "utf8");

const ROW_COUNT = 366;
const FIRST_DATE = "2005-09-01";
const LAST_DATE = "2021-09-17";
const DISTINCT_DATES = 283;
const HUNDREDTHS_SUM = 297220;

test("cushing wqp keeps dated ambient ph samples, not flow or inspections", () => {
  const series = readCushingWqp(frozen);
  assert.equal(series.runId, "20260910T091WQPZ");
  assert.equal(series.siteId, "IOWATROK_WQX-SND1");
  assert.equal(series.characteristic, "pH");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].date, FIRST_DATE);
  assert.equal(series.rows[ROW_COUNT - 1].date, LAST_DATE);
  let hundSum = 0;
  const dates = new Set();
  let qc = 0;
  for (const row of series.rows) {
    assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.activityId.length > 0);
    assert.match(row.activityType, /Msr\/Obs$/);
    assert.ok(row.ph >= 0 && row.ph <= 14);
    assert.equal(row.status, "Final");
    if (row.activityType !== "Field Msr/Obs") qc += 1;
    dates.add(row.date);
    hundSum += Math.round(row.ph * 100);
  }
  assert.equal(dates.size, DISTINCT_DATES);
  assert.equal(hundSum, HUNDREDTHS_SUM);
  assert.equal(qc, 14);
  // 제출된 0.0을 버리거나 채우지 않는다.
  const zero = series.rows.filter((r) => r.ph === 0);
  assert.equal(zero.length, 1);
  assert.equal(zero[0].date, "2009-05-05");
  // 하루 여러 제출 행을 그대로 둔다.
  assert.equal(wqpSamplesOn(series, "2011-01-27").length, 3);
  assert.deepEqual(wqpSamplesOn(series, "2020-06-15"), []);
});

test("cushing wqp csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "sample_date,sample_time,activity_id,activity_type,characteristic,unit,value,status",
  );
  assert.equal(lines.length - 1, ROW_COUNT);
  assert.equal(frozen.rows.length, ROW_COUNT);
  lines.slice(1).forEach((line, i) => {
    const [date, time, activityId, activityType, characteristic, unit, value, status] = line.split(",");
    const row = frozen.rows[i];
    assert.equal(row.date, date);
    assert.equal(row.time ?? "", time);
    assert.equal(row.activityId, activityId);
    assert.equal(row.activityType, activityType);
    assert.equal(characteristic, "pH");
    assert.equal(unit, "None");
    assert.equal(Number(value), row.ph);
    assert.equal(row.status, status);
  });
});

test("cushing wqp rejects statewide relabel and filled periods", () => {
  const relabeled = { ...frozen, siteId: "USGS-07161450" };
  assert.equal(readCushingWqp(relabeled), null);
  const filled = {
    ...frozen,
    rows: [...frozen.rows, { date: "2021-09-18", time: null, activityId: "X", activityType: "Field Msr/Obs", ph: 0, status: "Final" }],
  };
  assert.equal(readCushingWqp(filled), null);
  const redated = {
    ...frozen,
    rows: frozen.rows.map((r) => (r.date === FIRST_DATE ? { ...r, date: "2005-09-02" } : r)),
  };
  assert.equal(readCushingWqp(redated), null);
});
