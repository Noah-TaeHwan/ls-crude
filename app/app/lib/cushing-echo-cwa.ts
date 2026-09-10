/** ECHO Cushing 수질 점검 한 건. 점검일은 CWA Inspection/Evaluation 일자이며 미공개는 null로 두고 0으로 채우지 않는다. 대기 FCE가 아니다. */
export interface CushingEchoCwaInspection {
  facilityName: string;
  sourceId: string;
  registryId: string;
  city: string;
  /** filed 그대로. 건설·일반허가 행은 null일 수 있다. */
  county: string | null;
  /** filed 그대로. 미공개는 null이다. */
  permitStatus: string | null;
  /** 마지막 CWA 점검 일자(ISO). 미공개는 null이며 0이나 임의 날짜로 채우지 않는다. */
  lastInspectionDate: string | null;
  /** 마지막 점검 종류. 미공개는 null이다. */
  lastInspectionType: string | null;
  /** DFR 창구간 공개 점검 횟수. DFR이 공개한 0은 그대로 둔다. */
  inspectionCount: number;
  complianceStatus: string;
  /** 공개된 formal 조치 수. 미공개는 null이며 0으로 채우지 않는다. */
  formalActions: number | null;
  /** 공개된 과징금 표기(예: $35,000). 미공개는 null이다. */
  totalPenalties: string | null;
}
/** ECHO Cushing 수질 점검 날짜 목록. 바쁨·WTI·TRI·VOC·처리량·대기 FCE가 아니다. */
export interface CushingEchoCwaSeries {
  runId: string;
  geography: string;
  windowStart: string;
  windowEnd: string;
  rows: CushingEchoCwaInspection[];
}

const RUN_ID = "20260910T091CWAZ";
const GEOGRAPHY = "Cushing city, Oklahoma (ECHO CWPCity=CUSHING, state OK)";
const WINDOW_START = "2021-09-05";
const WINDOW_END = "2026-03-31";
const CITY = "CUSHING";
/** 고정 시설 순서 [lastInspectionDate, sourceId, registryId, county, permitStatus, lastInspectionType, inspectionCount, cwaStatus, formalActions, totalPenalties]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string | null, string, string, string | null, string | null, string | null, number, string, number | null, string | null]> = [
  ["2025-04-10", "OK0043320", "110011006570", "Payne", "Effective", "Base Program - Evaluation", 4, "No Violation Identified", 1, "$0"],
  ["2025-04-10", "OK0044598", "110011006570", "Payne", "Effective", "Base Program - Evaluation", 4, "No Violation Identified", 1, "$0"],
  ["2025-06-05", "OKG950028", "110022834110", "Payne", "Effective", "Base Program - Evaluation", 3, "No Violation Identified", null, null],
  ["2026-01-06", "OK0026701", "110011008765", "Payne", "Effective", "Base Program - Evaluation", 8, "No Violation Identified", 3, "$35,000"],
  [null, "OK0044768", "110064607233", "Payne", "Terminated", null, 0, "Not Applicable", null, null],
  [null, "OK0045641", "110064646744", "Payne", "Not Needed", null, 0, "Not Applicable", null, null],
  [null, "OK0100374", "110059807589", "Payne", "Terminated", null, 0, "Terminated Permit", null, null],
  [null, "OKG270018", "110064607233", "Payne", "Not Needed", null, 0, "Not Applicable", null, null],
  [null, "OKG270057", "110070825892", "Payne", "Terminated", null, 0, "Terminated Permit", null, null],
  [null, "OKG340020", "110007164638", "Payne", "Terminated", null, 0, "Terminated Permit", null, null],
  [null, "OKG340050", "110020793541", "Payne", "Terminated", null, 0, "Terminated Permit", null, null],
  [null, "OKR05FA05", "110070943445", "Lincoln", "Terminated", null, 0, "No Violation Identified", null, null],
  [null, "OKR10F01J", "110070869693", null, "Terminated", null, 0, "Terminated Permit", null, null],
  [null, "OKR10F024", "110071437581", null, "Effective", null, 0, "No Violation Identified", null, null],
  [null, "OKR10F034", "110072073355", null, "Effective", null, 0, "No Violation Identified", null, null],
  [null, "OKR10F03H", "110072229797", null, "Effective", null, 0, "No Violation Identified", null, null],
  [null, "OKR10I023", "110071319745", null, "Effective", null, 0, "No Violation Identified", null, null],
  [null, "OKU000852", "110069420068", null, null, null, 0, "Not Applicable", null, null],];

/**
 * 고정 ECHO Cushing 수질 점검 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않고 대기 FCE 행을 섞지 않는다.
 * @param value 091-CWAZ 런 JSON.
 * @returns 검증된 점검 목록 또는 오류 상태.
 */
export function readCushingEchoCwa(value: unknown): CushingEchoCwaSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; windowStart?: unknown; windowEnd?: unknown; rows?: CushingEchoCwaInspection[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (v.windowStart !== WINDOW_START || v.windowEnd !== WINDOW_END) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  let seenUndated = false;
  let prevKey = "";
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingEchoCwaInspection;
    const [lastInspectionDate, sourceId, registryId, county, permitStatus, lastInspectionType, inspectionCount, cwaStatus, formalActions, totalPenalties] = EXPECTED[i];
    if (!row || row.lastInspectionDate !== lastInspectionDate || row.sourceId !== sourceId) return null;
    if (row.registryId !== registryId || row.county !== county) return null;
    if (row.permitStatus !== permitStatus || row.lastInspectionType !== lastInspectionType) return null;
    if (row.inspectionCount !== inspectionCount || row.complianceStatus !== cwaStatus) return null;
    if (row.formalActions !== formalActions || row.totalPenalties !== totalPenalties) return null;
    if (typeof row.facilityName !== "string" || row.facilityName.length === 0) return null;
    if (row.city !== CITY) return null;
    if (row.lastInspectionDate !== null && !isoDate.test(row.lastInspectionDate)) return null;
    if (!Number.isInteger(row.inspectionCount) || row.inspectionCount < 0) return null;
    if (row.formalActions !== null && (!Number.isInteger(row.formalActions) || row.formalActions < 0)) return null;
    // 날짜 있는 행이 먼저 날짜순, 미공개 행은 뒤에 sourceId순. 결측을 채우지 않는다.
    const key = row.lastInspectionDate === null ? `~${row.sourceId}` : `${row.lastInspectionDate}|${row.sourceId}`;
    if (row.lastInspectionDate === null) seenUndated = true;
    else if (seenUndated) return null;
    if (i > 0 && prevKey >= key) return null;
    prevKey = key;
  }
  return v as CushingEchoCwaSeries;
}

/**
 * 지정 날짜의 Cushing 수질 점검 시설을 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 ECHO Cushing 수질 점검 목록.
 * @param lastInspectionDate 날짜 (예: 2025-04-10).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function echoCwaInspectionsOn(series: CushingEchoCwaSeries | null, lastInspectionDate: string): CushingEchoCwaInspection[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.lastInspectionDate === lastInspectionDate);
}
