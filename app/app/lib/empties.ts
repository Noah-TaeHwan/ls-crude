/** LA항 빈 컨테이너 반출 월별 관측점. 원단위 문자열은 원래 정밀도를 보존한다. */
export interface EmptiesPoint { month: string; loadedImports: string; emptyImports: string; totalImports: string; loadedExports: string; emptyExports: string; totalExports: string; totalTeus: string; emptySharePct: string }
/** 동결 표시 원본의 고정 빈티지. 새 수집은 새 runId와 코드 갱신으로만 반영한다. */
export const EMPTIES_RUN = { candidateId: "ALT-20260907-02", runId: "20260909T003314Z", months: 138, first: "2015-01", last: "2026-07", quarantined: ["2020-11"], collected: "2026-09-09 00:33 UTC" } as const;
/** 문서화된 제공자 Total 셀 먼지(월: 제공값−분할합계 TEU). 이 값과 다른 편차는 실패한다. */
export const KNOWN_EXPORT_DUST: Record<string, number> = { "2020-07": 0.05, "2022-11": 100, "2025-03": 2, "2025-10": 4 };
/** 수입 쪽 문서화 먼지. 표시에는 쓰이지 않으나 행 전체 대사를 위해 검증한다. */
export const KNOWN_IMPORT_DUST: Record<string, number> = { "2025-10": 3 };
/** 총계 쪽 문서화 먼지(Imports+Exports−TEUs). */
export const KNOWN_GRAND_DUST: Record<string, number> = { "2022-11": 100, "2025-03": 2, "2025-10": 7 };

/** @param value 월 값. @returns YYYY-MM 달력 월인지 여부. */
function validMonth(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  return Number.isFinite(Date.parse(value + "-01T00:00:00Z"));
}
/** @param value TEU 원단위. @returns 소수 2자리 숫자 문자열인지 여부. */
function validTeu(value: unknown): value is string {
  return typeof value === "string" && /^\d+\.\d{2}$/.test(value) && Number.isFinite(Number(value));
}
/** @param months 정렬된 월 목록. @returns 달력상 빠진 월 목록. */
function missingMonths(months: string[]): string[] {
  const missing: string[] = [];
  for (let i = 1; i < months.length; i++) {
    const [py, pm] = months[i - 1].split("-").map(Number);
    const [y, m] = months[i].split("-").map(Number);
    let cy = py, cm = pm;
    for (;;) {
      cm++;
      if (cm > 12) { cm = 1; cy++; }
      if (cy > y || (cy === y && cm >= m)) break;
      missing.push(`${cy}-${String(cm).padStart(2, "0")}`);
    }
  }
  return missing;
}

/** @param value 표시용 원본. @returns 검증된 138개월 관측 또는 오류 상태. */
export function readEmpties(value: unknown): EmptiesPoint[] | null {
  const v = value as { candidateId?: unknown; runId?: unknown; points?: EmptiesPoint[] };
  if (!v || v.candidateId !== EMPTIES_RUN.candidateId || v.runId !== EMPTIES_RUN.runId || !Array.isArray(v.points) || v.points.length !== EMPTIES_RUN.months) return null;
  const rows = v.points;
  if (!rows.every((r) => r && validMonth(r.month) && validTeu(r.loadedImports) && validTeu(r.emptyImports) && validTeu(r.totalImports) && validTeu(r.loadedExports) && validTeu(r.emptyExports) && validTeu(r.totalExports) && validTeu(r.totalTeus) && typeof r.emptySharePct === "string" && /^\d+\.\d{6}$/.test(r.emptySharePct))) return null;
  if (!rows.every((r, i) => !i || rows[i - 1].month < r.month) || new Set(rows.map((r) => r.month)).size !== rows.length) return null;
  if (rows[0].month !== EMPTIES_RUN.first || rows.at(-1)!.month !== EMPTIES_RUN.last) return null;
  const gaps = missingMonths(rows.map((r) => r.month));
  if (gaps.length !== EMPTIES_RUN.quarantined.length || !EMPTIES_RUN.quarantined.every((m) => gaps.includes(m))) return null;
  if (!rows.every((r) => {
    const loadedImports = Number(r.loadedImports), emptyImports = Number(r.emptyImports);
    const loaded = Number(r.loadedExports), empty = Number(r.emptyExports);
    if (!(loaded + empty > 0)) return false;
    // 월별 3식 대사. 문서화된 제공자 먼지만 허용하고 그 외 편차는 실패한다.
    if (Math.abs(Number(r.totalImports) - (loadedImports + emptyImports) - (KNOWN_IMPORT_DUST[r.month] ?? 0)) > 0.005) return false;
    if (Math.abs(Number(r.totalExports) - (loaded + empty) - (KNOWN_EXPORT_DUST[r.month] ?? 0)) > 0.005) return false;
    if (Math.abs((Number(r.totalImports) + Number(r.totalExports)) - Number(r.totalTeus) - (KNOWN_GRAND_DUST[r.month] ?? 0)) > 0.005) return false;
    return Math.abs(Number(r.emptySharePct) - (100 * empty) / (loaded + empty)) < 1e-6;
  })) return null;
  return rows;
}

/** @param point 월별 관측. @returns 비중 계산에 실제 사용한 적재+빈수출 분모. */
export const exportDenominator = (point: EmptiesPoint) => Number(point.loadedExports) + Number(point.emptyExports);
