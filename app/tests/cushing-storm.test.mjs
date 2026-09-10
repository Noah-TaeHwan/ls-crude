import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingStorm, stormEventsOn } from "../app/lib/cushing-storm.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091STMZ/cushing_storm_events.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091STMZ/cushing_storm_events.csv", base), "utf8");

const ROW_COUNT = 112;
const FIRST_DATE = "2024-01-13";
const LAST_DATE = "2026-05-08";

test("cushing storm keeps dated payne county event list, not busy", () => {
  const series = readCushingStorm(frozen);
  assert.equal(series.runId, "20260910T091STMZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].beginDate, FIRST_DATE);
  assert.equal(series.rows[0].eventId, "1150786");
  assert.equal(series.rows[ROW_COUNT - 1].beginDate, LAST_DATE);
  let injuries = 0;
  let deaths = 0;
  let magnitudeDisclosed = 0;
  let cushing = 0;
  for (const row of series.rows) {
    assert.match(row.beginDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.eventId.length > 0);
    assert.ok(row.eventType.length > 0);
    assert.ok(row.source.length > 0);
    injuries += row.injuriesDirect + row.injuriesIndirect;
    deaths += row.deathsDirect + row.deathsIndirect;
    if (row.magnitude !== null) magnitudeDisclosed += 1;
    if (row.beginLocation.includes("CUSHING") || row.endLocation.includes("CUSHING")) cushing += 1;
  }
  assert.equal(injuries, 10);
  assert.equal(deaths, 0);
  assert.equal(magnitudeDisclosed, 44);
  assert.equal(cushing, 3);
  assert.deepEqual(
    stormEventsOn(series, "2025-05-24").map((r) => r.eventId),
    ["1260870", "1260884", "1260885"],
  );
  assert.deepEqual(stormEventsOn(series, "2024-02-01"), []);
});

test("cushing storm csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "begin_date,event_id,episode_id,event_type,begin_date_time,begin_location,end_location,magnitude,magnitude_type,tor_f_scale,injuries_direct,injuries_indirect,deaths_direct,deaths_indirect,damage_property,damage_crops,source,wfo");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingStorm(frozen);
  for (const line of lines.slice(1)) {
    const [beginDate, eventId] = line.split(",");
    const rows = stormEventsOn(series, beginDate);
    assert.ok(rows.some((r) => r.eventId === eventId));
  }
});

test("cushing storm fails closed on damage", () => {
  assert.ok(readCushingStorm(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingStorm(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[ROW_COUNT - 1].beginDate = "2026-05-07";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingStorm(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[5].magnitude = "2.00";
  assert.equal(readCushingStorm(filled), null);
  const edited = structuredClone(frozen);
  edited.rows[9].eventType = "Hail";
  assert.equal(readCushingStorm(edited), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingStorm(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.rows.push({
    beginDate: "2024-06-15",
    eventId: "9999999",
    episodeId: "1",
    eventType: "Hail",
    beginDateTime: "15-JUN-24 12:00:00",
    beginLocation: "OKLAHOMA CITY",
    endLocation: "OKLAHOMA CITY",
    magnitude: "1.00",
    magnitudeType: null,
    torFScale: null,
    injuriesDirect: 0,
    injuriesIndirect: 0,
    deathsDirect: 0,
    deathsIndirect: 0,
    damageProperty: "",
    damageCrops: "",
    source: "Public",
    wfo: "OUN",
  });
  assert.equal(readCushingStorm(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingStorm(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    beginDate: "2023-12-31",
    eventId: "1000000",
    episodeId: "1",
    eventType: "Heat",
    beginDateTime: "31-DEC-23 12:00:00",
    beginLocation: "CUSHING",
    endLocation: "CUSHING",
    magnitude: null,
    magnitudeType: null,
    torFScale: null,
    injuriesDirect: 0,
    injuriesIndirect: 0,
    deathsDirect: 0,
    deathsIndirect: 0,
    damageProperty: "",
    damageCrops: "",
    source: "Public",
    wfo: "OUN",
  });
  assert.equal(readCushingStorm(invented), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[0].beginDate = "01/13/2024";
  assert.equal(readCushingStorm(reportDated), null);
  assert.equal(readCushingStorm(null), null);
  assert.deepEqual(stormEventsOn(null, "2025-05-24"), []);
  assert.deepEqual(stormEventsOn(readCushingStorm(frozen), "1999-01-01"), []);
});
