/** Payne 카운티 Stillwater 측정소 PM2.5 연간 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingAqsRow {
  year: number;
  annual_mean_ug_m3: number;
  obs_count: number;
  obs_percent: number;
  completeness: string;
  certification: string;
  max_daily_ug_m3: number;
  max_date: string;
}
/** Payne 카운티 고정 연간 주변 PM2.5 시계열. 주변 대기 혼잡 요인이지 현장 바쁨이 아니다. */
export interface CushingAqsSeries {
  runId: string;
  geography: string;
  frequency: string;
  unit: string;
  rows: CushingAqsRow[];
}

const RUN_ID = "20260910T091AQSZ";
const GEOGRAPHY = "Payne County, Oklahoma (Stillwater monitor 40-119-0614)";
const FREQUENCY = "annual summary year";
const UNIT = "ug/m3 (LC)";
/** 고정 연도 순서와 공시 연간 평균 [year, mean_ug_m3, obs_count]. 2003은 측정소 폐쇄로 공시된 부분 연도이다. */
const EXPECTED: Array<[number, number, number]> = [
  [1999, 9.464103, 39],
  [2000, 10.635185, 54],
  [2001, 9.398333, 60],
  [2002, 10.328333, 60],
  [2003, 6.7, 2],
];

/**
 * 고정 Payne 카운티 연간 PM2.5 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-AQSZ 런 JSON.
 * @returns 검증된 주변 PM2.5 시계열 또는 오류 상태.
 */
export function readCushingAqs(value: unknown): CushingAqsSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; unit?: unknown; rows?: CushingAqsRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingAqsRow;
    const [year, mean, obsCount] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (typeof row.annual_mean_ug_m3 !== "number" || row.annual_mean_ug_m3 <= 0) return null;
    if (row.annual_mean_ug_m3 !== mean) return null;
    if (!Number.isSafeInteger(row.obs_count) || row.obs_count !== obsCount) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingAqsRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as CushingAqsSeries;
}

/**
 * 시계열에서 한 연도의 연간 평균을 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Payne 카운티 연간 시계열.
 * @param year 연도 (예: 2002).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearAqsMean(
  series: CushingAqsSeries | null,
  year: number,
): CushingAqsRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
