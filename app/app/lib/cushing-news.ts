/** 날짜 있는 Cushing 산업 큐 한 건. 날짜 메우기를 하지 않는다. */
export interface CushingNewsEvent {
  publishedAt: string;
  title: string;
  source: string;
  url: string;
  lanes: string;
  matchedTerms: string;
}
/** 091-ZBOARDZ 동결 이벤트 목록. 기사 수는 활동이 아니다. */
export interface CushingNewsSlice {
  runId: string;
  sourceAuditCsv: string;
  auditSha256: string;
  auditedRows: number;
  events: CushingNewsEvent[];
}

const RUN_ID = "20260909T091ZBOARDZ";
const SOURCE_AUDIT_CSV =
  "research/indexes/091-cushing-operations-nowcasting/20260908T091ZNEWSZ/headline_audit.csv";
const AUDIT_SHA256 =
  "2215c32ad8af1ca10b51d90772e43d7ef5ee3bbee8aa94e5d64b15d04c5620f6";
const AUDITED_ROWS = 79;
/** 동결된 유일한 날짜 큐. 순서·값이 어긋나면 null. */
const EXPECTED: CushingNewsEvent = {
  publishedAt: "2026-09-07T15:59:45+00:00",
  title:
    "South Bow, Bridger to Develop New Oil Pipeline From Wyoming to Cushing, Oklahoma - EnergyNow",
  source: "Google News RSS",
  url: "https://news.google.com/rss/articles/CBMirAFBVV95cUxPWEY1T1VnMkdHUi1nVEdGSGN0TWMxNnVCUmh1ckw0QWRjRmR4MUFZcTJjaGlkUDRIOFJaUjRHU1FrMnM3T1lWMk5Ec0NXR3IwaHB3R012MnU1TzFLUTlQQlFlZkRlNHB3V3haWlRDb2wyZXVfNloyb1NhTkxCQllvY1NSTVZnVFZydTRCX0ZUOEZ6elZBX3plQnB4TkZYV2gxM2JIelQzSkpzdkda?oc=5",
  lanes: "physical",
  matchedTerms: "pipeline",
};

/**
 * 동결된 091-Z 날짜 큐 목록을 검사한다. 날짜를 메우거나 행을 지어 내지 않는다.
 * @param value 091-ZBOARDZ 런 JSON.
 * @returns 검증된 이벤트 목록 또는 오류 상태.
 */
export function readCushingNews(value: unknown): CushingNewsSlice | null {
  const v = value as {
    runId?: unknown;
    sourceAuditCsv?: unknown;
    auditSha256?: unknown;
    auditedRows?: unknown;
    events?: CushingNewsEvent[];
  };
  if (!v || v.runId !== RUN_ID) return null;
  if (v.sourceAuditCsv !== SOURCE_AUDIT_CSV) return null;
  if (v.auditSha256 !== AUDIT_SHA256) return null;
  if (v.auditedRows !== AUDITED_ROWS) return null;
  if (!Array.isArray(v.events) || v.events.length !== 1) return null;
  const e = v.events[0] as CushingNewsEvent;
  if (!e || typeof e.publishedAt !== "string" || e.publishedAt === "") return null;
  for (const k of ["publishedAt", "title", "source", "url", "lanes", "matchedTerms"] as const) {
    if (e[k] !== EXPECTED[k]) return null;
  }
  return v as CushingNewsSlice;
}

/**
 * 동결 목록에서 날짜 있는 큐를 꺼낸다. 기사 수는 활동이 아니다.
 * @param slice 검증된 Cushing 뉴스 슬라이스.
 * @returns 날짜 큐 배열 또는 검증 실패 시 null.
 */
export function datedCushingEvents(slice: CushingNewsSlice | null): CushingNewsEvent[] | null {
  if (!slice || slice.runId !== RUN_ID) return null;
  if (!Array.isArray(slice.events) || slice.events.length !== 1) return null;
  return slice.events;
}
