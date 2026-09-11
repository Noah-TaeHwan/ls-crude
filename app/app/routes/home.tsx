import { useEffect } from "react";
import { WtiDailyChart } from "~/components/wti-daily-chart";
import { data, Link, redirect, useLocation, useNavigate, useRevalidator } from "react-router";
import { legacyHashRedirect, legacySampleRedirect, unsupportedSampleNotice } from "~/lib/cai-legacy-routing";

import type { Route } from "./+types/home";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { CaiGauge } from "~/components/cai/cai-gauge";
import { CaiForecast } from "~/components/cai/cai-forecast";
import { CaiAbout } from "~/components/cai/cai-about";
import { ExperimentResults } from "~/components/cai/experiment-results";
import { emptyCaiView } from "~/lib/cai-view";
import { readCaiPublicView } from "~/lib/cai-view.server";
import { readExperimentSummary } from "~/lib/experiment-summary.server";
import { readWtiDaily } from "~/lib/wti-daily.server";
import type { WtiDailyView } from "~/lib/wti-daily";
import { readWtiMarketSnapshot } from "~/lib/market-snapshot.server";
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

/** @returns 쿠싱 액티비티 인덱스 홈의 검색 설명. */
export function meta({}: Route.MetaArgs) {
  return [{ title: "쿠싱 액티비티 인덱스 — LS CRUDE" }, { name: "description", content: "쿠싱의 활동 신호로 만든 0–100 점수와 다음 기간 WTI 방향, 가격 흐름을 함께 봅니다. 승인된 산출물이 없으면 점수는 —, 예측은 미실행입니다." }];
}

/**
 * 홈에 필요한 CAI 공개 adapter와 WTI 관측만 읽는다.
 * 구 sample 주소는 무거운 시장 조회 전에 history로 보낸다.
 * @returns CAI 공개 객체와 WTI 일봉·시장 스냅샷.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const legacy = legacySampleRedirect(url.pathname, url.searchParams);
  if (legacy) return redirect(legacy, 308);
  // 한 영역의 실패가 다른 영역을 비우지 않도록 각각 독립적으로 읽는다.
  const [daily, cai] = await Promise.all([
    readWtiDaily(),
    readCaiPublicView().catch(() => emptyCaiView()),
  ]);
  return { daily, market: readWtiMarketSnapshot(), cai, experiments: readExperimentSummary(), unsupportedSample: unsupportedSampleNotice(url.searchParams.get("sample")) };
}

/** @returns 공개 화면의 읽기 전용 응답. */
export function action({}: Route.ActionArgs) {
  return data({ ok: false, message: "공개 관측 화면은 읽기 전용입니다." } satisfies ActionResult, { status: 405 });
}

/**
 * CAI 계기판·방향·설명과 WTI 가격 흐름을 보여준다.
 * 미연결 상태는 지어내지 않고 산출 대기·예측 미실행으로 표시한다.
 * @param props 라우트 데이터.
 * @returns 쿠싱 액티비티 인덱스 홈.
 */
export default function Home({ loaderData: { market, daily, cai, experiments, unsupportedSample } }: Route.ComponentProps) {
  const revalidator = useRevalidator();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // hash-only 구주소는 서버가 볼 수 없으므로 클라이언트에서 replace한다.
    const target = legacyHashRedirect(location.pathname, location.hash);
    if (target) void navigate(target, { replace: true });
  }, [location.pathname, location.hash, navigate]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") void revalidator.revalidate();
    }, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [revalidator]);
  return (
    <>
      <DeskHeader source="Yahoo Finance" ticker="CL=F" contextLabel="쿠싱 액티비티 인덱스 · WTI 일봉" />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <header className="border-b border-border py-8 sm:py-10">
          <p className="eyebrow">쿠싱 액티비티 인덱스 <span aria-hidden="true">/</span> LS CRUDE · 오태환 × 손성찬</p>
          <h1 id="cai-home-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">쿠싱 액티비티 인덱스</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">CAI, 다음 기간 WTI 방향, WTI 가격을 봅니다. 승인된 산출물이 없으면 점수는 —, 예측은 미실행입니다.</p>
          {unsupportedSample ? <p role="status" className="mt-4 text-sm text-muted-foreground">{unsupportedSample} <Link className="source-link" to="/research#research-sample">연구 기록에서 사례 보기</Link></p> : null}
        </header>
        <section className="border-t border-border py-4" aria-label="CAI 계기판과 설명">
          <CaiGauge index={cai.index} />
          <CaiAbout view={cai} />
        </section>
        <section className="border-t border-border py-4" aria-label="다음 기간 WTI 방향">
          <CaiForecast forecast={cai.forecast} validation={cai.validation} />
        </section>
        <ExperimentResults mode="compact" summary={experiments} />
        <MarketContext market={market} daily={daily} />
        <p className="border-t border-border py-5 text-sm text-muted-foreground">확보한 자료와 판정 기록은 <Link className="source-link" to="/research#research-sample">연구 기록</Link>에서 이어서 확인합니다.</p>
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
    <div className="section-heading"><div><p className="section-kicker">WTI DAILY</p><h2 id="market-title">WTI 원유 가격</h2></div></div>
    <WtiDailyChart view={daily} />
    <details className="mt-6 border-t border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm">실현변동성과 연구 기준 보기</summary>
      <div className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground">
        <p>변동성은 별도 완료 일봉 스냅샷 기준입니다. 위 가격 그래프의 변경 가능한 마지막 일봉을 계산에 섞지 않습니다.</p>
        {snapshot ? <><p>기준일 {snapshot.asOf} · 확인 {checkedAtKst} KST</p><dl className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div><dt>5일 실현변동성 · 연환산</dt><dd>{number(snapshot.volatility.rv5AnnualizedPct,1)}%</dd></div><div><dt>20일 실현변동성 · 연환산</dt><dd>{number(snapshot.volatility.rv20AnnualizedPct,1)}%</dd></div><div><dt>5일 실현변동성 백분위</dt><dd>{number(snapshot.volatility.rv5ReferencePercentile,0)} / 100</dd></div></dl><p>산식 {snapshot.volatility.formula} · 기준 분포 {snapshot.volatility.referenceStart}–{snapshot.volatility.referenceEnd}. 미래 예측 확률이 아닙니다.</p></> : <p>완료 일봉 변동성 자료를 표시하지 못했습니다.</p>}
        {market.freshnessReasons.length>0 && <p>{market.freshnessReasons.join(" ")}</p>}
        <p>후보 비교선은 아직 없습니다. 공개 시각에 맞춘 후보 시계열이 확보되어야 비교할 수 있고, 위 그래프만으로 어떤 후보의 관계도 확인할 수 없습니다.</p>
      </div>
    </details>
  </section>;
}
