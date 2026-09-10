/** Mesonet OILT 일별 평균기압 한 점. 결측은 null이며 0으로 채우지 않는다. */
export interface MesonetPressureDailyRow {
  date: string;
  /** 일평균 현지기압(inHg). 기온·강수·토양온도·습도·풍속 필드는 두지 않는다. */
  pavgInhg: number | null;
}
/** Mesonet OILT 고정 일별 평균기압 시계열. 교란변수(confounder)이며 활동량이 아니다. */
export interface MesonetPressureDailySeries {
  runId: string;
  station: string;
  stationName: string;
  label: string;
  source: string;
  rows: MesonetPressureDailyRow[];
}

const RUN_ID = "20260910T091PRESZ";
const STATION = "OILT";
const STATION_NAME = "Oilton, OK (Oklahoma Mesonet, 36.03,-96.50)";
const LABEL = "Mesonet OILT daily mean station pressure PAVG, dated, 24.3 km, not air temp, not rain, not soil, not humidity, not wind, not busy";
const SOURCE = "Oklahoma Mesonet monthly .mts daily summaries for OILT (public, keyless)";
const FIRST_DATE = "2015-01-01";
const LAST_DATE = "2026-09-08";
const DAY_COUNT = 4269;
/** 고정 체크섬: 공개된 일평균기압 Math.round(inHg*100) 합. */
const PAVG_SUM = 12127694;
const NULL_PRESSURE_DAYS = 104;

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
 * 공개된 기압 관측인지 검사한다. 결측 null과 센티널(-996/-999)은 그대로 둔다.
 * @param value 일평균기압 후보 (inHg).
 * @returns 25 이상 32 이하의 유한 숫자 또는 null.
 */
function optionalPressure(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= -900 || value < 25 || value > 32) return null;
  return value;
}

/**
 * 고정 Mesonet OILT 일별 평균기압 시계열을 검사한다. 결측을 0으로 채우지 않는다.
 * 기온·강수·토양온도·습도·풍속 복사(tmaxF/rainIn/savgF/havgPct/wspdMph 등 여분 필드)를 막기 위해 행 키를 pavgInhg로 고정한다.
 * @param value 091-PRESZ 런 JSON.
 * @returns 검증된 평균기압 시계열 또는 오류 상태.
 */
export function readMesonetPressureDaily(value: unknown): MesonetPressureDailySeries | null {
  const v = value as { runId?: unknown; station?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: MesonetPressureDailyRow[] };
  if (!v || v.runId !== RUN_ID || v.station !== STATION) return null;
  if (v.stationName !== STATION_NAME || v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== DAY_COUNT) return null;
  let pavgSum = 0;
  let nullPressure = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as MesonetPressureDailyRow & Record<string, unknown>;
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (!isCalendarDate(row.date)) return null;
    if (i === 0 ? row.date !== FIRST_DATE : nextDay((v.rows[i - 1] as MesonetPressureDailyRow).date) !== row.date) return null;
    if (Object.keys(row).sort().join(",") !== "date,pavgInhg") return null;
    const pavg = optionalPressure(row.pavgInhg);
    if (row.pavgInhg !== pavg) return null;
    if (pavg === null) {
      nullPressure++;
    } else {
      pavgSum += Math.round(pavg * 100);
    }
  }
  if ((v.rows[v.rows.length - 1] as MesonetPressureDailyRow).date !== LAST_DATE) return null;
  if (pavgSum !== PAVG_SUM) return null;
  if (nullPressure !== NULL_PRESSURE_DAYS) return null;
  return v as MesonetPressureDailySeries;
}

/**
 * 시계열에서 하루의 평균기압을 꺼낸다. 결측일은 pavgInhg가 null이다.
 * @param series 검증된 Mesonet OILT 일별 평균기압 시계열.
 * @param date YYYY-MM-DD 형식의 날짜 (예: 2026-09-08).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function dayPressure(
  series: MesonetPressureDailySeries | null,
  date: string,
): MesonetPressureDailyRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
