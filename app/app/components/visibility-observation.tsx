import { useEffect, useState } from "react";
import { Link, useRevalidator } from "react-router";
import { ArrowUpRight, ArrowRight, RefreshCw, Eye } from "lucide-react";
import { visibilityStatus, type VisibilityView, type VisibilityObservation as Observation } from "~/lib/visibility";

/** 관측소 자료와 가설의 공개 연구 기록. */
const RECORD = "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/candidates/ALT-20260908-16.md";

/**
 * 검증된 UTC 시각을 서버와 브라우저에서 동일하게 표시한다.
 * @param value ISO 시각.
 * @returns UTC 날짜와 분.
 */
function utc(value: string) { return `${value.slice(0, 16).replace("T", " ")} UTC`; }

/**
 * 관측의 경계값을 정확한 수치와 구분한다.
 * @param row 실제 관측 행.
 * @returns 단위를 포함한 값 또는 결측 문구.
 */
function label(row: Observation) {
  if (row.value === null) return "미관측";
  return `${row.relation === "lower_bound" ? "≥ " : row.relation === "upper_bound" ? "≤ " : ""}${row.value} SM`;
}

/**
 * 실제 공항 시정과 수집 상태를 보여준다. 통항 상태나 WTI 신호로 환산하지 않는다.
 * @param props 검증된 관측, 서버 확인시각, 상세 화면 여부.
 * @returns 관측 카드 또는 상세 관측 영역.
 */
export function VisibilityObservation({ view, checkedAt, detail = false, compact = false }: { view: VisibilityView; checkedAt: string; detail?: boolean; compact?: boolean }) {
  const Heading = detail ? "h1" : compact ? "h3" : "h2";
  const revalidator = useRevalidator();
  const [clock, setClock] = useState(Date.parse(checkedAt));
  useEffect(() => {
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [checkedAt]);
  const snapshot = view.data;
  const latest = snapshot?.observations.at(-1);
  const freshness = visibilityStatus(view, clock);
  const stale = freshness === "stale";
  const status = { unavailable: "자료 없음", failed: "갱신 실패 · 이전 자료", stale: "지연 · 시각 확인", recent: "최근 관측" }[freshness];
  const known = snapshot?.observations.filter(row => row.value !== null) ?? [];
  const first = snapshot?.observations[0];
  const start = first ? Date.parse(first.observedAt) : 0;
  const end = latest ? Date.parse(latest.observedAt) : 0;
  const max = Math.max(12, ...known.map(row => row.value! + 2));
  return <section id={compact ? "visibility-observation" : "observations"} className={compact ? "min-w-0 py-6 flex flex-col" : "py-10 sm:py-12"} aria-labelledby="visibility-title">
    <div className="section-heading"><div><p className="section-kicker">{compact ? "기상 · 공항 시정" : "02 / AROUND THE OIL MARKET"}</p><Heading id="visibility-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">항로 앞이 잘 보일까?</Heading></div><span className="status-stamp"><Eye size={14} aria-hidden="true" /> {status}</span></div>
    <div className="flex-1 rounded-2xl border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-sm text-muted-foreground">갤버스턴 · KGLS 공항 시정</p><p className="mt-2 text-4xl font-semibold tracking-tight">{latest ? label(latest) : "—"}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">SM = 육상 마일 · ≥ 표시는 하한이며 정확한 거리가 아닙니다.</p></div>
        <button type="button" className="secondary-link min-h-11" disabled={revalidator.state !== "idle"} onClick={() => void revalidator.revalidate()}><RefreshCw size={15} aria-hidden="true" /> {revalidator.state !== "idle" ? "확인 중…" : "갱신 확인"}</button>
      </div>
      <p className="mt-5 text-sm leading-7">공항에서 보고한 시정입니다. 주변 항로 운영과의 연결을 조사하고 있으며, 이 값만으로 항만의 정상 운영이나 폐쇄를 판단할 수 없습니다.</p>
      {view.error && <p role="status" className="mt-4 rounded-lg border border-border p-3 text-sm leading-6">{view.error}</p>}
      {stale && <p className="mt-3 text-sm font-medium">오래된 관측 또는 조회입니다. 아래 시각을 확인하세요.</p>}
      {snapshot && first && latest ? <>
        <figure className="mt-6">
          <svg width="100%" height="218" role="img" aria-label={`KGLS 공항 시정 ${snapshot.observations.length}개 보고, 마지막 ${label(latest)}. 화살표는 경계값입니다.`} aria-describedby="visibility-chart-desc">
            <title id="visibility-chart-title">KGLS 공항의 수집 당시 24시간 시정 보고</title>
            <desc id="visibility-chart-desc">관측 시각별 점입니다. 위 화살표는 하한, 아래 화살표는 상한입니다. 점을 연결하거나 결측을 0으로 채우지 않습니다. 상세 화면의 표에서 각 값을 읽을 수 있습니다.</desc>
            {[0, max / 2, max].map(tick => <g key={tick}><line x1="8%" x2="94%" y1={174 - 140 * tick / max} y2={174 - 140 * tick / max} stroke="currentColor" opacity=".15" /><text x="0" y={178 - 140 * tick / max} fontSize="12" fill="currentColor">{tick}</text></g>)}
            {known.map(row => {
              const x = `${8 + 86 * (Date.parse(row.observedAt) - start) / Math.max(1, end - start)}%`;
              const y = 174 - 140 * row.value! / max;
              return <g key={row.observedAt}><circle cx={x} cy={y} r="3.5" fill="var(--primary)"><title>{`${utc(row.observedAt)} · ${label(row)}`}</title></circle>{row.relation !== "exact" && <text x={x} y={row.relation === "lower_bound" ? y - 7 : y + 20} textAnchor="middle" fontSize="17" fill="currentColor">{row.relation === "lower_bound" ? "↑" : "↓"}</text>}</g>;
            })}
            <text x="8%" y="204" fontSize="12" fill="currentColor">{first.observedAt.slice(11, 16)} UTC</text><text x="94%" y="204" textAnchor="end" fontSize="12" fill="currentColor">{latest.observedAt.slice(11, 16)} UTC</text>
          </svg>
          <figcaption className="text-xs leading-6 text-muted-foreground">관측 범위 {utc(first.observedAt)} — {utc(latest.observedAt)}<br />{snapshot.observations.length}개 보고 · 시정 결측 {snapshot.observations.length - known.length}개 · 원 보고값, 보간 없음</figcaption>
        </figure>
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-xs leading-6 sm:grid-cols-2"><div><dt className="text-muted-foreground">마지막 관측</dt><dd>{utc(snapshot.latestObservedAt)}</dd></div><div><dt className="text-muted-foreground">데이터 조회</dt><dd>{utc(snapshot.fetchedAt)}</dd></div></dl>
      </> : <p className="my-8 text-sm text-muted-foreground">실제 자료를 불러오면 관측 그래프를 표시합니다. 대체값은 만들지 않습니다.</p>}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">화면이 열려 있을 때 5분마다 확인합니다. 새 원천 조회는 10분 캐시를 사용하며 원 보고는 보통 시간 단위입니다. 2시간 넘은 관측 또는 30분 넘은 조회는 지연으로 표시합니다. 수신시각이 최초 외부 공개시각을 보증하지는 않습니다.</p>
      {!detail && <Link className="source-link mt-5 inline-flex min-h-11 items-center gap-2" to="/observations/visibility">무엇을 뜻하는 관측일까? <ArrowRight size={15} aria-hidden="true" /></Link>}
    </div>
    {detail && <>
      <div className="method-grid mt-8"><article className="method-step"><span>01 / 무엇</span><h3>한 공항의 기상 조건</h3><p>KGLS Galveston Scholes Field의 METAR 시정 보고입니다. 쿠싱이나 항로 전체의 시정, 선박 이동량을 측정한 값이 아닙니다.</p></article><article className="method-step"><span>02 / 왜</span><h3>현실의 운영 제약을 찾기</h3><p>주변 시정과 공식 통항 제한 공지가 연결되는지 확인하려는 가설입니다. 공지 시각과 같은 시간대 관측을 대조하는 것이 다음 단계입니다.</p></article><article className="method-step"><span>03 / 한계</span><h3>유가 신호는 아직</h3><p>상한·하한 보고를 정확한 거리로 바꾸지 않습니다. 항만 대표성, WTI와의 관계, 예측력은 미검증입니다. 현재 상태는 관측 가능 · 연구 보류(PARK)입니다.</p></article></div>
      {snapshot && <details className="mt-8 border-y border-border py-3"><summary className="min-h-11 cursor-pointer py-3 font-medium">실제 관측값 {snapshot.observations.length}개 펼치기</summary><div className="overflow-x-auto pb-4"><table className="w-full text-left text-xs leading-7"><caption className="py-2 text-left text-muted-foreground">시각은 UTC. 수신은 원천 receiptTime이며 최초 공개시각과 다를 수 있습니다.</caption><thead><tr><th scope="col" className="pr-5">관측</th><th scope="col" className="pr-5">시정</th><th scope="col">원천 수신</th></tr></thead><tbody>{snapshot.observations.map(row => <tr key={row.observedAt} className="border-t border-border"><td className="whitespace-nowrap pr-5">{utc(row.observedAt)}</td><td className="whitespace-nowrap pr-5">{label(row)}</td><td className="whitespace-nowrap">{utc(row.receivedAt)}</td></tr>)}</tbody></table></div></details>}
      <div className="mt-8 flex flex-wrap gap-6 text-sm"><a className="source-link" href="https://aviationweather.gov/data/api/" target="_blank" rel="noreferrer">NOAA/NWS 원천 안내 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">새 탭</span></a><a className="source-link" href={RECORD} target="_blank" rel="noreferrer">이 후보의 연구 기록 <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">새 탭</span></a><Link className="source-link" to="/research#intake">전체 탐색 과정 <ArrowRight size={14} aria-hidden="true" /></Link></div>
      <p className="mt-5 text-xs leading-6 text-muted-foreground">NOAA/NWS 자료를 재구성한 LS CRUDE 연구 화면입니다. 공식 운영 안내나 제공자의 승인을 뜻하지 않습니다.</p>
    </>}
  </section>;
}
