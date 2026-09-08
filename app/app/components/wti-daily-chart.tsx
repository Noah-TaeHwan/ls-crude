import { useState, type PointerEvent } from "react";
import { useRevalidator } from "react-router";
import { wtiPriceFraction, wtiPriceTicks } from "~/lib/wti-chart-axis";
import { DAILY_RANGES, filterDailyBars, type DailyRange, type WtiDailyView } from "~/lib/wti-daily";

/** 기간 선택 표시명. */
const LABELS: Record<DailyRange, string> = { "5y": "5년", "3y": "3년", "1y": "1년", "6mo": "6개월", "3mo": "3개월", "1mo": "1개월", "1wk": "1주일" };
/** 일봉 좌표계. 거래일별 동일 간격으로 표시한다. */
const WIDTH = 900, HEIGHT = 320, PAD = 24;
/** @param value UTC 시각. @returns 동일한 KST 표기. */
function kst(value: string): string { return new Date(Date.parse(value) + 9 * 3600000).toISOString().slice(0, 19).replace("T", " "); }

/**
 * 최신 Yahoo 일봉을 포함한 단일 가격 그래프를 보여준다.
 * @param props 일봉 전체와 조회 오류.
 * @returns 7가지 기간과 키보드·포인터 탐색을 제공하는 일봉 차트.
 */
export function WtiDailyChart({ view }: { view: WtiDailyView }) {
  const [range, setRange] = useState<DailyRange>("1y");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const revalidator = useRevalidator();
  const data = view.data;
  const bars = filterDailyBars(data?.bars ?? [], range);
  const latest = data?.bars.at(-1);
  const previous = data?.bars.at(-2);
  const delta = latest && previous ? latest.close - previous.close : null;
  const found = bars.findIndex(bar => bar.date === selectedDate);
  const index = found >= 0 ? found : bars.length - 1;
  const selected = bars[index];
  const low = bars.length ? Math.min(...bars.map(bar => bar.low)) : 0;
  const high = bars.length ? Math.max(...bars.map(bar => bar.high)) : 0;
  const ticks = wtiPriceTicks(low, high);
  const spacing = (WIDTH - PAD * 2) / Math.max(bars.length, 1);
  const candleWidth = Math.min(12, spacing * .65);
  const x = (i: number) => PAD + spacing * (i + .5);
  const y = (value: number) => HEIGHT - PAD - wtiPriceFraction(value, low, high) * (HEIGHT - PAD * 2);

  /** @param event SVG 포인터 위치. @returns 해당 거래일을 선택한다. */
  function selectAt(event: PointerEvent<SVGSVGElement>): void {
    if (!bars.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width * WIDTH;
    const i = Math.max(0, Math.min(bars.length - 1, Math.floor((position - PAD) / spacing)));
    setSelectedDate(bars[i].date);
  }

  return <div id="daily-prices" className="mt-6 min-w-0">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">WTI · CL=F · 일봉</p><p id="daily-latest-price" className="mt-2 font-mono text-4xl text-watching">{latest ? latest.close.toFixed(2) : "—"} <span className="text-sm">USD</span></p><p className="mt-2 text-sm text-muted-foreground">{latest?.date ?? "자료 없음"}{delta == null ? "" : ` · 이전 일봉 대비 ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} USD`}{data?.partialLast ? " · 마지막 일봉 변경 가능" : ""}</p></div><button type="button" className="filter-button" disabled={revalidator.state !== "idle"} onClick={() => void revalidator.revalidate()}>{revalidator.state === "idle" ? "가격 다시 확인" : "확인 중…"}</button></div>
    <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="일봉 조회 기간">{DAILY_RANGES.map(value => <button key={value} type="button" className="filter-button" aria-pressed={range === value} onClick={() => { setRange(value); setSelectedDate(null); }}>{LABELS[value]}</button>)}</div>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">모든 기간을 일봉으로 표시합니다. <span className="text-watching">상승(종가 ≥ 시가)</span> · <span className="text-primary">하락(종가 &lt; 시가)</span></p>
    {view.error && <p role="status" className="mt-3 text-sm text-primary">{view.error}</p>}
    {data?.note && <p role="status" className="mt-3 text-sm text-primary">{data.note}</p>}
    {latest && selected ? <>
      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_4rem] gap-x-2">
      <div aria-hidden="true"/><p className="pb-1 text-right font-mono text-xs text-muted-foreground">USD</p>
      <svg id="wti-daily-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-64 w-full min-w-0 text-watching sm:h-80" role="img" aria-label={`WTI ${LABELS[range]} 일봉 ${bars.length}개, 마지막 ${latest.date} ${latest.close.toFixed(2)} 달러`} aria-describedby="daily-summary" onPointerDown={selectAt} onPointerMove={event => { if (event.pointerType === "mouse") selectAt(event); }}>
        {ticks.map(({ value, label }) => <line key={label} data-price-grid={label} x1={PAD} x2={WIDTH-PAD} y1={y(value)} y2={y(value)} stroke="currentColor" opacity=".15"/>)}
        {bars.map((bar,i) => <g key={bar.date} data-day={bar.date} data-close={bar.close} className={bar.close >= bar.open ? "text-watching" : "text-primary"}>
          <line x1={x(i)} x2={x(i)} y1={y(bar.high)} y2={y(bar.low)} stroke="currentColor" strokeWidth={Math.min(1, spacing * .5)}/>
          <rect x={x(i)-candleWidth/2} y={Math.min(y(bar.open), y(bar.close))} width={candleWidth} height={Math.max(.7, Math.abs(y(bar.close)-y(bar.open)))} fill="currentColor" opacity={data?.partialLast && bar.date === latest.date ? .6 : 1}/>
        </g>)}
        <line x1={x(index)} x2={x(index)} y1={PAD} y2={HEIGHT-PAD} stroke="currentColor" strokeDasharray="3 5" opacity=".6"/>
        <circle cx={x(index)} cy={y(selected.close)} r="3" fill="currentColor"/>
      </svg>
      <div id="wti-price-axis" aria-label="가격 눈금 · USD" className="relative h-64 font-mono text-xs text-muted-foreground sm:h-80">
        {ticks.map(({ value, label }) => <span key={label} data-price-tick={label} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${y(value) / HEIGHT * 100}%` }}>{label}</span>)}
      </div>
      <div id="wti-date-axis" className="flex min-w-0 flex-wrap justify-between gap-x-3 text-xs font-mono text-muted-foreground"><span>{bars[0].date}</span><span>{bars.at(-1)!.date}</span></div>
      </div>
      <label htmlFor="daily-date" className="mt-5 block text-sm">거래일 탐색 · <output htmlFor="daily-date">{selected.date} · 종가 {selected.close.toFixed(2)} USD</output></label>
      <input id="daily-date" type="range" min={0} max={bars.length-1} value={index} disabled={bars.length<2} onChange={event=>setSelectedDate(bars[Number(event.target.value)].date)} aria-valuetext={`${selected.date}, 시가 ${selected.open.toFixed(2)}, 고가 ${selected.high.toFixed(2)}, 저가 ${selected.low.toFixed(2)}, 종가 ${selected.close.toFixed(2)} 달러`} className="min-h-11 w-full accent-watching"/>
      <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">{[["시가",selected.open],["고가",selected.high],["저가",selected.low],["종가",selected.close]].map(([label,value])=><div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-mono">{Number(value).toFixed(2)}</dd></div>)}</dl>
      <p id="daily-summary" className="mt-4 text-xs leading-6 text-muted-foreground">{LABELS[range]} · {bars.length}개 일봉 · 최저 {low.toFixed(2)} / 최고 {high.toFixed(2)} USD. 기간을 바꿔도 상단 가격과 마지막 일봉은 동일합니다. 휴장일·누락값은 임의로 채우지 않습니다.</p>
    </> : <div className="empty-state mt-5"><h3>일봉을 표시할 자료가 없습니다.</h3><p>자료가 확보되면 같은 화면에서 가격과 기간별 일봉을 표시합니다.</p></div>}
    {data && <p className="mt-4 text-xs leading-6 text-muted-foreground">최신 일봉 원천 시각 {kst(data.observedAt)} KST · 조회 {kst(data.fetchedAt)} KST</p>}
    <p className="mt-2 text-xs leading-6 text-muted-foreground">Yahoo Finance CL=F 일봉 · 날짜는 원천 시각의 뉴욕 날짜입니다. 마지막 일봉은 장중에 바뀔 수 있고 제공자 지연이 있습니다. 페이지를 열 때와 보이는 화면에서 5분마다 확인합니다. 공식 정산가가 아니며 만기 교체에 따른 가격 차이가 포함될 수 있습니다.</p>
  </div>;
}
