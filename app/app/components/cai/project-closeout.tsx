import { Link } from "react-router";
import { bundledResearchWorkflow, preparationGroups } from "~/components/cai/research-workflow";
import type { CaiIndexView } from "~/lib/cai-view";
import type { ExperimentSummary } from "~/lib/experiment-summary";

/**
 * 1차 종료 결과와 후속 검토를 구분한다. 자료 개수는 종료 당시 원장에서 읽는다.
 * @param props 검증된 지수와 대표 실험 요약.
 * @returns 종료 결과와 기본 접힘의 검증·인계 기록.
 */
export function ProjectCloseout({ index, experiments }: { index: CaiIndexView; experiments: ExperimentSummary | null }) {
  const groups = bundledResearchWorkflow ? preparationGroups(bundledResearchWorkflow.candidates) : null;
  const published = index.mode === "RETROSPECTIVE" && index.data_origin === "OBSERVED" && index.score !== null;
  const representative = experiments?.sample_expansion;
  return <section id="project-closeout" data-project-closeout className="border-t border-border py-6 sm:py-8" aria-labelledby="project-closeout-title">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="project-closeout-title" className="text-lg font-semibold">1차 프로젝트 종료 · 결과 보관</h2>
      <p className="text-xs text-muted-foreground">종료 기준 2026-09-14 18:00 KST</p>
    </div>
    <dl className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <dt className="text-xs text-muted-foreground">지수·대시보드</dt>
        <dd><p className="mt-2 text-base font-medium text-primary">{published ? "실험용 지수 공개" : "공개 산출물 확인 필요"}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">입력 준비 {groups?.ready.length ?? "—"}개 · 과거 지수와 날짜별 추이</p></dd>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <dt className="text-xs text-muted-foreground">추가 제출 자료</dt>
        <dd><p className="mt-2 text-base font-medium">{groups?.review.length ?? "—"}개 후보 · 후속 검토</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">원문·관측월·공개시점 미확인 상태로 보관</p>
        <Link className="source-link mt-3 inline-block text-sm" to="/research#workflow-review-inputs">제출 자료의 검토 기록 보기 →</Link></dd>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <dt className="text-xs text-muted-foreground">프로젝트 상태</dt>
        <dd><p className="mt-2 text-base font-medium">1차 공식 종료</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">지수·대시보드·재현 가능한 연구 기록을 보관</p>
        <a className="source-link mt-3 inline-block text-sm" href="/cai-research-brief.html">발표·공유용 연구 요약 →</a></dd>
      </div>
    </dl>
    <details className="mt-4 border-y border-border py-2">
      <summary className="min-h-11 cursor-pointer py-3 text-sm">검증 범위와 종료 후 인계 기록</summary>
      <div className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground">
        <p>{representative ? `지수 산출과 별도로, 상승률 기준선과 로지스틱 모델을 합한 ${representative.models.length}개 구성을 고정 시간분할로 비교했습니다. 실제 평가 구간은 ${representative.eval.start}–${representative.eval.end}, ${representative.eval.n}행입니다.` : "대표 실험 요약을 표시하지 못했습니다. 연구 기록의 실행 근거를 확인해 주세요."}</p>
        <p>이 결과를 최종 OOS나 롱·중립·숏 전략의 수익률·Sharpe·MDD 검증 완료로 표현하지 않습니다. Random Forest·Walk-forward의 별도 실행 결과가 있으면 근거를 구분해서 기록합니다.</p>
        <p>South STP는 월중 일최대 신고 방류유량입니다. 두 자료를 모든 선별 기준이 검증된 지표로 단정하지 않습니다. 보고서 수정본과 코드 파일의 실제 전달·접수 여부는 별도 인계 기록으로 남깁니다.</p>
        <p>실험용 CAI v0.1, 대시보드, 재현 가능한 연구 기록으로 1차 프로젝트를 종료했습니다. 추가 수집·현재 날짜의 지수·독립 예측력 검증은 후속 과제이며 별도 결정 후 진행합니다.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/cai/CLOSEOUT.md" target="_blank" rel="noreferrer">1차 종료·인계 기록 ↗</a>
          <a className="source-link" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/docs/cai/MESSAGE_SEONGCHAN.md" target="_blank" rel="noreferrer">종료 전 보고서 피드백 기록 ↗</a>
        </div>
      </div>
    </details>
  </section>;
}
