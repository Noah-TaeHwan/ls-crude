import { Fragment, useState } from "react";
import { data, Link } from "react-router";

import type { Route } from "./+types/research";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { Badge } from "~/components/ui/badge";
import type { ActionResult } from "~/lib/types";

/** 공개 장부의 전체 후보 수. `research/factors/` 001–052와 같다. */
const CANDIDATE_COUNT = 52;
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
  /** GitHub 원문 링크. 없으면 상세에 링크를 표시하지 않는다. */
  sourceHref?: string;
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

/**
 * 현재 52개 후보의 판정 분포.
 * 001–048 기존 버킷에 049·051·052 HOLD와 050 MONITOR만 더한다.
 */
const VERDICT_COUNTS = [
  ["기각", 17],
  ["보류", 16],
  ["미검증", 7],
  ["보관", 6],
  ["분석 제외", 2],
  ["관측만", 3],
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

/** 판정 정렬·필터의 동결 순서. PLAN Q3 확정. */
const VERDICT_ORDER: ResearchVerdict[] = ["별도 전략", "보류", "기각", "철회"];

/** 장부 테이블에서 정렬할 수 있는 열. 목표·데이터·판정 이유는 서술형이라 제외. */
type LedgerSortKey = "hypothesis" | "inSample" | "outSample" | "verdict";

/** 장부 테이블의 정렬 방향. */
type SortDirection = "asc" | "desc";

/**
 * IS·OOS 표기에서 관계계수를 읽는다.
 * @param value "r=-0.003" 또는 "—".
 * @returns 수치. "—"는 null로 돌려 항상 끝으로 보낸다.
 */
function parseCorrelation(value: string): number | null {
  if (value === "—") return null;
  const parsed = Number.parseFloat(value.replace(/^r=/, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * 행 상세 영역의 DOM id를 만든다.
 * @param hypothesis 가설 문장. 행 키로 유일하다.
 * @returns aria-controls용 id.
 */
function detailIdFor(hypothesis: string): string {
  const slug = hypothesis
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `ledger-detail-${slug}`;
}

/**
 * 장부 한 행의 전문을 같은 화면에 펼친다.
 * @param props 펼칠 행.
 * @returns 가설·목표·데이터·IS·OOS·판정·이유 정의 목록. 설계에 없는 수치는 표시하지 않는다.
 */
function LedgerDetail({ row }: { row: ResearchLedgerRow }) {
  return (
    <div id={detailIdFor(row.hypothesis)}>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs text-muted-foreground">가설</dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">{row.hypothesis}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs text-muted-foreground">목표</dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">{row.target}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs text-muted-foreground">데이터</dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">{row.data}</dd>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="font-mono text-xs text-muted-foreground">IS</dt>
            <dd className="mt-1 font-mono text-sm text-foreground tabular-nums">{row.inSample}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs text-muted-foreground">OOS</dt>
            <dd className="mt-1 font-mono text-sm text-foreground tabular-nums">{row.outSample}</dd>
          </div>
        </div>
        <div>
          <dt className="font-mono text-xs text-muted-foreground">판정</dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">
            <span className={row.verdict === "보류" ? "text-primary" : "text-muted-foreground"}>
              {row.verdict}
            </span>
            {row.verdict === "보류" ? (
              <Badge variant="outline" className="ml-2">
                연구 후보·예시
              </Badge>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs text-muted-foreground">판정 이유</dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">{row.reason}</dd>
        </div>
      </dl>
      {row.sourceHref ? (
        <a className="text-link mt-3 inline-block" href={row.sourceHref} rel="noreferrer" target="_blank">
          원문
          <span className="sr-only"> (새 탭)</span>
        </a>
      ) : null}
    </div>
  );
}

/**
 * 정렬 버튼을 품은 장부 테이블 머리글.
 * @param props 열 라벨, 정렬 키와 현재 정렬 상태, 정렬 요청 콜백.
 * @returns aria-sort가 달린 th.
 */
function SortableHeader({
  label,
  sortKeyValue,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKeyValue: LedgerSortKey;
  activeKey: LedgerSortKey | null;
  direction: SortDirection;
  onSort: (key: LedgerSortKey) => void;
}) {
  const active = activeKey === sortKeyValue;
  return (
    <th scope="col" aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKeyValue)}
        aria-label={`${label} 정렬${active ? (direction === "asc" ? " (오름차순)" : " (내림차순)") : ""}`}
        className="inline-flex min-h-[44px] items-center gap-1 px-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {label}
        <span aria-hidden="true">{active ? (direction === "asc" ? "▲" : "▼") : "△"}</span>
      </button>
    </th>
  );
}

/** 연구 장부 검색 결과 설명. */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — 연구 장부" },
    {
      name: "description",
      content: `WTI 변동성의 공개 선행 신호 후보 ${CANDIDATE_COUNT}개와 통과 ${PASS_COUNT}개의 검증 기록입니다.`,
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
  const [sortKey, setSortKey] = useState<LedgerSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [activeVerdicts, setActiveVerdicts] = useState<ResearchVerdict[]>([...VERDICT_ORDER]);
  const [query, setQuery] = useState("");
  const [expandedHypothesis, setExpandedHypothesis] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = LEDGER_ROWS.filter(
    (row) =>
      activeVerdicts.includes(row.verdict) &&
      (normalizedQuery === "" ||
        `${row.hypothesis} ${row.data}`.toLowerCase().includes(normalizedQuery)),
  );
  const visibleRows = [...filteredRows].sort((a, b) => {
    if (sortKey == null) return 0;
    const direction = sortDirection === "asc" ? 1 : -1;
    if (sortKey === "hypothesis") {
      return a.hypothesis.localeCompare(b.hypothesis, "ko") * direction;
    }
    if (sortKey === "verdict") {
      return (VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict)) * direction;
    }
    const aValue = parseCorrelation(sortKey === "inSample" ? a.inSample : a.outSample);
    const bValue = parseCorrelation(sortKey === "inSample" ? b.inSample : b.outSample);
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return (aValue - bValue) * direction;
  });

  /**
   * 정렬 열을 바꾼다. 같은 열이면 방향만 뒤집는다.
   * @param key 정렬할 열.
   */
  function handleSort(key: LedgerSortKey): void {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  /**
   * 판정 필터 체크박스를 켜고 끈다.
   * @param verdict 바꿀 판정.
   */
  function toggleVerdict(verdict: ResearchVerdict): void {
    setActiveVerdicts((current) =>
      current.includes(verdict)
        ? current.filter((item) => item !== verdict)
        : [...current, verdict],
    );
  }

  /**
   * 장부 행 상세를 펼치고 접는다. 같은 행이면 닫는다.
   * @param hypothesis 펼칠 행의 가설.
   */
  function toggleDetail(hypothesis: string): void {
    setExpandedHypothesis((current) => (current === hypothesis ? null : hypothesis));
  }
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

        <section id="history" className="border-b border-border py-8" aria-labelledby="history-title">
          <h2 id="history-title" className="text-2xl font-semibold text-foreground">추적: Dump→Note→Sources→후보표→실험</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            각 가설이 어떤 파일을 거쳐 버려졌는지 링크로 따라갈 수 있습니다. 원천 덤프(<code>gathering/raw/</code>)는 깃에 올리지 않아 직접 링크하지 않고, 한 장 노트가 간접 참조만 남깁니다.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <li className="rounded-md border border-border px-4 py-4">
              <p className="font-mono text-xs text-primary">1 · 한 줄 가설</p>
              <p className="mt-2 text-sm font-semibold text-foreground">가설 문장</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                무언가 한 종류가 WTI 변동성을 먼저 말하는지 문장으로 씁니다.
              </p>
              <a
                className="text-link mt-2 inline-block text-xs"
                href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/notes/_TEMPLATE.md#10"
                rel="noreferrer"
                target="_blank"
              >
                _TEMPLATE.md:10
              </a>
            </li>
            <li className="rounded-md border border-border px-4 py-4">
              <p className="font-mono text-xs text-primary">2 · 크립토×뉴스</p>
              <p className="mt-2 text-sm font-semibold text-foreground">둘 다 있어야 후보</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                <code>크립토의 뭐</code>와 <code>뉴스의 무슨</code>이 한 줄로 말해질 때만 <code>pizza-hunt.md</code>에 행을 만듭니다.
              </p>
              <a
                className="text-link mt-2 inline-block text-xs"
                href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/notebooks/pizza-hunt.md"
                rel="noreferrer"
                target="_blank"
              >
                pizza-hunt.md:22 비어 있음 = 증거
              </a>
            </li>
            <li className="rounded-md border border-border px-4 py-4">
              <p className="font-mono text-xs text-primary">3 · 한 장 노트</p>
              <p className="mt-2 text-sm font-semibold text-foreground">사람이 읽는 한 장</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                원문 붙여넣기가 아니라 링크+가설+리스크+다음 한 가지.
              </p>
              <a
                className="text-link mt-2 inline-block text-xs"
                href="https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/gathering/notes"
                rel="noreferrer"
                target="_blank"
              >
                gathering/notes
              </a>
            </li>
            <li className="rounded-md border border-border px-4 py-4">
              <p className="font-mono text-xs text-primary">4 · 출처 표</p>
              <p className="mt-2 text-sm font-semibold text-foreground">REGISTRY.md 한 줄</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                라이선스·지연·look-ahead를 한 줄에 적고 필요하면 상세 장을 연결합니다.
              </p>
              <a
                className="text-link mt-2 inline-block text-xs"
                href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/sources/REGISTRY.md"
                rel="noreferrer"
                target="_blank"
              >
                REGISTRY.md
              </a>
            </li>
            <li className="rounded-md border border-border px-4 py-4">
              <p className="font-mono text-xs text-primary">5 · 실험 한 장</p>
              <p className="mt-2 text-sm font-semibold text-foreground">승격만</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                체크를 통과하면 <code>docs/experiments/NNN-슬러그.md</code> 한 장. 비교군은 <code>000-oil-slice-draft</code>.
              </p>
              <a
                className="text-link mt-2 inline-block text-xs"
                href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/experiments/000-oil-slice-draft.md"
                rel="noreferrer"
                target="_blank"
              >
                000-oil-slice-draft
              </a>
            </li>
          </ol>
        </section>

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
            분포는 전체 52개, 표는 대표 6행입니다. 현재 인샘플과 아웃샘플에서 함께 재현된 관계는 없습니다. 미검증과 보류는 성과로 세지 않습니다.
          </p>
        </section>

        <section id="ledger" className="border-b border-border py-8" aria-labelledby="ledger-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="ledger-title" className="text-2xl font-semibold text-foreground">대표 검증 기록</h2>
              <p className="mt-2 text-sm text-muted-foreground">전체 {CANDIDATE_COUNT}개 가운데 서로 다른 실패 유형을 보여주는 대표 행입니다.</p>
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

          <div className="mt-6 grid gap-4 rounded-md border border-border px-4 py-4 sm:grid-cols-2">
            <fieldset>
              <legend className="font-mono text-xs text-muted-foreground">판정 필터</legend>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {VERDICT_ORDER.map((verdict) => (
                  <label key={verdict} className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={activeVerdicts.includes(verdict)}
                      onChange={() => toggleVerdict(verdict)}
                      className="size-4 accent-primary"
                    />
                    {verdict}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="ledger-search" className="font-mono text-xs text-muted-foreground">
                가설·데이터 검색
              </label>
              <input
                id="ledger-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: Iran, EIA"
                className="mt-2 block min-h-[44px] w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
          </div>
          <p aria-live="polite" className="mt-3 font-mono text-xs text-muted-foreground">
            {LEDGER_ROWS.length}행 중 {visibleRows.length}행 표시
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="evidence-table evidence-table-stacked sm:min-w-[1040px]">
              <thead>
                <tr>
                  <SortableHeader label="가설" sortKeyValue="hypothesis" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <th scope="col">목표</th>
                  <th scope="col">데이터</th>
                  <SortableHeader label="IS" sortKeyValue="inSample" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortableHeader label="OOS" sortKeyValue="outSample" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortableHeader label="판정" sortKeyValue="verdict" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <th scope="col">상세</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length > 0 ? visibleRows.map((row) => {
                  const detailId = detailIdFor(row.hypothesis);
                  const expanded = expandedHypothesis === row.hypothesis;
                  return (
                    <Fragment key={row.hypothesis}>
                      <tr>
                        <th scope="row">{row.hypothesis}</th>
                        <td data-label="목표">{row.target}</td>
                        <td data-label="데이터">{row.data}</td>
                        <td data-label="IS" className="font-mono">{row.inSample}</td>
                        <td data-label="OOS" className="font-mono">{row.outSample}</td>
                        <td data-label="판정">
                          <span className={row.verdict === "보류" ? "text-primary" : "text-muted-foreground"}>{row.verdict}</span>
                          {row.verdict === "보류" ? (
                            <Badge variant="outline" className="ml-2">연구 후보·예시</Badge>
                          ) : null}
                          <span className="mt-1 block text-xs text-muted-foreground">{row.reason}</span>
                        </td>
                        <td data-label="상세">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-controls={detailId}
                            aria-label={`${row.hypothesis} 상세 ${expanded ? "닫기" : "보기"}`}
                            onClick={() => toggleDetail(row.hypothesis)}
                            className="inline-flex min-h-[44px] items-center gap-1 px-2 font-mono text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            {expanded ? "닫기" : "상세"}
                          </button>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr>
                          <td colSpan={7} data-label="상세">
                            <LedgerDetail row={row} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      조건에 맞는 행이 없습니다.
                    </td>
                  </tr>
                )}
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
            2024–2026 구간은 이미 확인에 썼으므로 앞으로의 검증에는 새로 쌓이는 미래 구간만 씁니다.
            다음 후보도 규칙을 먼저 동결한 뒤에 평가합니다.
          </p>
          <section id="sources" className="mt-8 rounded-md border border-border bg-muted/20 px-5 py-5" aria-labelledby="sources-title">
            <h3 id="sources-title" className="text-base font-semibold text-foreground">출처: 한 줄에 적고 링크로 증명</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Investing.com은 사이트를 긁지 않고 CSV로만 받습니다. Yahoo <code>CL=F</code>만 프로그램으로 받습니다. 각 출처의 라이선스·지연·look-ahead는 아래 등록부에 한 줄로 적혀 있습니다.
            </p>
            <ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <li>
                <a
                  className="text-link"
                  href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/sources/REGISTRY.md"
                  rel="noreferrer"
                  target="_blank"
                >
                  REGISTRY.md — 30+ 출처 표
                </a>
                <span className="ml-2 text-muted-foreground">라이선스·지연·look-ahead</span>
              </li>
              <li>
                <a
                  className="text-link"
                  href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/research-design.md#36"
                  rel="noreferrer"
                  target="_blank"
                >
                  research-design.md — 뉴스 정본
                </a>
                <span className="ml-2 text-muted-foreground">Investing CSV만</span>
              </li>
              <li>
                <a
                  className="text-link"
                  href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/sources/_TEMPLATE.md"
                  rel="noreferrer"
                  target="_blank"
                >
                  _TEMPLATE.md — 상세 장
                </a>
                <span className="ml-2 text-muted-foreground">필요한 출처만</span>
              </li>
              <li>
                <a
                  className="text-link"
                  href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/src/ls_crude/config.py#L5"
                  rel="noreferrer"
                  target="_blank"
                >
                  config.py:5 — CL=F 고정
                </a>
                <span className="ml-2 text-muted-foreground">Yahoo 전용</span>
              </li>
            </ul>
          </section>
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
