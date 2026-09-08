import { useState } from "react";
import { useRevalidator } from "react-router";
import type { WtiQuoteView } from "~/lib/wti-quote.server";

/** SVG 크기와 여백. */
const WIDTH = 720, HEIGHT = 240, PAD = 20;
/** 분봉 단절 판단 간격: 5분 간격의 1.5배. */
const GAP_MS = 450_000;

/** @param value UTC 시각. @returns 서버·브라우저에서 같은 KST 문자열. */
function kst(value: string): string { return new Date(Date.parse(value) + 9 * 3600000).toISOString().slice(0, 19).replace("T", " "); }

/**
 * 실제 분봉의 빈 구간과 최신 시세를 서로 다른 표식으로 보여준다.
 * @param props 시세와 분봉, 마지막 조회의 실패 정보.
 * @returns 시간축·키보드 탐색을 제공하는 시장 관측 그래프.
 */
export function WtiIntraday({ view }: { view: WtiQuoteView }) {
  const [selected, setSelected] = useState<string | null>(null);
  const revalidator = useRevalidator();
  const quote = view.quote;
  const bars = quote?.points ?? [];
  const observations = [...bars.map(p => ({ ...p, kind: "5분봉", key: `bar:${p.time}` })), ...(quote ? [{ time: quote.observedAt, price: quote.price, kind: "최근 시세", key: `quote:${quote.observedAt}` }] : [])].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  const quoteIndex = observations.findIndex(p => p.key.startsWith("quote:"));
  const found = observations.findIndex(p => p.key === selected);
  const index = found >= 0 ? found : Math.max(quoteIndex, 0);
  const current = observations[index];
  const firstTime = observations.length ? Date.parse(observations[0].time) : 0;
  const lastTime = observations.length ? Date.parse(observations.at(-1)!.time) : 0;
  const values = observations.map(p => p.price);
  const low = values.length ? Math.min(...values) : 0, high = values.length ? Math.max(...values) : 0;
  const margin = Math.max((high - low) * .08, .05);
  const x = (time: string) => lastTime === firstTime ? WIDTH / 2 : PAD + (Date.parse(time) - firstTime) / (lastTime - firstTime) * (WIDTH - PAD * 2);
  const y = (price: number) => HEIGHT - PAD - (price - low + margin) / (high - low + margin * 2) * (HEIGHT - PAD * 2);
  const path = bars.map((p, i) => `${i === 0 || Date.parse(p.time) - Date.parse(bars[i - 1].time) > GAP_MS ? "M" : "L"}${x(p.time).toFixed(2)},${y(p.price).toFixed(2)}`).join(" ");
  const singletons = bars.filter((p, i) => (i === 0 || Date.parse(p.time) - Date.parse(bars[i - 1].time) > GAP_MS) && (i === bars.length - 1 || Date.parse(bars[i + 1].time) - Date.parse(p.time) > GAP_MS));
  const lastBar = bars.at(-1);
  return <section id="intraday" className="evidence-note mt-6 min-w-0" aria-label="Yahoo 최근 수신 시세">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-base font-medium">WTI · 최근 시세와 분봉 흐름</h3><p className="mt-2 font-mono text-4xl text-watching">{quote ? quote.price.toFixed(2) : "—"} <span className="text-sm">USD</span></p></div><button type="button" className="filter-button" disabled={revalidator.state !== "idle"} onClick={() => void revalidator.revalidate()}>{revalidator.state === "idle" ? "시세·그래프 다시 확인" : "확인 중…"}</button></div>
    {quote ? <>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">시세 시각 {kst(quote.observedAt)} KST · 조회 시각 {kst(quote.fetchedAt)} KST</p>
      <p className="mt-2 text-xs leading-6"><span className="text-watching">━ 실제 5분봉</span><span className="ml-5 text-primary">◆ 최근 시세</span> · 빈 구간은 선을 끊습니다.</p>
      {quote.chartError && <p role="status" className="mt-3 text-sm leading-7 text-primary">{quote.chartError}</p>}
      <svg id="intraday-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 w-full text-watching" role="img" aria-label={`WTI 5분봉 ${bars.length}개와 최근 시세 ${quote.price.toFixed(2)} 달러`} aria-describedby="intraday-summary">
        {[low, high].filter((v,i,a)=>a.indexOf(v)===i).map(value => <g key={value}><line x1={PAD} x2={WIDTH-PAD} y1={y(value)} y2={y(value)} stroke="currentColor" opacity=".15"/><text className="hidden sm:block" x={PAD} y={y(value)-6} fill="currentColor" fontSize="11">{value.toFixed(2)}</text></g>)}
        <path data-series="intraday-bars" d={path} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
        {singletons.map(p=><circle key={p.time} cx={x(p.time)} cy={y(p.price)} r="3" fill="currentColor"/>)}
        {lastBar && Date.parse(quote.observedAt) - Date.parse(lastBar.time) > GAP_MS && <text className="hidden sm:block" x={(x(lastBar.time) + x(quote.observedAt)) / 2} y={HEIGHT / 2} textAnchor="middle" fill="currentColor" opacity=".7" fontSize="11">분봉 미제공 구간</text>}
        <path data-series="latest-quote" className="text-primary" d={`M${x(quote.observedAt)},${y(quote.price)-6} l6,6 l-6,6 l-6,-6 Z`} fill="currentColor"/>
        {current && <g><line x1={x(current.time)} x2={x(current.time)} y1={PAD} y2={HEIGHT-PAD} stroke="currentColor" opacity=".5" strokeDasharray="3 5"/><circle cx={x(current.time)} cy={y(current.price)} r="4" fill="none" stroke="currentColor"/></g>}
      </svg>
      <div className="flex justify-between gap-4 text-xs font-mono text-muted-foreground"><span>{kst(observations[0].time).slice(5,16)}</span><span>{kst(observations.at(-1)!.time).slice(5,16)} KST</span></div>
      <label htmlFor="intraday-time" className="mt-4 block text-sm">시각 탐색 · <output htmlFor="intraday-time">{current.kind} / {kst(current.time)} KST / {current.price.toFixed(2)} USD</output></label>
      <input id="intraday-time" type="range" min={0} max={observations.length-1} value={index} disabled={observations.length<2} onChange={event=>setSelected(observations[Number(event.target.value)].key)} aria-valuetext={`${current.kind}, ${kst(current.time)} KST, ${current.price.toFixed(2)} 달러`} className="min-h-11 w-full accent-watching"/>
      <p id="intraday-summary" className="mt-2 text-xs leading-6 text-muted-foreground">{lastBar ? `분봉 마지막 자료: ${kst(lastBar.time)} KST · ${lastBar.price.toFixed(2)} USD. ${bars.length}개 관측.` : "분봉 자료가 없어 실제 수신 시세 한 점만 표시합니다. 가격 흐름을 추정해 만들지 않습니다."} 표시 범위 최저 {low.toFixed(2)} / 최고 {high.toFixed(2)} USD. 최신 시세 점은 분봉 종가와 다른 관측입니다. 시간 간격을 실제 비율로 표시하며 빈 구간은 휴장·자료 누락일 수 있습니다.</p>
    </> : <p className="mt-3 text-sm">최근 시세를 확보하지 못했습니다. 아래 완료 일봉은 별도 자료입니다.</p>}
    {view.error && <p role="status" className="mt-3 text-sm text-primary">{view.error}</p>}
    <p className="mt-3 text-xs leading-6 text-muted-foreground">페이지를 열 때 확인하고, 보이는 화면은 5분마다 자동 확인합니다. Yahoo 제공 지연이 포함되며 공식 정산가가 아닙니다. 아래 완료 일봉·실현변동성 계산에는 최근 시세나 미완료 분봉을 섞지 않습니다.</p>
  </section>;
}
