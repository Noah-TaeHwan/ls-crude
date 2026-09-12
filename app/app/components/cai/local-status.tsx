import { useEffect, useState } from "react";

import { LOCAL_STATUS_SCHEMA, type LocalWorkStatus } from "~/lib/local-status";

/** 로컬 상태 폴링 주기(ms). 작업 진행률이 아니라 화면 확인 주기다. */
const POLL_INTERVAL_MS = 5000;

/** 브라우저가 마지막으로 확인한 로컬 상태. */
interface LocalStatusState {
  data: LocalWorkStatus | null;
  checkedAt: string | null;
  failed: boolean;
  loaded: boolean;
}

/** 표시 상태 묶음. 테스트는 이 값을 직접 넣어 각 상태를 그린다. */
export interface LocalStatusViewProps {
  mode: "full" | "compact";
  data: LocalWorkStatus | null;
  checkedAt: string | null;
  failed: boolean;
  loaded: boolean;
}

/**
 * UTC ISO 문자열을 KST HH:MM[:SS] 표기로 바꾼다.
 * @param iso UTC 시각 문자열.
 * @param seconds 초까지 표시할지 여부.
 * @returns KST 표기 또는 —.
 */
function kst(iso: string | null | undefined, seconds = false): string {
  if (typeof iso !== "string" || iso.length === 0) return "—";
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "—";
  const shifted = new Date(parsed + 9 * 3600_000).toISOString();
  return `${shifted.slice(11, seconds ? 19 : 16)} KST`;
}

/**
 * 바이트 수를 사람이 읽는 크기로 바꾼다.
 * @param bytes 바이트 수 또는 null.
 * @returns 크기 표기 또는 —.
 */
function humanBytes(bytes: number | null | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

/**
 * 비어 있을 수 있는 문자열 표기.
 * @param value 표시할 값.
 * @returns 값 또는 —.
 */
function text(value: string | null | undefined): string {
  return typeof value === "string" && value.length > 0 ? value : "—";
}

/**
 * 실행이 끝났는지 여부.
 * @param run 실행 한 건.
 * @returns 종료 시각이 있으면 true.
 */
function runFinished(run: LocalWorkStatus["runs"][number]): boolean {
  return typeof run.finished_utc === "string" && run.finished_utc.length > 0;
}

/**
 * 로컬 상태 payload가 표시 가능한 v1 형태인지 확인한다.
 * @param value fetch 결과.
 * @returns 표시 가능하면 true.
 */
function isLocalWorkStatus(value: unknown): value is LocalWorkStatus {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record["schema"] === LOCAL_STATUS_SCHEMA &&
    typeof record["current"] === "object" &&
    record["current"] !== null &&
    Array.isArray(record["downloads"]) &&
    Array.isArray(record["runs"]) &&
    Array.isArray(record["inputs"]) &&
    Array.isArray(record["notes"])
  );
}

/**
 * 현재 작업과 다운로드·실행·입력·상대 보고·참고를 표시한다.
 * 없는 값은 —, 종료 기록이 없는 실행은 확인 필요로 남긴다.
 * @param props 데이터와 마지막 확인 시각.
 * @returns 전체 표시 본문.
 */
function FullStatus({ data, checkedAt }: { data: LocalWorkStatus; checkedAt: string | null }) {
  const current = data.current;
  const report = data.seongchan;
  return (
    <>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-muted-foreground">현재 작업명</dt><dd className="mt-1">{text(current.task)}</dd></div>
        <div><dt className="text-muted-foreground">담당</dt><dd className="mt-1">{text(current.owner)}</dd></div>
        <div><dt className="text-muted-foreground">단계</dt><dd className="mt-1">{text(current.stage)}</dd></div>
        <div><dt className="text-muted-foreground">처리량</dt><dd className="mt-1">{text(current.throughput)}</dd></div>
        <div><dt className="text-muted-foreground">작업 최근 활동</dt><dd className="mt-1 font-mono">{kst(current.last_activity_at)}</dd></div>
        <div><dt className="text-muted-foreground">상태 확인</dt><dd className="mt-1 font-mono">{checkedAt === null ? "—" : kst(checkedAt, true)}</dd></div>
        <div><dt className="text-muted-foreground">차단 사유</dt><dd className="mt-1">{typeof current.blocker === "string" && current.blocker.length > 0 ? current.blocker : "없음"}</dd></div>
        <div><dt className="text-muted-foreground">결과</dt><dd className="mt-1">{text(current.result)}</dd></div>
        <div><dt className="text-muted-foreground">화면 반영</dt><dd className="mt-1">{text(current.screen_reflected)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">자료 생성 {kst(data.generated_at_utc)} · 출처 {text(data.source)}. 상태 확인은 브라우저가 마지막으로 확인한 시각입니다.</p>

      <h3 className="mt-6 text-base font-medium text-foreground">다운로드</h3>
      <div className="mt-3 overflow-x-auto">
        <table data-local-downloads className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">로컬 다운로드 기록</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3">라벨</th>
              <th scope="col" className="py-2 pr-3">파일</th>
              <th scope="col" className="py-2 pr-3">바이트</th>
              <th scope="col" className="py-2">최근 기록</th>
            </tr>
          </thead>
          <tbody>
            {data.downloads.map((entry, index) => (
              <tr key={`${entry.label}-${index}`} className="border-b border-border/60">
                <td className="py-2 pr-3">{entry.label}</td>
                <td className="py-2 pr-3 font-mono">{entry.files ?? "—"}</td>
                <td className="py-2 pr-3 font-mono">{entry.bytes ?? "—"} <span className="text-xs text-muted-foreground">({humanBytes(entry.bytes)})</span></td>
                <td className="py-2 font-mono">{kst(entry.latest_activity_utc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-base font-medium text-foreground">실행 기록</h3>
      <div className="mt-3 overflow-x-auto">
        <table data-local-runs className="w-full min-w-[48rem] border-collapse text-sm">
          <caption className="sr-only">로컬 실행 기록</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3">실행</th>
              <th scope="col" className="py-2 pr-3">기준</th>
              <th scope="col" className="py-2 pr-3">시작</th>
              <th scope="col" className="py-2 pr-3">종료</th>
              <th scope="col" className="py-2 pr-3">모델 완료/차단/실패</th>
              <th scope="col" className="py-2 pr-3">학습 행</th>
              <th scope="col" className="py-2">방식</th>
            </tr>
          </thead>
          <tbody>
            {data.runs.map((run) => {
              const models = run.models;
              const unsettled = !runFinished(run) || models.running > 0 || models.pending > 0;
              return (
                <tr key={run.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-mono text-xs">{run.id}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{run.base}</td>
                  <td className="py-2 pr-3 font-mono">{kst(run.started_utc)}</td>
                  <td className="py-2 pr-3">{unsettled ? "실행 상태 확인 필요" : <span className="font-mono">{kst(run.finished_utc)}</span>}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{models.done}/{models.blocked}/{models.failed}</td>
                  <td className="py-2 pr-3 font-mono">{run.train_rows ?? "—"}</td>
                  <td className="py-2">{run.cached === true ? "캐시 재사용" : run.cached === false ? "재학습" : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-base font-medium text-foreground">입력 파일</h3>
      <div className="mt-3 overflow-x-auto">
        <table data-local-inputs className="w-full min-w-[32rem] border-collapse text-sm">
          <caption className="sr-only">로컬 입력 파일</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3">이름</th>
              <th scope="col" className="py-2 pr-3">바이트</th>
              <th scope="col" className="py-2">수정</th>
            </tr>
          </thead>
          <tbody>
            {data.inputs.map((entry) => (
              <tr key={entry.name} className="border-b border-border/60">
                <td className="py-2 pr-3 font-mono text-xs">{entry.name}</td>
                <td className="py-2 pr-3 font-mono">{entry.bytes ?? "—"} <span className="text-xs text-muted-foreground">({humanBytes(entry.bytes)})</span></td>
                <td className="py-2 font-mono">{kst(entry.modified_utc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-base font-medium text-foreground">손성찬 보고</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">최근 보고: {text(report?.last_report)}</p>
      <p className="mt-1 text-sm leading-7 text-muted-foreground">상태: {typeof report?.status === "string" && report.status.length > 0 ? report.status : "미확인 — 새 보고 없음"}</p>

      <h3 className="mt-6 text-base font-medium text-foreground">참고</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-muted-foreground">
        {data.notes.map((note) => <li key={note}>{note}</li>)}
      </ul>
    </>
  );
}

/**
 * 로컬 작업 현황을 full(연구 기록) 또는 compact(홈)로 그린다.
 * 데이터가 없으면 진행을 지어내지 않고 실행 기록 없음/확인 필요로 남긴다.
 * @param props 모드와 확인된 로컬 상태.
 * @returns 전체 블록 또는 한 줄 strip.
 */
export function LocalStatusView({ mode, data, checkedAt, failed, loaded }: LocalStatusViewProps) {
  if (mode === "compact") {
    const summary = failed
      ? "상태 확인 실패"
      : data === null
        ? loaded ? "실행 기록 없음" : "상태 확인 중"
        : `${text(data.current?.stage)} · 마지막 활동 ${kst(data.current?.last_activity_at)}`;
    return (
      <p data-local-status="compact" className="border-t border-border py-3 text-xs text-muted-foreground">
        로컬 작업 현황: {summary} <a className="source-link" href="/research#local-status">연구 기록에서 보기</a>
      </p>
    );
  }
  return (
    <section id="local-status" data-local-status="full" aria-labelledby="local-status-title" className="border-b border-border py-6">
      <div className="section-heading">
        <div>
          <p className="section-kicker">LOCAL / 로컬 작업 현황</p>
          <h2 id="local-status-title" className="text-xl font-semibold tracking-tight sm:text-2xl">로컬 작업 현황</h2>
        </div>
        <span className="text-tag">로컬 전용</span>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">로컬 개발 서버에서만 보이는 실행 기록입니다. 진행률 분모가 없으므로 백분율은 표시하지 않습니다.</p>
      {failed ? <p role="status" className="mt-3 text-sm text-muted-foreground">상태 확인 실패 — 로컬 상태 endpoint에 연결하지 못했습니다.</p> : null}
      {data === null ? <p role="status" className="mt-3 text-sm text-muted-foreground">{loaded ? "실행 기록 없음" : "상태 확인 중"}</p> : <FullStatus data={data} checkedAt={checkedAt} />}
    </section>
  );
}

/**
 * 로컬 상태 endpoint를 읽고 5초마다 다시 확인하는 클라이언트 wrapper.
 * 서버 렌더에서는 확인 중 상태만 그린다.
 * @param props 표시 모드.
 * @returns 표시 블록.
 */
export function LocalStatus({ mode }: { mode: "full" | "compact" }) {
  const [state, setState] = useState<LocalStatusState>({ data: null, checkedAt: null, failed: false, loaded: false });
  useEffect(() => {
    let active = true;
    /** @returns 현재 로컬 상태를 state에 반영한다. */
    async function load() {
      try {
        const response = await fetch("/api/local-status", { headers: { Accept: "application/json" }, cache: "no-store" });
        const payload: unknown = response.ok ? await response.json().catch(() => null) : null;
        if (!active) return;
        setState({
          data: isLocalWorkStatus(payload) ? payload : null,
          checkedAt: response.ok ? new Date().toISOString() : null,
          failed: !response.ok,
          loaded: true,
        });
      } catch {
        if (active) setState({ data: null, checkedAt: null, failed: true, loaded: true });
      }
    }
    void load();
    const timer = window.setInterval(() => { void load(); }, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);
  return <LocalStatusView mode={mode} {...state} />;
}
