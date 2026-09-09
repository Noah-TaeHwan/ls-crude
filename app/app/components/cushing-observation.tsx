import { Link } from "react-router";

/** 점수 전제·제외 목록의 정본(프로그램 원문). */
const PROGRAM_URL =
  "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/programs/cushing-busy/PROGRAM.md";
/** 관측 정의·증거의 정본(팩터 원장). */
const LEDGER_URL =
  "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/factors/091-cushing-motel-lights-index/README.md";

/** 보드 JSON의 한 행. */
export type CushingLane = {
  id: string;
  name?: string;
  status?: string;
  last_observation?: string | null;
  note?: string;
  reason?: string;
  venues?: string[];
};

/** 쿠싱 보드 JSON의 화면 표시용 구조. */
export type CushingBoard = {
  question: string;
  verdict: string;
  verdict_note: string;
  as_of_utc: string;
  lanes: {
    activity_forward: CushingLane[];
    physical_context: CushingLane[];
    excluded: CushingLane[];
  };
};

/** 관측 종류별 한국어 표시. 주화면에는 코드·영문 메모를 반복하지 않는다. */
const KIND: Record<string, { label: string; known: string; limit: string }> = {
  "091-U": { label: "구인 공고", known: "공개된 구인 목록", limit: "현장 인원 수가 아님" },
  "091-Y": { label: "주유소 가격판", known: "게시된 가격", limit: "판매량이 아님" },
  "091-Z": { label: "지역 산업 소식", known: "확인 대기 중인 소식 목록", limit: "기사 수가 활동량이 아님" },
  "091-V": { label: "인허가 상태 기록", known: "인허가 상태 확인 기록", limit: "공사량이 아님" },
};

/**
 * UTC ISO 시각을 KST(UTC+9) 일·시·분으로 표시한다.
 * @param value ISO 시각 문자열.
 * @returns "YYYY-MM-DD HH:mm KST" 또는 해석 불가 시 원문.
 */
function kst(value: string) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return `${new Date(time + 9 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ")} KST`;
}

/**
 * 쿠싱 현장 관측을 질문→판단 보류→흔적/없음/다음 확인 구조로 보여준다. 점수·합성·추세를 만들지 않는다.
 * @param props 보드 정본과 상세 화면 여부.
 * @returns 홈 카드와 상세 화면이 공유하는 관측 영역.
 */
export function CushingObservation({ board, detail = false }: { board: CushingBoard; detail?: boolean }) {
  const Heading = detail ? "h1" : "h3";
  const Sub = detail ? "h2" : "h4";
  const hold = board.verdict === "INSUFFICIENT";
  const traces = board.lanes.activity_forward.filter((row) => row.id !== "091-S");
  const restaurant = board.lanes.activity_forward.find((row) => row.id === "091-S");
  const venueCount = restaurant?.venues?.length;
  const verbatim = [...board.lanes.activity_forward, ...board.lanes.physical_context];
  return (
    <div className="min-w-0">
      <div className="section-heading">
        <div>
          <p className="section-kicker">쿠싱 · 현장 관측</p>
          <Heading id="cushing-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            쿠싱 현장은 지금 바쁜가?
          </Heading>
        </div>
        <span className="status-stamp">{hold ? "판단 보류" : "원문 확인 필요"}</span>
      </div>
      <p className="mt-4 text-sm leading-7">
        {hold
          ? "아직 판단할 수 없습니다. 식당 혼잡도 등 독립적으로 검증된 현장 관측이 아직 부족합니다."
          : "판정 형식이 달라 원문 확인이 필요합니다. 아래 원문 기록과 프로그램 원문을 확인하세요."}
      </p>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">보드 정리 시각 {kst(board.as_of_utc)} · 고정 기록</p>
      <Sub className="mt-6 text-sm font-medium">확보한 흔적</Sub>
      <ul className="mt-2 space-y-2 text-sm leading-7">
        {traces.map((row) => {
          const kind = KIND[row.id] ?? { label: row.name ?? row.id, known: "전향 관측", limit: row.note ?? "" };
          return (
            <li key={row.id} className="border-t border-border pt-2">
              <strong>{kind.label}</strong> · {kind.known}. <span className="text-muted-foreground">{kind.limit}</span>
            </li>
          );
        })}
      </ul>
      <Sub className="mt-6 text-sm font-medium">아직 없는 관측</Sub>
      <div className="mt-2 rounded-sm border border-border p-4 text-sm leading-7">
        <p>
          <strong>식당가 붐빔 라벨</strong> · 관측 기록 아직 없음 ·{" "}
          {typeof venueCount === "number" ? `관측 대상 식당 ${venueCount}곳` : "관측 대상 수 확인 필요"}
        </p>
        <p className="mt-1 text-muted-foreground">
          기록 방식: 한산함(quieter) · 평소(usual) · 붐빔(busier) · 표시 없음(not shown). 표시 없음은 표시 자체가
          없었던 기록이며, 빠짐이나 0이 아닙니다.
        </p>
      </div>
      <Sub className="mt-6 text-sm font-medium">다음 확인</Sub>
      <p className="mt-2 text-sm leading-7">
        날짜가 적힌 식당 관측부터 쌓습니다. 1행이 모여도 점수를 매기지 않습니다. 점수 전제(90일 관측, 예정 슬롯 80%
        이상, 다른 독립 현장 자료 검증, 사전 가중 최대 3개)는{" "}
        <a className="source-link" href={PROGRAM_URL}>
          프로그램 원문
        </a>
        에서 확인하세요.
      </p>
      <Sub className="mt-6 text-sm font-medium">함께 볼 재고 자료 — 바쁨 측정이 아님</Sub>
      <ul className="mt-2 space-y-2 text-sm leading-7">
        {board.lanes.physical_context.map((row) => (
          <li key={row.id} className="border-t border-border pt-2">
            <strong>탱크 재고</strong> · 탱크가 얼마나 찼는지만 보여주며, 현장이 바쁜지는 알 수 없습니다. 수치·기준
            주는 아래 원문 기록에서 확인하세요.
          </li>
        ))}
      </ul>
      <details className="mt-6 border-t border-border">
        <summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">관측별 기록과 출처 펼치기</summary>
        <ul className="space-y-3 pb-2 text-sm leading-7">
          {verbatim.map((row) => (
            <li key={row.id} className="border-t border-border pt-3">
              <p className="font-medium">
                {row.id} · {row.name} <span className="font-normal text-muted-foreground">{row.status}</span>
              </p>
              <p className="mt-1">{row.last_observation ?? "아직 날짜 있는 행 없음"}</p>
              {row.id === "091-S" && Array.isArray(row.venues) ? (
                <p className="mt-1">관측 대상: {row.venues.join(" · ")}</p>
              ) : null}
              {row.note ? <p className="mt-1 text-muted-foreground">{row.note}</p> : null}
            </li>
          ))}
        </ul>
        <p className="py-2 text-sm text-muted-foreground">원문 판정: {board.verdict} — {board.verdict_note}</p>
        <ul className="space-y-2 pb-2 text-sm text-muted-foreground">
          {board.lanes.excluded.map((row) => (
            <li key={row.id}>
              <span className="font-medium text-foreground">{row.id}</span> — {row.reason}
            </li>
          ))}
        </ul>
      </details>
      <div className="mt-5 flex flex-wrap gap-5 border-t border-border pt-4 text-sm">
        {!detail ? (
          <Link className="source-link" to="/observations/cushing-busy">
            전체 보드 →
          </Link>
        ) : null}
        <a className="source-link" href={PROGRAM_URL}>
          프로그램 원문
        </a>
        <a className="source-link" href={LEDGER_URL}>
          관측 정의·증거 원장
        </a>
      </div>
    </div>
  );
}
