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
    <div className="evidence-note mt-4"><h4 className="text-sm font-medium">다음 행동</h4><p className="mt-2 text-sm leading-7">{f.next_action}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">담당 {f.owner} · 재검토 예정 {f.next_review_date}</p></div>
    <details className="mt-4 border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">접근 결과·검토 근거<span className="sr-only"> — {f.name}</span></summary><dl className="space-y-3 pb-4 text-sm leading-7 text-muted-foreground" style={{ gridTemplateColumns: "1fr" }}>{[["실제 확보 범위", "coverage"], ["원본 보존 기록", "raw_path"], ["측정 한계", "analogy_limit"], ["공개 시점", "available_at"], ["검토자", "reviewer"], ["검토 결과", "review_result"]].map(([label, key]) => <div key={key}><dt className="font-medium text-foreground">{label}</dt><dd>{f[key] || "기록 없음 — 원문 확인 필요"}</dd></div>)}</dl></details>
    <footer className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3">{SAMPLE_LINKS[f.candidate_id] && <Link className="source-link" to={SAMPLE_LINKS[f.candidate_id]}>관측 그래프 보기</Link>}<a className="source-link" href={record.sourceHref}>후보 원문</a><a className="source-link" href={record.historyHref}>변경 이력</a>{record.notes.map((href, index) => <a key={href} className="source-link" href={href}>조사 노트 {record.notes.length > 1 ? index + 1 : ""}</a>)}</footer>
  </article>;
}
/**
 * 정본 접수 장부를 검색하거나 홈의 최신 등록을 보여준다.
 * @param props 접수 결과와 홈 요약 여부.
 * @returns 검색·판정 필터·인계 카드.
 */
export function ResearchIntake({ records, error, preview = false }: { records: IntakeRecord[]; error: string | null; preview?: boolean }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("전체"); const [limit, setLimit] = useState(6);
  const filtered = records.filter(({ fields }) => (filter === "전체" || fields.decision === filter) && Object.values(fields).join(" ").toLocaleLowerCase("ko").includes(query.trim().toLocaleLowerCase("ko")));
  const visible = preview ? records.slice(0, 2) : filtered.slice(0, limit);
  /** @returns 전체 접수 보기로 복원한다. */
  function reset() { setQuery(""); setFilter("전체"); setLimit(6); }
  return <section id="intake" className="border-t border-border py-10 sm:py-12" aria-labelledby="intake-title">
    <div className="section-heading"><div><p className="section-kicker">RESEARCH INTAKE / 가설과 접근 기록</p><h2 id="intake-title">{preview ? "새로 등록한 질문, 다음 확인할 것." : "데이터를 구할 수 있을까? 여기서 시작합니다."}</h2></div>{preview && <Link className="source-link" to="/research#intake">접수 장부 전체 보기 →</Link>}</div>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{preview ? "등록 ID 순으로 최근 질문을 보여줍니다. 최근 수정 순서와는 다릅니다." : "가설 → 접근·샘플 확인 → 개별 시각화 → 선택적 조합. 현재 각 후보가 확보한 것과 멈춘 이유를 읽어보세요."} 샘플 접근은 WTI 관계 검정이나 채택을 뜻하지 않습니다.</p>
    <a className="source-link mt-3" href={`${INTAKE_ROOT}/blob/main/docs/ai-research-intake-workflow.md`}>AI 조사 워크플로우 · 실행 프롬프트 →</a>
    {!preview && <><ol className="method-grid mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>{[["가설", "재미있는 흔적과 측정 대상을 적습니다."], ["접근·샘플", "실제로 구할 수 있는지, 무엇을 담았는지 확인합니다."], ["개별 시각화", "유효한 관측값이 쌓이면 각 데이터를 보여줍니다."], ["선택적 조합", "개별 자료를 이해한 뒤 조합 가설을 검토합니다."]].map(([title, body], i) => <li className="method-step" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><p className="mt-3 text-xs leading-6 text-muted-foreground">절차 안내이며 완료율이 아닙니다. ALT 접수와 아래 기존 연구 인벤토리는 서로 겹쳐 건수를 합산하지 않습니다.</p></>}
    {error ? <div className="empty-state mt-6" role="status"><h3>접수 장부 확인이 필요합니다.</h3><p>{error}</p><a className="source-link mt-4" href={`${INTAKE_ROOT}/blob/main/research/candidates/ledger.csv`}>GitHub 접수 원장</a></div> : <>
      {!preview && <div className="ledger-toolbar mt-6"><label htmlFor="intake-search" className="mb-2 block text-sm">전체 접수 {records.length}개 · 가설·관측·판정·담당 검색</label><input id="intake-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(6); }} placeholder="예: 쿠싱, 도로, 공개시각" className="min-h-12 w-full rounded-sm border border-border bg-background p-3 text-sm placeholder:text-muted-foreground" /><fieldset className="mt-4"><legend className="mb-2 text-sm">후속 연구 판정</legend><div className="flex flex-wrap gap-2">{["전체", "PARK", "KEEP", "KILL"].map((value) => <button type="button" className="filter-button" key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setLimit(6); }}>{LABELS[value] || value} ({value === "전체" ? records.length : records.filter((record) => record.fields.decision === value).length})</button>)}</div></fieldset><p role="status" className="mt-4 text-sm text-muted-foreground">검색 결과 {filtered.length}개 · 현재 {visible.length}개 표시</p>{(query || filter !== "전체") && <button type="button" className="filter-button mt-3" onClick={reset}>접수 조건 초기화</button>}</div>}
      {visible.length ? <div className="candidate-grid mt-6">{visible.map((record) => <IntakeCard record={record} key={record.fields.candidate_id} />)}</div> : <div className="empty-state mt-6"><h3>조건에 맞는 접수 기록이 없습니다.</h3><button className="action-link mt-3" type="button" onClick={reset}>접수 검색·필터 초기화</button></div>}
      {!preview && visible.length < filtered.length && <button type="button" className="secondary-link mt-6 w-full justify-center border border-border" onClick={() => setLimit(limit + 6)}>접수 기록 더 보기 ({filtered.length - visible.length}개 남음)</button>}
    </>}
  </section>;
}
