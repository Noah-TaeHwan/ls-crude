import { useState } from "react";
import { ResearchIntake } from "~/components/research-intake";
import { readResearchIntake } from "~/lib/research-intake.server";
import { data, Link } from "react-router";
import { ArrowRight, ArrowUpRight, Search, ArrowDown } from "lucide-react";

import type { Route } from "./+types/home";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { readWtiMarketSnapshot } from "~/lib/market-snapshot.server";
import { readResearchLedger } from "~/lib/research-ledger.server";
import { RESEARCH_STORIES } from "~/lib/research-ledger";
import type { ActionResult, WtiMarketView } from "~/lib/types";

/** 최근 완료 일봉의 선택 범위. */
const RANGE_OPTIONS = [20, 40, 60] as const;
/** 차트 내부 좌표 크기와 여백. */
const CHART = { width: 720, height: 200, pad: 12 };

/**
 * 관측값이 있을 때만 숫자와 단위를 표시한다.
 * @param value 관측값.
 * @param digits 소수점 자릿수.
 * @param suffix 단위.
 * @returns 관측값 또는 미확보 기호.
 */
function number(value: number | null | undefined, digits = 2, suffix = ""): string {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(digits)}${suffix}`;
}

/** @returns 연구 데스크의 검색 설명. */
export function meta({}: Route.MetaArgs) {
  return [{ title: "LS CRUDE — 공개 신호를 찾는 연구 데스크" }, { name: "description", content: "공개 대안 데이터와 WTI 변동성의 관계를 탐색합니다. 확보한 자료, 기각 근거와 아직 열린 질문을 함께 기록합니다." }];
}

/** @returns 실제 시장 관측과 현재 연구 정본. */
export function loader({}: Route.LoaderArgs) {
  return { market: readWtiMarketSnapshot(), ledger: readResearchLedger(), intake: readResearchIntake() };
}

/** @returns 공개 화면의 읽기 전용 응답. */
export function action({}: Route.ActionArgs) {
  return data({ ok: false, message: "공개 관측 화면은 읽기 전용입니다." } satisfies ActionResult, { status: 405 });
}

/**
 * 연구 질문, 실제 사례의 연결 가설과 WTI 관측을 한 흐름으로 보여준다.
 * @param props 라우트 데이터.
 * @returns 공개 연구 데스크.
 */
export default function Home({ loaderData: { market, ledger, intake } }: Route.ComponentProps) {
  const [storyIndex, setStoryIndex] = useState(2);
  const story = RESEARCH_STORIES[storyIndex];
  const record = ledger.records.find((item) => item.id === story.id);
  return (
    <>
      <DeskHeader source="Yahoo Finance" ticker="CL=F" freshness={market.freshness} />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <section className="research-hero" aria-labelledby="research-title">
          <div>
            <p className="eyebrow">EAST CAMP AI QUANT 4기 <span aria-hidden="true">/</span> 오태환 × 손성찬</p>
            <h1 id="research-title" className="hero-title">원유 시장을 읽을<br />새로운 <em className="not-italic text-primary">흔적</em>을 찾습니다.</h1>
            <p className="hero-copy">피자 주문처럼 작지만 설명 가능한 현실의 흔적에서 출발합니다. 공개 데이터를 찾고, 확보한 자료를 WTI 변동성과 비교하며, 보류와 기각의 이유까지 기록합니다.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link className="action-link" to="/research">후보와 판정 살펴보기 <ArrowRight size={17} aria-hidden="true" /></Link>
              <a className="secondary-link" href="#market">WTI 관측 보기 <ArrowDown size={15} aria-hidden="true" /></a>
            </div>
          </div>
          <aside className="research-status" aria-label="연구 현황">
            <p className="status-stamp"><Search size={14} aria-hidden="true" /> 탐색 중</p>
            <dl>
              <div><dt>기존 연구 인벤토리</dt><dd>{ledger.error ? "—" : ledger.records.length}<small>개</small></dd></div>
              <div><dt>기준 통과</dt><dd>{ledger.passCount ?? "—"}<small>개</small></dd></div>
            </dl>
            <p className="mt-5 text-base font-medium">{ledger.error ? "연구 장부 확인이 필요합니다." : "아직 채택할 신호가 없습니다."}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{ledger.error ?? "등록 규모와 검정 완료 건수는 다릅니다. 데이터 적격성, 공개 시점, 독립적인 관계를 확인하고 있습니다."}</p>
            <Link className="source-link mt-4" to="/research#method">어떤 기준으로 판단하나요? <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </aside>
        </section>

        <ResearchIntake {...intake} preview />

        <section className="py-10 sm:py-12" aria-labelledby="bridge-title">
          <div className="section-heading">
            <div><p className="section-kicker">01 / THE SIGNAL HUNT</p><h2 id="bridge-title">이 흔적은 WTI와 어떻게 연결될까?</h2></div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">Pentagon Pizza Index에서 가져온 것은<br className="hidden sm:block" /> 작은 현실의 변화를 시장과 연결하는 질문입니다.</p>
          </div>
          <div className="bridge-layout mt-6">
            <div className="candidate-switcher" role="group" aria-label="연결 가설 사례 선택">
              {RESEARCH_STORIES.map((item, index) => (
                <button key={item.id} className="candidate-choice" type="button" aria-pressed={storyIndex === index} aria-controls="candidate-bridge" onClick={() => setStoryIndex(index)}>
                  <span className="font-mono text-xs">{item.id} / {item.category}</span>
                  <strong>{item.label}</strong><small>{item.verdict} <ArrowRight size={14} aria-hidden="true" /></small>
                </button>
              ))}
            </div>
            <div id="candidate-bridge" className="bridge-panel" aria-live="polite" aria-atomic="true">
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-lg font-semibold">{story.question}</h3><span className="card-verdict">{story.verdict}</span></div>
              <ol className="bridge-flow mt-6" aria-label="검정할 연결 가설">
                <li className="bridge-node"><span>01 · 관측하려는 흔적</span><strong>{story.trace}</strong></li>
                <li className="bridge-node"><span>02 · 시장 연결 가설</span><strong>{story.mechanism}</strong></li>
                <li className="bridge-node"><span>03 · 연구 타깃</span><strong>공개 이후 다음 5거래일<br />WTI 실현변동성</strong></li>
              </ol>
              <p className="mt-4 text-xs leading-6 text-muted-foreground">연결 경로는 검정할 가설입니다. 시간차와 상관관계만으로 인과나 예측력을 확인할 수는 없습니다.</p>
              <div className="bridge-gap mt-5"><span className="status-stamp">{story.gap}</span><p className="mt-3 text-sm leading-7">{story.evidence}</p></div>
              <div className="evidence-note mt-5"><h4 className="text-sm font-medium text-primary">다음 확인 조건</h4><p className="mt-1 text-sm leading-7 text-muted-foreground">{story.next}</p></div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link className="source-link" to={`/research?candidate=${story.id}#ledger`}>이 후보 기록 보기 <ArrowRight size={14} aria-hidden="true" /></Link>
                {record && <a className="source-link" href={record.sourceHref} target="_blank" rel="noreferrer">연구 원문 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a>}
              </div>
            </div>
          </div>
        </section>

        <MarketContext market={market} candidateScope={story.scope} />

        <section className="py-10 sm:py-12" aria-labelledby="open-title">
          <div className="section-heading"><div><p className="section-kicker">03 / WHAT REMAINS OPEN</p><h2 id="open-title">다음 단계는, 빈칸을 확인하는 일.</h2></div><Link className="source-link" to="/research#method">전체 검증 절차 <ArrowRight size={14} aria-hidden="true" /></Link></div>
          <ol className="method-grid mt-6">
            <li className="method-step"><span>01 / 자료</span><h3>실제로 무엇을 측정하나</h3><p>주문량, 열 이상, 환율. 이름이 비슷한 대체값이 원래 가설을 측정하는지 확인합니다.</p></li>
            <li className="method-step"><span>02 / 시각</span><h3>그때 알 수 있었나</h3><p>발생 시각과 공개 시각을 구분합니다. 나중에 수정된 자료가 과거 판단에 섞이지 않도록 합니다.</p></li>
            <li className="method-step"><span>03 / 반증</span><h3>다른 구간에서도 남나</h3><p>규칙을 동결하고 새 미래 자료에서 확인합니다. 이미 본 구간은 새로운 검증으로 세지 않습니다.</p></li>
          </ol>
        </section>
      </main>
      <DeskFooter />
    </>
  );
}

/**
 * 실제 완료 일봉과 이미 관측한 변동성을 보여준다. 후보 시계열 부재는 별도로 설명한다.
 * @param props 시장 스냅샷과 선택 사례의 확보 범위.
 * @returns 범위·날짜 탐색이 가능한 WTI 관측.
 */
function MarketContext({ market, candidateScope }: { market: WtiMarketView; candidateScope: string }) {
  const [range, setRange] = useState(60);
  const [selected, setSelected] = useState<number | null>(null);
  const [metric, setMetric] = useState<"rv5" | "rv20">("rv5");
  const snapshot = market.snapshot;
  const checkedAtKst = snapshot
    ? new Date(Date.parse(snapshot.checkedAt) + 9 * 60 * 60 * 1_000).toISOString().slice(0, 16).replace("T", " ")
    : "—";
  const allBars = snapshot?.bars ?? [];
  const bars = allBars.slice(-range);
  const latest = allBars.at(-1);
  const previous = allBars.at(-2);
  const delta = latest && previous ? latest.close - previous.close : null;
  const minimum = bars.length ? Math.min(...bars.map((bar) => bar.close)) : 0;
  const maximum = bars.length ? Math.max(...bars.map((bar) => bar.close)) : 0;
  const span = maximum - minimum || 1;
  const pointIndex = Math.min(selected ?? bars.length - 1, bars.length - 1);
  const point = bars[pointIndex];
  const x = (index: number) => CHART.pad + (index / Math.max(bars.length - 1, 1)) * (CHART.width - 2 * CHART.pad);
  const y = (close: number) => CHART.height - CHART.pad - ((close - minimum) / span) * (CHART.height - 2 * CHART.pad);
  const path = bars.map((bar, index) => `${index ? "L" : "M"}${x(index).toFixed(2)},${y(bar.close).toFixed(2)}`).join(" ");
  const rv = metric === "rv5" ? snapshot?.volatility.rv5AnnualizedPct : snapshot?.volatility.rv20AnnualizedPct;
  return (
    <section id="market" className="market-section" aria-labelledby="market-title">
      <div className="section-heading"><div><p className="section-kicker">02 / WTI CONTEXT</p><h2 id="market-title">가설의 배경이 되는 원유 시장</h2></div><span className="data-status" data-freshness={market.freshness}><span aria-hidden="true" />{market.freshness === "fresh" ? "최근 완료 일봉" : market.freshness === "stale" ? "최신성 확인" : "관측 데이터 없음"}</span></div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">아래는 이미 끝난 구간의 가격과 실현변동성입니다. 연구 타깃인 ‘신호 공개 이후의 변동성’과 구분합니다.</p>
      {snapshot ? (
        <div className="market-layout mt-6">
          <div className="market-chart">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">WTI · CL=F 최근 완료 거래일 종가</p><p className="mt-2 font-mono text-4xl text-watching tabular-nums">{number(latest?.close)}<span className="ml-2 text-sm text-muted-foreground">USD</span></p><p className="mt-2 text-xs text-muted-foreground">{snapshot.asOf}{delta == null ? "" : ` · 이전 거래일 대비 ${delta > 0 ? "+" : ""}${number(delta)} USD`}</p></div><div className="flex gap-1" role="group" aria-label="차트 표시 범위">{RANGE_OPTIONS.map((value) => <button className="filter-button" type="button" key={value} disabled={value > allBars.length} aria-pressed={range === value} onClick={() => { setRange(value); setSelected(null); }}>{value}봉</button>)}</div></div>
            {bars.length > 1 ? <>
              <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img" aria-label={`최근 ${bars.length}개 WTI 종가 흐름`} aria-describedby="price-trend-summary" className="price-sparkline mt-6 w-full text-watching">
                {[CHART.pad, CHART.height / 2, CHART.height - CHART.pad].map((line) => <line key={line} x1={CHART.pad} x2={CHART.width - CHART.pad} y1={line} y2={line} stroke="currentColor" opacity="0.15" />)}
                <path d={path} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {point && <><line x1={x(pointIndex)} x2={x(pointIndex)} y1={0} y2={CHART.height} stroke="currentColor" strokeDasharray="3 5" opacity="0.6" /><circle cx={x(pointIndex)} cy={y(point.close)} r="4" fill="currentColor" /></>}
              </svg>
              <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground"><span>{bars[0].date}</span><span>{bars.at(-1)?.date}</span></div>
              <label className="mt-5 flex flex-wrap justify-between gap-2 text-sm" htmlFor="price-date"><span>관측일 탐색</span><output className="font-mono text-watching" htmlFor="price-date">{point?.date} · {number(point?.close)} USD</output></label>
              <input id="price-date" className="mt-2 min-h-11 w-full accent-watching" type="range" min={0} max={bars.length - 1} value={pointIndex} onChange={(event) => setSelected(Number(event.target.value))} aria-valuetext={`${point?.date}, ${number(point?.close)} 달러`} />
            </> : <div className="empty-state mt-6"><h3>가격 흐름을 그릴 자료가 부족합니다.</h3><p>완료 일봉이 2개 이상이면 흐름을 표시합니다.</p></div>}
            <p id="price-trend-summary" className="mt-3 text-xs leading-6 text-muted-foreground">{bars.length ? `표시 범위 ${bars.length}봉 · 최저 ${number(minimum)} / 최고 ${number(maximum)} USD. 범위를 바꿔도 상단 최근 종가는 유지됩니다.` : "표시할 관측값이 없습니다."}</p>
          </div>
          <div className="market-stats">
            <div className="flex gap-2" role="group" aria-label="실현변동성 기간">{(["rv5", "rv20"] as const).map((value) => <button key={value} type="button" className="filter-button" aria-pressed={metric === value} onClick={() => setMetric(value)}>RV {value === "rv5" ? "5" : "20"}일</button>)}</div>
            <dl className="mt-4"><div className="market-fact"><dt>{metric === "rv5" ? "5일" : "20일"} 실현변동성 · 연환산</dt><dd>{number(rv, 1, "%")}</dd></div><div className="market-fact"><dt>5일 실현변동성 백분위 · 고정 기준</dt><dd>{number(snapshot.volatility.rv5ReferencePercentile, 0)}<small> / 100</small></dd></div></dl>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">백분위는 2015–2023의 5일 변동성 분포에서 현재 관측값의 위치입니다. 미래 예측 확률이 아닙니다.</p>
            <div className="bridge-gap mt-5"><h3 className="text-sm font-medium">후보 비교선은 아직 없습니다.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{candidateScope}. 공개 시각에 맞춘 시계열이 있어야 겹침·시간차 비교가 가능합니다.</p></div>
          </div>
        </div>
      ) : <div className="empty-state mt-6"><h3>WTI 관측을 표시하지 못했습니다.</h3><p>현재 가격 대신 연구 기록을 먼저 살펴볼 수 있습니다.</p><Link className="action-link mt-4" to="/research">연구 기록 보기 <ArrowRight size={16} aria-hidden="true" /></Link></div>}
      {market.freshnessReasons.length > 0 && <p role="status" className="mt-4 text-sm leading-7 text-primary">{market.freshnessReasons.join(" ")}{snapshot ? ` 마지막 완료 일봉은 ${snapshot.asOf}입니다.` : ""}</p>}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">확인 시각 {checkedAtKst} KST · 매일 15:30 KST 자동 확인 예정. 수집·검증·배포 후 반영되며 지연될 수 있습니다. 실시간 체결가나 거래소 공식 정산가가 아닌 Yahoo 일봉 종가입니다. 휴장일에는 최근 완료 거래일 값을 유지합니다.</p>
      <details className="mt-6 border-t border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm">관측 출처·산식·데이터 확인</summary><div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground"><p>Yahoo Finance · CL=F · 일봉 · 자동조정 종가. 연속선물의 만기 교체에 따른 롤 갭이 포함될 수 있습니다.</p>{snapshot && <><p>산식: {snapshot.volatility.formula} · 연환산 {snapshot.volatility.annualization}일. 기준 분포 {snapshot.volatility.referenceStart}–{snapshot.volatility.referenceEnd}.</p><p>마지막 확인: {checkedAtKst} KST · 완료봉 {snapshot.provenance.rowCount.toLocaleString("ko-KR")}개</p><p className="break-all font-mono text-xs">SHA-256 {snapshot.provenance.contentSha256}</p></>}</div></details>
    </section>
  );
}
