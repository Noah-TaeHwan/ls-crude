/** 변동성 반원 게이지의 SVG 좌표계. */
export const GAUGE_VIEW = {
  width: 640,
  height: 368,
  cx: 320,
  cy: 332,
  radius: 268,
} as const;

/** 게이지가 시작하는 왼쪽 각도. */
export const GAUGE_START_DEG = 180;
/** 게이지가 끝나는 오른쪽 각도. */
export const GAUGE_END_DEG = 0;

/** 백분위 점수별 변동성 구간. */
export const GAUGE_ZONES = {
  stable: { from: 180, to: 135 },
  normal: { from: 135, to: 90 },
  elevated: { from: 90, to: 45 },
  extreme: { from: 45, to: 0 },
} as const;

/** SVG 평면의 한 점. */
export interface Point {
  x: number;
  y: number;
}

/**
 * 비율을 0~1 범위로 제한한다.
 * @param ratio 제한할 비율.
 * @returns 0~1로 제한한 비율.
 */
export function clampRatio(ratio: number): number {
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

/**
 * 0~1 비율을 반원 각도로 바꾼다.
 * @param ratio 게이지 비율.
 * @returns SVG 반원의 각도.
 */
export function ratioToAngle(ratio: number): number {
  return GAUGE_START_DEG - clampRatio(ratio) * (GAUGE_START_DEG - GAUGE_END_DEG);
}

/**
 * 반원 각도를 0~1 비율로 바꾼다.
 * @param angleDeg SVG 반원의 각도.
 * @returns 게이지 비율.
 */
export function angleToRatio(angleDeg: number): number {
  return (GAUGE_START_DEG - angleDeg) / (GAUGE_START_DEG - GAUGE_END_DEG);
}

/**
 * 극좌표를 SVG 좌표로 바꾼다.
 * @param cx 중심 x 좌표.
 * @param cy 중심 y 좌표.
 * @param radius 반지름.
 * @param angleDeg 각도.
 * @returns 변환한 SVG 좌표.
 */
export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
}

/**
 * 반원 호의 SVG 경로를 만든다.
 * @param cx 중심 x 좌표.
 * @param cy 중심 y 좌표.
 * @param radius 반지름.
 * @param startAngleDeg 시작 각도.
 * @param endAngleDeg 끝 각도.
 * @returns SVG path의 d 값.
 */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const start = polarPoint(cx, cy, radius, startAngleDeg);
  const end = polarPoint(cx, cy, radius, endAngleDeg);
  const delta = Math.abs(startAngleDeg - endAngleDeg);
  const largeArc = delta > 180 ? 1 : 0;
  return `M ${fmt(start.x)} ${fmt(start.y)} A ${radius} ${radius} 0 ${largeArc} 1 ${fmt(end.x)} ${fmt(end.y)}`;
}

/**
 * 현재 값을 가리키는 바늘의 꼭짓점을 만든다.
 * @param cx 중심 x 좌표.
 * @param cy 중심 y 좌표.
 * @param radius 바늘 길이 기준 반지름.
 * @param angleDeg 바늘 각도.
 * @param hub 바늘 밑변 반경.
 * @returns SVG polygon의 points 값.
 */
export function needlePolygon(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
  hub = 10,
): string {
  const tip = polarPoint(cx, cy, radius - 14, angleDeg);
  const left = polarPoint(cx, cy, hub, angleDeg + 82);
  const right = polarPoint(cx, cy, hub, angleDeg - 82);
  return `${fmt(tip.x)},${fmt(tip.y)} ${fmt(left.x)},${fmt(left.y)} ${fmt(right.x)},${fmt(right.y)}`;
}

/**
 * SVG 좌표를 소수 둘째 자리 문자열로 고정한다.
 * @param value 좌표값.
 * @returns 서식화한 좌표값.
 */
function fmt(value: number): string {
  return value.toFixed(2);
}

/**
 * 백분위 점수를 사람이 읽는 변동성 구간으로 바꾼다.
 * @param score 0~100 백분위 점수.
 * @returns 변동성 구간 이름.
 */
export function volatilityBand(score: number): "안정" | "보통" | "고조" | "급변" {
  if (score < 25) return "안정";
  if (score < 50) return "보통";
  if (score < 75) return "고조";
  return "급변";
}
