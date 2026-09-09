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

/**
 * 유효한 일봉 응답을 만들고 각 검사에서 경계값만 변경한다.
 * @param dates 공급자 일봉 시각 목록.
 * @returns 검증용 Yahoo 응답.
 */
function dailyBody(dates = ["2026-09-04T13:00:00Z", "2026-09-08T02:50:00Z"]) {
  return { chart: { error: null, result: [{ meta: { symbol: "CL=F", currency: "USD", instrumentType: "FUTURE", dataGranularity: "1d", regularMarketPrice: 999 }, timestamp: dates.map((date) => Date.parse(date) / 1000), indicators: { quote: [{ open: dates.map(() => 90), high: dates.map(() => 95), low: dates.map(() => 89), close: dates.map(() => 92), volume: dates.map(() => 0) }] } }] } };
}

test("daily WTI preserves actual latest provisional OHLC and rejects invalid identity, dates and prices", async () => {
  const { parseWtiDaily } = await import("../app/lib/wti-daily.ts");
  const now = new Date("2026-09-08T03:00:00Z");
  const parsed = parseWtiDaily(dailyBody(), now);
  assert.equal(parsed.bars.at(-1).date, "2026-09-07");
  assert.equal(parsed.bars.at(-1).close, 92);
  assert.equal(parsed.observedAt, "2026-09-08T02:50:00.000Z");
  assert.equal(parsed.partialLast, true);
  assert.equal(parsed.missingCount, 0);
  const missing = dailyBody();
  missing.chart.result[0].indicators.quote[0].close[1] = null;
  const omitted = parseWtiDaily(missing, now);
  assert.equal(omitted.bars.length, 1);
  assert.equal(omitted.missingCount, 1);
  assert.equal(omitted.observedAt, parsed.bars[0].sourceAt);
  assert.match(omitted.note, /1개/);
  for (const price of [-37, 0, 92]) {
    const flat = dailyBody();
    for (const key of ["open", "high", "low", "close"]) flat.chart.result[0].indicators.quote[0][key].fill(price);
    assert.equal(parseWtiDaily(flat, now).bars.at(-1).close, price);
  }
  for (const mutate of [
    (r) => { r.meta.symbol = "BZ=F"; }, (r) => { r.meta.currency = "EUR"; },
    (r) => { r.meta.instrumentType = "EQUITY"; }, (r) => { r.meta.dataGranularity = "5m"; },
    (r) => { r.timestamp.reverse(); }, (r) => { r.timestamp[1] = r.timestamp[0]; },
    (r) => { r.timestamp[1] = r.timestamp[0] + 3600; },
    (r) => { r.timestamp[1] = now.getTime() / 1000 + 1; },
    (r) => { r.indicators.quote[0].close.pop(); },
    (r) => { r.indicators.quote[0].close[0] = "92"; },
    (r) => { r.indicators.quote[0].high[0] = Infinity; },
    (r) => { r.indicators.quote[0].high[0] = 89; },
    (r) => { r.indicators.quote[0].low[0] = 91; },
    (r) => { r.indicators.quote[0].volume[0] = -1; },
    (r) => { r.indicators.quote[0].close.fill(null); },
  ]) {
    const bad = dailyBody(); mutate(bad.chart.result[0]);
    assert.throws(() => parseWtiDaily(bad, now));
  }
  for (const bad of [null, {}, { chart: { error: "failed" } }]) assert.throws(() => parseWtiDaily(bad, now));
});

test("all seven daily ranges keep latest actual bar and clamp calendar month/year boundaries", async () => {
  const { DAILY_RANGES, filterDailyBars } = await import("../app/lib/wti-daily.ts");
  const dates = ["2019-03-30", "2019-03-31", "2021-03-31", "2023-03-31", "2023-09-30", "2023-12-31", "2024-02-28", "2024-02-29", "2024-03-23", "2024-03-24", "2024-03-31"];
  const bars = dates.map((date) => ({ date }));
  const starts = ["2019-03-31", "2021-03-31", "2023-03-31", "2023-09-30", "2023-12-31", "2024-02-29", "2024-03-24"];
  DAILY_RANGES.forEach((range, i) => {
    const selected = filterDailyBars(bars, range);
    assert.equal(selected[0].date, starts[i]);
    assert.equal(selected.at(-1), bars.at(-1));
  });
  assert.equal(filterDailyBars([{ date: "2023-02-27" }, { date: "2023-02-28" }, { date: "2024-02-29" }], "1y")[0].date, "2023-02-28");
  assert.deepEqual(filterDailyBars([], "1wk"), []);
  assert.throws(() => filterDailyBars(bars, "5m"));
});

test("daily fetch caches whole snapshots and preserves their times on network or malformed response", async () => {
  const { readWtiDaily } = await import("../app/lib/wti-daily.server.ts");
  const now = new Date("2026-09-08T03:00:00Z");
  const fail = async () => { throw new Error("network down"); };
  assert.equal((await readWtiDaily(fail, now)).data, null);
  let requests = 0;
  const fetcher = async (url) => { requests++; assert.match(url, /interval=1d&range=5y/); return Response.json(dailyBody()); };
  const good = await readWtiDaily(fetcher, now);
  assert.equal(good.data.bars.length, 2);
  await readWtiDaily(fetcher, new Date(now.getTime() + 30000));
  assert.equal(requests, 1);
  const failed = await readWtiDaily(fail, new Date(now.getTime() + 61000));
  assert.deepEqual(failed.data, good.data);
  assert.match(failed.error, /실패/);
  const malformed = await readWtiDaily(async () => Response.json({ chart: { result: [{ meta: { regularMarketPrice: 123 } }] } }), new Date(now.getTime() + 62000));
  assert.deepEqual(malformed.data, good.data);
  assert.match(malformed.error, /실패/);
  const older = dailyBody();
  older.chart.result[0].timestamp.pop();
  for (const values of Object.values(older.chart.result[0].indicators.quote[0])) values.pop();
  const regressed = await readWtiDaily(async () => Response.json(older), new Date(now.getTime() + 63000));
  assert.deepEqual(regressed.data, good.data);
  assert.match(regressed.error, /실패/);
});

// 실제 Yahoo 응답의 최소 3행 재현. 운영 데이터 대체물이 아니다.
test("ambiguous Yahoo live tail is isolated without merging or relabeling daily OHLC", async () => {
  const { parseWtiDaily }=await import("../app/lib/wti-daily.ts");
  const fixture=JSON.parse(await readFile(path.join(appRoot,"tests/fixtures/yahoo-duplicate-tail.json"),"utf8"));
  const now=new Date(fixture.retrievedAt);
  const result=parseWtiDaily(fixture.body,now);
  const prefix=structuredClone(fixture.body);prefix.chart.result[0].timestamp.pop();
  for(const values of Object.values(prefix.chart.result[0].indicators.quote[0]))values.pop();
  assert.deepEqual(result.bars,parseWtiDaily(prefix,now).bars);
  assert.equal(result.bars.length,2);
  assert.equal(result.bars.at(-1).date,"2026-09-08");
  assert.equal(result.bars.at(-1).close,93.02999877929688);
  assert.equal(result.bars.at(-1).volume,0);
  assert.equal(result.observedAt,"2026-09-08T04:00:00.000Z");
  assert.equal(result.excludedTail.sourceAt,"2026-09-09T02:10:05.000Z");
  assert.equal(result.missingCount,0);
  assert.match(result.note,/최신 실시간 가격을 보장하지 않습니다/);
  const missing=structuredClone(fixture.body);missing.chart.result[0].indicators.quote[0].close[0]=null;
  assert.equal(parseWtiDaily(missing,now).missingCount,1);
  assert.equal(parseWtiDaily(missing,now).bars.length,1);
  for(const mutate of [
    r=>{delete r.meta.regularMarketTime;},r=>{r.meta.regularMarketTime--;},
    r=>{r.meta.exchangeTimezoneName="UTC";},r=>{r.timestamp[1]+=3600;},
    r=>{r.timestamp[2]=r.timestamp[1];},r=>{r.timestamp[2]=now.getTime()/1000+1;},
    r=>{r.indicators.quote[0].high[2]=1;},r=>{r.indicators.quote[0].close[2]=null;},
    r=>{r.indicators.quote[0].close[1]=null;},
    r=>{r.indicators.quote[0].volume[2]=-1;},r=>{r.indicators.quote[0].open[2]="94";},
    r=>{r.timestamp[0]=r.timestamp[1];r.timestamp[1]+=3600;},
  ]) {const bad=structuredClone(fixture.body);mutate(bad.chart.result[0]);assert.throws(()=>parseWtiDaily(bad,now));}
  const middle=structuredClone(fixture.body), r=middle.chart.result[0];
  r.timestamp.push(r.timestamp.at(-1)+3600);for(const values of Object.values(r.indicators.quote[0]))values.push(values.at(-1));r.meta.regularMarketTime=r.timestamp.at(-1);
  assert.throws(()=>parseWtiDaily(middle,new Date(now.getTime()+7200000)));
  // 겨울 뉴욕 자정은 UTC05:00이다. 고정 UTC 오프셋을 사용하지 않는다.
  const winter=structuredClone(fixture.body), w=winter.chart.result[0];
  w.timestamp=[Date.parse("2026-01-05T05:00Z")/1000,Date.parse("2026-01-06T05:00Z")/1000,Date.parse("2026-01-07T02:00Z")/1000];w.meta.regularMarketTime=w.timestamp.at(-1);
  assert.equal(parseWtiDaily(winter,new Date("2026-01-07T03:00Z")).bars.at(-1).date,"2026-01-06");
  for(const price of [-37,0]){const copy=structuredClone(fixture.body);for(const field of ["open","high","low","close"])copy.chart.result[0].indicators.quote[0][field].fill(price);assert.equal(parseWtiDaily(copy,now).bars.at(-1).close,price);}
});
