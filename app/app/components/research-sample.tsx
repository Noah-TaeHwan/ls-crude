import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import melonInput from "../../../research/indexes/web-observations/v2/watermelon.json";
import degreeInput from "../../../research/indexes/web-observations/v2/degree-days.json";
import degreeQuality from "../../../research/indexes/ALT-20260907-45/20260908T120546Z/v2/quality.json";
import jejuInput from "../../../research/indexes/web-observations/v2/jeju.json";
import mq from "../../../research/indexes/ALT-20260907-36/20260908T065043Z/quality.json";
import jq from "../../../research/indexes/ALT-20260908-20/20260908T073402Z/quality.json";
import coverage from "../../../research/indexes/ALT-20260907-36/20260908T065043Z/yearly-coverage.csv?raw";
import monthly from "../../../research/indexes/ALT-20260908-20/20260908T073402Z/monthly.csv?raw";
import { readWatermelon, readJeju, readDegreeDays } from "~/lib/research-charts";
import type { IntakeRecord } from "~/lib/research-intake";
import { ResearchChart } from "~/components/research-chart";

/** 현재 원장의 판정 표시명. */
const DECISIONS: Record<string,string> = { PARK:"조건 대기", KEEP:"후속 연구 유지", KILL:"현 방식 종료" };
/** 검증 실패는 결측 상태로 유지하는 고정 빈티지. */
const MELON = readWatermelon(melonInput), JEJU = readJeju(jejuInput), DEGREES = readDegreeDays(degreeInput);
/** 검토된 원단위 표. */
const YEARS = coverage.trim().split(/\r?\n/).slice(1).map(r=>r.split(","));
/** 월별 비중은 월합계 기반이며 일별 비중 평균과 다르다. */
const MONTHS = monthly.trim().split(/\r?\n/).slice(1).map(r=>r.split(","));
/** 사례별 고정 출처와 관측 범위. */
const CASES = {
  watermelon: {label:"수박 · 냉장트럭",title:"수박이 냉장트럭을 바쁘게 만들까?",path:"ALT-20260907-36/20260908T065043Z",start:mq.pure_start,end:mq.pure_end,collected:mq.source.retrieved_at.slice(0,16).replace("T"," ")+" UTC",png:"/research/watermelon-20260908.png",source:"https://www.ams.usda.gov/services/transportation-analysis/agricultural-refrigerated-truck-quarterly-datasets"},
  jeju: {label:"제주 · LNG와 유류",title:"제주의 LNG·유류 발전량은 어떻게 달랐을까?",path:"ALT-20260908-20/20260908T073402Z",start:jq.start,end:jq.end,collected:"2026-09-08 07:34 UTC",png:"/research/jeju-20260908.png",source:"https://www.data.go.kr/data/15069334/fileData.do"},
  "degree-days": {label:"미국 · 냉난방도일",title:"냉난방에 필요한 날씨 조건은 얼마나 달랐을까?",path:"ALT-20260907-45/20260908T120546Z/v2",start:"2015-01",end:"2023-12",collected:"2026-09-08 12:09 UTC",png:"/research/degree-days-v2.svg",source:"https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/"},
} as const;

/** @param props 사례별 현재 정본. @returns URL로 선택하는 과거 연구 사례. */
export function ResearchSample({ records }: {records:{watermelon?:IntakeRecord;jeju?:IntakeRecord;"degree-days"?:IntakeRecord}}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requested = params.get("sample");
  const kind = requested === "jeju" || requested === "degree-days" ? requested : "watermelon";
  const info = CASES[kind], record = records[kind];
  const evidence = "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/indexes/"+info.path+"/README.md";
  return <section id="research-sample" className="border-t border-border py-10 sm:py-12" aria-labelledby="sample-title">
    <div className="section-heading"><div><p className="section-kicker">RESEARCH IN PRACTICE / 확보한 과거 자료</p><h2 id="sample-title">아이디어를 실제 자료로 열어보면.</h2></div><a className="source-link" href={evidence}>수집·대사 기록 →</a></div>
    <div role="group" aria-label="연구 사례 선택" className="mt-5 flex flex-wrap gap-3">{(Object.keys(CASES) as (keyof typeof CASES)[]).map(key=><button key={key} type="button" className="filter-button" aria-pressed={kind===key} aria-controls="sample-case" onClick={()=>{const next=new URLSearchParams(params);next.set("sample",key);navigate("?"+next.toString()+"#research-sample",{preventScrollReset:true});}}>{CASES[key].label}</button>)}</div>
    <article id="sample-case" className="mt-5 min-w-0 rounded-sm border border-border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-3 text-xs"><span className="status-stamp">과거 연구 샘플 · 자동 갱신 아님</span><span className="card-verdict">{record ? DECISIONS[record.fields.decision]+" · "+record.fields.decision : "현재 판정 확인 필요"}</span><span className="text-muted-foreground">이 샘플의 WTI 관계 검정 미실행</span></div>
      <h3 className="mt-5 text-xl font-medium sm:text-2xl">{info.title}</h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">관측 기간</dt><dd className="mt-1 font-mono">{info.start} ~ {info.end}</dd></div><div><dt className="text-muted-foreground">자료를 수집한 시각</dt><dd className="mt-1 font-mono">{info.collected}</dd></div></dl>
      {!record ? <div role="status" className="empty-state mt-5"> 해당 후보 정본을 확인하지 못했습니다. 다른 사례 또는 연구 원문을 확인하세요.</div> : <>
        {kind === "watermelon" ? <WatermelonCase /> : kind === "jeju" ? <JejuCase /> : <DegreeDaysCase />}
        <div className="evidence-note mt-6"><h4 className="text-sm font-medium">다음 확인 · {record.fields.owner}</h4><p className="mt-2 text-sm leading-7">{record.fields.next_action}</p><p className="mt-2 text-xs text-muted-foreground">재검토 예정 {record.fields.next_review_date} · 사람 배정 제안</p></div>
      </>}
      <footer className="mt-5 flex flex-wrap gap-5 border-t border-border pt-4 text-sm"><a className="source-link" href={info.png} download>연구 그림 다운로드</a>{record && <a className="source-link" href={record.sourceHref}>가설·판정 원문</a>}<a className="source-link" href={evidence}>재현 코드·영수증</a><a className="source-link" href={info.source}>제공기관 자료 정의</a></footer>
    </article>
  </section>;
}

/** @returns 실제 날짜와 분모를 탐색하는 수박 관측. */
function WatermelonCase() {
  const [full,setFull] = useState(false), [date,setDate] = useState<string|null>(null);
  if (!MELON) return <p role="status">수박 표시 자료 검증 실패. 원문을 확인하세요.</p>;
  const rows = full ? MELON : MELON.filter(r=>r.date >= "2022-01-01");
  const found=rows.findIndex(r=>r.date===date), selected=found<0 ? rows.length-1 : found, point=rows[selected];
  return <>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">성찬님의 085 수박·냉장트럭 가설에서 출발해 {mq.pure_rows}행 · {mq.observed_dates}개 날짜를 확보했습니다. {mq.observed_dates-mq.dates_n_ge2}개 날짜는 출하지가 하나뿐입니다. 비중은 전국 트럭 부족률이 아닙니다.</p>
    <div role="group" aria-label="수박 표시 기간" className="my-5 flex flex-wrap gap-2">{[false,true].map(value=><button key={String(value)} type="button" className="filter-button" aria-pressed={full===value} onClick={()=>{setFull(value);setDate(null);}}>{value?"전체 확보 기간":"2022년 이후"}</button>)}</div>
    <p className="mb-4 text-xs leading-6 text-muted-foreground">점을 터치하거나 아래 날짜 탐색을 사용하세요. {rows.length}개 실제 관측이며 공백은 연결하지 않습니다. 원천 전체 끝은 {mq.all_end}, 수박 마지막 보고는 {mq.pure_end}입니다.</p>
    <ResearchChart id="watermelon-research-plot" title="보고값 4 이상 비중" dates={rows.map(r=>r.date)} series={[{label:"보고 출하지 안에서의 비중",color:"#edb958",values:rows.map(r=>100*r.numerator/r.denominator),dots:true}]} maximum={100} unit="%" selected={selected} onSelect={i=>setDate(rows[i].date)} start={full?mq.all_start:"2022-01-01"} end={mq.all_end} />
    <div id="watermelon-readout" aria-live="polite" className="mt-5 rounded-sm border border-border p-4 text-sm leading-7"><strong className="font-mono">{point.date}</strong><p>보고값 4 이상 <strong>{point.numerator} / {point.denominator}개 출하지</strong> · 비중 <strong>{(100*point.numerator/point.denominator).toFixed(1)}%</strong></p><p className="text-muted-foreground">소수값 보고 {point.fractional}개 · 소수를 반올림하지 않았습니다.</p></div>
    <label htmlFor="watermelon-date" className="mt-4 block text-sm">수박 관측 날짜 탐색</label><input id="watermelon-date" type="range" min={0} max={rows.length-1} value={selected} onChange={e=>setDate(rows[Number(e.target.value)].date)} aria-valuetext={point.date+", "+point.numerator+"/"+point.denominator+"개 출하지, "+(100*point.numerator/point.denominator).toFixed(1)+"퍼센트"} className="min-h-11 w-full accent-primary" />
    <div className="mt-6"><h4 className="mb-2 text-sm font-medium">연도별 보고 날짜 수</h4><div className="grid grid-cols-[minmax(0,1fr)_3.5rem]"><svg id="watermelon-coverage" className="h-36 w-full" role="img" aria-label="2000~2026년 보고 날짜 수. 2019년과2026년은 보고행 없음. 아래 표에서 정확한 수치 확인 가능">{YEARS.map(([year,,count],i)=><rect key={year} x={100*(i+.15)/YEARS.length+"%"} width={70/YEARS.length+"%"} y={92-84*Number(count)/30+"%"} height={84*Number(count)/30+"%"} fill="#94c8ac" />)}</svg><div className="relative font-mono text-xs text-muted-foreground" aria-hidden="true">{[0,15,30].map(v=><span key={v} className="absolute left-2 -translate-y-1/2" style={{top:92-84*v/30+"%"}}>{v}</span>)}</div><div className="flex justify-between font-mono text-xs text-muted-foreground"><span>2000</span><span>2013</span><span>2026</span></div></div></div>
    <p className="mt-4 text-xs leading-6 text-muted-foreground">U.S. Department of Agriculture / AMS. 보고행 없음은 활동 0이 아닙니다. 소수값 {mq.pure_fractional_rows}개의 생성 방식과 최초 공개일은 미확인입니다. 원안의 52주 지수는 아직 만들지 않았습니다.</p>
    <aside className="evidence-note mt-4 text-sm leading-7" aria-label="수박 원보고서 대사 상태">
      <p><strong>원보고서 대사 · 접근 차단</strong> — 2026-09-09 09:29 KST 공식 정책 페이지가 접근을 거부해 후속 수집을 중단했습니다. 위 그림은 앞서 확보한 과거 표본이며 새 관측이 추가된 것은 아닙니다.</p>
      <p>정상 접근이 회복되거나 허용된 원보고서 경로가 확인되면 소수값의 뜻과 보고 날짜를 대조합니다.</p>
      <a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/indexes/ALT-20260907-36/20260909T002929Z/README.md">접근 결과와 재개 조건 →</a>
    </aside>
    <DataTable title="연도별 원단위 표와 데이터 범위" headers={["연도","보고행","관측 날짜","출하지 표기","소수값"]} rows={YEARS} />
  </>;
}

/** @returns 동일 날짜의 두 연료 MWh와 조건부 비중을 보여주는 제주 사례. */
function JejuCase() {
  const [date,setDate] = useState<string|null>(null);
  if (!JEJU) return <p role="status">제주 표시 자료 검증 실패. 원문을 확인하세요.</p>;
  const found=JEJU.findIndex(r=>r.date===date), selected=found<0 ? JEJU.length-1 : found, point=JEJU[selected];
  const dates=JEJU.map(r=>r.date), gas=JEJU.map(r=>Number(r.lngMwh)), oil=JEJU.map(r=>Number(r.oilMwh));
  const maximum=Math.max(1000,Math.ceil(Math.max(...gas,...oil)/1000)*1000);
  const select=(i:number)=>setDate(JEJU[i].date);
  return <>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">성찬님의 080 연료전환 가설에서 제주 보조 표본 {jq.days}일을 확보했습니다. 유류에는 <strong className="text-foreground">바이오중유·중유·경유</strong>가 포함됩니다. 두 연료의 발전량이며 제주 전체 발전믹스나 원유 소비량이 아닙니다.</p>
    <p className="my-4 text-xs leading-6 text-muted-foreground">그래프를 터치하거나 아래 날짜 탐색을 사용하세요. 두 그래프가 같은 날짜를 표시합니다.</p>
    <ResearchChart id="jeju-generation-plot" title="일별 발전량" dates={dates} series={[{label:"LNG",color:"#78b7ed",values:gas},{label:"유류 범주 · 바이오중유 포함",color:"#edb958",values:oil}]} maximum={maximum} unit="MWh" selected={selected} onSelect={select}/>
    <div className="mt-7"><ResearchChart id="jeju-share-plot" title="두 연료 안에서의 유류 비중" dates={dates} series={[{label:"유류 ÷ (유류 + LNG)",color:"#edb958",values:JEJU.map(r=>Number(r.sharePct))}]} maximum={100} unit="%" selected={selected} onSelect={select}/></div>
    <div id="jeju-readout" aria-live="polite" className="mt-5 rounded-sm border border-border p-4 text-sm leading-7"><strong className="font-mono">{point.date}</strong><p>LNG <strong>{Number(point.lngMwh).toFixed(3)} MWh</strong> · 유류 <strong>{Number(point.oilMwh).toFixed(3)} MWh</strong></p><p>두 연료 합계 {(Number(point.lngMwh)+Number(point.oilMwh)).toFixed(3)} MWh · 조건부 유류 비중 <strong>{Number(point.sharePct).toFixed(2)}%</strong></p></div>
    <label htmlFor="jeju-date" className="mt-4 block text-sm">제주 관측 날짜 탐색</label><input id="jeju-date" type="range" min={0} max={JEJU.length-1} value={selected} onChange={e=>select(Number(e.target.value))} aria-valuetext={point.date+", LNG "+point.lngMwh+", 유류 "+point.oilMwh+" MWh, 조건부 비중 "+Number(point.sharePct).toFixed(2)+"퍼센트"} className="min-h-11 w-full accent-primary"/>
    <p className="mt-4 text-xs leading-6 text-muted-foreground">전력거래소 / 공공데이터포털. 비중은 올랐지만 유류 발전량은 감소한 비교가 {jq.share_up_while_oil_mwh_down_days}/335일 있었습니다. 최초 시간별 공개시점은 미확인입니다.</p>
    <DataTable title="월별 원단위 합계와 조건부 비중" headers={["월","일수","LNG MWh","유류 MWh","두 연료 내 유류 %"]} rows={MONTHS.map(([month,days,gas,oil,share])=>[month,days,Number(gas).toFixed(3),Number(oil).toFixed(3),Number(share).toFixed(2)])}/>
  </>;
}

/** @returns 월자료의 원단위·자체 전년차·공급자 전년차를 구별하는 기상 사례. */
function DegreeDaysCase() {
  const [selected,setSelected] = useState(107);
  if (!DEGREES) return <p role="status">도일 표시 자료 검증 실패. 원문을 확인하세요.</p>;
  const rows=DEGREES, point=rows[selected];
  // 월초 날짜는 SVG의 달력 좌표에만 사용한다. 일별 관측으로 복제하지 않는다.
  const dates=rows.map(r=>r.month+"-01");
  const hdd=rows.map(r=>r.hdd), cdd=rows.map(r=>r.cdd);
  const yoy=rows.slice(12), span=Math.max(50,Math.ceil(Math.max(...yoy.flatMap(r=>[Math.abs(r.hddYoy!),Math.abs(r.cddYoy!)]))/50)*50);
  const fmt=(v:number|null)=>v===null?"—":String(v);
  const mismatch=point.hddYoy!==null&&((point.providerHDDYoy!==null&&point.hddYoy!==point.providerHDDYoy)||(point.providerCDDYoy!==null&&point.cddYoy!==point.providerCDDYoy));
  return <>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">미국 본토(CONUS)의 인구가중 냉난방도일 108개월입니다. 기온에서 계산한 기상 집계이며 연료 소비량이 아닙니다. 기준 온도는 65°F, 단위는 °F·day입니다. 현재 빈티지의 최초 월별 공개시점은 미복원 상태입니다.</p>
    <p className="my-4 text-xs leading-6 text-muted-foreground">그래프를 터치하거나 월 탐색을 사용하세요. HDD는 난방, CDD는 냉방에 관련된 도일입니다. 0은 실제 집계값이며 결측이 아닙니다.</p>
    <ResearchChart id="degree-days-level-plot" title="월별 냉난방도일" dates={dates} series={[{label:"HDD · 난방",color:"#edb958",values:hdd},{label:"CDD · 냉방",color:"#78b7ed",values:cdd}]} maximum={Math.ceil(Math.max(...hdd,...cdd)/100)*100} unit="°F·day" selected={selected} onSelect={setSelected} description="CONUS 인구가중 월별 냉난방도일, 2015년1월부터2023년12월,108개월"/>
    <div className="mt-7"><ResearchChart id="degree-days-yoy-plot" title="월합계로 직접 계산한 전년동월차" dates={dates.slice(12)} series={[{label:"HDD 자체 전년차",color:"#edb958",values:yoy.map(r=>r.hddYoy)},{label:"CDD 자체 전년차",color:"#78b7ed",values:yoy.map(r=>r.cddYoy)}]} minimum={-span} maximum={span} unit="°F·day 차이" selected={selected-12} onSelect={i=>setSelected(i+12)} description="자체 전년동월차,2016년1월부터2023년12월,96개월. 공급자 전년차와 구별합니다."/></div>
    <div id="degree-days-readout" aria-live="polite" className="mt-5 rounded-sm border border-border p-4 text-sm leading-7"><strong className="font-mono">{point.month}</strong><p>HDD <strong>{point.hdd}</strong> · CDD <strong>{point.cdd}</strong> °F·day</p><p>자체 전년차: HDD <strong>{fmt(point.hddYoy)}</strong> · CDD <strong>{fmt(point.cddYoy)}</strong></p><p>공급자 전년차: HDD <strong>{fmt(point.providerHDDYoy)}</strong> · CDD <strong>{fmt(point.providerCDDYoy)}</strong></p>{point.hddYoy===null&&<p className="text-muted-foreground">이 표본에 전년월이 없어 자체 차분은 계산하지 않았습니다.</p>}{mismatch&&<p className="text-primary">이 달은 자체 계산과 공급자 전년차가 다릅니다. 원인 미확인.</p>}</div>
    <label htmlFor="degree-days-month" className="mt-4 block text-sm">도일 관측월 탐색</label><input id="degree-days-month" type="range" min={0} max={107} value={selected} onChange={e=>setSelected(Number(e.target.value))} aria-valuetext={point.month+", HDD "+point.hdd+", CDD "+point.cdd} className="min-h-11 w-full accent-primary"/>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">비교 가능한 192개 값 중 <strong className="text-foreground">{degreeQuality.mismatch_count}개</strong>가 공급자의 전년차와 다릅니다. 자체 뺄셈은 원본 월합계와 일치하지만, 비교 정의·가중·개정 중 무엇이 차이를 만드는지는 미확인입니다. 공급자 전년차를 재현했다고 주장하지 않습니다.</p>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">출처 NOAA CPC. 이 그림은 연구팀의 파생 시각화이며 공식 NOAA 예측이나 WTI 신호가 아닙니다. 첫 12개월의 자체 전년차는 —로 표시합니다.</p>
    <DataTable title="월별 원단위와 두 전년차 비교표" headers={["월","HDD","CDD","HDD 자체차","HDD 제공차","CDD 자체차","CDD 제공차"]} rows={rows.map(r=>[r.month,String(r.hdd),String(r.cdd),fmt(r.hddYoy),fmt(r.providerHDDYoy),fmt(r.cddYoy),fmt(r.providerCDDYoy)])}/>
  </>;
}

/** @param props 원단위 표의 제목·열·값. @returns 키보드로 펼치는 원단위 표. */
function DataTable({title,headers,rows}:{title:string;headers:string[];rows:string[][]}) {
  return <details className="mt-5 border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">{title}</summary><div role="region" aria-label={title+", 작은 화면에서는 가로로 스크롤"} tabIndex={0} className="overflow-x-auto"><table className="w-full min-w-[460px] text-right text-sm"><caption className="pb-3 text-left">{title} · 고정 연구 빈티지</caption><thead><tr>{headers.map(h=><th key={h} scope="col" className="border-b border-border py-3 pr-3">{h}</th>)}</tr></thead><tbody>{rows.map(([first,...cells])=><tr key={first}><th scope="row" className="border-b border-border py-2 pr-3 font-normal">{first}</th>{cells.map((v,i)=><td key={i} className="border-b border-border py-2 pr-3 font-mono">{v}</td>)}</tr>)}</tbody></table></div></details>;
}
