import {
  GAUGE_VIEW,
  GAUGE_ZONES,
  arcPath,
  needlePolygon,
  polarPoint,
  ratioToAngle,
  volatilityBand,
} from "~/lib/gauge";

/** 변동성 게이지가 받는 공개 관측값. */
interface WatchGaugeProps {
  score: number | null;
  rv5: number | null;
}

/** 게이지의 고정 SVG 좌표. */
const { width, height, cx, cy, radius } = GAUGE_VIEW;
/** 눈금이 놓이는 반지름. */
const TRACK = radius - 28;
/** 게이지에 표시할 백분위 눈금. */
const TICK_SCORES = [0, 20, 40, 60, 80, 100] as const;

/**
 * 숫자를 한 자리 백분율로 표시한다.
 * @param value 표시할 숫자.
 * @returns 표시 문자열.
 */
function formatPercent(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;
}

/**
 * 최근 WTI 실현변동성의 장기 분포 백분위를 그린다.
 * @param props 백분위 점수와 최근 5일 변동성.
 * @returns 접근 가능한 SVG 게이지.
 */
export function WatchGauge({ score, rv5 }: WatchGaugeProps) {
  const normalizedScore =
    score == null || !Number.isFinite(score)
      ? null
      : Math.round(Math.max(0, Math.min(100, score)));
  const band = normalizedScore == null ? "데이터 없음" : volatilityBand(normalizedScore);
  const needleAngle =
    normalizedScore == null ? null : ratioToAngle(normalizedScore / 100);

  return (
    <section className="px-1 pt-5 pb-3 sm:px-5" aria-labelledby="volatility-title">
      <h1
        id="volatility-title"
        className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        WTI 변동성
      </h1>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="volatility-gauge mx-auto mt-1 block h-auto w-full max-w-[36rem]"
        role="img"
        aria-describedby="volatility-explainer"
        aria-label={
          normalizedScore == null
            ? "WTI 변동성 백분위 데이터 없음"
            : `WTI 5거래일 실현변동성 백분위 ${normalizedScore}, ${band}`
        }
      >
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.stable.from, GAUGE_ZONES.stable.to)}
          className="text-primary/65"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.normal.from, GAUGE_ZONES.normal.to)}
          className="text-primary/78"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.elevated.from, GAUGE_ZONES.elevated.to)}
          className="text-primary/90"
          fill="none"
          stroke="currentColor"
          strokeWidth="22"
        />
        <path
          d={arcPath(cx, cy, TRACK, GAUGE_ZONES.extreme.from, GAUGE_ZONES.extreme.to)}
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
          {band}
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
          장기 기준 백분위 (0–100)
        </text>
      </svg>
      <div id="volatility-explainer" className="-mt-2 text-center">
        <p className="text-base font-medium text-foreground">
          방향이 아니라 움직임의 크기입니다.
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          최근 5거래일의 연환산 실현변동성: {formatPercent(rv5)}
        </p>
      </div>
    </section>
  );
}
