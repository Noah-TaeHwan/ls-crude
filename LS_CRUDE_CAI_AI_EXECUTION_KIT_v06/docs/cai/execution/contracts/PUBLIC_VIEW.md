# 공개 화면 계약 v1 — 구현 명세

이 계약은 v0.5 §08의 필드를 작은 화면 인터페이스로 구체화한 **구현 제안**이다. 기존에 동등한 계약이 있으면 그것을 확인·대조하고 중복 타입을 만들지 않는다. 변경은 후속 카드 전체에 적용한다. 원자료/학습 입력 계약은 아니다.

## A. 공개 객체의 최소 구조

새 타입은 `app/app/lib/cai-view.ts`에서 export한다. 아래 이름과 의미를 UI/서버/테스트에서 동일하게 쓴다. 자유로운 필드 이름 변경은 하지 않는다.

```ts
export type DataOrigin = "OBSERVED" | "DEMO" | "NO_DATA";
export type Freshness = "FRESH" | "STALE" | "ERROR" | null;
export type ValidationState = "NOT_RUN" | "EXPLORATORY" | "INDEPENDENT_TESTED";
export interface CaiIndexView {
  index_id: string; definition_version: string | null;
  weighting_method: "equal-weight" | "learned-weight" | null;
  score: number | null; previous_score: number | null;
  as_of: string | null; observed_at: string | null; available_at: string | null;
  computed_at: string | null; retrieved_at: string | null;
  data_origin: DataOrigin; freshness: Freshness;
  run_id: string | null; constituent_count: number;
  coverage: number | null; // 0..1, 의미는 해당 index manifest에 정의
  history: Array<{date: string; score: number | null; definition_version: string}>;
}
export interface CaiForecastView {
  model_id: string | null; trained_run_id: string | null;
  generated_at: string | null; decision_cutoff: string | null;
  target_start: string | null; target_end: string | null;
  target_definition: string | null; publication_approved: boolean;
  probabilities: {up: number; not_up: number} | null; // 0..1
  data_origin: DataOrigin; freshness: Freshness;
}
export interface CaiValidationView {
  status: ValidationState; n: number | null;
  sample_start: string | null; sample_end: string | null;
  oos_exposure: "UNSEEN" | "SEEN" | "UNKNOWN";
  freeze_ref: string | null; review_ref: string | null;
  metrics: Array<{name: string; value: number; benchmark: string; benchmark_value: number}>;
}
export interface CaiConstituentView {
  candidate_id: string; name: string;
  membership: "ADOPTED" | "REVIEW" | "PARKED";
  observed_quantity: string; geography: string; frequency: string;
  status_note: string; evidence_ids: string[];
}
export interface CaiEvidenceView {
  id: string; title: string; url: string | null;
  access: "public" | "team_only";
}
export interface CaiPublicView {
  schema_version: "cai.public.v1";
  index: CaiIndexView; forecast: CaiForecastView;
  validation: CaiValidationView;
  constituents: CaiConstituentView[]; evidence: CaiEvidenceView[];
  warnings: string[];
}
export function emptyCaiView(): CaiPublicView;
export function parseCaiPublicView(input: unknown): CaiPublicView;
export function gaugeAngle(score: number | null): number | null;
export function displayedProbabilities(
  value: CaiForecastView
): {up: number; not_up: number} | null;
```

날짜 형식: `as_of`와 `history.date`는 시장 기준 YYYY-MM-DD. 관측·가용·계산·조회·생성 시각과 decision_cutoff/target_start/target_end는 offset 또는 Z가 있는 ISO 8601이다. target_start/end는 승인된 거래일 캘린더의 평가 경계이며 브라우저가 임의 생성하지 않는다. 화면 날짜는 upstream의 시장 기준을 보존한다.

## B. 검증·빈 상태

`emptyCaiView()`는 score/previous_score/as_of/run/확률/표본/metric을 만들지 않는다. index_id는 `cushing-activity-index`, data_origin은 NO_DATA, freshness는 null, constituent_count=0, history/constituents/evidence/metrics는 빈 배열, publication_approved=false, validation.status=NOT_RUN, oos_exposure=UNKNOWN이다. 나머지 알 수 없는 값은 null이다.

`parseCaiPublicView`는 unknown 입력을 방어적으로 검사하고, 검증한 필드만 새 객체에 복사한다. 객체 전체 spread/cast로 raw/weights/secrets를 전달하지 않는다. 유효하지 않은 루트는 빈 상태 + `INVALID_SNAPSHOT` 경고. index/forecast 한 영역의 실패는 그 영역만 비우고 경고하며 다른 유효 영역과 WTI를 비우지 않는다. 알 수 없는 부가 필드는 전달하지 않는다.

OBSERVED 점수는 유한수 0..100, 유효한 run/version/as_of/관측·가용 시각과 양의 성분 수·0..1 coverage가 있어야 한다. 날짜·시간 문자열은 실제 달력/ISO로 검사한다. NO_DATA 점수는 null. production 읽기에서 DEMO 점수는 미게시 값으로 취급한다. DEMO를 OBSERVED로 바꾸지 않는다. STALE은 기존 관측일을 보존하며 현재 시각을 넣지 않는다.

history는 같은 definition_version, 오름차순 고유 날짜, score=null 또는 0..100. null 날짜의 값을 보간하지 않는다. 소급 계산된 다른 버전은 같은 선에 연결하지 않는다.

## C. 확률 표시

`displayedProbabilities`는 OBSERVED이고 publication_approved=true이며 trained_run_id/model_id/생성·cutoff/대상일/타깃 정의가 검증된 경우만 값을 반환한다. target_start≤target_end, cutoff<target_start, generated_at<target_start이어야 한다. 실제 예측의 cutoff/생성/평가 경계는 upstream 명세와 대사한다. 시점 비교는 같은 기준 시간대로 변환한다. 누락된 기준/시간대는 추정하지 않는다.

p(up),p(not_up)는 각각 0..1, 합계는 1±0.000001. 하나라도 잘못되면 null. UI는 먼저 상승%를 소수 1자리로 반올림하고 하락·보합은 `100-표시 상승%`로 표시하여 합계 100.0을 맞춘다. 원 확률은 변경하지 않는다. 확률 0.5는 “보합 확률 100%”가 아니다. 모델 성능 미측정은 검증 탭에 —로 남긴다.

`gaugeAngle`은 0→−90, 50→0, 100→90도, 기준 바늘이 위를 향할 때 회전한다. null·비유한수·범위 밖은 null. 함수는 각도만 반환하며 실제 관측/등급/예측을 생성하지 않는다. UI의 null은 바늘 숨김·“— / 산출 대기”; 실제 0은 “0.0 / 100”과 0 위치 바늘.

INDEPENDENT_TESTED를 표시하려면 n>0, 유효한 sample_start/end, oos_exposure=UNSEEN, freeze_ref와 review_ref가 필요하다. 메타데이터 유효성은 독립성을 입증하지 않으므로 QA가 실제 참조 근거를 확인한다. 부족하면 NOT_RUN 또는 실제 근거가 있는 EXPLORATORY로만 표시하고 경고한다.

## D. 서버 경계

`app/app/lib/cai-view.server.ts`는 `readCaiPublicView(): Promise<CaiPublicView>`를 export한다. 승인된 공개 export만 읽으며 미연결 상태에서는 emptyCaiView를 반환한다. 소스 수집·학습·CFAM fallback·실제 mock 내장 금지. 실제 export 경로는 UI-06에서 승인 run을 확인한 뒤 연결한다.

public Evidence는 로컬 허용 경로 또는 비밀정보가 없는 https 원출처만. team_only는 공개 요약/표시만 제공하고 외부 방문자에게 private URL 접속 성공을 주장하지 않는다. 오류 원문/서명 URL/토큰을 loader payload나 JS에 넣지 않는다.

## E. 테스트 벡터

| 입력 | 기대 |
|---|---|
| null, {}, schema 불일치 | 빈 객체 계약 + INVALID_SNAPSHOT |
| index.score=0, 나머지 유효 | 0 보존, gaugeAngle=-90 |
| index.score=null | —·바늘 없음, 0으로 변환 금지 |
| index.score=101/-1/NaN | 해당 index 비움·경고 |
| 정상 index + 미승인 forecast | index 유지, 확률 표시 없음 |
| stale 유효 index | 원래 observed_at 유지 |
| 확률 0.642 / 0.358, 메타·승인 유효 | 표시 64.2 / 35.8 |
| 확률 합계 1.1 | 확률 표시 없음 |
| 임의 raw/weights/token 필드 | 출력 객체에 해당 필드 없음 |
| history 중간 null | 해당 구간 선 단절 |
| 독립 검증 표본/참조 누락 | INDEPENDENT_TESTED로 게시하지 않음 |

위 숫자는 테스트 전용이다. 앱의 최초 운영 값으로 사용하지 않는다. 타입 검사를 통과했다고 측정값·권한·학습 증거가 증명되는 것은 아니다.
