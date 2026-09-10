/** Mesonet OILT 일별 토양온도 한 점. 결측은 null이며 0으로 채우지 않는다. */
export interface MesonetSoilDailyRow {
  date: string;
  /** 10cm 천연식생 하 평균 토양온도(°F). 기온·강수 필드는 두지 않는다. */
  savgF: number | null;
}
/** Mesonet OILT 고정 일별 토양온도 시계열. 교란변수(confounder)이며 활동량이 아니다. */
export interface MesonetSoilDailySeries {
  runId: string;
  station: string;
  stationName: string;
  label: string;
  source: string;
  rows: MesonetSoilDailyRow[];
}

const RUN_ID = "20260910T091SOILZ";
const STATION = "OILT";
const STATION_NAME = "Oilton, OK (Oklahoma Mesonet, 36.03,-96.50)";
const LABEL = "Mesonet OILT daily soil temperature, dated, 24.3 km, not air temp, not rain, not busy";
const SOURCE = "Oklahoma Mesonet monthly .mts daily summaries for OILT (public, keyless)";
const FIRST_DATE = "2015-01-01";
const LAST_DATE = "2026-09-08";
const DAY_COUNT = 4269;
/** 고정 체크섬: 공개된 토양온도 Math.round(F*100) 합. */
const SAVG_SUM = 25436779;
const NULL_SOIL_DAYS = 188;

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
 * 공개된 토양온도 관측인지 검사한다. 결측 null과 센티널(-996/-999)은 그대로 둔다.
 * @param value 일토양온도 후보 (°F).
 * @returns 유한한 오클라호마 범위 토양온도 또는 null.
 */
function optionalSoil(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= -900 || value < -40 || value > 130) return null;
  return value;
}

/**
 * 고정 Mesonet OILT 일별 토양온도 시계열을 검사한다. 결측을 0으로 채우지 않는다.
 * 기온·강수 복사(tmaxF/rainIn 등 여분 필드)를 막기 위해 행 키를 savgF로 고정한다.
 * @param value 091-SOILZ 런 JSON.
 * @returns 검증된 토양온도 시계열 또는 오류 상태.
 */
export function readMesonetSoilDaily(value: unknown): MesonetSoilDailySeries | null {
  const v = value as { runId?: unknown; station?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: MesonetSoilDailyRow[] };
  if (!v || v.runId !== RUN_ID || v.station !== STATION) return null;
  if (v.stationName !== STATION_NAME || v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== DAY_COUNT) return null;
  let savgSum = 0;
  let nullSoil = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as MesonetSoilDailyRow & Record<string, unknown>;
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (!isCalendarDate(row.date)) return null;
    if (i === 0 ? row.date !== FIRST_DATE : nextDay((v.rows[i - 1] as MesonetSoilDailyRow).date) !== row.date) return null;
    if (Object.keys(row).sort().join(",") !== "date,savgF") return null;
    const savg = optionalSoil(row.savgF);
    if (row.savgF !== savg) return null;
    if (savg === null) {
      nullSoil++;
    } else {
      savgSum += Math.round(savg * 100);
    }
  }
  if ((v.rows[v.rows.length - 1] as MesonetSoilDailyRow).date !== LAST_DATE) return null;
  if (savgSum !== SAVG_SUM) return null;
  if (nullSoil !== NULL_SOIL_DAYS) return null;
  return v as MesonetSoilDailySeries;
}

/**
 * 시계열에서 하루의 토양온도를 꺼낸다. 결측일은 savgF가 null이다.
 * @param series 검증된 Mesonet OILT 일별 토양온도 시계열.
 * @param date YYYY-MM-DD 형식의 날짜 (예: 2026-09-08).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function daySoil(
  series: MesonetSoilDailySeries | null,
  date: string,
): MesonetSoilDailyRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
