/** Yahoo가 제공한 5분봉의 시각과 가격. 누락 구간은 점을 만들지 않는다. */
export interface WtiIntradayPoint { time: string; price: number }
/** Yahoo 최근 시세, 실제 조회 시각과 공급자가 제공한 분봉. */
export interface WtiQuote { price: number; observedAt: string; fetchedAt: string; points: WtiIntradayPoint[]; interval: "5m"; chartError: string | null }
/** 최신 조회 성공 여부와 마지막 정상 시세를 구분한다. */
export interface WtiQuoteView { quote: WtiQuote | null; error: string | null }
/** 휴일의 1일 범위는 분봉이 비어 있어 5일 범위에서 실제 관측값을 가져온다. */
const URL = "https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?interval=5m&range=5d";
/** 인스턴스 내 1분 캐시. 재시작 시 새로 조회한다. */
let cached: WtiQuote | null = null;

/**
 * 종목·통화·가격·시각을 검증하고 시세와 최근 실제 5분봉을 추출한다.
 * @param value Yahoo 응답.
 * @param now 실제 조회 시각.
 * @returns 검증된 시세. 분봉 오류는 시세 오류와 구분한다.
 */
export function parseWtiQuote(value: unknown, now: Date): WtiQuote {
  const chart = (value as { chart?: { error?: unknown; result?: { meta?: Record<string, unknown>; timestamp?: unknown; indicators?: { quote?: { close?: unknown }[] } }[] } })?.chart;
  const result = chart?.result?.[0];
  const m = result?.meta;
  if (chart?.error || !m || m.symbol !== "CL=F" || m.currency !== "USD" || m.instrumentType !== "FUTURE" || typeof m.regularMarketPrice !== "number" || !Number.isFinite(m.regularMarketPrice) || typeof m.regularMarketTime !== "number" || !Number.isFinite(m.regularMarketTime) || m.regularMarketTime <= 0 || m.regularMarketTime * 1000 > now.getTime() + 60_000) throw new Error("Yahoo 시세 형식 오류");
  let points: WtiIntradayPoint[] = [];
  let chartError: string | null = null;
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(timestamps) || !Array.isArray(closes) || timestamps.length === 0) {
    chartError = "Yahoo가 분봉 데이터를 제공하지 않았습니다.";
  } else if (m.dataGranularity !== "5m" || timestamps.length !== closes.length || timestamps.length > 2000 || timestamps.some((time, i) => typeof time !== "number" || !Number.isFinite(time) || time <= 0 || time * 1000 > now.getTime() + 60_000 || (i > 0 && time <= timestamps[i - 1])) || closes.some((close) => close !== null && (typeof close !== "number" || !Number.isFinite(close)))) {
    chartError = "Yahoo 분봉 형식 오류로 새 분봉을 사용할 수 없습니다.";
  } else {
    points = timestamps.flatMap((time, i) => closes[i] === null ? [] : [{ time: new Date(time * 1000).toISOString(), price: closes[i] as number }]).slice(-1500);
    if (points.length === 0) chartError = "Yahoo가 유효한 분봉 가격을 제공하지 않았습니다.";
    else if (m.regularMarketTime * 1000 - Date.parse(points.at(-1)!.time) > 15 * 60_000) chartError = "Yahoo 분봉이 최신 시세보다 지연되어 있습니다. 분봉 마지막 시각과 최신 시세 시각을 따로 확인하세요.";
  }
  return { price: m.regularMarketPrice, observedAt: new Date(m.regularMarketTime * 1000).toISOString(), fetchedAt: now.toISOString(), points, interval: "5m", chartError };
}

/**
 * 가격 배포를 기다리지 않고 최근 시세와 분봉을 조회한다. 실패하면 마지막 정상본의 시각을 보존한다.
 * @param fetcher HTTP 요청 함수. 테스트에서 실패와 정상 응답을 재현한다.
 * @param now 조회 기준 시각.
 * @returns 시세와 조회 실패 설명.
 */
export async function readWtiQuote(fetcher: typeof fetch = fetch, now = new Date()): Promise<WtiQuoteView> {
  if (cached && now.getTime() >= Date.parse(cached.fetchedAt) && now.getTime() - Date.parse(cached.fetchedAt) < 60_000) return { quote: cached, error: null };
  try {
    const response = await fetcher(URL, { signal: AbortSignal.timeout(3500), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
    const next = parseWtiQuote(await response.json(), now);
    // 공급자가 일시적으로 분봉을 누락해도 마지막 정상 그래프의 실제 시각을 보존한다.
    if (next.points.length === 0 && cached?.points.length) {
      next.points = cached.points;
      next.chartError = `${next.chartError} 마지막 정상 분봉을 기존 시각으로 표시합니다.`;
    }
    cached = next;
    return { quote: cached, error: null };
  } catch {
    return { quote: cached, error: "최신 시세 조회에 실패했습니다. 표시된 가격의 시각을 확인하세요." };
  }
}
