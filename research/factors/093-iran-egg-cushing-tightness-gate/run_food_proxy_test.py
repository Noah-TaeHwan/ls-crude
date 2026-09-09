"""Collect and test a clearly labelled Iran food-CPI proxy for factor 093.

This does not treat food CPI as an egg-price series.  It is a data-availability
bridge while the monthly SCI egg series and its release vintages remain absent.
"""
from __future__ import annotations

import hashlib
import json
from datetime import timedelta, timezone
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

FACTOR = Path(__file__).resolve().parent
REPO = FACTOR.parents[2]
RUN_ID = pd.Timestamp.now(tz="UTC").strftime("%Y%m%dT%H%M%SZ")
RAW = REPO / "research" / "gathering" / "raw" / "ALT-20260908-93" / RUN_ID
OUT = REPO / "research" / "indexes" / "ALT-20260908-93" / RUN_ID
FOOD_URL = "https://drive.google.com/uc?export=download&id=1CmxU6X-5zbxx2Nyc-eDFE8ymQUwxIN4p"
CUSHING_URL = "https://www.eia.gov/dnav/pet/hist_xls/W_EPC0_SAX_YCUOK_MBBLw.xls"
WTI_PATH = REPO / "research" / "data" / "clf-daily-2015-2026.csv"


def fetch(url: str, agent: str) -> bytes:
    request = Request(url, headers={"User-Agent": agent})
    with urlopen(request, timeout=60) as response:
        return response.read()


def future_rv(close: pd.Series, start: pd.Timestamp, sessions: int = 21) -> float | None:
    onward = close.loc[close.index > start].iloc[:sessions]
    # CL=F printed a negative settlement in April 2020. Log-return RV is not
    # defined across a non-positive close, so the entire affected horizon is
    # excluded rather than silently dropping only that return.
    if len(onward) != sessions or (onward <= 0).any():
        return None
    return float(np.log(onward).diff().dropna().std(ddof=1) * np.sqrt(252))


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    food_bytes = fetch(FOOD_URL, "Mozilla/5.0")
    cushing_bytes = fetch(CUSHING_URL, "ls-crude-research/1.0")
    (RAW / "iran_monthly_cpi.csv").write_bytes(food_bytes)
    (RAW / "eia_cushing_stocks.xls").write_bytes(cushing_bytes)

    food = pd.read_csv(BytesIO(food_bytes), encoding="utf-8-sig")
    food["month"] = pd.to_datetime(food["year_month_gregorian_calendar"].astype(str) + "01", format="%Y%m%d")
    food = food.rename(columns={"food_beverage_cpi": "food_cpi"})[["month", "food_cpi"]].sort_values("month")
    food["food_yoy_pct"] = food["food_cpi"].pct_change(12) * 100
    food["available_date"] = food["month"] + pd.offsets.MonthEnd(0) + timedelta(days=45)

    stock = pd.read_excel(BytesIO(cushing_bytes), sheet_name="Data 1", header=None, skiprows=3, usecols=[0, 1], names=["date", "cushing_kbbl"])
    stock["date"] = pd.to_datetime(stock["date"], errors="coerce")
    stock["cushing_kbbl"] = pd.to_numeric(stock["cushing_kbbl"], errors="coerce")
    stock = stock.dropna().sort_values("date")
    stock["available_date"] = stock["date"] + timedelta(days=5)
    stock["cushing_52w_z"] = (stock["cushing_kbbl"] - stock["cushing_kbbl"].rolling(52, min_periods=52).mean()) / stock["cushing_kbbl"].rolling(52, min_periods=52).std(ddof=1)

    wti = pd.read_csv(WTI_PATH, parse_dates=["date"])
    wti = wti.loc[wti["sample"].eq("in"), ["date", "Close"]].dropna().sort_values("date")
    close = wti.set_index("date")["Close"]

    merged = pd.merge_asof(food.sort_values("available_date"), stock[["available_date", "cushing_kbbl", "cushing_52w_z"]].dropna().sort_values("available_date"), on="available_date", direction="backward")
    merged["future_wti_rv21"] = merged["available_date"].map(lambda day: future_rv(close, day))
    merged = merged.dropna(subset=["food_yoy_pct", "cushing_52w_z", "future_wti_rv21"])
    merged = merged.loc[(merged["available_date"] >= "2015-01-01") & (merged["available_date"] < "2024-01-01")].copy()

    # Expanding 80th percentile prevents the food threshold from using later months.
    merged["food_shock"] = [False if index < 36 else value >= np.quantile(merged["food_yoy_pct"].iloc[:index], 0.80) for index, value in enumerate(merged["food_yoy_pct"])]
    merged["cushing_tight"] = merged["cushing_52w_z"] <= -1.0
    merged["joint_gate"] = merged["food_shock"] & merged["cushing_tight"]
    corr = float(merged["food_yoy_pct"].corr(merged["future_wti_rv21"]))
    grouped = merged.groupby("joint_gate")["future_wti_rv21"].agg(["count", "mean", "median"]).reset_index()
    summary = {
        "run_id": RUN_ID,
        "status": "exploratory_food_proxy_not_egg_test",
        "in_sample": "2015-01-01..2023-12-31",
        "food_source_rows": int(len(food)),
        "food_source_range": [str(food["month"].min().date()), str(food["month"].max().date())],
        "cushing_source_rows": int(len(stock)),
        "analysis_rows": int(len(merged)),
        "food_yoy_to_future_wti_rv21_pearson_r": round(corr, 6),
        "joint_gate_groups": grouped.to_dict(orient="records"),
        "limitations": [
            "food_beverage_cpi is not a monthly egg-price series",
            "historical SCI publication vintages are not recovered; +45 day availability is a conservative assumption, not a verified release timestamp",
            "EIA history is a current revised series; Cushing availability is approximated as week-end plus five days",
            "no independent Iran FX series and no M1-M2 panel were used",
            "this is IS-only and cannot support an alpha claim",
        ],
    }
    merged.to_csv(OUT / "food_proxy_cushing_wti_is.csv", index=False)
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "run_id": RUN_ID,
        "files": {name: hashlib.sha256((RAW / name).read_bytes()).hexdigest() for name in ("iran_monthly_cpi.csv", "eia_cushing_stocks.xls")},
        "urls": {"iran_monthly_cpi": FOOD_URL, "eia_cushing_stocks": CUSHING_URL},
        "wti_input": str(WTI_PATH.relative_to(REPO)),
    }
    (RAW / "README.md").write_text("# ALT-20260908-93 raw receipt\n\n```json\n" + json.dumps(manifest, indent=2) + "\n```\n", encoding="utf-8")

    fig, axes = plt.subplots(2, 1, figsize=(10, 6), sharex=True, constrained_layout=True)
    axes[0].plot(merged["available_date"], merged["food_yoy_pct"], color="#d95f02", label="Iran food CPI YoY (proxy)")
    axes[0].axhline(0, color="#777", linewidth=0.8)
    axes[0].set_ylabel("YoY %")
    axes[0].legend(loc="upper left")
    axes[1].plot(merged["available_date"], merged["cushing_52w_z"], color="#1b9e77", label="Cushing stocks, 52-week z")
    axes[1].axhline(-1, color="#777", linewidth=0.8, linestyle="--")
    axes[1].scatter(merged.loc[merged["joint_gate"], "available_date"], merged.loc[merged["joint_gate"], "cushing_52w_z"], color="#e7298a", label="joint gate")
    axes[1].set_ylabel("z-score")
    axes[1].legend(loc="upper left")
    fig.suptitle("093 exploratory: Iran food-stress proxy × Cushing condition (not egg data)")
    fig.savefig(OUT / "food_proxy_cushing_gate.svg", format="svg")
    plt.close(fig)
    print(json.dumps({"status": summary["status"], "food_rows": len(food), "analysis_rows": len(merged), "output_rows": len(merged)}))


if __name__ == "__main__":
    main()
