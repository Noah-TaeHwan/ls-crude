import { parseWtiDaily, type WtiDailySnapshot, type WtiDailyView } from "./wti-daily.ts";

/** 5년 전체를 한 번 받아 모든 화면 기간을 동일한 실제 일봉으로 보여준다. */
const URL = "https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=5y";
/** 인스턴스 내 마지막 정상 응답. 조회 실패 때 원래 시각을 보존한다. */
let cached: WtiDailySnapshot | null = null;

/**
 * 1분 캐시로 Yahoo 일봉을 조회하고 실패하면 마지막 정상 응답 전체를 유지한다.
 * @param fetcher HTTP 함수. 테스트에서 실패와 정상 응답을 재현한다.
 * @param now 조회 기준 시각.
 * @returns 검증된 일봉과 이번 조회 오류.
 */
export async function readWtiDaily(fetcher: typeof fetch = fetch, now = new Date()): Promise<WtiDailyView> {
  if (cached && now.getTime() >= Date.parse(cached.fetchedAt) && now.getTime() - Date.parse(cached.fetchedAt) < 60000) return { data: cached, error: null };
  try {
    const response = await fetcher(URL, { signal: AbortSignal.timeout(3500), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
    const next = parseWtiDaily(await response.json(), now);
    if (cached && next.bars.at(-1)!.date < cached.bars.at(-1)!.date) throw new Error("Yahoo 일봉 기준일 역행");
    cached = next;
    return { data: cached, error: null };
  } catch {
    return { data: cached, error: "최신 일봉 조회에 실패했습니다. 마지막 정상 자료의 날짜와 조회 시각을 확인하세요." };
  }
}
