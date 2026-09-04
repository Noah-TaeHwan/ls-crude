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
/** 홈 라우트 소스. */
const homePath = path.join(appRoot, "app/routes/home.tsx");
/** 게이지 컴포넌트 소스. */
const gaugePath = path.join(appRoot, "app/components/watch-gauge.tsx");

test("sample DEFCON score ignores the live market percentile", () => {
  assert.equal(SAMPLE_DEFCON_SCORE, 58);
  assert.equal(SAMPLE_DEFCON_BAND, "DEFCON 3");
  assert.equal(SAMPLE_DEFCON_TITLE, "원유 DEFCON");
  assert.equal(sampleDefconScore(73), 58);
  assert.equal(sampleDefconScore(0), 58);
  assert.equal(sampleDefconScore(null), 58);
  assert.equal(sampleDefconScore(), 58);
});

test("home wires the sample score and keeps PASS_COUNT at zero", async () => {
  const home = await readFile(homePath, "utf8");
  const gauge = await readFile(gaugePath, "utf8");

  assert.equal([...home.matchAll(/<WatchGauge\b/g)].length, 1);
  assert.match(home, /const PASS_COUNT = 0;/);
  assert.match(home, /sampleDefconScore\(/);

  const gaugeCall = home.match(/<WatchGauge[\s\S]*?\/>/);
  assert.ok(gaugeCall, "home must render one WatchGauge");
  assert.match(gaugeCall[0], /score=\{sampleDefconScore\(/);
  assert.doesNotMatch(gaugeCall[0], /score=\{snapshot\?\.volatility\.rv5ReferencePercentile/);
  assert.doesNotMatch(gaugeCall[0], /\brv5=/);

  assert.match(gauge, /isExample/);
  assert.match(gauge, /예시/);
  assert.doesNotMatch(gauge, /WTI 변동성/);
  assert.doesNotMatch(gauge, /volatilityBand\(/);
});
