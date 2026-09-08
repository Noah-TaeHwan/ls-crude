/** 원본 시정의 정확값·상하한·결측 구분. 단위는 statute miles이다. */
export interface VisibilityObservation {
  observedAt: string;
  receivedAt: string;
  reportAt: string;
  value: number | null;
  relation: "exact" | "lower_bound" | "upper_bound" | "missing";
}
/** 검증된 KGLS 응답. 오류 행은 전체 응답을 거절하므로 rejectedCount는 항상 0이다. */
export interface VisibilitySnapshot {
  observations: VisibilityObservation[];
  fetchedAt: string;
  latestObservedAt: string;
  rejectedCount: number;
}
/** 마지막 정상 관측과 이번 조회 오류를 분리한다. */
export interface VisibilityView { data: VisibilitySnapshot | null; error: string | null }

/**
 * 시정의 제한 부호와 분수를 보존하고 숫자 강제 변환을 거절한다.
 * @param input AWC visib 값.
 * @returns 값과 정확값·상하한·결측 구분.
 */
function parseValue(input: unknown): Pick<VisibilityObservation, "value" | "relation"> {
  if (input === null || input === "") return { value: null, relation: "missing" };
  if (typeof input !== "number" && typeof input !== "string") throw new Error("시정 자료형 오류");
  let text = String(input).trim().replace(/SM$/, "");
  let relation: VisibilityObservation["relation"] = "exact";
  if (text.endsWith("+")) { text = text.slice(0, -1); relation = "lower_bound"; }
  else if (text.startsWith("P")) { text = text.slice(1); relation = "lower_bound"; }
  else if (text.startsWith("M")) { text = text.slice(1); relation = "upper_bound"; }
  if (!/^(?:\d+(?:\.\d+)?|\d+\/\d+|\d+ \d+\/\d+)$/.test(text)) throw new Error("시정 표기 오류");
  const value = text.split(" ").reduce((sum, part) => {
    const [numerator, denominator] = part.split("/").map(Number);
    return sum + numerator / (denominator ?? 1);
  }, 0);
  if (!Number.isFinite(value) || value < 0) throw new Error("시정 범위 오류");
  return { value, relation };
}

/**
 * 명시적인 시간대가 있는 ISO 시각만 받는다.
 * @param input AWC 수신·보고 시각.
 * @param now 조회 기준 밀리초.
 * @returns 정규화한 UTC 시각.
 */
function parseTime(input: unknown, now: number): string {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(input)) throw new Error("시각 형식 오류");
  if (new Date(`${input.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== input.slice(0, 10) || Number(input.slice(11, 13)) > 23) throw new Error("달력 시각 오류");
  const time = Date.parse(input);
  if (!Number.isFinite(time) || time <= 0 || time > now) throw new Error("미래 또는 잘못된 시각");
  return new Date(time).toISOString();
}

/**
 * KGLS 관측을 검증한다. 원본 연구 수집기와 달리 한 오류 행도 조용히 제외하지 않는다.
 * @param payload AWC JSON 배열. null 시정은 보존하고 필드 누락은 schema 오류로 거절한다.
 * @param now 조회 기준 시각. 오래된 정상 응답은 보존하며 화면에서 지연 상태를 표시한다.
 * @returns 시간 오름차순 관측. 400행은 공급자 절단 가능성이 있어 거절한다.
 */
export function parseVisibility(payload: unknown, now = new Date()): VisibilitySnapshot {
  const current = now.getTime();
  if (!Number.isFinite(current) || !Array.isArray(payload) || !payload.length || payload.length >= 400) throw new Error("AWC 관측 배열 오류");
  const seen = new Set<string>();
  const observations = payload.map((row: unknown): VisibilityObservation => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("AWC 관측 행 오류");
    const record = row as Record<string, unknown>;
    if (record.icaoId !== "KGLS" || typeof record.obsTime !== "number" || !Number.isSafeInteger(record.obsTime) || record.obsTime <= 0 || record.obsTime * 1000 > current) throw new Error("AWC 관측소·관측 시각 오류");
    const observedAt = new Date(record.obsTime * 1000).toISOString();
    const receivedAt = parseTime(record.receiptTime, current);
    const reportAt = parseTime(record.reportTime, current);
    if (Date.parse(receivedAt) < Date.parse(observedAt) || seen.has(observedAt)) throw new Error("AWC 중복 또는 수신 시각 역행");
    seen.add(observedAt);
    return { observedAt, receivedAt, reportAt, ...parseValue(record.visib) };
  }).sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  return { observations, fetchedAt: now.toISOString(), latestObservedAt: observations.at(-1)!.observedAt, rejectedCount: 0 };
}

/**
 * 현재 화면 시각으로 자료 없음·실패·지연·최근 관측을 구분한다.
 * @param view 검증된 데이터와 조회 오류.
 * @param now 현재 화면 기준 밀리초. 기상 위험 등급이 아닌 표시 정책이다.
 * @returns 표시할 최신성 상태.
 */
export function visibilityStatus(view: VisibilityView, now: number): "unavailable" | "failed" | "stale" | "recent" {
  if (!view.data) return "unavailable";
  if (view.error) return "failed";
  return now - Date.parse(view.data.latestObservedAt) > 120 * 60000 || now - Date.parse(view.data.fetchedAt) > 30 * 60000 ? "stale" : "recent";
}
