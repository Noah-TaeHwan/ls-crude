/** Mesonet OILT 일별 평균풍속 한 점. 결측은 null이며 0으로 채우지 않는다. */
export interface MesonetWindDailyRow {
  date: string;
  /** 일평균 풍속(mph). 기온·강수·토양온도·습도 필드는 두지 않는다. */
  wspdMph: number | null;
}
/** Mesonet OILT 고정 일별 평균풍속 시계열. 교란변수(confounder)이며 활동량이 아니다. */
export interface MesonetWindDailySeries {
  runId: string;
  station: string;
  stationName: string;
  label: string;
  source: string;
  rows: MesonetWindDailyRow[];
}

const RUN_ID = "20260910T091WSPDZ";
const STATION = "OILT";
const STATION_NAME = "Oilton, OK (Oklahoma Mesonet, 36.03,-96.50)";
const LABEL = "Mesonet OILT daily mean wind speed WSPD, dated, 24.3 km, not air temp, not rain, not soil, not humidity, not busy";
const SOURCE = "Oklahoma Mesonet monthly .mts daily summaries for OILT (public, keyless)";
const FIRST_DATE = "2015-01-01";
const LAST_DATE = "2026-09-08";
const DAY_COUNT = 4269;
/** 고정 체크섬: 공개된 일평균풍속 Math.round(mph*100) 합. */
const WSPD_SUM = 2573065;
const NULL_WIND_DAYS = 272;

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
 * 공개된 풍속 관측인지 검사한다. 결측 null과 센티널(-996/-999)은 그대로 둔다.
 * @param value 일평균풍속 후보 (mph).
 * @returns 0 이상 100 이하의 유한 숫자 또는 null.
 */
function optionalWind(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= -900 || value < 0 || value > 100) return null;
  return value;
}

/**
 * 고정 Mesonet OILT 일별 평균풍속 시계열을 검사한다. 결측을 0으로 채우지 않는다.
 * 기온·강수·토양온도·습도 복사(tmaxF/rainIn/savgF/havgPct 등 여분 필드)를 막기 위해 행 키를 wspdMph로 고정한다.
 * @param value 091-WSPDZ 런 JSON.
 * @returns 검증된 평균풍속 시계열 또는 오류 상태.
 */
export function readMesonetWindDaily(value: unknown): MesonetWindDailySeries | null {
  const v = value as { runId?: unknown; station?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: MesonetWindDailyRow[] };
  if (!v || v.runId !== RUN_ID || v.station !== STATION) return null;
  if (v.stationName !== STATION_NAME || v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== DAY_COUNT) return null;
  let wspdSum = 0;
  let nullWind = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as MesonetWindDailyRow & Record<string, unknown>;
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (!isCalendarDate(row.date)) return null;
    if (i === 0 ? row.date !== FIRST_DATE : nextDay((v.rows[i - 1] as MesonetWindDailyRow).date) !== row.date) return null;
    if (Object.keys(row).sort().join(",") !== "date,wspdMph") return null;
    const wspd = optionalWind(row.wspdMph);
    if (row.wspdMph !== wspd) return null;
    if (wspd === null) {
      nullWind++;
    } else {
      wspdSum += Math.round(wspd * 100);
    }
  }
  if ((v.rows[v.rows.length - 1] as MesonetWindDailyRow).date !== LAST_DATE) return null;
  if (wspdSum !== WSPD_SUM) return null;
  if (nullWind !== NULL_WIND_DAYS) return null;
  return v as MesonetWindDailySeries;
}

/**
 * 시계열에서 하루의 평균풍속을 꺼낸다. 결측일은 wspdMph가 null이다.
 * @param series 검증된 Mesonet OILT 일별 평균풍속 시계열.
 * @param date YYYY-MM-DD 형식의 날짜 (예: 2026-09-08).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function dayWind(
  series: MesonetWindDailySeries | null,
  date: string,
): MesonetWindDailyRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
