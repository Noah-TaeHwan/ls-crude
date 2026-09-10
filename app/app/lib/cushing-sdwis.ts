/** SDWIS Cushing 음용수 위반 한 건. 날짜는 SDWIS 준수기간 일자이며 미공개는 null로 두고 0으로 채우지 않는다. CWA NPDES 점검이 아니다. */
export interface CushingSdwisViolation {
  pwsId: string;
  systemName: string;
  violationId: string;
  /** 준수기간 시작일(ISO). 이 시리즈는 전 행이 공개되어 있다. */
  complianceBeginDate: string;
  /** 준수기간 종료일(ISO). 미공개는 null이며 0이나 임의 날짜로 채우지 않는다. */
  complianceEndDate: string | null;
  /** 부적합기간 시작일(ISO). 미공개는 null이다. */
  noncomplianceBeginDate: string | null;
  /** 부적합기간 종료일(ISO). 미공개는 null이다. */
  noncomplianceEndDate: string | null;
  /** 연방법 규칙명 (filed 그대로). */
  federalRule: string;
  /** 오염물질·규칙명 (filed 그대로). */
  contaminant: string;
  /** 위반 구분 코드 (filed 그대로). */
  categoryCode: string;
  /** 위반 구분 설명 (filed 그대로). */
  categoryDesc: string;
  /** 처리 상태 (filed 그대로). */
  status: string;
  /** 해소일(ISO). 미공개는 null이다. */
  resolvedDate: string | null;
  /** DFR에 공개된 조치 건수. 공개된 0은 그대로 둔다. */
  enforcementCount: number;
}
/** SDWIS Cushing 음용수 위반 날짜 목록. 바쁨·WTI·TRI·VOC·처리량·CWA NPDES가 아니다. */
export interface CushingSdwisSeries {
  runId: string;
  geography: string;
  pwsId: string;
  systemExtractDate: string;
  rows: CushingSdwisViolation[];
}

const RUN_ID = "20260910T091SDWISZ";
const GEOGRAPHY = "Cushing city, Oklahoma (SDWIS PWSName=CUSHING, state OK; Payne County)";
const PWS_ID = "OK2006061";
const SYSTEM_NAME = "CUSHING";
const SYSTEM_EXTRACT_DATE = "2026-07-09";
/** 고정 위반 순서 [violationId, complianceBeginDate, complianceEndDate, noncomplianceBeginDate, noncomplianceEndDate, federalRule, contaminant, categoryCode, categoryDesc, status, resolvedDate, enforcementCount]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string, string, string | null, string | null, string | null, string, string, string, string, string, string | null, number]> = [
  ["334", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "1,2,4-Trichlorobenzene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["335", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "cis-1,2-Dichloroethylene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["336", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Xylenes, Total", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["337", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "DICHLOROMETHANE", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["338", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "o-Dichlorobenzene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["339", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "p-Dichlorobenzene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["340", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Vinyl chloride", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["341", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "1,1-Dichloroethylene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["342", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "trans-1,2-Dichloroethylene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["343", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "1,2-Dichloroethane", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["344", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "1,1,1-Trichloroethane", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["345", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Carbon tetrachloride", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["346", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "1,2-Dichloropropane", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["347", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Trichloroethylene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["348", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "1,1,2-Trichloroethane", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["349", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Tetrachloroethylene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["350", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "CHLOROBENZENE", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["351", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Benzene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["352", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Toluene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["353", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Ethylbenzene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["354", "2017-01-01", "2022-12-31", "2017-01-01", "2022-12-31", "Volatile Organic Chemicals", "Styrene", "MR", "Monitoring and Reporting", "Archived", "2022-12-31", 0],
  ["357", "2024-10-17", null, "2024-10-17", "2025-07-15", "Lead and Copper Rule Revisions", "LEAD AND COPPER RULE REVISIONS", "TT", "Treatment Technique Violation", "Resolved", "2025-07-15", 2],
  ["358", "2024-10-17", null, "2024-10-17", "2025-07-15", "Lead and Copper Rule Revisions", "LEAD AND COPPER RULE REVISIONS", "RPT", "Reporting Violation", "Resolved", "2025-07-15", 2],];

/**
 * 고정 SDWIS Cushing 음용수 위반 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않고 CWA 점검 행을 섞지 않는다.
 * @param value 091-SDWISZ 런 JSON.
 * @returns 검증된 위반 목록 또는 오류 상태.
 */
export function readCushingSdwis(value: unknown): CushingSdwisSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; pwsId?: unknown; systemExtractDate?: unknown; rows?: CushingSdwisViolation[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (v.pwsId !== PWS_ID || v.systemExtractDate !== SYSTEM_EXTRACT_DATE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  let prevKey = "";
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingSdwisViolation;
    const [violationId, complianceBeginDate, complianceEndDate, noncomplianceBeginDate, noncomplianceEndDate, federalRule, contaminant, categoryCode, categoryDesc, status, resolvedDate, enforcementCount] = EXPECTED[i];
    if (!row || row.violationId !== violationId) return null;
    if (row.pwsId !== PWS_ID || row.systemName !== SYSTEM_NAME) return null;
    if (row.complianceBeginDate !== complianceBeginDate || row.complianceEndDate !== complianceEndDate) return null;
    if (row.noncomplianceBeginDate !== noncomplianceBeginDate || row.noncomplianceEndDate !== noncomplianceEndDate) return null;
    if (row.federalRule !== federalRule || row.contaminant !== contaminant) return null;
    if (row.categoryCode !== categoryCode || row.categoryDesc !== categoryDesc) return null;
    if (row.status !== status || row.resolvedDate !== resolvedDate) return null;
    if (row.enforcementCount !== enforcementCount) return null;
    if (!isoDate.test(row.complianceBeginDate)) return null;
    for (const d of [row.complianceEndDate, row.noncomplianceBeginDate, row.noncomplianceEndDate, row.resolvedDate]) {
      if (d !== null && !isoDate.test(d)) return null;
    }
    if (typeof row.federalRule !== "string" || row.federalRule.length === 0) return null;
    if (typeof row.contaminant !== "string" || row.contaminant.length === 0) return null;
    if (!Number.isInteger(row.enforcementCount) || row.enforcementCount < 0) return null;
    // 준수 시작일순, 같은 날은 위반번호순. 결측을 채우지 않는다.
    const key = `${row.complianceBeginDate}|${row.violationId.padStart(10, "0")}`;
    if (i > 0 && prevKey >= key) return null;
    prevKey = key;
  }
  return v as CushingSdwisSeries;
}

/**
 * 지정 준수 시작일의 Cushing 음용수 위반을 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 SDWIS Cushing 음용수 위반 목록.
 * @param complianceBeginDate 준수 시작일 (예: 2017-01-01).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function sdwisViolationsOn(series: CushingSdwisSeries | null, complianceBeginDate: string): CushingSdwisViolation[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.complianceBeginDate === complianceBeginDate);
}
