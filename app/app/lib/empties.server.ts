import display from "../../../research/indexes/ALT-20260907-02/20260909T003314Z/display.json";
import quality from "../../../research/indexes/ALT-20260907-02/20260909T003314Z/quality.json";
import { EMPTIES_RUN, readEmpties, type EmptiesPoint } from "./empties.ts";

/** 관측 카드에 보여줄 고정 빈티지 요약. */
export interface EmptiesView { points: EmptiesPoint[]; collected: string; quarantined: readonly string[]; monthlyMismatches: number; annualMatched: number; annualCompared: number }

/**
 * 동결 표시 JSON을 검증하고 관측 화면 값을 돌려준다. 런타임 조회가 없다.
 * @returns 검증된 138개월 관측 또는 빈 화면과 오류.
 */
export function readEmptiesView(): { data: EmptiesView | null; error: string | null } {
  const points = readEmpties(display);
  if (!points) return { data: null, error: "빈 컨테이너 표시 자료 검증에 실패했습니다. 연구 원문을 확인하세요." };
  return {
    data: {
      points,
      collected: EMPTIES_RUN.collected,
      quarantined: EMPTIES_RUN.quarantined,
      monthlyMismatches: quality.reconciliation.mismatches.length,
      annualMatched: quality.annual_total_check.matched,
      annualCompared: quality.annual_total_check.compared,
    },
    error: null,
  };
}
