import {
  GAUGE_VIEW,
  GAUGE_ZONES,
  WATCHING_DEG,
  arcPath,
  needlePolygon,
  polarPoint,
} from "~/lib/gauge";

const { width, height, cx, cy, radius } = GAUGE_VIEW;
const TRACK = radius - 28;
const TICK_ANGLES = [180, 165, 150, 135, 120, 105, 90, 75, 60, 45, 30, 15, 0];

function formatSliceZ(value: number | null) {
  if (value == null) return "—";
  return value.toFixed(2);
}

export function WatchGauge({ sliceZ }: { sliceZ: number | null }) {
  const quiet = arcPath(cx, cy, TRACK, GAUGE_ZONES.quiet.from, GAUGE_ZONES.quiet.to);
  const watching = arcPath(
    cx,
    cy,
    TRACK,
    GAUGE_ZONES.watching.from,
    GAUGE_ZONES.watching.to,
  );
  const open = arcPath(cx, cy, TRACK, GAUGE_ZONES.open.from, GAUGE_ZONES.open.to);
  const quietLabel = polarPoint(cx, cy, TRACK - 44, 168);
  const watchLabel = polarPoint(cx, cy, TRACK - 44, WATCHING_DEG);
  const openLabel = polarPoint(cx, cy, TRACK - 44, 18);

  return (
    <section className="border border-border bg-card/30 px-3 pt-4 pb-5 sm:px-6">
      <p className="font-mono text-[10px] tracking-[0.22em] text-heading uppercase">
        공개 신호 게이지
      </p>
      <div className="mx-auto max-w-3xl">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto block h-auto w-full"
          role="img"
          aria-label="관측 게이지. 바늘은 WATCHING에 고정되어 있습니다."
        >
          <path
            d={arcPath(cx, cy, TRACK, 180, 0)}
            fill="none"
            stroke="currentColor"
            strokeWidth="22"
            className="text-border"
            strokeLinecap="butt"
          />
          <path
            d={quiet}
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
            className="text-watching/45"
          />
          <path
            d={watching}
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
            className="text-watching"
          />
          <path
            d={open}
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
            className="text-foreground/12"
          />
          {TICK_ANGLES.map((angle) => {
            const outer = polarPoint(cx, cy, TRACK + 16, angle);
            const inner = polarPoint(cx, cy, TRACK - 8, angle);
            return (
              <line
                key={angle}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeWidth={angle % 45 === 0 ? 1.4 : 0.7}
                className="text-foreground/35"
              />
            );
          })}
          <text
            x={quietLabel.x}
            y={quietLabel.y}
            textAnchor="middle"
            className="fill-watching/80 font-mono text-[11px] tracking-[0.18em]"
          >
            QUIET
          </text>
          <text
            x={watchLabel.x}
            y={watchLabel.y - 6}
            textAnchor="middle"
            className="fill-watching font-mono text-[11px] tracking-[0.18em]"
          >
            WATCHING
          </text>
          <text
            x={openLabel.x}
            y={openLabel.y}
            textAnchor="middle"
            className="fill-foreground/35 font-mono text-[11px] tracking-[0.18em]"
          >
            —
          </text>
          <polygon
            points={needlePolygon(cx, cy, TRACK - 6, WATCHING_DEG)}
            className="fill-watching"
          />
          <circle cx={cx} cy={cy} r="11" className="fill-background stroke-watching" strokeWidth="1.5" />
          <text
            x={cx}
            y={cy - 48}
            textAnchor="middle"
            fontSize="28"
            letterSpacing="0.28em"
            className="fill-watching font-mono"
          >
            WATCHING
          </text>
        </svg>
      </div>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-watching uppercase">
          <span className="watch-led inline-block size-1.5 rounded-full bg-watching" />
          관측 중
        </p>
        <p className="max-w-xl text-sm text-foreground/85">
          펜타곤 피자 인덱스처럼, 유가 옆의 공개 신호를 아직 찾는 중입니다.
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          Oil Slice z {formatSliceZ(sliceZ)} · 초안 읽기값 · 바늘은 움직이지 않습니다
        </p>
      </div>
    </section>
  );
}
