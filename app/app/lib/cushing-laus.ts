/** Payne County 월간 LAUS 실업률 한 점. 결측 월은 null이며 0으로 채우지 않는다. */
export interface PayneLausMonthRow {
  period: string;
  unemployment_rate: number | null;
}
/** Payne County 고정 월간 LAUS 실업률 시계열. 카운티 노동시장 실업률이지 Cushing 시·현장 바쁨이 아니다. */
export interface PayneLausMonthlySeries {
  runId: string;
  areaFips: string;
  geography: string;
  frequency: string;
  rows: PayneLausMonthRow[];
}

const RUN_ID = "20260910T091LAUSZ";
const AREA_FIPS = "40119";
const GEOGRAPHY = "Payne County, Oklahoma";
const FREQUENCY = "monthly LAUS unemployment rate";
/** 고정 월 순서와 공개 실업률 [period YYYY-MM, rate %]. null은 BLS가 미공개한 월이다. */
const EXPECTED: Array<[string, number | null]> = [
  ["2015-01", 3.5],
  ["2015-02", 3.5],
  ["2015-03", 3.3],
  ["2015-04", 3.2],
  ["2015-05", 3.8],
  ["2015-06", 4.2],
  ["2015-07", 3.7],
  ["2015-08", 3.5],
  ["2015-09", 3.2],
  ["2015-10", 3.2],
  ["2015-11", 3.0],
  ["2015-12", 3.1],
  ["2016-01", 3.7],
  ["2016-02", 4.0],
  ["2016-03", 3.7],
  ["2016-04", 3.3],
  ["2016-05", 3.6],
  ["2016-06", 4.4],
  ["2016-07", 4.0],
  ["2016-08", 3.6],
  ["2016-09", 3.6],
  ["2016-10", 3.3],
  ["2016-11", 3.2],
  ["2016-12", 3.3],
  ["2017-01", 3.8],
  ["2017-02", 3.8],
  ["2017-03", 3.4],
  ["2017-04", 2.9],
  ["2017-05", 3.4],
  ["2017-06", 4.3],
  ["2017-07", 3.8],
  ["2017-08", 3.7],
  ["2017-09", 3.5],
  ["2017-10", 2.8],
  ["2017-11", 3.0],
  ["2017-12", 2.9],
  ["2018-01", 3.5],
  ["2018-02", 3.4],
  ["2018-03", 3.0],
  ["2018-04", 2.7],
  ["2018-05", 2.9],
  ["2018-06", 3.5],
  ["2018-07", 3.1],
  ["2018-08", 2.8],
  ["2018-09", 2.6],
  ["2018-10", 2.3],
  ["2018-11", 2.3],
  ["2018-12", 2.6],
  ["2019-01", 3.4],
  ["2019-02", 3.1],
  ["2019-03", 2.9],
  ["2019-04", 2.3],
  ["2019-05", 2.9],
  ["2019-06", 3.3],
  ["2019-07", 3.0],
  ["2019-08", 2.8],
  ["2019-09", 2.6],
  ["2019-10", 2.3],
  ["2019-11", 2.4],
  ["2019-12", 2.3],
  ["2020-01", 2.9],
  ["2020-02", 2.8],
  ["2020-03", 3.2],
  ["2020-04", 11.0],
  ["2020-05", 9.3],
  ["2020-06", 8.3],
  ["2020-07", 6.5],
  ["2020-08", 4.9],
  ["2020-09", 4.6],
  ["2020-10", 4.0],
  ["2020-11", 4.1],
  ["2020-12", 4.2],
  ["2021-01", 4.7],
  ["2021-02", 4.7],
  ["2021-03", 3.9],
  ["2021-04", 3.8],
  ["2021-05", 3.7],
  ["2021-06", 4.4],
  ["2021-07", 3.5],
  ["2021-08", 3.3],
  ["2021-09", 2.6],
  ["2021-10", 2.5],
  ["2021-11", 2.3],
  ["2021-12", 2.2],
  ["2022-01", 3.0],
  ["2022-02", 3.1],
  ["2022-03", 2.5],
  ["2022-04", 2.3],
  ["2022-05", 2.6],
  ["2022-06", 3.4],
  ["2022-07", 3.1],
  ["2022-08", 3.4],
  ["2022-09", 2.8],
  ["2022-10", 2.8],
  ["2022-11", 2.6],
  ["2022-12", 2.4],
  ["2023-01", 3.3],
  ["2023-02", 3.4],
  ["2023-03", 2.8],
  ["2023-04", 2.2],
  ["2023-05", 2.7],
  ["2023-06", 3.3],
  ["2023-07", 3.1],
  ["2023-08", 3.4],
  ["2023-09", 3.0],
  ["2023-10", 3.0],
  ["2023-11", 2.8],
  ["2023-12", 2.6],
  ["2024-01", 3.5],
  ["2024-02", 3.7],
  ["2024-03", 2.9],
  ["2024-04", 2.6],
  ["2024-05", 2.9],
  ["2024-06", 3.7],
  ["2024-07", 3.6],
  ["2024-08", 3.2],
  ["2024-09", 2.8],
  ["2024-10", 2.7],
  ["2024-11", 2.8],
  ["2024-12", 2.8],
  ["2025-01", 3.2],
  ["2025-02", 3.3],
  ["2025-03", 2.7],
  ["2025-04", 2.4],
  ["2025-05", 3.1],
  ["2025-06", 3.6],
  ["2025-07", 3.5],
  ["2025-08", 3.4],
  ["2025-09", 3.3],
  ["2025-10", null],
  ["2025-11", 3.8],
  ["2025-12", 3.7],
  ["2026-01", 4.3],
  ["2026-02", 4.1],
  ["2026-03", 3.2],
  ["2026-04", 3.6],
  ["2026-05", 4.4],
  ["2026-06", 4.6],
  ["2026-07", 4.5],
];

/**
 * 고정 Payne County 월간 LAUS 실업률 시계열을 검사한다. 결측 월을 0으로 채우지 않는다.
 * @param value 091-LAUSZ 런 JSON.
 * @returns 검증된 카운티 실업률 시계열 또는 오류 상태.
 */
export function readPayneLausMonthly(value: unknown): PayneLausMonthlySeries | null {
  const v = value as { runId?: unknown; areaFips?: unknown; geography?: unknown; frequency?: unknown; rows?: PayneLausMonthRow[] };
  if (!v || v.runId !== RUN_ID || v.areaFips !== AREA_FIPS || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneLausMonthRow;
    const [period, rate] = EXPECTED[i];
    if (!row || row.period !== period) return null;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period)) return null;
    if (rate === null) {
      if (row.unemployment_rate !== null) return null;
    } else {
      if (typeof row.unemployment_rate !== "number" || !Number.isFinite(row.unemployment_rate)) return null;
      if (row.unemployment_rate <= 0 || row.unemployment_rate >= 100) return null;
      if (row.unemployment_rate !== rate) return null;
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneLausMonthRow;
      if (prev.period >= row.period) return null;
    }
  }
  return v as PayneLausMonthlySeries;
}

/**
 * 시계열에서 한 월의 실업률을 꺼낸다. 미공개 월은 null 행을 돌려준다.
 * @param series 검증된 Payne County 월간 시계열.
 * @param period 조회 월 (YYYY-MM, 예: 2025-03).
 * @returns 해당 월 행 또는 없으면 null.
 */
export function monthUnemploymentRate(
  series: PayneLausMonthlySeries | null,
  period: string,
): PayneLausMonthRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.period === period);
  return row ?? null;
}
