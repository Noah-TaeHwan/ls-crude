/** 정본 인벤토리에서 읽은 연구 기록. */
export interface ResearchRecord {
  id: string;
  name: string;
  role: string;
  conclusion: string;
  status: string;
  inSample: string;
  outSample: string;
  sourceHref: string;
  group: string;
}

/** 읽기 쉬운 표시만을 위한 판정 필터. 원문 상태는 별도로 보존한다. */
export const RESEARCH_FILTERS = ["전체", "보류", "기각", "미검증", "보관", "관측", "별도 전략", "분석 제외", "확인 필요"] as const;

/**
 * 원문의 강조 표기를 일반 텍스트로 표시한다.
 * @param text 원문 셀.
 * @returns 강조 구문을 제거한 텍스트.
 */
function plain(text: string): string {
  return text.replace(/[*`]/g, "").trim();
}

/**
 * 정본의 상태 키워드로 탐색 그룹을 정한다. 모호한 상태는 확인 필요로 남긴다.
 * @param status 정본 상태 셀.
 * @returns 탐색용 그룹.
 */
function statusGroup(status: string): string {
  if (status.includes("HOLD")) return "보류";
  if (status.includes("REJECTED")) return "기각";
  if (status.includes("미검증")) return "미검증";
  if (status.includes("ARCHIVED")) return "보관";
  if (/MONITOR|MEME/.test(status)) return "관측";
  if (status.includes("별도 전략")) return "별도 전략";
  if (status.includes("SKIP")) return "분석 제외";
  return "확인 필요";
}

/**
 * 연구 정본의 검정표와 카드 표를 번호로 연결한다. 누락·중복이면 수치를 게시하지 않는다.
 * @param markdown research/factors/README.md 원문.
 * @returns 원문으로 연결되는 기록과 정본에 명시된 통과 수.
 */
export function parseResearchLedger(markdown: string): { records: ResearchRecord[]; passCount: number } {
  /**
   * 링크 표기와 무관하게 이름이 유일한 섹션의 표 행을 읽는다.
   * @param heading 정본 섹션 제목.
   * @returns 섹션이 없거나 중복되면 빈 배열, 아니면 셀 행.
   */
  const rowsIn = (heading: string): string[][] => {
    const sections = markdown.replace(/\r\n/g, "\n").split(`\n## ${heading}\n`);
    if (sections.length !== 2) return [];
    return sections[1].split("\n## ")[0].split("\n")
      .filter((line) => /^\| \d{3} \|/.test(line))
      .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
  };
  const scores = rowsIn("라이브 상관관계 스코어보드");
  const cards = rowsIn("현재 인벤토리와 카드별 검증 기록");
  const passMatch = markdown.match(/\*\*현재 통과 수\*\*:\s*(\d+)개/);
  if (!scores.length || scores.length !== cards.length || !passMatch ||
      new Set(scores.map((row) => row[0])).size !== scores.length ||
      new Set(cards.map((row) => row[0])).size !== cards.length) {
    throw new Error("연구 정본의 표 구성을 확인해야 합니다.");
  }
  const records = scores.map((score) => {
    const card = cards.find((row) => row[0] === score[0]);
    const link = card?.[1].match(/^\[([^\]]+)\]\((\d{3}-[a-z0-9-]+\/README\.md)\)$/);
    if (!card || !link || score.length !== 5 || card.length !== 5) {
      throw new Error("연구 정본의 카드 연결을 확인해야 합니다.");
    }
    return {
      id: score[0], name: link[1], role: plain(card[2]), conclusion: plain(card[3]),
      status: plain(score[4]), inSample: plain(score[2]), outSample: plain(score[3]),
      sourceHref: `https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/factors/${link[2]}`,
      group: statusGroup(score[4]),
    };
  });
  return { records, passCount: Number(passMatch[1]) };
}

/** 화면에서 자세히 설명할 세 가지 실제 연구 사례. 연결 경로는 모두 검정 가설이다. */
export const RESEARCH_STORIES = [
  {
    id: "001", label: "피자 주문 원안", category: "출발점", verdict: "원안 철회",
    question: "주문량으로 활동 변화를 읽을 수 있을까?",
    trace: "피자 주문의 평소 대비 변화", mechanism: "활동 변화 → 연료 소비 변화라는 원안",
    evidence: "원래 Pentagon 주문 가설은 철회했습니다. 공개 장기 주문 시계열이 없고, 다른 지출 자료는 주문량을 측정하지 않습니다.",
    next: "001B 민간 도시권 가설은 별도 보류 상태입니다. 적격 익명 주문 집계가 있어야 새 검정을 시작할 수 있습니다.",
    gap: "주문 시계열 미확보", scope: "원안 철회 · 민간 도시권 후속 가설 미검증",
  },
  {
    id: "009", label: "이란 환율 스트레스", category: "반증 사례", verdict: "기각",
    question: "환율의 긴장이 원유 시장에도 나타날까?",
    trace: "공개 USD/IRR 환율 변화", mechanism: "현지 스트레스 → 원유 공급 불확실성이라는 가설",
    evidence: "확보한 환율 자료의 WTI 변동성 관계는 IS r=-0.003, OOS r=-0.002였습니다. 두 구간 모두 0에 가까워 기각했습니다.",
    next: "같은 결과를 통과로 바꾸지 않습니다. 다른 관측값을 쓰려면 별도의 가설과 검정 기준이 필요합니다.",
    gap: "관계 미확인 · 채택하지 않음", scope: "검정 요약 확보 · 이 화면에 정렬된 후보 시계열은 없음",
  },
  {
    id: "018", label: "정유 권역 열 이상", category: "열린 질문", verdict: "보류",
    question: "위성의 열 변화가 정유 운영 변화와 함께 나타날까?",
    trace: "VIIRS의 공개 열 이상", mechanism: "정유 운영 변화 → 정제품·원유 변동성의 맥락이라는 가설",
    evidence: "공개 열 이상은 관측 가능하지만, 정유 권역 단위의 장기 패널과 당시 공개 시점은 미확보입니다. 열 변화가 가동률을 뜻하지는 않습니다.",
    next: "공개 시각이 남은 역사 패널을 확보하고, 실제 운영 자료와 대조한 뒤 WTI와 비교해야 합니다.",
    gap: "장기 패널·공개 시각 미확보", scope: "데이터 적격성 확인에서 보류",
  },
] as const;
