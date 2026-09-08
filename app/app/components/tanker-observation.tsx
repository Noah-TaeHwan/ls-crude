import { useEffect, useState } from "react";
import { Link, useRevalidator } from "react-router";
import { ArrowRight, ArrowUpRight, Ship, RefreshCw } from "lucide-react";
import { tankerStatus, type TankerView } from "~/lib/tanker-arrivals";

/** 표시할 공식 원천·이용 조건과 기존 연구 기록. */
const SOURCE = "https://data.gov.sg/datasets/d_c9dcfd8b85990669d1e74dd7ad71eb8b/view";
/** 숫자는 관측 건수이며 금융 효과·고유 선박 수가 아니다. */
const count = new Intl.NumberFormat("ko-KR");

/**
 * 검증된 월별 입항값을 보간 없이 표시한다.
 * @param props 관측 응답, 서버 기준시각, 상세 화면 여부.
 * @returns 월별 관측 카드 또는 상세 내용.
 */
export function TankerObservation({ view, checkedAt, detail = false }: { view: TankerView; checkedAt: string; detail?: boolean }) {
  const Heading = detail ? "h1" : "h3";
  const revalidator = useRevalidator();
  const [clock, setClock] = useState(Date.parse(checkedAt));
  useEffect(() => {
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [checkedAt]);
  const snapshot = view.data;
  const last = snapshot?.months.at(-1);
  const freshness = tankerStatus(view, clock);
  const status = { unavailable: "자료 없음", failed: "갱신 실패 · 이전 자료", stale: "기준 월·조회 확인", recent: "월간 관측" }[freshness];
  const ceiling = Math.max(500, Math.ceil(Math.max(0, ...(snapshot?.months.map(row => row.oil) ?? [])) / 500) * 500);
  return <section id="tanker-observation" className={detail ? "py-10 sm:py-12" : "min-w-0 py-6 flex flex-col"} aria-labelledby="tanker-title">
    <div className="section-heading"><div><p className="section-kicker">해운 · 월간 입항</p><Heading id="tanker-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">탱커는 얼마나 드나들까?</Heading></div><span className="status-stamp"><Ship size={14} aria-hidden="true" /> {status}</span></div>
    <div className="flex-1 rounded-2xl border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm text-muted-foreground">싱가포르 · 석유 탱커 입항</p><p className="mt-2 text-4xl font-semibold tracking-tight">{last ? count.format(last.oil) : "—"}<span className="ml-2 text-base font-normal">건</span></p><p className="mt-2 text-xs leading-6 text-muted-foreground">{last ? `${last.month} 기준 · 최신 월 잠정치` : "기준 월 미확인"}<br />75 GT 초과 선박 · 고유 선박 수나 적재량이 아닙니다.</p></div><button className="secondary-link min-h-11" type="button" disabled={revalidator.state !== "idle"} onClick={() => void revalidator.revalidate()}><RefreshCw size={15} aria-hidden="true" /> {revalidator.state === "idle" ? "갱신 확인" : "확인 중…"}</button></div>
      <p className="mt-5 text-sm leading-7">석유 탱커의 월별 입항 건수입니다. 해운 활동의 한 단면을 보여주며, 이 숫자만으로 운송한 원유량이나 WTI 방향을 판단하지 않습니다.</p>
      {view.error && <p role="status" className="mt-4 rounded-lg border border-border p-3 text-sm leading-6">{view.error}</p>}
      {freshness === "stale" && <p className="mt-3 text-sm font-medium">오래된 기준 월 또는 조회입니다. 아래 날짜를 확인하세요.</p>}
      {snapshot && last ? <>
        <figure className="mt-6"><svg width="100%" height="218" role="img" aria-label={`싱가포르 석유 탱커 월별 입항 ${snapshot.months.length}개월, 마지막 ${last.month} ${count.format(last.oil)}건`}>
          <title>수집 당시 최근 12개월 석유 탱커 입항</title>
          {[0, ceiling / 2, ceiling].map(tick => <g key={tick}><line x1="10%" x2="96%" y1={174 - 140 * tick / ceiling} y2={174 - 140 * tick / ceiling} stroke="currentColor" opacity=".15" /><text x="0" y={178 - 140 * tick / ceiling} fontSize="11" fill="currentColor">{count.format(tick)}</text></g>)}
          {snapshot.months.map((row, index) => <rect key={row.month} x={`${11 + index * 7}%`} y={174 - 140 * row.oil / ceiling} width="4.5%" height={140 * row.oil / ceiling} rx="1" fill="var(--primary)"><title>{`${row.month} · ${count.format(row.oil)}건${index === snapshot.months.length - 1 ? " · 잠정치" : ""}`}</title></rect>)}
          <text x="10%" y="204" fontSize="12" fill="currentColor">{snapshot.months[0].month}</text><text x="53%" y="204" textAnchor="middle" fontSize="12" fill="currentColor">{snapshot.months[5].month}</text><text x="96%" y="204" textAnchor="end" fontSize="12" fill="currentColor">{last.month}</text>
        </svg><figcaption className="text-xs leading-6 text-muted-foreground">원단위 월별 입항 · 보간·정규화 없음<br />각 월의 석유·화학·LNG/LPG 합계를 공식 탱커 총계와 대조했습니다.</figcaption></figure>
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs leading-6 sm:grid-cols-2"><div><dt className="text-muted-foreground">자료 기준 월</dt><dd>{snapshot.latestMonth} · 잠정치</dd></div><div><dt className="text-muted-foreground">데이터 조회</dt><dd>{snapshot.fetchedAt.slice(0, 16).replace("T", " ")} UTC</dd></div></dl>
      </> : <p className="my-8 text-sm text-muted-foreground">두 원천의 자료와 합계를 확인한 뒤 그래프를 표시합니다. 결측이나 실패를 0건으로 바꾸지 않습니다.</p>}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">월간 자료이며 실시간 입항 현황은 아닙니다. 열린 화면은 5분마다 확인하고 새 원천 조회에는 6시간 캐시를 사용합니다. 기준 월이 현재보다 3개월 넘게 뒤처지거나 조회가 48시간을 넘으면 확인 안내를 표시합니다. 이는 화면 정책이며 제공자의 발표 일정이 아닙니다.</p>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">출처 <a href={SOURCE} className="underline underline-offset-4" target="_blank" rel="noreferrer">MPA / data.gov.sg<span className="sr-only"> 새 탭</span></a> · <a href="https://data.gov.sg/open-data-licence" className="underline underline-offset-4" target="_blank" rel="noreferrer">Singapore Open Data Licence 1.0<span className="sr-only"> 새 탭</span></a></p>
      {!detail && <Link className="source-link mt-5 inline-flex min-h-11 items-center gap-2" to="/observations/tankers">어떤 탱커를 세는 걸까? <ArrowRight size={15} aria-hidden="true" /></Link>}
    </div>
    {detail && <>
      <div className="method-grid mt-8"><article className="method-step"><span>01 / 무엇</span><h3>종류를 나눠 세는 입항</h3><p>MPA의 Oil Tankers 입항 건수입니다. 화학 및 LNG/LPG 탱커는 별도로 표시합니다. 같은 선박의 재입항을 고유 선박 한 척으로 합치지 않습니다.</p></article><article className="method-step"><span>02 / 왜</span><h3>해운 활동의 한 단면</h3><p>입항 변화가 해운 수요나 병목과 어떻게 연결되는지 조사할 수 있습니다. 선박 크기·적재율·대기시간은 이 건수에 포함되지 않습니다.</p></article><article className="method-step"><span>03 / 한계</span><h3>공표일과 관측월은 다릅니다</h3><p>자료 조회시각은 각 월의 최초 공표일이 아닙니다. 최신 월은 잠정치이고 과거 값도 개정될 수 있습니다. 원유 전용 운송량·WTI 관계와 예측력은 미검증입니다.</p></article></div>
      {snapshot && <details className="mt-8 border-y border-border py-3"><summary className="min-h-11 cursor-pointer py-3 font-medium">12개월 유형별 관측값 펼치기</summary><div className="overflow-x-auto pb-4"><table className="w-full text-right text-xs leading-7"><caption className="py-2 text-left text-muted-foreground">단위: 입항 건수(&gt;75 GT). 석유 + 화학 + LNG/LPG = 공식 총계. 최신 월 잠정치.</caption><thead><tr>{["기준 월", "석유", "화학", "LNG/LPG", "총계"].map(name => <th scope="col" key={name} className="whitespace-nowrap px-2">{name}</th>)}</tr></thead><tbody>{snapshot.months.map(row => <tr key={row.month} className="border-t border-border"><th scope="row" className="whitespace-nowrap px-2 font-normal">{row.month}</th>{[row.oil, row.chemical, row.gas, row.total].map((value, index) => <td key={index} className="px-2">{count.format(value)}</td>)}</tr>)}</tbody></table></div></details>}
      <div className="mt-8 flex flex-wrap gap-6 text-sm"><a className="source-link" href="https://data.gov.sg/datasets/d_9adb5ace517591edd9a8c88291ac1f1c/view" target="_blank" rel="noreferrer">공식 탱커 총계 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">새 탭</span></a><a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/candidates/ALT-20260907-26.md" target="_blank" rel="noreferrer">수집 차단을 해소한 연구 기록 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">새 탭</span></a><Link className="source-link" to="/research#intake">전체 탐색 과정 <ArrowRight size={14} aria-hidden="true" /></Link></div>
      <p className="mt-5 text-xs leading-6 text-muted-foreground">MPA/data.gov.sg 자료를 이용한 LS CRUDE의 관측 화면입니다. 기관의 공식 지수나 보증을 뜻하지 않습니다.</p>
    </>}
  </section>;
}
