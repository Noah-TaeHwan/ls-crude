import type { CaiIndexView } from "./cai-view.ts";

/** 검증된 이력에서 고른 화면 상태. 원래 공개 지수·최신 구성은 변경하지 않는다. */
export interface CaiDateSelection {
  point: CaiIndexView["history"][number];
  previousScore: number | null;
  previousDate: string | null;
  previousRecordDate: string | null;
  nextRecordDate: string | null;
  range: "year" | "all";
  points: CaiIndexView["history"];
  position: number;
  notice: string | null;
}

/**
 * 주소의 날짜를 실제 거래일 이력에 대조한다. 잘못된 날짜는 안내와 함께 최신 산출일로 표시한다.
 * @param index 검증된 공개 지수.
 * @param search 현재 URL 검색 매개변수.
 * @returns 조회 상태. 공개 가능한 회고 지수가 없으면 null.
 */
export function selectCaiDate(index: CaiIndexView, search: URLSearchParams): CaiDateSelection | null {
  if (index.mode !== "RETROSPECTIVE" || index.data_origin !== "OBSERVED" || index.score === null) return null;
  const latest = index.history.findIndex((point) => point.date === index.as_of);
  if (latest < 0) return null;
  const dates = search.getAll("cai_date");
  const requested = dates.length === 1 ? index.history.findIndex((point) => point.date === dates[0]) : -1;
  const selected = requested >= 0 ? requested : latest;
  const point = index.history[selected];
  const ranges = search.getAll("cai_range");
  const range = ranges.length === 1 && ranges[0] === "all" ? "all" : "year";
  const points = range === "all" ? index.history : index.history.filter((row) => row.date.startsWith(point.date.slice(0, 4)));
  const prior = index.history[selected - 1];
  return {
    point, range, points, position: points.findIndex((row) => row.date === point.date),
    previousScore: prior?.score ?? null,
    previousDate: prior && prior.score !== null ? prior.date : null,
    previousRecordDate: prior?.date ?? null,
    nextRecordDate: index.history[selected + 1]?.date ?? null,
    notice: dates.length > 0 && requested < 0
      ? "요청한 날짜의 거래일 기록이 없어 최신 산출일을 표시합니다. 아래에서 기록된 날짜를 선택해 주세요."
      : ranges.length > 1 || (ranges.length === 1 && !["year", "all"].includes(ranges[0]))
        ? "지원하지 않는 조회 범위여서 선택한 날짜의 연도를 표시합니다." : null,
  };
}

/**
 * CAI 조회 매개변수만 바뀐 이동인지 검사한다. 같은 URL의 수동·주기 갱신은 제외한다.
 * @param current 이전 URL.
 * @param next 이동할 URL.
 * @returns 시세 재조회·스크롤 초기화가 필요 없는 날짜 조작이면 true.
 */
export function isCaiDateNavigation(current: URL, next: URL): boolean {
  if (current.origin !== next.origin || current.pathname !== next.pathname || current.hash !== next.hash) return false;
  // 메뉴로 맨 처음 주소에 진입하는 동작은 기존 초기화·재조회 규칙을 유지한다.
  if (!next.searchParams.has("cai_date")) return false;
  const keys = ["cai_date", "cai_range"];
  if (!keys.some((key) => JSON.stringify(current.searchParams.getAll(key)) !== JSON.stringify(next.searchParams.getAll(key)))) return false;
  const before = new URLSearchParams(current.search), after = new URLSearchParams(next.search);
  for (const key of keys) { before.delete(key); after.delete(key); }
  before.sort(); after.sort();
  return before.toString() === after.toString();
}
