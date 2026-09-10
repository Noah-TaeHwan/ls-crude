import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { datedCushingEvents, readCushingNews } from "../app/lib/cushing-news.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260909T091ZBOARDZ/events.json", base), "utf8"),
);
const frozenReceipt = JSON.parse(
  await readFile(new URL("20260909T091ZBOARDZ/receipt.json", base), "utf8"),
);

test("cushing news keeps the single dated industry cue", async () => {
  const slice = readCushingNews(frozen);
  assert.equal(slice.runId, "20260909T091ZBOARDZ");
  assert.equal(slice.auditedRows, 79);
  assert.equal(slice.events.length, 1);
  const [event] = datedCushingEvents(slice);
  assert.equal(event.publishedAt, "2026-09-07T15:59:45+00:00");
  assert.equal(
    event.title,
    "South Bow, Bridger to Develop New Oil Pipeline From Wyoming to Cushing, Oklahoma - EnergyNow",
  );
  assert.equal(event.source, "Google News RSS");
  assert.equal(event.lanes, "physical");
  assert.equal(event.matchedTerms, "pipeline");
  const raw = await readFile(new URL("20260909T091ZBOARDZ/events.json", base));
  assert.equal(createHash("sha256").update(raw).digest("hex"), frozenReceipt.eventsJsonSha256);
});

test("cushing news fails closed on damage", () => {
  const invented = structuredClone(frozen);
  invented.events.push({
    publishedAt: "2026-09-08T00:00:00+00:00",
    title: "Invented Cushing pipeline cue",
    source: "Google News RSS",
    url: "https://example.com/invented",
    lanes: "physical",
    matchedTerms: "pipeline",
  });
  assert.equal(readCushingNews(invented), null);
  const nonCue = structuredClone(frozen);
  nonCue.events.push({
    publishedAt: "2026-09-07T16:05:12+00:00",
    title: "US Crude and Gasoline Inventories Fell Last week",
    source: "Google News RSS",
    url: "https://example.com/market-context",
    lanes: "market_context",
    matchedTerms: "crude",
  });
  assert.equal(readCushingNews(nonCue), null);
  const swapped = structuredClone(frozen);
  swapped.events[0].publishedAt = "2026-09-08T00:08:19+00:00";
  assert.equal(readCushingNews(swapped), null);
  const retitled = structuredClone(frozen);
  retitled.events[0].title = "South Bow pipeline to somewhere else";
  assert.equal(readCushingNews(retitled), null);
  const undated = structuredClone(frozen);
  undated.events[0].publishedAt = "";
  assert.equal(readCushingNews(undated), null);
  const emptied = structuredClone(frozen);
  emptied.events = [];
  assert.equal(readCushingNews(emptied), null);
  const wrongAudit = structuredClone(frozen);
  wrongAudit.auditedRows = 78;
  assert.equal(readCushingNews(wrongAudit), null);
  const wrongRun = structuredClone(frozen);
  wrongRun.runId = "20260908T091ZNEWSZ";
  assert.equal(readCushingNews(wrongRun), null);
  assert.equal(readCushingNews(null), null);
  assert.equal(datedCushingEvents(null), null);
});
