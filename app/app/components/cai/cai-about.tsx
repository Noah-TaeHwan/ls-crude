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
    return "동일 가중치 1/n은 사람이 정한 기준선이며 머신러닝 학습 결과가 아닙니다.";
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
            CAI는 쿠싱의 활동 신호를 0–100점으로 합성한 제안 지수입니다.
          </strong>{" "}
          점수는 활동 신호의 수준이며, 유가 상승 확률이 아닙니다.
        </p>
        <h3 className="mt-4 font-medium text-foreground">어떤 활동을 관측하나요?</h3>
        {view.constituents.length === 0 ? (
          <p className="mt-1">구성 후보가 아직 공개되지 않았습니다.</p>
        ) : (
          <ul className="mt-1 space-y-2">
            {view.constituents.map((item) => (
              <li key={item.candidate_id} data-constituent={item.candidate_id}>
                <span className="text-foreground">{item.name}</span>{" "}
                <span className="font-mono text-xs">({membershipLabel(item.membership)})</span>
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
        <h3 className="mt-4 font-medium text-foreground">현재 검증 상태</h3>
        <p className="mt-1" data-validation-status={view.validation.status}>
          {validationLabel(view.validation.status)}
          {view.validation.n === null ? "" : ` · 표본 ${view.validation.n}`}
          {view.validation.sample_start === null || view.validation.sample_end === null
            ? ""
            : ` · ${view.validation.sample_start}–${view.validation.sample_end}`}
        </p>
        {view.validation.status === "INDEPENDENT_TESTED" ? null : (
          <p className="mt-1 text-xs">
            이 화면의 예측력은 검증하지 않았습니다. 실제 자료 연결·가중치 학습·독립 평가와 화면
            구현은 별개입니다.
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
