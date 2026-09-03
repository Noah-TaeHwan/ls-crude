"""호르무즈 위키 조회수의 동결 회고 분석.

D-1 정렬은 가용 시점을 증명하지 않는다. `NOT_PROVEN as-of-safe`인 연구 전용이며,
보수적 가용성 계약이나 빈티지 영수증 전에는 후보 점수 산정에 쓰지 않는다.
"""

from __future__ import annotations

import json
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pandas as pd

from ls_crude.config import IN_SAMPLE_END, IN_SAMPLE_START, OUT_SAMPLE_START
from ls_crude.data.splits import add_sample_split, split_frames

# 조회할 영문 위키 문서 식별자.
WIKI_ARTICLE = "Strait_of_Hormuz"
# Wikimedia 일별 조회수의 지원 시작일.
WIKI_VIEWS_START = "2015-07-01"
# 급증 기준에 쓰는 동결 달력일 수.
SPIKE_LOOKBACK_DAYS = 20
# 이전 중앙값 대비 동결 급증 배수.
SPIKE_MULT = 2.0
# Wikimedia 요청 정책을 따르는 연락 가능한 사용자 에이전트.
USER_AGENT = "ls-crude-research/0.1 (https://github.com/Noah-TaeHwan/ls-crude)"
# 일별 사용자 조회수 API 템플릿.
API = (
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
    "en.wikipedia/all-access/user/{article}/daily/{start}/{end}"
)


def attach_prior_calendar_views(
    prices: pd.DataFrame,
    views: pd.Series,
) -> pd.DataFrame:
    """CL 날짜 T에 달력 T-1 조회수를 붙인다. 같은 날 조회수는 쓰지 않는다.

    회고 정렬일 뿐 당시 가용 시점을 증명하지 않는다.

    @param prices: 인덱스가 거래일
    @param views: 인덱스가 조회 달력일, 값은 조회수
    @returns: `hormuz_wiki_views_prior` 열이 추가된 복사본
    """
    if prices.empty:
        out = prices.copy()
        out["hormuz_wiki_views_prior"] = pd.Series(dtype="float64")
        return out

    out = prices.copy()
    index = pd.to_datetime(out.index).tz_localize(None).normalize()
    out.index = index
    view_series = views.copy()
    view_series.index = pd.to_datetime(view_series.index).tz_localize(None).normalize()
    prior_days = index - pd.Timedelta(days=1)
    out["hormuz_wiki_views_prior"] = view_series.reindex(prior_days).to_numpy()
    return out


def in_sample_wiki_window(prices: pd.DataFrame, views: pd.Series) -> pd.DataFrame:
    """인샘플만 남기고, 위키 API가 있는 뒤의 첫 거래일부터 붙인다.

    @param prices: CL=F 일봉
    @param views: 위키 일별 조회수
    @returns: sample=in 이고 2015-07-02 이후인 행
    """
    labeled = add_sample_split(prices, in_start=IN_SAMPLE_START, in_end=IN_SAMPLE_END)
    in_sample, _out = split_frames(labeled)
    attached = attach_prior_calendar_views(in_sample, views)
    start = pd.Timestamp(WIKI_VIEWS_START) + pd.Timedelta(days=1)
    return attached.loc[attached.index >= start]


def calendar_spike_flags(
    views: pd.Series,
    lookback: int = SPIKE_LOOKBACK_DAYS,
    mult: float = SPIKE_MULT,
) -> pd.Series:
    """달력일 D 조회수가 D 이전 lookback일 중앙값의 mult배를 넘으면 True.

    D 당일 값은 중앙값에 넣지 않는다. pandas `shift(1).rolling` (당일 제외).

    @param views: 인덱스가 조회 달력일
    @param lookback: 중앙값 창. 기본 20
    @param mult: 배수. 기본 2
    @returns: D와 같은 인덱스의 boolean. 창이 짧아 중앙값이 NA면 False
    """
    view_series = views.copy()
    view_series.index = pd.to_datetime(view_series.index).tz_localize(None).normalize()
    view_series = view_series.sort_index()
    baseline = view_series.shift(1).rolling(lookback, min_periods=lookback).median()
    return view_series > (mult * baseline)


def next_session_direction(close: pd.Series) -> pd.Series:
    """다음 거래일 종가가 올랐으면 True, 내렸으면 False, 같거나 없으면 NA.

    같은 날 수익률을 쓰지 않는다. `shift(-1)`.

    @param close: 거래일 종가
    @returns: boolean dtype, 동점은 NA
    """
    nxt = close.shift(-1)
    out = pd.Series(pd.NA, index=close.index, dtype="boolean")
    known = nxt.notna()
    out.loc[known & (nxt > close)] = True
    out.loc[known & (nxt < close)] = False
    return out


def count_in_sample_spike_next_up(
    prices: pd.DataFrame,
    views: pd.Series,
    lookback: int = SPIKE_LOOKBACK_DAYS,
    mult: float = SPIKE_MULT,
) -> dict[str, int]:
    """인샘플 급증 날의 다음날 CL 방향 횟수. 샤프·평균수익은 계산하지 않는다.

    CL 날짜 T의 신호는 달력 T-1 급증. 손익은 T 종가 대비 다음 거래일 종가.
    `NOT_PROVEN as-of-safe`인 연구 전용이며 후보 점수 산정에는 쓰지 않는다.

    @param prices: CL=F 일봉
    @param views: 위키 일별 조회수
    @param lookback: 중앙값 창
    @param mult: 배수
    @returns: n_in_sample, n_spike, n_scored, n_up, n_down, n_out_in_window
    """
    window = in_sample_wiki_window(prices, views)
    flags = calendar_spike_flags(views, lookback=lookback, mult=mult)
    prior_days = window.index - pd.Timedelta(days=1)
    spike = flags.reindex(prior_days)
    spike.index = window.index
    direction = next_session_direction(window["Close"])
    scored = spike.eq(True) & direction.notna()
    return {
        "n_in_sample": int(len(window)),
        "n_spike": int(spike.eq(True).sum()),
        "n_scored": int(scored.sum()),
        "n_up": int((scored & direction.eq(True)).sum()),
        "n_down": int((scored & direction.eq(False)).sum()),
        "n_out_in_window": int((window.index >= pd.Timestamp(OUT_SAMPLE_START)).sum()),
    }


def fetch_hormuz_wiki_views(start: str, end: str) -> pd.Series:
    """Wikimedia Pageviews에서 해협 문서 일별 user 조회수를 받는다.

    @param start: YYYY-MM-DD
    @param end: YYYY-MM-DD (포함)
    @returns: 날짜 인덱스 조회수
    """
    chunks: list[pd.Series] = []
    cursor = pd.Timestamp(start).normalize()
    last = pd.Timestamp(end).normalize()
    while cursor <= last:
        year_end = min(pd.Timestamp(year=cursor.year, month=12, day=31), last)
        chunk = _fetch_range(cursor, year_end)
        expected = pd.date_range(cursor, year_end, freq="D")
        affected_range = f"{cursor:%Y-%m-%d}..{year_end:%Y-%m-%d}"
        if chunk is None:
            raise RuntimeError(f"Incomplete Wikimedia coverage: {affected_range}")
        chunk = chunk.copy()
        chunk.index = pd.to_datetime(chunk.index).tz_localize(None).normalize()
        if chunk.index.has_duplicates or not chunk.index.sort_values().equals(expected):
            raise RuntimeError(f"Incomplete Wikimedia coverage: {affected_range}")
        chunks.append(chunk.sort_index())
        cursor = year_end + pd.Timedelta(days=1)
        time.sleep(0.2)
    if not chunks:
        return pd.Series(dtype="float64")
    return pd.concat(chunks).sort_index()


def _fetch_range(start: pd.Timestamp, end: pd.Timestamp) -> pd.Series | None:
    url = API.format(
        article=WIKI_ARTICLE,
        start=start.strftime("%Y%m%d"),
        end=end.strftime("%Y%m%d"),
    )
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code == 404:
            return None
        raise
    items = payload.get("items") or []
    if not items:
        return None
    index = [
        pd.Timestamp(str(item["timestamp"])[:8]).normalize() for item in items
    ]
    values = [float(item["views"]) for item in items]
    return pd.Series(values, index=index, name="hormuz_wiki_views")
