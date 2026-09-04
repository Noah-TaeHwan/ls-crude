/** 홈 반원에 올리는 예시 DEFCON 점수. 시장 스냅샷과 무관하다. */
export const SAMPLE_DEFCON_SCORE = 58;

/** 예시 바늘의 구간 표기. */
export const SAMPLE_DEFCON_BAND = "DEFCON 3";

/** 홈 반원의 제목. 실현변동성 게이지가 아니다. */
export const SAMPLE_DEFCON_TITLE = "원유 DEFCON";

/** 게이지 안쪽 보조 캡션. */
export const SAMPLE_DEFCON_CAPTION = "실전 신호 아님";

/** 게이지 아래 한 줄 설명. */
export const SAMPLE_DEFCON_EXPLAINER = "실전 신호가 아닙니다.";

/** 게이지 아래 보조 설명. 5일 실현변동성 숫자를 달지 않는다. */
export const SAMPLE_DEFCON_DETAIL = "통과한 공개 흔적이 아직 없습니다.";

/**
 * 홈 반원 바늘 점수를 돌려준다.
 * 시장 백분위를 받아도 무시하고 항상 예시 점수를 반환한다.
 * @param _marketPercentile 연결만 하고 쓰지 않는 실현변동성 백분위.
 * @returns 예시 DEFCON 점수.
 */
export function sampleDefconScore(_marketPercentile?: number | null): number {
  return SAMPLE_DEFCON_SCORE;
}
