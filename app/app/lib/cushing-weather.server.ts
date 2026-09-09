import { parseCushingWeather, type CushingWeatherSnapshot, type CushingWeatherView } from "./cushing-weather.ts";

/** AWC 공식 API의 KCUH 최신 METAR. https://aviationweather.gov/data/api/ */
const URL = "https://aviationweather.gov/api/data/metar?ids=KCUH&format=json";
/** 인스턴스 내 마지막 정상 응답. 재시작 후에는 실패 시 자료 없음으로 표시한다. */
let cached: CushingWeatherSnapshot | null = null;

/**
 * 10분 캐시와 3.5초 제한으로 KCUH 날씨를 읽는다. 조회 실패 시 마지막 정상 시각을 바꾸지 않는다.
 * @param fetcher HTTP 함수. 테스트에서 공급자 오류를 재현한다.
 * @param now 조회 기준 시각.
 * @returns 검증된 관측 또는 마지막 정상 응답과 이번 오류.
 */
export async function readCushingWeather(fetcher: typeof fetch = fetch, now = new Date()): Promise<CushingWeatherView> {
  if (cached && now.getTime() >= Date.parse(cached.fetchedAt) && now.getTime() - Date.parse(cached.fetchedAt) < 600000) return { data: cached, error: null };
  try {
    const response = await fetcher(URL, { signal: AbortSignal.timeout(3500), headers: { Accept: "application/json", "User-Agent": "ls-crude-observations/1.0" } });
    if (!response.ok || response.status === 204) throw new Error(`AWC HTTP ${response.status}`);
    const next = parseCushingWeather(await response.json(), now);
    if (cached && next.observedAt < cached.observedAt) throw new Error("AWC 최신 관측 역행");
    cached = next;
    return { data: cached, error: null };
  } catch {
    return { data: cached, error: "쿠싱 공항 날씨 조회 또는 검증에 실패했습니다. 마지막 정상 관측·조회 시각을 확인하세요." };
  }
}
