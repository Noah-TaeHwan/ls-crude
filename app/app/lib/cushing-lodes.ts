/** Payne County LODES 연간 직장 일자리 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface PayneLodesAnnualRow {
  year: number;
  blocks: number;
  jobs: number;
}
/** Payne County 고정 연간 LODES 직장 고용 시계열. 카운티 문맥이며 Cushing 시가 아니다. */
export interface PayneLodesAnnualSeries {
  runId: string;
  areaFips: string;
  geography: string;
  frequency: string;
  segment: string;
  jobType: string;
  column: string;
  rows: PayneLodesAnnualRow[];
}

const RUN_ID = "20260910T091LODEZ";
const AREA_FIPS = "40119";
const GEOGRAPHY = "Payne County, Oklahoma";
const FREQUENCY = "annual";
const SEGMENT = "S000";
const JOB_TYPE = "JT00";
const COLUMN = "C000";
/** 고정 연도 순서와 공개값 [year, workplace blocks, workplace jobs]. 결측 연도는 없다. */
const EXPECTED: Array<[number, number, number]> = [
  [2002, 654, 31097],
  [2003, 642, 31134],
  [2004, 645, 31060],
  [2005, 646, 30836],
  [2006, 652, 31422],
  [2007, 687, 32867],
  [2008, 699, 31318],
  [2009, 725, 30872],
  [2010, 730, 30486],
  [2011, 591, 30480],
  [2012, 650, 31273],
  [2013, 660, 31282],
  [2014, 673, 33594],
  [2015, 695, 32901],
  [2016, 712, 34319],
  [2017, 720, 34506],
  [2018, 721, 34547],
  [2019, 715, 34648],
  [2020, 668, 32875],
  [2021, 688, 32833],
  [2022, 675, 33401],
  [2023, 701, 35589],
];

/**
 * 고정 Payne County 연간 LODES 직장 고용 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-LODEZ 런 JSON.
 * @returns 검증된 카운티 시계열 또는 오류 상태.
 */
export function readPayneLodesAnnual(value: unknown): PayneLodesAnnualSeries | null {
  const v = value as {
    runId?: unknown;
    areaFips?: unknown;
    geography?: unknown;
    frequency?: unknown;
    segment?: unknown;
    jobType?: unknown;
    column?: unknown;
    rows?: PayneLodesAnnualRow[];
  };
  if (
    !v ||
    v.runId !== RUN_ID ||
    v.areaFips !== AREA_FIPS ||
    v.geography !== GEOGRAPHY ||
    v.frequency !== FREQUENCY ||
    v.segment !== SEGMENT ||
    v.jobType !== JOB_TYPE ||
    v.column !== COLUMN
  )
    return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneLodesAnnualRow;
    const [year, blocks, jobs] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (!Number.isSafeInteger(row.blocks) || row.blocks <= 0 || row.blocks !== blocks) return null;
    if (!Number.isSafeInteger(row.jobs) || row.jobs <= 0 || row.jobs !== jobs) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneLodesAnnualRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as PayneLodesAnnualSeries;
}

/**
 * 시계열에서 한 연도의 직장 일자리를 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Payne County 연간 시계열.
 * @param year 연도 (예: 2023).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearWorkplaceJobs(
  series: PayneLodesAnnualSeries | null,
  year: number,
): PayneLodesAnnualRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
