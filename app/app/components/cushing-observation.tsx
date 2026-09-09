import { useState } from "react";
import { Link } from "react-router";
import { ResearchChart } from "~/components/research-chart";
import { readCushingAadt, readCushingBps, readCushingDeq, readCushingStocks } from "~/lib/cushing-context";
import type { CushingWeatherView } from "~/lib/cushing-weather";
import eiaCsv from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091EIAZ/cushing_stocks_weekly.csv?raw";
import bpsCsv from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091BOARDZ/bps-cushing-monthly.csv?raw";
import aadtInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091BOARDZ/aadt-east-main.json";
import deqInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091BOARDZ/deq-events.json";

/** 고정 EIA 주간 재고. 검증 실패는 결측. */
const STOCKS = readCushingStocks(eiaCsv);
/** 고정 East Main 연간 AADT. */
const AADT = readCushingAadt(aadtInput);
/** 고정 BPS 주거 허가 호수. */
const BPS = readCushingBps(bpsCsv);
/** 고정 DEQ 공개 검토 사건. */
const DEQ = readCushingDeq(deqInput);

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
 * @param props 보드 정본, 상세 화면 여부, 선택적 KCUH 날씨.
 * @returns 홈 카드와 상세 화면이 공유하는 관측 영역.
 */
export function CushingObservation({ board, detail = false, weather = null }: { board: CushingBoard; detail?: boolean; weather?: CushingWeatherView | null }) {
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
      <Sub className="mt-6 text-sm font-medium">날짜가 있는 문맥 — 바쁨 측정이 아님</Sub>
      <p className="mt-2 text-sm leading-7">
        재고·연간 교통량·주거 허가·인허가 사건·공항 날씨를 각각 원래 단위로 둡니다. 현장이 바쁜지는 알 수 없습니다.
        수치·기준 주는 아래 원문 기록에서 확인하세요.
      </p>
      <CushingDatedContext weather={weather} />
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

/** DEQ 상태 표시. 원문 상태를 번역만 한다. */
const DEQ_STATUS: Record<string, string> = { issued: "발급", "technical review": "기술 검토" };

/**
 * 날짜 있는 문맥 관측을 나란히 보여준다. 합성 점수나 WTI 축을 만들지 않는다.
 * @param props 선택적 실시간 날씨.
 * @returns 재고·교통·주거허가·인허가·날씨 영역.
 */
function CushingDatedContext({ weather }: { weather: CushingWeatherView | null }) {
  const [stockIndex, setStockIndex] = useState(STOCKS ? STOCKS.length - 1 : 0);
  const [aadtIndex, setAadtIndex] = useState(AADT ? AADT.length - 1 : 0);
  const [bpsIndex, setBpsIndex] = useState(BPS ? BPS.length - 1 : 0);
  const stock = STOCKS?.[stockIndex];
  const aadt = AADT?.[aadtIndex];
  const bps = BPS?.[bpsIndex];
  const metar = weather?.data;
  return (
    <div className="mt-4 space-y-8">
      {STOCKS && stock ? (
        <div>
          <ResearchChart
            id="cushing-stocks-plot"
            title="쿠싱 상업원유 재고"
            dates={STOCKS.map((row) => row.date)}
            series={[{ label: "주간 기말 재고", color: "#edb958", values: STOCKS.map((row) => row.stockKbbl) }]}
            minimum={0}
            maximum={70000}
            unit="천 배럴"
            selected={stockIndex}
            onSelect={setStockIndex}
            description="EIA Cushing 주간 상업원유 재고 1169주. 2004년4월9일부터 2026년8월28일. 현장 활동이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{stock.date} · {stock.stockKbbl.toLocaleString("en-US")} 천 배럴</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Lincoln·Payne·Creek 탱크팜 합계. 주 종료 2026-08-28이 이 표본의 마지막 발표 주입니다.</p>
        </div>
      ) : (
        <p role="status">재고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {AADT && aadt ? (
        <div>
          <ResearchChart
            id="cushing-aadt-plot"
            title="이스트 메인 연간 교통량"
            dates={AADT.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 AADT", color: "#78b7ed", values: AADT.map((row) => row.aadt), dots: true }]}
            minimum={0}
            maximum={14000}
            unit="대/일"
            selected={aadtIndex}
            onSelect={setAadtIndex}
            start="2015-01-01"
            end="2025-12-31"
            description="ODOT East Main 지점 600645 연간 AADT 11개. 일별 트럭 수가 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">
            {aadt.year} · {aadt.aadt.toLocaleString("en-US")} 대/일
            {aadt.trucks !== null ? ` · 트럭 ${aadt.trucks.toLocaleString("en-US")}` : " · 트럭 분리 없음"}
          </p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱으로 표시된 상시관측소는 0곳입니다. 연간 값을 일별로 펼치지 않습니다.</p>
        </div>
      ) : (
        <p role="status">연간 교통량 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {BPS && bps ? (
        <div>
          <ResearchChart
            id="cushing-bps-plot"
            title="쿠싱 시 주거 건축허가"
            dates={BPS.map((row) => `${row.month}-01`)}
            series={[{ label: "허가 호수", color: "#edb958", values: BPS.map((row) => row.units), dots: true }]}
            minimum={0}
            maximum={5}
            unit="호"
            selected={bpsIndex}
            onSelect={setBpsIndex}
            description="Census BPS Cushing 시 월별 주거 허가 31개월. 탱크·산업 공사가 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{bps.month} · {bps.units}호</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">2024년 1월부터 2026년 7월 현재월 파일. 빠진 달을 0으로 채우지 않았고, 2026년 8월 파일은 아직 없습니다.</p>
        </div>
      ) : (
        <p role="status">주거 허가 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {DEQ ? (
        <div>
          <p className="text-sm font-medium">인허가 상태 사건</p>
          <ul className="mt-2 space-y-2 text-sm leading-7">
            {DEQ.map((row) => (
              <li key={row.permit} className="border-t border-border pt-2">
                <strong>{row.facility}</strong> · {row.permit} · {DEQ_STATUS[row.status] ?? row.status}
                {row.receiptDate ? ` · 접수 ${row.receiptDate}` : " · 접수일 미확인"}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">공사량·작업 시작일이 아닙니다. 없는 날짜를 채워 넣지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">인허가 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      <div>
        <p className="text-sm font-medium">쿠싱 공항 날씨</p>
        {weather?.data || weather?.error ? (
          <>
            {metar ? (
              <p className="mt-2 font-mono text-sm">
                {metar.observedAt.slice(0, 16).replace("T", " ")} UTC · 시정 {metar.visib} SM · 바람 {metar.windKt ?? "—"} kt · {metar.cover || "운량 없음"}
                {metar.temperatureC !== null ? ` · ${metar.temperatureC}°C` : ""}
              </p>
            ) : null}
            {weather?.error ? <p className="mt-2 text-sm text-muted-foreground">{weather.error}</p> : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">날씨는 상세 보드에서 조회합니다.</p>
        )}
        <p className="mt-1 text-xs leading-6 text-muted-foreground">KCUH METAR. 교란요인이며 현장 인원·트럭·재고가 아닙니다.</p>
      </div>
    </div>
  );
}
