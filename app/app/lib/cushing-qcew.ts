/** Payne County QCEW 한 행. 비공개 셀은 null이며 0으로 채우지 않는다. */
export interface PayneQcewRow {
  ownCode: string;
  industryCode: string;
  month1: number | null;
  month2: number | null;
  month3: number | null;
  disclosed: boolean;
}
/** Payne County QCEW 고정 슬라이스. Cushing 시가 아니라 카운티 문맥이다. */
export interface PayneQcewSlice {
  runId: string;
  areaFips: string;
  geography: string;
  year: number;
  qtr: number;
  rows: PayneQcewRow[];
}

const RUN_ID = "20260909T091QCEWZ";
const AREA_FIPS = "40119";
const GEOGRAPHY = "Payne County, Oklahoma";
const YEAR = 2025;
const QTR = 1;
/** 고정 행 순서와 2025-03 공개값. 순서가 바뀌거나 값이 어긋나면 null. */
const EXPECTED: Array<[string, string, number | null]> = [
  ["0", "10", 35418],
  ["5", "21", 402],
  ["5", "211", null],
  ["5", "212", null],
  ["5", "213", 282],
  ["5", "213112", 231],
  ["5", "721", 450],
];
const MARCH_SUM = 36783;

/**
 * 고정 Payne County QCEW 슬라이스를 검사한다. 비공개 셀을 0으로 채우지 않는다.
 * @param value 091-QCEW-Z 런 JSON.
 * @returns 검증된 카운티 슬라이스 또는 오류 상태.
 */
export function readPayneQcew(value: unknown): PayneQcewSlice | null {
  const v = value as { runId?: unknown; areaFips?: unknown; geography?: unknown; year?: unknown; qtr?: unknown; rows?: PayneQcewRow[] };
  if (!v || v.runId !== RUN_ID || v.areaFips !== AREA_FIPS || v.geography !== GEOGRAPHY) return null;
  if (v.year !== YEAR || v.qtr !== QTR) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  let marchSum = 0;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneQcewRow;
    const [ownCode, industryCode, march] = EXPECTED[i];
    if (!row || row.ownCode !== ownCode || row.industryCode !== industryCode) return null;
    if (march === null) {
      if (row.disclosed !== false || row.month1 !== null || row.month2 !== null || row.month3 !== null) return null;
    } else {
      if (row.disclosed !== true) return null;
      for (const m of [row.month1, row.month2, row.month3]) {
        if (!Number.isSafeInteger(m) || (m as number) < 0) return null;
      }
      if (row.month3 !== march) return null;
      marchSum += row.month3 as number;
    }
  }
  if (marchSum !== MARCH_SUM) return null;
  return v as PayneQcewSlice;
}

/**
 * 슬라이스에서 2025-03 고용을 꺼낸다. 비공개 셀은 null이다.
 * @param slice 검증된 Payne County 슬라이스.
 * @param ownCode 소유 코드 (예: "0", "5").
 * @param industryCode 산업 코드 (예: "10", "21", "721").
 * @returns 2025-03 고용 또는 비공개 시 null.
 */
export function marchEmployment(slice: PayneQcewSlice | null, ownCode: string, industryCode: string): number | null {
  if (!slice || slice.runId !== RUN_ID) return null;
  const row = slice.rows.find((r) => r.ownCode === ownCode && r.industryCode === industryCode);
  if (!row) return null;
  return row.month3;
}
