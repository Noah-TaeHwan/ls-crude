/**
 * CAI 공개 화면 객체의 검증·빈 상태 함수.
 * PUBLIC_VIEW v1 계약을 구현한다. 연구 snapshot 정본이 아니라
 * 공개 화면 adapter이며, 외부 조회·학습·점수 생성을 하지 않는다.
 */

/** 자료 출처 구분. */
export type DataOrigin = "OBSERVED" | "DEMO" | "NO_DATA";
/** 관측 신선도. null은 알 수 없음이다. */
export type Freshness = "FRESH" | "STALE" | "ERROR" | null;
/** 검증 상태. */
export type ValidationState = "NOT_RUN" | "EXPLORATORY" | "INDEPENDENT_TESTED";

/** 지수 영역의 공개 화면 값. */
export interface CaiIndexView {
  index_id: string;
  definition_version: string | null;
  weighting_method: "equal-weight" | "learned-weight" | null;
  score: number | null;
  previous_score: number | null;
  as_of: string | null;
  observed_at: string | null;
  available_at: string | null;
  computed_at: string | null;
  retrieved_at: string | null;
  data_origin: DataOrigin;
  freshness: Freshness;
  run_id: string | null;
  constituent_count: number;
  coverage: number | null;
  history: Array<{ date: string; score: number | null; definition_version: string }>;
}

/** 예측 영역의 공개 화면 값. 확률은 0..1이다. */
export interface CaiForecastView {
  model_id: string | null;
  trained_run_id: string | null;
  generated_at: string | null;
  decision_cutoff: string | null;
  target_start: string | null;
  target_end: string | null;
  target_definition: string | null;
  publication_approved: boolean;
  probabilities: { up: number; not_up: number } | null;
  data_origin: DataOrigin;
  freshness: Freshness;
}

/** 검증 영역의 공개 화면 값. */
export interface CaiValidationView {
  status: ValidationState;
  n: number | null;
  sample_start: string | null;
  sample_end: string | null;
  oos_exposure: "UNSEEN" | "SEEN" | "UNKNOWN";
  freeze_ref: string | null;
  review_ref: string | null;
  metrics: Array<{ name: string; value: number; benchmark: string; benchmark_value: number }>;
}

/** 구성 성분 한 행의 공개 화면 값. */
export interface CaiConstituentView {
  candidate_id: string;
  name: string;
  membership: "ADOPTED" | "REVIEW" | "PARKED";
  observed_quantity: string;
  geography: string;
  frequency: string;
  status_note: string;
  evidence_ids: string[];
}

/** 근거 링크 한 행의 공개 화면 값. */
export interface CaiEvidenceView {
  id: string;
  title: string;
  url: string | null;
  access: "public" | "team_only";
}

/** CAI 공개 화면 전체. */
export interface CaiPublicView {
  schema_version: "cai.public.v1";
  index: CaiIndexView;
  forecast: CaiForecastView;
  validation: CaiValidationView;
  constituents: CaiConstituentView[];
  evidence: CaiEvidenceView[];
  warnings: string[];
}

const SCHEMA = "cai.public.v1";
const PROB_TOLERANCE = 0.000001;

/**
 * plain 객체인지 확인한다.
 * @param value 검사할 값.
 * @returns 레코드이면 true.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 유한수인지 확인한다.
 * @param value 검사할 값.
 * @returns 유한수이면 true.
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * 비어 있지 않은 문자열을 꺼낸다. 앞뒤 공백을 제거하고 빈 값은 버린다.
 * @param value 검사할 값.
 * @returns 비어 있지 않으면 다듬은 문자열, 아니면 null.
 */
function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** ISO 8601 시각의 구성 요소. 시간대는 offset 또는 Z만 허용한다. */
const ISO_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-](\d{2}):?(\d{2}))$/;

/**
 * 윤년인지 확인한다.
 * @param year 연도.
 * @returns 윤년이면 true.
 */
function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * 해당 연월의 마지막 날짜를 돌려준다.
 * @param year 연도.
 * @param month 월.
 * @returns 28..31.
 */
function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * 시장 기준 YYYY-MM-DD 날짜가 실제 달력 날짜인지 검사한다.
 * @param text 검사할 문자열.
 * @returns 유효하면 true.
 */
function isValidCalendarDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(5, 7));
  const day = Number(text.slice(8, 10));
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const built = new Date(Date.UTC(year, month - 1, day));
  return (
    built.getUTCFullYear() === year &&
    built.getUTCMonth() === month - 1 &&
    built.getUTCDate() === day
  );
}

/**
 * 시간대(offset 또는 Z)가 있는 ISO 8601 시각을 epoch ms로 바꾼다.
 * 정규식 통과 뒤 원문 달력 날짜를 직접 검사하므로 존재하지 않는 날짜
 * (예: 02-30)는 Date.parse의 월 넘김 전에 거부된다. 시간대가 없는
 * naive 시각은 추정하지 않고 거부한다. 비교는 epoch 기준이라 시간대에
 * 따라 UTC 날짜가 달라지는 정상 입력도 거부하지 않는다.
 * @param value 검사할 값.
 * @returns 유효하면 epoch ms, 아니면 null.
 */
function parseIsoInstant(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parts = ISO_PATTERN.exec(value);
  if (!parts) return null;
  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const hour = Number(parts[4]);
  const minute = Number(parts[5]);
  const second = parts[6] === undefined ? 0 : Number(parts[6]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  if (parts[8] !== "Z") {
    if (Number(parts[9]) > 23 || Number(parts[10]) > 59) return null;
  }
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * YYYY-MM-DD 또는 null을 검증한다.
 * @param value 검사할 값.
 * @returns 유효한 날짜 문자열 또는 null.
 */
function asCalendarDateOrNull(value: unknown): string | null {
  return typeof value === "string" && isValidCalendarDate(value) ? value : null;
}

/**
 * 시간대 있는 ISO 시각 또는 null을 검증한다.
 * @param value 검사할 값.
 * @returns 유효한 시각 문자열 또는 null.
 */
function asIsoInstantOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return parseIsoInstant(value) === null ? null : value;
}

/**
 * 자료 출처 값을 검증한다.
 * @param value 검사할 값.
 * @returns 유효하면 그 값, 아니면 NO_DATA.
 */
function asDataOrigin(value: unknown): DataOrigin {
  return value === "OBSERVED" || value === "DEMO" || value === "NO_DATA"
    ? value
    : "NO_DATA";
}

/**
 * 신선도 값을 검증한다.
 * @param value 검사할 값.
 * @returns 유효하면 그 값, 아니면 null.
 */
function asFreshness(value: unknown): Freshness {
  return value === "FRESH" || value === "STALE" || value === "ERROR" ? value : null;
}

/**
 * 빈 index 영역을 만든다.
 * @returns NO_DATA index 영역.
 */
function emptyIndex(): CaiIndexView {
  return {
    index_id: "cushing-activity-index",
    definition_version: null,
    weighting_method: null,
    score: null,
    previous_score: null,
    as_of: null,
    observed_at: null,
    available_at: null,
    computed_at: null,
    retrieved_at: null,
    data_origin: "NO_DATA",
    freshness: null,
    run_id: null,
    constituent_count: 0,
    coverage: null,
    history: [],
  };
}

/**
 * 빈 forecast 영역을 만든다.
 * @returns 미승인 forecast 영역.
 */
function emptyForecast(): CaiForecastView {
  return {
    model_id: null,
    trained_run_id: null,
    generated_at: null,
    decision_cutoff: null,
    target_start: null,
    target_end: null,
    target_definition: null,
    publication_approved: false,
    probabilities: null,
    data_origin: "NO_DATA",
    freshness: null,
  };
}

/**
 * 빈 validation 영역을 만든다.
 * @returns NOT_RUN validation 영역.
 */
function emptyValidation(): CaiValidationView {
  return {
    status: "NOT_RUN",
    n: null,
    sample_start: null,
    sample_end: null,
    oos_exposure: "UNKNOWN",
    freeze_ref: null,
    review_ref: null,
    metrics: [],
  };
}

/**
 * 빈 CAI 공개 화면을 만든다. 점수·확률·표본·지표를 만들지 않는다.
 * @returns NO_DATA 공개 화면.
 */
export function emptyCaiView(): CaiPublicView {
  return {
    schema_version: SCHEMA,
    index: emptyIndex(),
    forecast: emptyForecast(),
    validation: emptyValidation(),
    constituents: [],
    evidence: [],
    warnings: [],
  };
}

/**
 * history 배열을 검증한다. 같은 definition_version·오름차순·고유 날짜만 남긴다.
 * @param value 검사할 값.
 * @param definitionVersion index의 definition_version.
 * @param warnings 경고 수집 배열.
 * @returns 검증된 history.
 */
function parseHistory(
  value: unknown,
  definitionVersion: string | null,
  warnings: string[],
): CaiIndexView["history"] {
  if (!Array.isArray(value)) {
    if (value !== undefined) warnings.push("INVALID_HISTORY");
    return [];
  }
  const kept: CaiIndexView["history"] = [];
  const seen = new Set<string>();
  let dropped = false;
  for (const entry of value) {
    if (!isRecord(entry)) {
      dropped = true;
      continue;
    }
    const date = entry["date"];
    const score = entry["score"];
    const version = entry["definition_version"];
    const scoreOk = score === null || (isFiniteNumber(score) && score >= 0 && score <= 100);
    if (
      typeof date !== "string" ||
      !isValidCalendarDate(date) ||
      !scoreOk ||
      typeof version !== "string" ||
      version !== definitionVersion ||
      seen.has(date) ||
      (kept.length > 0 && date <= kept[kept.length - 1].date)
    ) {
      dropped = true;
      continue;
    }
    seen.add(date);
    kept.push({ date, score, definition_version: version });
  }
  if (dropped) warnings.push("INVALID_HISTORY_ENTRY");
  return kept;
}

/**
 * index 영역을 검증한다. 실패해도 다른 영역에 영향을 주지 않는다.
 * @param value 검사할 값.
 * @param warnings 경고 수집 배열.
 * @returns 검증된 index 영역.
 */
function parseIndex(value: unknown, warnings: string[]): CaiIndexView {
  if (!isRecord(value)) {
    warnings.push("INVALID_INDEX");
    return emptyIndex();
  }
  const out = emptyIndex();
  out.index_id = asNonEmptyString(value["index_id"]) ?? "cushing-activity-index";
  out.definition_version = asNonEmptyString(value["definition_version"]);
  out.weighting_method =
    value["weighting_method"] === "equal-weight" ||
    value["weighting_method"] === "learned-weight"
      ? value["weighting_method"]
      : null;
  out.data_origin = asDataOrigin(value["data_origin"]);
  out.freshness = asFreshness(value["freshness"]);
  out.as_of = asCalendarDateOrNull(value["as_of"]);
  out.observed_at = asIsoInstantOrNull(value["observed_at"]);
  out.available_at = asIsoInstantOrNull(value["available_at"]);
  out.computed_at = asIsoInstantOrNull(value["computed_at"]);
  out.retrieved_at = asIsoInstantOrNull(value["retrieved_at"]);
  out.run_id = asNonEmptyString(value["run_id"]);
  out.constituent_count =
    typeof value["constituent_count"] === "number" &&
    Number.isInteger(value["constituent_count"]) &&
    value["constituent_count"] >= 0
      ? value["constituent_count"]
      : 0;
  const coverage = value["coverage"];
  out.coverage =
    coverage === null || coverage === undefined
      ? null
      : isFiniteNumber(coverage) && coverage >= 0 && coverage <= 1
        ? coverage
        : null;
  if (coverage !== null && coverage !== undefined && out.coverage === null) {
    warnings.push("INVALID_COVERAGE");
  }
  const previous = value["previous_score"];
  out.previous_score =
    previous === null || previous === undefined
      ? null
      : isFiniteNumber(previous) && previous >= 0 && previous <= 100
        ? previous
        : null;
  if (previous !== null && previous !== undefined && out.previous_score === null) {
    warnings.push("INVALID_PREVIOUS_SCORE");
  }
  const score = value["score"];
  if (score === null || score === undefined) {
    out.score = null;
  } else if (!isFiniteNumber(score) || score < 0 || score > 100) {
    out.score = null;
    warnings.push("INVALID_INDEX_SCORE");
  } else if (out.data_origin === "NO_DATA") {
    out.score = null;
    warnings.push("SCORE_WITHOUT_OBSERVATION");
  } else if (out.data_origin === "DEMO") {
    // production 읽기에서 DEMO 점수는 미게시 값으로 취급한다.
    out.score = null;
  } else if (
    out.run_id === null ||
    out.definition_version === null ||
    out.as_of === null ||
    out.observed_at === null ||
    out.available_at === null ||
    out.constituent_count <= 0 ||
    out.coverage === null
  ) {
    out.score = null;
    warnings.push("INCOMPLETE_OBSERVED_INDEX");
  } else {
    out.score = score;
  }
  if (out.data_origin === "DEMO") {
    // DEMO 비공개는 현재 score 검증 결과와 독립적으로 적용한다.
    // 현재 점수뿐 아니라 이전값도 어떤 분기로 빠지든 남기지 않는다.
    out.score = null;
    out.previous_score = null;
    warnings.push("DEMO_SCORE_UNPUBLISHED");
  }
  out.history = parseHistory(value["history"], out.definition_version, warnings);
  if (out.data_origin === "DEMO" && out.history.length > 0) {
    out.history = [];
    warnings.push("DEMO_HISTORY_UNPUBLISHED");
  }
  return out;
}

/**
 * forecast 영역을 검증한다. 구조만 검사하고 게시 판단은 displayedProbabilities가 한다.
 * @param value 검사할 값.
 * @param warnings 경고 수집 배열.
 * @returns 검증된 forecast 영역.
 */
function parseForecast(value: unknown, warnings: string[]): CaiForecastView {
  if (!isRecord(value)) {
    warnings.push("INVALID_FORECAST");
    return emptyForecast();
  }
  const out = emptyForecast();
  out.model_id = asNonEmptyString(value["model_id"]);
  out.trained_run_id = asNonEmptyString(value["trained_run_id"]);
  out.generated_at = asIsoInstantOrNull(value["generated_at"]);
  out.decision_cutoff = asIsoInstantOrNull(value["decision_cutoff"]);
  out.target_start = asIsoInstantOrNull(value["target_start"]);
  out.target_end = asIsoInstantOrNull(value["target_end"]);
  out.target_definition = asNonEmptyString(value["target_definition"]);
  out.publication_approved = value["publication_approved"] === true;
  out.data_origin = asDataOrigin(value["data_origin"]);
  out.freshness = asFreshness(value["freshness"]);
  const probabilities = value["probabilities"];
  if (probabilities === null || probabilities === undefined) {
    out.probabilities = null;
  } else if (!isRecord(probabilities)) {
    out.probabilities = null;
    warnings.push("INVALID_PROBABILITIES");
  } else {
    const up = probabilities["up"];
    const notUp = probabilities["not_up"];
    if (
      isFiniteNumber(up) &&
      up >= 0 &&
      up <= 1 &&
      isFiniteNumber(notUp) &&
      notUp >= 0 &&
      notUp <= 1 &&
      Math.abs(up + notUp - 1) <= PROB_TOLERANCE
    ) {
      out.probabilities = { up, not_up: notUp };
    } else {
      out.probabilities = null;
      warnings.push("INVALID_PROBABILITIES");
    }
  }
  return out;
}

/**
 * validation 영역을 검증한다. 근거 없는 INDEPENDENT_TESTED는 강등한다.
 * @param value 검사할 값.
 * @param warnings 경고 수집 배열.
 * @returns 검증된 validation 영역.
 */
function parseValidation(value: unknown, warnings: string[]): CaiValidationView {
  if (!isRecord(value)) {
    warnings.push("INVALID_VALIDATION");
    return emptyValidation();
  }
  const out = emptyValidation();
  const status = value["status"];
  out.status = status === "NOT_RUN" || status === "EXPLORATORY" || status === "INDEPENDENT_TESTED" ? status : "NOT_RUN";
  if (status !== out.status) warnings.push("INVALID_VALIDATION_STATUS");
  const n = value["n"];
  out.n = n === null || n === undefined ? null : isFiniteNumber(n) ? n : null;
  if (n !== null && n !== undefined && out.n === null) warnings.push("INVALID_VALIDATION_N");
  out.sample_start = asCalendarDateOrNull(value["sample_start"]);
  out.sample_end = asCalendarDateOrNull(value["sample_end"]);
  const exposure = value["oos_exposure"];
  out.oos_exposure = exposure === "UNSEEN" || exposure === "SEEN" || exposure === "UNKNOWN" ? exposure : "UNKNOWN";
  out.freeze_ref = asNonEmptyString(value["freeze_ref"]);
  out.review_ref = asNonEmptyString(value["review_ref"]);
  if (Array.isArray(value["metrics"])) {
    let dropped = false;
    for (const metric of value["metrics"]) {
      if (
        isRecord(metric) &&
        typeof metric["name"] === "string" &&
        isFiniteNumber(metric["value"]) &&
        typeof metric["benchmark"] === "string" &&
        isFiniteNumber(metric["benchmark_value"])
      ) {
        out.metrics.push({
          name: metric["name"],
          value: metric["value"],
          benchmark: metric["benchmark"],
          benchmark_value: metric["benchmark_value"],
        });
      } else {
        dropped = true;
      }
    }
    if (dropped) warnings.push("INVALID_METRIC");
  }
  if (out.status === "INDEPENDENT_TESTED") {
    const hasEvidence =
      out.n !== null &&
      out.n > 0 &&
      out.sample_start !== null &&
      out.sample_end !== null &&
      out.sample_start <= out.sample_end &&
      out.oos_exposure === "UNSEEN" &&
      out.freeze_ref !== null &&
      out.review_ref !== null;
    if (!hasEvidence) {
      const partial =
        (out.n !== null && out.n > 0) ||
        out.sample_start !== null ||
        out.sample_end !== null ||
        out.freeze_ref !== null ||
        out.review_ref !== null;
      out.status = partial ? "EXPLORATORY" : "NOT_RUN";
      warnings.push("INDEPENDENT_TEST_DOWNGRADED");
    }
  }
  return out;
}

/**
 * 구성 성분 배열을 검증한다. 부적격 행은 버리고 경고를 남긴다.
 * @param value 검사할 값.
 * @param warnings 경고 수집 배열.
 * @returns 검증된 구성 성분 배열.
 */
function parseConstituents(value: unknown, warnings: string[]): CaiConstituentView[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) warnings.push("INVALID_CONSTITUENTS");
    return [];
  }
  const kept: CaiConstituentView[] = [];
  let dropped = false;
  for (const entry of value) {
    if (
      isRecord(entry) &&
      asNonEmptyString(entry["candidate_id"]) !== null &&
      typeof entry["name"] === "string" &&
      (entry["membership"] === "ADOPTED" ||
        entry["membership"] === "REVIEW" ||
        entry["membership"] === "PARKED") &&
      typeof entry["observed_quantity"] === "string" &&
      typeof entry["geography"] === "string" &&
      typeof entry["frequency"] === "string" &&
      typeof entry["status_note"] === "string" &&
      Array.isArray(entry["evidence_ids"]) &&
      entry["evidence_ids"].every((id) => typeof id === "string")
    ) {
      kept.push({
        candidate_id: entry["candidate_id"] as string,
        name: entry["name"] as string,
        membership: entry["membership"] as CaiConstituentView["membership"],
        observed_quantity: entry["observed_quantity"] as string,
        geography: entry["geography"] as string,
        frequency: entry["frequency"] as string,
        status_note: entry["status_note"] as string,
        evidence_ids: (entry["evidence_ids"] as string[]).slice(),
      });
    } else {
      dropped = true;
    }
  }
  if (dropped) warnings.push("INVALID_CONSTITUENT");
  return kept;
}

/**
 * URL query에 있으면 차단하는 민감 키 이름(소문자).
 * 토큰·서명·비밀번호·세션 계열이다.
 */
const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "accesstoken",
  "access_token",
  "idtoken",
  "id_token",
  "signature",
  "sig",
  "secret",
  "password",
  "passwd",
  "pwd",
  "auth",
  "authorization",
  "apikey",
  "api_key",
  "key",
  "session",
  "sessionid",
  "sessid",
  "sess",
  "signed",
]);

/** 로컬 경로 해석 기준 origin. 실제 네트워크 요청에 사용하지 않는다. */
const URL_BASE = "https://local.invalid";
/** 위 기준 origin 문자열. 로컬 경로가 밖으로 해석되는지 비교한다. */
const URL_BASE_ORIGIN = new URL(URL_BASE).origin;

/**
 * 키 이름이 민감한 인증정보를 가리키는지 검사한다.
 * 대소문자·구분자·percent 인코딩을 정규화하고, malformed 인코딩은
 * 보수적으로 차단한다. X-Amz-/X-Goog- 계열 서명·인증 키도 포함한다.
 * @param name query 또는 fragment의 키 이름.
 * @returns 민감하면 true.
 */
function isSensitiveParamName(name: string): boolean {
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    return true;
  }
  const lower = decoded.trim().toLowerCase();
  if (lower.length === 0) return false;
  if (SENSITIVE_QUERY_KEYS.has(lower)) return true;
  if (SENSITIVE_QUERY_KEYS.has(lower.replace(/[-_.]/g, ""))) return true;
  if (lower.startsWith("x-amz-") || lower.startsWith("x-goog-")) {
    return /signature|credential|token|security|auth|key|sig/.test(lower);
  }
  return false;
}

/**
 * fragment 안의 key=value 인증정보를 검사한다.
 * @param hash URL fragment("#...").
 * @returns 민감한 키가 있으면 true.
 */
function hasSensitiveFragment(hash: string): boolean {
  if (!hash.startsWith("#") || hash.length <= 1) return false;
  for (const pair of hash.slice(1).split("&")) {
    if (pair.length === 0) continue;
    const eq = pair.indexOf("=");
    const name = eq === -1 ? pair : pair.slice(0, eq);
    if (name.length > 0 && isSensitiveParamName(name)) return true;
  }
  return false;
}

/**
 * 근거 URL을 공개 결과에 둬도 되는지 검사한다. 문자열 접두어가 아니라
 * URL 구조로 본다. 허용: https 절대 URL(민감 query·fragment·userinfo 없음)과
 * 기준 origin을 벗어나지 않는 로컬 경로. 차단: 제어문자·역슬래시,
 * scheme-relative, 비-https scheme(파싱 후 항상 검사), userinfo,
 * 민감 query, fragment 인증값. 판정만 하고 외부 요청을 보내지 않으며,
 * 이 형식 검사는 자료의 이용·재배포 권한이나 임의의 모든 비밀정보를
 * 검증하지 않는다.
 * @param raw 검사할 URL 문자열.
 * @returns 공개해도 되면 true.
 */
function isSafePublicUrl(raw: string): boolean {
  const text = raw.trim();
  if (text.length === 0) return false;
  // 제어문자와 역슬래시는 파싱 과정에서 URL 의미를 바꿀 수 있다.
  if (/[\u0000-\u001F\u007F\\]/.test(text)) return false;
  if (text.startsWith("//")) return false;
  let parsed: URL;
  try {
    parsed = new URL(text, URL_BASE);
  } catch {
    return false;
  }
  // 원문 scheme 정규식 성공 여부와 무관하게 항상 protocol을 검사한다.
  if (parsed.protocol !== "https:") return false;
  const isAbsoluteHttps = /^https:\/\//i.test(text);
  const isLocalPath = text.startsWith("/");
  if (!isAbsoluteHttps && !isLocalPath) return false;
  // 로컬로 분류한 주소가 기준 origin 밖으로 해석되면 거부한다.
  if (isLocalPath && parsed.origin !== URL_BASE_ORIGIN) return false;
  if (parsed.username !== "" || parsed.password !== "") return false;
  for (const name of parsed.searchParams.keys()) {
    if (isSensitiveParamName(name)) return false;
  }
  if (hasSensitiveFragment(parsed.hash)) return false;
  return true;
}

/**
 * 근거 링크 배열을 검증한다. https가 아닌 절대 URL은 버린다.
 * @param value 검사할 값.
 * @param warnings 경고 수집 배열.
 * @returns 검증된 근거 배열.
 */
function parseEvidence(value: unknown, warnings: string[]): CaiEvidenceView[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) warnings.push("INVALID_EVIDENCE");
    return [];
  }
  const kept: CaiEvidenceView[] = [];
  let dropped = false;
  for (const entry of value) {
    if (!isRecord(entry)) {
      dropped = true;
      continue;
    }
    const id = asNonEmptyString(entry["id"]);
    const title = asNonEmptyString(entry["title"]);
    const access = entry["access"] === "public" ? "public" : "team_only";
    if (id === null || title === null) {
      dropped = true;
      continue;
    }
    const url = entry["url"];
    if (url === null || url === undefined) {
      kept.push({ id, title, url: null, access });
      continue;
    }
    if (typeof url !== "string" || !isSafePublicUrl(url)) {
      // 경고에 원 URL·token·비밀번호를 붙이지 않는다.
      warnings.push("UNSAFE_EVIDENCE_URL");
      continue;
    }
    if (access === "team_only") {
      // team_only 내부 원문 주소는 공개 링크로 전달하지 않는다.
      kept.push({ id, title, url: null, access });
      warnings.push("TEAM_ONLY_URL_WITHHELD");
      continue;
    }
    kept.push({ id, title, url: url.trim(), access });
  }
  if (dropped) warnings.push("INVALID_EVIDENCE_ENTRY");
  return kept;
}

/**
 * unknown 입력을 검증해 공개 화면 객체로 만든다.
 * 검증한 필드만 새 객체에 복사하고 raw/weights/secrets를 전달하지 않는다.
 * 한 영역의 실패는 그 영역만 비우고 다른 유효 영역을 유지한다.
 * @param input 검사할 입력.
 * @returns 검증된 공개 화면 객체.
 */
export function parseCaiPublicView(input: unknown): CaiPublicView {
  if (!isRecord(input) || input["schema_version"] !== SCHEMA) {
    const empty = emptyCaiView();
    empty.warnings.push("INVALID_SNAPSHOT");
    return empty;
  }
  const warnings: string[] = [];
  const index = parseIndex(input["index"], warnings);
  const forecast = parseForecast(input["forecast"], warnings);
  const validation = parseValidation(input["validation"], warnings);
  const constituents = parseConstituents(input["constituents"], warnings);
  const evidence = parseEvidence(input["evidence"], warnings);
  return {
    schema_version: SCHEMA,
    index,
    forecast,
    validation,
    constituents,
    evidence,
    warnings,
  };
}

/**
 * 점수를 계기판 바늘 각도로 바꾼다. 0→-90, 50→0, 100→90도.
 * @param score 0..100 점수 또는 null.
 * @returns 각도. null·비유한수·범위 밖은 null.
 */
export function gaugeAngle(score: number | null): number | null {
  if (!isFiniteNumber(score) || score < 0 || score > 100) return null;
  return (score / 50 - 1) * 90;
}

/**
 * 게시 가능한 예측 확률을 돌려준다. 조건이 하나라도 빠지면 null.
 * @param value 검증된 forecast 영역.
 * @returns 0..1 확률 쌍 또는 null.
 */
export function displayedProbabilities(
  value: CaiForecastView,
): { up: number; not_up: number } | null {
  if (!isRecord(value)) return null;
  if (value.data_origin !== "OBSERVED" || value.publication_approved !== true) return null;
  if (asNonEmptyString(value.model_id) === null) return null;
  if (asNonEmptyString(value.trained_run_id) === null) return null;
  if (asNonEmptyString(value.target_definition) === null) return null;
  const generated = parseIsoInstant(value.generated_at);
  const cutoff = parseIsoInstant(value.decision_cutoff);
  const start = parseIsoInstant(value.target_start);
  const end = parseIsoInstant(value.target_end);
  if (generated === null || cutoff === null || start === null || end === null) return null;
  if (!(start <= end && cutoff < start && generated < start)) return null;
  const probabilities = value.probabilities;
  if (!isRecord(probabilities)) return null;
  const up = probabilities["up"];
  const notUp = probabilities["not_up"];
  if (!isFiniteNumber(up) || up < 0 || up > 1) return null;
  if (!isFiniteNumber(notUp) || notUp < 0 || notUp > 1) return null;
  if (Math.abs(up + notUp - 1) > PROB_TOLERANCE) return null;
  return { up, not_up: notUp };
}
