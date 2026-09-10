import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { nhtsaCrashesInYear, nhtsaCrashesOn, readCushingNhtsa } from "../app/lib/cushing-nhtsa.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091NHTSAZ/cushing_nhtsa_crashes.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091NHTSAZ/cushing_nhtsa_crashes.csv", base), "utf8");

const ROW_COUNT = 129;
const FIRST_DATE = "1993-01-27";
const LAST_DATE = "2025-10-06";

test("cushing nhtsa keeps dated filed-city crash list, not busy", () => {
  const series = readCushingNhtsa(frozen);
  assert.equal(series.runId, "20260910T091NHTSAZ");
  assert.equal(series.source, "aayw-vxb3");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].crashDate, FIRST_DATE);
  assert.equal(series.rows[0].reportNumber, "OK083606125A");
  assert.equal(series.rows[128].crashDate, LAST_DATE);
  assert.equal(series.rows[128].reportNumber, "OK2510004329");
  let fatalities = 0;
  let injuries = 0;
  for (const row of series.rows) {
    assert.match(row.crashDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.reportNumber.length > 0);
    fatalities += row.fatalities;
    injuries += row.injuries;
  }
  assert.equal(fatalities, 5);
  assert.equal(injuries, 99);
  // 연간 건수: 결측 연도는 채우지 않고 세기만 한다.
  assert.equal(nhtsaCrashesInYear(series, 2014), 17);
  assert.equal(nhtsaCrashesInYear(series, 2013), 16);
  assert.equal(nhtsaCrashesInYear(series, 2004), 0);
  // 2025-08-10은 하루 두 건; 조회는 둘 다 돌려준다.
  assert.deepEqual(
    nhtsaCrashesOn(series, "2025-08-10").map((r) => r.reportNumber),
    ["OK2508002203", "OK2508002204"],
  );
  assert.deepEqual(nhtsaCrashesOn(series, "2004-06-01"), []);
});

test("cushing nhtsa csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "crash_date,report_number,county_code,fatalities,injuries");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingNhtsa(frozen);
  for (const line of lines.slice(1)) {
    const [crashDate, reportNumber, countyCode, fatalities, injuries] = line.split(",");
    const rows = nhtsaCrashesOn(series, crashDate);
    const row = rows.find((r) => r.reportNumber === reportNumber);
    assert.ok(row);
    assert.equal(row.countyCode, countyCode);
    assert.equal(row.fatalities, Number(fatalities));
    assert.equal(row.injuries, Number(injuries));
  }
});

test("cushing nhtsa fails closed on damage", () => {
  assert.ok(readCushingNhtsa(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingNhtsa(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[128].crashDate = "2025-10-05";
  // 마지막 행 날짜를 바꾸면 고정값이 깨진다.
  assert.equal(readCushingNhtsa(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[20].fatalities = 1;
  assert.equal(readCushingNhtsa(filled), null);
  const edited = structuredClone(frozen);
  edited.rows[15].countyCode = "119";
  assert.equal(readCushingNhtsa(edited), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingNhtsa(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.source = "aayw-vxb3-OK";
  assert.equal(readCushingNhtsa(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingNhtsa(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    crashDate: "2026-01-05",
    reportNumber: "OK2601000001",
    countyCode: "119",
    fatalities: 0,
    injuries: 0,
  });
  assert.equal(readCushingNhtsa(invented), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[10].crashDate = "1/12/2000";
  assert.equal(readCushingNhtsa(reportDated), null);
  assert.equal(readCushingNhtsa(null), null);
  assert.deepEqual(nhtsaCrashesOn(null, "2025-08-10"), []);
  assert.equal(nhtsaCrashesInYear(null, 2014), 0);
  assert.deepEqual(nhtsaCrashesOn(readCushingNhtsa(frozen), "1999-01-01"), []);
});
