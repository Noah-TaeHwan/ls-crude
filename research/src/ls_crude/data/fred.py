from __future__ import annotations

import pandas as pd

from ls_crude.config import FRED_SERIES

FRED_CSV = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"


def fetch_fred_series(series_id: str) -> pd.Series:
    url = FRED_CSV.format(series_id=series_id)
    frame = pd.read_csv(url)
    date_column = "observation_date" if "observation_date" in frame.columns else "DATE"
    value_column = series_id if series_id in frame.columns else frame.columns[-1]
    parsed = frame.copy()
    parsed[date_column] = pd.to_datetime(parsed[date_column], errors="coerce")
    parsed[value_column] = pd.to_numeric(parsed[value_column], errors="coerce")
    series = parsed.set_index(date_column)[value_column].dropna().sort_index()
    series.index = pd.to_datetime(series.index).tz_localize(None).normalize()
    series.name = series_id
    if series.empty:
        raise ValueError(f"FRED returned no rows for {series_id}")
    return series


def fetch_macro_panel() -> pd.DataFrame:
    columns: dict[str, pd.Series] = {}
    for series_id, column_name in FRED_SERIES.items():
        columns[column_name] = fetch_fred_series(series_id).rename(column_name)
    panel = pd.concat(columns.values(), axis=1).sort_index()
    panel.index.name = "date"
    if "cpi" in panel.columns:
        panel["cpi_yoy"] = panel["cpi"].pct_change(12)
    return panel
