import { data, Link } from "react-router";

import type { Route } from "./+types/home";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { WatchGauge } from "~/components/watch-gauge";
import { readWtiMarketSnapshot } from "~/lib/market-snapshot.server";
import type { ActionResult } from "~/lib/types";

/** 현재 공개 장부의 후보 수. */
const CANDIDATE_COUNT = 46;
/** 현재 공개 장부의 통과 수. */
const PASS_COUNT = 0;
/** 최근 가격 흐름 SVG의 너비. */
const SPARK_WIDTH = 520;
/** 최근 가격 흐름 SVG의 높이. */
const SPARK_HEIGHT = 116;

/** 홈에 먼저 보여줄 대표 연구 판정. */
interface ResearchPreviewRow {
  hypothesis: string;
  data: string;
  inSample: string;
  outSample: string;
  verdict: "철회" | "기각" | "보류";
}

/** 전체 연구 장부에서 사실 확인이 끝난 대표 행. */
const RESEARCH_PREVIEW: ResearchPreviewRow[] = [
  {
    hypothesis: "Pentagon Uber Eats",
    data: "적격 익명 장기 집계 미확보",
    inSample: "—",
    outSample: "—",
    verdict: "철회",
  },
  {
    hypothesis: "Iran FX Stress",
    data: "공개 USD/IRR 환율",
    inSample: "r=-0.003",
    outSample: "r=-0.002",
    verdict: "기각",
  },
  {
    hypothesis: "SPR Injection Watch",
    data: "EIA SPR 주간 보고",
    inSample: "r=+0.051",
    outSample: "r=-0.455",
    verdict: "기각",
  },
  {
    hypothesis: "Refinery Thermal & Flare",
    data: "공개 원시 패널 미구축",
    inSample: "—",
    outSample: "—",
    verdict: "보류",
  },
];

/** 최근 연구 기록 한 건. */
interface ResearchLogEntry {
  date: string;
  author: string;
  title: string;
  result: string;
  href: string;
}

/** GitHub의 최신 연구 기록 가운데 현재 판정에 영향을 준 항목. */
const RECENT_RESEARCH_LOG: ResearchLogEntry[] = [
  {
    date: "2026-09-03",
    author: "손성찬",
    title: "교차 팩터 조합 4개 검정",
    result: "사전 등록한 조합 가운데 새 변동성 가중치로 채택할 조합은 0개였습니다.",
    href: "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/reports/2026-09-03-combination-stack-test.md",
  },
  {
    date: "2026-09-03",
    author: "손성찬",
    title: "027·042 구성요소 반증",
    result: "인샘플과 2024년 이후 구간에서 관계가 반전되거나 사라져 기각을 유지했습니다.",
    href: "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/notes/2026-09-03-027-042-rescue-falsification.md",
  },
  {
    date: "2026-09-03",
    author: "손성찬",
    title: "인천 환승여객 첫 검증",
    result: "IS r=-0.332, OOS r=+0.530으로 부호가 뒤집혀 통과하지 못했습니다.",
    href: "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/notes/2026-09-03-incheon-transit-surge-test.md",
  },
];

/** 연구 절차의 고정 순서. */
const METHOD_STEPS = [
  ["가설", "평범한 공개 흔적이 변동성보다 먼저 움직이는지 묻습니다."],
  ["데이터 적격성", "공개 시점과 누락, 반복 수집 가능성을 먼저 확인합니다."],
  ["인샘플 (IS)", "2015–2023 안에서 관계와 실패 조건을 확인합니다."],
  ["규칙 동결", "임계값과 기간을 더 이상 고치지 않습니다."],
  ["한 번의 아웃샘플 (OOS)", "보지 않은 미래 구간에서 한 번만 평가합니다."],
] as const;

/**
 * 숫자를 소수점 자릿수에 맞춰 표시한다.
 * @param value 표시할 값.
 * @param digits 소수점 자릿수.
 * @returns 표시 문자열.
 */
function formatNumber(value: number | null, digits = 2): string {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);
}

/**
 * 증감값 앞에 부호를 붙인다.
 * @param value 증감값.
 * @param digits 소수점 자릿수.
 * @returns 부호가 있는 표시 문자열.
 */
function formatSigned(value: number, digits = 2): string {
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
}

/**
 * UTC 시각을 한국 표준시로 표시한다.
 * @param value ISO 시각.
 * @returns 한국 표준시 표시 문자열.
 */
function formatKst(value: string): string {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "—";
  const kst = new Date(parsed.getTime() + 9 * 60 * 60 * 1_000);
  return `${kst.toISOString().slice(0, 16).replace("T", " ")} KST`;
}

/**
 * 종가 배열을 SVG 선 경로로 바꾼다.
 * @param values 시간순 종가.
 * @returns SVG path의 d 값.
 */
function sparklinePath(values: number[]): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * SPARK_WIDTH;
      const y = SPARK_HEIGHT - ((value - min) / span) * SPARK_HEIGHT;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** 홈 화면 검색 결과 설명. */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — WTI 변동성 관측" },
    {
      name: "description",
      content:
        "최근 완료된 Yahoo Finance CL=F 일봉으로 WTI 실현변동성을 관측하고, 공개 신호 후보의 검증 과정을 기록합니다.",
    },
  ];
}

/**
 * 번들에 포함된 최신 WTI 관측 스냅샷을 읽는다.
 * @returns 공개 시장 관측과 신선도.
 */
export function loader({}: Route.LoaderArgs) {
  return { market: readWtiMarketSnapshot() };
}

/**
 * 공개 홈 화면의 쓰기 요청을 거절한다.
 * @returns 읽기 전용 오류 응답.
 */
export function action({}: Route.ActionArgs) {
  return data(
    { ok: false, message: "공개 관측 화면은 읽기 전용입니다." } satisfies ActionResult,
    { status: 405 },
  );
}

/**
 * 최신 WTI 관측과 공개 신호 연구 과정을 보여준다.
 * @param props React Router loader 데이터.
 * @returns Evidence Brief 홈 화면.
 */
export default function Home({ loaderData }: Route.ComponentProps) {
  const { market } = loaderData;
  const snapshot = market.snapshot;
  const bars = snapshot?.bars ?? [];
  const latest = bars.at(-1) ?? null;
  const previous = bars.at(-2) ?? null;
  const closeDelta = latest && previous ? latest.close - previous.close : null;
  const closePct = closeDelta != null && previous ? closeDelta / previous.close : null;
  const closes = bars.map((bar) => bar.close);
  const minimumClose = closes.length > 0 ? Math.min(...closes) : null;
  const maximumClose = closes.length > 0 ? Math.max(...closes) : null;
  const source = snapshot?.source.provider ?? "Yahoo Finance";

  return (
    <>
      <DeskHeader
        source={source}
        ticker={snapshot?.ticker ?? "CL=F"}
        freshness={market.freshness}
      />

      <main id="main-content" tabIndex={-1} className="min-h-screen">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <section className="grid border-b border-border lg:grid-cols-2">
          <div>
            <WatchGauge
              score={snapshot?.volatility.rv5ReferencePercentile ?? null}
              rv5={snapshot?.volatility.rv5AnnualizedPct ?? null}
            />
            <dl className="mx-1 mb-5 grid grid-cols-2 border-y border-border text-sm sm:mx-5 sm:grid-cols-4">
              <MarketFact label="5일 실현변동성" value={`${formatNumber(snapshot?.volatility.rv5AnnualizedPct ?? null, 1)}%`} />
              <MarketFact label="장기 기준 백분위" value={formatNumber(snapshot?.volatility.rv5ReferencePercentile ?? null, 0)} />
              <MarketFact label="기준일" value={snapshot?.asOf ?? "—"} />
              <MarketFact label="마지막 확인" value={snapshot ? formatKst(snapshot.checkedAt) : "—"} />
            </dl>
          </div>

          <section className="border-t border-border px-1 py-7 lg:border-t-0 lg:border-l lg:px-8" aria-labelledby="quote-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="quote-title" className="text-base font-medium text-foreground">
                  WTI (CL=F) 최근 종가
                </h2>
                <p className="mt-4 font-mono text-5xl leading-none text-watching tabular-nums sm:text-6xl">
                  {formatNumber(latest?.close ?? null)}
                  <span className="ml-2 text-base text-foreground">USD</span>
                </p>
                {closeDelta != null && closePct != null ? (
                  <p className="mt-3 font-mono text-base text-watching tabular-nums">
                    {formatSigned(closeDelta)} ({formatSigned(closePct * 100)}%)
                  </p>
                ) : null}
              </div>
              <p className="data-status" data-freshness={market.freshness}>
                <span aria-hidden="true" />
                {market.freshness === "fresh"
                  ? "최근 완료 일봉 · 정상"
                  : market.freshness === "stale"
                    ? "최근 완료 일봉 · 업데이트 지연"
                    : "데이터 없음"}
              </p>
            </div>

            <div className="mt-8">
              <p className="font-mono text-xs text-muted-foreground">최근 완료 일봉 60개</p>
              {closes.length > 1 ? (
                <svg
                  viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
                  className="price-sparkline mt-3 h-32 w-full text-watching"
                  role="img"
                  aria-label={`최근 ${closes.length}개 WTI 종가 흐름`}
                  aria-describedby="price-trend-summary"
                >
                  <path
                    d={sparklinePath(closes)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">가격 데이터가 없습니다.</p>
              )}
              <p id="price-trend-summary" className="mt-3 text-xs text-muted-foreground">
                {latest && minimumClose != null && maximumClose != null
                  ? `표시 구간 종가 최저 ${formatNumber(minimumClose)}달러, 최고 ${formatNumber(maximumClose)}달러, 마지막 ${formatNumber(latest.close)}달러입니다.`
                  : "표시할 종가 범위가 없습니다."}
              </p>
            </div>

            <div className="mt-5 space-y-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <p>
                출처: {source} · {snapshot?.ticker ?? "CL=F"} · {snapshot?.interval ?? "1d"} · 자동조정 종가 · 20일 변동성 {formatNumber(snapshot?.volatility.rv20AnnualizedPct ?? null, 1)}%
              </p>
              <p>
                기준 분포: {snapshot?.volatility.referenceStart ?? "—"}–{snapshot?.volatility.referenceEnd ?? "—"}
                {snapshot ? ` · ${snapshot.volatility.referenceWindowCount.toLocaleString("ko-KR")}개 창` : ""}
              </p>
              <p>
                산식: {snapshot?.volatility.formula ?? "—"} · 연환산 {snapshot?.volatility.annualization ?? 252}일
              </p>
              <p>CL=F는 연속선물이라 만기 교체 때 생기는 롤 갭을 포함할 수 있습니다.</p>
              {snapshot ? (
                <p>
                  검증: 전체 완료봉 {snapshot.provenance.rowCount.toLocaleString("ko-KR")}행 · SHA-256 {snapshot.provenance.contentSha256.slice(0, 12)}…
                </p>
              ) : null}
              {market.freshnessReasons.map((reason) => (
                <p key={reason} className="text-primary">{reason}</p>
              ))}
            </div>
          </section>
        </section>

        <section className="border-b border-border py-8 sm:py-10" aria-labelledby="signal-question">
          <h2 id="signal-question" className="max-w-5xl text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            피자 주문 같은 평범한 흔적이 유가의 흔들림을 먼저 말할까?
          </h2>
          <p className="mt-3 max-w-5xl text-sm leading-7 text-muted-foreground sm:text-base">
            이 프로젝트는 유가 방향을 맞히지 않습니다. 관심 있는 것은 다음 WTI 변동성의 크기입니다.
            주문, 공시, 선박 이동, 위성 열신호처럼 먼저 드러날 수 있는 공개 흔적을 모아 실제 관계를 확인합니다.
            관계가 없거나 가설이 틀려도 그대로 기록합니다.
          </p>
        </section>

        <section id="ledger" className="border-b border-border py-8" aria-labelledby="ledger-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="ledger-title" className="text-2xl font-semibold text-foreground">공개 신호 연구 장부</h2>
              <p className="mt-2 font-mono text-sm text-primary">
                {CANDIDATE_COUNT}개 후보 · 통과 {PASS_COUNT}개
              </p>
            </div>
            <Link className="text-link" to="/research">전체 연구 장부 보기</Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="evidence-table">
              <thead>
                <tr>
                  <th scope="col">가설</th>
                  <th scope="col">확보 데이터</th>
                  <th scope="col" className="hidden sm:table-cell">IS</th>
                  <th scope="col" className="hidden sm:table-cell">OOS</th>
                  <th scope="col" className="whitespace-nowrap">판정</th>
                </tr>
              </thead>
              <tbody>
                {RESEARCH_PREVIEW.map((row) => (
                  <tr key={row.hypothesis}>
                    <th scope="row">{row.hypothesis}</th>
                    <td>{row.data}</td>
                    <td className="hidden font-mono sm:table-cell">{row.inSample}</td>
                    <td className="hidden font-mono sm:table-cell">{row.outSample}</td>
                    <td className="whitespace-nowrap"><Verdict value={row.verdict} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

          <ResearchLog />
          <MethodSection />
        </div>
      </main>
      <DeskFooter />
    </>
  );
}

/**
 * 시장 관측의 한 가지 사실을 표시한다.
 * @param props 라벨과 값.
 * @returns 정의 목록 한 칸.
 */
function MarketFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border px-3 py-3 last:border-r-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xs text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * 연구 판정을 색뿐 아니라 텍스트로 표시한다.
 * @param props 연구 판정.
 * @returns 판정 라벨.
 */
function Verdict({ value }: { value: ResearchPreviewRow["verdict"] }) {
  return <span className={value === "보류" ? "text-primary" : "text-muted-foreground"}>{value}</span>;
}

/**
 * 최근 GitHub 연구의 질문과 판정을 날짜순으로 보여준다.
 * @returns 최근 연구 기록 목록.
 */
function ResearchLog() {
  return (
    <section className="border-b border-border py-8" aria-labelledby="research-log-title">
      <h2 id="research-log-title" className="text-2xl font-semibold text-foreground">
        최근 연구 기록
      </h2>
      <ol className="mt-6 border-y border-border">
        {RECENT_RESEARCH_LOG.map((entry) => (
          <li
            key={`${entry.date}-${entry.title}`}
            className="grid gap-2 border-b border-border px-3 py-4 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-start sm:gap-5"
          >
            <p className="font-mono text-xs text-muted-foreground">{entry.date} · {entry.author}</p>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.result}</p>
            </div>
            <a className="text-link" href={entry.href} rel="noreferrer" target="_blank">
              원문
              <span className="sr-only"> (새 탭)</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * 다섯 단계의 고정 연구 절차를 보여준다.
 * @returns 연구 방법론 섹션.
 */
function MethodSection() {
  return (
    <section id="method" className="py-8 sm:py-10" aria-labelledby="method-title">
      <h2 id="method-title" className="text-2xl font-semibold text-foreground">연구 방법</h2>
      <ol className="mt-6 grid border-y border-border md:grid-cols-5">
        {METHOD_STEPS.map(([title, body], index) => (
          <li key={title} className="border-b border-border px-4 py-5 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
            <p className="font-mono text-sm text-primary">{index + 1}</p>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
