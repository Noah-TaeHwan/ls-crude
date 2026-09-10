/** Payne County 연간 Census 주택 호수 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface PayneCountyHousingRow {
  year: number;
  housing_units: number;
}
/** Payne County 고정 연간 Census 주택 호수 시계열. 카운티 주택 재고이지 Cushing 시·현장 바쁨이 아니다. */
export interface PayneCountyHousingSeries {
  runId: string;
  geography: string;
  frequency: string;
  rows: PayneCountyHousingRow[];
}

const RUN_ID = "20260910T091HUCZ";
const GEOGRAPHY = "Payne County, Oklahoma";
const FREQUENCY = "annual July 1 estimate";
/** 고정 연도 순서와 공개 주택 호수 [year, housing_units]. 2010–2019는 2010-base 빈티지, 2020–2024는 2020-base 빈티지이다. */
const EXPECTED: Array<[number, number]> = [
  [2010, 34011],
  [2011, 34098],
  [2012, 34363],
  [2013, 34594],
  [2014, 35298],
  [2015, 35569],
  [2016, 36033],
  [2017, 36361],
  [2018, 36763],
  [2019, 36859],
  [2020, 36732],
  [2021, 36835],
  [2022, 37058],
  [2023, 37258],
  [2024, 37437],
];

/**
 * 고정 Payne County 연간 Census 주택 호수 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-HUCZ 런 JSON.
 * @returns 검증된 카운티 주택 시계열 또는 오류 상태.
 */
export function readPayneCountyHousing(value: unknown): PayneCountyHousingSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; rows?: PayneCountyHousingRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneCountyHousingRow;
    const [year, housingUnits] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (!Number.isSafeInteger(row.housing_units) || row.housing_units <= 0) return null;
    if (row.housing_units !== housingUnits) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneCountyHousingRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as PayneCountyHousingSeries;
}

/**
 * 시계열에서 한 연도의 주택 호수를 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Payne County 연간 시계열.
 * @param year 연도 (예: 2024).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearHousingUnits(
  series: PayneCountyHousingSeries | null,
  year: number,
): PayneCountyHousingRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
