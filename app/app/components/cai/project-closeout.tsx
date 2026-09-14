import { Link } from "react-router";
import { bundledResearchWorkflow, preparationGroups } from "~/components/cai/research-workflow";
import type { CaiIndexView } from "~/lib/cai-view";
import type { ExperimentSummary } from "~/lib/experiment-summary";

/**
 * 공개 결과·제출 검토·문서 마무리를 구분한다. 자료 개수는 기존 원장에서 읽는다.
 * @param props 검증된 지수와 대표 실험 요약.
 * @returns 진행 현황과 기본 접힘의 제출 전 확인 사항.
 */
export function ProjectCloseout({ index, experiments }: { index: CaiIndexView; experiments: ExperimentSummary | null }) {
  const groups = bundledResearchWorkflow ? preparationGroups(bundledResearchWorkflow.candidates) : null;
  const published = index.mode === "RETROSPECTIVE" && index.data_origin === "OBSERVED" && index.score !== null;
  const representative = experiments?.sample_expansion;
  return <section id="project-closeout" data-project-closeout className="border-t border-border py-6 sm:py-8" aria-labelledby="project-closeout-title">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="project-closeout-title" className="text-lg font-semibold">진행 현황 · 마무리</h2>
      <p className="text-xs text-muted-foreground">문서 검토 기준 2026-09-14</p>
    </div>
    <dl className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <dt className="text-xs text-muted-foreground">지수·대시보드</dt>
        <dd><p className="mt-2 text-base font-medium text-primary">{published ? "실험용 지수 공개" : "공개 산출물 확인 필요"}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">입력 준비 {groups?.ready.length ?? "—"}개 · 과거 지수와 날짜별 추이</p></dd>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <dt className="text-xs text-muted-foreground">추가 제출 자료</dt>
        <dd><p className="mt-2 text-base font-medium">{groups?.review.length ?? "—"}개 후보 검토 중</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">원문·관측월·공개시점 확인 전</p>
        <Link className="source-link mt-3 inline-block text-sm" to="/research#workflow-review-inputs">제출 자료와 남은 확인 보기 →</Link></dd>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <dt className="text-xs text-muted-foreground">발표·제출 준비</dt>
        <dd><p className="mt-2 text-base font-medium">보고서 표현 정정 대기</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">계획과 실행 결과를 구분해 최종 대조</p>
        <a className="source-link mt-3 inline-block text-sm" href="/cai-research-brief.html">발표·공유용 연구 요약 →</a></dd>
      </div>
    </dl>
    <details className="mt-4 border-y border-border py-2">
      <summary className="min-h-11 cursor-pointer py-3 text-sm">검증 범위와 제출 전 확인</summary>
      <div className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground">
        <p>{representative ? `지수 산출과 별도로, 상승률 기준선과 로지스틱 모델을 합한 ${representative.models.length}개 구성을 고정 시간분할로 비교했습니다. 실제 평가 구간은 ${representative.eval.start}–${representative.eval.end}, ${representative.eval.n}행입니다.` : "대표 실험 요약을 표시하지 못했습니다. 연구 기록의 실행 근거를 확인해 주세요."}</p>
        <p>이 결과를 최종 OOS나 롱·중립·숏 전략의 수익률·Sharpe·MDD 검증 완료로 표현하지 않습니다. Random Forest·Walk-forward의 별도 실행 결과가 있으면 근거를 구분해서 기록합니다.</p>
        <p>보고서에서는 South STP 값을 월중 일최대 신고 방류유량으로 설명하고, 두 자료를 모든 선별 기준이 검증된 지표로 단정하지 않습니다. 수정본 확인과 최종 제출은 아직 남아 있습니다.</p>
        <p>추가 수집·현재 날짜의 지수·독립 예측력 검증은 후속 과제입니다. 이번 마무리 범위는 실험용 CAI v0.1, 대시보드, 재현 가능한 연구 기록입니다.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/cai/CLOSEOUT.md" target="_blank" rel="noreferrer">완료·남은 작업 정리 ↗</a>
          <a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/cai/MESSAGE_SEONGCHAN.md" target="_blank" rel="noreferrer">성찬님 전달용 짧은 피드백 ↗</a>
        </div>
      </div>
    </details>
  </section>;
}
