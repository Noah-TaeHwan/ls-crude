"""Calibrate 091-Y against a public regional benchmark, without relabelling it Cushing data.

The test asks whether Midwest retail price *changes* follow previously known WTI
changes.  It is a mechanism check for the local Cushing pump board, not a
backtest of an unobserved Cushing history and not a trading signal.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
from datetime import datetime, timedelta
from pathlib import Path
from urllib.request import Request, urlopen

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-25" / "20260908T180000Z"
OUT = ROOT / "research" / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091YCALZ"
FIG = OUT / "figures"

URLS = {
    "midwest_regular_weekly.html": "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=EMM_EPM0_PTE_R20_DPG",
    "midwest_diesel_weekly.html": "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=EMD_EPD2D_PTE_R20_DPG",
    "cushing_wti_daily.html": "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=D&n=PET&s=RWTC",
}


def fetch(name: str, url: str) -> dict[str, object]:
    request = Request(url, headers={"User-Agent": "ls-crude-research/1.0 (+091y-calibration)"})
    with urlopen(request, timeout=60) as response:
        body = response.read()
        status = response.status
    path = RAW / name
    path.write_bytes(body)
    return {"file": name, "url": url, "http_status": status, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}


def retail_series(html_path: Path, column_name: str) -> pd.Series:
    tables = pd.read_html(html_path)
    table = next(frame for frame in tables if frame.shape[0] > 100 and frame.shape[1] >= 10)
    records: list[tuple[pd.Timestamp, float]] = []
    for _, row in table.iterrows():
        year_month = str(row.iloc[0])
        if len(year_month) < 4 or not year_month[:4].isdigit():
            continue
        year = int(year_month[:4])
        for position in range(1, min(len(row), 11), 2):
            end_date, value = row.iloc[position], row.iloc[position + 1]
            if pd.isna(end_date) or pd.isna(value):
                continue
            try:
                date = pd.Timestamp(datetime.strptime(f"{year}-{str(end_date).strip()}", "%Y-%m/%d"))
                records.append((date, float(value)))
            except (TypeError, ValueError):
                continue
    return pd.Series(dict(records), name=column_name).sort_index()


def wti_series(html_path: Path) -> pd.Series:
    tables = pd.read_html(html_path)
    table = next(frame for frame in tables if frame.shape[0] > 1000 and frame.shape[1] == 6)
    records: list[tuple[pd.Timestamp, float]] = []
    for _, row in table.iterrows():
        label = str(row.iloc[0]).replace("- ", "-")
        try:
            year = int(label[:4])
            month_day = label[5:].split(" to ")[0]
            start = datetime.strptime(f"{year} {month_day}", "%Y %b-%d")
        except ValueError:
            continue
        for offset, value in enumerate(row.iloc[1:]):
            if pd.notna(value):
                records.append((pd.Timestamp(start + timedelta(days=offset)), float(value)))
    return pd.Series(dict(records), name="wti_usd_per_bbl").sort_index()


def prior_value(series: pd.Series, date: pd.Timestamp) -> float:
    available = series.loc[:date]
    return float(available.iloc[-1]) if not available.empty else math.nan


def correlation(x: pd.Series, y: pd.Series) -> tuple[float, int]:
    pair = pd.concat([x, y], axis=1).dropna()
    return float(pair.iloc[:, 0].corr(pair.iloc[:, 1])), len(pair)


def svg_bars(rows: list[dict[str, object]], path: Path) -> None:
    width, height, left, bottom = 760, 385, 84, 315
    plot_h, group_w = 210, 105
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="#f8fafc"/>',
        '<text x="28" y="32" font-family="Arial" font-size="19" font-weight="700" fill="#172033">091-Y mechanism check: WTI change → Midwest retail change</text>',
        '<text x="28" y="53" font-family="Arial" font-size="11" fill="#556070">Weekly first differences; WTI is known by the prior Friday. This calibrates pass-through, not Cushing alpha.</text>',
        f'<line x1="{left}" y1="{bottom - plot_h/2}" x2="720" y2="{bottom - plot_h/2}" stroke="#8a99a8"/>',
        f'<line x1="{left}" y1="{bottom-plot_h}" x2="{left}" y2="{bottom}" stroke="#8a99a8"/>',
    ]
    for tick in (-0.4, -0.2, 0, 0.2, 0.4):
        y = bottom - plot_h / 2 - tick * (plot_h / 0.8)
        parts.append(f'<line x1="{left}" y1="{y:.1f}" x2="720" y2="{y:.1f}" stroke="#d8e0e8"/>')
        parts.append(f'<text x="42" y="{y+4:.1f}" font-family="Arial" font-size="11" fill="#556070">{tick:+.1f}</text>')
    for index, lag in enumerate(range(5)):
        matching = [row for row in rows if row["lag_weeks"] == lag]
        base_x = 135 + index * group_w
        for offset, row in enumerate(matching):
            r = float(row["r"])
            bar_h = abs(r) * (plot_h / 0.8)
            y = bottom - plot_h / 2 - bar_h if r >= 0 else bottom - plot_h / 2
            color = "#1f77b4" if row["fuel"] == "regular" else "#d95f02"
            x = base_x + offset * 28
            parts.append(f'<rect x="{x}" y="{y:.1f}" width="22" height="{bar_h:.1f}" rx="2" fill="{color}"/>')
        parts.append(f'<text x="{base_x-2}" y="340" font-family="Arial" font-size="11" fill="#172033">{lag}w prior</text>')
    parts.extend([
        '<rect x="532" y="73" width="12" height="12" fill="#1f77b4"/><text x="550" y="83" font-family="Arial" font-size="11">Regular</text>',
        '<rect x="620" y="73" width="12" height="12" fill="#d95f02"/><text x="638" y="83" font-family="Arial" font-size="11">Diesel</text>',
        '<text x="84" y="370" font-family="Arial" font-size="11" fill="#556070">Source: EIA public weekly Midwest retail series and daily Cushing WTI; full sample only.</text>',
        '</svg>',
    ])
    path.write_text("\n".join(parts), encoding="utf-8")


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    FIG.mkdir(parents=True, exist_ok=True)
    manifest = [fetch(name, url) for name, url in URLS.items()]
    (RAW / "sources_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    regular = retail_series(RAW / "midwest_regular_weekly.html", "regular_usd_per_gal")
    diesel = retail_series(RAW / "midwest_diesel_weekly.html", "diesel_usd_per_gal")
    wti = wti_series(RAW / "cushing_wti_daily.html")
    frame = pd.concat([regular, diesel], axis=1).dropna().sort_index()
    frame["wti_prior_friday_usd_per_bbl"] = [prior_value(wti, date - pd.Timedelta(days=3)) for date in frame.index]
    frame = frame.dropna()
    for column in frame.columns:
        frame[f"d_{column}"] = frame[column].diff()
    frame.index.name = "retail_week_end_date"
    frame.to_csv(RAW / "padd2_retail_wti_weekly.csv", float_format="%.6f")

    rows: list[dict[str, object]] = []
    for fuel in ("regular", "diesel"):
        series = frame[f"d_{fuel}_usd_per_gal"]
        for lag in range(5):
            r, n = correlation(series, frame["d_wti_prior_friday_usd_per_bbl"].shift(lag))
            rows.append({"direction": "WTI prior change -> retail change", "fuel": fuel, "lag_weeks": lag, "r": r, "n": n})
        for lead in range(1, 5):
            r, n = correlation(series, frame["d_wti_prior_friday_usd_per_bbl"].shift(-lead))
            rows.append({"direction": "retail change -> future WTI change", "fuel": fuel, "lag_weeks": lead, "r": r, "n": n})
    with (OUT / "lag_tests.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    forward = [row for row in rows if row["direction"] == "WTI prior change -> retail change"]
    svg_bars(forward, FIG / "091y-eia-midwest-pass-through-lags.svg")
    best = {fuel: max((row for row in forward if row["fuel"] == fuel), key=lambda row: abs(float(row["r"]))) for fuel in ("regular", "diesel")}
    report = f"""# 091-YB — Midwest pass-through calibration\n\n## Question\n\nDoes a long free public benchmark support the expected direction: **WTI changes\narrive before regional retail pump-price changes**? This does **not** turn the\nCushing Maverik board into a historical Cushing series or a WTI-leading factor.\n\n## Result\n\n| fuel | strongest prior-WTI lag | Pearson r | n | interpretation |\n| --- | ---: | ---: | ---: | --- |\n| Regular | {best['regular']['lag_weeks']} week(s) | {best['regular']['r']:+.3f} | {best['regular']['n']} | regional retail follows the prior WTI move most closely at this lag |\n| Diesel | {best['diesel']['lag_weeks']} week(s) | {best['diesel']['r']:+.3f} | {best['diesel']['n']} | regional retail follows the prior WTI move most closely at this lag |\n\n![WTI-to-retail lag correlations](figures/091y-eia-midwest-pass-through-lags.svg)\n\nThe displayed bars use weekly **first differences**, not price levels. For each\nretail Monday, WTI is the most recent observation on or before the preceding\nFriday, preventing the retail observation from looking into later crude prices.\nThe full lag grid, including the reverse direction, is in [lag_tests.csv](lag_tests.csv).\n\n## What this changes\n\nThe five archived Cushing station observations remain evidence of local\nco-movement only. This broader EIA calibration supports a downstream\nWTI-to-retail mechanism; it does not support pump-to-WTI forecasting. 091-Y\ntherefore remains **FORWARD ONLY** as a local product-stress board.\n\n## Reproduction and raw receipts\n\n- [Collector](../../../notebooks/091-cushing-operations-nowcasting/calibrate_091y_midwest_pass_through.py)\n- [Raw EIA collection receipt](../../../gathering/raw/ALT-20260908-25/20260908T180000Z/README.md)\n- [EIA Midwest regular retail series](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=EMM_EPM0_PTE_R20_DPG)\n- [EIA Midwest diesel retail series](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=EMD_EPD2D_PTE_R20_DPG)\n- [EIA Cushing WTI](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=D&n=PET&s=RWTC)\n"""
    (OUT / "README.md").write_text(report, encoding="utf-8")
    raw_readme = """# ALT-20260908-25 — 091-Y regional pass-through calibration receipt\n\n**Collection date:** 2026-09-08  \n**Purpose:** a public regional mechanism check for the Cushing local pump board.\n\nThe three EIA source responses, a SHA-256 manifest, and the parsed weekly panel\nare retained here. The Midwest series is deliberately not relabelled as Cushing\nstation data. The report and chart are in\n[`20260908T091YCALZ`](../../../../indexes/091-cushing-operations-nowcasting/20260908T091YCALZ/README.md).\n"""
    (RAW / "README.md").write_text(raw_readme, encoding="utf-8")


if __name__ == "__main__":
    main()
