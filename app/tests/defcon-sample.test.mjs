import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

import {
  SAMPLE_DEFCON_BAND,
  SAMPLE_DEFCON_SCORE,
  SAMPLE_DEFCON_TITLE,
  sampleDefconScore,
} from "../app/lib/defcon-sample.ts";

/** 앱 패키지 루트 경로. */
const appRoot = path.resolve(import.meta.dirname, "..");

test("sample DEFCON score ignores the live market percentile", () => {
  assert.equal(SAMPLE_DEFCON_SCORE, 58);
  assert.equal(SAMPLE_DEFCON_BAND, "DEFCON 3");
  assert.equal(SAMPLE_DEFCON_TITLE, "원유 DEFCON");
  assert.equal(sampleDefconScore(73), 58);
  assert.equal(sampleDefconScore(0), 58);
  assert.equal(sampleDefconScore(null), 58);
  assert.equal(sampleDefconScore(), 58);
});

test("research inventory joins every score to its source and rejects partial tables", async () => {
  const { parseResearchLedger } = await import("../app/lib/research-ledger.ts");
  const markdown = await readFile(path.join(appRoot, "../research/factors/README.md"), "utf8");
  const ledger = parseResearchLedger(markdown);
  assert.ok(ledger.records.length >= 62);
  assert.equal(ledger.passCount, 0);
  assert.equal(ledger.records.find((row) => row.id === "001").group, "미검증");
  assert.equal(ledger.records.find((row) => row.id === "009").group, "기각");
  assert.equal(ledger.records.find((row) => row.id === "018").group, "보류");
  assert.equal(ledger.records.find((row) => row.id === "062").inSample, "—");
  assert.equal(new Set(ledger.records.map((row) => row.id)).size, ledger.records.length);
  for (const row of ledger.records) {
    assert.match(row.sourceHref, /^https:\/\/github.com\/Noah-TaeHwan\/ls-crude\/blob\/main\/research\/factors\/\d{3}-[a-z0-9-]+\/README\.md$/);
  }
  assert.throws(() => parseResearchLedger(""));
  assert.throws(() => parseResearchLedger(markdown.replace(/\| 018 \| \[.*\n/, "")));
  assert.throws(() => parseResearchLedger(markdown.replace("018-refinery-thermal-flare/README.md", "https://untrusted.invalid")));
  const linkedScore = markdown.replace(/^(\| 018 \| )([^|]+)( \|)/m,
    "$1[$2](018-refinery-thermal-flare/README.md)$3");
  assert.deepEqual(parseResearchLedger(linkedScore), ledger);
  assert.deepEqual(parseResearchLedger(markdown.replace(/\n/g, "\r\n")), ledger);
  assert.throws(() => parseResearchLedger(`${markdown}\n## 라이브 상관관계 스코어보드\n`));
});

test("intake joins all CSV rows to cards and fails closed on damaged or inconsistent records", async () => {
  const { readdir } = await import("node:fs/promises");
  const { parseResearchIntake } = await import("../app/lib/research-intake.ts");
  const root = path.join(appRoot, "../research/candidates");
  const csv = await readFile(path.join(root, "ledger.csv"), "utf8");
  const cards = Object.fromEntries(await Promise.all((await readdir(root)).filter((file) => /^ALT-.*\.md$/.test(file)).map(async (file) => [`research/candidates/${file}`, await readFile(path.join(root, file), "utf8")])));
  const records = parseResearchIntake(csv, cards);
  assert.equal(records.length, Object.keys(cards).length);
  assert.ok(records.length >= 50);
  const road = records.find(({ fields }) => fields.candidate_id === "ALT-20260908-02");
  assert.equal(road.fields.collection_status, "BLOCKED");
  assert.equal(road.fields.test_status, "NOT_RUN");
  assert.match(road.fields.coverage, /미보존/);
  assert.ok(road.notes.some((href) => href.endsWith("2026-09-08-cushing-live-intake-run01.md")));
  assert.deepEqual(parseResearchIntake(csv.replace(/\n/g, "\r\n"), cards), records);
  assert.throws(() => parseResearchIntake(csv + csv.split("\n")[1] + "\n", cards));
  assert.throws(() => parseResearchIntake(csv.replace("public", "wrong"), cards));
  assert.throws(() => parseResearchIntake(csv.replace("ALT-20260907-01", "ALT-20260230-00"), cards));
  assert.throws(() => parseResearchIntake(csv + '"unclosed', cards));
  assert.throws(() => parseResearchIntake(csv, {}));
  const changed = { ...cards, [road.fields.record_path]: cards[road.fields.record_path].replace("| test_status | NOT_RUN |", "| test_status | RUN |") };
  assert.throws(() => parseResearchIntake(csv, changed));
  assert.throws(() => parseResearchIntake(csv.split("\n").slice(0, -2).join("\n"), cards));
  const example = 'ALT-20260909-01';
  const fields = { candidate_id: example, name: '쉼표, "인용"', thesis: "가설", availability: "public", collection_status: "NOT_STARTED", test_status: "NOT_RUN", evidence_level: "E4", decision: "PARK", decision_reason: "이유", next_action: "확인", owner: "오태환", next_review_date: "2026-09-15", record_path: `research/candidates/${example}.md` };
  const row = Object.values(fields).map((value) => `"${value.replaceAll('"', '""')}"`).join(",");
  const card = Object.entries(fields).filter(([key]) => key !== "record_path").map(([key, value]) => `| ${key} | ${value} |`).join("\n");
  assert.equal(parseResearchIntake(`${Object.keys(fields).join(",")}\n${row}\n`, { [fields.record_path]: card })[0].fields.name, fields.name);
});

test("latest WTI quote validates identity/time and preserves last good quote on failure", async () => {
  const { parseWtiQuote, readWtiQuote } = await import("../app/lib/wti-quote.server.ts");
  const now = new Date("2026-09-08T03:00:00Z");
  const meta = { symbol: "CL=F", currency: "USD", instrumentType: "FUTURE", regularMarketPrice: 92.5, regularMarketTime: Date.parse("2026-09-08T02:50:00Z") / 1000 };
  const body = (m) => ({ chart: { result: [{ meta: m }], error: null } });
  assert.equal(parseWtiQuote(body({ ...meta, regularMarketPrice: -37 }), now).price, -37);
  for (const value of [null, {}, body({ ...meta, symbol: "BZ=F" }), body({ ...meta, currency: "EUR" }), body({ ...meta, regularMarketPrice: NaN }), body({ ...meta, regularMarketTime: now.getTime() / 1000 + 120 })]) assert.throws(() => parseWtiQuote(value, now));
  const fail = async () => { throw new Error("network down"); };
  assert.deepEqual((await readWtiQuote(fail, now)).quote, null);
  let requests = 0;
  const fetcher = async () => { requests++; return new Response(JSON.stringify(body(meta))); };
  const good = await readWtiQuote(fetcher, now);
  assert.equal(good.quote.price, 92.5);
  assert.equal(good.quote.observedAt, "2026-09-08T02:50:00.000Z");
  await readWtiQuote(fetcher, new Date(now.getTime() + 30000));
  assert.equal(requests, 1);
  const failed = await readWtiQuote(fail, new Date(now.getTime() + 61000));
  assert.deepEqual(failed.quote, good.quote);
  assert.match(failed.error, /실패/);
});
