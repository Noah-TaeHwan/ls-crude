/** Cushing High School 연간 재적 한 점. 2023-24는 결측이며 0으로 채우지 않는다. */
export interface CushingEnrollmentRow {
  schoolYear: string;
  enrollment: number;
}
/** Cushing High School 고정 연간 재적 시계열. 도시 전체 바쁨이 아니라 학교 재적이다. */
export interface CushingEnrollmentSeries {
  runId: string;
  geography: string;
  frequency: string;
  rows: CushingEnrollmentRow[];
}

const RUN_ID = "20260910T091PENRZ";
const GEOGRAPHY = "Cushing High School";
const FREQUENCY = "annual school year";
/** 고정 학년도 순서와 공개 재적 [schoolYear, enrollment]. 2023-24 행은 없다. */
const EXPECTED: Array<[string, number]> = [
  ["2019-20", 505],
  ["2020-21", 474],
  ["2021-22", 494],
  ["2022-23", 530],
  ["2024-25", 529],
];

/**
 * 고정 Cushing High School 연간 재적 시계열을 검사한다. 2023-24 결측을 0으로 채우지 않는다.
 * @param value 091-PENRZ 런 JSON.
 * @returns 검증된 학교 재적 시계열 또는 오류 상태.
 */
export function readCushingEnrollment(value: unknown): CushingEnrollmentSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; rows?: CushingEnrollmentRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingEnrollmentRow;
    const [schoolYear, enrollment] = EXPECTED[i];
    if (!row || row.schoolYear !== schoolYear) return null;
    if (!Number.isSafeInteger(row.enrollment) || row.enrollment <= 0) return null;
    if (row.enrollment !== enrollment) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingEnrollmentRow;
      if (prev.schoolYear >= row.schoolYear) return null;
    }
  }
  return v as CushingEnrollmentSeries;
}

/**
 * 시계열에서 한 학년도의 재적을 꺼낸다. 결측 학년도는 null이다.
 * @param series 검증된 Cushing High School 연간 시계열.
 * @param schoolYear 학년도 (예: "2022-23").
 * @returns 해당 학년도 행 또는 없으면 null.
 */
export function schoolYearEnrollment(
  series: CushingEnrollmentSeries | null,
  schoolYear: string,
): CushingEnrollmentRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.schoolYear === schoolYear);
  return row ?? null;
}
