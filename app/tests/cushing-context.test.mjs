import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingAadt, readCushingBps, readCushingDeq, readCushingStocks } from "../app/lib/cushing-context.ts";
import { parseCushingWeather } from "../app/lib/cushing-weather.ts";
import { readCushingWeather } from "../app/lib/cushing-weather.server.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const stocks = await readFile(new URL("20260909T091EIAZ/cushing_stocks_weekly.csv", base), "utf8");
const bps = await readFile(new URL("20260909T091BOARDZ/bps-cushing-monthly.csv", base), "utf8");
const aadt = JSON.parse(await readFile(new URL("20260909T091BOARDZ/aadt-east-main.json", base), "utf8"));
const deq = JSON.parse(await readFile(new URL("20260909T091BOARDZ/deq-events.json", base), "utf8"));

test("cushing board context keeps stocks, annual traffic and housing units without filling gaps", () => {
  const weekly = readCushingStocks(stocks);
  assert.equal(weekly.length, 1169);
  assert.equal(weekly[0].date, "2004-04-09");
  assert.equal(weekly.at(-1).stockKbbl, 22508);
  assert.equal(weekly.reduce((n, row) => n + row.stockKbbl, 0), 40862385);
  const roads = readCushingAadt(aadt);
  assert.equal(roads.length, 11);
  assert.equal(roads.at(-1).trucks, 291);
  assert.equal(roads.filter((row) => row.trucks === null).length, 10);
  const permits = readCushingBps(bps);
  assert.equal(permits.length, 31);
  assert.equal(permits.reduce((n, row) => n + row.units, 0), 29);
  assert.equal(permits.at(-1).month, "2026-07");
  const events = readCushingDeq(deq);
  assert.equal(events.length, 3);
  assert.equal(events.filter((row) => row.receiptDate).length, 1);
});

test("cushing board context fails closed on swapped rows or invented dates", () => {
  const badStocks = stocks.replace("2026-08-28,22508", "2026-08-28,0");
  assert.equal(readCushingStocks(badStocks), null);
  const badAadt = structuredClone(aadt);
  badAadt.points[0].year = 2014;
  assert.equal(readCushingAadt(badAadt), null);
  const filled = bps.replace("2026-07,0,0,0,0,0\n", "2026-07,0,0,0,0,0\n2026-08,0,0,0,0,0\n");
  assert.equal(readCushingBps(filled), null);
  const badDeq = structuredClone(deq);
  badDeq.events[1].receiptDate = "2025-01-01";
  assert.equal(readCushingDeq(badDeq), null);
  assert.equal(readCushingStocks(null), null);
});

const now = new Date("2026-09-09T08:00:00Z");
const row = {
  icaoId: "KCUH",
  obsTime: Date.parse("2026-09-09T07:55:00Z") / 1000,
  receiptTime: "2026-09-09T07:58:22.993Z",
  reportTime: "2026-09-09T08:00:00.000Z",
  temp: 26.8,
  wspd: 0,
  visib: "10+",
  cover: "CLR",
  rawOb: "METAR KCUH 090755Z AUTO 00000KT 10SM CLR 27/18 A3004 RMK AO2 T02680180",
};

test("cushing weather keeps latest KCUH report and rejects other stations", () => {
  const parsed = parseCushingWeather([row], now);
  assert.equal(parsed.observedAt, "2026-09-09T07:55:00.000Z");
  assert.equal(parsed.visib, "10+");
  assert.equal(parsed.windKt, 0);
  assert.equal(parsed.temperatureC, 26.8);
  assert.throws(() => parseCushingWeather([{ ...row, icaoId: "KGLS" }], now));
  assert.throws(() => parseCushingWeather([{ ...row, rawOb: "METAR KGLS" }], now));
});

test("cushing weather server has no fabricated fallback and preserves last-good", async () => {
  assert.equal((await readCushingWeather(async () => { throw new Error("network"); }, now)).data, null);
  let calls = 0;
  const good = async (url, options) => {
    calls++;
    assert.match(url, /ids=KCUH&format=json$/);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json([row]);
  };
  const saved = await readCushingWeather(good, now);
  assert.equal(saved.data.visib, "10+");
  assert.equal(calls, 1);
  await readCushingWeather(good, now);
  assert.equal(calls, 1);
  const later = new Date("2026-09-09T08:20:00Z");
  const failed = await readCushingWeather(async () => new Response(null, { status: 500 }), later);
  assert.equal(failed.data.observedAt, saved.data.observedAt);
  assert.match(failed.error, /실패/);
});
