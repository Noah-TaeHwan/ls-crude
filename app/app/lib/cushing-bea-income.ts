/** Payne County 연간 BEA CAINC1 개인소득 한 점. 단위는 파일 표기 그대로 수천 달러이며 결측 연도는 행 자체가 없다. */
export interface PayneCountyIncomeRow {
  year: number;
  personal_income_thousands_dollars: number;
}
/** Payne County 고정 연간 BEA CAINC1 개인소득 시계열. 카운티 소득이지 Cushing 시·현장 바쁨이 아니다. */
export interface PayneCountyIncomeSeries {
  runId: string;
  geography: string;
  countyCode: string;
  frequency: string;
  unit: string;
  rows: PayneCountyIncomeRow[];
}

const RUN_ID = "20260910T091INCZ";
const GEOGRAPHY = "Payne County, Oklahoma";
const COUNTY_CODE = "40119";
const FREQUENCY = "annual";
const UNIT = "Thousands of dollars";
/** 고정 연도 순서와 공개 개인소득 [year, thousands_of_dollars]. 파일 표기 단위 그대로이며 변환하지 않는다. */
const EXPECTED: Array<[number, number]> = [
  [1969, 121389],
  [1970, 136389],
  [1971, 153525],
  [1972, 168345],
  [1973, 184465],
  [1974, 211973],
  [1975, 244169],
  [1976, 274408],
  [1977, 316822],
  [1978, 359747],
  [1979, 402215],
  [1980, 460604],
  [1981, 536554],
  [1982, 600374],
  [1983, 629903],
  [1984, 670031],
  [1985, 709561],
  [1986, 726488],
  [1987, 726567],
  [1988, 757644],
  [1989, 839408],
  [1990, 884507],
  [1991, 930606],
  [1992, 984409],
  [1993, 1013968],
  [1994, 1068998],
  [1995, 1126015],
  [1996, 1187687],
  [1997, 1259236],
  [1998, 1284684],
  [1999, 1353965],
  [2000, 1475112],
  [2001, 1528909],
  [2002, 1570310],
  [2003, 1701175],
  [2004, 1767868],
  [2005, 1849153],
  [2006, 2064354],
  [2007, 2209285],
  [2008, 2402644],
  [2009, 2318100],
  [2010, 2436434],
  [2011, 2557252],
  [2012, 2619882],
  [2013, 2680787],
  [2014, 2941424],
  [2015, 2872117],
  [2016, 2807788],
  [2017, 2870362],
  [2018, 3009941],
  [2019, 3138347],
  [2020, 3351840],
  [2021, 3634980],
  [2022, 3687122],
  [2023, 3892570],
  [2024, 4121797],
];

/**
 * 고정 Payne County 연간 BEA CAINC1 개인소득 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-INCZ 런 JSON.
 * @returns 검증된 카운티 소득 시계열 또는 오류 상태.
 */
export function readPayneCountyIncome(value: unknown): PayneCountyIncomeSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; countyCode?: unknown; frequency?: unknown; unit?: unknown; rows?: PayneCountyIncomeRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.countyCode !== COUNTY_CODE || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneCountyIncomeRow;
    const [year, income] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (!Number.isSafeInteger(row.personal_income_thousands_dollars) || row.personal_income_thousands_dollars <= 0) return null;
    if (row.personal_income_thousands_dollars !== income) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneCountyIncomeRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as PayneCountyIncomeSeries;
}

/**
 * 시계열에서 한 연도의 개인소득을 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Payne County 연간 시계열.
 * @param year 연도 (예: 2024).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearPersonalIncome(
  series: PayneCountyIncomeSeries | null,
  year: number,
): PayneCountyIncomeRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
