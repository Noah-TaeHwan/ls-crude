/** KCUH 일별 공항 기상 한 점. 결측은 null이며 0으로 채우지 않는다. */
export interface KcuhDailyRow {
  date: string;
  maxTempF: number | null;
  minTempF: number | null;
  precipIn: number | null;
}
/** KCUH 고정 일별 기상 시계열. 교란변수(confounder)이며 활동량이 아니다. */
export interface KcuhDailySeries {
  runId: string;
  station: string;
  network: string;
  label: string;
  source: string;
  rows: KcuhDailyRow[];
}

const RUN_ID = "20260910T091KCUHZ";
const STATION = "CUH";
const NETWORK = "OK_ASOS";
const SOURCE = "Iowa Environmental Mesonet daily ASOS summary for Cushing Municipal Airport (CUH)";
const LABEL = "KCUH daily airport weather, confounder, not activity";
const FIRST_DATE = "2015-01-01";
const LAST_DATE = "2026-09-08";
const DAY_COUNT = 4269;
/** 고정 체크섬: 공개된 일최고기온 Math.round 합. */
const MAX_TEMP_SUM = 307313;
/** 고정 체크섬: 공개된 일최저기온 Math.round 합. */
const MIN_TEMP_SUM = 211219;
/** 고정 체크섬: 공개된 강수량 Math.round(in*10000) 합. trace 0.0001은 제외. */
const PRECIP_SUM = 5058800;
const NULL_TEMP_DAYS = 38;
const NULL_PRECIP_DAYS = 3406;

/**
 * YYYY-MM-DD가 실제 달력 날짜인지 검사한다.
 * @param date 검사할 날짜 문자열.
 * @returns 유효하면 true, 아니면 false.
 */
function isCalendarDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === date;
}

/**
 * 다음 달력 날짜를 구한다. 날짜 연속성을 검사하는 데 쓴다.
 * @param date YYYY-MM-DD 형식의 날짜.
 * @returns 다음 날짜 문자열, 형식이 아니면 null.
 */
function nextDay(date: string): string | null {
  if (!isCalendarDate(date)) return null;
  return new Date(Date.parse(`${date}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
}

/**
 * 공개된 온도 관측인지 검사한다. 결측 null은 그대로 둔다.
 * @param value 일최고 또는 일최저기온 후보.
 * @returns 유한한 오클라호마 범위 기온 또는 null.
 */
function optionalTemp(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < -40 || value > 130) return null;
  return value;
}

/**
 * 공개된 강수량 관측인지 검사한다. 결측 null은 그대로 둔다.
 * @param value 일강수량 후보 (인치).
 * @returns 0 이상의 유한 숫자 또는 null.
 */
function optionalPrecip(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0) return null;
  return value;
}

/**
 * 고정 KCUH 일별 공항 기상 시계열을 검사한다. 결측을 0으로 채우지 않는다.
 * @param value 091-KCUH-Z 런 JSON.
 * @returns 검증된 기상 시계열 또는 오류 상태.
 */
export function readKcuhDaily(value: unknown): KcuhDailySeries | null {
  const v = value as { runId?: unknown; station?: unknown; network?: unknown; label?: unknown; source?: unknown; rows?: KcuhDailyRow[] };
  if (!v || v.runId !== RUN_ID || v.station !== STATION || v.network !== NETWORK) return null;
  if (v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== DAY_COUNT) return null;
  let maxSum = 0;
  let minSum = 0;
  let precipSum = 0;
  let nullTemp = 0;
  let nullPrecip = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as KcuhDailyRow;
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (!isCalendarDate(row.date)) return null;
    if (i === 0 ? row.date !== FIRST_DATE : nextDay((v.rows[i - 1] as KcuhDailyRow).date) !== row.date) return null;
    const max = optionalTemp(row.maxTempF);
    const min = optionalTemp(row.minTempF);
    if (row.maxTempF !== max || row.minTempF !== min) return null;
    if ((max === null) !== (min === null)) return null;
    if (max === null || min === null) {
      nullTemp++;
    } else {
      if (max < min) return null;
      maxSum += Math.round(max);
      minSum += Math.round(min);
    }
    const precip = optionalPrecip(row.precipIn);
    if (row.precipIn !== precip) return null;
    if (precip === null) {
      nullPrecip++;
    } else {
      precipSum += Math.round(precip * 10000);
    }
  }
  if ((v.rows[v.rows.length - 1] as KcuhDailyRow).date !== LAST_DATE) return null;
  if (maxSum !== MAX_TEMP_SUM || minSum !== MIN_TEMP_SUM || precipSum !== PRECIP_SUM) return null;
  if (nullTemp !== NULL_TEMP_DAYS || nullPrecip !== NULL_PRECIP_DAYS) return null;
  return v as KcuhDailySeries;
}

/**
 * 시계열에서 하루의 기상을 꺼낸다. 결측 필드는 null이다.
 * @param series 검증된 KCUH 일별 시계열.
 * @param date YYYY-MM-DD 형식의 날짜 (예: 2026-09-08).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function dayWeather(
  series: KcuhDailySeries | null,
  date: string,
): KcuhDailyRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
