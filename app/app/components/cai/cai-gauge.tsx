import { gaugeAngle, type CaiIndexView } from "~/lib/cai-view";
import type { CaiDateSelection } from "~/lib/cai-selection";
import { GAUGE_VIEW, arcPath, needlePolygon, polarPoint } from "~/lib/gauge";

/** 게이지의 고정 SVG 좌표. 기존 반원 게이지 좌표계를 재사용한다. */
const { width, height, cx, cy, radius } = GAUGE_VIEW;
/** 호가 놓이는 반지름. */
const TRACK = radius - 28;
/** 눈금 점수. */
const TICKS = [0, 25, 50, 75, 100] as const;

/**
 * 숫자 옆에 숨기지 않고 붙이는 자료 상태 라벨.
 * @param index 검증된 index 영역.
 * @returns 표시 라벨 또는 없으면 null.
 */
function stateLabel(index: CaiIndexView): string | null {
  if (index.data_origin === "DEMO") return "데모 · 미게시";
  if (index.data_origin === "NO_DATA") return "산출 대기";
  if (index.freshness === "STALE") return "갱신 지연";
  if (index.freshness === "ERROR") return "갱신 오류";
  if (index.score === null) return "산출 대기";
  if (index.mode === "RETROSPECTIVE") return `실험용 ${index.definition_version?.replace(/^cai-/, "") ?? "CAI"} · 과거 자료`;
  return null;
}

/**
 * 가중치 방식의 표시명.
 * @param method 검증된 가중치 방식.
 * @returns 표시명 또는 없으면 null.
 */
function weightingLabel(method: CaiIndexView["weighting_method"]): string | null {
  if (method === "equal-weight") return "동일 가중치";
  if (method === "learned-weight") return "학습 가중치";
  return null;
}

/**
 * 달력 날짜를 한국어 표기로 바꾼다.
 * @param value YYYY-MM-DD 문자열.
 * @returns "YYYY년 M월 D일" 또는 null.
 */
function dateLabel(value: string | null): string | null {
  if (value === null) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return `${y}년 ${m}월 ${d}일`;
}

/**
 * CAI 반원 계기판을 그린다. 점수는 활동 척도이며 등급이 아니다.
 * 공개 지수 자체가 없으면 compact 표시를 쓴다. 날짜 탐색 중 결측이면 높이를 유지한다.
 * null이면 바늘을 숨기고 — 를 표시한다.
 * @param props 검증된 index 영역.
 * @returns 접근 가능한 계기판.
 */
export function CaiGauge({ index, selection }: { index: CaiIndexView; selection?: CaiDateSelection | null }) {
  const selected = selection && index.mode === "RETROSPECTIVE" && index.data_origin === "OBSERVED" && index.score !== null ? selection : null;
  const score = selected ? selected.point.score : index.score;
  const previousScore = selected ? selected.previousScore : index.previous_score;
  const state = selected && score === null ? "선택일 자료 없음" : stateLabel(index);
  const weighting = weightingLabel(index.weighting_method);
  const asOf = dateLabel(selected ? selected.point.date : index.as_of);
  const angle = score === null ? null : gaugeAngle(score);
  const svgAngle = angle === null ? null : 90 - angle;
  const delta =
    score !== null && previousScore !== null
      ? score - previousScore
      : null;
  const ariaValueText =
    score === null ? selected ? "선택일 지수 자료 없음" : "점수 산출 대기" : `${score}점 / 100점`;
  // 미산출 상태에서는 계기판이 화면을 차지하지 않도록 compact로 전환한다.
  const compact = score === null && selected === null;

  return (
    <section
      data-cai-gauge={compact ? "compact" : "full"}
      className="relative px-1 pt-5 pb-3 sm:px-5"
      aria-labelledby="cai-gauge-title"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="cai-gauge-title" className="text-xl font-semibold tracking-tight text-foreground">
          쿠싱 액티비티 인덱스
        </h2>
        {state === null ? null : (
          <span
            data-cai-state={state}
            className="border border-primary/60 px-2 py-0.5 font-mono text-xs text-primary"
          >
            {state}
          </span>
        )}
      </div>
      {index.mode === "RETROSPECTIVE" && !compact ? <p className="mt-3 text-sm font-medium text-primary" data-cai-historical-date>{selected ? "선택 기준일" : "기준일"} {asOf} · 현재 값이 아닙니다</p> : null}
      {compact ? (
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={ariaValueText}
          className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-border px-3 py-2.5"
        >
          <span data-cai-score="none" className="font-mono text-3xl text-muted-foreground">
            —
          </span>
          <span className="font-mono text-xs text-muted-foreground">/ 100</span>
          <span className="text-sm text-muted-foreground">
            {asOf === null ? "기준일 확인 중" : `기준일 ${asOf}`}
          </span>
          <span className="text-xs text-muted-foreground">0–100점 · 산출 대기</span>
        </div>
      ) : (
        <>
          <div
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score ?? undefined}
            aria-valuetext={ariaValueText}
            className="relative mx-auto mt-1 w-full max-w-2xl"
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="volatility-gauge mx-auto block h-auto w-full"
              aria-hidden="true"
            >
              <path
                d={arcPath(cx, cy, TRACK, 180, 0)}
                className="text-foreground/30"
                fill="none"
                stroke="currentColor"
                strokeWidth="22"
              />
              {TICKS.map((tick) => {
                const tickAngle = 90 - (gaugeAngle(tick) as number);
                const outer = polarPoint(cx, cy, TRACK + 22, tickAngle);
                const inner = polarPoint(cx, cy, TRACK - 10, tickAngle);
                const label = polarPoint(cx, cy, TRACK + 48, tickAngle);
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
                      className="fill-foreground/80 font-mono text-[20px] sm:text-[13px]"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}
              {svgAngle === null ? null : (
                <polygon
                  data-needle
                  data-needle-angle={svgAngle.toFixed(2)}
                  points={needlePolygon(cx, cy, TRACK - 2, svgAngle, 12)}
                  className="fill-primary"
                />
              )}
              <circle cx={cx} cy={cy} r="10" className="fill-background stroke-primary" strokeWidth="2" />
              {/* 바늘이 숫자를 지나가더라도 점수가 선명하게 읽히도록 계기판 창을 둔다. */}
              <rect x={cx - 105} y={cy - 113} width={235} height={76} rx={8} className="fill-background" />
              <text
                x={cx}
                y={cy - 60}
                textAnchor="middle"
                className="fill-foreground font-mono text-[50px] font-medium"
                data-cai-score={score === null ? "none" : String(score)}
              >
                {score === null ? "—" : score}
              </text>
              <text
                x={cx + 70}
                y={cy - 64}
                textAnchor="start"
                className="fill-muted-foreground font-mono text-[20px] sm:text-[12px]"
              >
                / 100
              </text>
            </svg>
          </div>
          <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {asOf === null ? "기준일 확인 중" : `기준일 ${asOf}`}
              {weighting === null ? "" : ` · ${weighting}`}
              {index.constituent_count > 0 ? ` · 구성 ${index.constituent_count}개` : ""}
            </span>
            {delta === null ? null : (
              <span className="whitespace-nowrap">
                <strong className="font-mono text-foreground">
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(1)}점
                </strong>{" "}
                {selected ? `이전 기록일(${selected.previousDate}) 대비` : index.mode === "RETROSPECTIVE" ? "직전 산출일 대비" : "이전 기준주 대비"}
              </span>
            )}
          </div>
        </>
      )}
      <p className="mx-auto mt-2 max-w-2xl text-xs leading-6 text-muted-foreground">
        {compact
          ? "공식 지수는 준비 중입니다. 점수는 활동 수준을 나타내며 유가 상승 확률이나 매매 신호가 아닙니다."
          : selected && score === null
            ? "선택일에는 필요한 자료가 함께 확보되지 않아 지수를 산출하지 않았습니다. 결측을 0이나 다른 날의 값으로 바꾸지 않습니다."
          : index.mode === "RETROSPECTIVE"
            ? "교통량·시설 신고 유량을 기준 분포와 비교한 실험 지수입니다. 50은 각 자료의 기준 평균 수준이며, 원유 가동률이나 유가 상승 확률이 아닙니다."
            : "점수는 활동 신호의 수준이며 유가 상승 확률이나 매매 신호가 아닙니다. 결측이면 —로 표시하고 바늘을 숨깁니다."}
      </p>
    </section>
  );
}
