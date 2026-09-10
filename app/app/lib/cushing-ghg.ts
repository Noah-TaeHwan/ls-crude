/** Cushing 시 GHGRP 연간 CO2e 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingGhgRow {
  year: number;
  co2e_metric_tons: number;
  facility_count: number;
}
/** Cushing 시 고정 연간 GHGRP CO2e 시계열. 시설 온실가스 배출량이지 현장 바쁨이 아니다. */
export interface CushingGhgSeries {
  runId: string;
  geography: string;
  frequency: string;
  unit: string;
  rows: CushingGhgRow[];
}

const RUN_ID = "20260910T091GHGZ";
const GEOGRAPHY = "Cushing city, Oklahoma";
const FREQUENCY = "annual reporting year";
const UNIT = "metric tons CO2e (IPCC AR4 GWP)";
/** 고정 연도 순서와 공시 직접 배출량 [year, tCO2e, facility_count]. 값은 파일 공시 그대로이며 단위를 바꾸지 않는다. */
const EXPECTED: Array<[number, number, number]> = [
  [2016, 44337.004, 1],
  [2017, 46316.15, 1],
  [2018, 38251.638, 1],
  [2019, 36271.846, 1],
];

/**
 * 고정 Cushing 시 연간 GHGRP CO2e 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-GHGZ 런 JSON.
 * @returns 검증된 도시 GHG 시계열 또는 오류 상태.
 */
export function readCushingGhg(value: unknown): CushingGhgSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; unit?: unknown; rows?: CushingGhgRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingGhgRow;
    const [year, co2e, facilityCount] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (typeof row.co2e_metric_tons !== "number" || !Number.isFinite(row.co2e_metric_tons) || row.co2e_metric_tons < 0) return null;
    if (row.co2e_metric_tons !== co2e) return null;
    if (!Number.isSafeInteger(row.facility_count) || row.facility_count !== facilityCount) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingGhgRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as CushingGhgSeries;
}

/**
 * 시계열에서 한 연도의 CO2e를 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Cushing 시 연간 시계열.
 * @param year 연도 (예: 2018).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearGhgCo2e(
  series: CushingGhgSeries | null,
  year: number,
): CushingGhgRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
