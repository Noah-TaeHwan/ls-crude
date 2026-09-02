/**
 * `/backtest?sample=1` 레이아웃 픽스처.
 * CL=F 백테스트가 아닙니다. 팩터가 아닙니다. README 성과로 복사하지 마세요.
 * 나중에 CSV 템플릿을 두면 컬럼은 date, value만 둡니다. Sharpe/적중률은 넣지 않습니다.
 */

export const SAMPLE_SEARCH_PARAM = "sample";
export const SAMPLE_SEARCH_VALUE = "1";
export const SAMPLE_LABEL = "샘플";

export interface BacktestHistoryRow {
  candidate: string;
  ranAt: string;
  window: "인샘플";
  memo: string;
}

export interface SampleEquityPoint {
  date: string;
  value: number;
  sample: "in" | "out";
}

export interface SampleTradeRow {
  date: string;
  side: string;
  nextDay: string;
  hit: string;
}

export interface SampleMetrics {
  sharpe: string;
  maxDrawdown: string;
  hitRate: string;
}

export function isSamplePreviewOn(url: URL) {
  return url.searchParams.get(SAMPLE_SEARCH_PARAM) === SAMPLE_SEARCH_VALUE;
}

export function samplePreviewHref(on: boolean) {
  return on
    ? `/backtest?${SAMPLE_SEARCH_PARAM}=${SAMPLE_SEARCH_VALUE}`
    : "/backtest";
}

export const SAMPLE_HISTORY_ROW: BacktestHistoryRow = {
  candidate: "샘플 후보",
  ranAt: "2026-09-02",
  window: "인샘플",
  memo: "칸 너비를 보는 샘플입니다.",
};

/** 미리보기를 끄면 기록 행(메모 포함)을 비웁니다. 샘플 숫자는 여기에 넣지 않습니다. */
export function historyRowsForPreview(
  samplePreview: boolean,
): readonly BacktestHistoryRow[] {
  return samplePreview ? [SAMPLE_HISTORY_ROW] : [];
}

export const SAMPLE_IS_METRICS: SampleMetrics = {
  sharpe: "0.41",
  maxDrawdown: "11.8%",
  hitRate: "53%",
};

export const SAMPLE_OS_METRICS: SampleMetrics = {
  sharpe: "0.09",
  maxDrawdown: "22.1%",
  hitRate: "48%",
};

export const SAMPLE_TRADES: readonly SampleTradeRow[] = [
  { date: "2016-03-14", side: "롱", nextDay: "상승", hit: "맞음" },
  { date: "2018-11-02", side: "숏", nextDay: "하락", hit: "맞음" },
  { date: "2021-07-09", side: "롱", nextDay: "하락", hit: "빗나감" },
  { date: "2023-10-20", side: "숏", nextDay: "상승", hit: "빗나감" },
];

/** 합성 곡선입니다. 종가·손익이 아닙니다. */
export const SAMPLE_EQUITY: readonly SampleEquityPoint[] = [
  { date: "2015-01-01", value: 1.0, sample: "in" },
  { date: "2015-07-01", value: 1.03, sample: "in" },
  { date: "2016-01-01", value: 1.01, sample: "in" },
  { date: "2016-07-01", value: 1.06, sample: "in" },
  { date: "2017-01-01", value: 1.08, sample: "in" },
  { date: "2017-07-01", value: 1.05, sample: "in" },
  { date: "2018-01-01", value: 1.09, sample: "in" },
  { date: "2018-07-01", value: 1.12, sample: "in" },
  { date: "2019-01-01", value: 1.1, sample: "in" },
  { date: "2019-07-01", value: 1.14, sample: "in" },
  { date: "2020-01-01", value: 1.16, sample: "in" },
  { date: "2020-07-01", value: 1.13, sample: "in" },
  { date: "2021-01-01", value: 1.17, sample: "in" },
  { date: "2021-07-01", value: 1.19, sample: "in" },
  { date: "2022-01-01", value: 1.15, sample: "in" },
  { date: "2022-07-01", value: 1.18, sample: "in" },
  { date: "2023-01-01", value: 1.21, sample: "in" },
  { date: "2023-07-01", value: 1.18, sample: "in" },
  { date: "2023-12-29", value: 1.2, sample: "in" },
  { date: "2024-01-02", value: 1.17, sample: "out" },
  { date: "2024-07-01", value: 1.14, sample: "out" },
  { date: "2025-01-02", value: 1.16, sample: "out" },
  { date: "2025-07-01", value: 1.12, sample: "out" },
];
