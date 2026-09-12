/**
 * cai-local-work-status/v1의 표시용 타입, 스키마 문자열과 로컬 전용 가드.
 * 값은 로컬 실행 산출물에서 오며 화면은 진행률을 만들지 않는다.
 */

/** 로컬 상태 JSON의 schema 문자열. */
export const LOCAL_STATUS_SCHEMA = "cai-local-work-status/v1";

/** 실행 한 건의 모델 상태 수. */
export interface LocalStatusModels {
  done: number;
  blocked: number;
  failed: number;
  pending: number;
  running: number;
}

/** 로컬 실행 한 건. 종료 시각이 없으면 종료 결과를 확인해야 한다. */
export interface LocalStatusRun {
  id: string;
  base: string;
  started_utc: string | null;
  finished_utc: string | null;
  models: LocalStatusModels;
  train_rows: number | null;
  cached: boolean | null;
}

/** 다운로드 한 건. complete는 원천에 값이 없으면 null이다. */
export interface LocalStatusDownload {
  label: string;
  files: number | null;
  bytes: number | null;
  latest_activity_utc: string | null;
  complete: boolean | null;
}

/** 입력 파일 한 건. 경로가 아니라 이름만 표시한다. */
export interface LocalStatusInput {
  name: string;
  bytes: number | null;
  modified_utc: string | null;
}

/** 상대 팀 보고 상태. 새 보고가 없으면 status가 미확인으로 남는다. */
export interface LocalStatusReport {
  last_report: string | null;
  status: string | null;
}

/** 현재 작업 묶음. */
export interface LocalStatusCurrent {
  task: string | null;
  owner: string | null;
  stage: string | null;
  started_at: string | null;
  last_activity_at: string | null;
  throughput: string | null;
  blocker: string | null;
  result: string | null;
  screen_reflected: string | null;
  seongchan?: LocalStatusReport;
}

/** 로컬 작업 현황 JSON 전체. */
export interface LocalWorkStatus {
  schema: string;
  kind: string;
  generated_at_utc: string | null;
  source: string | null;
  current: LocalStatusCurrent;
  downloads: LocalStatusDownload[];
  runs: LocalStatusRun[];
  inputs: LocalStatusInput[];
  seongchan: LocalStatusReport;
  notes: string[];
}

/**
 * 프로덕션 배포에서는 로컬 상태 endpoint를 숨긴다.
 * @param nodeEnv 확인할 NODE_ENV 값.
 * @returns 차단이면 404 Response, 허용이면 null.
 */
export function localStatusGuard(nodeEnv: string | undefined): Response | null {
  if (nodeEnv === "production") {
    return new Response("Not Found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}
