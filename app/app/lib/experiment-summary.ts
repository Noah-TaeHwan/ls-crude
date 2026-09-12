/**
 * cai-retrospective-experiment-summary/v1의 표시용 타입과 파서.
 * 정본은 생성 파이프라인이 만든 JSON이며, 이 모듈은 스키마 문자열과
 * 필수 묶음만 확인한 뒤 지표 값을 그대로 전달한다. 값을 만들지 않는다.
 */

/** 요약 JSON의 schema 문자열. */
export const EXPERIMENT_SUMMARY_SCHEMA = "cai-retrospective-experiment-summary/v1";

/** 실험·민감도 모델 한 행의 지표. weights가 없으면 null이다. */
export interface ExperimentModel {
  id: string;
  label: string;
  status: string;
  train_rows: number;
  accuracy: number;
  log_loss: number;
  brier: number;
  weights: number[] | null;
}

/** 실험 한 건의 평가 구간. */
export interface ExperimentEval {
  n: number;
  start: string;
  end: string;
}

/** 회고 실험 한 건. 실험별 표본이 달라 순위로 합치지 않는다. */
export interface ExperimentRun {
  id: string;
  label: string;
  run_id: string;
  mode: string;
  eval: ExperimentEval;
  components: string[];
  models: ExperimentModel[];
  delta_log_loss_vs_market: Record<string, number>;
}

/** A/B 민감도 실행 한 건. */
export interface SensitivityRun {
  train_rows: number;
  val_rows: number;
  observations: { train: number; val: number };
  elapsed_days: { min: number; median: number; p90: number; max: number };
  models: ExperimentModel[];
}

/** common_232의 A/B 공통 표본 행. */
export interface CommonModelRow {
  id: string;
  label: string;
  a: { accuracy: number; log_loss: number; brier: number };
  b: { accuracy: number; log_loss: number; brier: number };
  delta_log_loss_b_minus_a: number;
}

/** common_232 공통 표본 블록. */
export interface CommonRun {
  n: number;
  dates: { start: string; end: string };
  models: CommonModelRow[];
  dmr_value_diffs: number;
}

/** 표본 미달로 건너뛴 C_0 블록. */
export interface SkippedRun {
  status: string;
  reason: string;
  train_rows: number;
  val_rows: number;
  observations: { train: number; val: number };
}

/** 민감도 분석 묶음. A_62·B_31은 DMR 유효기간을 바꾼 실행이다. */
export interface ExperimentSensitivity {
  preregistration_kind: string;
  changed: string;
  A_62: SensitivityRun;
  B_31: SensitivityRun;
  common_232: CommonRun;
  C_0: SkippedRun;
}

/** 표본 확장 전후 한쪽의 지표 묶음. */
export interface ExpansionMetrics {
  train_rows: number;
  accuracy: number;
  log_loss: number;
  brier: number;
  weights: number[] | null;
}

/** 표본 확장 전후 비교의 모델 한 행. 시장 대비 차이는 해당 모델에만 있다. */
export interface ExpansionModel {
  id: string;
  label: string;
  before: ExpansionMetrics;
  after: ExpansionMetrics;
  delta_log_loss_after_minus_before: number;
  before_delta_vs_market: number | null;
  after_delta_vs_market: number | null;
}

/** 2019년 학습 자료 보강 전후 비교. 없으면 화면은 아무것도 그리지 않는다. */
export interface SampleExpansion {
  kind: string;
  changed: string;
  preregistration_kind?: string;
  before_run: string;
  after_run: string;
  before_train_rows: number;
  after_train_rows: number;
  eval: { n: number; start: string; end: string };
  eval_identical: boolean;
  models: ExpansionModel[];
  note: string;
}

/** 회고 실험 요약 전체. */
export interface ExperimentSummary {
  schema: string;
  kind: string;
  disclosure: string;
  review_status: { self_check: boolean; independent_reproduction: string };
  experiments: ExperimentRun[];
  sample_expansion?: SampleExpansion;
  sensitivity: ExperimentSensitivity;
  limitations: string[];
}

/**
 * plain 객체인지 확인한다.
 * @param value 검사할 값.
 * @returns 레코드이면 true.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * v1 요약 JSON을 확인해 표시용 타입으로 돌려준다.
 * 스키마 문자열과 필수 묶음만 검사하고, 지표 값은 정본을 그대로 쓴다.
 * @param input JSON.parse 결과.
 * @returns 유효하면 요약, 아니면 null.
 */
export function parseExperimentSummary(input: unknown): ExperimentSummary | null {
  if (!isRecord(input) || input["schema"] !== EXPERIMENT_SUMMARY_SCHEMA) return null;
  if (!Array.isArray(input["experiments"]) || input["experiments"].length === 0) return null;
  if (!isRecord(input["sensitivity"]) || !isRecord(input["review_status"])) return null;
  if (!Array.isArray(input["limitations"])) return null;
  return input as unknown as ExperimentSummary;
}

/**
 * 시장 모델 대비 CAI 결합 모델의 log loss 차이를 돌려준다.
 * JSON에 사전 계산값이 있으면 그대로 쓰고, 없으면 같은 실험 표의
 * log_loss에서 계산한다. 양수는 확률오차 악화다.
 * @param experiment 실험 한 건.
 * @param modelId 시장과 비교할 모델 id(예: market_cai_equal).
 * @returns 차이 또는 비교할 수 없으면 null.
 */
export function deltaLogLossVsMarket(experiment: ExperimentRun, modelId: string): number | null {
  const prerecorded = experiment.delta_log_loss_vs_market[modelId];
  if (typeof prerecorded === "number" && Number.isFinite(prerecorded)) return prerecorded;
  const market = experiment.models.find((model) => model.id === "market");
  const candidate = experiment.models.find((model) => model.id === modelId);
  if (market === undefined || candidate === undefined) return null;
  return candidate.log_loss - market.log_loss;
}
