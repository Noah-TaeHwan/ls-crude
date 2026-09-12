import { useEffect, type MouseEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { CaiResearch } from "~/components/cai/cai-research";
import { LocalStatus } from "~/components/cai/local-status";
import { DecisionTimeline, HistoryLedger } from "~/components/cai/history-ledger";
import { ResearchWorkflow } from "~/components/cai/research-workflow";
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

/** 동결 뒤 새 미래 자료로 진행하는 연구 절차. 이전 기록 접기 안에만 둔다. */
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
 * hash 대상과 숨긴 조상 details를 연 뒤 그 위치로 스크롤한다.
 * 빈 stub가 아니라 실제 id를 가진 요소만 찾는다.
 * @param hash location.hash.
 * @returns 없음.
 */
export function revealHashTarget(hash: string): void {
  if (hash.length < 2) return;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (!(target instanceof HTMLElement)) return;
  let node: HTMLElement | null = target;
  while (node) {
    if (node instanceof HTMLDetailsElement) node.open = true;
    node = node.parentElement;
  }
  target.scrollIntoView({ block: "start" });
}

/**
 * 여섯 단계 결과와 이전 조사 기록을 한 페이지에 묶는 통합 연구 기록.
 * /research와 /history가 같은 컴포넌트를 그린다.
 * @param props 두 라우트의 공통 loader 데이터.
 * @returns 단계 본문과 접힌 이전 기록을 가진 읽기 전용 화면.
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
  const { hash, pathname, key } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sampleQuery = params.get("sample");
  const archiveOpen = initialQuery.length > 0 || (sampleQuery !== null && sampleQuery.length > 0);
  useEffect(() => {
    // hash만 있는 구주소는 서버가 볼 수 없으므로 클라이언트에서 replace한다.
    const target = legacyHashRedirect(pathname, hash);
    if (target) {
      void navigate(target, { replace: true });
      return;
    }
    const targetHash = hash || (initialQuery ? "#ledger" : sampleQuery ? "#research-sample" : "");
    if (targetHash) {
      revealHashTarget(targetHash);
    } else {
      document.querySelectorAll<HTMLDetailsElement>("#main-content details[open]").forEach((item) => { item.open = false; });
      window.scrollTo(0, 0);
    }
  }, [hash, pathname, key, initialQuery, sampleQuery, navigate]);
  /**
   * 같은 주소의 링크를 다시 눌러도 해당 상세를 펼친다.
   * @param event 본문에서 발생한 클릭.
   * @returns 없음.
   */
  function reopenSection(event: MouseEvent<HTMLElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor) return;
    const target = new URL(anchor.href, window.location.href);
    if (target.origin === window.location.origin && target.pathname === pathname && target.hash) {
      revealHashTarget(target.hash);
    }
  }
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
      <DeskHeader source="GitHub 연구 정본" ticker="LS CRUDE" contextLabel="6단계로 보는 연구 과정" />
      <main id="main-content" tabIndex={-1} className="desk-shell research-shell" onClickCapture={reopenSection}>
        {unsupportedSample ? (
          <p role="status" className="pt-5 text-sm text-muted-foreground">
            {unsupportedSample}{" "}
            <a className="source-link" href="#research-sample">
              이전 기록에서 사례 보기
            </a>
          </p>
        ) : null}
        {unsupportedCandidate ? (
          <p role="status" className="pt-5 text-sm text-muted-foreground">
            {unsupportedCandidate}{" "}
            <a className="source-link" href="#ledger">
              보관 기록 검색
            </a>
          </p>
        ) : null}

        <ResearchWorkflow experiments={experiments} />

        {import.meta.env.DEV ? <div className="border-b border-border py-4">
          <LocalStatus mode="compact" />
          <details className="mt-1">
            <summary className="min-h-11 cursor-pointer py-3 text-sm">로컬 다운로드·실행 기록 보기</summary>
            <LocalStatus mode="full" />
          </details>
        </div> : null}

        <details id="past" {...(archiveOpen ? { open: true } : {})} className="py-6 sm:py-8">
          <summary className="cursor-pointer py-4 text-lg font-medium">이전 조사와 상세 기록</summary>
          <p id="past-title" className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            이전에 조사한 후보와 사례, 판단의 근거를 모았습니다. 필요한 기록을 검색해 볼 수 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link className="source-link" to="/history#research-sample">
              이전 사례 보기 <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link className="source-link" to="/history#ledger">
              기록 검색하기 <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <CaiResearch view={cai} />
          <ResearchIntake {...intake} />

          <details id="method" className="border-t border-border py-6">
            <summary className="cursor-pointer py-4 text-lg font-medium">판정 방법과 검증의 한계</summary>
            <div aria-labelledby="method-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">03 / METHOD & LIMITS</p>
                  <h2 id="method-title">이전 연구의 검증 방법</h2>
                </div>
              </div>
              <ol className="method-grid mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>
                {METHOD_STEPS.map(([title, body], index) => (
                  <li key={title} className="method-step">
                    <span>0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
              <div className="evidence-note mt-6">
                <h3 className="text-base font-medium">이미 본 구간은 새로운 검증이 아닙니다.</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  2024–2026 구간은 이미 확인에 사용했습니다. 진행 후보는 규칙을 동결한 뒤 새로 쌓이는 미래 자료에서 확인합니다. 높은 단일 구간 상관이나 등록 후보 수를 성과로 세지 않습니다.
                </p>
              </div>
              <details className="mt-5 border-y border-border py-2">
                <summary className="min-h-11 cursor-pointer py-3 text-sm">가격·뉴스·시간차 비교의 경계</summary>
                <div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground">
                  <p>가격은 Yahoo Finance CL=F 일봉, 뉴스 정본은 Investing.com CSV입니다. 관측 시각과 실제 공개 시각을 구분하고, 그때 알 수 없었던 정보를 과거 자료에 섞지 않습니다.</p>
                  <p>대부분의 후보는 공개 이후 다음 5거래일 WTI 실현변동성을 묻습니다. 월간·연간 입력과 정제품·개별 주식 후보의 다른 타깃은 각 원문에 분리합니다.</p>
                  <p>겹침·시간차 비교는 공개 시각에 맞춘 실제 후보 시계열이 확보된 뒤에 가능합니다. 메인의 WTI 관측만으로 후보의 관계를 확인할 수는 없습니다.</p>
                </div>
              </details>
            </div>
          </details>

          <ResearchSample live={{ visibility, tankers, weather, checkedAt }} records={sampleRecords} />
          <DecisionTimeline />
          <HistoryLedger
            records={ledger.records}
            passCount={ledger.passCount}
            error={ledger.error}
            initialQuery={initialQuery}
          />

          <details id="research-notes" className="border-t border-border py-6">
            <summary className="cursor-pointer py-4 text-lg font-medium">조사 노트·출처·검증 원문</summary>
            <div aria-labelledby="research-notes-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">DECISION TRAIL / 원문</p>
                  <h2 id="research-notes-title">결론까지 따라갈 수 있는 기록</h2>
                </div>
              </div>
              <div className="method-grid mt-6">
                <div className="method-step">
                  <span>01 / 질문과 시행착오</span>
                  <h3>자료를 찾은 과정</h3>
                  <p>가설, 수집 실패와 다음 확인할 조건을 한 장씩 남깁니다.</p>
                  <a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/gathering/notes" target="_blank" rel="noreferrer">
                    조사 노트 <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only"> (새 탭)</span>
                  </a>
                </div>
                <div className="method-step">
                  <span>02 / 데이터의 경계</span>
                  <h3>출처와 공개 시점</h3>
                  <p>무엇을 수집했는지, 언제 이용할 수 있었는지, 사용 조건은 무엇인지 기록합니다.</p>
                  <a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/sources/REGISTRY.md" target="_blank" rel="noreferrer">
                    출처 등록부 <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only"> (새 탭)</span>
                  </a>
                </div>
                <div className="method-step">
                  <span>03 / 유지한 판정</span>
                  <h3>검정과 반증</h3>
                  <p>관계가 사라지거나 반전된 결과도 같은 기준으로 보존합니다.</p>
                  <a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/reports/2026-09-03-factor-validation-share.md" target="_blank" rel="noreferrer">
                    상세 검증 로그 <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only"> (새 탭)</span>
                  </a>
                </div>
              </div>
            </div>
          </details>
        </details>
      </main>
      <DeskFooter />
    </>
  );
}
