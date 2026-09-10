import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { periodWorkingStorage, readCushingWorkingStorage } from "../app/lib/cushing-working-storage.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091CAPZ/cushing_working_storage_capacity.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091CAPZ/cushing_working_storage_capacity.csv", base), "utf8");

const WORK_SUM = 1642412;
const FIRST_PERIOD = "2011-03-31";
const LAST_PERIOD = "2024-03-01";

test("cushing working storage keeps dated tank capacity, not stocks", () => {
  const series = readCushingWorkingStorage(frozen);
  assert.equal(series.runId, "20260910T091CAPZ");
  assert.equal(series.unit, "thousand barrels (EIA printed unit)");
  assert.equal(series.rows.length, 23);
  assert.equal(series.rows[0].period, FIRST_PERIOD);
  assert.equal(series.rows[0].workingStorageKbbl, 48001);
  assert.equal(series.rows[22].period, LAST_PERIOD);
  assert.equal(series.rows[22].workingStorageKbbl, 78410);
  let sum = 0;
  for (const row of series.rows) {
    assert.match(row.period, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isSafeInteger(row.workingStorageKbbl) && row.workingStorageKbbl > 0);
    assert.ok(Number.isSafeInteger(row.shellKbbl) && row.shellKbbl >= row.workingStorageKbbl);
    sum += row.workingStorageKbbl;
  }
  assert.equal(sum, WORK_SUM);
  // Latest capacity point is far above the weekly stocks level (~22,508 kbbl):
  // this series is tank room, not oil on the board.
  assert.ok(series.rows[22].workingStorageKbbl > 70000);
  assert.deepEqual(periodWorkingStorage(series, LAST_PERIOD), {
    period: LAST_PERIOD,
    workingStorageKbbl: 78410,
    shellKbbl: 97742,
  });
  assert.equal(periodWorkingStorage(series, "2026-08-28"), null);
});

test("cushing working storage csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "period,working_storage_kbbl,shell_kbbl");
  assert.equal(lines.length, 24);
  const series = readCushingWorkingStorage(frozen);
  for (const line of lines.slice(1)) {
    const [period, working, shell] = line.split(",");
    const row = periodWorkingStorage(series, period);
    assert.ok(row);
    assert.equal(row.workingStorageKbbl, Number(working));
    assert.equal(row.shellKbbl, Number(shell));
  }
});

test("cushing working storage fails closed on damage", () => {
  assert.ok(readCushingWorkingStorage(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingWorkingStorage(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[22].period = "2024-03-31";
  // Workbook prints 2024-03-01; normalizing to month-end breaks the freeze.
  assert.equal(readCushingWorkingStorage(redated), null);
  const filled = structuredClone(frozen);
  filled.rows.push({ period: "2024-09-30", workingStorageKbbl: 0, shellKbbl: 0 });
  assert.equal(readCushingWorkingStorage(filled), null);
  const relabeled = structuredClone(frozen);
  relabeled.rows[22].workingStorageKbbl = 22508;
  // Weekly stocks level relabeled as capacity is rejected.
  assert.equal(readCushingWorkingStorage(relabeled), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingWorkingStorage(dropped), null);
  const unitChanged = structuredClone(frozen);
  unitChanged.unit = "million barrels";
  assert.equal(readCushingWorkingStorage(unitChanged), null);
  assert.equal(readCushingWorkingStorage(null), null);
  assert.equal(periodWorkingStorage(null, LAST_PERIOD), null);
  assert.equal(periodWorkingStorage(readCushingWorkingStorage(frozen), "1999-01-01"), null);
});
