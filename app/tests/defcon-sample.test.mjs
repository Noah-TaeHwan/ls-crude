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
});
