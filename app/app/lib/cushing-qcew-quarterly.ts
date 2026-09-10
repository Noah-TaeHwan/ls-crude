/** Payne County QCEW 분기 시계열 한 점. 비공개 셀은 null이며 0으로 채우지 않는다. */
export interface PayneQcewQuarterRow {
  year: number;
  qtr: number;
  month: number;
  totalCovered: number | null;
  privateMining21: number | null;
}
/** Payne County QCEW 고정 분기 시계열. Cushing 시가 아니라 카운티 문맥이다. */
export interface PayneQcewQuarterlySeries {
  runId: string;
  areaFips: string;
  geography: string;
  rows: PayneQcewQuarterRow[];
}

const RUN_ID = "20260909T091QCEWQZ";
const AREA_FIPS = "40119";
const GEOGRAPHY = "Payne County, Oklahoma";
/** 고정 분기 순서와 month3 공개값 [year, qtr, month, total, mining]. null은 비공개이다. */
const EXPECTED: Array<[number, number, number, number | null, number | null]> = [
  [2015, 1, 3, 33207, 994],
  [2015, 2, 6, 33016, 881],
  [2015, 3, 9, 34245, 789],
  [2015, 4, 12, 33882, 710],
  [2016, 1, 3, 33536, 618],
  [2016, 2, 6, 32941, 612],
  [2016, 3, 9, 34307, 623],
  [2016, 4, 12, 33847, 659],
  [2017, 1, 3, 33527, 672],
  [2017, 2, 6, 32164, 708],
  [2017, 3, 9, 33072, 883],
  [2017, 4, 12, 34218, 873],
  [2018, 1, 3, 34176, 818],
  [2018, 2, 6, 32249, 873],
  [2018, 3, 9, 33904, 761],
  [2018, 4, 12, 33909, 806],
  [2019, 1, 3, 33977, 745],
  [2019, 2, 6, 33033, 717],
  [2019, 3, 9, 33346, 690],
  [2019, 4, 12, 33782, 547],
  [2020, 1, 3, 33393, 449],
  [2020, 2, 6, 31160, 373],
  [2020, 3, 9, 31721, 325],
  [2020, 4, 12, 32299, 303],
  [2021, 1, 3, 31696, 330],
  [2021, 2, 6, 31368, 329],
  [2021, 3, 9, 33024, 332],
  [2021, 4, 12, 33183, 326],
  [2022, 1, 3, 33373, 358],
  [2022, 2, 6, 32813, 394],
  [2022, 3, 9, 34258, 454],
  [2022, 4, 12, 34166, 462],
  [2023, 1, 3, 34566, 434],
  [2023, 2, 6, 34159, 429],
  [2023, 3, 9, 35212, 412],
  [2023, 4, 12, 34943, 408],
  [2024, 1, 3, 35324, 416],
  [2024, 2, 6, 34614, 429],
  [2024, 3, 9, 35581, 432],
  [2024, 4, 12, 35503, 416],
  [2025, 1, 3, 35418, 402],
  [2025, 2, 6, 34651, 390],
  [2025, 3, 9, 35349, 365],
  [2025, 4, 12, 35418, 338],
  [2026, 1, 3, 35001, 345],
];

/**
 * 고정 Payne County QCEW 분기 시계열을 검사한다. 비공개 셀을 0으로 채우지 않는다.
 * @param value 091-QCEW-QZ 런 JSON.
 * @returns 검증된 카운티 시계열 또는 오류 상태.
 */
export function readPayneQcewQuarterly(value: unknown): PayneQcewQuarterlySeries | null {
  const v = value as { runId?: unknown; areaFips?: unknown; geography?: unknown; rows?: PayneQcewQuarterRow[] };
  if (!v || v.runId !== RUN_ID || v.areaFips !== AREA_FIPS || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneQcewQuarterRow;
    const [year, qtr, month, total, mining] = EXPECTED[i];
    if (!row || row.year !== year || row.qtr !== qtr || row.month !== month) return null;
    if (row.month !== row.qtr * 3) return null;
    for (const [actual, frozen] of [[row.totalCovered, total], [row.privateMining21, mining]] as const) {
      if (frozen === null) {
        if (actual !== null) return null;
      } else {
        if (!Number.isSafeInteger(actual) || (actual as number) < 0) return null;
        if (actual !== frozen) return null;
      }
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneQcewQuarterRow;
      if (prev.year > row.year || (prev.year === row.year && prev.qtr >= row.qtr)) return null;
    }
  }
  return v as PayneQcewQuarterlySeries;
}

/**
 * 시계열에서 한 분기의 고용을 꺼낸다. 비공개 셀은 null이다.
 * @param series 검증된 Payne County 분기 시계열.
 * @param year 연도 (예: 2025).
 * @param qtr 분기 (1–4).
 * @returns 해당 분기 행 또는 없으면 null.
 */
export function quarterEmployment(
  series: PayneQcewQuarterlySeries | null,
  year: number,
  qtr: number,
): PayneQcewQuarterRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.year === year && r.qtr === qtr);
  return row ?? null;
}
