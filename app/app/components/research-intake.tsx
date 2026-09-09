import { SAMPLE_LINKS } from "~/lib/research-charts";
import { useState } from "react";
import { Link } from "react-router";
import { INTAKE_ROOT, type IntakeRecord } from "~/lib/research-intake";
/** 정본 코드의 공개 화면 설명. */
const LABELS: Record<string, string> = { KEEP: "후속 연구 유지", PARK: "조건 대기", KILL: "현 방식 종료", NOT_STARTED: "수집 전", COLLECTING: "수집 중", COLLECTED: "원본 확보", BLOCKED: "접근·조건 차단", FAILED: "수집 실패", NOT_RUN: "검정 미실행", RUN: "검정 기록 있음" };
/** @param props 정본 후보. @returns 관측·판정·인계 정보를 가진 후보 카드. */
function IntakeCard({ record }: { record: IntakeRecord }) {
  const f = record.fields;
  return <article className="candidate-card min-w-0" style={{ overflowWrap: "anywhere" }}>
    <div className="candidate-meta"><span className="font-mono">{f.candidate_id}</span><span className="card-verdict">{LABELS[f.decision]}</span></div>
    <h3 className="mt-4">{f.name}</h3>
    <p className="mt-3 text-sm leading-7">{f.thesis}</p>
    <p className="mt-3 text-sm leading-7 text-muted-foreground"><strong className="text-foreground">관측 대상</strong> · {f.activity || "기록 없음 — 후보 원문 확인 필요"}</p>
    <p className="mt-3 text-xs leading-6 text-primary">{LABELS[f.collection_status]} · {LABELS[f.test_status]} · {f.evidence_level}</p>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{f.decision_reason}</p>
    <div className="evidence-note mt-4"><h4 className="text-sm font-medium">다음 행동</h4><p className="mt-2 text-sm leading-7">{f.next_action}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">기록상 담당 {f.owner} · 재검토 예정 {f.next_review_date} · 사람 배정 제안</p></div>
    <details className="mt-4 border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">접근 결과·검토 근거<span className="sr-only"> — {f.name}</span></summary><dl className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground" style={{ gridTemplateColumns: "1fr" }}>{[["실제 확보 범위", "coverage"], ["원본 보존 기록", "raw_path"], ["측정 한계", "analogy_limit"], ["공개 시점", "available_at"], ["검토자", "reviewer"], ["검토 결과", "review_result"]].map(([label, key]) => <div key={key}><dt className="font-medium text-foreground">{label}</dt><dd>{f[key] || "기록 없음 — 원문 확인 필요"}</dd></div>)}</dl></details>
    <footer className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3">{SAMPLE_LINKS[f.candidate_id] && <Link className="source-link" to={SAMPLE_LINKS[f.candidate_id]}>관측 그래프 보기</Link>}<a className="source-link" href={record.sourceHref}>후보 원문</a><a className="source-link" href={record.historyHref}>변경 이력</a>{record.notes.map((href, index) => <a key={href} className="source-link" href={href}>조사 노트 {record.notes.length > 1 ? index + 1 : ""}</a>)}</footer>
  </article>;
}
/** @param props 현재 정본 접수와 오류. @returns 가설·작업상태·다음 행동을 탐색하는 장부. */
export function ResearchIntake({ records, error }: { records: IntakeRecord[]; error: string | null }) {
  const [query,setQuery]=useState("");
  const [decision,setDecision]=useState("전체");
  const [work,setWork]=useState("전체");
  const [limit,setLimit]=useState(6);
  /** @param record 현재 후보. @param stage 작업 상태. @returns 기록된 상태의 일치 여부. */
  const matchesWork=(record:IntakeRecord,stage:string)=>stage==="전체" || (stage==="원본 확보" ? record.fields.collection_status==="COLLECTED" : stage==="차단·실패" ? ["BLOCKED","FAILED"].includes(record.fields.collection_status) : record.fields.test_status==="NOT_RUN");
  const filtered=records.filter(r=>(decision==="전체"||r.fields.decision===decision)&&matchesWork(r,work)&&Object.values(r.fields).join(" ").toLocaleLowerCase("ko").includes(query.trim().toLocaleLowerCase("ko")));
  const visible=filtered.slice(0,limit);
  /** @returns 검색과 두 상태 필터를 모두 초기화한다. */
  function reset(){setQuery("");setDecision("전체");setWork("전체");setLimit(6);}
  return <section id="intake" className="py-10 sm:py-12" aria-labelledby="intake-title">
    <div className="section-heading"><div><p className="section-kicker">01 / HYPOTHESES & NEXT STEPS</p><h2 id="intake-title">가설의 근거와 다음 행동</h2></div><a className="source-link" href={`${INTAKE_ROOT}/blob/main/docs/ai-research-delivery-prompt.md`}>AI 실행 프롬프트 →</a></div>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">확보한 것, 멈춘 이유, 다시 확인할 조건을 읽습니다. ALT 가설 장부와 아래 과거 검정 장부는 겹치므로 건수를 합산하지 않습니다.</p>
    {error ? <div className="empty-state mt-6" role="status"><h3>접수 장부 확인이 필요합니다.</h3><p>{error}</p><a className="source-link mt-4" href={`${INTAKE_ROOT}/blob/main/research/candidates/ledger.csv`}>GitHub 접수 원장</a></div> : <>
      <fieldset className="mt-6"><legend className="mb-3 text-sm">작업 상태로 살펴보기</legend><div className="flex flex-wrap gap-2">{["전체","원본 확보","차단·실패","검정 미실행"].map(stage=><button type="button" key={stage} className="filter-button" aria-pressed={work===stage} onClick={()=>{setWork(stage);setLimit(6);}}>{stage} <span className="font-mono">{records.filter(r=>matchesWork(r,stage)).length}</span></button>)}</div><p className="mt-3 text-xs leading-6 text-muted-foreground">전체 ALT {records.length}개 기준입니다. 원본 확보와 검정 미실행은 겹칠 수 있으며 완료율이 아닙니다.</p></fieldset>
      <div className="ledger-toolbar mt-6"><label htmlFor="intake-search" className="mb-2 block text-sm">가설·관측 대상·판정 이유·담당 검색</label><input id="intake-search" type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(6);}} placeholder="예: 쿠싱, 공개시각, 손성찬" className="min-h-12 w-full rounded-sm border border-border bg-background p-3 text-sm" />
        <fieldset className="mt-4"><legend className="mb-2 text-sm">후속 연구 판정</legend><div className="flex flex-wrap gap-2">{["전체","KEEP","PARK","KILL"].map(value=><button type="button" key={value} className="filter-button" aria-pressed={decision===value} onClick={()=>{setDecision(value);setLimit(6);}}>{LABELS[value]||value}</button>)}</div></fieldset>
        <p id="intake-result-count" role="status" className="mt-4 text-sm text-muted-foreground">검색 결과 {filtered.length}개 · 현재 {visible.length}개 표시 · 등록 ID 역순</p>{(query||decision!=="전체"||work!=="전체")&&<button className="filter-button mt-3" type="button" onClick={reset}>검색·필터 초기화</button>}
      </div>
      {visible.length ? <div className="candidate-grid mt-6">{visible.map(record=><IntakeCard key={record.fields.candidate_id} record={record}/>)}</div> : <div className="empty-state mt-6"><h3>조건에 맞는 가설이 없습니다.</h3><p>검색어와 두 필터를 함께 적용한 결과입니다.</p><button className="action-link mt-3" type="button" onClick={reset}>검색·필터 초기화</button></div>}
      {visible.length<filtered.length&&<button className="secondary-link mt-6 w-full justify-center border border-border" type="button" onClick={()=>setLimit(limit+6)}>가설 더 보기 ({filtered.length-visible.length}개 남음)</button>}
    </>}
  </section>;
}
