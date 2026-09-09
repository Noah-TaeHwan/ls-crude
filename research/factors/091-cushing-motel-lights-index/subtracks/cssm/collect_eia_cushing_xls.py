"""Pull EIA Cushing weekly stocks from the free hist XLS (no API key)."""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
import requests

URL = "https://www.eia.gov/dnav/pet/hist_xls/W_EPC0_SAX_YCUOK_MBBLw.xls"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("cushing_stocks_weekly.csv"))
    args = parser.parse_args()
    raw = args.out.with_suffix(".xls")
    resp = requests.get(URL, timeout=30)
    resp.raise_for_status()
    raw.write_bytes(resp.content)
    df = pd.read_excel(raw, sheet_name="Data 1", header=None, engine="xlrd")
    series = df.iloc[3:].copy()
    series.columns = ["date", "stock_kbbl"]
    series["date"] = pd.to_datetime(series["date"])
    series["stock_kbbl"] = pd.to_numeric(series["stock_kbbl"], errors="coerce")
    series = series.dropna().sort_values("date")
    series["wow_change_kbbl"] = series["stock_kbbl"].diff()
    series.to_csv(args.out, index=False)
    print(f"wrote {args.out} n={len(series)} last={series.iloc[-1]['date'].date()} {series.iloc[-1]['stock_kbbl']}")


if __name__ == "__main__":
    main()
