import { useMemo, useState, type ReactNode } from "react";

import { ExperimentResults } from "~/components/cai/experiment-results";
import { deltaLogLossVsMarket, type ExperimentSummary, type SampleExpansion } from "~/lib/experiment-summary";
import bundledWorkflowJson from "../../data/research-workflow.json";

/** 후보 수집 가능성 분류. 정본 JSON category와 같다. */
export type ResearchWorkflowCategory = "used" | "context" | "forward" | "sample" | "route" | "hold";

/** 후보 자료의 분류와 별개인 담당·실행 상태. 제안은 수락을 뜻하지 않는다. */
export interface CandidateWork {
  owner: "taehwan" | "seongchan" | null;
  assignment: "unassigned" | "proposed" | "confirmed";
  status: "planned" | "in_progress" | "review" | "done" | "blocked";
  collection: string;
  processing: string;
  blocker: string;
}

/** 실제 작업 상태의 화면 표기. */
export const WORK_STATUS_LABELS = { planned: "예정", in_progress: "진행 중", review: "검토 요청", done: "완료", blocked: "차단" };
/** 담당자의 화면 이름. */
const OWNER_LABELS = { taehwan: "태환", seongchan: "성찬" };

/** 자료 폴더 한 건. 독립 가설 수가 아니다. */
export interface ResearchWorkflowIdea {
  id: string;
  title: string;
  path: string;
  url: string;
}

/** 쿠싱 후보 한 건. 106개 폴더의 단순 부분 집합이 아니다. */
export interface ResearchWorkflowCandidate {
  id: string;
  name: string;
  role: string;
  category: ResearchWorkflowCategory;
  summary: string;
  period: string;
  nextAction: string;
  sourceUrls: string[];
  work?: CandidateWork;
}

/** 연구 워크플로 스냅샷. 값은 JSON 정본만 쓴다. */
export interface ResearchWorkflowData {
  schema: string;
  snapshotDate: string;
  sourceRef: string;
  sourceSha256: string;
  workUpdatedAt?: string;
  ideas: ResearchWorkflowIdea[];
  candidates: ResearchWorkflowCandidate[];
}

/** 분류를 화면에서 쓰는 쉬운 이름. */
export const CATEGORY_LABELS: Record<ResearchWorkflowCategory, string> = {
  used: "실험에 사용",
  context: "배경 자료",
  forward: "앞으로 기록",
  sample: "표본만 확보",
  route: "경로만 확인",
  hold: "보류·기각",
};

/** 분류 표시 순서. 연구 진행 방향과 같다. */
export const CATEGORY_ORDER: readonly ResearchWorkflowCategory[] = [
  "used",
  "context",
  "forward",
  "sample",
  "route",
  "hold",
];

/** 여섯 단계의 이름. 실제 연구 순서다. */
export const WORKFLOW_STEPS = [
  { name: "아이디어 정리", short: "아이디어", purpose: "유가와 연결될 만한 활동과 자료를 폭넓게 찾습니다.", next: "어떤 활동을 측정할지 살펴보고 쿠싱 관련 후보를 고릅니다." },
  { name: "쿠싱 후보 선별", short: "쿠싱 선별", purpose: "쿠싱과 관련 있고 측정할 이유가 있는 후보를 추립니다.", next: "후보별 담당을 정하고 실제 자료를 구할 수 있는지 확인합니다." },
  { name: "수집 가능성 확인·수집", short: "자료 수집", purpose: "실제 수치와 필요한 기간이 있는지 확인하고 원자료를 확보합니다.", next: "확보한 자료는 전처리로 넘기고, 막힌 후보는 이유와 재개 조건을 남깁니다." },
  { name: "전처리·입력 준비", short: "입력 준비", purpose: "날짜·단위·중복·결측을 정리해 프로그램이 읽는 입력을 만듭니다.", next: "입력 검사를 통과한 자료로 공통 설정의 실험을 실행합니다." },
  { name: "지수 구성·학습·평가", short: "학습·평가", purpose: "자료를 조합한 지수를 만들고 시장정보 기준선과 같은 조건으로 비교합니다.", next: "담당자별 결과 묶음을 제출하고 비교 가능한 조건인지 검토합니다." },
  { name: "결과 확정·대시보드 연결", short: "결과 연결", purpose: "검토한 결과와 한계를 확정하고 같은 버전을 화면에 연결합니다.", next: "검토된 결과만 반영합니다. 현재 지수·미래 확률은 별도 준비 조건을 확인합니다." },
] as const;

/** 목차와 단계 제목이 공유하는 이름. */
export const WORKFLOW_STEP_NAMES = WORKFLOW_STEPS.map((step) => step.name);

/** 허용된 category 값. */
const CATEGORY_SET = new Set<string>(CATEGORY_ORDER);

/**
 * 객체가 레코드인지 확인한다.
 * @param value 검사할 값.
 * @returns 레코드이면 true.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 비어 있지 않은 문자열인지 확인한다.
 * @param value 검사할 값.
 * @returns 문자열이면 true.
 */
function isText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * 자료 폴더 한 행을 확인한다.
 * @param value JSON 행.
 * @returns 유효하면 행, 아니면 null.
 */
function parseIdea(value: unknown): ResearchWorkflowIdea | null {
  if (!isRecord(value)) return null;
  if (!isText(value.id) || !isText(value.title) || !isText(value.path) || typeof value.url !== "string") return null;
  return { id: value.id, title: value.title, path: value.path, url: value.url };
}

/**
 * 후보 한 행을 확인한다.
 * @param value JSON 행.
 * @returns 유효하면 행, 아니면 null.
 */
function parseCandidate(value: unknown): ResearchWorkflowCandidate | null {
  if (!isRecord(value)) return null;
  const category = value.category;
  if (!isText(category) || !CATEGORY_SET.has(category)) return null;
  if (!isText(value.id) || !isText(value.name) || !isText(value.role)) return null;
  if (typeof value.summary !== "string" || typeof value.period !== "string" || typeof value.nextAction !== "string") return null;
  if (!Array.isArray(value.sourceUrls) || !value.sourceUrls.every((item) => typeof item === "string")) return null;
  const work = value.work;
  if (work !== undefined) {
    if (!isRecord(work) || (work.owner !== null && work.owner !== "taehwan" && work.owner !== "seongchan")) return null;
    if (typeof work.assignment !== "string" || !["unassigned", "proposed", "confirmed"].includes(work.assignment)) return null;
    if (typeof work.status !== "string" || !Object.hasOwn(WORK_STATUS_LABELS, work.status)) return null;
    if (typeof work.collection !== "string" || typeof work.processing !== "string" || typeof work.blocker !== "string") return null;
    if ((work.owner === null) !== (work.assignment === "unassigned")) return null;
    if (work.status === "in_progress" && work.assignment !== "confirmed") return null;
  }
  return {
    id: value.id,
    name: value.name,
    role: value.role,
    category: category as ResearchWorkflowCategory,
    summary: value.summary,
    period: value.period,
    nextAction: value.nextAction,
    sourceUrls: value.sourceUrls.filter((item) => item.length > 0),
    ...(work === undefined ? {} : { work: { owner: work.owner, assignment: work.assignment, status: work.status, collection: work.collection, processing: work.processing, blocker: work.blocker } as CandidateWork }),
  };
}

/**
 * 연구 워크플로 JSON을 표시용으로 확인한다. 값을 만들지 않는다.
 * @param input JSON.parse 결과 또는 모듈 기본값.
 * @returns 유효하면 스냅샷, 아니면 null.
 */
export function parseResearchWorkflow(input: unknown): ResearchWorkflowData | null {
  if (!isRecord(input)) return null;
  if (!isText(input.schema) || !isText(input.snapshotDate) || !isText(input.sourceRef) || !isText(input.sourceSha256)) {
    return null;
  }
  if (!Array.isArray(input.ideas) || !Array.isArray(input.candidates)) return null;
  if (input.workUpdatedAt !== undefined && (typeof input.workUpdatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.workUpdatedAt))) return null;
  const ideas: ResearchWorkflowIdea[] = [];
  for (const row of input.ideas) {
    const idea = parseIdea(row);
    if (idea === null) return null;
    ideas.push(idea);
  }
  const candidates: ResearchWorkflowCandidate[] = [];
  for (const row of input.candidates) {
    const candidate = parseCandidate(row);
    if (candidate === null) return null;
    candidates.push(candidate);
  }
  if (new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length) return null;
  return {
    schema: input.schema,
    snapshotDate: input.snapshotDate,
    sourceRef: input.sourceRef,
    sourceSha256: input.sourceSha256,
    ...(input.workUpdatedAt === undefined ? {} : { workUpdatedAt: input.workUpdatedAt as string }),
    ideas,
    candidates,
  };
}

/** 화면에 쓰는 번들 스냅샷. 형식이 다르면 null. */
export const bundledResearchWorkflow = parseResearchWorkflow(bundledWorkflowJson);

/**
 * 분류별 건수를 센다.
 * @param candidates 후보 배열.
 * @returns 분류 → 건수.
 */
export function countByCategory(candidates: readonly ResearchWorkflowCandidate[]): Record<ResearchWorkflowCategory, number> {
  const counts = { used: 0, context: 0, forward: 0, sample: 0, route: 0, hold: 0 };
  for (const candidate of candidates) counts[candidate.category] += 1;
  return counts;
}

/**
 * 시장+CAI가 시장정보보다 확률오차를 줄였는지 본다. JSON 차이만 읽는다.
 * @param summary 실험 요약.
 * @returns 한 실험에서라도 개선이면 true, 아니면 false.
 */
function caiImprovedOnMarket(summary: ExperimentSummary): boolean {
  return summary.experiments.some((experiment) =>
    experiment.models.some((model) => {
      if (!model.id.startsWith("market_cai_")) return false;
      const delta = deltaLogLossVsMarket(experiment, model.id);
      return delta !== null && delta < 0;
    }),
  );
}

/**
 * 출처 문자열이 링크인지 본다.
 * @param value 출처.
 * @returns http(s)이면 true.
 */
function isHttpUrl(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("http://");
}

/**
 * 단계 본문의 공통 틀. 제목 → 작은 상태 → 결과 → 다음 할 일 → 상세 버튼 순이다.
 * @param props 번호·이름·상태·결과·다음 할 일·현재 위치 여부와 접힌 근거.
 * @returns 한 단계 블록.
 */
function StageBlock({
  step,
  status,
  result,
  evidence,
}: {
  step: number;
  status: string;
  result: string;
  evidence: ReactNode;
}) {
  const definition = WORKFLOW_STEPS[step - 1];
  return (
    <article
      id={`workflow-stage-${step}`}
      data-workflow-stage={step}
      aria-labelledby={`workflow-heading-${step}`}
      className="workflow-card"
    >
      <header className="workflow-card-header">
        <span className="workflow-number" aria-hidden="true">{String(step).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1"><p className="workflow-eyebrow">STEP {step} / 6</p><h2 id={`workflow-heading-${step}`} className="workflow-card-title">{definition.name}</h2><p className="workflow-purpose">{definition.purpose}</p></div>
        <span className="workflow-fact">{status}</span>
      </header>
      <div className="workflow-card-body">
        <p className="workflow-result-label">현재 확인된 결과</p>
        <p className="mt-2 max-w-3xl text-base leading-7">{result}</p>
        <p className="workflow-next"><span>다음</span>{definition.next}</p>
        {evidence}
      </div>
    </article>
  );
}

/**
 * 자료 폴더 목록. 검색은 표시만 줄이고 원본 배열은 바꾸지 않는다.
 * @param props 아이디어 배열.
 * @returns 검색과 목록.
 */
function IdeaList({ ideas }: { ideas: readonly ResearchWorkflowIdea[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase("ko");
  const visible = needle
    ? ideas.filter((idea) => `${idea.id} ${idea.title} ${idea.path}`.toLocaleLowerCase("ko").includes(needle))
    : ideas;
  return (
    <div>
      <label htmlFor="workflow-idea-search" className="mb-2 block text-sm">
        자료 폴더 제목·경로 검색
      </label>
      <input
        id="workflow-idea-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="예: 쿠싱, 교통, DMR"
        className="min-h-12 w-full rounded-sm border border-border bg-background p-3 text-sm"
      />
      <p role="status" className="mt-3 text-sm text-muted-foreground">
        {ideas.length}개 중 {visible.length}개 표시
      </p>
      <ul data-workflow-ideas className="mt-4 max-h-[32rem] overflow-y-auto divide-y divide-border border-y border-border">
        {visible.map((idea) => (
          <li key={idea.path} data-idea={idea.id} data-idea-path={idea.path} className="py-3 text-sm">
            <p className="text-foreground">{idea.title}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{idea.path}</p>
            {idea.url ? (
              <a className="source-link mt-1" href={idea.url} target="_blank" rel="noreferrer">
                자료 열람
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 단계 2·3이 공유하는 후보 표. 한 번만 그린다.
 * @param props 후보 배열.
 * @returns 분류 필터와 표.
 */
function CandidateTable({ candidates }: { candidates: readonly ResearchWorkflowCandidate[] }) {
  const [filter, setFilter] = useState<"all" | ResearchWorkflowCategory>("all");
  const counts = useMemo(() => countByCategory(candidates), [candidates]);
  const rows = filter === "all" ? candidates : candidates.filter((candidate) => candidate.category === filter);
  return (
    <div>
      <fieldset>
        <legend className="mb-2 text-sm">수집 가능성 분류</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="filter-button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            전체 <span className="font-mono">{candidates.length}</span>
          </button>
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              className="filter-button"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {CATEGORY_LABELS[category]} <span className="font-mono">{counts[category]}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        자료 분류와 실제 작업 상태는 별개입니다. 담당 제안은 수락 전이며, 표본 확보를 진행 중으로 표시하지 않습니다. 앞으로 기록할 항목과 보류·기각은 이번 입력에서 분리합니다.
      </p>
      <div className="mt-4 max-h-[36rem] overflow-auto" role="region" aria-label="33개 후보 상태표, 가로와 세로로 스크롤" tabIndex={0}>
        <table data-workflow-candidates className="w-full min-w-[58rem] border-collapse text-sm">
          <caption className="sr-only">쿠싱 후보의 자료 분류·담당 제안·수집과 전처리 상태</caption>
          <thead className="sticky top-0 bg-background">
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3">후보</th>
              <th scope="col" className="py-2 pr-3">자료 분류·근거</th>
              <th scope="col" className="py-2 pr-3">담당·작업 상태</th>
              <th scope="col" className="py-2 pr-3">수집·전처리</th>
              <th scope="col" className="py-2">다음 할 일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((candidate) => (
              <tr
                key={candidate.id}
                data-candidate={candidate.id}
                data-candidate-category={candidate.category}
                className="border-b border-border/60 align-top"
              >
                <td className="py-2 pr-3">
                  <p><span className="font-mono text-primary">{candidates.indexOf(candidate) + 1}.</span> {candidate.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{candidate.id}</p>
                  {candidate.sourceUrls.length === 0 ? null : (
                    <p className="mt-1 flex flex-wrap gap-x-3">
                      {candidate.sourceUrls.map((url) => (
                        <a key={url} className="source-link" href={url} target="_blank" rel="noreferrer">
                          근거
                        </a>
                      ))}
                    </p>
                  )}
                </td>
                <td className="py-2 pr-3"><p>{CATEGORY_LABELS[candidate.category]}</p><details className="mt-2 max-w-xs"><summary className="min-h-11 text-xs">측정·기간 보기<span className="sr-only"> — {candidate.name}</span></summary><p className="mt-2 text-xs leading-6 text-muted-foreground">{candidate.role}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">{candidate.summary}</p><p className="mt-2 text-xs leading-6">{candidate.period}</p></details></td>
                <td className="py-2 pr-3 whitespace-nowrap"><p>{candidate.work?.owner ? OWNER_LABELS[candidate.work.owner] : "담당 미정"}{candidate.work?.assignment === "proposed" ? " · 제안" : ""}</p><p className="mt-2 text-xs text-muted-foreground">{candidate.work ? WORK_STATUS_LABELS[candidate.work.status] : "작업 상태 미확인"}</p></td>
                <td className="py-2 pr-3"><p>수집: {candidate.work?.collection ?? "미확인"}</p><p className="mt-2 text-xs text-muted-foreground">전처리: {candidate.work?.processing ?? "미확인"}</p></td>
                <td className="max-w-xs py-2"><p>{candidate.nextAction}</p>{candidate.work?.blocker ? <p className="mt-2 text-xs leading-6 text-muted-foreground">조건: {candidate.work.blocker}</p> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 실험 표시 이름을 짧게 만든다. 값은 요약 라벨에서만 온다.
 * @param label 실험 라벨.
 * @returns 쉬운 이름.
 */
function easyExperimentName(label: string): string {
  return label.replace(/\s*파일럿$/u, "").replaceAll("DMR", "유량");
}

/**
 * 단계 5의 쉬운 비교 문장. 지표 표를 다시 그리지 않는다.
 * @param summary 실험 요약.
 * @returns 두 조합과 평가 일수 설명.
 */
function comparisonCopy(summary: ExperimentSummary): { result: string } {
  const representative = summary.sample_expansion;
  if (representative?.models?.length) {
    return { result: `대표 사례는 2019년 교통자료를 보강한 교통+유량 실험입니다. 학습 ${representative.after_train_rows}행과 평가 ${representative.eval.n}행을 사용했습니다.` };
  }
  const first = summary.experiments[0];
  const evalN = first?.eval.n;
  const year = first?.eval.start.slice(0, 4);
  const sameEval = first !== undefined && summary.experiments.every(
    (experiment) =>
      experiment.eval.n === first.eval.n &&
      experiment.eval.start === first.eval.start &&
      experiment.eval.end === first.eval.end,
  );
  const names = summary.experiments.map((experiment) => easyExperimentName(experiment.label));
  const combo =
    names.length === 2 ? `${names[0]}과 ${names[1]} 두 조합을` : `파일럿 ${summary.experiments.length}건을`;
  const range =
    evalN === undefined || year === undefined
      ? "평가 구간은 미확인입니다"
      : sameEval
        ? `${year}년의 같은 ${evalN}일을 기준으로 비교했습니다`
        : `${year}년 평가 ${evalN}일을 기준으로 비교했습니다`;
  return {
    result: `${combo} ${range}. 최종 성분 선정에 앞서 진행한 첫 비교입니다.`,
  };
}

/**
 * 기존 요약의 보강 실험에서 시장정보에 CAI를 추가한 비교만 앞에 보여준다.
 * @param props 이미 공개된 표본 보강 요약.
 * @returns 대표 결과표. 모든 수치는 기존 모델 지표에서 계산한다.
 */
function RepresentativeComparison({ block }: { block: SampleExpansion }) {
  const market = block.models.find((model) => model.id === "market");
  if (!market || !Number.isFinite(market.after.log_loss)) return null;
  const ids = ["baseline", "market", "market_cai_equal", "market_cai_learned"];
  const rows = ids.flatMap((id) => block.models.filter((model) => model.id === id));
  return <div data-representative-comparison className="mt-4">
    <p className="text-sm leading-7 text-muted-foreground">{block.eval.start}–{block.eval.end}의 같은 평가 표본입니다. 가장 최근 완료한 입력 보강을 대표로 설명하며, 좋은 성과를 골라낸 것이 아닙니다.</p>
    <div className="mt-3 overflow-x-auto" role="region" aria-label="대표 실험 결과, 작은 화면에서는 가로로 스크롤" tabIndex={0}>
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <caption className="sr-only">교통+유량 2019 보강 대표 비교</caption>
        <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th scope="col" className="py-3 pr-4">모델</th><th scope="col" className="py-3 pr-4">확률오차 · log loss ↓</th><th scope="col" className="py-3">CAI 추가 차이</th></tr></thead>
        <tbody>{rows.map((row) => {
          const valid = Number.isFinite(row.after.log_loss);
          const delta = row.after.log_loss - market.after.log_loss;
          return <tr key={row.id} data-representative-model={row.id} className="border-b border-border/60"><th scope="row" className="py-3 pr-4 text-left font-normal">{row.label}</th><td className="py-3 pr-4 font-mono">{valid ? row.after.log_loss.toFixed(6) : "—"}</td><td className="py-3 font-mono">{valid && row.id.startsWith("market_cai") ? `${delta >= 0 ? "+" : ""}${delta.toFixed(6)}` : "—"}</td></tr>;
        })}</tbody>
      </table>
    </div>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">확률오차는 낮을수록 좋습니다. 추가 차이 = 시장정보+CAI − 시장정보만. 양수는 악화입니다. 단순 상승률 기준선과도 함께 비교합니다.</p>
  </div>;
}

/**
 * 단계 6의 공유 문장. 재현 상태와 표본은 요약 값만 쓴다.
 * @param summary 실험 요약.
 * @param improved 파일럿 조합에서 시장 대비 개선이 있었는지.
 * @returns 상태·결과·다음 할 일.
 */
function shareCopy(
  summary: ExperimentSummary,
  improved: boolean,
): { result: string; detail: string } {
  const reproduction = summary.review_status.independent_reproduction;
  const pending = reproduction === "pending";
  const evalN = summary.experiments[0]?.eval.n ?? summary.sample_expansion?.eval.n;
  const trainAfter = summary.sample_expansion?.after_train_rows;
  const trainBefore = summary.sample_expansion?.before_train_rows;
  const evalBit = evalN === undefined ? "평가 일수는 미확인입니다." : `평가 ${evalN}일입니다.`;
  const expansion = summary.sample_expansion;
  const expansionMarket = expansion?.models?.find((row) => row.id === "market");
  const additions = expansion?.models?.filter((row) => row.id === "market_cai_equal" || row.id === "market_cai_learned");
  const representativeImproved = expansionMarket && additions?.length === 2
    ? additions.some((row) => row.after.log_loss < expansionMarket.after.log_loss)
    : improved;
  const pilotBit = representativeImproved
    ? "이번 조합에서 CAI를 추가했을 때 확률오차가 줄어든 비교가 있습니다."
    : "이번 조합에서는 CAI를 추가해도 확률오차가 줄지 않았습니다.";
  const expansionBit =
    trainAfter === undefined
      ? ""
      : ` 2019년 자료를 보강해 전체 학습 표본은 ${trainBefore === undefined ? "" : `${trainBefore}→`}${trainAfter}행으로 늘었습니다. ${summary.sample_expansion?.eval_identical ? "평가 구간은 같습니다." : "평가 구간은 상세 표에서 확인할 수 있습니다."}`;
  const reproBit = pending
    ? " 성찬님의 독립 재현은 아직 확인되지 않았습니다."
    : ` 독립 재현 상태는 ${reproduction}입니다.`;
  return {
    result: `${pilotBit}${reproBit}`,
    detail: `${evalBit}${expansionBit} 공식 CAI와 미래 예측은 성분·산식·검증을 마친 뒤 연결합니다.`,
  };
}

/**
 * 단계별 결과 본문. 제목·현재 위치·목차와 여섯 단계를 한 흐름으로 그린다.
 * @param props 워크플로 스냅샷과 실험 요약. 없으면 미확인이며 완료를 만들지 않는다.
 * @returns #current 연구 진행 화면.
 */
export function ResearchWorkflow({
  workflow = bundledResearchWorkflow,
  experiments: rawExperiments,
}: {
  workflow?: ResearchWorkflowData | null;
  experiments: ExperimentSummary | null;
}) {
  const experiments = rawExperiments?.experiments.length ? rawExperiments : null;
  const ideaCount = workflow?.ideas.length ?? null;
  const candidateCount = workflow?.candidates.length ?? null;
  const counts = workflow ? countByCategory(workflow.candidates) : null;
  const comparison = experiments === null ? null : comparisonCopy(experiments);
  const improved = experiments === null ? null : caiImprovedOnMarket(experiments);
  const share = experiments === null || improved === null ? null : shareCopy(experiments, improved);
  const firstEval = experiments?.experiments[0]?.eval;
  const position =
    workflow === null
      ? "자료 목록을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요."
      : "아이디어를 고르고, 자료를 모으고, 결과를 비교한 과정을 6단계로 정리했습니다. 먼저 준비된 교통·유량 자료로 첫 실험을 진행했습니다.";

  return (
    <section id="current" data-research-workflow aria-labelledby="workflow-title" className="pt-8 sm:pt-10">
      <header className="border-b border-border pb-6 sm:pb-8">
        <h1 id="workflow-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          쿠싱의 활동에서 유가의 단서 찾기
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{position}</p>
        {workflow === null ? null : (
          <p className="mt-2 max-w-3xl text-xs leading-6 text-muted-foreground">
            자료 기준 {workflow.snapshotDate}{workflow.workUpdatedAt ? ` · 작업 제안 ${workflow.workUpdatedAt}` : ""}
          </p>
        )}
        <p className="workflow-focus">이번 공동 작업의 중심은 <strong>3 자료 수집 → 4 입력 준비 → 5 학습·평가</strong>입니다. 후보마다 도달한 단계는 다릅니다.</p>
        <nav aria-label="연구 6단계" className="mt-6">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {WORKFLOW_STEPS.map((definition, index) => {
              const step = index + 1;
              return (
                <li key={definition.name}>
                  <a
                    className="workflow-step-link"
                    href={`#workflow-stage-${step}`}
                  >
                    <span>{String(step).padStart(2, "0")}</span>
                    {definition.short}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="mt-5 flex flex-wrap gap-5 text-sm">
          <a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/cai/TEAM_START_HERE.md" target="_blank" rel="noreferrer">공동 작업 시작 안내 ↗</a>
          <a className="source-link" href="#past">이전 조사와 상세 기록 보기</a>
          {import.meta.env?.DEV ? <a className="source-link" href="#local-status">개발 작업 현황</a> : null}
        </div>
      </header>

      <StageBlock
        step={1}
        status={workflow ? "목록 정리" : "자료 미확인"}
        result={
          ideaCount === null
            ? "자료 폴더 목록을 불러오지 못했습니다."
            : `자료 폴더 ${ideaCount}개를 모았습니다. 이 숫자는 독립 가설 수가 아닙니다.`
        }
        evidence={
          workflow === null ? (
            <p data-workflow-missing="ideas" className="mt-4 text-sm text-muted-foreground">
              목록을 표시할 자료가 없습니다.
            </p>
          ) : (
            <details className="mt-4 border-y border-border py-2">
              <summary className="min-h-11 cursor-pointer py-3 text-sm">전체 아이디어 보기</summary>
              <div className="pb-4">
                <div data-workflow-source className="mb-4 space-y-1 text-sm leading-7 text-muted-foreground">
                  <p>기준일 {workflow.snapshotDate}</p>
                  {isHttpUrl(workflow.sourceRef) ? (
                    <p>
                      <a className="source-link" href={workflow.sourceRef}>출처</a>
                    </p>
                  ) : (
                    <p className="text-xs">자료 버전 <abbr className="font-mono no-underline" title={workflow.sourceRef}>{workflow.sourceRef.slice(0, 7)}</abbr></p>
                  )}
                </div>
                <IdeaList ideas={workflow.ideas} />
              </div>
            </details>
          )
        }
      />

      <StageBlock
        step={2}
        status={workflow ? "후보 정리" : "자료 미확인"}
        result={
          candidateCount === null
            ? "후보 목록을 불러오지 못했습니다."
            : `쿠싱과 관련된 후보와 보조 자료 ${candidateCount}개 항목을 정리했습니다.`
        }
        evidence={
          workflow === null ? (
            <p data-workflow-missing="candidates" className="mt-4 text-sm text-muted-foreground">
              후보 표를 표시할 자료가 없습니다.
            </p>
          ) : (
            <p className="mt-4 text-sm">
              <a className="source-link" href="#workflow-candidates">
                쿠싱 후보 보기
              </a>
            </p>
          )
        }
      />

      <StageBlock
        step={3}
        status={counts ? `회고 실험 사용 ${counts.used}개` : "자료 미확인"}
        result={
          counts === null
            ? "수집 상태를 불러오지 못했습니다."
            : `실험에 사용한 자료는 ${counts.used}개입니다. 다른 후보는 자료와 과거 이력을 얼마나 확보했는지에 따라 나눴습니다.`
        }
        evidence={
          workflow === null ? (
            <p className="mt-4 text-sm text-muted-foreground">분류 표를 표시할 자료가 없습니다.</p>
          ) : (
            <>
              <details id="workflow-candidates" className="mt-4 border-y border-border py-2">
                <summary className="min-h-11 cursor-pointer py-3 text-sm">수집 상태 보기</summary>
                <div className="pb-4">
                  <CandidateTable candidates={workflow.candidates} />
                </div>
              </details>
            </>
          )
        }
      />

      <StageBlock
        step={4}
        status={counts ? `회고 입력 ${counts.used}개` : "자료 미확인"}
        result={
          experiments === null
            ? "실험 입력 요약을 불러오지 못했습니다."
            : "교통량과 하수처리장 신고 유량을 실험에 쓸 수 있도록 정리했습니다. 날짜·단위·결측치를 확인한 입력입니다."
        }
        evidence={
          <details className="mt-4 border-y border-border py-2">
            <summary className="min-h-11 cursor-pointer py-3 text-sm">실험 입력 보기</summary>
            <div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground">
              <p>교통은 쿠싱 인근 도로의 전체 차량 수이며 원유 트럭만 센 값이 아닙니다. 유량은 South STP 한 시설의 월별 신고값이며 원유 펌핑량이나 도시 전체 용수 사용량이 아닙니다.</p>
              <p>최초 교통 단독 실험은 공유된 교통량 입력을 썼고, 그다음 2019년분 교통량을 추가해 다시 비교했습니다. 두 입력은 별도로 보관합니다.</p>
              <p>
                하수처리장 신고 유량의 이용 가능일은 접수일을 기준으로 가정한 값입니다. 접수일을 실제 최초 공개일로 볼 수는 없습니다. 실제 공개일은 확인되지 않았습니다.
              </p>
              <p>traffic_avc040_daily_2019plus — 일별 통행량, 열 date·value. 2019년분 추가.</p>
              <p>dmr_ok0026701_001_mgd — 월별 시설 유량(MGD), 열 date·value·available_at(접수일 기반 가용일, 실제 공개일 미확인).</p>
              <p>결측 날짜는 0으로 채우지 않습니다.</p>
              {firstEval === undefined ? (
                <p>평가 기간은 실험 요약을 읽지 못해 미확인입니다.</p>
              ) : (
                <p>
                  파일럿 평가 기간 {firstEval.start}–{firstEval.end} · 표본 {firstEval.n}개. 구성 자료는{" "}
                  {experiments?.experiments.map((experiment) => experiment.label).join(" · ")}.
                </p>
              )}
            </div>
          </details>
        }
      />

      <StageBlock
        step={5}
        status={experiments ? "대표 실험 확인" : "결과 미확인"}
        result={
          comparison?.result ??
          "모델 비교 결과를 불러오지 못했습니다."
        }
        evidence={
          experiments === null ? (
            <p data-workflow-missing="experiments" className="mt-4 text-sm text-muted-foreground">
              비교 근거가 없습니다.
            </p>
          ) : (
            <div>
            {experiments.sample_expansion?.models?.length ? <RepresentativeComparison block={experiments.sample_expansion} /> : null}
            <details className="mt-4 border-y border-border py-2">
              <summary className="min-h-11 cursor-pointer py-3 text-sm">비교 방법 보기</summary>
              <div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground">
                <p>성분 점수는 학습 구간의 평균·표준편차로 표준화하고 ±3 범위를 0–100으로 옮긴 상대값입니다. 시설 가동률이나 유가 상승 확률이 아닙니다.</p>
                <p>동일가중 CAI는 교통·유량 점수의 평균입니다. 학습가중 CAI는 학습 구간의 WTI 정답을 사용한 조합이며, 실제 활동을 더 정확히 측정한다는 보증이 아닙니다.</p>
                <p>실제 고정 설정은 2020년까지 학습, 2021–2023년 평가 후보입니다. 자료와 정답이 함께 있는 공통 평가 표본은 2023년에 남았습니다. 시장정보는 RSI14·5일 수익률입니다.</p>
                <p>학습가중치는 CAI 단독 목적함수로 구합니다. 시장정보와 공동으로 최적화한 가중치는 아닙니다. 5거래일 정답 창이 겹치므로 평가 행은 독립 시행 수가 아닙니다.</p>
              </div>
              <ul className="list-disc space-y-1 pb-4 pl-5 text-sm leading-7 text-muted-foreground">
                {experiments.experiments.map((experiment) => (
                  <li key={experiment.id} data-workflow-pilot={experiment.id}>
                    {experiment.label} · 표본 {experiment.eval.n} · {experiment.eval.start}–{experiment.eval.end} ·{" "}
                    {experiment.models.map((model) => model.label).join(" · ")}
                  </li>
                ))}
              </ul>
            </details>
            <details id="team-work" className="mt-3 border-y border-border py-2">
              <summary className="min-h-11 cursor-pointer py-3 text-sm">공동 작업·재현 안내</summary>
              <div className="space-y-5 pb-5 text-sm leading-7">
                <p>대표 보강 실험의 입력 생성부터 지표·가중치·예측 대조까지 안내를 연결했습니다. 같은 환경의 재현과 성찬님의 독립 재현은 구분합니다. 다음 분담은 성찬님과 공유할 작업안입니다.</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><h3 className="font-semibold">태환 · 입력과 기준선</h3><p className="mt-2 text-muted-foreground">자료 수집·전처리·입력 버전을 정리하고 시장정보와 동일 가중치 기준 결과를 준비합니다. 결과를 화면에 연결합니다.</p></div>
                  <div><h3 className="font-semibold">성찬 · 재현과 모델 비교</h3><p className="mt-2 text-muted-foreground">같은 입력으로 결과를 재현합니다. 측정 의미와 시점을 검토하고 학습 가중치·모델 비교에서 바꿀 조건을 함께 정합니다.</p></div>
                </div>
                <p className="text-muted-foreground">33개 모두 수집 준비가 끝난 것은 아닙니다. 새 후보는 자료의 지역·기간·접근 조건부터 확인합니다.</p>
                <a className="source-link" href="/cai-team-workflow.md" download>성찬님 공유용 작업 가이드 받기</a>
                <a className="source-link sm:ml-5" href="/cai-research-brief.html" download>연구 요약 받기 · 오프라인</a>
              </div>
            </details>
            </div>
          )
        }
      />

      <StageBlock
        step={6}
        status={experiments ? "회고 결과 연결" : "결과 미확인"}
        result={
          share?.result ??
          "회고 실험 결과를 불러오지 못했습니다."
        }
        evidence={
          <details id="workflow-experiments" className="mt-4 border-y border-border py-2">
            <summary className="min-h-11 cursor-pointer py-3 text-sm">실험 결과 자세히 보기</summary>
            <div className="pb-2">
              {share ? <p className="mb-3 text-sm leading-7 text-muted-foreground">{share.detail}</p> : null}
              <p className="mb-4 text-sm leading-7 text-muted-foreground">이 결론은 현재 교통·신고 유량 조합을 시장정보에 추가한 회고 비교에 한정됩니다. 모든 대안 데이터가 쓸모없다는 뜻은 아닙니다. 다음 판단은 측정 대표성·당시 공개시점·독립 재현부터입니다.</p>
              <p className="mb-4 text-sm leading-7 text-muted-foreground">성분·산식·최신 입력과 검증이 준비되면 공식 CAI를 대시보드에 연결합니다. <a className="source-link" href="/">대시보드 보기</a></p>
              {experiments === null ? (
                <p className="text-sm text-muted-foreground">실험 표를 표시할 요약이 없습니다.</p>
              ) : (
                <ExperimentResults mode="full" summary={experiments} />
              )}
            </div>
          </details>
        }
      />
    </section>
  );
}
