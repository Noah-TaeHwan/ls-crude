import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

import { EMPTIES_RUN, readEmpties } from "../app/lib/empties.ts";

/** 저장소 루트 경로. */
const repoRoot = path.resolve(import.meta.dirname, "../..");
/** 동결 표시 원본 경로. */
const displayPath = path.join(repoRoot, "research/indexes/ALT-20260907-02/20260909T003314Z/display.json");

test("empties accepts the frozen 138-month panel and rejects damaged copies", async () => {
  const display = JSON.parse(await readFile(displayPath, "utf8"));
  const points = readEmpties(display);
  assert.ok(points);
  assert.equal(points.length, EMPTIES_RUN.months);
  assert.equal(points[0].month, "2015-01");
  assert.equal(points.at(-1).month, "2026-07");
  assert.deepEqual(
    points.map((row) => row.month).filter((month, index, all) => index && all[index - 1] >= month),
    [],
  );
  const months = points.map((row) => row.month);
  assert.ok(!months.includes("2020-11"));
  assert.ok(months.includes("2020-10") && months.includes("2020-12"));
  assert.equal(display.points.length, new Set(months).size);
});

test("empties fails closed on wrong vintage, gaps, and bad arithmetic", async () => {
  const display = JSON.parse(await readFile(displayPath, "utf8"));
  assert.equal(readEmpties({ ...display, runId: "20200101T000000Z" }), null);
  assert.equal(readEmpties({ ...display, points: display.points.slice(1) }), null);
  assert.equal(readEmpties({ ...display, points: [...display.points, display.points.at(-1)] }), null);
  const swapped = structuredClone(display);
  swapped.points[10] = { ...swapped.points[10], loadedExports: swapped.points[10].emptyExports, emptyExports: swapped.points[10].loadedExports };
  assert.equal(readEmpties(swapped), null);
  const damaged = structuredClone(display);
  damaged.points[20] = { ...damaged.points[20], totalExports: "0.00" };
  assert.equal(readEmpties(damaged), null);
  const dustShift = structuredClone(display);
  const july2020 = dustShift.points.findIndex((row) => row.month === "2020-07");
  dustShift.points[july2020] = { ...dustShift.points[july2020], totalExports: "399192.46" };
  assert.equal(readEmpties(dustShift), null);
  const cleanShift = structuredClone(display);
  const jan2019 = cleanShift.points.findIndex((row) => row.month === "2019-01");
  cleanShift.points[jan2019] = { ...cleanShift.points[jan2019], totalExports: "999999.99" };
  assert.equal(readEmpties(cleanShift), null);
  const importShift = structuredClone(display);
  const feb2020 = importShift.points.findIndex((row) => row.month === "2020-02");
  importShift.points[feb2020] = { ...importShift.points[feb2020], totalImports: "0.00" };
  assert.equal(readEmpties(importShift), null);
  const grandShift = structuredClone(display);
  const mar2021 = grandShift.points.findIndex((row) => row.month === "2021-03");
  grandShift.points[mar2021] = { ...grandShift.points[mar2021], totalTeus: "1.00" };
  assert.equal(readEmpties(grandShift), null);
  assert.equal(readEmpties(null), null);
  assert.equal(readEmpties({}), null);
});
