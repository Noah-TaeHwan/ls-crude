/** 접수 원장 필드 순서. */
const FIELDS = "candidate_id,name,thesis,availability,collection_status,test_status,evidence_level,decision,decision_reason,next_action,owner,next_review_date,record_path".split(",");
/** 원장에 허용된 상태 값. */
const ENUMS: Record<string, string[]> = { availability: ["public", "needs_key", "scrape", "manual", "unavailable"], collection_status: ["NOT_STARTED", "COLLECTING", "COLLECTED", "BLOCKED", "FAILED"], test_status: ["NOT_RUN", "RUN"], evidence_level: ["E0", "E1", "E2", "E3", "E4"], decision: ["KEEP", "KILL", "PARK"], owner: ["오태환", "손성찬"] };
/** 공개 저장소 정본 주소. */
export const INTAKE_ROOT = "https://github.com/Noah-TaeHwan/ls-crude";
/** CSV와 후보 카드의 필드 및 근거 링크. */
export interface IntakeRecord { fields: Record<string, string>; sourceHref: string; historyHref: string; notes: string[] }

/**
 * 따옴표 안 쉼표·줄바꿈·이스케이프를 보존하며 CSV를 읽는다.
 * @param text CSV 원문.
 * @returns 행과 셀. 닫히지 않은 따옴표는 오류.
 */
function csvRows(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false; let closed = false;
  const input = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === '"' && !cell && !closed) quoted = true;
    else if (char === "," || char === "\n") {
      row.push(cell); cell = ""; closed = false;
      if (char === "\n") { rows.push(row); row = []; }
    } else {
      if (closed || char === '"') throw new Error("CSV 따옴표 형식 오류");
      cell += char;
    }
  }
  if (quoted) throw new Error("CSV 따옴표 미완료");
  if (cell || row.length || closed) rows.push([...row, cell]);
  return rows;
}

/**
 * 원장 전체와 카드 핵심 필드를 대조한다. 일부만 정상이어도 성공 처리하지 않는다.
 * @param csv 접수 원장 CSV.
 * @param cards 저장소 상대 경로별 후보 Markdown.
 * @returns 등록 ID 역순 후보 목록.
 */
export function parseResearchIntake(csv: string, cards: Record<string, string>): IntakeRecord[] {
  const [header, ...rows] = csvRows(csv);
  if (!header || header.join(",") !== FIELDS.join(",") || !rows.length) throw new Error("접수 원장 헤더 또는 행 누락");
  const seen = new Set<string>();
  const records = rows.map((cells) => {
    if (cells.length !== FIELDS.length || cells.some((cell) => !cell.trim())) throw new Error("접수 필드 누락");
    const fields = Object.fromEntries(FIELDS.map((key, i) => [key, cells[i]]));
    const id = fields.candidate_id;
    if (!/^ALT-\d{8}-\d{2}$/.test(id) || seen.has(id)) throw new Error("접수 ID 중복 또는 형식 오류");
    const day = `${id.slice(4, 8)}-${id.slice(8, 10)}-${id.slice(10, 12)}`;
    if (id.endsWith("-00") || new Date(day).toISOString().slice(0, 10) !== day) throw new Error("접수 ID 날짜 오류");
    seen.add(id);
    for (const [key, allowed] of Object.entries(ENUMS)) if (!allowed.includes(fields[key])) throw new Error(`접수 상태 오류: ${id} ${key}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.next_review_date) || new Date(fields.next_review_date).toISOString().slice(0, 10) !== fields.next_review_date) throw new Error("재검토일 오류");
    if (fields.record_path !== `research/candidates/${id}.md`) throw new Error("후보 경로 오류");
    const markdown = cards[fields.record_path];
    if (!markdown) throw new Error(`후보 카드 누락: ${id}`);
    const cardFields: Record<string, string> = {};
    for (const line of markdown.split(/\r?\n/)) {
      const match = line.match(/^\|\s*([a-z_]+)\s*\|\s*(.*?)\s*\|\s*$/);
      if (!match || match[1] === "field") continue;
      if (match[1] in cardFields) throw new Error(`카드 필드 중복: ${id}`);
      cardFields[match[1]] = match[2];
    }
    for (const key of FIELDS.filter((key) => key !== "record_path")) if (cardFields[key] !== fields[key]) throw new Error(`원장·카드 불일치: ${id} ${key}`);
    const notes = [...new Set([...markdown.matchAll(/\]\(\.\.\/gathering\/notes\/([a-zA-Z0-9_-]+\.md)(?:#[^)]*)?\)/g)].map((match) => `${INTAKE_ROOT}/blob/main/research/gathering/notes/${match[1]}`))];
    return { fields: { ...cardFields, ...fields }, sourceHref: `${INTAKE_ROOT}/blob/main/${fields.record_path}`, historyHref: `${INTAKE_ROOT}/commits/main/${fields.record_path}`, notes };
  });
  if (Object.keys(cards).filter((key) => /\/ALT-\d{8}-\d{2}\.md$/.test(key)).length !== records.length) throw new Error("원장에 없는 후보 카드");
  return records.sort((a, b) => b.fields.candidate_id.localeCompare(a.fields.candidate_id));
}
