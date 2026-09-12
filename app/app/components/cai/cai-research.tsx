import type { CaiConstituentView, CaiPublicView, ValidationState } from "~/lib/cai-view";

/** 지표가 없을 때의 표기. 0과 구분한다. */
const MISSING = "—";

/**
 * 구성 성분 채택 상태의 표시명.
 * @param membership 검증된 채택 상태.
 * @returns 한국어 표시명.
 */
function membershipLabel(membership: CaiConstituentView["membership"]): string {
  if (membership === "ADOPTED") return "채택";
  if (membership === "REVIEW") return "검토";
  return "보류";
}

/**
 * 검증 상태의 표시명.
 * @param status 검증된 상태.
 * @returns 한국어 표시명.
 */
function validationLabel(status: ValidationState): string {
  if (status === "INDEPENDENT_TESTED") return "독립 검증";
  if (status === "EXPLORATORY") return "탐색";
  return "미실행";
}

/**
 * 현재 CAI를 만드는 근거와 검증 질문을 보여준다.
 * 자료 확보·지수 산출·가중치 학습·평가를 분리하고, 실행하지 않은
 * 학습·OOS를 완료로 표시하지 않는다. 옛 후보는 자동 합산하지 않는다.
 * @param props 검증된 공개 화면 객체.
 * @returns 현재 연구·검증 영역.
 */
export function CaiResearch({ view }: { view: CaiPublicView }) {
  const adopted = view.constituents.filter((item) => item.membership === "ADOPTED").length;
  const review = view.constituents.filter((item) => item.membership === "REVIEW").length;
  const parked = view.constituents.filter((item) => item.membership === "PARKED").length;
  const stages = [
    {
      key: "data",
      label: "자료 연결",
      status: view.constituents.length > 0 ? "연결" : "미연결",
      detail: "채택한 성분만 지수에 들어갑니다. 보관 기록의 옛 후보는 자동으로 합산하지 않습니다.",
    },
    {
      key: "index",
      label: "지수 산출",
      status: view.index.score === null ? "산출 대기" : "산출",
      detail: "점수는 승인된 run이 있을 때만 게시합니다. 후보가 있다는 사실은 지수 산출이 아닙니다.",
    },
    {
      key: "weights",
      label: "가중치 학습",
      status: view.index.weighting_method === "learned-weight" ? "학습 가중치" : "미실행 · 동일 가중치 기준선",
      detail: "동일 가중치 1/n은 사람이 정한 기준선이며 머신러닝 학습 결과가 아닙니다.",
    },
    {
      key: "validation",
      label: "독립 평가",
      status: validationLabel(view.validation.status),
      detail: "학습·규칙 동결·적격 OOS 평가는 별도 단계입니다. 아래 보관 기록의 옛 결과를 새 검증으로 재사용하지 않습니다.",
    },
  ] as const;
  const weightingLabel =
    view.index.weighting_method === "equal-weight"
      ? "동일 가중치 1/n"
      : view.index.weighting_method === "learned-weight"
        ? "학습 가중치"
        : "미확정";
  const validation = view.validation;
  const sample =
    validation.sample_start === null || validation.sample_end === null
      ? MISSING
      : `${validation.sample_start}–${validation.sample_end}`;

  return (
    <section data-cai-research className="border-b border-border py-8 sm:py-10" aria-labelledby="cai-research-title">
      <div className="section-heading"><div><p className="section-kicker">CURRENT CAI / 근거와 검증</p><h2 id="cai-research-title">현재 CAI 연구·검증</h2></div><span className="text-tag">연구 / 현재</span></div>

      <h3 className="mt-6 text-base font-medium text-foreground">현재 연구 상태</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <li key={stage.key} data-stage={stage.key} data-stage-status={stage.status} className="border border-border p-4">
            <p className="font-mono text-xs text-muted-foreground">{stage.label}</p>
            <p className="mt-2 text-sm font-medium text-foreground">{stage.status}</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">{stage.detail}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-base font-medium text-foreground">CAI 구성 데이터</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        현재 지수 성분 {view.index.constituent_count}개 · <span data-constituent-counts>채택 {adopted} · 검토 {review} · 보류 {parked}</span>
      </p>
      {view.constituents.length === 0 ? (
        <p data-constituents-empty className="mt-3 border border-dashed border-input p-4 text-sm leading-7 text-muted-foreground">
          현재 채택한 성분이 없습니다. 조사 중인 옛 후보를 이 목록에 자동으로 합산하지 않습니다. 자료가 확보되고 적격성이 확인되면 채택·검토·보류로 나눠 공개합니다.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table data-constituents className="w-full min-w-[36rem] border-collapse text-sm">
            <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-2 pr-3">후보</th><th className="py-2 pr-3">구분</th><th className="py-2 pr-3">측정값</th><th className="py-2 pr-3">지역</th><th className="py-2 pr-3">주기</th><th className="py-2">상태</th></tr></thead>
            <tbody>
              {view.constituents.map((item) => (
                <tr key={item.candidate_id} data-constituent={item.candidate_id} data-membership={item.membership} className="border-b border-border/60">
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{membershipLabel(item.membership)}</td>
                  <td className="py-2 pr-3">{item.observed_quantity}</td>
                  <td className="py-2 pr-3">{item.geography}</td>
                  <td className="py-2 pr-3">{item.frequency}</td>
                  <td className="py-2 text-xs text-muted-foreground">{item.status_note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="mt-8 text-base font-medium text-foreground">정의·가중치</h3>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-muted-foreground">산식 버전</dt><dd className="mt-1 font-mono">{view.index.definition_version ?? MISSING}</dd></div>
        <div><dt className="text-muted-foreground">가중치</dt><dd className="mt-1">{weightingLabel}</dd></div>
        <div><dt className="text-muted-foreground">기준일</dt><dd className="mt-1 font-mono">{view.index.as_of ?? MISSING}</dd></div>
      </dl>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">1/n 동일 가중치는 공개 기준선입니다. 학습 계수는 팀 공개 정책에 따라 별도로 표시합니다.</p>

      <h3 className="mt-8 text-base font-medium text-foreground">모델 비교</h3>
      <div className="mt-3 overflow-x-auto">
        <table data-model-comparison className="w-full min-w-[32rem] border-collapse text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-2 pr-3">모델 구성</th><th className="py-2 pr-3">지표</th><th className="py-2">상태</th></tr></thead>
          <tbody>
            {["단순 기준", "기존 정보", "동일 가중치 CAI", "학습 가중치 CAI"].map((row) => (
              <tr key={row} className="border-b border-border/60"><td className="py-2 pr-3">{row}</td><td className="py-2 pr-3 font-mono">{MISSING}</td><td className="py-2">{validation.status === "NOT_RUN" ? "미평가" : validationLabel(validation.status)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {validation.metrics.length > 0 ? (
        <ul data-metrics className="mt-3 space-y-1 text-sm">
          {validation.metrics.map((metric) => (
            <li key={metric.name}><span className="font-mono">{metric.name}</span> {metric.value} · 기준 {metric.benchmark} {metric.benchmark_value}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-xs leading-6 text-muted-foreground">지표가 없으면 0이 아니라 —입니다. 과거 검증 수치는 이 표에 재사용하지 않습니다. 같은 타깃·기간·표본에서만 비교합니다.</p>

      <h3 className="mt-8 text-base font-medium text-foreground">실행 근거</h3>
      <dl data-run-evidence className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-muted-foreground">run ID</dt><dd className="mt-1 font-mono">{view.index.run_id ?? "미실행"}</dd></div>
        <div><dt className="text-muted-foreground">표본 수</dt><dd className="mt-1 font-mono">{validation.n ?? MISSING}</dd></div>
        <div><dt className="text-muted-foreground">표본 기간</dt><dd className="mt-1 font-mono">{sample}</dd></div>
        <div><dt className="text-muted-foreground">OOS 노출</dt><dd className="mt-1 font-mono">{validation.oos_exposure}</dd></div>
        <div><dt className="text-muted-foreground">동결 참조</dt><dd className="mt-1 font-mono">{validation.freeze_ref ?? MISSING}</dd></div>
        <div><dt className="text-muted-foreground">검토 참조</dt><dd className="mt-1 font-mono">{validation.review_ref ?? MISSING}</dd></div>
      </dl>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">실행하지 않은 학습·OOS를 완료로 표시하지 않습니다. 관측 시각과 이용 가능 시각은 공개 필드로만 판단합니다.</p>

      <h3 className="mt-8 text-base font-medium text-foreground">근거</h3>
      {view.evidence.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">공개 근거가 아직 없습니다.</p> : (
        <ul data-evidence className="mt-2 space-y-1 text-sm">
          {view.evidence.map((item) => (
            <li key={item.id}>
              {item.url === null ? (
                <><span className="text-foreground">{item.title}</span> <span className="font-mono text-xs">팀 내부 자료</span></>
              ) : (
                <a className="text-primary underline decoration-primary/45 underline-offset-4" href={item.url} rel="noopener noreferrer" target="_blank">{item.title}</a>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs leading-6 text-muted-foreground">비공개 원문은 공개 완료 근거로 쓰지 않습니다. 허용된 요약·출처 메타데이터·평가 표만 공개 근거로 봅니다.</p>

      <details data-explanation className="mt-6 border-t border-border py-2">
        <summary className="min-h-11 cursor-pointer py-3 text-sm">전처리·결측·공개시점·모델·불확실성</summary>
        <div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground">
          <p>전처리와 결측 규칙은 후보별로 기록하고, 결측을 0으로 채우지 않습니다. 원천의 공개 시각과 우리가 이용 가능해진 시각을 구분합니다.</p>
          <p>모델 비교는 같은 타깃·기간·표본에서만 합니다. 방향 정확도와 확률 오차(Brier 등)를 함께 보되, 지표가 없으면 —로 둡니다.</p>
          <p>불확실성은 표본 수·커버리지·시도 횟수를 함께 기록해 판단합니다. 높은 단일 구간 상관이나 후보 수를 성과로 세지 않습니다.</p>
          <p>가상 예시 계산은 이 화면에서 운영 지수·예측·학습 결과를 바꾸지 않습니다.</p>
        </div>
      </details>
    </section>
  );
}
