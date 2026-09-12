import { Link } from "react-router";

import {
  deltaLogLossVsMarket,
  type CommonRun,
  type ExperimentModel,
  type ExperimentRun,
  type ExperimentSummary,
  type SampleExpansion,
  type SensitivityRun,
  type SkippedRun,
} from "~/lib/experiment-summary";

/**
 * 지표 표기. 유한수가 아니면 —.
 * @param value 수치 또는 null.
 * @param digits 소수점 자릿수.
 * @returns 고정 소수 표기 또는 —.
 */
function metric(value: number | null | undefined, digits = 4): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "—";
}

/**
 * 부호 있는 차이 표기. 양수는 악화를 뜻한다.
 * @param value 차이 또는 null.
 * @param digits 소수점 자릿수.
 * @returns +/− 표기 또는 —.
 */
function signed(value: number | null, digits = 4): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

/**
 * 가중치 배열 표기. JSON에 없으면 —.
 * @param weights 가중치 배열 또는 null.
 * @returns · 로 이은 표기 또는 —.
 */
function weightsText(weights: number[] | null): string {
  return weights === null ? "—" : weights.map((value) => metric(value)).join(" · ");
}

/**
 * 모델별 log loss·accuracy·brier·가중치 표.
 * @param props 모델 행과 표 설명.
 * @returns 가로 스크롤 가능한 표.
 */
function ModelTable({ models, caption }: { models: ExperimentModel[]; caption: string }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table data-model-table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 pr-3">모델</th>
            <th scope="col" className="py-2 pr-3">log loss</th>
            <th scope="col" className="py-2 pr-3">accuracy</th>
            <th scope="col" className="py-2 pr-3">brier</th>
            <th scope="col" className="py-2">가중치</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.id} data-model={model.id} className="border-b border-border/60">
              <td className="py-2 pr-3">{model.label}</td>
              <td className="py-2 pr-3 font-mono">{metric(model.log_loss)}</td>
              <td className="py-2 pr-3 font-mono">{metric(model.accuracy)}</td>
              <td className="py-2 pr-3 font-mono">{metric(model.brier)}</td>
              <td className="py-2 font-mono text-xs">{weightsText(model.weights)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 실험 한 건을 표본 정보·모델 표·시장 대비 차이와 함께 보여준다.
 * @param props 실험 한 건.
 * @returns 실험 블록.
 */
function ExperimentBlock({ experiment }: { experiment: ExperimentRun }) {
  const trainRows = experiment.models[0]?.train_rows ?? null;
  const compared = experiment.models.filter((model) => model.id.startsWith("market_cai_"));
  return (
    <article data-experiment={experiment.id} className="mt-6 border border-border p-5 sm:p-6">
      <h3 className="text-lg font-medium text-foreground">{experiment.label}</h3>
      <p className="mt-1 font-mono text-xs text-muted-foreground">run {experiment.run_id} · {experiment.mode}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-muted-foreground">평가 기간</dt><dd className="mt-1 font-mono">{experiment.eval.start}–{experiment.eval.end}</dd></div>
        <div><dt className="text-muted-foreground">평가 표본</dt><dd className="mt-1 font-mono">{experiment.eval.n}</dd></div>
        <div><dt className="text-muted-foreground">학습 행</dt><dd className="mt-1 font-mono">{trainRows === null ? "—" : trainRows}</dd></div>
        <div><dt className="text-muted-foreground">구성 자료</dt><dd className="mt-1">{experiment.components.join(" · ")}</dd></div>
      </dl>
      <ModelTable models={experiment.models} caption={`${experiment.label} 모델별 지표`} />
      {compared.length === 0 ? null : (
        <p data-delta-vs-market className="mt-3 text-sm leading-7 text-muted-foreground">
          시장 대비 log loss 차이(양수=악화): {compared.map((model) => `${model.id} ${signed(deltaLogLossVsMarket(experiment, model.id))}`).join(" · ")}
        </p>
      )}
    </article>
  );
}

/**
 * A/B 민감도 실행 한 건. 표본·관측치·경과일과 모델 표를 보여준다.
 * @param props 실행 이름과 블록.
 * @returns 민감도 블록.
 */
function SensitivityBlock({ name, block }: { name: string; block: SensitivityRun }) {
  return (
    <article data-sensitivity={name} className="mt-6 border border-border p-5 sm:p-6">
      <h4 className="text-base font-medium text-foreground">{name}</h4>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-muted-foreground">학습 행</dt><dd className="mt-1 font-mono">{block.train_rows}</dd></div>
        <div><dt className="text-muted-foreground">검증 행</dt><dd className="mt-1 font-mono">{block.val_rows}</dd></div>
        <div><dt className="text-muted-foreground">DMR 관측치(학습/검증)</dt><dd className="mt-1 font-mono">{block.observations.train} / {block.observations.val}</dd></div>
        <div><dt className="text-muted-foreground">경과일(중앙값/최대)</dt><dd className="mt-1 font-mono">{metric(block.elapsed_days.median, 1)} / {block.elapsed_days.max}</dd></div>
      </dl>
      <ModelTable models={block.models} caption={`${name} 모델별 지표`} />
    </article>
  );
}

/**
 * common_232의 A/B 공통 표본 비교 표.
 * @param props 공통 표본 블록.
 * @returns A·B 지표와 차이를 담은 표.
 */
function CommonTable({ block }: { block: CommonRun }) {
  return (
    <div data-common-232 className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <caption className="sr-only">common_232 A/B 공통 표본 비교</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 pr-3">모델</th>
            <th scope="col" className="py-2 pr-3">A · log loss / accuracy / brier</th>
            <th scope="col" className="py-2 pr-3">B · log loss / accuracy / brier</th>
            <th scope="col" className="py-2">Δ log loss (B−A)</th>
          </tr>
        </thead>
        <tbody>
          {block.models.map((row) => (
            <tr key={row.id} data-common-model={row.id} className="border-b border-border/60">
              <td className="py-2 pr-3">{row.label} <span className="font-mono text-xs text-muted-foreground">{row.id}</span></td>
              <td className="py-2 pr-3 font-mono text-xs">{metric(row.a.log_loss)} / {metric(row.a.accuracy)} / {metric(row.a.brier)}</td>
              <td className="py-2 pr-3 font-mono text-xs">{metric(row.b.log_loss)} / {metric(row.b.accuracy)} / {metric(row.b.brier)}</td>
              <td className="py-2 font-mono text-xs">{signed(row.delta_log_loss_b_minus_a)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 표본 미달로 건너뛴 C_0 블록.
 * @param props 건너뛴 실행.
 * @returns 학습하지 않은 이유와 표본 행 수.
 */
function SkippedBlock({ block }: { block: SkippedRun }) {
  return (
    <article data-sensitivity="C_0" className="mt-6 border border-dashed border-input p-5 sm:p-6">
      <h4 className="text-base font-medium text-foreground">C_0</h4>
      <p className="mt-2 text-sm text-muted-foreground">
        {block.status === "skipped" ? "표본 미달로 학습 안 함" : block.status} · {block.reason}
      </p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-muted-foreground">학습 행</dt><dd className="mt-1 font-mono">{block.train_rows}</dd></div>
        <div><dt className="text-muted-foreground">검증 행</dt><dd className="mt-1 font-mono">{block.val_rows}</dd></div>
        <div><dt className="text-muted-foreground">DMR 관측치(학습/검증)</dt><dd className="mt-1 font-mono">{block.observations.train} / {block.observations.val}</dd></div>
      </dl>
    </article>
  );
}

/**
 * 표본 확장 전후 모델별 표. 시장 대비 차이는 두 market_cai 행에만 값이 있다.
 * @param props 모델 행들.
 * @returns 이전/이후 지표와 차이를 담은 표.
 */
function ExpansionTable({ models }: { models: SampleExpansion["models"] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table data-expansion-table className="w-full min-w-[52rem] border-collapse text-sm">
        <caption className="sr-only">2019년 학습 자료 보강 전후 모델별 지표</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 pr-3">모델</th>
            <th scope="col" className="py-2 pr-3">이전 · log loss / accuracy / brier</th>
            <th scope="col" className="py-2 pr-3">이후 · log loss / accuracy / brier</th>
            <th scope="col" className="py-2 pr-3">Δ log loss (이후−이전)</th>
            <th scope="col" className="py-2 pr-3">시장 대비 Δll (이전 → 이후)</th>
            <th scope="col" className="py-2">가중치</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.id} data-expansion-model={model.id} className="border-b border-border/60">
              <td className="py-2 pr-3">{model.label} <span className="font-mono text-xs text-muted-foreground">{model.id}</span></td>
              <td className="py-2 pr-3 font-mono text-xs">{metric(model.before.log_loss)} / {metric(model.before.accuracy)} / {metric(model.before.brier)}</td>
              <td className="py-2 pr-3 font-mono text-xs">{metric(model.after.log_loss)} / {metric(model.after.accuracy)} / {metric(model.after.brier)}</td>
              <td className="py-2 pr-3 font-mono text-xs">{signed(model.delta_log_loss_after_minus_before)}</td>
              <td className="py-2 pr-3 font-mono text-xs">{signed(model.before_delta_vs_market)} → {signed(model.after_delta_vs_market)}</td>
              <td className="py-2 font-mono text-xs">{weightsText(model.after.weights)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 2019년 학습 자료 보강 전후 비교 블록.
 * @param props 표본 확장 블록.
 * @returns 전후 실행·학습 행·평가 조건과 모델 표, 주의 문장.
 */
function SampleExpansionBlock({ block }: { block: SampleExpansion }) {
  return (
    <article data-sample-expansion className="mt-8 border border-border p-5 sm:p-6">
      <h3 className="text-base font-medium text-foreground">2019년 학습 자료 보강 전후</h3>
      <p className="mt-1 text-sm text-muted-foreground">{block.changed}{block.preregistration_kind === undefined ? "" : ` · ${block.preregistration_kind}`}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-muted-foreground">이전 실행</dt><dd className="mt-1 font-mono">{block.before_run}</dd></div>
        <div><dt className="text-muted-foreground">이후 실행</dt><dd className="mt-1 font-mono">{block.after_run}</dd></div>
        <div><dt className="text-muted-foreground">학습 행</dt><dd className="mt-1 font-mono">{block.before_train_rows} → {block.after_train_rows}</dd></div>
        <div><dt className="text-muted-foreground">평가 조건</dt><dd className="mt-1">{block.eval_identical ? "평가 날짜 동일" : "평가 날짜 조건이 다름"} · {block.eval.start}–{block.eval.end} · n={block.eval.n}</dd></div>
      </dl>
      <ExpansionTable models={block.models} />
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{block.note}</p>
    </article>
  );
}

/**
 * 홈용 한 줄 요약 카드. 표와 긴 문장을 두지 않는다.
 * @param props 검증된 요약.
 * @returns 작은 테두리 카드.
 */
function CompactSummary({ summary }: { summary: ExperimentSummary }) {
  const first = summary.experiments[0];
  if (first === undefined) return null;
  const year = first.eval.start.slice(0, 4);
  const improvement = summary.experiments.some((experiment) =>
    experiment.models.some(
      (model) => model.id.startsWith("market_cai_") && (deltaLogLossVsMarket(experiment, model.id) ?? 0) < 0,
    ),
  );
  return (
    <section data-experiment-results="compact" aria-labelledby="home-experiments-title" className="border-t border-border py-4">
      <div className="border border-border p-4 sm:p-5">
        <h2 id="home-experiments-title" className="text-sm font-medium text-foreground">실험 결과 · 회고</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          교통·시설 유량을 활용한 {year}년 회고 평가에서, 이번 비교의 예측 개선을 확인하지 못했습니다.
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
          <li>평가 기간 {first.eval.start}–{first.eval.end}</li>
          <li>자료 {summary.experiments.map((experiment) => experiment.label).join(" · ")}</li>
          <li>{improvement ? "확률오차 개선 확인" : "확률오차 개선 없음"}</li>
        </ul>
        <Link className="source-link mt-1" to="/research#experiments">회고 실험 자세히 보기</Link>
      </div>
    </section>
  );
}

/**
 * 연구 기록용 전체 섹션. 실험·민감도·검토 상태·한계를 순서대로 보여준다.
 * @param props 검증된 요약.
 * @returns #experiments 섹션.
 */
function FullResults({ summary }: { summary: ExperimentSummary }) {
  const year = summary.experiments[0]?.eval.start.slice(0, 4) ?? "";
  const pending = summary.review_status.independent_reproduction === "pending";
  const common = summary.sensitivity.common_232;
  return (
    <section id="experiments" data-experiment-results="full" aria-labelledby="experiments-title" className="border-b border-border py-8 sm:py-10">
      <div className="section-heading">
        <div>
          <p className="section-kicker">RETROSPECTIVE EXPERIMENTS / 회고 실험</p>
          <h2 id="experiments-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{year === "" ? "회고 실험 결과" : `${year}년 회고 실험 결과`}</h2>
        </div>
        <span className="text-tag">회고 / 실험</span>
      </div>
      <p data-disclosure className="max-w-3xl text-sm leading-7 text-muted-foreground">{summary.disclosure}</p>

      <h3 className="mt-8 text-base font-medium text-foreground">실험 두 건</h3>
      <p className="mt-2 text-sm text-muted-foreground">두 실험은 학습·평가 표본이 달라 순위로 합치지 않고 각각 표시합니다.</p>
      {summary.experiments.map((experiment) => <ExperimentBlock key={experiment.id} experiment={experiment} />)}

      {summary.sample_expansion === undefined ? null : <SampleExpansionBlock block={summary.sample_expansion} />}

      <h3 className="mt-8 text-base font-medium text-foreground">민감도 분석</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{summary.sensitivity.preregistration_kind} · {summary.sensitivity.changed}</p>
      <SensitivityBlock name="A_62" block={summary.sensitivity.A_62} />
      <SensitivityBlock name="B_31" block={summary.sensitivity.B_31} />

      <h3 className="mt-8 text-base font-medium text-foreground">common_232 — 공통 표본 n={common.n}</h3>
      <p className="mt-2 text-sm text-muted-foreground">A와 B가 공유하는 {common.n}개 날짜({common.dates.start}–{common.dates.end})에서만 비교합니다.</p>
      <CommonTable block={common} />
      <p className="mt-2 text-xs text-muted-foreground">DMR 값 차이 {common.dmr_value_diffs}건 · 학습 표본 차이만 반영합니다.</p>

      <SkippedBlock block={summary.sensitivity.C_0} />

      <p data-review-status className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground">
        검토 상태: {summary.review_status.self_check ? "SELF_CHECK 완료" : "SELF_CHECK 미완료"} · {pending ? "독립 재현 대기" : `독립 재현 ${summary.review_status.independent_reproduction}`}
      </p>

      <h3 className="mt-6 text-base font-medium text-foreground">한계</h3>
      <ul data-limitations className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-muted-foreground">
        {summary.limitations.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

/**
 * 회고 실험 요약을 compact(홈) 또는 full(연구 기록)로 그린다.
 * 모든 수치는 props로 받은 JSON에서만 오고 컴포넌트는 지표를 만들지 않는다.
 * @param props 표시 모드와 요약. 요약이 없으면 아무것도 그리지 않는다.
 * @returns 홈용 카드 또는 연구 기록용 섹션.
 */
export function ExperimentResults({ summary, mode }: { summary: ExperimentSummary | null; mode: "compact" | "full" }) {
  if (summary === null) return null;
  return mode === "compact" ? <CompactSummary summary={summary} /> : <FullResults summary={summary} />;
}
