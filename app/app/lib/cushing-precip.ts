/** Cushing 월간 강수 한 달. 결측 월은 null이며 0으로 채우지 않는다. */
export interface CushingPrecipMonthRow {
  period: string;
  precipIn: number | null;
}
/** Cushing 고정 월간 강수 시계열. 기상 교란변수(confounder)이며 활동량·바쁨이 아니다. */
export interface CushingPrecipMonthlySeries {
  runId: string;
  station: string;
  stationName: string;
  label: string;
  source: string;
  rows: CushingPrecipMonthRow[];
}

const RUN_ID = "20260910T091PRCPZ";
const STATION = "US1OKPY0019";
const STATION_NAME = "CUSHING 3.2 E, OK (CoCoRaHS, Payne County)";
const LABEL = "Cushing CUH precipitation, monthly confounder, not activity";
const SOURCE = "NOAA NCEI GHCN-Daily station US1OKPY0019 (CUSHING 3.2 E, OK)";
const MONTH_COUNT = 55;
/** 고정 월 순서와 공개 월강수량 [period YYYY-MM, inches]. null은 일자료가 빠진 월이다. */
const EXPECTED: Array<[string, number | null]> = [
  ["2017-05", null],
  ["2017-06", 2.22],
  ["2017-07", 2.929],
  ["2017-08", null],
  ["2017-09", 1.823],
  ["2017-10", 5.669],
  ["2017-11", 0.524],
  ["2017-12", 1.008],
  ["2018-01", 0.209],
  ["2018-02", 4.063],
  ["2018-03", 1.043],
  ["2018-04", 2.272],
  ["2018-05", 3.571],
  ["2018-06", null],
  ["2018-07", 3.689],
  ["2018-08", null],
  ["2018-09", 3.906],
  ["2018-10", 2.571],
  ["2018-11", 0.606],
  ["2018-12", null],
  ["2019-01", 3.508],
  ["2019-02", 1.244],
  ["2019-03", null],
  ["2019-04", 4.031],
  ["2019-05", 15.791],
  ["2019-06", 5.441],
  ["2019-07", null],
  ["2019-08", 11.079],
  ["2019-09", 6.031],
  ["2019-10", 4.512],
  ["2019-11", 3.453],
  ["2019-12", 1.449],
  ["2020-01", 3.795],
  ["2020-02", 1.236],
  ["2020-03", 6.606],
  ["2020-04", 2.0],
  ["2020-05", 3.484],
  ["2020-06", 1.189],
  ["2020-07", 6.555],
  ["2020-08", 1.5],
  ["2020-09", 3.531],
  ["2020-10", 5.449],
  ["2020-11", 1.224],
  ["2020-12", 2.362],
  ["2021-01", 3.031],
  ["2021-02", 0.646],
  ["2021-03", 3.106],
  ["2021-04", 4.791],
  ["2021-05", 6.244],
  ["2021-06", 11.508],
  ["2021-07", 3.803],
  ["2021-08", 2.791],
  ["2021-09", 0.0],
  ["2021-10", 9.031],
  ["2021-11", null],
];
/** 고정 체크섬: 공개된 월강수량 Math.round(in*1000) 합. */
const THOUSANDTHS_SUM = 176524;
const DISCLOSED_MONTHS = 47;
const NULL_MONTHS = 8;

/**
 * YYYY-MM 다음 달을 구한다. 월 연속성을 검사하는 데 쓴다.
 * @param period YYYY-MM 형식의 월.
 * @returns 다음 월 문자열, 형식이 아니면 null.
 */
function nextMonth(period: string): string | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return null;
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

/**
 * 고정 Cushing 월간 강수 시계열을 검사한다. 결측 월을 0으로 채우지 않는다.
 * @param value 091-PRCPZ 런 JSON.
 * @returns 검증된 월간 강수 시계열 또는 오류 상태.
 */
export function readCushingPrecipMonthly(value: unknown): CushingPrecipMonthlySeries | null {
  const v = value as { runId?: unknown; station?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: CushingPrecipMonthRow[] };
  if (!v || v.runId !== RUN_ID || v.station !== STATION || v.stationName !== STATION_NAME) return null;
  if (v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  let thouSum = 0;
  let disclosed = 0;
  let nulls = 0;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingPrecipMonthRow;
    const [period, precip] = EXPECTED[i];
    if (!row || row.period !== period) return null;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period)) return null;
    if (i > 0) {
      const prev = nextMonth((v.rows[i - 1] as CushingPrecipMonthRow).period);
      if (prev !== row.period) return null;
    }
    if (precip === null) {
      if (row.precipIn !== null) return null;
      nulls += 1;
    } else {
      if (typeof row.precipIn !== "number" || !Number.isFinite(row.precipIn)) return null;
      if (row.precipIn < 0 || row.precipIn > 60) return null;
      if (row.precipIn !== precip) return null;
      thouSum += Math.round(row.precipIn * 1000);
      disclosed += 1;
    }
  }
  if (thouSum !== THOUSANDTHS_SUM || disclosed !== DISCLOSED_MONTHS || nulls !== NULL_MONTHS) return null;
  return v as CushingPrecipMonthlySeries;
}

/**
 * 시계열에서 한 달의 강수량을 꺼낸다. 일자료가 빠진 월은 null 행을 돌려준다.
 * @param series 검증된 Cushing 월간 강수 시계열.
 * @param period 조회 월 (YYYY-MM, 예: 2019-05).
 * @returns 해당 월 행 또는 없으면 null.
 */
export function monthPrecip(
  series: CushingPrecipMonthlySeries | null,
  period: string,
): CushingPrecipMonthRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.period === period);
  return row ?? null;
}
