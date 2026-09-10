/** ECHO Cushing DMR 유량 한 건. 감시 기간 종료일과 신고 수량을 있는 그대로 두며 결측을 0으로 채우지 않는다. 점검 횟수가 아니다. */
export interface CushingEchoDmrFlow {
  permitId: string;
  facilityName: string;
  city: string;
  /** 신고된 방류구 번호(001, 007/008, 002 포함). */
  outfall: string;
  parameterCode: string;
  monitoringLocation: string;
  /** Q1(MO AVG) 또는 Q2(DAILY MX). */
  valueType: string;
  statisticalBase: string;
  /** 감시 기간 종료일(ISO). 결측은 null이며 0이나 임의 날짜로 채우지 않는다. */
  monitoringPeriodEnd: string;
  /** 신고 수량(문자열 그대로). NODI 행은 null이며 0으로 채우지 않는다. */
  value: string | null;
  /** 신고 단위(MGD, gal/d). 과거 행은 null일 수 있으며 지어 내지 않는다. */
  unit: string | null;
  /** 신고 한정자(=, <). 미공개는 null이다. */
  qualifier: string | null;
  /** 무자료 사유 코드(예: C). 값 있는 행은 null이다. */
  nodiCode: string | null;
  nodiDesc: string | null;
  /** 접수일(ISO). 미공개는 null이다. */
  receivedDate: string | null;
}
/** ECHO Cushing DMR 유량 날짜 목록. 바쁨·WTI·점검 횟수·대기 FCE가 아니다. */
export interface CushingEchoDmrSeries {
  runId: string;
  geography: string;
  parameterCode: string;
  rows: CushingEchoDmrFlow[];
}

const RUN_ID = "20260910T091DMRZ";
const GEOGRAPHY = "Cushing city, Oklahoma (ECHO CWPCity=CUSHING, state OK)";
const PARAMETER_CODE = "50050";
const CITY = "CUSHING";
const ROW_COUNT = 1722;
const NUMERIC_COUNT = 880;
const VALUE_SUM_THOUSANDTHS = 7487398621;
const FIRST_DATE = "2015-01-31";
const LAST_DATE = "2026-07-31";
/** 허가별 고정 행 수. 유량 미공개 13개 허가는 0행이며 빠진 달을 채우지 않는다. */
const PER_PERMIT: Record<string, number> = {
  OK0026701: 278,
  OK0043320: 834,
  OK0044598: 278,
  OK0100374: 40,
  OKG270057: 14,
  OKG950028: 278,
};
/** 허가별 신고된 방류구. */
const OUTFALLS: Record<string, Set<string>> = {
  OK0026701: new Set(["001"]),
  OK0043320: new Set(["001", "007", "008"]),
  OK0044598: new Set(["001"]),
  OK0100374: new Set(["001", "002"]),
  OKG270057: new Set(["001"]),
  OKG950028: new Set(["001"]),
};
const VALUE_TYPES: Record<string, string> = { Q1: "MO AVG", Q2: "DAILY MX" };
const UNITS = new Set(["MGD", "gal/d"]);

/**
 * 고정 ECHO Cushing DMR 유량 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않고 점검 횟수 행을 섞지 않는다.
 * @param value 091-DMRZ 런 JSON.
 * @returns 검증된 유량 목록 또는 오류 상태.
 */
export function readCushingEchoDmr(value: unknown): CushingEchoDmrSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; parameterCode?: unknown; rows?: CushingEchoDmrFlow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (v.parameterCode !== PARAMETER_CODE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== ROW_COUNT) return null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const perPermit: Record<string, number> = {};
  let numeric = 0;
  let sum = 0;
  let prevKey = "";
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as CushingEchoDmrFlow;
    if (!row || typeof row !== "object") return null;
    if (!(row.permitId in PER_PERMIT)) return null;
    if (!OUTFALLS[row.permitId].has(row.outfall)) return null;
    if (row.city !== CITY) return null;
    if (typeof row.facilityName !== "string" || row.facilityName.length === 0) return null;
    if (row.parameterCode !== PARAMETER_CODE) return null;
    if (row.monitoringLocation !== "Effluent Gross") return null;
    if (!(row.valueType in VALUE_TYPES) || row.statisticalBase !== VALUE_TYPES[row.valueType]) return null;
    if (row.monitoringPeriodEnd === null || !isoDate.test(row.monitoringPeriodEnd)) return null;
    if (row.value === null) {
      // NODI 행은 값이 비고 사유가 있어야 한다. 0으로 채우면 실패.
      if (row.nodiCode === null || row.nodiCode.length === 0) return null;
    } else {
      const n = Number(row.value);
      if (!Number.isFinite(n) || n < 0) return null;
      if (row.nodiCode !== null) return null;
      numeric += 1;
      sum += n;
    }
    if (row.unit !== null && !UNITS.has(row.unit)) return null;
    if (row.receivedDate !== null && !isoDate.test(row.receivedDate)) return null;
    perPermit[row.permitId] = (perPermit[row.permitId] ?? 0) + 1;
    // 감시 종료일순, 허가·방류구·값 종류순. 날짜를 지어 내지 않는다.
    const key = `${row.monitoringPeriodEnd}|${row.permitId}|${row.outfall}|${row.valueType}`;
    if (i > 0 && prevKey >= key) return null;
    prevKey = key;
  }
  for (const [permitId, count] of Object.entries(PER_PERMIT)) {
    if (perPermit[permitId] !== count) return null;
  }
  if (numeric !== NUMERIC_COUNT) return null;
  if (Math.floor(sum * 1000 + 0.5) !== VALUE_SUM_THOUSANDTHS) return null;
  if (v.rows[0].monitoringPeriodEnd !== FIRST_DATE) return null;
  if (v.rows[v.rows.length - 1].monitoringPeriodEnd !== LAST_DATE) return null;
  return v as CushingEchoDmrSeries;
}

/**
 * 지정 감시 종료일의 Cushing DMR 유량 행을 꺼낸다. 한 달에 여러 허가·값 종류가 있을 수 있다.
 * @param series 검증된 ECHO Cushing DMR 유량 목록.
 * @param monitoringPeriodEnd 감시 종료일 (예: 2026-07-31).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function echoDmrFlowOn(series: CushingEchoDmrSeries | null, monitoringPeriodEnd: string): CushingEchoDmrFlow[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.monitoringPeriodEnd === monitoringPeriodEnd);
}
