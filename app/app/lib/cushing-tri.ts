/** Cushing 시 TRI 현장 배출 연간 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingTriRow {
  year: number;
  on_site_release_lb: number;
  facility_count: number;
}
/** Cushing 시 고정 연간 TRI 현장 배출 시계열. 화학물질 배출량이지 현장 바쁨이 아니다. */
export interface CushingTriSeries {
  runId: string;
  geography: string;
  frequency: string;
  unit: string;
  rows: CushingTriRow[];
}

const RUN_ID = "20260910T091TRIZ";
const GEOGRAPHY = "Cushing city, Oklahoma";
const FREQUENCY = "annual reporting year";
const UNIT = "lb";
/** 고정 연도 순서와 공개 현장 배출량 [year, lb, facility_count]. 2024의 0은 전 매체 NA로 공시된 관측치이다. */
const EXPECTED: Array<[number, number, number]> = [
  [1989, 66339, 1],
  [1990, 88630, 1],
  [1991, 102678, 1],
  [1992, 176921, 1],
  [1993, 67888, 1],
  [1994, 86688, 1],
  [1995, 63096, 1],
  [1996, 87666, 1],
  [1997, 39065, 1],
  [1998, 25232, 1],
  [1999, 25232, 1],
  [2000, 25232, 1],
  [2001, 23230, 1],
  [2002, 23230, 1],
  [2003, 23015, 1],
  [2024, 0, 1],
];

/**
 * 고정 Cushing 시 연간 TRI 현장 배출 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-TRIZ 런 JSON.
 * @returns 검증된 도시 TRI 시계열 또는 오류 상태.
 */
export function readCushingTri(value: unknown): CushingTriSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; unit?: unknown; rows?: CushingTriRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingTriRow;
    const [year, lb, facilityCount] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (!Number.isSafeInteger(row.on_site_release_lb) || row.on_site_release_lb < 0) return null;
    if (row.on_site_release_lb !== lb) return null;
    if (!Number.isSafeInteger(row.facility_count) || row.facility_count !== facilityCount) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingTriRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as CushingTriSeries;
}

/**
 * 시계열에서 한 연도의 현장 배출량을 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Cushing 시 연간 시계열.
 * @param year 연도 (예: 2003).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearTriRelease(
  series: CushingTriSeries | null,
  year: number,
): CushingTriRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
