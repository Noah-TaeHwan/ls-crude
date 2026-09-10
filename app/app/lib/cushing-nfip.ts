/** Payne County NFIP 홍수보험 청구 한 건. 날짜는 dateOfLoss의 일자이며 결측 연은 0으로 채우지 않는다. */
export interface CushingNfipClaim {
  claimId: string;
  countyCode: string;
  dateOfLoss: string;
  yearOfLoss: number;
  ratedFloodZone: string;
  /** 지급 없이 종결된 건은 null이며 0으로 채우지 않는다. */
  amountPaidBuilding: number | null;
  /** 지급 없이 종결된 건은 null이며 0으로 채우지 않는다. */
  amountPaidContents: number | null;
  netBuildingPayment: number;
  netContentsPayment: number;
}
/** Payne County NFIP 홍수보험 청구 날짜 목록. 바쁨·WTI·재난선포가 아니다. */
export interface CushingNfipSeries {
  runId: string;
  geography: string;
  rows: CushingNfipClaim[];
}

const RUN_ID = "20260910T091NFIPZ";
const GEOGRAPHY = "Payne County, Oklahoma (state OK, countyCode 40119)";
const COUNTY_CODE = "40119";
const ROW_COUNT = 100;
const FIRST = { dateOfLoss: "1980-06-19", claimId: "6034961" };
const LAST = { dateOfLoss: "2021-06-27", claimId: "7928202" };
/** 고정 검증합 (센트). 지급액 null 행은 합계에서 제외된다. */
const CENTS = {
  amountPaidBuilding: 107090889,
  amountPaidContents: 17696939,
  netBuildingPayment: 105864614,
  netContentsPayment: 17696939,
};
const NULL_PAID_BUILDING = 21;
const NULL_PAID_CONTENTS = 21;

/**
 * 금액을 센트 정수로 바꾼다. null은 건너뛴다.
 * @param rows 검증 대상 청구 목록.
 * @param key 금액 칸 이름.
 * @returns null 제외 합계의 센트 값.
 */
function centsSum(rows: CushingNfipClaim[], key: keyof CushingNfipClaim): number {
  let sum = 0;
  for (const row of rows) {
    const v = row[key] as number | null;
    if (v !== null) sum += Math.round(v * 100);
  }
  return sum;
}

/**
 * 고정 Payne County NFIP 청구 날짜 목록을 검사한다. 오클라호마 카운티(109)로 바꾸지 않는다.
 * @param value 091-NFIP-Z 런 JSON.
 * @returns 검증된 청구 목록 또는 오류 상태.
 */
export function readCushingNfip(value: unknown): CushingNfipSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; rows?: CushingNfipClaim[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== ROW_COUNT) return null;
  let nullPaidBuilding = 0;
  let nullPaidContents = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as CushingNfipClaim;
    if (!row || row.countyCode !== COUNTY_CODE) return null;
    if (typeof row.claimId !== "string" || row.claimId.length === 0) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dateOfLoss)) return null;
    if (!Number.isInteger(row.yearOfLoss) || row.yearOfLoss !== Number(row.dateOfLoss.slice(0, 4))) return null;
    if (typeof row.ratedFloodZone !== "string" || row.ratedFloodZone.length === 0) return null;
    for (const key of ["amountPaidBuilding", "amountPaidContents", "netBuildingPayment", "netContentsPayment"] as const) {
      const amount = row[key];
      if (amount === null) {
        if (key !== "amountPaidBuilding" && key !== "amountPaidContents") return null;
        if (key === "amountPaidBuilding") nullPaidBuilding += 1;
        else nullPaidContents += 1;
      } else if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
        return null;
      }
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingNfipClaim;
      if (prev.dateOfLoss > row.dateOfLoss) return null;
      if (prev.dateOfLoss === row.dateOfLoss && prev.claimId >= row.claimId) return null;
    }
  }
  const first = v.rows[0] as CushingNfipClaim;
  const last = v.rows[v.rows.length - 1] as CushingNfipClaim;
  if (first.dateOfLoss !== FIRST.dateOfLoss || first.claimId !== FIRST.claimId) return null;
  if (last.dateOfLoss !== LAST.dateOfLoss || last.claimId !== LAST.claimId) return null;
  if (nullPaidBuilding !== NULL_PAID_BUILDING || nullPaidContents !== NULL_PAID_CONTENTS) return null;
  if (centsSum(v.rows, "amountPaidBuilding") !== CENTS.amountPaidBuilding) return null;
  if (centsSum(v.rows, "amountPaidContents") !== CENTS.amountPaidContents) return null;
  if (centsSum(v.rows, "netBuildingPayment") !== CENTS.netBuildingPayment) return null;
  if (centsSum(v.rows, "netContentsPayment") !== CENTS.netContentsPayment) return null;
  return v as CushingNfipSeries;
}

/**
 * 지정 손실일의 Payne County 청구를 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 Payne County NFIP 청구 목록.
 * @param dateOfLoss 날짜 (예: 1980-06-19).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function nfipClaimsOn(series: CushingNfipSeries | null, dateOfLoss: string): CushingNfipClaim[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.dateOfLoss === dateOfLoss);
}
