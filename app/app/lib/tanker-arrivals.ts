/** MPA 공식 월간 입항 자료. https://data.gov.sg/collections/392/view */
export const TANKER_RESOURCES = {
  breakdown: "d_c9dcfd8b85990669d1e74dd7ad71eb8b",
  total: "d_9adb5ace517591edd9a8c88291ac1f1c",
} as const;
/** 75 GT 초과 탱커의 월간 입항 횟수. 화물량이나 고유 선박 수가 아니다. */
export interface TankerMonth { month: string; oil: number; chemical: number; gas: number; total: number }
/** 같은 12개월의 유형별 입항과 공식 총계를 대사한 응답. */
export interface TankerSnapshot { months: TankerMonth[]; fetchedAt: string; latestMonth: string }
/** 마지막 정상 월간 관측과 이번 조회 오류를 분리한다. */
export interface TankerView { data: TankerSnapshot | null; error: string | null }
/** 공급자의 세 분류를 화면 필드에 대응시킨다. */
const CATEGORIES = { "Oil Tankers": "oil", "Chemical Tankers": "chemical", "LNG & LPG Tankers": "gas" } as const;

/**
 * JSON 객체만 허용한다.
 * @param value 검증할 원본 값.
 * @returns 문자열 키의 원본 객체.
 */
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("MPA 객체 형식 오류");
  return value as Record<string, unknown>;
}

/**
 * datastore의 식별자·열 계약·표본 크기를 검증한다.
 * @param payload 공식 JSON 응답.
 * @param source 유형별 또는 총계 자료 구분.
 * @returns 검증할 원본 행 배열.
 */
function sourceRows(payload: unknown, source: keyof typeof TANKER_RESOURCES): unknown[] {
  const doc = record(payload);
  const result = record(doc.result);
  const limit = source === "breakdown" ? 36 : 12;
  const expected: Record<string, string> = { month: "text", number_of_tankers: "text", gross_tonnage: "text", _id: "int4" };
  if (source === "breakdown") expected.category = "text";
  if (doc.success !== true || result.resource_id !== TANKER_RESOURCES[source]) throw new Error("MPA 성공 여부·자료 식별자 오류");
  if (!Array.isArray(result.fields) || result.fields.length !== Object.keys(expected).length) throw new Error("MPA 열 계약 오류");
  const seen = new Set<string>();
  for (const value of result.fields) {
    const field = record(value);
    if (typeof field.id !== "string" || !Object.hasOwn(expected, field.id) || field.type !== expected[field.id] || seen.has(field.id)) throw new Error("MPA 열 계약 변경");
    seen.add(field.id);
  }
  if (result.limit !== limit || !Number.isSafeInteger(result.total) || (result.total as number) < limit || !Array.isArray(result.records) || result.records.length !== limit) throw new Error("MPA 표본 크기·절단 오류");
  return result.records;
}

/**
 * 공식 두 응답을 월별로 대사한다. 오류 행을 버리거나 결측을 0으로 채우지 않는다.
 * @param breakdown 유형별 최신 36행 응답.
 * @param total 공식 총계 최신 12행 응답.
 * @param now 조회 기준 시각. 현재 UTC 월과 미래 월은 거절한다.
 * @returns 오름차순의 연속된 12개 완전월과 실제 조회 시각.
 */
export function parseTankerArrivals(breakdown: unknown, total: unknown, now = new Date()): TankerSnapshot {
  if (!Number.isFinite(now.getTime())) throw new Error("MPA 조회 시각 오류");
  const currentMonth = now.toISOString().slice(0, 7);
  const monthly = new Map<string, Partial<TankerMonth>>();
  for (const [source, payload] of [["breakdown", breakdown], ["total", total]] as const) {
    for (const value of sourceRows(payload, source)) {
      const row = record(value);
      if (typeof row.month !== "string" || !/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(row.month) || row.month >= currentMonth) throw new Error("MPA 월 형식·현재/미래 월 오류");
      if (typeof row.number_of_tankers !== "string" || !/^\d+$/.test(row.number_of_tankers)) throw new Error("MPA 입항 횟수 형식 오류");
      const count = Number(row.number_of_tankers);
      if (!Number.isSafeInteger(count) || count < 0) throw new Error("MPA 입항 횟수 범위 오류");
      let category: "oil" | "chemical" | "gas" | "total" = "total";
      if (source === "breakdown") {
        if (typeof row.category !== "string" || !Object.hasOwn(CATEGORIES, row.category)) throw new Error("MPA 유형 변경");
        category = CATEGORIES[row.category as keyof typeof CATEGORIES];
      }
      const month = monthly.get(row.month) ?? { month: row.month };
      if (month[category] !== undefined) throw new Error("MPA 월·유형 중복");
      month[category] = count;
      monthly.set(row.month, month);
    }
  }
  if (monthly.size !== 12) throw new Error("MPA 두 자료의 12개월 범위 불일치");
  const months = [...monthly.values()].sort((a, b) => a.month!.localeCompare(b.month!)).map((row): TankerMonth => {
    const { month, oil, chemical, gas, total: sum } = row;
    if (oil === undefined || chemical === undefined || gas === undefined || sum === undefined) throw new Error("MPA 월별 유형·총계 누락");
    if (!Number.isSafeInteger(oil + chemical + gas) || oil + chemical + gas !== sum) throw new Error("MPA 공식 총계 대사 실패");
    return { month: month!, oil, chemical, gas, total: sum };
  });
  for (let i = 1; i < months.length; i++) {
    const previous = Number(months[i - 1].month.slice(0, 4)) * 12 + Number(months[i - 1].month.slice(5));
    const current = Number(months[i].month.slice(0, 4)) * 12 + Number(months[i].month.slice(5));
    if (current - previous !== 1) throw new Error("MPA 월간 공백");
  }
  return { months, fetchedAt: now.toISOString(), latestMonth: months.at(-1)!.month };
}

/**
 * 월간 관측과 조회의 최신성을 구분한다. 3개월·48시간은 앱 표시 정책이며 공급자 보장이 아니다.
 * @param view 검증된 자료와 조회 오류.
 * @param now 화면 기준 밀리초.
 * @returns 자료 없음·조회 실패·지연·최근 확인 상태.
 */
export function tankerStatus(view: TankerView, now: number): "unavailable" | "failed" | "stale" | "recent" {
  if (!view.data) return "unavailable";
  if (view.error) return "failed";
  const date = new Date(now);
  const monthGap = date.getUTCFullYear() * 12 + date.getUTCMonth() + 1 - (Number(view.data.latestMonth.slice(0, 4)) * 12 + Number(view.data.latestMonth.slice(5)));
  const fetchAge = now - Date.parse(view.data.fetchedAt);
  return !Number.isFinite(fetchAge) || fetchAge < 0 || monthGap < 1 || monthGap > 3 || fetchAge > 48 * 3600000 ? "stale" : "recent";
}
