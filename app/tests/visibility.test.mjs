import assert from "node:assert/strict";
import { test } from "node:test";
import { parseVisibility, visibilityStatus } from "../app/lib/visibility.ts";
import { readVisibility } from "../app/lib/visibility.server.ts";

const now = new Date("2026-09-08T06:00:00Z");
const row = { icaoId: "KGLS", obsTime: Date.parse("2026-09-08T04:52:00Z") / 1000,
  receiptTime: "2026-09-08T04:56:04.962Z", reportTime: "2026-09-08T05:00:00Z", visib: "10+" };

test("visibility preserves bounds, fractions, nulls and observation order", () => {
  for (const [input, value, relation] of [["10+", 10, "lower_bound"], ["P6SM", 6, "lower_bound"], ["M1/4SM", 0.25, "upper_bound"], ["1 1/2", 1.5, "exact"], [0, 0, "exact"], [null, null, "missing"], ["", null, "missing"]]) {
    const result = parseVisibility([{ ...row, visib: input }], now);
    assert.equal(result.observations[0].value, value);
    assert.equal(result.observations[0].relation, relation);
    assert.equal(result.rejectedCount, 0);
  }
  const earlier = { ...row, obsTime: row.obsTime - 3600 };
  const result = parseVisibility([row, earlier], now);
  assert.equal(result.observations[0].observedAt, new Date(earlier.obsTime * 1000).toISOString());
  assert.equal(result.latestObservedAt, "2026-09-08T04:52:00.000Z");
  // 오래된 관측 시각을 조회 시각으로 바꾸지 않는다. 화면에서 지연을 판단한다.
  const stale = parseVisibility([row], new Date("2026-09-09T06:00:00Z"));
  assert.equal(stale.latestObservedAt, result.latestObservedAt);
  assert.equal(stale.fetchedAt, "2026-09-09T06:00:00.000Z");
});

test("visibility rejects malformed identity, timestamps, values, duplicates and truncated responses", () => {
  const invalidRows = [{ ...row, icaoId: "KHOU" }, { ...row, obsTime: "1788843120" }, { ...row, obsTime: now.getTime() / 1000 + 1 },
    { ...row, receiptTime: "2026-09-09T06:00:00Z" }, { ...row, reportTime: "2026-09-09T06:00:00Z" },
    { ...row, receiptTime: "2026-09-08T04:51:00Z" }, { ...row, reportTime: "2026-02-30T05:00:00Z" },
    { ...row, reportTime: "2026-09-08T05:00:00" }, ...[undefined, true, [], {}, -1, Infinity, NaN, "1/0", "-1", "10++", "1 2", "P6+", "junk"].map(visib => ({ ...row, visib }))];
  for (const bad of invalidRows) assert.throws(() => parseVisibility([bad], now));
  assert.throws(() => parseVisibility([row, { ...row, obsTime: row.obsTime - 60, visib: "junk" }], now));
  assert.throws(() => parseVisibility([row, row], now));
  for (const input of [null, {}, [], Array(400).fill(row)]) assert.throws(() => parseVisibility(input, now));
});

test("visibility server has no fabricated fallback, caches and preserves last-good on failure or regression", async () => {
  const failure = async () => { throw new Error("network"); };
  assert.equal((await readVisibility(failure, now)).data, null);
  assert.equal((await readVisibility(async () => new Response(null, { status: 204 }), now)).data, null);
  let calls = 0;
  const good = async (url, options) => {
    calls++;
    assert.match(url, /ids=KGLS&format=json&hours=24$/);
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.headers["User-Agent"], "ls-crude-observations/1.0");
    return Response.json([row]);
  };
  const saved = await readVisibility(good, now);
  assert.equal(saved.error, null);
  assert.equal((await readVisibility(good, new Date(now.getTime() + 599999))).data, saved.data);
  assert.equal(calls, 1);
  for (const source of [failure, async () => Response.json([]), async () => new Response(null, { status: 429 }), async () => Response.json([{ ...row, obsTime: row.obsTime - 3600 }])]) {
    const result = await readVisibility(source, new Date(now.getTime() + 600000));
    assert.equal(result.data, saved.data);
    assert.equal(result.data.fetchedAt, now.toISOString());
    assert.ok(result.error);
  }
});

// 실측값을 변경하지 않고 시계와 조회 오류만 바꿔 표시 상태를 검증한다.
test("visibility status distinguishes old observations, old fetches, failures and no data", () => {
  const data = parseVisibility([row], now);
  assert.equal(visibilityStatus({ data, error: null }, now.getTime()), "recent");
  assert.equal(visibilityStatus({ data, error: null }, now.getTime() + 31 * 60000), "stale");
  assert.equal(visibilityStatus({ data: { ...data, fetchedAt: "2026-09-08T08:00:00Z" }, error: null }, Date.parse("2026-09-08T08:00:00Z")), "stale");
  assert.equal(visibilityStatus({ data, error: "failed" }, now.getTime()), "failed");
  assert.equal(visibilityStatus({ data: null, error: "failed" }, now.getTime()), "unavailable");
  assert.equal(data.fetchedAt, now.toISOString());
});
