import rawSummary from "../data/cai-experiment-summary.json?raw";
import { parseExperimentSummary, type ExperimentSummary } from "./experiment-summary";

/**
 * 빌드에 포함된 회고 실험 요약 정본을 읽는다.
 * 파일 경로는 클라이언트로 전달하지 않고, v1 계약이 아니면 null을 돌려준다.
 * @returns 검증된 요약 또는 null.
 */
export function readExperimentSummary(): ExperimentSummary | null {
  try {
    return parseExperimentSummary(JSON.parse(rawSummary));
  } catch {
    return null;
  }
}
