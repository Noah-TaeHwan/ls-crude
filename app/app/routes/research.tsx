import { data, Link } from "react-router";

import type { Route } from "./+types/research";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import type { ActionResult } from "~/lib/types";

/** 공개 장부의 전체 후보 수. */
const CANDIDATE_COUNT = 48;
/** 현재 기준을 모두 통과한 후보 수. */
const PASS_COUNT = 0;

/** 장부에서 쓰는 판정 종류. */
type ResearchVerdict = "철회" | "기각" | "보류" | "별도 전략";

/** 공개할 대표 연구 한 행. */
interface ResearchLedgerRow {
  hypothesis: string;
  target: string;
  data: string;
  inSample: string;
  outSample: string;
  verdict: ResearchVerdict;
  reason: string;
}

/** 검증 근거가 문서화된 대표 연구 기록. */
const LEDGER_ROWS: ResearchLedgerRow[] = [
  {
    hypothesis: "Pentagon Uber Eats",
    target: "다음 5거래일 WTI 변동성",
    data: "적격 익명 장기 집계 미확보",
    inSample: "—",
    outSample: "—",
    verdict: "철회",
    reason: "원래 가설을 보존할 공개 시계열이 없어 대체값을 만들지 않았습니다.",
  },
  {
    hypothesis: "Iran FX Stress",
    target: "다음 5거래일 WTI 변동성",
    data: "공개 USD/IRR 일간 환율",
    inSample: "r=-0.003",
    outSample: "r=-0.002",
    verdict: "기각",
    reason: "두 구간 모두 관계가 0에 가까웠습니다.",
  },
  {
    hypothesis: "SPR Injection Watch",
    target: "다음 5거래일 WTI 변동성",
    data: "EIA SPR 주간 순증가",
    inSample: "r=+0.051",
    outSample: "r=-0.455",
    verdict: "기각",
    reason: "아웃샘플에서 부호가 뒤집혀 안정적인 관계로 볼 수 없습니다.",
  },
  {
    hypothesis: "Refinery Utilization Proxy",
    target: "다음 5거래일 WTI 변동성",
    data: "EIA 미국 정유 설비 가동률",
    inSample: "r=-0.206",
    outSample: "r=-0.011",
    verdict: "기각",
    reason: "인샘플 관계가 아웃샘플에서 사라졌습니다.",
  },
  {
    hypothesis: "Refinery Thermal & Flare",
    target: "다음 5거래일 WTI 변동성",
    data: "VIIRS 열신호 공개 원시 패널 미구축",
    inSample: "—",
    outSample: "—",
    verdict: "보류",
    reason: "공개 시점과 시설 단위 해석을 검증할 데이터가 아직 없습니다.",
  },
  {
    hypothesis: "Energy Futures Pairs StatArb",
    target: "에너지 선물 상대가치",
    data: "에너지 선물 가격쌍",
    inSample: "—",
    outSample: "—",
    verdict: "별도 전략",
    reason: "WTI 변동성의 공개 선행 신호가 아니라 독립적인 상대가치 전략입니다.",
  },
];

/** 현재 48개 후보의 판정 분포. */
const VERDICT_COUNTS = [
  ["기각", 17],
  ["보류", 13],
  ["미검증", 7],
  ["보관", 6],
  ["분석 제외", 2],
  ["관측만", 2],
  ["별도 전략", 1],
] as const;

/** 규칙 동결을 포함한 연구 순서. */
const METHOD_STEPS = [
  ["가설", "무엇이 왜 WTI 변동성보다 먼저 움직일지 문장으로 씁니다."],
  ["데이터 적격성", "공개 시점, 지연, 누락, 라이선스와 반복 수집 가능성을 확인합니다."],
  ["인샘플", "2015–2023 안에서 산식과 실패 조건을 확인합니다."],
  ["규칙 동결", "신호 정의, 기간과 임계값을 기록하고 더는 고치지 않습니다."],
  ["한 번의 아웃샘플", "동결 뒤 남은 구간을 한 번 열고 판정을 그대로 남깁니다."],
] as const;

/** 연구 장부 검색 결과 설명. */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — 연구 장부" },
    {
      name: "description",
      content: "WTI 변동성의 공개 선행 신호 후보 48개와 통과 0개의 검증 기록입니다.",
    },
  ];
}

/**
 * 공개 연구 장부의 고정 요약을 반환한다.
 * @returns 후보 수와 통과 수.
 */
export function loader({}: Route.LoaderArgs) {
  return { candidateCount: CANDIDATE_COUNT, passCount: PASS_COUNT };
}

/**
 * 공개 연구 장부의 쓰기 요청을 거절한다.
 * @returns 읽기 전용 오류 응답.
 */
export function action({}: Route.ActionArgs) {
  return data(
    { ok: false, message: "공개 연구 장부는 읽기 전용입니다." } satisfies ActionResult,
    { status: 405 },
  );
}

/**
 * 후보의 가설, 데이터, 인샘플, 아웃샘플과 판정을 공개한다.
 * @param props React Router loader 데이터.
 * @returns 연구 장부 화면.
 */
export default function Research({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <DeskHeader source="Yahoo Finance" ticker="CL=F" />

      <main id="main-content" tabIndex={-1} className="min-h-screen">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <header className="border-b border-border py-10 sm:py-14">
          <p className="font-mono text-sm text-primary">
            {loaderData.candidateCount}개 후보 · 통과 {loaderData.passCount}개
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            찾은 신호보다 버린 가설을 먼저 공개합니다.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            이 장부는 성공담 모음이 아닙니다. 공개 데이터가 없었던 후보, 인샘플에서만 보인 관계,
            아웃샘플에서 뒤집힌 결과를 같은 형식으로 남겨 다음 판단을 검증할 수 있게 합니다.
          </p>
          <Link className="text-link mt-5 inline-block" to="/">현재 WTI 관측으로 돌아가기</Link>
        </header>

        <section className="border-b border-border py-8" aria-labelledby="distribution-title">
          <h2 id="distribution-title" className="text-2xl font-semibold text-foreground">현재 판정 분포</h2>
          <dl className="mt-6 flex flex-wrap border-y border-border">
            {VERDICT_COUNTS.map(([label, count]) => (
              <div key={label} className="min-w-32 flex-1 border-r border-border px-4 py-4 last:border-r-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-mono text-2xl text-foreground tabular-nums">{count}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            현재 인샘플과 아웃샘플에서 함께 재현된 관계는 없습니다. 미검증과 보류는 성과로 세지 않습니다.
          </p>
        </section>

        <section id="ledger" className="border-b border-border py-8" aria-labelledby="ledger-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="ledger-title" className="text-2xl font-semibold text-foreground">대표 검증 기록</h2>
              <p className="mt-2 text-sm text-muted-foreground">전체 48개 가운데 서로 다른 실패 유형을 보여주는 대표 행입니다.</p>
            </div>
            <a
              className="text-link"
              href="https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/factors"
              rel="noreferrer"
              target="_blank"
            >
              GitHub 원문 장부
              <span className="sr-only"> (새 탭)</span>
            </a>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="evidence-table evidence-table-stacked sm:min-w-[1040px]">
              <thead>
                <tr>
                  <th scope="col">가설</th>
                  <th scope="col">목표</th>
                  <th scope="col">데이터</th>
                  <th scope="col">IS</th>
                  <th scope="col">OOS</th>
                  <th scope="col">판정과 이유</th>
                </tr>
              </thead>
              <tbody>
                {LEDGER_ROWS.map((row) => (
                  <tr key={row.hypothesis}>
                    <th scope="row">{row.hypothesis}</th>
                    <td data-label="목표">{row.target}</td>
                    <td data-label="데이터">{row.data}</td>
                    <td data-label="IS" className="font-mono">{row.inSample}</td>
                    <td data-label="OOS" className="font-mono">{row.outSample}</td>
                    <td data-label="판정">
                      <span className={row.verdict === "보류" ? "text-primary" : "text-foreground"}>{row.verdict}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{row.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="method" className="border-b border-border py-8" aria-labelledby="method-title">
          <h2 id="method-title" className="text-2xl font-semibold text-foreground">검증 절차</h2>
          <ol className="mt-6 grid border-y border-border md:grid-cols-5">
            {METHOD_STEPS.map(([title, body], index) => (
              <li key={title} className="border-b border-border px-4 py-5 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
                <p className="font-mono text-sm text-primary">{index + 1}</p>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            2024–2026은 이미 여러 연구에서 확인했으므로 더 이상 손대지 않은 최종 검증 구간이 아닙니다.
            다음 후보는 규칙을 먼저 동결한 뒤 새로 쌓이는 미래 구간으로 검증합니다.
          </p>
        </section>

        <section id="team" className="py-8 sm:py-10" aria-labelledby="team-title">
          <h2 id="team-title" className="text-2xl font-semibold text-foreground">팀이 남기는 증거</h2>
          <dl className="mt-6 grid border-y border-border sm:grid-cols-2">
            <TeamRole
              name="오태환"
              role="데이터 · 대안 신호 · 대시보드"
              evidence="가설과 출처, 재실행 가능한 수집 규칙, 시장 관측 화면을 맡습니다."
              href="https://github.com/Noah-TaeHwan"
            />
            <TeamRole
              name="손성찬"
              role="전략 · ML · 백테스트"
              evidence="진입·청산 규칙, 모델 실험, 성과 검증 기록을 맡습니다."
              href="https://github.com/Liam-Son"
            />
          </dl>
        </section>
        </div>
      </main>
      <DeskFooter />
    </>
  );
}

/**
 * 역할별로 남겨야 하는 증거를 표시한다.
 * @param props 이름, 역할, 증거 설명과 GitHub 주소.
 * @returns 팀 역할 한 칸.
 */
function TeamRole({
  name,
  role,
  evidence,
  href,
}: {
  name: string;
  role: string;
  evidence: string;
  href: string;
}) {
  return (
    <div className="border-b border-border px-4 py-5 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <dt>
        <a className="text-link text-sm" href={href} rel="noreferrer" target="_blank">
          {name}
          <span className="sr-only"> (새 탭)</span>
        </a>
        <span className="mt-2 block font-mono text-xs text-primary">{role}</span>
      </dt>
      <dd className="mt-3 text-sm leading-6 text-muted-foreground">{evidence}</dd>
    </div>
  );
}
