import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTankerArrivals, tankerStatus, TANKER_RESOURCES } from "../app/lib/tanker-arrivals.ts";
import { readTankerArrivals } from "../app/lib/tanker-arrivals.server.ts";

const now = new Date("2026-09-08T06:00:00Z");
// 실측 응답의 열·문자열 계약을 재현한 테스트 전용 수치이며 연구 데이터가 아니다.
function fixture(latest = "2026-07", values = [10, 20, 30]) {
  const result = {};
  for (const source of ["breakdown", "total"]) {
    const fields = [{ type: "text", id: "month" }, ...(source === "breakdown" ? [{ type: "text", id: "category" }] : []),
      { type: "text", id: "number_of_tankers" }, { type: "text", id: "gross_tonnage" }, { type: "int4", id: "_id" }];
    const records = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(Date.UTC(Number(latest.slice(0, 4)), Number(latest.slice(5)) - 1 - i, 1)).toISOString().slice(0, 7);
      const categories = source === "breakdown" ? ["Oil Tankers", "Chemical Tankers", "LNG & LPG Tankers"] : [null];
      categories.forEach((category, j) => records.push({ _id: records.length + 1, month, ...(category ? { category } : {}),
        number_of_tankers: String(category ? values[j] : values.reduce((sum, value) => sum + value, 0)), gross_tonnage: "0.00" }));
    }
    result[source] = { success: true, result: { resource_id: TANKER_RESOURCES[source], fields, records, limit: records.length, total: source === "breakdown" ? 885 : 295, sort: "month%20desc" } };
  }
  return result;
}

test("tanker parser reconciles twelve complete months, preserves real zero and sorts ascending", () => {
  const { breakdown, total } = fixture();
  const parsed = parseTankerArrivals(breakdown, total, now);
  assert.equal(parsed.months.length, 12);
  assert.deepEqual(parsed.months[0], { month: "2025-08", oil: 10, chemical: 20, gas: 30, total: 60 });
  assert.equal(parsed.latestMonth, "2026-07");
  assert.equal(parsed.fetchedAt, now.toISOString());
  assert.ok(parsed.months.every(row => row.oil + row.chemical + row.gas === row.total));
  const zero = fixture("2026-07", [0, 0, 0]);
  assert.ok(parseTankerArrivals(zero.breakdown, zero.total, now).months.every(row => row.total === 0));
});

test("tanker parser rejects identity, schema, truncated, duplicate, missing, unsafe and future data", () => {
  const mutations = [
    data => { data.breakdown.success = false; },
    data => { delete data.total.result.resource_id; },
    data => { data.breakdown.result.resource_id = TANKER_RESOURCES.total; },
    data => { delete data.breakdown.result.fields; },
    data => { data.total.result.fields[1].type = "int4"; },
    data => { data.breakdown.result.fields[1] = data.breakdown.result.fields[0]; },
    data => { data.total.result.records.pop(); },
    data => { data.breakdown.result.records.push(data.breakdown.result.records[0]); },
    data => { data.breakdown.result.limit = 35; },
    data => { data.total.result.total = 11; },
    data => { data.total.result.total = "295"; },
    data => { data.total.result.records[0].number_of_tankers = "61"; },
    data => { data.breakdown.result.records[1].category = "Oil Tankers"; },
    data => { data.breakdown.result.records[1].category = "All vessels"; },
    data => { data.total.result.records[1].month = data.total.result.records[0].month; },
    data => { data.total.result.records[0].month = "2026-08"; },
    data => {
      for (const source of ["breakdown", "total"]) {
        for (const row of data[source].result.records) if (row.month === "2025-08") row.month = "2025-07";
      }
    },
    ...["", null, undefined, 0, false, -1, "-1", " 0", "1.5", "1e3", "NaN", "9007199254740992"].map(value => data => { data.breakdown.result.records[0].number_of_tankers = value; }),
    ...["2026-00", "2026-13", "2026-7", "0000-01", "2026-09", "2026-10", null].map(value => data => { data.breakdown.result.records[0].month = value; }),
    data => { data.breakdown.result.records[0] = null; },
    data => { data.total.result.records = {}; },
  ];
  for (const mutate of mutations) {
    const data = fixture();
    mutate(data);
    assert.throws(() => parseTankerArrivals(data.breakdown, data.total, now), mutate.toString());
  }
  for (const invalid of [null, {}, [], { success: true, result: null }]) assert.throws(() => parseTankerArrivals(invalid, fixture().total, now));
  const data = fixture();
  assert.throws(() => parseTankerArrivals(data.breakdown, data.total, new Date("invalid")));
});

test("tanker server queries both sources in parallel, caches and preserves whole last-good on partial failure or regression", { timeout: 2000 }, async () => {
  const failure = async () => { throw new Error("network"); };
  assert.deepEqual((await readTankerArrivals(failure, now)).data, null);
  assert.equal((await readTankerArrivals(async () => new Response(null, { status: 204 }), now)).data, null);
  const initial = fixture();
  let calls = 0;
  let release;
  const started = new Promise(resolve => { release = resolve; });
  const good = async (input, options) => {
    const url = new URL(input);
    assert.equal(url.origin + url.pathname, "https://data.gov.sg/api/action/datastore_search");
    assert.equal(url.searchParams.get("sort"), "month desc");
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.headers["User-Agent"], "ls-crude-observations/1.0");
    const source = url.searchParams.get("resource_id") === TANKER_RESOURCES.breakdown ? "breakdown" : "total";
    assert.equal(url.searchParams.get("resource_id"), TANKER_RESOURCES[source]);
    assert.equal(url.searchParams.get("limit"), source === "breakdown" ? "36" : "12");
    calls++;
    if (calls === 2) release();
    await started;
    return Response.json(initial[source]);
  };
  const saved = await readTankerArrivals(good, now);
  assert.equal(saved.error, null);
  assert.equal(saved.data.latestMonth, "2026-07");
  assert.equal((await readTankerArrivals(good, new Date(now.getTime() + 6 * 3600000 - 1))).data, saved.data);
  assert.equal(calls, 2);
  const expired = new Date(now.getTime() + 6 * 3600000);
  const sourceFetcher = (data, totalResponse) => async input => {
    const source = new URL(input).searchParams.get("resource_id") === TANKER_RESOURCES.breakdown ? "breakdown" : "total";
    return source === "total" && totalResponse ? totalResponse() : Response.json(data[source]);
  };
  const missingId = fixture();
  delete missingId.total.result.resource_id;
  for (const source of [failure, sourceFetcher(initial, failure), sourceFetcher(initial, () => new Response(null, { status: 429 })),
    sourceFetcher(initial, () => new Response("malformed JSON")), sourceFetcher(missingId), sourceFetcher(fixture("2026-06"))]) {
    const result = await readTankerArrivals(source, expired);
    assert.equal(result.data, saved.data);
    assert.equal(result.data.fetchedAt, now.toISOString());
    assert.equal(result.data.latestMonth, "2026-07");
    assert.ok(result.error);
  }
  const revised = await readTankerArrivals(sourceFetcher(fixture("2026-07", [11, 20, 30])), expired);
  assert.equal(revised.error, null);
  assert.equal(revised.data.months.at(-1).total, 61);
  assert.equal(revised.data.fetchedAt, expired.toISOString());
});

test("tanker status uses UTC month distance and fetch age, and distinguishes unavailable and failed", () => {
  const raw = fixture();
  const data = parseTankerArrivals(raw.breakdown, raw.total, now);
  const view = { data, error: null };
  assert.equal(tankerStatus(view, now.getTime()), "recent");
  assert.equal(tankerStatus(view, now.getTime() + 48 * 3600000), "recent");
  assert.equal(tankerStatus(view, now.getTime() + 48 * 3600000 + 1), "stale");
  assert.equal(tankerStatus({ data: { ...data, latestMonth: "2026-06" }, error: null }, now.getTime()), "recent");
  assert.equal(tankerStatus({ data: { ...data, latestMonth: "2026-05" }, error: null }, now.getTime()), "stale");
  assert.equal(tankerStatus({ data: { ...data, latestMonth: "2025-12", fetchedAt: "2026-02-01T00:00:00Z" }, error: null }, Date.parse("2026-02-01T00:00:00Z")), "recent");
  assert.equal(tankerStatus({ data, error: "failure" }, now.getTime()), "failed");
  assert.equal(tankerStatus({ data: null, error: "failure" }, now.getTime()), "unavailable");
  assert.equal(tankerStatus(view, now.getTime() - 1), "stale");
});
