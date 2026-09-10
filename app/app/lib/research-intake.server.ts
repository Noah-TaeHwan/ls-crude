import csv from "../../../research/candidates/ledger.csv?raw";
import { parseResearchIntake } from "./research-intake";

/**
 * Vite glob 키를 원장의 record_path와 같은 저장소 상대 경로로 맞춘다.
 * @param globKey import.meta.glob이 준 모듈 경로.
 * @returns research/candidates/ALT-….md 또는 빈 문자열.
 */
function cardRecordPath(globKey: string) {
  const file = globKey.split("?")[0].split("/").pop() ?? "";
  return /^ALT-\d{8}-\d{2}\.md$/.test(file) ? `research/candidates/${file}` : "";
}

/** 빌드 시점 후보 원문. 런타임 파일시스템에 의존하지 않는다. */
const cards = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../../../research/candidates/ALT-*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  ).flatMap(([path, value]) => {
    const recordPath = cardRecordPath(path);
    return recordPath ? [[recordPath, value]] : [];
  }),
);

/** @returns 정본 접수 기록 또는 빈 장부와 구분되는 오류. */
export function readResearchIntake() {
  try {
    return { records: parseResearchIntake(csv, cards), error: null };
  } catch {
    return { records: [], error: "진행 후보 장부와 후보 카드의 형식·일치를 확인하지 못했습니다. GitHub 정본을 확인해 주세요." };
  }
}
