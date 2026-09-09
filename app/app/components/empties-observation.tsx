import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, Container } from "lucide-react";
import { ResearchChart } from "~/components/research-chart";
import type { EmptiesView } from "~/lib/empties.server";

/** 표시할 공식 원천과 이용 조건. */
const SOURCE = "https://portoflosangeles.org/business/statistics/container-statistics";
/** 숫자는 TEU이며 중량·금액이 아니다. 소수 둘째 자리까지 원단위로 표시한다. */
const count = new Intl.NumberFormat("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * 검증된 월별 빈수출 비중을 결측 연결 없이 표시한다.
 * @param props 관측 화면 값, 상세 화면 여부.
 * @returns 월별 관측 카드 또는 상세 내용.
 */
export function EmptiesObservation({ view, detail = false }: { view: { data: EmptiesView | null; error: string | null }; detail?: boolean }) {
  const Heading = detail ? "h1" : "h3";
  const [month, setMonth] = useState<string | null>(null);
  const snapshot = view.data;
  const rows = snapshot?.points ?? [];
  // 격리월(2020-11)은 null 자리로 넣어 선이 이어지지 않게 한다.
  const chartDates: string[] = [], chartValues: (number | null)[] = [];
  for (const row of rows) {
    const previous = chartDates.at(-1);
    if (previous) {
      const [py, pm] = previous.split("-").map(Number);
      const [y, m] = row.month.split("-").map(Number);
      let cy = py, cm = pm;
      for (;;) {
        cm++;
        if (cm > 12) { cm = 1; cy++; }
        if (cy > y || (cy === y && cm >= m)) break;
        chartDates.push(`${cy}-${String(cm).padStart(2, "0")}`);
        chartValues.push(null);
      }
    }
    chartDates.push(row.month);
    chartValues.push(Number(row.emptySharePct));
  }
  const found = rows.findIndex((r) => r.month === month);
  const selected = found < 0 ? rows.length - 1 : found;
  const point = rows[selected];
  const status = snapshot ? "월간 관측" : "자료 없음";
  return <section id="empties-observation" className={detail ? "py-10 sm:py-12" : "min-w-0 py-6 flex flex-col"} aria-labelledby="empties-title">
    <div className="section-heading"><div><p className="section-kicker">물류 · 월간 컨테이너</p><Heading id="empties-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">빈 컨테이너는 얼마나 돌아갈까?</Heading></div><span className="status-stamp"><Container size={14} aria-hidden="true" /> {status}</span></div>
    <div className="flex-1 rounded-2xl border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm text-muted-foreground">LA항 · 수출 TEU 중 빈 컨테이너 비중</p><p className="mt-2 text-4xl font-semibold tracking-tight">{point ? `${Number(point.emptySharePct).toFixed(1)}` : "—"}<span className="ml-2 text-base font-normal">%</span></p><p className="mt-2 text-xs leading-6 text-muted-foreground">{point ? `${point.month} 기준월 · 빈 ${count.format(Number(point.emptyExports))} / 수출 합계 ${count.format(Number(point.totalExports))} TEU` : "기준 월 미확인"}<br />분모는 매달 바뀌는 당월 수출 합계입니다.</p></div></div>
      <p className="mt-5 text-sm leading-7">빈 컨테이너 회송 비중의 월별 관측입니다. 재고·물류 재배치 압력 가설의 한 단면이며, 이 숫자만으로 원유 수요나 WTI 방향을 판단하지 않습니다.</p>
      {view.error && <p role="status" className="mt-4 rounded-lg border border-border p-3 text-sm leading-6">{view.error}</p>}
      {snapshot && point ? <>
        <div className="mt-6"><ResearchChart id="empties-plot" title="빈수출 비중" dates={chartDates} series={[{ label: "Empty / (Empty + Loaded) Exports", color: "#1d4ed8", values: chartValues, dots: true }]} maximum={100} unit="%" selected={chartDates.indexOf(point.month)} onSelect={(i) => { const m = chartDates[i]; if (rows.some((r) => r.month === m)) setMonth(m); }} start="2015-01" end="2026-07" description={`LA항 월별 빈수출 비중 ${rows.length}개월, 마지막 ${rows.at(-1)!.month}. 2020년 11월은 원본 오타로 제외되어 연결하지 않음`} /></div>
        <div aria-live="polite" className="mt-5 rounded-sm border border-border p-4 text-sm leading-7"><strong className="font-mono">{point.month}</strong><p>빈수출 <strong>{count.format(Number(point.emptyExports))} TEU</strong> · 적재수출 {count.format(Number(point.loadedExports))} TEU · 비중 <strong>{Number(point.emptySharePct).toFixed(2)}%</strong></p><p className="text-muted-foreground">해당 월 Total TEU는 별도 대조했으며, 분할 셀 자체의 오류는 이 대사로 잡히지 않습니다.</p></div>
        <label htmlFor="empties-month" className="mt-4 block text-sm">관측 월 탐색</label><input id="empties-month" type="range" min={0} max={rows.length - 1} value={selected} onChange={(e) => setMonth(rows[Number(e.target.value)].month)} aria-valuetext={`${point.month}, 빈수출 비중 ${Number(point.emptySharePct).toFixed(1)}퍼센트`} className="min-h-11 w-full accent-primary" />
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs leading-6 sm:grid-cols-3"><div><dt className="text-muted-foreground">관측 기간</dt><dd className="font-mono">2015-01 ~ 2026-07 · {rows.length}개월</dd></div><div><dt className="text-muted-foreground">자료 수집</dt><dd className="font-mono">{snapshot.collected}</dd></div><div><dt className="text-muted-foreground">제외·미관측</dt><dd>2020-11 원본 오타 격리 · 2026-08 이후 미관측</dd></div></dl>
      </> : <p className="my-8 text-sm text-muted-foreground">표시 자료를 검증하지 못했습니다. 결측이나 실패를 0으로 바꾸지 않습니다.</p>}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">월간 자료이며 실시간 항만 현황은 아닙니다. 전월 통계는 익월 후반·15일경에 공표됩니다(제공자 안내). 월별 최초 공표일·개정 이력은 미복원이라 WTI 관계 검정은 미실행입니다.</p>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">출처 <a href={SOURCE} className="underline underline-offset-4" target="_blank" rel="noreferrer">Port of Los Angeles<span className="sr-only"> 새 탭</span></a> · 무료 제공, 출처 표기. LS CRUDE의 관측 화면이며 기관의 공식 지수나 보증을 뜻하지 않습니다.</p>
      {!detail && <Link className="source-link mt-5 inline-flex min-h-11 items-center gap-2" to="/observations/empties">빈수출 비중을 어떻게 쟀을까? <ArrowRight size={15} aria-hidden="true" /></Link>}
    </div>
    {detail && snapshot && <>
      <div className="method-grid mt-8"><article className="method-step"><span>01 / 무엇</span><h3>수출 컨테이너 중 빈 상자의 share</h3><p>월별 Empty Exports를 당월 수출 합계(Empty + Loaded)로 나눈 비중입니다. TEU는 크기 환산 단위이며 중량·금액·연료량이 아닙니다.</p></article><article className="method-step"><span>02 / 왜</span><h3>재고·재배치 압력 가설의 한 단면</h3><p>빈 상자 회송이 재고·물류 재배치 압력을 비출 수 있다는 수송·수요 가설을 조사할 수 있습니다. 단일 항만이며 무역불균형과 원유 수요를 혼동하지 않습니다.</p></article><article className="method-step"><span>03 / 한계</span><h3>대사와 격리를 공개합니다</h3><p>월별 3식 대사 중 {snapshot.monthlyMismatches}개월은 제공 Total 셀 불일치(원인 미확인), 연간행은 {snapshot.annualCompared}개년 중 {snapshot.annualMatched}개년 일치입니다. Total 셀 먼지는 비중 계산에 쓰이지 않으나 분할 셀 자체의 오류는 잡히지 않습니다.</p></article></div>
      <details className="mt-8 border-y border-border py-3"><summary className="min-h-11 cursor-pointer py-3 font-medium">최근 12개월 원단위 표 펼치기</summary><div className="overflow-x-auto pb-4"><table className="w-full text-right text-xs leading-7"><caption className="py-2 text-left text-muted-foreground">단위: TEU(소수 보존) · 비중 %. 분모는 당월 수출 합계. 2020-11 제외.</caption><thead><tr>{["기준 월", "적재수출", "빈수출", "수출 합계", "빈 비중"].map((name) => <th scope="col" key={name} className="whitespace-nowrap px-2">{name}</th>)}</tr></thead><tbody>{rows.slice(-12).map((row) => <tr key={row.month} className="border-t border-border"><th scope="row" className="whitespace-nowrap px-2 font-normal">{row.month}</th><td className="px-2">{count.format(Number(row.loadedExports))}</td><td className="px-2">{count.format(Number(row.emptyExports))}</td><td className="px-2">{count.format(Number(row.totalExports))}</td><td className="px-2">{Number(row.emptySharePct).toFixed(2)}</td></tr>)}</tbody></table></div></details>
      <div className="mt-8 flex flex-wrap gap-6 text-sm"><a className="source-link" href={SOURCE} target="_blank" rel="noreferrer">공식 컨테이너 통계 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> 새 탭</span></a><a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/candidates/ALT-20260907-02.md" target="_blank" rel="noreferrer">후보 카드 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> 새 탭</span></a><a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/indexes/ALT-20260907-02/20260909T003314Z/README.md" target="_blank" rel="noreferrer">수집·대사 기록 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> 새 탭</span></a></div>
    </>}
  </section>;
}
