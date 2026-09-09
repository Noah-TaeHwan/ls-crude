import type { PointerEvent } from "react";
import { nearestDateIndex } from "~/lib/research-charts";

/** 색을 구분하기 어려워도 범례와 선을 대응할 수 있는 계열별 선 모양. */
const SERIES_DASHES = ["", "6 3", "2 3", "8 3 2 3"];

/** 실제로 표시하는 한 연료 또는 비율 계열. */
interface Series { label: string; color: string; values: (number|null)[]; dots?: boolean }
/** 날짜 그래프의 표시와 탐색 계약. */
interface ChartProps { id: string; title: string; dates: string[]; series: Series[]; maximum: number; minimum?:number; description?:string; unit: string; selected: number; onSelect: (index:number)=>void; start?:string; end?:string }

/**
 * CSS 픽셀 크기의 점과 HTML 축으로 작은 화면에서도 읽을 수 있는 관측 그래프를 그린다.
 * @param props 날짜·값·선택 상태. 날짜는 실제 달력 간격을 유지한다.
 * @returns 하나의 반응형 관측 그래프.
 */
export function ResearchChart({ id,title,dates,series,maximum,minimum=0,description,unit,selected,onSelect,start=dates[0],end=dates.at(-1)! }: ChartProps) {
  const span = Math.max(1,Date.parse(end)-Date.parse(start));
  const x = (i:number) => 2 + 96*(Date.parse(dates[i])-Date.parse(start))/span;
  const y = (v:number) => 92 - 84*(v-minimum)/(maximum-minimum);
  const ticks=[minimum,(minimum+maximum)/2,maximum];
  const hasSelection=selected>=0 && selected<dates.length;
  const middle = new Date((Date.parse(start)+Date.parse(end))/2).toISOString().slice(0,7);
  /** @param event 포인터 위치. @returns 가장 가까운 관측을 선택한다. */
  function pick(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    onSelect(nearestDateIndex(dates,((event.clientX-rect.left)/rect.width-.02)/.96,start,end));
  }
  return <figure className="min-w-0" aria-labelledby={`${id}-title`}>
    <figcaption id={`${id}-title`} className="mb-3 text-sm font-medium">{title} <span className="font-normal text-muted-foreground">({unit})</span></figcaption>
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">{series.map((s,index)=><span key={s.label} className="inline-flex items-center gap-2"><svg aria-hidden="true" width="24" height="8" className="shrink-0">{s.dots ? <circle cx="12" cy="4" r="3" fill={s.color} /> : <line x1="0" x2="24" y1="4" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={SERIES_DASHES[index % SERIES_DASHES.length]} />}</svg>{s.label}</span>)}</div>
    <div className="grid grid-cols-[minmax(0,1fr)_3.5rem]">
      <svg id={id} className="block h-52 w-full overflow-hidden sm:h-64" role="img" aria-label={description ?? `${title}, ${dates.length}개 실제 날짜, ${start}부터 ${end}`} onPointerDown={pick} onPointerMove={e=>{if(e.pointerType==="mouse") pick(e);}}>
        {ticks.map(v=><line key={v} x1="2%" x2="98%" y1={`${y(v)}%`} y2={`${y(v)}%`} stroke="currentColor" opacity={v===0 ? ".35" : ".15"} />)}
        {series.map((s,index)=><g key={s.label} fill={s.color} stroke={s.color}>
          {s.dots ? s.values.map((v,i)=>v===null ? null : <circle key={dates[i]} cx={`${x(i)}%`} cy={`${y(v)}%`} r="3" data-date={dates[i]} />) : <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path fill="none" vectorEffect="non-scaling-stroke" strokeWidth="1.5" strokeDasharray={SERIES_DASHES[index % SERIES_DASHES.length]} d={s.values.map((v,i)=>v===null ? "" : `${i===0 || s.values[i-1]===null ? "M" : "L"}${x(i)},${y(v)}`).join(" ")} /></svg>}
          {hasSelection&&s.values[selected]!=null&&<circle cx={`${x(selected)}%`} cy={`${y(s.values[selected])}%`} r="4" stroke="var(--background)" strokeWidth="1" />}
        </g>)}
        {hasSelection&&<line x1={`${x(selected)}%`} x2={`${x(selected)}%`} y1="8%" y2="92%" stroke="currentColor" strokeDasharray="3 4" opacity=".45" />}
      </svg>
      <div className="relative font-mono text-xs text-muted-foreground" aria-hidden="true">{ticks.map(v=><span key={v} className="absolute left-2 -translate-y-1/2" style={{top:`${y(v)}%`}}>{v.toLocaleString("en-US",{maximumFractionDigits:0})}</span>)}</div>
      <div className="flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground"><span className="whitespace-nowrap">{start.slice(0,7)}</span><span className="hidden sm:inline">{middle}</span><span className="whitespace-nowrap">{end.slice(0,7)}</span></div>
    </div>
  </figure>;
}
