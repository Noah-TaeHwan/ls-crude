from __future__ import annotations

from typing import Final

WTI_TICKER: Final = "CL=F"
DXY_TICKER: Final = "DX-Y.NYB"
TIP_TICKER: Final = "TIP"
TNX_TICKER: Final = "^TNX"

IN_SAMPLE_START: Final = "2015-01-01"
IN_SAMPLE_END: Final = "2023-12-31"
OUT_SAMPLE_START: Final = "2024-01-01"

RSI_PERIOD: Final = 14
SLICE_WINDOW: Final = 20
HORMUZ_WEIGHT: Final = 2.0
INFLATION_WEIGHT: Final = 1.0

FRED_SERIES: Final = {
    "CPIAUCSL": "cpi",
    "DFF": "fed_funds",
    "T5YIE": "inflation_expectation_5y",
}

PRICE_COLUMNS: Final = ("Open", "High", "Low", "Close", "Volume")
