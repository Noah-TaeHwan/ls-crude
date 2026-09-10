/** Payne County 연간 PEP 인구 변동 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface PayneCountyComponentRow {
  year: number;
  population: number;
  births: number;
  deaths: number;
  natural_change: number;
  international_mig: number;
  domestic_mig: number;
  net_mig: number;
}
/** Payne County 고정 연간 PEP 인구 변동 시계열. 카운티 인구 통계이지 현장 바쁨이 아니다. */
export interface PayneCountyComponentSeries {
  runId: string;
  geography: string;
  countyFips: string;
  frequency: string;
  rows: PayneCountyComponentRow[];
}

const RUN_ID = "20260910T091COCZ";
const GEOGRAPHY = "Payne County, Oklahoma";
const COUNTY_FIPS = "40119";
const FREQUENCY = "annual July 1 estimate";
/**
 * 고정 연도 순서와 공개 변동 [year, population, births, deaths,
 * natural_change, international_mig, domestic_mig, net_mig].
 * 2010–2019는 2010-base 빈티지, 2020–2024는 2020-base 빈티지이다.
 */
const EXPECTED: Array<[number, number, number, number, number, number, number, number]> = [
  [2010, 77416, 209, 102, 107, 50, -86, -36],
  [2011, 78238, 935, 530, 405, 559, -143, 416],
  [2012, 78725, 875, 568, 307, 349, -166, 183],
  [2013, 79698, 935, 542, 393, 428, 165, 593],
  [2014, 80520, 893, 539, 354, 465, 17, 482],
  [2015, 81363, 946, 567, 379, 755, -289, 466],
  [2016, 81850, 909, 565, 344, 433, -290, 143],
  [2017, 81908, 845, 592, 253, 309, -508, -199],
  [2018, 82172, 829, 592, 237, 390, -367, 23],
  [2019, 81784, 815, 592, 223, 396, -1014, -618],
  [2020, 81649, 182, 146, 36, 14, -65, -51],
  [2021, 82166, 723, 706, 17, 153, 286, 439],
  [2022, 83029, 781, 788, -7, 668, 261, 929],
  [2023, 83819, 754, 675, 79, 604, 122, 726],
  [2024, 84199, 748, 689, 59, 744, -433, 311],
];

/**
 * 고정 Payne County 연간 PEP 인구 변동 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-COCZ 런 JSON.
 * @returns 검증된 카운티 변동 시계열 또는 오류 상태.
 */
export function readPayneCountyComponents(value: unknown): PayneCountyComponentSeries | null {
  const v = value as {
    runId?: unknown;
    geography?: unknown;
    countyFips?: unknown;
    frequency?: unknown;
    rows?: PayneCountyComponentRow[];
  };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (v.countyFips !== COUNTY_FIPS || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneCountyComponentRow;
    const [year, population, births, deaths, natural, intl, domestic, net] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (row.population !== population) return null;
    if (!Number.isSafeInteger(row.population) || row.population <= 0) return null;
    if (
      row.births !== births ||
      row.deaths !== deaths ||
      row.natural_change !== natural ||
      row.international_mig !== intl ||
      row.domestic_mig !== domestic ||
      row.net_mig !== net
    ) {
      return null;
    }
    if (row.births < 0 || row.deaths < 0) return null;
    if (row.births - row.deaths !== row.natural_change) return null;
    if (row.international_mig + row.domestic_mig !== row.net_mig) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneCountyComponentRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as PayneCountyComponentSeries;
}

/**
 * 시계열에서 한 연도의 변동을 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Payne County 연간 시계열.
 * @param year 연도 (예: 2024).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearComponents(
  series: PayneCountyComponentSeries | null,
  year: number,
): PayneCountyComponentRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
