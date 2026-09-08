import type { PointerEvent } from "react";
import { nearestDateIndex } from "~/lib/research-charts";

/** 실제로 표시하는 한 연료 또는 비율 계열. */
interface Series { label: string; color: string; values: number[]; dots?: boolean }
/** 날짜 그래프의 표시와 탐색 계약. */
interface ChartProps { id: string; title: string; dates: string[]; series: Series[]; maximum: number; unit: string; selected: number; onSelect: (index:number)=>void; start?:string; end?:string }

/**
 * CSS 픽셀 크기의 점과 HTML 축으로 작은 화면에서도 읽을 수 있는 관측 그래프를 그린다.
 * @param props 날짜·값·선택 상태. 날짜는 실제 달력 간격을 유지한다.
 * @returns 하나의 반응형 관측 그래프.
 */
export function ResearchChart({ id,title,dates,series,maximum,unit,selected,onSelect,start=dates[0],end=dates.at(-1)! }: ChartProps) {
  const span = Math.max(1,Date.parse(end)-Date.parse(start));
  const x = (i:number) => 2 + 96*(Date.parse(dates[i])-Date.parse(start))/span;
  const y = (v:number) => 92 - 84*v/maximum;
  const middle = new Date((Date.parse(start)+Date.parse(end))/2).toISOString().slice(0,7);
  /** @param event 포인터 위치. @returns 가장 가까운 관측을 선택한다. */
  function pick(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    onSelect(nearestDateIndex(dates,((event.clientX-rect.left)/rect.width-.02)/.96,start,end));
  }
  return <figure className="min-w-0" aria-labelledby={`${id}-title`}>
    <figcaption id={`${id}-title`} className="mb-3 text-sm font-medium">{title} <span className="font-normal text-muted-foreground">({unit})</span></figcaption>
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">{series.map(s=><span key={s.label} className="inline-flex items-center gap-2"><span aria-hidden="true" className="inline-block size-2 rounded-full" style={{background:s.color}} />{s.label}</span>)}</div>
    <div className="grid grid-cols-[minmax(0,1fr)_3.5rem]">
      <svg id={id} className="block h-52 w-full overflow-hidden sm:h-64" role="img" aria-label={`${title}, ${dates.length}개 실제 날짜, ${start}부터 ${end}`} onPointerDown={pick} onPointerMove={e=>{if(e.pointerType==="mouse") pick(e);}}>
        {[0,maximum/2,maximum].map(v=><line key={v} x1="2%" x2="98%" y1={`${y(v)}%`} y2={`${y(v)}%`} stroke="currentColor" opacity=".15" />)}
        {series.map(s=><g key={s.label} fill={s.color} stroke={s.color}>{s.values.map((v,i)=>s.dots ? <circle key={dates[i]} cx={`${x(i)}%`} cy={`${y(v)}%`} r="3" data-date={dates[i]} /> : i>0 && <line key={dates[i]} x1={`${x(i-1)}%`} x2={`${x(i)}%`} y1={`${y(s.values[i-1])}%`} y2={`${y(v)}%`} strokeWidth="1.2" />)}<circle cx={`${x(selected)}%`} cy={`${y(s.values[selected])}%`} r="4" stroke="var(--background)" strokeWidth="1" /></g>)}
        <line x1={`${x(selected)}%`} x2={`${x(selected)}%`} y1="8%" y2="92%" stroke="currentColor" strokeDasharray="3 4" opacity=".45" />
      </svg>
      <div className="relative font-mono text-xs text-muted-foreground" aria-hidden="true">{[0,maximum/2,maximum].map(v=><span key={v} className="absolute left-2 -translate-y-1/2" style={{top:`${y(v)}%`}}>{v.toLocaleString("en-US",{maximumFractionDigits:0})}</span>)}</div>
      <div className="flex justify-between gap-1 font-mono text-xs text-muted-foreground"><span>{start.slice(0,7)}</span><span>{middle}</span><span>{end.slice(0,7)}</span></div>
    </div>
  </figure>;
}
