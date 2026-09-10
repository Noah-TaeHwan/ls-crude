/** Mesonet OILT 일별 기상 한 점. 결측은 null이며 0으로 채우지 않는다. */
export interface MesonetDailyRow {
  date: string;
  tmaxF: number | null;
  tminF: number | null;
  tavgF: number | null;
  rainIn: number | null;
}
/** Mesonet OILT 고정 일별 기상 시계열. 교란변수(confounder)이며 활동량이 아니다. */
export interface MesonetDailySeries {
  runId: string;
  station: string;
  stationName: string;
  label: string;
  source: string;
  rows: MesonetDailyRow[];
}

const RUN_ID = "20260910T091MESOZ";
const STATION = "OILT";
const STATION_NAME = "Oilton, OK (Oklahoma Mesonet, 36.03,-96.50)";
const LABEL = "Mesonet nearest Cushing daily weather, confounder, not activity";
const SOURCE = "Oklahoma Mesonet monthly .mts daily summaries for OILT (public, keyless)";
const FIRST_DATE = "2015-01-01";
const LAST_DATE = "2026-09-08";
const DAY_COUNT = 4269;
/** 고정 체크섬: 공개된 일최고기온 Math.round(F*100) 합. */
const TMAX_SUM = 30206129;
/** 고정 체크섬: 공개된 일최저기온 Math.round(F*100) 합. */
const TMIN_SUM = 20148358;
/** 고정 체크섬: 공개된 일평균기온 Math.round(F*100) 합. */
const TAVG_SUM = 25138419;
/** 고정 체크섬: 공개된 일강수량 Math.round(in*100) 합. */
const RAIN_SUM = 48232;
const NULL_TEMP_DAYS = 110;
const NULL_RAIN_DAYS = 127;

/**
 * YYYY-MM-DD가 실제 달력 날짜인지 검사한다.
 * @param date 검사할 날짜 문자열.
 * @returns 유효하면 true, 아니면 false.
 */
function isCalendarDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
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
 * 공개된 기온 관측인지 검사한다. 결측 null과 센티널(-996/-999)은 그대로 둔다.
 * @param value 일기온 후보 (°F).
 * @returns 유한한 오클라호마 범위 기온 또는 null.
 */
function optionalTemp(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= -900 || value < -40 || value > 130) return null;
  return value;
}

/**
 * 공개된 강수량 관측인지 검사한다. 결측 null과 센티널은 그대로 둔다.
 * @param value 일강수량 후보 (인치).
 * @returns 0 이상의 유한 숫자 또는 null.
 */
function optionalRain(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= -900 || value < 0) return null;
  return value;
}

/**
 * 고정 Mesonet OILT 일별 기상 시계열을 검사한다. 결측을 0으로 채우지 않는다.
 * KCUH 복사를 막기 위해 station/label/source를 고정값과 대조한다.
 * @param value 091-MESOZ 런 JSON.
 * @returns 검증된 기상 시계열 또는 오류 상태.
 */
export function readMesonetDaily(value: unknown): MesonetDailySeries | null {
  const v = value as { runId?: unknown; station?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: MesonetDailyRow[] };
  if (!v || v.runId !== RUN_ID || v.station !== STATION) return null;
  if (v.stationName !== STATION_NAME || v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== DAY_COUNT) return null;
  let tmaxSum = 0;
  let tminSum = 0;
  let tavgSum = 0;
  let rainSum = 0;
  let nullTemp = 0;
  let nullRain = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as MesonetDailyRow;
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (!isCalendarDate(row.date)) return null;
    if (i === 0 ? row.date !== FIRST_DATE : nextDay((v.rows[i - 1] as MesonetDailyRow).date) !== row.date) return null;
    const tmax = optionalTemp(row.tmaxF);
    const tmin = optionalTemp(row.tminF);
    const tavg = optionalTemp(row.tavgF);
    if (row.tmaxF !== tmax || row.tminF !== tmin || row.tavgF !== tavg) return null;
    if ((tmax === null) !== (tmin === null) || (tmax === null) !== (tavg === null)) return null;
    if (tmax === null || tmin === null || tavg === null) {
      nullTemp++;
    } else {
      if (tmax < tmin) return null;
      tmaxSum += Math.round(tmax * 100);
      tminSum += Math.round(tmin * 100);
      tavgSum += Math.round(tavg * 100);
    }
    const rain = optionalRain(row.rainIn);
    if (row.rainIn !== rain) return null;
    if (rain === null) {
      nullRain++;
    } else {
      rainSum += Math.round(rain * 100);
    }
  }
  if ((v.rows[v.rows.length - 1] as MesonetDailyRow).date !== LAST_DATE) return null;
  if (tmaxSum !== TMAX_SUM || tminSum !== TMIN_SUM || tavgSum !== TAVG_SUM || rainSum !== RAIN_SUM) return null;
  if (nullTemp !== NULL_TEMP_DAYS || nullRain !== NULL_RAIN_DAYS) return null;
  return v as MesonetDailySeries;
}

/**
 * 시계열에서 하루의 기상을 꺼낸다. 결측 필드는 null이다.
 * @param series 검증된 Mesonet OILT 일별 시계열.
 * @param date YYYY-MM-DD 형식의 날짜 (예: 2026-09-08).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function dayWeather(
  series: MesonetDailySeries | null,
  date: string,
): MesonetDailyRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
