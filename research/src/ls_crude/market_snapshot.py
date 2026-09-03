from __future__ import annotations

import hashlib
import json
import math
import os
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Final
from zoneinfo import ZoneInfo

import pandas as pd

from ls_crude.config import IN_SAMPLE_END, IN_SAMPLE_START, PRICE_COLUMNS, WTI_TICKER
from ls_crude.data.yahoo import download_ohlcv

# WTI 관측값의 고정 기준 분포와 공개 출력 위치입니다.
REFERENCE_START: Final = IN_SAMPLE_START
REFERENCE_END: Final = IN_SAMPLE_END
ANNUALIZATION_DAYS: Final = 252
RECENT_BAR_LIMIT: Final = 60
NEW_YORK: Final = ZoneInfo("America/New_York")
REPO_ROOT: Final = Path(__file__).resolve().parents[3]
SNAPSHOT_PATH: Final = REPO_ROOT / "app" / "public" / "wti-market-snapshot.json"


def realized_volatility(close: pd.Series, window: int) -> pd.Series:
    """단순수익률로 N일 연환산 실현변동성을 계산합니다.

    Args:
        close: 날짜순 종가 시계열입니다.
        window: 변동성을 계산할 거래일 수입니다.

    Returns:
        종가와 같은 인덱스를 가진 연환산 변동성 백분율입니다.
    """
    if window < 1:
        raise ValueError("window must be at least 1")
    previous = close.shift(1)
    returns = close.div(previous).sub(1).where(previous.ne(0))
    return 100 * ((ANNUALIZATION_DAYS / window) * returns.pow(2).rolling(window).sum()).pow(0.5)


def _completed_prices(prices: pd.DataFrame, now: datetime) -> pd.DataFrame:
    """New York 기준 오늘보다 앞선 유효 일봉만 반환합니다.

    Args:
        prices: Yahoo Finance OHLCV 일봉입니다.
        now: 시간대가 포함된 현재 시각입니다.

    Returns:
        검증되고 날짜순으로 정렬된 완료 일봉입니다.
    """
    if now.tzinfo is None:
        raise ValueError("now must include a timezone")
    missing = [column for column in PRICE_COLUMNS if column not in prices.columns]
    if missing:
        raise ValueError(f"Missing price columns: {missing}")

    completed = prices.loc[:, list(PRICE_COLUMNS)].copy()
    index = pd.DatetimeIndex(pd.to_datetime(completed.index))
    if index.tz is not None:
        index = index.tz_convert(NEW_YORK).tz_localize(None)
    completed.index = index.normalize()
    completed.index.name = "date"
    if completed.index.has_duplicates:
        raise ValueError("Price dates must be unique")
    completed = completed.sort_index()
    today = pd.Timestamp(now.astimezone(NEW_YORK).date())
    completed = completed.loc[completed.index < today]
    if len(completed) < 21:
        raise ValueError("At least 21 completed price rows are required")

    numeric = completed.apply(pd.to_numeric, errors="coerce")
    if numeric.isna().any().any():
        raise ValueError("Completed OHLCV rows must be numeric and non-null")
    if not numeric.map(math.isfinite).all().all():
        raise ValueError("Completed OHLCV rows must be finite")
    return numeric


def _iso_utc(moment: datetime) -> str:
    """시간대가 포함된 시각을 UTC ISO 8601 문자열로 바꿉니다.

    Args:
        moment: 변환할 시각입니다.

    Returns:
        초 단위의 UTC 문자열입니다.
    """
    if moment.tzinfo is None:
        raise ValueError("moment must include a timezone")
    return moment.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _bar_records(prices: pd.DataFrame) -> list[dict[str, float | str]]:
    """OHLCV 프레임을 공개 JSON 행으로 바꿉니다.

    Args:
        prices: 검증된 완료 일봉입니다.

    Returns:
        소문자 필드명을 사용하는 JSON 직렬화 가능 행입니다.
    """
    rows: list[dict[str, float | str]] = []
    for date, row in prices.iterrows():
        rows.append(
            {
                "date": pd.Timestamp(date).date().isoformat(),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"]),
            }
        )
    return rows


def build_market_snapshot(prices: pd.DataFrame, now: datetime) -> dict[str, object]:
    """완료된 WTI 일봉에서 공개 시장 관측 스냅샷을 만듭니다.

    Args:
        prices: Yahoo Finance `CL=F` OHLCV 일봉입니다.
        now: 조회와 생성에 사용한 시간대 포함 시각입니다.

    Returns:
        앱이 직접 읽을 수 있는 시장 관측 데이터 계약입니다.
    """
    completed = _completed_prices(prices, now)
    rv5 = realized_volatility(completed["Close"], 5)
    rv20 = realized_volatility(completed["Close"], 20)
    reference = rv5.loc[REFERENCE_START:REFERENCE_END].dropna()
    current_rv5 = float(rv5.iloc[-1])
    current_rv20 = float(rv20.iloc[-1])
    if reference.empty:
        raise ValueError("Reference RV5 distribution is empty")
    if not math.isfinite(current_rv5) or not math.isfinite(current_rv20):
        raise ValueError("Current realized volatility is unavailable")

    all_bars = _bar_records(completed)
    content = json.dumps(
        all_bars,
        ensure_ascii=False,
        allow_nan=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    timestamp = _iso_utc(now)
    percentile = 100 * int(reference.le(current_rv5).sum()) / len(reference)

    return {
        "schemaVersion": 1,
        "ticker": WTI_TICKER,
        "interval": "1d",
        "status": "ok",
        "source": {
            "provider": "Yahoo Finance",
            "library": "yfinance",
            "autoAdjust": True,
        },
        "checkedAt": timestamp,
        "generatedAt": timestamp,
        "asOf": completed.index[-1].date().isoformat(),
        "freshnessPolicy": {
            "maxCheckAgeHours": 36,
            "maxBarAgeDays": 4,
        },
        "bars": all_bars[-RECENT_BAR_LIMIT:],
        "volatility": {
            "method": "simple-return-rms",
            "formula": "100 × sqrt((252 / N) × sum(r_t²))",
            "annualization": ANNUALIZATION_DAYS,
            "rv5AnnualizedPct": current_rv5,
            "rv20AnnualizedPct": current_rv20,
            "rv5ReferencePercentile": percentile,
            "referenceStart": REFERENCE_START,
            "referenceEnd": REFERENCE_END,
            "referenceWindowCount": len(reference),
        },
        "provenance": {
            "firstDate": completed.index[0].date().isoformat(),
            "lastDate": completed.index[-1].date().isoformat(),
            "rowCount": len(completed),
            "contentSha256": hashlib.sha256(content).hexdigest(),
            "contentSha256Scope": "all-completed-bars",
        },
    }


def write_snapshot_atomic(path: Path, payload: dict[str, object]) -> None:
    """정상 JSON만 원자적으로 교체해 마지막 정상본을 보존합니다.

    Args:
        path: 공개 스냅샷 출력 경로입니다.
        payload: JSON으로 기록할 검증된 데이터입니다.

    Returns:
        반환값은 없습니다.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as temporary:
            temporary_path = Path(temporary.name)
            json.dump(payload, temporary, ensure_ascii=False, allow_nan=False, indent=2)
            temporary.write("\n")
            temporary.flush()
            os.fsync(temporary.fileno())
        os.replace(temporary_path, path)
    except Exception:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)
        raise


def main() -> None:
    """Yahoo에서 WTI 일봉을 받아 공개 관측 스냅샷을 갱신합니다.

    Returns:
        반환값은 없습니다.
    """
    now = datetime.now(UTC)
    new_york_today = now.astimezone(NEW_YORK).date().isoformat()
    prices = download_ohlcv(WTI_TICKER, start=REFERENCE_START, end=new_york_today)
    payload = build_market_snapshot(prices, now=now)
    write_snapshot_atomic(SNAPSHOT_PATH, payload)
    print(
        f"snapshot={SNAPSHOT_PATH} as_of={payload['asOf']} "
        f"score={payload['volatility']['rv5ReferencePercentile']:.2f}"
    )


if __name__ == "__main__":
    main()
