/** EIA Cushing 주간 재고. 단위는 thousand barrels. */
export interface CushingStockPoint { date: string; stockKbbl: number }
/** EIA Cushing 월간 재고. 주간 시계열과 섞지 않는다. */
export interface CushingMonthlyStockPoint { month: string; stockKbbl: number }
/** ODOT East Main 연간 AADT. 트럭은 2025만 있다. */
export interface CushingAadtPoint { year: number; aadt: number; trucks: number | null }
/** Census BPS Cushing 시 주거 허가 호수. */
export interface CushingBpsPoint { month: string; units: number }
/** DEQ 공개 검토 사건. 없는 날짜는 null. */
export interface CushingDeqEvent {
  facility: string;
  permit: string;
  status: string;
  receiptDate: string | null;
  statusDate: string | null;
}

/** @param value 날짜 값. @returns UTC 달력 날짜가 유효한지 여부. */
function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + "T00:00:00Z")) && new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
}

/**
 * 고정 EIA 주간 재고 CSV를 검사한다. 결측 주를 0으로 채우지 않는다.
 * @param csv 091-EIA 런 CSV 원문.
 * @returns 검증된 주간 재고 또는 오류 상태.
 */
export function readCushingStocks(csv: unknown): CushingStockPoint[] | null {
  if (typeof csv !== "string") return null;
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines[0] !== "date,stock_kbbl,wow_change_kbbl,wow_change_pct,pct_of_ref_working,wow_4w_std" || lines.length !== 1170) return null;
  const rows: CushingStockPoint[] = [];
  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    if (parts.length !== 6) return null;
    const date = parts[0];
    const stockKbbl = Number(parts[1]);
    if (!validDate(date) || !Number.isSafeInteger(stockKbbl) || stockKbbl <= 0) return null;
    if (rows.length && rows.at(-1)!.date >= date) return null;
    rows.push({ date, stockKbbl });
  }
  if (rows.length !== 1169) return null;
  if (rows[0].date !== "2004-04-09" || rows[0].stockKbbl !== 11677) return null;
  if (rows.at(-1)!.date !== "2026-08-28" || rows.at(-1)!.stockKbbl !== 22508) return null;
  if (rows.reduce((n, row) => n + row.stockKbbl, 0) !== 40862385) return null;
  return rows;
}

/**
 * 고정 EIA 월간 재고 CSV를 검사한다. 빈 달을 0으로 채우지 않고 주간 표와 섞지 않는다.
 * @param csv 091-EIA-M 런 CSV 원문.
 * @returns 검증된 월간 재고 또는 오류 상태.
 */
export function readCushingMonthlyStocks(csv: unknown): CushingMonthlyStockPoint[] | null {
  if (typeof csv !== "string") return null;
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines[0] !== "month,stock_kbbl" || lines.length !== 271) return null;
  const rows: CushingMonthlyStockPoint[] = [];
  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    if (parts.length !== 2) return null;
    const month = parts[0];
    const stockKbbl = Number(parts[1]);
    if (!/^\d{4}-\d{2}$/.test(month) || Number(month.slice(5, 7)) < 1 || Number(month.slice(5, 7)) > 12) return null;
    if (!Number.isSafeInteger(stockKbbl) || stockKbbl <= 0) return null;
    if (rows.length) {
      const prev = rows.at(-1)!.month;
      const [py, pm] = prev.split("-").map(Number);
      const expect = pm === 12 ? `${py + 1}-01` : `${py}-${String(pm + 1).padStart(2, "0")}`;
      if (month !== expect) return null;
    }
    rows.push({ month, stockKbbl });
  }
  if (rows.length !== 270 || rows[0].month !== "2004-01" || rows[0].stockKbbl !== 12890) return null;
  if (rows.at(-1)!.month !== "2026-06" || rows.at(-1)!.stockKbbl !== 19515) return null;
  if (rows.reduce((n, row) => n + row.stockKbbl, 0) !== 9427093) return null;
  return rows;
}

/**
 * 고정 East Main 연간 AADT JSON을 검사한다. 연간 값을 일별로 펼치지 않는다.
 * @param value 091 BOARD 런 JSON.
 * @returns 검증된 연간 점 또는 오류 상태.
 */
export function readCushingAadt(value: unknown): CushingAadtPoint[] | null {
  const v = value as { runId?: unknown; siteId?: unknown; permStation?: unknown; points?: CushingAadtPoint[] };
  if (!v || v.runId !== "20260909T091BOARDZ" || v.siteId !== "600645" || v.permStation !== false || !Array.isArray(v.points) || v.points.length !== 11) return null;
  if (!v.points.every((row, index) => row && row.year === 2015 + index && Number.isSafeInteger(row.aadt) && row.aadt > 0 && (row.trucks === null || (Number.isSafeInteger(row.trucks) && row.trucks >= 0)))) return null;
  if (v.points.at(-1)!.aadt !== 11648 || v.points.at(-1)!.trucks !== 291) return null;
  if (v.points.reduce((n, row) => n + row.aadt, 0) !== 115548) return null;
  if (v.points.filter((row) => row.trucks !== null).length !== 1) return null;
  return v.points;
}

/**
 * 고정 BPS 월별 호수 CSV를 검사한다. 빠진 달을 0으로 채우지 않는다.
 * @param csv BOARD 런 CSV 원문.
 * @returns 검증된 월별 호수 또는 오류 상태.
 */
export function readCushingBps(csv: unknown): CushingBpsPoint[] | null {
  if (typeof csv !== "string") return null;
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines[0] !== "month,units,units_1,units_2,units_3_4,units_5plus" || lines.length !== 32) return null;
  const rows: CushingBpsPoint[] = [];
  for (const line of lines.slice(1)) {
    const parts = line.split(",");
    if (parts.length !== 6) return null;
    const month = parts[0];
    const units = Number(parts[1]);
    const split = parts.slice(2).map(Number);
    if (!/^\d{4}-\d{2}$/.test(month) || !Number.isSafeInteger(units) || units < 0) return null;
    if (split.length !== 4 || split.some((n) => !Number.isSafeInteger(n) || n < 0) || split.reduce((n, v) => n + v, 0) !== units) return null;
    if (rows.length) {
      const prev = rows.at(-1)!.month;
      const [py, pm] = prev.split("-").map(Number);
      const expect = pm === 12 ? `${py + 1}-01` : `${py}-${String(pm + 1).padStart(2, "0")}`;
      if (month !== expect) return null;
    }
    rows.push({ month, units });
  }
  if (rows.length !== 31 || rows[0].month !== "2024-01" || rows[0].units !== 1) return null;
  if (rows.at(-1)!.month !== "2026-07" || rows.at(-1)!.units !== 0) return null;
  if (rows.reduce((n, row) => n + row.units, 0) !== 29) return null;
  return rows;
}

/**
 * 고정 DEQ 사건 JSON을 검사한다. 없는 날짜를 지어 내지 않는다.
 * @param value BOARD 런 JSON.
 * @returns 검증된 사건 또는 오류 상태.
 */
export function readCushingDeq(value: unknown): CushingDeqEvent[] | null {
  const v = value as { runId?: unknown; events?: CushingDeqEvent[] };
  if (!v || v.runId !== "20260909T091BOARDZ" || !Array.isArray(v.events) || v.events.length !== 3) return null;
  if (!v.events.every((row) => row && typeof row.facility === "string" && row.facility.length > 0 && typeof row.permit === "string" && typeof row.status === "string" && (row.receiptDate === null || validDate(row.receiptDate)) && (row.statusDate === null || validDate(row.statusDate)))) return null;
  if (v.events[0].permit !== "2024-1222-TVR" || v.events[0].receiptDate !== "2024-12-04" || v.events[0].status !== "issued") return null;
  if (v.events.filter((row) => row.receiptDate !== null).length !== 1) return null;
  return v.events;
}
