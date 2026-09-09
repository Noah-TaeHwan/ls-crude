/** 공급자가 실제 제공한 일봉. 날짜는 뉴욕 기준이고 미완성 OHLC는 포함하지 않는다. */
export interface DailyBar { date: string; sourceAt: string; open: number; high: number; low: number; close: number; volume: number | null }
/** 일봉 전체와 같은 응답에서 얻은 조회·관측 시각. */
export interface WtiDailySnapshot { bars: DailyBar[]; fetchedAt: string; observedAt: string; partialLast: boolean; missingCount: number; note: string | null; excludedTail?: { sourceAt: string; calendarDate: string } }
/** 마지막 정상 일봉과 이번 조회 실패를 분리한다. */
export interface WtiDailyView { data: WtiDailySnapshot | null; error: string | null }
/** 달력 기준으로 선택할 수 있는 일봉 기간. */
export const DAILY_RANGES = ["5y", "3y", "1y", "6mo", "3mo", "1mo", "1wk"] as const;
/** 지원하는 일봉 조회 기간. */
export type DailyRange = typeof DAILY_RANGES[number];
/** 뉴욕 날짜를 환경 로캘에 무관하게 구성한다. */
const dayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });

/** 정규 일봉 라벨인 뉴욕 자정과 추가 시세 시각을 구별한다. */
const clockFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

/**
 * 공급자 시각을 뉴욕 달력 날짜로 변환한다.
 * @param time 유효한 날짜.
 * @returns YYYY-MM-DD 날짜.
 */
function newYorkDay(time: Date): string {
  const parts = dayFormatter.formatToParts(time);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)!.value).join("-");
}

/**
 * Yahoo 일봉의 종목·배열·가격·시각을 검증하고 실제 OHLC만 반환한다.
 * @param value Yahoo chart 응답.
 * @param now 조회 기준 시각.
 * @returns 최신 잠정 일봉까지 포함한 정상 응답.
 */
export function parseWtiDaily(value: unknown, now = new Date()): WtiDailySnapshot {
  const chart = (value as { chart?: { error?: unknown; result?: { meta?: Record<string, unknown>; timestamp?: unknown; indicators?: { quote?: Record<string, unknown>[] } }[] } })?.chart;
  const result = chart?.result?.[0];
  const meta = result?.meta;
  const times = result?.timestamp;
  const quote = result?.indicators?.quote?.[0];
  if (!Number.isFinite(now.getTime()) || chart?.error || !meta || meta.symbol !== "CL=F" || meta.currency !== "USD" || meta.instrumentType !== "FUTURE" || meta.dataGranularity !== "1d" || !Array.isArray(times) || !times.length || times.length > 2000 || !quote) throw new Error("Yahoo 일봉 형식 오류");
  const fields = ["open", "high", "low", "close"] as const;
  for (const key of [...fields, "volume"]) {
    if (key === "volume" && quote[key] === undefined) continue;
    const values = quote[key];
    if (!Array.isArray(values) || values.length !== times.length || values.some((value) => value !== null && (typeof value !== "number" || !Number.isFinite(value) || (key === "volume" && value < 0)))) throw new Error("Yahoo 일봉 가격 배열 오류");
  }
  const bars: DailyBar[] = [];
  const dates = new Set<string>();
  let missingCount = 0;
  let excludedTail: WtiDailySnapshot["excludedTail"];
  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    if (typeof time !== "number" || !Number.isFinite(time) || time <= 0 || time * 1000 > now.getTime() || (i > 0 && time <= times[i - 1])) throw new Error("Yahoo 일봉 시각 오류");
    const sourceAt = new Date(time * 1000).toISOString();
    const date = newYorkDay(new Date(sourceAt));
    const [open, high, low, close] = fields.map((key) => (quote[key] as (number | null)[])[i]);
    const complete = open !== null && high !== null && low !== null && close !== null;
    if (complete && (high < Math.max(open, close, low) || low > Math.min(open, close, high))) throw new Error("Yahoo 일봉 고가·저가 범위 오류");
    if (dates.has(date)) {
      const previous = bars.at(-1);
      // 같은 일봉 갱신/야간 다음 세션 여부를 추정하지 않는다. 검증된 정규 일봉은 보존한다.
      const ambiguousLiveTail = complete && i === times.length - 1 && i > 0 &&
        meta.exchangeTimezoneName === "America/New_York" && time === meta.regularMarketTime &&
        previous?.date === date && previous.sourceAt === new Date(times[i - 1] * 1000).toISOString() &&
        clockFormatter.format(new Date(previous.sourceAt)) === "00:00:00";
      if (!ambiguousLiveTail) throw new Error("Yahoo 일봉 날짜 중복");
      excludedTail = { sourceAt, calendarDate: date };
      continue;
    }
    dates.add(date);
    if (!complete) { missingCount++; continue; }
    bars.push({ date, sourceAt, open, high, low, close, volume: (quote.volume as (number | null)[] | undefined)?.[i] ?? null });
  }
  if (!bars.length) throw new Error("Yahoo 유효 일봉 없음");
  const last = bars.at(-1)!;
  const partialLast = last.date >= newYorkDay(now);
  const notes = [excludedTail ? "같은 뉴욕 날짜의 추가 시세 행 1개는 일봉 귀속이 불명확해 제외했습니다. 확인 가능한 일봉만 표시하며 최신 실시간 가격을 보장하지 않습니다." : null, partialLast && !excludedTail ? "최신 일봉은 잠정값이며 거래 중 변할 수 있습니다." : null, missingCount ? `수신 원본 중 OHLC가 누락된 ${missingCount}개 일봉은 제외했습니다.` : null];
  return { bars, fetchedAt: now.toISOString(), observedAt: last.sourceAt, partialLast, missingCount, note: notes.filter(Boolean).join(" ") || null, ...(excludedTail ? { excludedTail } : {}) };
}

/**
 * 마지막 실제 일봉을 끝점으로 달력 기간을 적용한다. 월말·윤년은 목표 월의 말일로 제한한다.
 * @param bars 날짜 오름차순의 검증된 일봉.
 * @param range 선택한 달력 기간.
 * @returns 기간 안의 실제 일봉. 휴일 가격을 만들지 않는다.
 */
export function filterDailyBars(bars: DailyBar[], range: DailyRange): DailyBar[] {
  if (!DAILY_RANGES.includes(range)) throw new Error("지원하지 않는 일봉 기간");
  if (!bars.length) return [];
  const end = new Date(`${bars.at(-1)!.date}T00:00:00Z`);
  let start: Date;
  if (range === "1wk") start = new Date(end.getTime() - 7 * 86400000);
  else {
    const months = { "5y": 60, "3y": 36, "1y": 12, "6mo": 6, "3mo": 3, "1mo": 1 }[range];
    start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months, 1));
    const lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
    start.setUTCDate(Math.min(end.getUTCDate(), lastDay));
  }
  const cutoff = start.toISOString().slice(0, 10);
  return bars.filter((bar) => bar.date >= cutoff);
}
