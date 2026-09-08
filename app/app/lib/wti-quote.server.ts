/** Yahoo가 제공한 최근 시세와 실제 조회 시각. */
export interface WtiQuote { price: number; observedAt: string; fetchedAt: string }
/** 최신 조회 성공 여부와 마지막 정상 시세를 구분한다. */
export interface WtiQuoteView { quote: WtiQuote | null; error: string | null }
/** Yahoo 공개 chart 메타데이터 주소. */
const URL = "https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=1d&range=5d";
/** 인스턴스 내 1분 캐시. 재시작 시 새로 조회한다. */
let cached: WtiQuote | null = null;

/**
 * 종목·통화·가격·시각을 확인하고 최신 시세만 추출한다.
 * @param value Yahoo 응답.
 * @param now 실제 조회 시각.
 * @returns 검증된 시세. 잘못된 응답은 오류.
 */
export function parseWtiQuote(value: unknown, now: Date): WtiQuote {
  const meta = (value as { chart?: { error?: unknown; result?: { meta?: Record<string, unknown> }[] } })?.chart;
  const m = meta?.result?.[0]?.meta;
  if (meta?.error || !m || m.symbol !== "CL=F" || m.currency !== "USD" || m.instrumentType !== "FUTURE" || typeof m.regularMarketPrice !== "number" || !Number.isFinite(m.regularMarketPrice) || typeof m.regularMarketTime !== "number" || !Number.isFinite(m.regularMarketTime) || m.regularMarketTime <= 0 || m.regularMarketTime * 1000 > now.getTime() + 60_000) throw new Error("Yahoo 시세 형식 오류");
  return { price: m.regularMarketPrice, observedAt: new Date(m.regularMarketTime * 1000).toISOString(), fetchedAt: now.toISOString() };
}

/**
 * 가격 배포를 기다리지 않고 최근 시세를 조회한다. 실패하면 마지막 정상본의 시각을 보존한다.
 * @param fetcher HTTP 요청 함수. 테스트에서 실패와 정상 응답을 재현한다.
 * @param now 조회 기준 시각.
 * @returns 시세와 조회 실패 설명.
 */
export async function readWtiQuote(fetcher: typeof fetch = fetch, now = new Date()): Promise<WtiQuoteView> {
  if (cached && now.getTime() >= Date.parse(cached.fetchedAt) && now.getTime() - Date.parse(cached.fetchedAt) < 60_000) return { quote: cached, error: null };
  try {
    const response = await fetcher(URL, { signal: AbortSignal.timeout(3500), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
    cached = parseWtiQuote(await response.json(), now);
    return { quote: cached, error: null };
  } catch {
    return { quote: cached, error: "최신 시세 조회에 실패했습니다. 표시된 가격의 시각을 확인하세요." };
  }
}
