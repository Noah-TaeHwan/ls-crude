import { useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { CaiGauge } from "~/components/cai/cai-gauge";
import { selectCaiDate } from "~/lib/cai-selection";
import type { CaiPublicView, CaiIndexView } from "~/lib/cai-view";

/** 지수 그래프의 고정 SVG 좌표. */
const PLOT = { width: 720, height: 210, left: 50, right: 12, top: 15, bottom: 30 };

/**
 * 날짜 좌표와 결측에서 끊긴 선을 만든다. 없는 날짜의 점수를 보간하지 않는다.
 * @param points 날짜 오름차순 지수 이력.
 * @returns SVG 선 묶음과 날짜·점수 좌표 함수.
 */
export function caiHistoryPlot(points: CaiIndexView["history"]) {
  const start = Date.parse(points[0]?.date ?? "1970-01-01");
  const end = Date.parse(points.at(-1)?.date ?? "1970-01-01");
  const x = (date: string) => PLOT.left + (Date.parse(date) - start) / Math.max(end - start, 1) * (PLOT.width - PLOT.left - PLOT.right);
  const y = (score: number) => PLOT.top + (100 - score) / 100 * (PLOT.height - PLOT.top - PLOT.bottom);
  const segments: Array<Array<{ x: number; y: number }>> = [];
  let active: Array<{ x: number; y: number }> | null = null;
  for (const point of points) {
    if (point.score === null) { active = null; continue; }
    if (active === null) { active = []; segments.push(active); }
    active.push({ x: x(point.date), y: y(point.score) });
  }
  return { segments, x, y };
}

/**
 * 게이지·차트가 URL의 선택 날짜를 공유한다. 드래그 중에는 미리 보고 종료 때 주소에 반영한다.
 * @param props 검증된 CAI 공개 값.
 * @returns 선택 지수·날짜 조작·추이와 명시적으로 분리한 최신 구성.
 */
export function CaiExplorer({ view }: { view: CaiPublicView }) {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [preview, setPreview] = useState<{ key: string; date: string } | null>(null);
  const pending = useRef<{ key: string; date: string } | null>(null);
  const [inputError, setInputError] = useState<{ key: string; message: string } | null>(null);
  const query = new URLSearchParams(search);
  if (preview?.key === location.key) query.set("cai_date", preview.date);
  const selection = selectCaiDate(view.index, query);
  const index = view.index;
  if (!selection) return <CaiGauge index={index} />;
  const { point: selected, points, position: selectedIndex, range } = selection;
  const year = selected.date.slice(0, 4);
  const plot = caiHistoryPlot(points);
  /**
   * 유효한 거래일 선택만 주소에 저장한다. 다른 query/hash와 스크롤을 보존한다.
   * @param date 선택한 날짜.
   * @param nextRange 선택한 조회 범위.
   * @returns 없음.
   */
  const selectDate = (date: string, nextRange = range) => {
    if (!index.history.some((point) => point.date === date)) {
      setInputError({ key: location.key, message: "이 날짜에는 거래일 기록이 없습니다. 달력 범위 안의 다른 거래일을 선택해 주세요." });
      return;
    }
    setInputError(null);
    pending.current = null;
    const next = new URLSearchParams(search);
    next.set("cai_date", date); next.set("cai_range", nextRange);
    if (next.toString() === search.toString()) setPreview(null);
    else void navigate({ pathname: location.pathname, search: `?${next}`, hash: location.hash }, { replace: true, preventScrollReset: true });
  };
  /** 슬라이더의 변경을 조작 종료 때 한 번만 주소에 반영한다. @returns 없음. */
  const commitSlider = () => {
    const value = pending.current;
    pending.current = null;
    if (value?.key === location.key) selectDate(value.date);
  };
  return <div className="grid items-start gap-4 lg:grid-cols-2" data-cai-explorer>
    <CaiGauge index={index} selection={selection} />
    <section className="min-w-0 px-1 py-5 sm:px-5" aria-labelledby="cai-history-title" data-cai-history>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="cai-history-title" className="text-base font-medium">날짜별 활동지수</h2>
      <select aria-label="지수 표시 기간" className="min-h-11 rounded border border-border bg-background px-3 text-sm" value={range} onChange={(event) => selectDate(selected.date, event.target.value === "all" ? "all" : "year")}>
        <option value="year">{year}년</option><option value="all">전체 기록</option>
      </select>
    </div>
    <form data-cai-date-form method="get" key={selected.date} className="mt-4 flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); selectDate(String(new FormData(event.currentTarget).get("cai_date"))); }}>
      <input type="hidden" name="cai_range" value={range} />
      <label className="min-w-0 flex-1 text-xs text-muted-foreground" htmlFor="cai-date">기준일 직접 선택
        <input id="cai-date" name="cai_date" type="date" required min={index.history[0].date} max={index.history.at(-1)!.date} defaultValue={selected.date} aria-describedby="cai-date-help" className="mt-1 block min-h-11 w-full min-w-0 rounded border border-border bg-background px-3 text-sm text-foreground" />
      </label>
      <button type="submit" className="min-h-11 rounded border border-primary px-3 text-sm text-primary">날짜 보기</button>
    </form>
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" disabled={!selection.previousRecordDate} onClick={() => selection.previousRecordDate && selectDate(selection.previousRecordDate)} className="min-h-11 rounded border border-border px-3 text-sm disabled:opacity-40">← 이전 기록일</button>
      <button type="button" disabled={!selection.nextRecordDate} onClick={() => selection.nextRecordDate && selectDate(selection.nextRecordDate)} className="min-h-11 rounded border border-border px-3 text-sm disabled:opacity-40">다음 기록일 →</button>
      <button type="button" onClick={() => selectDate(index.as_of!)} className="min-h-11 rounded border border-border px-3 text-sm">최신 산출일</button>
    </div>
    <p id="cai-date-help" className="mt-2 text-xs leading-6 text-muted-foreground">거래일 기록에서 선택합니다. 날짜와 조회 범위가 주소에 저장되어 새로고침·링크 공유에도 유지됩니다.</p>
    {selection.notice || inputError?.key === location.key ? <p role="status" className="mt-2 text-xs leading-6 text-primary">{inputError?.key === location.key ? inputError.message : selection.notice}</p> : null}
    <p className="mt-3 flex flex-wrap items-baseline gap-x-3 text-sm" aria-live="polite" data-cai-selected-date>
      <span className="text-muted-foreground">선택일 {selected.date}</span><strong className="font-mono text-xl">{selected.score === null ? "— · 산출 자료 없음" : `${selected.score.toFixed(1)}점`}</strong>
    </p>
    <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} className="mt-2 block w-full" role="img" aria-label={`${points[0].date}부터 ${points.at(-1)!.date}까지 실험용 CAI. 결측 구간은 연결하지 않습니다.`}>
      {[0, 50, 100].map((score) => <g key={score} className="text-muted-foreground">
        <line x1={PLOT.left} x2={PLOT.width-PLOT.right} y1={plot.y(score)} y2={plot.y(score)} stroke="currentColor" opacity={score === 50 ? 0.5 : 0.2} strokeDasharray={score === 50 ? "4 4" : undefined} />
        <text x={PLOT.left-8} y={plot.y(score)+4} textAnchor="end" fill="currentColor" className="text-[22px] sm:text-[13px]">{score}</text>
      </g>)}
      {plot.segments.map((segment, i) => segment.length === 1
        ? <circle key={i} cx={segment[0].x} cy={segment[0].y} r="2" className="fill-primary" data-cai-history-segment />
        : <path key={i} d={segment.map((point, j) => `${j === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ")} fill="none" className="stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke" data-cai-history-segment />)}
      <line x1={plot.x(selected.date)} x2={plot.x(selected.date)} y1={PLOT.top} y2={PLOT.height-PLOT.bottom} className="stroke-foreground" strokeDasharray="2 3" opacity="0.45" />
      {selected.score === null ? null : <circle cx={plot.x(selected.date)} cy={plot.y(selected.score)} r="4" className="fill-primary" />}
      <text x={PLOT.left} y={PLOT.height-7} className="fill-muted-foreground text-[22px] sm:text-[13px]">{points[0].date}</text>
      <text x={PLOT.width-PLOT.right} y={PLOT.height-7} textAnchor="end" className="fill-muted-foreground text-[22px] sm:text-[13px]">{points.at(-1)!.date}</text>
    </svg>
    <input type="range" aria-label="확인할 지수 기준일" aria-valuetext={`${selected.date}, ${selected.score === null ? "산출 자료 없음" : `${selected.score}점`}`} min={0} max={points.length-1} value={selectedIndex} onChange={(event) => { setInputError(null); const value = { key: location.key, date: points[Number(event.target.value)].date }; pending.current = value; setPreview(value); }}
      onPointerUp={commitSlider} onPointerCancel={() => { pending.current = null; setPreview(null); }}
      onKeyUp={(event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) commitSlider(); }}
      onBlur={commitSlider} className="min-h-11 w-full accent-primary" />
    <p className="text-xs leading-6 text-muted-foreground">거래일 기준 기록입니다. 두 자료 중 하나라도 없으면 —로 남깁니다. 점선 50은 기준 평균 수준입니다.</p>
    <h3 className="mt-5 text-xs font-medium text-muted-foreground">최신 기준일의 구성 · {index.as_of}</h3>
    {selected.date !== index.as_of ? <p className="mt-1 text-xs leading-6 text-muted-foreground">아래 구성 점수는 선택일이 아닌 최신 산출일의 자료입니다. 선택일의 성분별 점수는 공개 이력에 포함되지 않았습니다.</p> : null}
    <div className="mt-2 grid gap-3 sm:grid-cols-2" aria-label="최신 지수 구성">
      {view.constituents.filter((item) => item.reading).map((item) => <div key={item.candidate_id} className="rounded-lg border border-border bg-card p-4" data-cai-input={item.candidate_id}>
        <p className="text-sm font-medium">{item.name}</p><p className="mt-2 font-mono text-xl">{item.reading!.score.toFixed(1)}<span className="ml-2 font-sans text-xs text-muted-foreground">점 · 비중 {Math.round(item.reading!.weight*100)}%</span></p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">관측 기준 {item.reading!.observed_on}<br />{item.reading!.alignment_basis} {item.reading!.aligned_on}</p>
      </div>)}
    </div>
  </section></div>;
}
