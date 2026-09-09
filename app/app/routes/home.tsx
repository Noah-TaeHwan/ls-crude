import { ResearchSample } from "~/components/research-sample";
export { sampleShouldRevalidate as shouldRevalidate } from "~/lib/research-charts";
import { useEffect } from "react";
import { readTankerArrivals } from "~/lib/tanker-arrivals.server";
import { readVisibility } from "~/lib/visibility.server";
import { WtiDailyChart } from "~/components/wti-daily-chart";
import { readResearchIntake } from "~/lib/research-intake.server";
import { data, Link, useRevalidator } from "react-router";
import { ArrowRight, ArrowUpRight, Search, ArrowDown } from "lucide-react";

import type { Route } from "./+types/home";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { readWtiDaily } from "~/lib/wti-daily.server";
import type { WtiDailyView } from "~/lib/wti-daily";
import { readWtiMarketSnapshot } from "~/lib/market-snapshot.server";
import { readResearchLedger } from "~/lib/research-ledger.server";
import type { ActionResult, WtiMarketView } from "~/lib/types";

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
export async function loader({}: Route.LoaderArgs) {
  const [daily, visibility, tankers] = await Promise.all([readWtiDaily(), readVisibility(), readTankerArrivals()]);
  return { daily, visibility, tankers, checkedAt: new Date().toISOString(), market: readWtiMarketSnapshot(), ledger: readResearchLedger(), intake: readResearchIntake() };
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
export default function Home({ loaderData: { market, ledger, intake, daily, visibility, tankers, checkedAt } }: Route.ComponentProps) {
  const revalidator = useRevalidator();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") void revalidator.revalidate();
    }, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [revalidator]);
  return (
    <>
      <DeskHeader source="Yahoo Finance" ticker="CL=F" />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <section className="research-hero" aria-labelledby="research-title">
          <div>
            <p className="eyebrow">EAST CAMP AI QUANT 4기 <span aria-hidden="true">/</span> 오태환 × 손성찬</p>
            <h1 id="research-title" className="hero-title">원유 시장을 읽을<br />새로운 <em className="not-italic text-primary">흔적</em>을 찾습니다.</h1>
            <p className="hero-copy">피자 주문처럼 작지만 설명 가능한 현실의 흔적에서 출발합니다. 공개 데이터를 찾아 개별 관측으로 보여주고, 적격한 자료를 WTI와 비교합니다. 보류와 기각의 이유도 함께 기록합니다.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link className="action-link" to="/#research-sample">실제 수집 사례 보기 <ArrowRight size={17} aria-hidden="true" /></Link>
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

        <MarketContext market={market} daily={daily} />
        <div id="observations">
        <ResearchSample live={{visibility,tankers,checkedAt}} records={{ watermelon: intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-36"), jeju: intake.records.find((item) => item.fields.candidate_id === "ALT-20260908-20"), "degree-days": intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-45"), empties: intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-02"), "petroleum-rail": intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-43") }} />
        </div>
      </main>
      <DeskFooter />
    </>
  );
}

/**
 * 하나의 최신 일봉 가격 그래프와 별도 기준의 변동성 설명을 보여준다.
 * @param props 최신 일봉과 완료봉 변동성.
 * @returns WTI 시장 관측 영역.
 */
function MarketContext({ market, daily }: { market: WtiMarketView; daily: WtiDailyView }) {
  const snapshot = market.snapshot;
  const checkedAtKst = snapshot ? new Date(Date.parse(snapshot.checkedAt) + 9 * 3600000).toISOString().slice(0,16).replace("T", " ") : "—";
  return <section id="market" className="market-section" aria-labelledby="market-title">
    <div className="section-heading"><div><p className="section-kicker">01 / WTI DAILY</p><h2 id="market-title">WTI 원유 가격</h2></div></div>
    <WtiDailyChart view={daily} />
    <details className="mt-6 border-t border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm">실현변동성과 연구 기준 보기</summary>
      <div className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground">
        <p>변동성은 별도 완료 일봉 스냅샷 기준입니다. 위 가격 그래프의 변경 가능한 마지막 일봉을 계산에 섞지 않습니다.</p>
        {snapshot ? <><p>기준일 {snapshot.asOf} · 확인 {checkedAtKst} KST</p><dl className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div><dt>5일 실현변동성 · 연환산</dt><dd>{number(snapshot.volatility.rv5AnnualizedPct,1)}%</dd></div><div><dt>20일 실현변동성 · 연환산</dt><dd>{number(snapshot.volatility.rv20AnnualizedPct,1)}%</dd></div><div><dt>5일 실현변동성 백분위</dt><dd>{number(snapshot.volatility.rv5ReferencePercentile,0)} / 100</dd></div></dl><p>산식 {snapshot.volatility.formula} · 기준 분포 {snapshot.volatility.referenceStart}–{snapshot.volatility.referenceEnd}. 미래 예측 확률이 아닙니다.</p></> : <p>완료 일봉 변동성 자료를 표시하지 못했습니다.</p>}
        {market.freshnessReasons.length>0 && <p>{market.freshnessReasons.join(" ")}</p>}
        <p>후보 비교선은 아직 없습니다. 공개 시각에 맞춘 후보 시계열이 확보되어야 비교할 수 있습니다.</p>
      </div>
    </details>
  </section>;
}
