import { SAMPLE_LINKS } from "~/lib/research-charts";
import { useState, useEffect } from "react";
import { ResearchIntake } from "~/components/research-intake";
import { readResearchIntake } from "~/lib/research-intake.server";
import { data, Link, redirect, useLocation } from "react-router";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

import type { Route } from "./+types/research";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { readResearchLedger } from "~/lib/research-ledger.server";
import { RESEARCH_FILTERS, RESEARCH_STORIES } from "~/lib/research-ledger";
import type { ActionResult } from "~/lib/types";

/** 처음 펼치는 카드 수. 검색은 표시 범위와 무관하게 전체 정본에 적용한다. */
const PAGE_SIZE = 6;
/** 공개 근거 장부 링크. */
const LEDGER_URL = "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/factors/README.md";
/** 동결 뒤 새 미래 자료로 진행하는 연구 절차. */
const METHOD_STEPS = [
  ["가설", "무엇을 측정하고 왜 WTI와 연결하는지 한 문장으로 씁니다."],
  ["접근·샘플", "자료를 실제로 얻고 단위·누락·이용 조건을 확인합니다."],
  ["개별 관측", "확보한 표와 그림을 먼저 공개합니다. 최신 관측과 과거 연구 샘플을 구분합니다."],
  ["인샘플", "공개 시점을 확인한 적격 자료만 2015–2023 안에서 비교합니다."],
  ["규칙 동결", "신호 정의, 기간, 임계값을 기록하고 고정합니다."],
  ["새 미래 검증", "동결 뒤 새로 쌓이는 자료에서 한 번 평가하고 판정을 남깁니다."],
] as const;

/** @returns 연구 장부 검색 설명. */
export function meta({}: Route.MetaArgs) {
  return [{ title: "LS CRUDE — 가설 검토와 다음 행동" }, { name: "description", content: "공개 대안 데이터 연구 인벤토리. 보류와 기각의 이유, 검정 기록과 원문을 탐색합니다." }];
}

/**
 * 정본 연구 기록과 연결된 후보를 읽는다.
 * @param args 현재 URL.
 * @returns 연구 기록과 최초 검색어.
 */
export function loader({ request }: Route.LoaderArgs) {
  const params=new URL(request.url).searchParams;
  const sample=params.get("sample");
  const mainLink=Object.values(SAMPLE_LINKS).find(href=>new URL(href,"https://ls-crude.local").searchParams.get("sample")===sample);
  if(sample&&mainLink)return redirect(mainLink,308);
  return { ...readResearchLedger(), intake:readResearchIntake(), initialQuery:params.get("candidate")??"" };
}

/** @returns 공개 연구 화면의 읽기 전용 응답. */
export function action({}: Route.ActionArgs) {
  return data({ ok: false, message: "공개 연구 장부는 읽기 전용입니다." } satisfies ActionResult, { status: 405 });
}

/**
 * 전체 연구 장부를 검색하고 판정·원문·검증 방법을 탐색한다.
 * @param props 정본 장부 데이터.
 * @returns 연구 기록 화면.
 */
export default function Research({ loaderData }: Route.ComponentProps) {
  const { hash }=useLocation();
  /** @returns 판정 기준 링크가 실제 내용을 펼쳐 보이게 한다. */
  function revealMethod(){const section=document.getElementById("method");if(section instanceof HTMLDetailsElement)section.open=true;}
  useEffect(()=>{if(hash==="#method")revealMethod();},[hash]);
  const [query, setQuery] = useState(loaderData.initialQuery);
  const [filter, setFilter] = useState("전체");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { records, passCount, error } = loaderData;
  useEffect(()=>{setQuery(loaderData.initialQuery);setFilter("전체");setLimit(PAGE_SIZE);},[loaderData.initialQuery]);
  const normalized = query.trim().toLocaleLowerCase("ko");
  const filtered = records.filter((record) => {
    const story = RESEARCH_STORIES.find((item) => item.id === record.id);
    return (filter === "전체" || record.group === filter) &&
      (/^\d{3}$/.test(normalized) ? record.id === normalized :
      `${record.id} ${record.name} ${record.role} ${record.conclusion} ${story?.label ?? ""}`.toLocaleLowerCase("ko").includes(normalized));
  });
  const visible = filtered.slice(0, limit);
  const filters = RESEARCH_FILTERS.filter((name) => name === "전체" || records.some((record) => record.group === name));

  /** @returns 검색·분류·표시 범위를 초기값으로 복원한다. */
  function reset(): void { setQuery(""); setFilter("전체"); setLimit(PAGE_SIZE); }

  return (
    <>
      <DeskHeader source="GitHub 연구 정본" ticker="LS CRUDE" contextLabel="가설 · 근거 · 다음 행동" />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <header className="border-b border-border py-10 sm:py-12">
          <p className="eyebrow">RESEARCH / 가설과 검토 기록</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">어떤 진행 후보를 더 확인할까?</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">측정하려던 활동, 확보한 근거, 보류한 이유와 다음 행동을 확인합니다. 진행 후보와 아래 보관 기록은 겹치므로 더하지 않습니다. 원본 확보와 검정 완료는 다르며, 후속 연구 유지는 예측력 인증이 아닙니다.</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm"><Link id="research-sample" className="source-link" to="/#research-sample">확보한 자료는 메인에서 보기 <ArrowRight size={15} aria-hidden="true" /></Link><a className="source-link" href="#method" onClick={revealMethod}>판정 기준 확인</a></div>
        </header>

        <ResearchIntake {...loaderData.intake} />

        <details id="ledger" open={!!loaderData.initialQuery} className="border-t border-border py-6"><summary className="cursor-pointer py-4 text-lg font-medium">보관 기록 <span className="font-mono text-sm text-muted-foreground">{error ? "확인 필요" : `${records.length}개 기록 · 기준 통과 ${passCount ?? "—"}개`}</span></summary><p className="mb-5 text-sm leading-7 text-muted-foreground">보관한 옛 연구의 검정 기록입니다. 위 진행 후보와 겹치므로 건수를 합산하지 않습니다.</p>
          <div className="section-heading"><div><p className="section-kicker">01 / EXPLORE THE EVIDENCE</p><h2 id="ledger-title">보관 기록을 열면, 멈춘 이유가 보입니다.</h2></div><a className="source-link" href="#method" onClick={revealMethod}>판정 기준 확인 <ArrowRight size={14} aria-hidden="true" /></a></div>
          {error ? <div className="empty-state mt-6" role="status"><h3>연구 장부 확인이 필요합니다.</h3><p>{error}</p><a className="action-link mt-4" href={LEDGER_URL}>정본 장부 열기</a></div> : <>
            <div className="ledger-toolbar mt-6">
              <div><label htmlFor="ledger-search" className="mb-2 block text-sm">전체 {records.length}개 · 이름·관측 대상·판정 이유 검색</label><div className="relative"><Search size={17} aria-hidden="true" className="pointer-events-none absolute top-4 left-3 text-muted-foreground" /><input id="ledger-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE_SIZE); }} placeholder="예: 피자, 정유, 공개시점, 018" className="min-h-12 w-full rounded-sm border border-border bg-background py-3 pr-3 pl-10 text-sm placeholder:text-muted-foreground" /></div></div>
              <fieldset className="mt-4"><legend className="mb-2 text-sm">판정별로 보기</legend><div className="flex flex-wrap gap-2">{filters.map((name) => <button key={name} type="button" className="filter-button" aria-pressed={filter === name} onClick={() => { setFilter(name); setLimit(PAGE_SIZE); }}>{name}<span className="ml-2 font-mono text-xs">{name === "전체" ? records.length : records.filter((record) => record.group === name).length}</span></button>)}</div></fieldset>
              <details className="mt-3 text-xs leading-6 text-muted-foreground"><summary className="min-h-11 cursor-pointer py-3">판정 필터는 어떻게 분류하나요?</summary><p>정본의 HOLD는 보류, REJECTED는 기각, ARCHIVED는 보관, MEME·MONITOR는 관측, SKIP은 분석 제외로 묶었습니다. 혼합되거나 명시되지 않은 판정은 확인 필요로 남깁니다. 세부 한계는 각 기록의 원문에 있습니다.</p></details>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-muted-foreground">전체 {records.length}개 중 검색 결과 {filtered.length}개 · 현재 {visible.length}개 표시</p>{(query || filter !== "전체") && <button className="filter-button" type="button" onClick={reset}>조건 초기화</button>}</div>
            {visible.length ? <div className="candidate-grid mt-5">{visible.map((record) => {
              const story = RESEARCH_STORIES.find((item) => item.id === record.id);
              return <article className="candidate-card" key={record.id} id={`candidate-${record.id}`}>
                <div className="candidate-meta"><span className="font-mono">{record.id} / {record.role}</span><span className="card-verdict" data-verdict={record.group}>{record.group}</span></div>
                <h3 className="mt-4">{story?.label && record.id !== "001" ? story.label : record.name}</h3>
                {story?.label && record.id !== "001" && <p className="mt-1 font-mono text-xs text-muted-foreground">{record.name}</p>}
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{record.conclusion.replace(/폭증/g, "관측")}</p>
                <details className="mt-4 border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">검정 요약과 근거 <span className="sr-only">— {record.name}</span></summary>
                  <div className="pb-4"><p className="text-xs leading-6 text-muted-foreground">보관 기록의 검정 요약입니다. IS는 인샘플, OOS는 이미 평가한 이후 구간입니다. ‘—’는 0이 아니라 해당 검정값 없음입니다.</p><dl className="mt-3 grid grid-cols-2 gap-3"><div><dt>IS 상관계수 r</dt><dd className="mt-1 font-mono">{record.inSample}</dd></div><div><dt>OOS 상관계수 r</dt><dd className="mt-1 font-mono">{record.outSample}</dd></div></dl><p className="mt-3 text-xs leading-6 text-muted-foreground">공통 타깃은 공개 이후 WTI 변동성입니다. 월간·연간 입력과 별도 에너지 체인 후보는 타깃이 다릅니다. 정확한 기간·표본·통제 조건은 연구 원문을 확인하세요.</p>
                    {story && <div className="evidence-note mt-4"><h4 className="text-sm font-medium text-primary">{record.id === "001" ? "철회한 원안과 후속 가설" : "WTI 연결 가설과 다음 조건"}</h4><p className="mt-2 text-sm leading-7">관측하려는 흔적: {story.trace}</p><p className="mt-2 text-sm leading-7">시장 연결 가설: {story.mechanism}</p><p className="mt-2 text-sm leading-7">{story.evidence}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{story.next}</p></div>}
                  </div>
                </details>
                <footer className="mt-auto border-t border-border pt-3"><a className="source-link" href={record.sourceHref} target="_blank" rel="noreferrer">연구 원문 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">— {record.name} (새 탭)</span></a></footer>
              </article>;
            })}</div> : <div className="empty-state mt-5"><Search size={24} aria-hidden="true" /><h3>조건에 맞는 연구 기록이 없습니다.</h3><p>전체 {records.length}개를 검색했습니다. 검색어를 바꾸거나 판정 필터를 초기화하세요.</p><button className="action-link mt-4" type="button" onClick={reset}>검색·필터 초기화 <ArrowRight size={16} aria-hidden="true" /></button></div>}
            {visible.length < filtered.length && <button className="secondary-link mt-6 w-full justify-center border border-border" type="button" onClick={() => setLimit((current) => current + PAGE_SIZE)}>연구 기록 더 보기 ({filtered.length - visible.length}개 남음) <ArrowRight size={16} aria-hidden="true" /></button>}
          </>}
        </details>

        <details id="history" className="border-t border-border py-6"><summary className="cursor-pointer py-4 text-lg font-medium">조사 노트·출처·검증 원문</summary><div aria-labelledby="history-title"><div className="section-heading"><div><p className="section-kicker">02 / DECISION TRAIL</p><h2 id="history-title">결론까지 따라갈 수 있는 기록</h2></div></div><div className="method-grid mt-6"><div className="method-step"><span>01 / 질문과 시행착오</span><h3>자료를 찾은 과정</h3><p>가설, 수집 실패와 다음 확인할 조건을 한 장씩 남깁니다.</p><a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/tree/main/research/gathering/notes" target="_blank" rel="noreferrer">조사 노트 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a></div><div className="method-step"><span>02 / 데이터의 경계</span><h3>출처와 공개 시점</h3><p>무엇을 수집했고, 언제 이용 가능했는지와 사용 조건을 확인합니다.</p><a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/gathering/sources/REGISTRY.md" target="_blank" rel="noreferrer">출처 등록부 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a></div><div className="method-step"><span>03 / 유지한 판정</span><h3>검정과 반증</h3><p>관계가 사라지거나 반전된 결과도 같은 기준으로 보존합니다.</p><a className="source-link mt-3" href="https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/reports/2026-09-03-factor-validation-share.md" target="_blank" rel="noreferrer">상세 검증 로그 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (새 탭)</span></a></div></div></div></details>

        <details id="method" className="border-t border-border py-6"><summary className="cursor-pointer py-4 text-lg font-medium">판정 방법과 검증의 한계</summary><div aria-labelledby="method-title"><div className="section-heading"><div><p className="section-kicker">03 / METHOD & LIMITS</p><h2 id="method-title">관계가 남는지, 순서대로 묻습니다.</h2></div></div><ol className="method-grid mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>{METHOD_STEPS.map(([title, body], index) => <li key={title} className="method-step"><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><div className="evidence-note mt-6"><h3 className="text-base font-medium">이미 본 구간은 새로운 검증이 아닙니다.</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">2024–2026 구간은 이미 확인에 사용했습니다. 진행 후보는 규칙을 동결한 뒤 새로 쌓이는 미래 자료에서 확인합니다. 높은 단일 구간 상관이나 등록 후보 수를 성과로 세지 않습니다.</p></div><details className="mt-5 border-y border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm">가격·뉴스·시간차 비교의 경계</summary><div className="space-y-2 pb-4 text-sm leading-7 text-muted-foreground"><p>가격은 Yahoo Finance CL=F 일봉, 뉴스 정본은 Investing.com CSV입니다. 관측 시각과 실제 공개 시각을 구분하고, 그때 알 수 없었던 정보를 과거 자료에 섞지 않습니다.</p><p>대부분의 후보는 공개 이후 다음 5거래일 WTI 실현변동성을 묻습니다. 월간·연간 입력과 정제품·개별 주식 후보의 다른 타깃은 각 원문에 분리합니다.</p><p>겹침·시간차 비교는 공개 시각에 맞춘 실제 후보 시계열이 확보된 뒤에 가능합니다. 메인의 WTI 관측만으로 후보의 관계를 확인할 수는 없습니다.</p></div></details></div></details>

      </main>
      <DeskFooter />
    </>
  );
}
