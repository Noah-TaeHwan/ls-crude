import csv from "../../../research/candidates/ledger.csv?raw";
import { parseResearchIntake } from "./research-intake";
/** 빌드 시점 후보 원문. 런타임 파일시스템에 의존하지 않는다. */
const cards = Object.fromEntries(Object.entries(import.meta.glob<string>("../../../research/candidates/ALT-*.md", { query: "?raw", import: "default", eager: true })).map(([path, value]) => [path.replace("../../../", ""), value]));
/** @returns 정본 접수 기록 또는 빈 장부와 구분되는 오류. */
export function readResearchIntake() {
  try { return { records: parseResearchIntake(csv, cards), error: null }; }
  catch { return { records: [], error: "접수 장부와 후보 카드의 형식·일치를 확인하지 못했습니다. GitHub 정본을 확인해 주세요." }; }
}
