import assert from "node:assert/strict";
import { test } from "node:test";
import snapshot from "../app/data/cai-public-view.json" with { type: "json" };
import { selectCaiDate, isCaiDateNavigation } from "../app/lib/cai-selection.ts";

test("선택 날짜는 공개 이력에서만 꺼내고 최신 산출물을 변경하지 않는다", () => {
  const before = JSON.stringify(snapshot);
  const selection = selectCaiDate(snapshot.index, new URLSearchParams("cai_date=2023-12-28&cai_range=year"));
  assert.equal(selection.point.score, 41.1);
  assert.equal(selection.point.date, "2023-12-28");
  assert.equal(selection.nextRecordDate, "2023-12-29");
  assert.ok(selection.points.every((point) => point.date.startsWith("2023")));
  assert.equal(JSON.stringify(snapshot), before);
});

test("결측과 0, 잘못된 날짜·범위를 구분한다", () => {
  const gap = selectCaiDate(snapshot.index, new URLSearchParams("cai_date=2021-01-04"));
  assert.equal(gap.point.date, "2021-01-04");
  assert.equal(gap.point.score, null);
  assert.equal(gap.previousScore, null);
  for (const query of ["cai_date=2023-12-25", "cai_date=2023-02-30", "cai_date=2026-01-01", "cai_date=", "cai_date=2023-12-28&cai_date=2023-12-29"]) {
    const invalid = selectCaiDate(snapshot.index, new URLSearchParams(query));
    assert.equal(invalid.point.date, snapshot.index.as_of);
    assert.ok(invalid.notice);
  }
  const wrongRange = selectCaiDate(snapshot.index, new URLSearchParams("cai_date=2019-01-02&cai_range=bogus"));
  assert.equal(wrongRange.point.date, "2019-01-02");
  assert.equal(wrongRange.range, "year");
  assert.ok(wrongRange.notice);
  const zero = structuredClone(snapshot.index);
  zero.score = 0; zero.history.at(-1).score = 0; zero.history.at(-2).score = 0;
  const selected = selectCaiDate(zero, new URLSearchParams());
  assert.equal(selected.point.score, 0);
  assert.equal(selected.previousScore, 0);
});

test("조회 연도와 이전·다음은 선택 날짜를 따르고 마지막 버튼의 경계를 보존한다", () => {
  const early = selectCaiDate(snapshot.index, new URLSearchParams("cai_date=2019-01-02"));
  assert.ok(early.points.every((point) => point.date.startsWith("2019")));
  assert.equal(early.previousRecordDate, "2018-12-31");
  assert.equal(selectCaiDate(snapshot.index, new URLSearchParams("cai_date=2015-01-02")).previousRecordDate, null);
  assert.equal(selectCaiDate(snapshot.index, new URLSearchParams()).nextRecordDate, null);
  assert.equal(selectCaiDate(snapshot.index, new URLSearchParams("cai_date=2019-01-02&cai_range=all")).points.length, 2262);
  for (const index of [{...snapshot.index,score:null},{...snapshot.index,mode:"CURRENT"},{...snapshot.index,data_origin:"DEMO"}]) {
    assert.equal(selectCaiDate(index, new URLSearchParams("cai_date=2023-12-28")), null);
  }
});

test("날짜 query만 바뀐 이동을 구분하고 수동 갱신·다른 query·메뉴 진입을 보존한다", () => {
  const url = (path) => new URL(path, "https://ls-crude.vercel.app");
  assert.equal(isCaiDateNavigation(url("/?sample=unknown#market"), url("/?sample=unknown&cai_date=2023-12-28&cai_range=all#market")), true);
  assert.equal(isCaiDateNavigation(url("/?cai_date=2023-12-28"), url("/?cai_date=2023-12-28")), false);
  assert.equal(isCaiDateNavigation(url("/?cai_date=2023-12-28"), url("/")), false);
  assert.equal(isCaiDateNavigation(url("/?cai_date=2023-12-28&sample=a"), url("/?cai_date=2023-12-29&sample=b")), false);
  assert.equal(isCaiDateNavigation(url("/?cai_date=2023-12-28#market"), url("/?cai_date=2023-12-29")), false);
  assert.equal(isCaiDateNavigation(url("/?cai_date=2023-12-28"), url("/research?cai_date=2023-12-29")), false);
});
