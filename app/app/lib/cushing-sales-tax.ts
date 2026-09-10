/** Cushing 시 OTC 월간 세금 배분 한 점. 배분월 기준이며 결측월은 행 자체가 없고 0으로 채우지 않는다. */
export interface CushingSalesTaxRow {
  period: string;
  sales_tax_usd: number;
  tax_rate: number;
  source_release: string;
}
/** Cushing 시 고정 월간 시세금 징수 시계열. 호텔세가 아니고 카운티·주 전체도 아니다. */
export interface CushingSalesTaxSeries {
  runId: string;
  geography: string;
  frequency: string;
  unit: string;
  rows: CushingSalesTaxRow[];
}

const RUN_ID = "20260910T091STAXZ";
const GEOGRAPHY = "Cushing city, Oklahoma";
const FREQUENCY = "monthly OTC distribution (sparse, printed months only)";
const UNIT = "US dollars (OTC printed distribution amount)";
/** 고정 배분월 순서와 공개 징수액 [period, cents, tax_rate]. 기간은 OTC 배분월이며 영업월로 바꾸지 않는다. */
const EXPECTED: Array<[string, number, number]> = [
  ["2025-08", 55876294, 0.04],
  ["2025-09", 58204472, 0.04],
  ["2026-08", 57369550, 0.04],
  ["2026-09", 57781484, 0.04],
];

/**
 * 고정 Cushing 시 월간 시세금 징수 시계열을 검사한다. 호텔세·카운티 라벨이 섞인 입력은 runId나 지리가 달라 탈락한다.
 * @param value 091-STAXZ 런 JSON.
 * @returns 검증된 시세금 시계열 또는 오류 상태.
 */
export function readCushingSalesTax(value: unknown): CushingSalesTaxSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; unit?: unknown; rows?: CushingSalesTaxRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingSalesTaxRow;
    const [period, cents, tax_rate] = EXPECTED[i];
    if (!row || row.period !== period) return null;
    if (typeof row.sales_tax_usd !== "number" || !Number.isFinite(row.sales_tax_usd)) return null;
    if (Math.round(row.sales_tax_usd * 100) !== cents) return null;
    if (row.sales_tax_usd <= 0) return null;
    if (row.tax_rate !== tax_rate) return null;
    if (typeof row.source_release !== "string" || row.source_release.length === 0) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingSalesTaxRow;
      if (prev.period >= row.period) return null;
    }
  }
  return v as CushingSalesTaxSeries;
}

/**
 * 시계열에서 한 배분월의 징수 행을 꺼낸다. 없는 기간은 null이며 0으로 채우지 않는다.
 * @param series 검증된 Cushing 시세금 시계열.
 * @param period 배분월 (예: "2026-09").
 * @returns 해당 기간 행 또는 없으면 null.
 */
export function periodSalesTax(
  series: CushingSalesTaxSeries | null,
  period: string,
): CushingSalesTaxRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.period === period);
  return row ?? null;
}
