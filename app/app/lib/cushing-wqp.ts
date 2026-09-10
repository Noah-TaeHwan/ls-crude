/** WQP Cushing/Payne 주변 pH 시료 한 행. 날짜·활동·값을 제출 그대로 두며 결측을 0으로 채우지 않는다. 유량·수위·점검·DMR이 아니다. */
export interface CushingWqpSample {
  /** 시료 일자(ISO). 결측 없음이 보장되며 임의 날짜로 채우지 않는다. */
  date: string;
  /** 시료 시각(HH:MM:SS). 제출에 없으면 null이며 00:00:00으로 채우지 않는다. */
  time: string | null;
  /** 제출된 활동 식별자. 같은 값이 두 표기로 중복 제출된 행도 그대로 둔다. */
  activityId: string;
  /** 제출된 활동 종류. Field Msr/Obs 또는 Quality Control Field Replicate Msr/Obs만 허용한다. */
  activityType: string;
  /** 제출된 pH. 2009-05-05의 0.0도 제출 그대로 두며 고치거나 버리지 않는다. */
  ph: number;
  /** 제출된 상태. 전부 Final이다. */
  status: string;
}
/** WQP Cushing/Payne 주변 pH 시료 날짜 목록. 바쁨·WTI·유량·수위·점검·DMR이 아니다. */
export interface CushingWqpSeries {
  runId: string;
  siteId: string;
  stationName: string;
  organization: string;
  county: string;
  characteristic: string;
  unit: string;
  rows: CushingWqpSample[];
}

const RUN_ID = "20260910T091WQPZ";
const SITE_ID = "IOWATROK_WQX-SND1";
const STATION_NAME = "Sand1";
const ORGANIZATION = "IOWATROK_WQX";
const COUNTY = "Payne";
const CHARACTERISTIC = "pH";
const UNIT = "None";
const ROW_COUNT = 366;
const FIRST_DATE = "2005-09-01";
const LAST_DATE = "2021-09-17";
/** 고정 체크섬: 전 행 Math.round(ph*100) 합. 제출된 0.0과 QC 반복을 포함한다. */
const HUNDREDTHS_SUM = 297220;
/** 제출된 활동 종류 외는 거부한다. 중복 표기 활동을 솎아내지 않는다. */
const ACTIVITY_RE = /^(Field Msr\/Obs|Quality Control Field Replicate Msr\/Obs)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

/**
 * 고정 WQP Cushing/Payne 주변 pH 시료 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않고 유량·점검 행을 섞지 않는다.
 * @param value 091-WQPZ 런 JSON.
 * @returns 검증된 시료 목록 또는 오류 상태.
 */
export function readCushingWqp(value: unknown): CushingWqpSeries | null {
  const v = value as { runId?: unknown; siteId?: unknown; stationName?: unknown; organization?: unknown; county?: unknown; characteristic?: unknown; unit?: unknown; rows?: CushingWqpSample[] };
  if (!v || v.runId !== RUN_ID || v.siteId !== SITE_ID) return null;
  if (v.stationName !== STATION_NAME || v.organization !== ORGANIZATION) return null;
  if (v.county !== COUNTY || v.characteristic !== CHARACTERISTIC || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== ROW_COUNT) return null;
  if ((v.rows[0] as CushingWqpSample).date !== FIRST_DATE) return null;
  if ((v.rows[ROW_COUNT - 1] as CushingWqpSample).date !== LAST_DATE) return null;
  let hundSum = 0;
  let prevDate = "";
  let prevTime = "";
  let prevActivity = "";
  let prevPh = -1;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as CushingWqpSample;
    if (!row || typeof row.date !== "string" || !ISO_DATE.test(row.date)) return null;
    if (row.time !== null && (typeof row.time !== "string" || !ISO_TIME.test(row.time))) return null;
    if (typeof row.activityId !== "string" || row.activityId.length === 0) return null;
    if (typeof row.activityType !== "string" || !ACTIVITY_RE.test(row.activityType)) return null;
    // pH 척도 0..14. 제출된 0.0을 0 채움과 혼동하여 버리지 않는다.
    if (typeof row.ph !== "number" || !Number.isFinite(row.ph) || row.ph < 0 || row.ph > 14) return null;
    if (row.status !== "Final") return null;
    // 제출 순서(날짜, 시각, 활동 식별자, 값)를 항목별로 고정한다. 시각 null은 "~"로 두어 00:00:00과 혼동하지 않으며 결측 날짜를 채우지 않는다.
    const timeKey = row.time ?? "~";
    if (i > 0) {
      if (prevDate > row.date) return null;
      else if (prevDate === row.date && prevTime > timeKey) return null;
      else if (prevDate === row.date && prevTime === timeKey && prevActivity > row.activityId) return null;
      else if (prevDate === row.date && prevTime === timeKey && prevActivity === row.activityId && prevPh > row.ph) return null;
    }
    prevDate = row.date;
    prevTime = timeKey;
    prevActivity = row.activityId;
    prevPh = row.ph;
    hundSum += Math.round(row.ph * 100);
  }
  if (hundSum !== HUNDREDTHS_SUM) return null;
  return v as CushingWqpSeries;
}

/**
 * 지정 날짜의 pH 시료를 꺼낸다. 하루에 여러 제출 행이 있을 수 있다.
 * @param series 검증된 WQP Cushing/Payne 주변 pH 시료 목록.
 * @param date 날짜 (예: 2011-01-27).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function wqpSamplesOn(series: CushingWqpSeries | null, date: string): CushingWqpSample[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.date === date);
}
