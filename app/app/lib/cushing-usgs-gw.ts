/** Cushing/Payne USGS 일평균 지하수위 한 행. 결측일은 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingUsgsGwDayRow {
  date: string;
  depthToWaterFt: number;
  approval: string;
}
/** Cushing/Payne 고정 일평균 지하수위 시계열. 수문 교란변수(confounder)이며 활동량·바쁨·유량이 아니다. */
export interface CushingUsgsGwDailySeries {
  runId: string;
  siteNo: string;
  stationName: string;
  label: string;
  source: string;
  rows: CushingUsgsGwDayRow[];
}

const RUN_ID = "20260910T091GWZ";
const SITE_NO = "360339096450201";
const STATION_NAME = "18N-05E-03 DDA 1 Cimarron3";
const LABEL = "Cushing/Payne USGS groundwater, daily confounder, not busy";
const SOURCE = "USGS Waterservices NWIS daily values site 360339096450201 parameter 72019 stat 00003";
const ROW_COUNT = 481;
const FIRST_DATE = "2017-06-29";
const LAST_DATE = "2018-10-22";
/** 고정 체크섬: 전 행 Math.round(depthToWaterFt*100) 합. */
const HUNDREDTHS_SUM = 347450;
/** 승인코드: A 승인, :[4] 비고 표시 — 제출된 코드 외는 거부한다. */
const APPROVAL_RE = /^(A|A:\[4\])$/;

/**
 * YYYY-MM-DD 다음 날짜를 구한다. 일 연속성을 검사하는 데 쓴다.
 * @param date YYYY-MM-DD 형식의 날짜.
 * @returns 다음 날짜 문자열, 형식이 아니면 null.
 */
function nextDay(date: string): string | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  const n = new Date(t.getTime() + 86400000);
  const yy = n.getUTCFullYear();
  const mm = String(n.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(n.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * 고정 Cushing/Payne 일평균 지하수위 시계열을 검사한다. 결측일을 0으로 채우지 않는다.
 * @param value 091-GWZ 런 JSON.
 * @returns 검증된 일평균 지하수위 시계열 또는 오류 상태.
 */
export function readCushingUsgsGwDaily(value: unknown): CushingUsgsGwDailySeries | null {
  const v = value as { runId?: unknown; siteNo?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: CushingUsgsGwDayRow[] };
  if (!v || v.runId !== RUN_ID || v.siteNo !== SITE_NO || v.stationName !== STATION_NAME) return null;
  if (v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== ROW_COUNT) return null;
  if ((v.rows[0] as CushingUsgsGwDayRow).date !== FIRST_DATE) return null;
  if ((v.rows[ROW_COUNT - 1] as CushingUsgsGwDayRow).date !== LAST_DATE) return null;
  let hundSum = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as CushingUsgsGwDayRow;
    if (!row || typeof row.date !== "string") return null;
    if (i > 0) {
      const prev = nextDay((v.rows[i - 1] as CushingUsgsGwDayRow).date);
      if (prev !== row.date) return null;
    }
    if (typeof row.depthToWaterFt !== "number" || !Number.isFinite(row.depthToWaterFt)) return null;
    if (row.depthToWaterFt <= 0 || row.depthToWaterFt > 1000) return null;
    if (typeof row.approval !== "string" || !APPROVAL_RE.test(row.approval)) return null;
    hundSum += Math.round(row.depthToWaterFt * 100);
  }
  if (hundSum !== HUNDREDTHS_SUM) return null;
  return v as CushingUsgsGwDailySeries;
}

/**
 * 시계열에서 하루의 지하수위를 꺼낸다. 기록에 없는 날짜는 null을 돌려준다.
 * @param series 검증된 Cushing/Payne 일평균 지하수위 시계열.
 * @param date 조회일 (YYYY-MM-DD, 예: 2017-06-29).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function dayDepth(
  series: CushingUsgsGwDailySeries | null,
  date: string,
): CushingUsgsGwDayRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
