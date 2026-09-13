import type {
  CaiConstituentView,
  CaiPublicView,
  CaiValidationView,
} from "~/lib/cai-view";

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
function validationLabel(status: CaiValidationView["status"]): string {
  if (status === "INDEPENDENT_TESTED") return "독립 검증";
  if (status === "EXPLORATORY") return "탐색";
  return "미실행";
}

/**
 * 가중치 방식의 설명.
 * @param method 검증된 가중치 방식.
 * @returns 설명 문장.
 */
function weightingNote(method: CaiPublicView["index"]["weighting_method"]): string {
  if (method === "equal-weight") {
    return "동일 가중치 1/n은 각 자료를 같은 비중으로 넣는 기준선입니다. 머신러닝이 정한 비중은 아닙니다.";
  }
  if (method === "learned-weight") {
    return "학습 가중치는 개발 구간에서 추정하며 검증 결과와 함께 공개합니다.";
  }
  return "가중치 방식은 아직 확정되지 않았습니다.";
}

/**
 * CAI 정의·관측 영역·비중·검증 상태·근거를 접힌 영역에 담는다.
 * 기본 상태는 접힘이며, 긴 설명을 첫 화면에 펼치지 않는다.
 * @param props 검증된 공개 화면 객체.
 * @returns 기본 접힘 설명 영역.
 */
export function CaiAbout({ view }: { view: CaiPublicView }) {
  return (
    <details className="border-t border-border/60 px-1 py-2 sm:px-5">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 py-2 text-sm font-medium text-foreground">
        CAI란?
        <span className="text-xs text-muted-foreground">펼치기 / 접기</span>
      </summary>
      <div className="pb-4 text-sm leading-7 text-muted-foreground">
        <p>
          <strong className="text-foreground">
            {view.index.mode === "RETROSPECTIVE" ? "CAI v0.1은 선택한 활동 자료를 0–100점으로 나타낸 실험 지수입니다." : "CAI는 쿠싱의 활동 신호를 모아 0–100점으로 나타내려는 지수입니다."}
          </strong>{" "}
          점수는 활동 신호의 수준이며, 유가 상승 확률이 아닙니다.
        </p>
        <h3 className="mt-4 font-medium text-foreground">어떤 활동을 관측하나요?</h3>
        {view.constituents.length === 0 ? (
          <p className="mt-1">공식 지수에 넣을 성분은 아직 확정하지 않았습니다. 조사 중인 후보는 연구 기록에서 볼 수 있습니다.</p>
        ) : (
          <ul className="mt-1 space-y-2">
            {view.constituents.map((item) => (
              <li key={item.candidate_id} data-constituent={item.candidate_id}>
                <span className="text-foreground">{item.name}</span>{" "}
                <span className="font-mono text-xs">({view.index.mode === "RETROSPECTIVE" && item.membership === "ADOPTED" ? "실험 구성" : membershipLabel(item.membership)})</span>
                <span className="block text-xs">
                  관측: {item.observed_quantity} · {item.geography} · {item.frequency}
                  {item.status_note === "" ? "" : ` · ${item.status_note}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <h3 className="mt-4 font-medium text-foreground">비중</h3>
        <p className="mt-1">{weightingNote(view.index.weighting_method)}</p>
        {view.index.reference_period ? <div className="mt-2 space-y-2 text-xs">
          <p>기준 분포: {view.index.reference_period.start}–{view.index.reference_period.end}. 각 값을 기준 평균·표준편차로 표준화하고 ±3 범위를 0–100점으로 옮겨 평균합니다.</p>
          <p>교통은 관측일로 정렬하고, 월별 유량은 규제기관 접수일 이후 최대 62일까지 사용합니다. 접수일은 최초 공개일이 아니며, 날짜별 유량 재사용은 독립 관측을 늘리지 않습니다.</p>
          <p>과거 자료를 지금 다시 계산한 지수입니다. 강수·계절·요일 영향이나 원유 이외 활동도 포함됩니다.</p>
        </div> : null}
        <h3 className="mt-4 font-medium text-foreground">{view.index.mode === "RETROSPECTIVE" ? "유가 예측력 검증" : "현재 검증 상태"}</h3>
        <p className="mt-1" data-validation-status={view.validation.status}>
          {validationLabel(view.validation.status)}
          {view.validation.n === null ? "" : ` · 표본 ${view.validation.n}`}
          {view.validation.sample_start === null || view.validation.sample_end === null
            ? ""
            : ` · ${view.validation.sample_start}–${view.validation.sample_end}`}
        </p>
        {view.validation.status === "INDEPENDENT_TESTED" ? null : (
          <p className="mt-1 text-xs">
            회고 실험 결과와 공식 지수의 검증은 구분합니다. 공식 예측력은 아직 검증하지 않았습니다.
          </p>
        )}
        <h3 className="mt-4 font-medium text-foreground">근거</h3>
        {view.evidence.length === 0 ? (
          <p className="mt-1">근거 링크가 아직 공개되지 않았습니다.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {view.evidence.map((item) => (
              <li key={item.id}>
                {item.url === null ? (
                  <>
                    <span className="text-foreground">{item.title}</span>{" "}
                    <span className="font-mono text-xs">팀 전용</span>
                  </>
                ) : (
                  <a
                    className="text-primary underline decoration-primary/45 underline-offset-4"
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.title}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
