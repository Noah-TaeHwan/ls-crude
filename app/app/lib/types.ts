/** 연구용 일별 피처 한 행. */
export interface DailyFeatureRow {
  date: string;
  ticker: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  rsi_14: number | null;
  slice_score: number | null;
  slice_z: number | null;
  hormuz_count: number | null;
  inflation_count: number | null;
  sample: "in" | "out";
  rsi_position: "long" | "flat" | "short" | null;
}

/** 연구에 쓰는 뉴스 사건 한 건. */
export interface NewsEventRow {
  id?: string;
  published_at: string;
  title: string;
  url: string | null;
  source: string;
  tags: string[];
}

/** 2015~2023 인샘플 연구 스냅샷. */
export interface BaselineSnapshot {
  ticker: string;
  in_sample: { start: string; end: string };
  out_sample: { start: string; end: string | null };
  rows: DailyFeatureRow[];
  news: NewsEventRow[];
}

/** 서버 액션의 사용자 응답. */
export interface ActionResult {
  ok: boolean;
  message: string;
}

/** 최근 완료된 WTI 일봉 한 행. */
export interface WtiDailyBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** WTI 일봉의 원천 정보. */
export interface WtiMarketSource {
  provider: "Yahoo Finance";
  library: "yfinance";
  autoAdjust: true;
}

/** 관측 스냅샷을 오래된 것으로 판정하는 기준. */
export interface WtiFreshnessPolicy {
  maxCheckAgeHours: number;
  maxBarAgeDays: number;
}

/** WTI 실현변동성 계산값과 고정 기준 분포. */
export interface WtiVolatilitySnapshot {
  method: "simple-return-rms";
  formula: string;
  annualization: number;
  rv5AnnualizedPct: number;
  rv20AnnualizedPct: number;
  rv5ReferencePercentile: number;
  referenceStart: string;
  referenceEnd: string;
  referenceWindowCount: number;
}

/** 시장 관측치를 다시 확인할 수 있는 데이터 계보. */
export interface WtiMarketProvenance {
  firstDate: string;
  lastDate: string;
  rowCount: number;
  contentSha256: string;
  contentSha256Scope: "all-completed-bars";
}

/** 최근 완료 세션 기준 WTI 시장 관측 스냅샷. */
export interface WtiMarketSnapshot {
  schemaVersion: 1;
  ticker: "CL=F";
  interval: "1d";
  status: "ok";
  source: WtiMarketSource;
  checkedAt: string;
  generatedAt: string;
  asOf: string;
  freshnessPolicy: WtiFreshnessPolicy;
  bars: WtiDailyBar[];
  volatility: WtiVolatilitySnapshot;
  provenance: WtiMarketProvenance;
}

/** 공개 화면에서 파생한 시장 스냅샷 신선도. */
export interface WtiMarketView {
  snapshot: WtiMarketSnapshot | null;
  freshness: "fresh" | "stale" | "unavailable";
  freshnessReasons: string[];
}

/**
 * 날짜나 시각 문자열을 실제 시각으로 읽을 수 있는지 확인한다.
 * @param value 확인할 날짜 또는 시각 문자열.
 * @param dateOnly 날짜만 들어오는지 여부.
 * @returns 유효한 시각이면 true.
 */
function isParseableTime(value: string, dateOnly = false): boolean {
  return Number.isFinite(Date.parse(dateOnly ? `${value}T00:00:00Z` : value));
}

/**
 * 알 수 없는 JSON 값이 공개 화면의 전체 WTI 시장 계약을 만족하는지 확인한다.
 * @param value 확인할 JSON 값.
 * @returns 시장 스냅샷 계약 충족 여부.
 */
export function isWtiMarketSnapshot(value: unknown): value is WtiMarketSnapshot {
  if (value == null || typeof value !== "object") return false;
  const candidate = value as Partial<WtiMarketSnapshot>;
  const bars = candidate.bars;
  const volatility = candidate.volatility;
  const freshness = candidate.freshnessPolicy;
  const provenance = candidate.provenance;
  const validBars =
    Array.isArray(bars) &&
    bars.length > 0 &&
    bars.every((bar, index) => {
      const previous = bars[index - 1];
      return (
        bar != null &&
        typeof bar === "object" &&
        /^\d{4}-\d{2}-\d{2}$/.test(bar.date) &&
        (previous == null || (typeof previous === "object" && previous.date < bar.date)) &&
        [bar.open, bar.high, bar.low, bar.close, bar.volume].every(Number.isFinite) &&
        bar.volume >= 0 &&
        bar.low <= Math.min(bar.open, bar.close) &&
        bar.high >= Math.max(bar.open, bar.close)
      );
    });

  return (
    candidate.schemaVersion === 1 &&
    candidate.ticker === "CL=F" &&
    candidate.interval === "1d" &&
    candidate.status === "ok" &&
    candidate.source?.provider === "Yahoo Finance" &&
    candidate.source.library === "yfinance" &&
    candidate.source.autoAdjust === true &&
    typeof candidate.checkedAt === "string" &&
    isParseableTime(candidate.checkedAt) &&
    typeof candidate.generatedAt === "string" &&
    isParseableTime(candidate.generatedAt) &&
    typeof candidate.asOf === "string" &&
    isParseableTime(candidate.asOf, true) &&
    validBars &&
    bars.at(-1)?.date === candidate.asOf &&
    volatility?.method === "simple-return-rms" &&
    typeof volatility.formula === "string" &&
    volatility.formula.length > 0 &&
    Number.isFinite(volatility.annualization) &&
    volatility.annualization > 0 &&
    Number.isFinite(volatility.rv5AnnualizedPct) &&
    volatility.rv5AnnualizedPct >= 0 &&
    Number.isFinite(volatility.rv20AnnualizedPct) &&
    volatility.rv20AnnualizedPct >= 0 &&
    Number.isFinite(volatility.rv5ReferencePercentile) &&
    volatility.rv5ReferencePercentile >= 0 &&
    volatility.rv5ReferencePercentile <= 100 &&
    /^\d{4}-\d{2}-\d{2}$/.test(volatility.referenceStart) &&
    /^\d{4}-\d{2}-\d{2}$/.test(volatility.referenceEnd) &&
    volatility.referenceStart <= volatility.referenceEnd &&
    Number.isFinite(volatility.referenceWindowCount) &&
    volatility.referenceWindowCount > 0 &&
    freshness != null &&
    Number.isFinite(freshness.maxCheckAgeHours) &&
    freshness.maxCheckAgeHours > 0 &&
    Number.isFinite(freshness.maxBarAgeDays) &&
    freshness.maxBarAgeDays > 0 &&
    provenance?.lastDate === candidate.asOf &&
    /^\d{4}-\d{2}-\d{2}$/.test(provenance.firstDate) &&
    provenance.firstDate <= provenance.lastDate &&
    Number.isFinite(provenance.rowCount) &&
    provenance.rowCount >= bars.length &&
    /^[0-9a-f]{64}$/.test(provenance.contentSha256) &&
    provenance.contentSha256Scope === "all-completed-bars"
  );
}
