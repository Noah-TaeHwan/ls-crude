export const GAUGE_VIEW = {
  width: 640,
  height: 368,
  cx: 320,
  cy: 332,
  radius: 268,
} as const;

export const GAUGE_START_DEG = 180;
export const GAUGE_END_DEG = 0;
/** Parked in the WATCHING band until a real candidate exists. */
export const WATCHING_DEG = 128;

export const GAUGE_ZONES = {
  quiet: { from: 180, to: 148 },
  watching: { from: 148, to: 108 },
  open: { from: 108, to: 0 },
} as const;

export interface Point {
  x: number;
  y: number;
}

export function clampRatio(ratio: number): number {
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

export function ratioToAngle(ratio: number): number {
  return GAUGE_START_DEG - clampRatio(ratio) * (GAUGE_START_DEG - GAUGE_END_DEG);
}

export function angleToRatio(angleDeg: number): number {
  return (GAUGE_START_DEG - angleDeg) / (GAUGE_START_DEG - GAUGE_END_DEG);
}

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

/** Top semicircle: decreasing degrees, SVG sweep-flag 1 (clockwise in y-down). */
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

function fmt(value: number): string {
  return value.toFixed(2);
}
