import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router";
import { RESEARCH_FILTERS, RESEARCH_STORIES, type ResearchRecord } from "~/lib/research-ledger";

/** 처음 펼치는 카드 수. 검색은 표시 범위와 무관하게 전체 정본에 적용한다. */
const PAGE_SIZE = 6;
/** 공개 근거 장부 링크. */
const LEDGER_URL = "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/factors/README.md";

/** 결정 기록의 상태 구분. */
type DecisionStatus = "승인" | "미확인" | "미완결" | "진단";
/** 결정 기록 한 항목. 출처: docs/cai/DECISIONS_AND_HISTORY.md의 실제 내용. */
interface DecisionEntry {
  date: string;
  title: string;
  status: DecisionStatus;
  actor: string;
  body: string;
  source?: string;
}

/** DECISIONS_AND_HISTORY.md의 실제 날짜·상태·이유만 옮긴 목록. 제안을 승인으로 바꾸지 않는다. */
const DECISIONS: readonly DecisionEntry[] = [
  {
    date: "2026-09-11",
    title: "로컬 문서 세팅 승인",
    status: "승인",
    actor: "태환",
    body: "범위: docs/cai/ 안내·연결·원장 문서와 run 기록. 앱·연구·배포 변경은 포함하지 않습니다. 연구 방향·역할 수락·모델 학습·운영 게시 승인이 아닙니다.",
    source: "docs/cai/execution/runs/REP-01/",
  },
  {
    date: "2026-09-11",
    title: "제한된 로컬 구현 승인 (UI-05.S2a)",
    status: "승인",
    actor: "태환",
    body: "범위: 격리 작업공간의 PUBLIC_VIEW v1 로컬 구현·테스트·인계. 앱(원본)·배포·연구 실행 변경 없음. 독립 재실행·원격 반영·연구 승인이 아니며, CI·Vercel 차단은 미해결로 유지합니다.",
    source: "docs/cai/execution/runs/UI-05.S2a/",
  },
  {
    date: "2026-09-11",
    title: "성찬 역할·연구 방향·공개 범위",
    status: "미확인",
    actor: "성찬",
    body: "연구 방향(CAI 트랙) 수락 여부, 역할·가용 시간, 공개 범위(가중치·상세 계수)가 아직 확인되지 않았습니다. 확인 전에는 승인으로 표시하지 않습니다.",
  },
  {
    date: "2026-09-11",
    title: "DATA-01 재현·근거 미완결",
    status: "미완결",
    actor: "기록",
    body: "공개시점·권한·재현 기록 일부가 미확인입니다(R1 정정표). 명령 재현 기록 일부는 생략 상태로 남기며 과거 실행문을 추측 복원하지 않습니다.",
  },
  {
    date: "2026-09-11",
    title: "OPS-01 재현·원인 미완결",
    status: "미완결",
    actor: "기록",
    body: "명령 일부 생략 표기, 개별 종료시각 미표기. 최근 20건 BLOCKED의 공통 근본 원인 미확인. 복구 제안은 미검증이며 운영 재진단으로 범위를 확대하지 않습니다.",
  },
  {
    date: "2026-09-11",
    title: "운영 참고 (진단 결과, 해결 아님)",
    status: "진단",
    actor: "기록",
    body: "CI는 결제/지출 한도로 job이 시작되지 않았고(코드 검증 미실행), Vercel은 권한 차단이 확인됐습니다. 마지막 정상 prod는 e89e215입니다. 20건 BLOCKED를 플랫폼 전체 장애로 확대하지 않습니다.",
  },
];

/**
 * 보관 기록 검색·필터·카드 목록. 데이터 정본은 research/factors 하나이며
 * 화면은 히스토리에서 이 컴포넌트로 렌더한다.
 * @param props 연구 기록, 통과 수, 오류, 초기 검색어.
 * @returns 보관 기록 검색 영역.
 */
export function HistoryLedger({
  records,
  passCount,
  error,
  initialQuery,
}: {
  records: ResearchRecord[];
  passCount: number | null;
  error: string | null;
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState("전체");
  const [limit, setLimit] = useState(PAGE_SIZE);
  useEffect(() => {
    setQuery(initialQuery);
    setFilter("전체");
    setLimit(PAGE_SIZE);
  }, [initialQuery]);
  const normalized = query.trim().toLocaleLowerCase("ko");
  const filtered = records.filter((record) => {
    const story = RESEARCH_STORIES.find((item) => item.id === record.id);
    return (
      (filter === "전체" || record.group === filter) &&
      (/^\d{3}$/.test(normalized)
        ? record.id === normalized
        : `${record.id} ${record.name} ${record.role} ${record.conclusion} ${story?.label ?? ""}`
            .toLocaleLowerCase("ko")
            .includes(normalized))
    );
  });
  const visible = filtered.slice(0, limit);
  const filters = RESEARCH_FILTERS.filter((name) => name === "전체" || records.some((record) => record.group === name));

  /** @returns 검색·분류·표시 범위를 초기값으로 복원한다. */
  function reset(): void {
    setQuery("");
    setFilter("전체");
    setLimit(PAGE_SIZE);
  }

  return (
    <details id="ledger" open={!!initialQuery} className="border-t border-border py-6">
      <summary className="cursor-pointer py-4 text-lg font-medium">
        보관 기록{" "}
        <span className="font-mono text-sm text-muted-foreground">
          {error ? "확인 필요" : `${records.length}개 기록 · 기준 통과 ${passCount ?? "—"}개`}
        </span>
      </summary>
      <p className="mb-5 text-sm leading-7 text-muted-foreground">
        보관한 옛 연구의 검정 기록입니다. 진행 후보와 겹치므로 건수를 합산하지 않습니다. 검색은 표시 범위와
        무관하게 전체 정본에 적용합니다.
      </p>
      <div className="section-heading">
        <div>
          <p className="section-kicker">01 / EXPLORE THE EVIDENCE</p>
          <h2 id="ledger-title">보관 기록을 열면, 멈춘 이유가 보입니다.</h2>
        </div>
        <Link className="source-link" to="/research#method">
          판정 기준 확인 <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      {error ? (
        <div className="empty-state mt-6" role="status">
          <h3>연구 장부 확인이 필요합니다.</h3>
          <p>{error}</p>
          <a className="action-link mt-4" href={LEDGER_URL}>
            정본 장부 열기
          </a>
        </div>
      ) : (
        <>
          <div className="ledger-toolbar mt-6">
            <div>
              <label htmlFor="ledger-search" className="mb-2 block text-sm">
                전체 {records.length}개 · 이름·관측 대상·판정 이유 검색
              </label>
              <div className="relative">
                <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-4 left-3 text-muted-foreground" />
                <input
                  id="ledger-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setLimit(PAGE_SIZE);
                  }}
                  placeholder="예: 피자, 정유, 공개시점, 018"
                  className="min-h-12 w-full rounded-sm border border-border bg-background py-3 pr-3 pl-10 text-sm placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm">판정별로 보기</legend>
              <div className="flex flex-wrap gap-2">
                {filters.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="filter-button"
                    aria-pressed={filter === name}
                    onClick={() => {
                      setFilter(name);
                      setLimit(PAGE_SIZE);
                    }}
                  >
                    {name}
                    <span className="ml-2 font-mono text-xs">
                      {name === "전체" ? records.length : records.filter((record) => record.group === name).length}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <details className="mt-3 text-xs leading-6 text-muted-foreground">
              <summary className="min-h-11 cursor-pointer py-3">판정 필터는 어떻게 분류하나요?</summary>
              <p>
                정본의 HOLD는 보류, REJECTED는 기각, ARCHIVED는 보관, MEME·MONITOR는 관측, SKIP은 분석 제외로
                묶었습니다. 혼합되거나 명시되지 않은 판정은 확인 필요로 남깁니다. 세부 한계는 각 기록의 원문에
                있습니다.
              </p>
            </details>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-muted-foreground">
              전체 {records.length}개 중 검색 결과 {filtered.length}개 · 현재 {visible.length}개 표시
            </p>
            {(query || filter !== "전체") && (
              <button className="filter-button" type="button" onClick={reset}>
                조건 초기화
              </button>
            )}
          </div>
          {visible.length ? (
            <div className="candidate-grid mt-5">
              {visible.map((record) => {
                const story = RESEARCH_STORIES.find((item) => item.id === record.id);
                return (
                  <article className="candidate-card" key={record.id} id={`candidate-${record.id}`}>
                    <div className="candidate-meta">
                      <span className="font-mono">
                        {record.id} / {record.role}
                      </span>
                      <span className="card-verdict" data-verdict={record.group}>
                        {record.group}
                      </span>
                    </div>
                    <h3 className="mt-4">{story?.label && record.id !== "001" ? story.label : record.name}</h3>
                    {story?.label && record.id !== "001" && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{record.name}</p>
                    )}
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{record.conclusion.replace(/폭증/g, "관측")}</p>
                    <details className="mt-4 border-t border-border">
                      <summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">
                        검정 요약과 근거 <span className="sr-only">— {record.name}</span>
                      </summary>
                      <div className="pb-4">
                        <p className="text-xs leading-6 text-muted-foreground">
                          보관 기록의 검정 요약입니다. IS는 인샘플, OOS는 이미 평가한 이후 구간입니다. ‘—’는 0이
                          아니라 해당 검정값 없음입니다.
                        </p>
                        <dl className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <dt>IS 상관계수 r</dt>
                            <dd className="mt-1 font-mono">{record.inSample}</dd>
                          </div>
                          <div>
                            <dt>OOS 상관계수 r</dt>
                            <dd className="mt-1 font-mono">{record.outSample}</dd>
                          </div>
                        </dl>
                        <p className="mt-3 text-xs leading-6 text-muted-foreground">
                          공통 타깃은 공개 이후 WTI 변동성입니다. 월간·연간 입력과 별도 에너지 체인 후보는 타깃이
                          다릅니다. 정확한 기간·표본·통제 조건은 연구 원문을 확인하세요.
                        </p>
                        {story && (
                          <div className="evidence-note mt-4">
                            <h4 className="text-sm font-medium text-primary">
                              {record.id === "001" ? "철회한 원안과 후속 가설" : "WTI 연결 가설과 다음 조건"}
                            </h4>
                            <p className="mt-2 text-sm leading-7">관측하려는 흔적: {story.trace}</p>
                            <p className="mt-2 text-sm leading-7">시장 연결 가설: {story.mechanism}</p>
                            <p className="mt-2 text-sm leading-7">{story.evidence}</p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{story.next}</p>
                          </div>
                        )}
                      </div>
                    </details>
                    <footer className="mt-auto border-t border-border pt-3">
                      <a className="source-link" href={record.sourceHref} target="_blank" rel="noreferrer">
                        연구 원문 <ArrowUpRight size={14} aria-hidden="true" />
                        <span className="sr-only">— {record.name} (새 탭)</span>
                      </a>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state mt-5">
              <Search size={24} aria-hidden="true" />
              <h3>조건에 맞는 연구 기록이 없습니다.</h3>
              <p>
                전체 {records.length}개를 검색했습니다. 검색어를 바꾸거나 판정 필터를 초기화하세요.
              </p>
              <button className="action-link mt-4" type="button" onClick={reset}>
                검색·필터 초기화 <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          {visible.length < filtered.length && (
            <button
              className="secondary-link mt-6 w-full justify-center border border-border"
              type="button"
              onClick={() => setLimit((current) => current + PAGE_SIZE)}
            >
              연구 기록 더 보기 ({filtered.length - visible.length}개 남음) <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </>
      )}
    </details>
  );
}

/**
 * 방향·결정 이력 타임라인. 실제 날짜·상태·이유·근거만 표시하며
 * 제안을 팀 승인으로 바꾸지 않는다.
 * @returns 결정 이력과 CFAM 별도 탐색 이력.
 */
export function DecisionTimeline() {
  return (
    <section id="history" data-decision-timeline className="border-t border-border py-8 sm:py-10" aria-labelledby="decision-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">02 / DECISION TRAIL</p>
          <h2 id="decision-title">어떻게 이 방향에 왔나</h2>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
        날짜, 당시 상태, 바꾼 이유와 근거만 남깁니다. 확인되지 않은 제안은 승인으로 표시하지 않습니다. 원문은
        docs/cai/DECISIONS_AND_HISTORY.md입니다.
      </p>
      <ol className="mt-5 space-y-4">
        {DECISIONS.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} data-decision-status={entry.status} className="border border-border p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <time className="font-mono text-muted-foreground">{entry.date}</time>
              <span className="border border-primary/60 px-2 py-0.5 font-mono text-primary">{entry.status}</span>
              <span className="text-muted-foreground">{entry.actor}</span>
            </div>
            <h3 className="mt-3 text-base font-medium text-foreground">{entry.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.body}</p>
            {entry.source && <p className="mt-2 font-mono text-xs text-muted-foreground">근거: {entry.source}</p>}
          </li>
        ))}
      </ol>
      <div data-cfam-history className="mt-6 border border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="border border-primary/60 px-2 py-0.5 font-mono text-primary">별도 이력</span>
          <span className="text-muted-foreground">CFAM · 쿠싱 현장 바쁨 보드</span>
        </div>
        <h3 className="mt-3 text-base font-medium text-foreground">CFAM은 학습 CAI로 자동 승격하지 않습니다</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          현장 관심·재고 문맥을 묶은 별도 탐색 사례입니다. 고정 비중, 예약 비중, 실제 적용 비중은 서로 다른
          값이며 하나로 합쳐 표시하지 않습니다. 기존 실패·미통과 이유도 그대로 보존합니다.
        </p>
        <Link className="source-link mt-3 inline-flex" to="/observations/cushing-busy">
          CFAM 보드 원문 보기 <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
