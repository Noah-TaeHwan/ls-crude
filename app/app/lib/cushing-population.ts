/** Cushing 시 Census 인구 연간 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingPopulationRow {
  year: number;
  population: number;
}
/** Cushing 시 고정 연간 Census 인구 시계열. 도시 규모이지 현장 바쁨이 아니다. */
export interface CushingPopulationSeries {
  runId: string;
  geography: string;
  frequency: string;
  rows: CushingPopulationRow[];
}

const RUN_ID = "20260910T091POPZ";
const GEOGRAPHY = "Cushing city, Oklahoma";
const FREQUENCY = "annual July 1 estimate";
/** 고정 연도 순서와 공개 인구 [year, population]. 2010–2019는 2010-base 빈티지, 2020–2024는 2020-base 빈티지이다. */
const EXPECTED: Array<[number, number]> = [
  [2010, 7827],
  [2011, 7878],
  [2012, 7873],
  [2013, 7918],
  [2014, 7859],
  [2015, 7874],
  [2016, 7820],
  [2017, 7747],
  [2018, 7682],
  [2019, 7615],
  [2020, 8318],
  [2021, 8336],
  [2022, 8364],
  [2023, 8433],
  [2024, 8444],
];

/**
 * 고정 Cushing 시 연간 Census 인구 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-POPZ 런 JSON.
 * @returns 검증된 도시 인구 시계열 또는 오류 상태.
 */
export function readCushingPopulation(value: unknown): CushingPopulationSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; rows?: CushingPopulationRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingPopulationRow;
    const [year, population] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (!Number.isSafeInteger(row.population) || row.population <= 0) return null;
    if (row.population !== population) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingPopulationRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as CushingPopulationSeries;
}

/**
 * 시계열에서 한 연도의 인구를 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Cushing 시 연간 시계열.
 * @param year 연도 (예: 2024).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearPopulation(
  series: CushingPopulationSeries | null,
  year: number,
): CushingPopulationRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
