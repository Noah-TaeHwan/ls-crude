import quality from "../../../research/indexes/ALT-20260907-36/20260908T065043Z/quality.json";
import coverage from "../../../research/indexes/ALT-20260907-36/20260908T065043Z/yearly-coverage.csv?raw";

import type { IntakeRecord } from "~/lib/research-intake";

/** 검토한 그림의 정적 배포 사본. HTTP 응답 해시를 원본 영수증과 검사한다. */
const plotUrl = "/research/watermelon-20260908.png";

/** 검토를 마친 고정 빈티지의 원문. 자동 갱신 자료가 아니다. */
const EVIDENCE_URL = "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/indexes/ALT-20260907-36/20260908T065043Z/README.md";
/** 저장된 연도별 원단위 표. 헤더를 제외하고 원문 셀을 그대로 표시한다. */
const YEARS = coverage.trim().split(/\r?\n/).slice(1).map((row) => row.split(","));
/** 현재 원장의 후속 판정 설명. */
const DECISIONS: Record<string, string> = { PARK: "조건 대기", KEEP: "후속 연구 유지", KILL: "현 방식 종료" };

/**
 * 실제 수집한 과거 연구 샘플을 관측일·분모·후속 조건과 함께 보여준다.
 * @param props 현재 정본의 수박 후보. 정본이 없으면 사례를 표시하지 않는다.
 * @returns 검증된 그림과 원단위 표를 재사용하는 연구 사례.
 */
export function ResearchSample({ record }: { record?: IntakeRecord }) {
  if (!record) return null;
  return <section id="research-sample" className="border-t border-border py-10 sm:py-12" aria-labelledby="sample-title">
    <div className="section-heading"><div><p className="section-kicker">RESEARCH IN PRACTICE / 확보한 과거 자료</p><h2 id="sample-title">아이디어를 실제 자료로 열어보면.</h2></div><a className="source-link" href={EVIDENCE_URL}>수집·대사 기록 →</a></div>
    <article className="mt-6 overflow-hidden rounded-sm border border-border bg-card">
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 text-xs"><span className="status-stamp">과거 연구 샘플 · 자동 갱신 아님</span><span className="card-verdict">{DECISIONS[record.fields.decision]} · {record.fields.decision}</span><span className="text-muted-foreground">이 샘플의 WTI 관계 검정 미실행</span></div>
        <h3 className="mt-5 text-xl font-medium sm:text-2xl">수박이 냉장트럭을 바쁘게 만들까?</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">성찬님의 085 수박·냉장트럭 가설에서 출발했습니다. API 키 때문에 막혔던 주간 입력을 공식 Excel에서 확보해, 수박만 적힌 출하지 보고를 살펴봤습니다. 디젤 물류와의 연결은 아직 가설입니다.</p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">확보한 수박 단독 보고</dt><dd className="mt-1 font-mono text-lg">{quality.pure_rows}행 · {quality.observed_dates}개 날짜</dd></div>
          <div><dt className="text-muted-foreground">수박 관측 기간</dt><dd className="mt-1 font-mono">{quality.pure_start} ~ {quality.pure_end}</dd></div>
          <div><dt className="text-muted-foreground">이 파일을 수집한 시각</dt><dd className="mt-1 font-mono">{quality.source.retrieved_at.slice(0, 16).replace("T", " ")} UTC</dd></div>
        </dl>
        <p className="mt-4 text-sm leading-7"><strong>자료가 있어도, 분모부터 확인합니다.</strong> {quality.observed_dates}개 날짜 중 {quality.observed_dates - quality.dates_n_ge2}개는 출하지가 하나뿐입니다. 값이 0%·100%라는 이유만으로 큰 시장 변화를 뜻하지 않습니다.</p>
      </div>
      <figure className="border-y border-border bg-white text-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 text-sm"><p className="font-medium">보고값 4 이상 비중 · 관측 범위</p><a href={plotUrl} className="min-h-11 py-3 underline underline-offset-4">원본 크기로 보기</a></div>
        <div role="region" aria-label="연구 그림, 작은 화면에서는 가로로 스크롤" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-primary">
          <img id="watermelon-research-plot" src={plotUrl} width={1560} height={845} loading="lazy" className="h-auto w-full min-w-[720px]" alt="2022년 이후 보고값 4 이상 비중의 점 그래프와 2000~2026년 연도별 수박 보고 날짜 수. 관측 없는 기간은 연결하지 않았으며, 2019년과 2026년 1분기에는 수박 단독 보고가 없습니다. 아래 원단위 표와 수집 기록에서 수치를 확인할 수 있습니다." />
        </div>
        <figcaption className="px-5 pb-5 text-xs leading-6">U.S. Department of Agriculture / AMS. 위 점 그래프는 2022년 이후, 아래 막대는 전체 확보 기간입니다. 비중 = 해당 날짜에 값이 4 이상인 수박 단독 보고 ÷ 해당 날짜 수박 단독 보고 수. 전국 트럭 부족률이 아닙니다. 혼합 작물은 제외하고 소수값은 반올림하지 않았습니다. 아래 막대의 0은 선택된 보고행이 없다는 뜻입니다. 작은 화면에서는 그림을 좌우로 움직일 수 있습니다.</figcaption>
      </figure>
      <div className="p-5 sm:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <div><h4 className="text-sm font-medium">이번에 알게 된 것</h4><p className="mt-2 text-sm leading-7 text-muted-foreground">소수값 {quality.pure_fractional_rows}개를 정수만 남기는 방식으로 버리면 {quality.integer_only_lost_dates}개 날짜가 사라집니다. 소수값의 집계 방식과 실제 공개일은 추가 확인이 필요합니다. 원안의 52주 지수는 아직 만들지 않았습니다.</p></div>
          <div className="evidence-note"><h4 className="text-sm font-medium">다음 확인 · {record.fields.owner}</h4><p className="mt-2 text-sm leading-7">{record.fields.next_action}</p><p className="mt-2 text-xs text-muted-foreground">재검토 예정 {record.fields.next_review_date} · 사람 배정 제안</p></div>
        </div>
        <details className="mt-5 border-t border-border"><summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">연도별 원단위 표와 데이터 범위</summary>
          <p className="mb-4 text-sm leading-7 text-muted-foreground">전체 작물 파일의 마지막 날짜는 {quality.all_end}이지만 수박 단독 보고는 {quality.pure_end}까지입니다. 과거 자료를 다시 계산한 연구 샘플이며 당시 공개 빈티지는 미확인입니다.</p>
          <div className="overflow-x-auto" role="region" aria-label="연도별 관측 표, 작은 화면에서는 가로로 스크롤" tabIndex={0}><table className="w-full min-w-[460px] text-right text-sm"><caption className="pb-3 text-left">수박 단독 보고의 연도별 범위 · 같은 출하지 표기가 해마다 유지되는 것은 아닙니다.</caption><thead><tr>{["연도", "보고행", "관측 날짜", "출하지 표기", "소수값"].map((label) => <th key={label} scope="col" className="border-b border-border py-3 pr-3">{label}</th>)}</tr></thead><tbody>{YEARS.map(([year, ...cells]) => <tr key={year}><th scope="row" className="border-b border-border py-2 pr-3 font-normal">{year}</th>{cells.map((value, i) => <td key={i} className="border-b border-border py-2 pr-3 font-mono">{value}</td>)}</tr>)}</tbody></table></div>
        </details>
        <footer className="mt-5 flex flex-wrap gap-5 border-t border-border pt-4 text-sm"><a className="source-link" href={record.sourceHref}>가설·판정 원문</a><a className="source-link" href={EVIDENCE_URL}>그림·재현 코드·날짜별 분모</a><a className="source-link" href="https://www.ams.usda.gov/services/transportation-analysis/agricultural-refrigerated-truck-quarterly-datasets">USDA 자료 정의</a></footer>
      </div>
    </article>
  </section>;
}
