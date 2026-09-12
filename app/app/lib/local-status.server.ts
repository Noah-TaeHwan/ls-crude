import { readFileSync } from "node:fs";
import path from "node:path";

import { LOCAL_STATUS_SCHEMA, type LocalWorkStatus } from "./local-status";

/**
 * 요청 시점에 로컬 실행 현황 JSON을 읽는다.
 * 파일이 없거나 스키마가 다르면 null을 돌려주며 경로는 응답에 넣지 않는다.
 * @returns 유효한 로컬 상태 또는 null.
 */
export function readLocalWorkStatus(): LocalWorkStatus | null {
  try {
    const file = path.join(process.cwd(), "app", "data", "local-work-status.json");
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as { schema?: unknown }).schema === LOCAL_STATUS_SCHEMA
    ) {
      return parsed as LocalWorkStatus;
    }
    return null;
  } catch {
    return null;
  }
}
