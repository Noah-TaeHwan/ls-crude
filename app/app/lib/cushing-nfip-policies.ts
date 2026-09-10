/** Payne County NFIP 정책 유효 월 한 점. 날짜는 policyEffectiveDate의 연월이며 결측 월은 0으로 채우지 않는다. */
export interface CushingNfipPolicyMonth {
  yearMonth: string;
  /** 해당 유효 월의 정책 기록 수 (원천 policyCount는 전 행 1). */
  policies: number;
}
/** Payne County NFIP 정책 유효 월 목록. 청구·바쁨·WTI·재난선포가 아니다. */
export interface CushingNfipPolicySeries {
  runId: string;
  geography: string;
  rows: CushingNfipPolicyMonth[];
}

const RUN_ID = "20260910T091NFPPZ";
const GEOGRAPHY = "Payne County, Oklahoma (state OK, censusGeoid prefix 40119)";
const MONTH_COUNT = 214;
const FIRST = { yearMonth: "2009-01", policies: 12 };
const LAST = { yearMonth: "2026-10", policies: 1 };
const PEAK = { yearMonth: "2010-08", policies: 44 };
/** 고정 검증합: 월별 정책 수 합계. 결측 월은 합계에 없다. */
const POLICY_SUM = 4039;

/**
 * 고정 Payne County NFIP 정책 유효 월 목록을 검사한다. FIPS 40109로 바꾸지 않고 청구를 정책으로 둔갑시키지 않는다.
 * @param value 091-NFPP-Z 런 JSON.
 * @returns 검증된 정책 월 목록 또는 오류 상태.
 */
export function readCushingNfipPolicies(value: unknown): CushingNfipPolicySeries | null {
  const v = value as { runId?: unknown; geography?: unknown; rows?: CushingNfipPolicyMonth[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== MONTH_COUNT) return null;
  let sum = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as CushingNfipPolicyMonth;
    if (!row || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.yearMonth)) return null;
    if (!Number.isInteger(row.policies) || row.policies <= 0) return null;
    if (i > 0 && v.rows[i - 1].yearMonth >= row.yearMonth) return null;
    sum += row.policies;
  }
  const first = v.rows[0] as CushingNfipPolicyMonth;
  const last = v.rows[v.rows.length - 1] as CushingNfipPolicyMonth;
  if (first.yearMonth !== FIRST.yearMonth || first.policies !== FIRST.policies) return null;
  if (last.yearMonth !== LAST.yearMonth || last.policies !== LAST.policies) return null;
  if (sum !== POLICY_SUM) return null;
  const peak = v.rows.find((r) => r.yearMonth === PEAK.yearMonth);
  if (!peak || peak.policies !== PEAK.policies) return null;
  return v as CushingNfipPolicySeries;
}

/**
 * 지정 유효 월의 Payne County 정책 수를 꺼낸다. 결측 월은 0이 아니라 null이다.
 * @param series 검증된 Payne County NFIP 정책 월 목록.
 * @param yearMonth 연월 (예: 2009-01).
 * @returns 해당 월 정책 수 또는 결측 시 null.
 */
export function nfipPoliciesOn(series: CushingNfipPolicySeries | null, yearMonth: string): number | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.yearMonth === yearMonth);
  return row ? row.policies : null;
}
