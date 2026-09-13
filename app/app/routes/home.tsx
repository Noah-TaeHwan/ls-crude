import { useEffect } from "react";
import { WtiDailyChart } from "~/components/wti-daily-chart";
import { data, Link, redirect, useLocation, useNavigate, useRevalidator } from "react-router";
import { legacyHashRedirect, legacySampleRedirect, unsupportedSampleNotice } from "~/lib/cai-legacy-routing";
import { useDisclosureHistory } from "~/lib/use-disclosure-history";

import type { Route } from "./+types/home";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { CaiGauge } from "~/components/cai/cai-gauge";
import { CaiHistory } from "~/components/cai/cai-history";
import { CaiForecast } from "~/components/cai/cai-forecast";
import { CaiAbout } from "~/components/cai/cai-about";
import { ExperimentResults } from "~/components/cai/experiment-results";
import { LocalStatus } from "~/components/cai/local-status";
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
  return [{ title: "쿠싱 액티비티 인덱스 — LS CRUDE" }, { name: "description", content: "교통량과 시설 신고 유량을 결합한 실험용 CAI v0.1. 과거 자료의 기준일·구성·추이를 확인합니다. 현재 활동이나 유가 상승 확률이 아닙니다." }];
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
  const restoringHistory = useDisclosureHistory();
  useEffect(() => {
    // hash-only 구주소는 서버가 볼 수 없으므로 클라이언트에서 replace한다.
    const target = legacyHashRedirect(location.pathname, location.hash);
    if (target) {
      void navigate(target, { replace: true });
    } else if (!location.hash && !restoringHistory) {
      document.querySelectorAll<HTMLDetailsElement>("#main-content details[open]").forEach((item) => { item.open = false; });
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash, location.key, navigate, restoringHistory]);
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
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">교통량·시설 신고 유량을 결합한 실험용 CAI v0.1입니다. 과거 자료의 기준일과 추이를 확인하세요.</p>
          {unsupportedSample ? <p role="status" className="mt-4 text-sm text-muted-foreground">{unsupportedSample} <Link className="source-link" to="/research#research-sample">연구 기록에서 사례 보기</Link></p> : null}
        </header>
        <section className="border-t border-border py-4" aria-label="CAI 계기판과 설명">
          <div className={cai.index.mode === "RETROSPECTIVE" && cai.index.score !== null && cai.index.history.length > 0 ? "grid items-start gap-4 lg:grid-cols-2" : ""}>
            <CaiGauge index={cai.index} />
            <CaiHistory view={cai} />
          </div>
          <CaiAbout view={cai} />
        </section>
        <section className="border-t border-border py-4" aria-label="다음 기간 WTI 방향">
          <CaiForecast forecast={cai.forecast} validation={cai.validation} />
        </section>
        <ExperimentResults mode="compact" summary={experiments} />
        <MarketContext market={market} daily={daily} />
        {import.meta.env.DEV ? <LocalStatus mode="compact" /> : null}
        <p className="border-t border-border py-5 text-sm text-muted-foreground">아이디어부터 실험 결과까지의 과정은 <Link className="source-link" to="/research">연구 기록</Link>에서 이어서 확인합니다.</p>
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
    <details className="mt-6 border-t border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm">변동성과 계산 기준 보기</summary>
      <div className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground">
        <p>변동성은 마감이 확인된 일봉으로 계산합니다. 아직 바뀔 수 있는 마지막 일봉은 제외합니다.</p>
        {snapshot ? <><p>기준일 {snapshot.asOf} · 확인 {checkedAtKst} KST</p><dl className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div><dt>5일 실현변동성 · 연환산</dt><dd>{number(snapshot.volatility.rv5AnnualizedPct,1)}%</dd></div><div><dt>20일 실현변동성 · 연환산</dt><dd>{number(snapshot.volatility.rv20AnnualizedPct,1)}%</dd></div><div><dt>5일 실현변동성 백분위</dt><dd>{number(snapshot.volatility.rv5ReferencePercentile,0)} / 100</dd></div></dl><p>산식 {snapshot.volatility.formula} · 기준 분포 {snapshot.volatility.referenceStart}–{snapshot.volatility.referenceEnd}. 미래 예측 확률이 아닙니다.</p></> : <p>완료 일봉 변동성 자료를 표시하지 못했습니다.</p>}
        {market.freshnessReasons.length>0 && <p>{market.freshnessReasons.join(" ")}</p>}
        <p>후보 데이터와의 비교는 연구 기록에서 확인할 수 있습니다. 이 가격 그래프만으로 후보의 예측력을 판단하지 않습니다.</p>
      </div>
    </details>
  </section>;
}
