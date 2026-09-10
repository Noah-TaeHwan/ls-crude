/** ZIP 74023 연간 IRS SOI 개인소득세 한 점. 신고 건수는 filed count, AGI는 파일 표기 그대로 수천 달러이며 결측 연도는 행 자체가 없다. */
export interface CushingIrsSoiRow {
  year: number;
  returns_n1: number;
  agi_thousands_dollars: number;
}
/** ZIP 74023 고정 연간 IRS SOI 개인소득세 시계열. ZIP 세금 통계이지 BEA 카운티 소득·Cushing 시·현장 바쁨이 아니다. */
export interface CushingIrsSoiSeries {
  runId: string;
  geography: string;
  zipCode: string;
  frequency: string;
  unit: string;
  rows: CushingIrsSoiRow[];
}

const RUN_ID = "20260910T091SOIZ";
const GEOGRAPHY = "ZIP 74023, Oklahoma (Cushing)";
const ZIP_CODE = "74023";
const FREQUENCY = "annual";
const UNIT = "Returns are counts as filed; AGI amounts are thousands of dollars as filed";
/** 고정 연도 순서와 공개 세금 통계 [year, N1 returns, A00100 AGI thousands]. 파일 표기 단위 그대로이며 변환하지 않는다. */
const EXPECTED: Array<[number, number, number]> = [
  [2016, 4200, 221534],
  [2017, 4170, 230771],
  [2018, 4100, 230777],
  [2019, 4210, 245267],
  [2020, 4350, 224685],
  [2021, 4110, 230573],
  [2022, 4190, 250763],
];

/**
 * 고정 ZIP 74023 연간 IRS SOI 개인소득세 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-SOIZ 런 JSON.
 * @returns 검증된 ZIP 세금 시계열 또는 오류 상태.
 */
export function readCushingIrsSoi(value: unknown): CushingIrsSoiSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; zipCode?: unknown; frequency?: unknown; unit?: unknown; rows?: CushingIrsSoiRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.zipCode !== ZIP_CODE || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingIrsSoiRow;
    const [year, returnsN1, agi] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (!Number.isSafeInteger(row.returns_n1) || row.returns_n1 <= 0) return null;
    if (!Number.isSafeInteger(row.agi_thousands_dollars) || row.agi_thousands_dollars <= 0) return null;
    if (row.returns_n1 !== returnsN1) return null;
    if (row.agi_thousands_dollars !== agi) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingIrsSoiRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as CushingIrsSoiSeries;
}

/**
 * 시계열에서 한 과세연도의 신고 건수와 AGI를 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 ZIP 74023 연간 시계열.
 * @param year 과세연도 (예: 2022).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearIrsSoi(
  series: CushingIrsSoiSeries | null,
  year: number,
): CushingIrsSoiRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
