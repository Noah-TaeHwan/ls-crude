/** Cushing/Payne USGS 일평균 유량 한 행. 결측일은 행 자체가 없으며 0으로 채우지 않는다. */
export interface CushingUsgsDayRow {
  date: string;
  dischargeCfs: number;
  approval: string;
}
/** Cushing/Payne 고정 일평균 유량 시계열. 수문 교란변수(confounder)이며 활동량·바쁨이 아니다. */
export interface CushingUsgsDailySeries {
  runId: string;
  siteNo: string;
  stationName: string;
  label: string;
  source: string;
  rows: CushingUsgsDayRow[];
}

const RUN_ID = "20260910T091USGSZ";
const SITE_NO = "07161450";
const STATION_NAME = "Cimarron River near Ripley, OK";
const LABEL = "Cushing/Payne USGS streamflow, daily confounder, not busy";
const SOURCE = "USGS Waterservices NWIS daily values site 07161450 parameter 00060 stat 00003";
const ROW_COUNT = 14224;
const FIRST_DATE = "1987-10-01";
const LAST_DATE = "2026-09-09";
/** 고정 체크섬: 전 행 Math.round(dischargeCfs*1000) 합. */
const THOUSANDTHS_SUM = 24894472300;
/** 승인코드: A 승인, P 잠정, :e 추정치, :[4] 비고 표시 — 제출된 코드 외는 거부한다. */
const APPROVAL_RE = /^(A|P)(:e|:\[4\])?$/;

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
 * 고정 Cushing/Payne 일평균 유량 시계열을 검사한다. 결측일을 0으로 채우지 않는다.
 * @param value 091-USGSZ 런 JSON.
 * @returns 검증된 일평균 유량 시계열 또는 오류 상태.
 */
export function readCushingUsgsDaily(value: unknown): CushingUsgsDailySeries | null {
  const v = value as { runId?: unknown; siteNo?: unknown; stationName?: unknown; label?: unknown; source?: unknown; rows?: CushingUsgsDayRow[] };
  if (!v || v.runId !== RUN_ID || v.siteNo !== SITE_NO || v.stationName !== STATION_NAME) return null;
  if (v.label !== LABEL || v.source !== SOURCE) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== ROW_COUNT) return null;
  if ((v.rows[0] as CushingUsgsDayRow).date !== FIRST_DATE) return null;
  if ((v.rows[ROW_COUNT - 1] as CushingUsgsDayRow).date !== LAST_DATE) return null;
  let thouSum = 0;
  for (let i = 0; i < v.rows.length; i++) {
    const row = v.rows[i] as CushingUsgsDayRow;
    if (!row || typeof row.date !== "string") return null;
    if (i > 0) {
      const prev = nextDay((v.rows[i - 1] as CushingUsgsDayRow).date);
      if (prev !== row.date) return null;
    }
    if (typeof row.dischargeCfs !== "number" || !Number.isFinite(row.dischargeCfs)) return null;
    if (row.dischargeCfs < 0 || row.dischargeCfs > 1000000) return null;
    if (typeof row.approval !== "string" || !APPROVAL_RE.test(row.approval)) return null;
    thouSum += Math.round(row.dischargeCfs * 1000);
  }
  if (thouSum !== THOUSANDTHS_SUM) return null;
  return v as CushingUsgsDailySeries;
}

/**
 * 시계열에서 하루의 유량을 꺼낸다. 기록에 없는 날짜는 null을 돌려준다.
 * @param series 검증된 Cushing/Payne 일평균 유량 시계열.
 * @param date 조회일 (YYYY-MM-DD, 예: 1993-05-10).
 * @returns 해당 날짜 행 또는 없으면 null.
 */
export function dayFlow(
  series: CushingUsgsDailySeries | null,
  date: string,
): CushingUsgsDayRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.date === date);
  return row ?? null;
}
