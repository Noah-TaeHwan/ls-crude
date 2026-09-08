import { parseTankerArrivals, TANKER_RESOURCES, type TankerSnapshot, type TankerView } from "./tanker-arrivals.ts";

/** 인스턴스 내 마지막 정상 응답. 연구 표본을 실시간 대체값으로 사용하지 않는다. */
let cached: TankerSnapshot | null = null;

/**
 * 공식 두 자료를 병렬 조회하고 6시간 캐시한다. 실패 시 정상 관측·조회 시각 전체를 보존한다.
 * @param fetcher HTTP 함수. 테스트에서는 부분 실패·잘못된 응답을 주입한다.
 * @param now 조회 기준 시각.
 * @returns 대사된 월간 관측 또는 마지막 정상 관측과 이번 오류.
 */
export async function readTankerArrivals(fetcher: typeof fetch = fetch, now = new Date()): Promise<TankerView> {
  if (cached && now.getTime() >= Date.parse(cached.fetchedAt) && now.getTime() - Date.parse(cached.fetchedAt) < 6 * 3600000) return { data: cached, error: null };
  try {
    const payloads = await Promise.all((Object.keys(TANKER_RESOURCES) as (keyof typeof TANKER_RESOURCES)[]).map(async (source) => {
      const query = new URLSearchParams({ resource_id: TANKER_RESOURCES[source], limit: source === "breakdown" ? "36" : "12", sort: "month desc" });
      const response = await fetcher(`https://data.gov.sg/api/action/datastore_search?${query}`, { signal: AbortSignal.timeout(3500), headers: { Accept: "application/json", "User-Agent": "ls-crude-observations/1.0" } });
      if (!response.ok || response.status === 204) throw new Error(`MPA HTTP ${response.status}`);
      return response.json();
    }));
    const next = parseTankerArrivals(payloads[0], payloads[1], now);
    if (cached && (next.latestMonth < cached.latestMonth || next.fetchedAt < cached.fetchedAt)) throw new Error("MPA 최신 월·조회 시각 역행");
    cached = next;
    return { data: cached, error: null };
  } catch {
    return { data: cached, error: "탱커 입항 조회 또는 검증에 실패했습니다. 마지막 정상 자료 월·조회 시각을 확인하세요." };
  }
}
