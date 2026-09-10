/** Payne County 주간 가뭄 한 점. 결측 주간은 null이며 0으로 채우지 않는다. */
export interface DroughtWeekRow {
  mapDate: string;
  none: number | null;
  d0: number | null;
  d1: number | null;
  d2: number | null;
  d3: number | null;
  d4: number | null;
}
/** Payne County 고정 주간 US Drought Monitor 시계열. 기상 교란변수이며 활동량·바쁨이 아니다. */
export interface DroughtWeeklySeries {
  runId: string;
  fips: string;
  county: string;
  state: string;
  label: string;
  source: string;
  rows: DroughtWeekRow[];
}

const RUN_ID = "20260910T091DRTZ";
const FIPS = "40119";
const COUNTY = "Payne County";
const STATE = "OK";
const LABEL = "Payne County US Drought Monitor, weekly confounder, not activity";
const SOURCE =
  "U.S. Drought Monitor county statistics for FIPS 40119 (Payne County, OK), traditional cumulative percent of area";
const FIRST_MAP_DATE = "2014-12-30";
const LAST_MAP_DATE = "2026-09-01";
const WEEK_COUNT = 610;
/** 고정 체크섬: 공개된 주간 면적률 Math.round(v*100) 합. */
const NONE_SUM = 2757016;
const D0_SUM = 3342984;
const D1_SUM = 2050380;
const D2_SUM = 1035269;
const D3_SUM = 362456;
const D4_SUM = 5;

/**
 * YYYY-MM-DD가 실제 달력 날짜인지 검사한다.
 * @param date 검사할 날짜 문자열.
 * @returns 유효하면 true, 아니면 false.
 */
function isCalendarDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === date;
}

/**
 * 공개된 면적률 관측인지 검사한다. 결측 null은 그대로 둔다.
 * @param value 주간 면적률 후보 (county %).
 * @returns 0 이상 100 이하의 유한 숫자 또는 null.
 */
function optionalPct(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > 100) return null;
  return value;
}

/**
 * 고정 Payne County 주간 가뭄 시계열을 검사한다. 결측 주간을 0으로 채우지 않는다.
 * FIPS·카운티·라벨·출처를 고정값과 대조해 주 전체·쿠싱시 오표기와 Mesonet 복사를 막는다.
 * @param value 091-DRTZ 런 JSON.
 * @returns 검증된 주간 가뭄 시계열 또는 오류 상태.
 */
export function readPayneDroughtWeekly(value: unknown): DroughtWeeklySeries | null {
  const v = value as {
    runId?: unknown;
    fips?: unknown;
    county?: unknown;
    state?: unknown;
    label?: unknown;
    source?: unknown;
    rows?: DroughtWeekRow[];
  };
  if (!v || v.runId !== RUN_ID || v.fips !== FIPS) return null;
  if (v.county !== COUNTY || v.state !== STATE) return null;
  if (v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== WEEK_COUNT) return null;
  let noneSum = 0;
  let d0Sum = 0;
  let d1Sum = 0;
  let d2Sum = 0;
  let d3Sum = 0;
  let d4Sum = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as DroughtWeekRow;
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (!isCalendarDate(row.mapDate)) return null;
    if (i === 0) {
      if (row.mapDate !== FIRST_MAP_DATE) return null;
    } else {
      const prev = v.rows[i - 1] as DroughtWeekRow;
      const step = Date.parse(`${row.mapDate}T00:00:00Z`) - Date.parse(`${prev.mapDate}T00:00:00Z`);
      if (step !== 7 * 86400000) return null;
    }
    // USDM mapDate는 화요일이다. 요일이 바뀌면 다른 소스 날짜가 섞인 것이다.
    if (new Date(Date.parse(`${row.mapDate}T00:00:00Z`)).getUTCDay() !== 2) return null;
    const none = optionalPct(row.none);
    const d0 = optionalPct(row.d0);
    const d1 = optionalPct(row.d1);
    const d2 = optionalPct(row.d2);
    const d3 = optionalPct(row.d3);
    const d4 = optionalPct(row.d4);
    if (row.none !== none || row.d0 !== d0 || row.d1 !== d1) return null;
    if (row.d2 !== d2 || row.d3 !== d3 || row.d4 !== d4) return null;
    // 결측 주간은 일곱 칸이 함께 비고, 공개 주간은 일곱 칸이 함께 찬다.
    const cells = [none, d0, d1, d2, d3, d4];
    const nulls = cells.filter((c) => c === null).length;
    if (nulls !== 0 && nulls !== 6) return null;
    if (nulls === 6) continue;
    const [n, z0, z1, z2, z3, z4] = cells as number[];
    // 전통 누적형: none + d0 = 100, d0 ≥ d1 ≥ d2 ≥ d3 ≥ d4.
    if (Math.abs(n + z0 - 100) > 0.011) return null;
    if (!(z0 >= z1 && z1 >= z2 && z2 >= z3 && z3 >= z4)) return null;
    noneSum += Math.round(n * 100);
    d0Sum += Math.round(z0 * 100);
    d1Sum += Math.round(z1 * 100);
    d2Sum += Math.round(z2 * 100);
    d3Sum += Math.round(z3 * 100);
    d4Sum += Math.round(z4 * 100);
  }
  const last = v.rows[v.rows.length - 1] as DroughtWeekRow;
  if (last.mapDate !== LAST_MAP_DATE) return null;
  if (noneSum !== NONE_SUM || d0Sum !== D0_SUM || d1Sum !== D1_SUM) return null;
  if (d2Sum !== D2_SUM || d3Sum !== D3_SUM || d4Sum !== D4_SUM) return null;
  return v as DroughtWeeklySeries;
}

/**
 * 시계열에서 한 주의 가뭄 행을 꺼낸다. 결측 주간은 null 셀 행을 돌려준다.
 * @param series 검증된 Payne County 주간 가뭄 시계열.
 * @param mapDate 조회 mapDate (YYYY-MM-DD, 예: 2026-09-01).
 * @returns 해당 주 행 또는 없으면 null.
 */
export function weekDrought(
  series: DroughtWeeklySeries | null,
  mapDate: string,
): DroughtWeekRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.mapDate === mapDate);
  return row ?? null;
}
