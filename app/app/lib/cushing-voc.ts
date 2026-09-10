/** Cushing 시 터미널 맥락 연간 VOC 한 점. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingVocRow {
  year: number;
  layerId: number;
  terminalLikeOperatingRows: number;
  vocTons: number;
  hapTons: number;
}
/** Cushing 시 고정 연간 터미널 맥락 VOC 시계열. AQI도 바쁨도 아니다. */
export interface CushingVocSeries {
  runId: string;
  geography: string;
  frequency: string;
  rows: CushingVocRow[];
}

const RUN_ID = "20260910T091VOCYZ";
const GEOGRAPHY =
  "Cushing city (City = Cushing), terminal-like name filter TERMINAL/TANK FARM/CRUDE, Status = Operating";
const FREQUENCY = "annual, DEQ Year_Emissions_Reported";
/** 고정 연도 순서와 공개 연간 톤수 [year, layerId, rows, vocTons, hapTons]. 합계 검증은 disclosed 합으로 한다. */
const EXPECTED: Array<[number, number, number, number, number]> = [
  [2020, 5, 17, 1440.861, 21.278],
  [2021, 7, 18, 1399.065, 20.77],
  [2022, 6, 18, 1177.399, 21.819],
  [2023, 1, 18, 1247.22, 22.802],
  [2024, 8, 17, 1206.389, 19.715],
];

/**
 * 고정 Cushing 시 연간 터미널 맥락 VOC 시계열을 검사한다. 결측 연도를 0으로 채우지 않는다.
 * @param value 091-VOCYZ 런 JSON.
 * @returns 검증된 VOC 시계열 또는 오류 상태.
 */
export function readCushingVoc(value: unknown): CushingVocSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; rows?: CushingVocRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingVocRow;
    const [year, layerId, rows, vocTons, hapTons] = EXPECTED[i];
    if (!row || row.year !== year) return null;
    if (row.layerId !== layerId) return null;
    if (!Number.isSafeInteger(row.terminalLikeOperatingRows) || row.terminalLikeOperatingRows !== rows) return null;
    if (typeof row.vocTons !== "number" || row.vocTons !== vocTons) return null;
    if (typeof row.hapTons !== "number" || row.hapTons !== hapTons) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingVocRow;
      if (prev.year >= row.year) return null;
    }
  }
  return v as CushingVocSeries;
}

/**
 * 시계열에서 한 연도의 VOC 행을 꺼낸다. 결측 연도는 null이다.
 * @param series 검증된 Cushing 시 연간 VOC 시계열.
 * @param year 연도 (예: 2024).
 * @returns 해당 연도 행 또는 없으면 null.
 */
export function yearVoc(
  series: CushingVocSeries | null,
  year: number,
): CushingVocRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year);
  return row ?? null;
}
