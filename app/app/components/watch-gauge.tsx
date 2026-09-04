import {
  GAUGE_VIEW,
  GAUGE_ZONES,
  arcPath,
  needlePolygon,
  polarPoint,
  ratioToAngle,
} from "~/lib/gauge";

/** 반원 게이지가 받는 표시값. */
interface WatchGaugeProps {
  score: number | null;
  title: string;
  bandLabel: string;
  scoreCaption: string;
  explainer: string;
  detail?: string;
  isExample?: boolean;
  ariaLabel?: string;
}

/** 게이지의 고정 SVG 좌표. */
const { width, height, cx, cy, radius } = GAUGE_VIEW;
/** 눈금이 놓이는 반지름. */
const TRACK = radius - 28;
/** 게이지에 표시할 백분위 눈금. */
const TICK_SCORES = [0, 20, 40, 60, 80, 100] as const;
/** 존 경계 눈금. GAUGE_ZONES에서 파생하며 색상값은 바꾸지 않는다. */
const ZONE_BOUNDARIES = [
  GAUGE_ZONES.stable.to,
  GAUGE_ZONES.normal.to,
  GAUGE_ZONES.elevated.to,
] as const;

/**
 * 반원 속도계를 그린다. 기하학은 gauge.ts, 제목·구간·예시는 호출측 props다.
 * @param props 바늘 점수와 표시 문구.
 * @returns 접근 가능한 SVG 게이지.
 */
export function WatchGauge({
  score,
  title,
  bandLabel,
  scoreCaption,
  explainer,
  detail,
  isExample = false,
  ariaLabel,
}: WatchGaugeProps) {
  const normalizedScore =
    score == null || !Number.isFinite(score)
      ? null
      : Math.round(Math.max(0, Math.min(100, score)));
  const needleAngle =
    normalizedScore == null ? null : ratioToAngle(normalizedScore / 100);
  const resolvedAriaLabel =
    ariaLabel ??
    (normalizedScore == null
      ? `${title} 데이터 없음`
      : `${isExample ? "예시 " : ""}${title} ${normalizedScore}, ${bandLabel}`);

  return (
    <section className="relative px-1 pt-5 pb-3 sm:px-5" aria-labelledby="gauge-title">
      {isExample ? (
        <span className="absolute right-3 top-4 z-10 bg-primary px-2 py-0.5 font-mono text-xs font-semibold tracking-widest text-primary-foreground sm:right-5">
          예시
        </span>
      ) : null}
      <h1
        id="gauge-title"
        className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {title}
      </h1>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="volatility-gauge mx-auto mt-1 block h-auto w-full max-w-[36rem]"
        role="img"
        aria-describedby="gauge-explainer"
        aria-label={resolvedAriaLabel}
      >
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.stable.from, GAUGE_ZONES.stable.to)}
          data-zone="stable"
          className="text-primary/65"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.normal.from, GAUGE_ZONES.normal.to)}
          data-zone="normal"
          className="text-primary/78"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.elevated.from, GAUGE_ZONES.elevated.to)}
          data-zone="elevated"
          className="text-primary/90"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.extreme.from, GAUGE_ZONES.extreme.to)}
          data-zone="extreme"
          className="text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />

        {TICK_SCORES.map((tick) => {
          const angle = ratioToAngle(tick / 100);
          const outer = polarPoint(cx, cy, TRACK + 18, angle);
          const inner = polarPoint(cx, cy, TRACK - 14, angle);
          const label = polarPoint(cx, cy, TRACK + 42, angle);
          return (
            <g key={tick}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className="text-foreground/55"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor="middle"
                className="fill-foreground/80 font-mono text-[13px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {ZONE_BOUNDARIES.map((boundary) => {
          const outer = polarPoint(cx, cy, TRACK + 11, boundary);
          const inner = polarPoint(cx, cy, TRACK - 11, boundary);
          return (
            <line
              key={boundary}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              className="text-foreground/55"
              stroke="currentColor"
              strokeWidth="2"
            />
          );
        })}

        {needleAngle == null ? null : (
          <polygon
            points={needlePolygon(cx, cy, TRACK - 2, needleAngle, 12)}
            className="fill-primary"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r="10"
          className="fill-background stroke-primary"
          strokeWidth="2"
        />
        <text
          x={cx}
          y={cy - 102}
          textAnchor="middle"
          className="fill-primary font-mono text-[24px] font-medium"
        >
          {normalizedScore == null ? "데이터 없음" : bandLabel}
        </text>
        <text
          x={cx}
          y={cy - 52}
          textAnchor="middle"
          className="fill-foreground font-mono text-[50px] font-medium"
        >
          {normalizedScore ?? "—"}
        </text>
        <text
          x={cx}
          y={cy - 24}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[12px]"
        >
          {scoreCaption}
        </text>
      </svg>
      <div id="gauge-explainer" className="-mt-2 text-center">
        <p className="text-base font-medium text-foreground">{explainer}</p>
        {detail ? (
          <p className="mt-1 font-mono text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </div>
    </section>
  );
}
