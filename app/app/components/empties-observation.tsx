import { useState } from "react";
import display from "../../../research/indexes/ALT-20260907-02/20260909T003314Z/display.json";
import quality from "../../../research/indexes/ALT-20260907-02/20260909T003314Z/quality.json";
import { ResearchChart } from "~/components/research-chart";
import { readEmpties, exportDenominator } from "~/lib/empties";

/** 원단위를 검증한 고정 과거 표본. */
const ROWS = readEmpties(display);
/** @param value 원단위 숫자. @returns 소수 두 자리를 보존한 TEU 표시. */
const count = (value: number) => value.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** @returns 기존 사례 선택 틀 안에서 원단위·분모·제공자 차이를 보여주는 LA항 사례. */
export function EmptiesCase() {
  const [month, setMonth] = useState<string | null>(null);
  if (!ROWS) return <p role="status">빈 컨테이너 표시 자료 검증 실패. 연구 원문을 확인하세요.</p>;
  const rows=ROWS, found=rows.findIndex(r=>r.month===month), selected=found<0?rows.length-1:found, point=rows[selected];
  // 누락 월은 실제 달력 좌표에 null로 남긴다. 관측값이나 보간값은 만들지 않는다.
  const dates: string[]=[], values:(number|null)[]=[];
  for(let year=2015;year<=2026;year++) for(let m=1;m<=12;m++) {
    const key=`${year}-${String(m).padStart(2,"0")}`;
    if(key>rows.at(-1)!.month) break;
    const row=rows.find(r=>r.month===key);
    dates.push(key+"-01");values.push(row ? Number(row.emptySharePct) : null);
  }
  const denominator=exportDenominator(point), delta=Number(point.totalExports)-denominator;
  return <>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">LA항의 빈 컨테이너 회송을 살펴본 138개월 표본입니다. 빈수출 ÷ (빈수출 + 적재수출) 비중이며, TEU는 컨테이너 크기 환산 단위입니다. 중량·연료량·WTI 방향을 나타내지 않습니다.</p>
    <p className="my-4 text-xs leading-6 text-muted-foreground">점을 터치하거나 아래 월 탐색을 사용하세요. 2020-11은 원문 Total 셀 오타로 제외했고, 2026-08 이후 자료는 이 표본에 없습니다.</p>
    <ResearchChart id="empties-plot" title="수출 컨테이너 중 빈 상자 비중" dates={dates} series={[{label:"빈수출 ÷ (빈수출 + 적재수출)",color:"#edb958",values,dots:true}]} maximum={100} unit="%" selected={dates.indexOf(point.month+"-01")} onSelect={i=>{const key=dates[i].slice(0,7);if(rows.some(r=>r.month===key))setMonth(key);}} description="LA항 월별 빈수출 비중 138개 관측. 2015-01부터2026-07, 2020-11은 결측." />
    <div id="empties-readout" aria-live="polite" className="mt-5 rounded-sm border border-border p-4 text-sm leading-7"><strong className="font-mono">{point.month}</strong><p>빈수출 <strong>{count(Number(point.emptyExports))} TEU</strong> · 적재수출 {count(Number(point.loadedExports))} TEU</p><p>계산 분모 <strong>{count(denominator)} TEU</strong> · 빈 비중 <strong>{Number(point.emptySharePct).toFixed(2)}%</strong></p><p>제공기관 수출 합계 {count(Number(point.totalExports))} TEU</p>{Math.abs(delta)>.005&&<p className="text-primary">제공기관 합계가 계산 분모와 {count(delta)} TEU 다릅니다. 비중에는 분할값 합계를 사용했습니다. 원인 미확인.</p>}</div>
    <label htmlFor="empties-month" className="mt-4 block text-sm">LA항 관측 월 탐색</label><input id="empties-month" type="range" min={0} max={rows.length-1} value={selected} onChange={e=>setMonth(rows[Number(e.target.value)].month)} aria-valuetext={`${point.month}, 빈수출 비중 ${Number(point.emptySharePct).toFixed(2)}퍼센트`} className="min-h-11 w-full accent-primary" />
    <p className="mt-4 text-xs leading-6 text-muted-foreground">월별 합계 대사에서 {quality.reconciliation.mismatches.length}개월이 달랐습니다. 연간/YTD 행은 {quality.annual_total_check.compared}건 중 {quality.annual_total_check.matched}건이 일치했습니다. 분할 셀 자체의 오기는 이 대사만으로 잡히지 않습니다. 최초 공표일·개정 이력은 미복원입니다.</p>
    <details className="mt-5 border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">전체 138개월 원단위·분모 비교표</summary><div role="region" aria-label="LA항 월별 원단위 표, 작은 화면에서 가로 스크롤" tabIndex={0} className="overflow-x-auto"><table className="w-full min-w-[620px] text-right text-sm"><caption className="py-3 text-left">TEU · 비중 % · 계산 분모와 제공기관 합계 구분</caption><thead><tr>{["월","적재수출","빈수출","계산 분모","제공 합계","빈 비중"].map(h=><th key={h} scope="col" className="px-2 py-3">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.month} className="border-t border-border"><th scope="row" className="whitespace-nowrap px-2 py-2 font-normal">{r.month}</th>{[Number(r.loadedExports),Number(r.emptyExports),exportDenominator(r),Number(r.totalExports)].map((v,i)=><td key={i} className="px-2 font-mono">{count(v)}</td>)}<td className="px-2 font-mono">{Number(r.emptySharePct).toFixed(2)}</td></tr>)}</tbody></table></div></details>
  </>;
}
