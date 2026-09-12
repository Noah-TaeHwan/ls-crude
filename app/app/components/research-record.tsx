import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { CaiResearch } from "~/components/cai/cai-research";
import { ExperimentResults } from "~/components/cai/experiment-results";
import { LocalStatus } from "~/components/cai/local-status";
import { DecisionTimeline, HistoryLedger } from "~/components/cai/history-ledger";
import { ResearchIntake } from "~/components/research-intake";
import { ResearchSample } from "~/components/research-sample";
import { legacyHashRedirect } from "~/lib/cai-legacy-routing";
import type { CaiPublicView } from "~/lib/cai-view";
import type { ExperimentSummary } from "~/lib/experiment-summary";
import type { IntakeRecord } from "~/lib/research-intake";
import type { ResearchRecord as LedgerRecord } from "~/lib/research-ledger";
import type { VisibilityView } from "~/lib/visibility";
import type { TankerView } from "~/lib/tanker-arrivals";
import type { CushingWeatherView } from "~/lib/cushing-weather";

/** 동결 뒤 새 미래 자료로 진행하는 연구 절차. */
const METHOD_STEPS = [
  ["가설", "무엇을 측정하고 왜 WTI와 연결하는지 한 문장으로 씁니다."],
  ["접근·샘플", "자료를 실제로 얻고 단위·누락·이용 조건을 확인합니다."],
  ["개별 관측", "확보한 표와 그림을 먼저 공개합니다. 최신 관측과 과거 연구 샘플을 구분합니다."],
  ["인샘플", "공개 시점을 확인한 적격 자료만 2015–2023 안에서 비교합니다."],
  ["규칙 동결", "신호 정의, 기간, 임계값을 기록하고 고정합니다."],
  ["새 미래 검증", "동결 뒤 새로 쌓이는 자료에서 한 번 평가하고 판정을 남깁니다."],
] as const;

/** 통합 연구 기록 화면의 데이터. 두 라우트가 같은 loader 결과를 넘긴다. */
interface ResearchRecordProps {
  cai: CaiPublicView;
  experiments: ExperimentSummary | null;
  intake: { records: IntakeRecord[]; error: string | null };
  ledger: { records: LedgerRecord[]; passCount: number | null; error: string | null };
  initialQuery: string;
  unsupportedSample: string | null;
  unsupportedCandidate: string | null;
  visibility: VisibilityView;
  tankers: TankerView;
  weather: CushingWeatherView;
  checkedAt: string;
}

/**
 * 현재 자료·실험과 과거 기록을 한 페이지에 묶는 통합 연구 기록.
 * /research와 /history가 같은 컴포넌트를 그리며, 데이터 렌더링은 기존 컴포넌트를 그대로 쓴다.
 * @param props 두 라우트의 공통 loader 데이터.
 * @returns 두 labeled 섹션을 가진 읽기 전용 연구 기록 화면.
 */
export function ResearchRecord({
  cai,
  experiments,
  intake,
  ledger,
  initialQuery,
  unsupportedSample,
  unsupportedCandidate,
  visibility,
  tankers,
  weather,
  checkedAt,
}: ResearchRecordProps) {
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  /** @returns 판정 기준 링크가 실제 내용을 펼쳐 보이게 한다. */
  function revealMethod() {
    const section = document.getElementById("method");
    if (section instanceof HTMLDetailsElement) section.open = true;
  }
  useEffect(() => {
    // hash만 있는 구주소는 서버가 볼 수 없으므로 클라이언트에서 replace한다.
    const target = legacyHashRedirect(pathname, hash);
    if (target) {
      void navigate(target, { replace: true });
      return;
    }
    if (hash === "#method") revealMethod();
  }, [hash, pathname, navigate]);
  // 사례 선택은 정본 판정과 연결된 기존 매핑을 그대로 재사용한다.
  const sampleRecords = {
    helix: intake.records.find((item) => item.fields.candidate_id === "ALT-20260909-02"),
    watermelon: intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-36"),
    jeju: intake.records.find((item) => item.fields.candidate_id === "ALT-20260908-20"),
    "degree-days": intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-45"),
    empties: intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-02"),
    "petroleum-rail": intake.records.find((item) => item.fields.candidate_id === "ALT-20260907-43"),
  };

  return (
    <>
      <DeskHeader source="GitHub 연구 정본" ticker="LS CRUDE" contextLabel="가설 · 근거 · 보관 기록" />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <header className="border-b border-border py-10 sm:py-12">
          <p className="eyebrow">RESEARCH RECORD / 연구 기록</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">가설에서 판정까지, 한 화면에서.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">현재 자료·실험과 과거 기록을 한 페이지에 모읍니다. 진행 후보와 보관 기록은 겹치므로 건수를 더하지 않습니다.</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <a className="source-link" href="#current">현재 자료·실험 보기</a>
            <a className="source-link" href="#past">과거 기록 보기</a>
            <a className="source-link" href="#method" onClick={revealMethod}>판정 기준 확인</a>
          </div>
        </header>

        <LocalStatus mode="full" />

        {unsupportedSample ? <p role="status" className="pt-5 text-sm text-muted-foreground">{unsupportedSample} <a className="source-link" href="#research-sample">과거 기록에서 사례 보기</a></p> : null}
        {unsupportedCandidate ? <p role="status" className="pt-5 text-sm text-muted-foreground">{unsupportedCandidate} <a className="source-link" href="#ledger">보관 기록 검색</a></p> : null}

        <section id="current" className="pt-8 sm:pt-10" aria-labelledby="current-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">01 / CURRENT</p>
              <h2 id="current-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">현재 자료·실험</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">진행 중인 자료 연결·지수 산출 상태와 실험 후보를 봅니다. 실행하지 않은 학습·검증은 완료로 표시하지 않습니다.</p>
          <CaiResearch view={cai} />
          <ResearchIntake {...intake} />
          <ExperimentResults mode="full" summary={experiments} />

          <details id="method" className="border-t border-border py-6"><summary className="cursor-pointer py-4 text-lg font-medium">판정 방법과 검증의 한계</summary><div aria-labelledby="method-title"><div className="section-heading"><div><p className="section-kicker">03 / METHOD & LIMITS</p><h2 id="method-title">관계가 남는지, 순서대로 묻습니다.</h2></div></div><ol className="method-grid mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>{METHOD_STEPS.map(([title, body], index) => <li key={title} className="method-step"><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><div className="evidence-note mt-6"><h3 className="text-base font-medium">이미 본 구간은 새로운 검증이 아닙니다.</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">2024–2026 구간은 이미 확인에 사용했습니다. 진행 후보는 규칙을 동결한 뒤 새로 쌓이는 미래 자료에서 확인합니다. 높은 단일 구간 상관이나 등록 후보 수를 성과로 세지 않습니다.</p></div><details className="mt-5 border-y border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm">가격·뉴스·시간차 비교의 경계</summary><div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground"><p>가격은 Yahoo Finance CL=F 일봉, 뉴스 정본은 Investing.com CSV입니다. 관측 시각과 실제 공개 시각을 구분하고, 그때 알 수 없었던 정보를 과거 자료에 섞지 않습니다.</p><p>대부분의 후보는 공개 이후 다음 5거래일 WTI 실현변동성을 묻습니다. 월간·연간 입력과 정제품·개별 주식 후보의 다른 타깃은 각 원문에 분리합니다.</p><p>겹침·시간차 비교는 공개 시각에 맞춘 실제 후보 시계열이 확보된 뒤에 가능합니다. 메인의 WTI 관측만으로 후보의 관계를 확인할 수는 없습니다.</p></div></details></div></details>
        </section>

        <section id="past" className="pt-8 sm:pt-10" aria-labelledby="past-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">02 / PAST RECORD</p>
              <h2 id="past-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">과거 기록</h2>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">확보한 사례, 결정 타임라인, 보관 기록을 모읍니다. 검색과 접기로 필요한 기록만 열어 봅니다.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link className="source-link" to="/history#research-sample">고정 주소로 사례 열기 <ArrowRight size={14} aria-hidden="true" /></Link>
            <Link className="source-link" to="/history#ledger">고정 주소로 보관 기록 열기 <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>

          <ResearchSample
            live={{ visibility, tankers, weather, checkedAt }}
            records={sampleRecords}
          />
          <DecisionTimeline />
          <HistoryLedger
            records={ledger.records}
            passCount={ledger.passCount}
            error={ledger.error}
            initialQuery={initialQuery}
          />

          <details id="research-notes" className="border-t border-border py-6"><summary className="cursor-pointer py-4 text-lg font-medium">조사 노트·출처·검증 원문</summary><div aria-labelledby="research-notes-title"><div className="section-heading"><div><p className="section-kicker">DECISION TRAIL / 원문</p><h2 id="research-notes-title">결론까지 따라갈 수 있는 기록</h2></div></div><div className="method-grid mt-6"><div className="method-step"><span>01 / 질문과 시행착오</span><h3>자료를 찾은 과정</h3><p>가설, 수집 실패와 다음 확인할 조건을 한 장씩 남깁니다.</p><a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/gathering/notes" target="_blank" rel="noreferrer">조사 노트 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a></div><div className="method-step"><span>02 / 데이터의 경계</span><h3>출처와 공개 시점</h3><p>무엇을 수집했고, 언제 이용 가능했는지와 사용 조건을 확인합니다.</p><a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/sources/REGISTRY.md" target="_blank" rel="noreferrer">출처 등록부 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a></div><div className="method-step"><span>03 / 유지한 판정</span><h3>검정과 반증</h3><p>관계가 사라지거나 반전된 결과도 같은 기준으로 보존합니다.</p><a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/reports/2026-09-03-factor-validation-share.md" target="_blank" rel="noreferrer">상세 검증 로그 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a></div></div></div></details>
        </section>
      </main>
      <DeskFooter />
    </>
  );
}
