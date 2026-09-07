import ledgerMarkdown from "../../../research/factors/README.md?raw";
import { parseResearchLedger } from "./research-ledger";

/**
 * 빌드에 포함된 연구 정본을 읽는다. 형식 오류는 빈 장부와 구분해 전달한다.
 * @returns 연구 기록, 통과 수 또는 오류 메시지.
 */
export function readResearchLedger() {
  try {
    return { ...parseResearchLedger(ledgerMarkdown), error: null };
  } catch {
    return { records: [], passCount: null, error: "연구 장부를 표시하지 못했습니다. 원문에서 현재 기록을 확인할 수 있습니다." };
  }
}
