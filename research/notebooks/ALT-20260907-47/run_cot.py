"""CFTC WTI NYMEX Managed-Money net positioning vs WTI — IS-only 2015..2023.

Signal: weekly Tuesday-positioning MM net (long-short), Friday-public.
Conservative timing: signal dated at Friday release; WTI forward return starts
the next trading day after release (no same-day use). IS window only; 2024+ never opened.
Inputs: research/gathering/raw/ALT-20260907-47/20260907T064937Z/fut_disagg_txt_YYYY.zip
        research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv
"""
from __future__ import annotations

import datetime
import hashlib
import json
import sys
import zipfile
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
RAWDIR = ROOT / "research/gathering/raw/ALT-20260907-47/20260907T064937Z"
WTI = ROOT / "research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv"
RUN = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
PROCD = ROOT / f"research/data/processed/ALT-20260907-47/{RUN}"
FIGD = ROOT / f"research/indexes/ALT-20260907-47/{RUN}/figures"
TARGET_CODE = "067651"  # NYMEX physical WTI; named "CRUDE OIL, LIGHT SWEET - ..." to 2022-w05 then "WTI-PHYSICAL - ..."
TARGET_NAMES = ("CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE",
                "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE")


def load_cot() -> pd.DataFrame:
    frames = []
    for y in range(2015, 2024):
        with zipfile.ZipFile(RAWDIR / f"fut_disagg_txt_{y}.zip") as z:
            name = z.namelist()[0]
            df = pd.read_csv(z.open(name), low_memory=False)
        code = df["CFTC_Contract_Market_Code"].astype(str).str.strip().str.zfill(6)
        df = df[code.eq(TARGET_CODE)].copy()
        frames.append(df)
    cot = pd.concat(frames, ignore_index=True)
    cot["report"] = pd.to_datetime(cot["Report_Date_as_YYYY-MM-DD"])
    cot = cot.sort_values("report").drop_duplicates("report").set_index("report")
    cot["mm_net"] = cot["M_Money_Positions_Long_All"] - cot["M_Money_Positions_Short_All"]
    cot["mm_net_oi"] = cot["mm_net"] / cot["Open_Interest_All"]
    return cot[["mm_net", "mm_net_oi", "Open_Interest_All"]]


def next_trading_day(px: pd.DataFrame, day: pd.Timestamp) -> pd.Timestamp | None:
    fut = px.index[px.index > day]
    return fut[0] if len(fut) else None


def fwd_ret(px: pd.DataFrame, start: pd.Timestamp, h: int) -> float | None:
    fut = px.index[px.index >= start]
    if len(fut) <= h:
        return None
    p0, p1 = px.loc[fut[0], "Close"], px.loc[fut[h], "Close"]
    if p0 <= 0 or p1 <= 0:
        return None
    return float(p1 / p0 - 1)


def main() -> None:
    PROCD.mkdir(parents=True, exist_ok=True)
    FIGD.mkdir(parents=True, exist_ok=True)
    cot = load_cot()
    # Friday release = report Tuesday + 3 days (Tue->Fri). Conservative: next trading day after Friday.
    cot["release"] = cot.index + pd.Timedelta(days=3)
    px = pd.read_csv(WTI, parse_dates=["date"]).sort_values("date").set_index("date")
    px = px[(px.index >= "2015-01-01") & (px.index <= "2023-12-31")]
    rows = []
    for tuesday, r in cot.iterrows():
        if not ("2015-01-01" <= str(tuesday.date()) <= "2023-12-31"):
            continue
        t0 = next_trading_day(px, r["release"])
        if t0 is None:
            continue
        rows.append({
            "tuesday": tuesday, "release_friday": r["release"], "t0": t0,
            "mm_net": r["mm_net"], "mm_net_oi": r["mm_net_oi"],
            "fwd5": fwd_ret(px, t0, 5), "fwd20": fwd_ret(px, t0, 20),
        })
    frame = pd.DataFrame(rows).dropna().reset_index(drop=True)
    frame.to_csv(PROCD / "cot_wti_weekly_is.csv", index=False)
    stats: dict = {"run": RUN, "n_weeks": len(frame)}
    if len(frame):
        stats["contract_code"] = TARGET_CODE
        stats["tuesdays"] = [str(pd.to_datetime(frame["tuesday"]).min().date()),
                             str(pd.to_datetime(frame["tuesday"]).max().date())]
    else:
        (PROCD / "stats.json").write_text(json.dumps(stats, indent=2))
        print(json.dumps(stats, indent=2))
        return
    for sig in ("mm_net", "mm_net_oi"):
        for tgt in ("fwd5", "fwd20"):
            sub = frame[[sig, tgt]].dropna()
            stats[f"pearson_{sig}_vs_{tgt}"] = round(float(sub[sig].corr(sub[tgt])), 4)
            stats[f"spearman_{sig}_vs_{tgt}"] = _rank_corr(sub[sig], sub[tgt])
    # contemporaneous sanity: MM net change vs same-week WTI move is expected (trend-following)
    frame["mm_net_chg"] = frame["mm_net"].diff()
    pxw = px["Close"].resample("W-FRI").last().pct_change()
    tmp = frame.copy()
    d0 = pd.to_datetime(tmp["t0"]).dt.normalize()
    tmp["wk"] = d0 + pd.to_timedelta((4 - d0.dt.weekday) % 7, unit="D")
    mw = pxw.rename("wret").to_frame()
    mw.index = mw.index.normalize()
    tmp = tmp.join(mw, on="wk")
    cc = tmp[["mm_net_chg", "wret"]].dropna()
    stats["sanity_contemp_dMM_vs_sameweek_ret"] = round(float(cc["mm_net_chg"].corr(cc["wret"])), 4)
    # placebo: 52-week circular shift
    pla = frame["mm_net_oi"].shift(52)
    stats["placebo_shift52_vs_fwd5"] = round(float(pla.corr(frame["fwd5"])), 4)
    ex20 = frame[~pd.to_datetime(frame["t0"]).dt.year.isin([2020])]
    stats["scenario_ex2020_mmnetoi_vs_fwd5"] = round(float(ex20["mm_net_oi"].corr(ex20["fwd5"])), 4)
    stats["mm_net_oi_mean"] = round(float(frame["mm_net_oi"].mean()), 4)

    fig, axes = plt.subplots(2, 1, figsize=(10, 7), sharex=True)
    axes[0].plot(frame["t0"], frame["mm_net_oi"], label="MM net / OI (left)")
    axes[0].set_ylabel("net share of OI")
    axes[0].legend(loc="upper left")
    ax2 = axes[0].twinx()
    cum = (1 + frame.set_index("t0")["fwd5"].resample("W").last().fillna(0)).cumprod()
    ax2.plot(frame["t0"], px.set_index(px.index)["Close"].reindex(frame["t0"], method="ffill").values,
             color="tab:orange", label="WTI level (right)")
    ax2.set_ylabel("USD/bbl")
    axes[0].set_title("CFTC WTI MM net/OI vs WTI (IS 2015-2023, weekly Tue signal)")
    axes[1].scatter(frame["mm_net_oi"], frame["fwd5"], s=8, alpha=0.6)
    axes[1].axhline(0, color="black", linewidth=0.8)
    axes[1].set_xlabel("MM net / OI at release")
    axes[1].set_ylabel("next-5TD WTI return")
    axes[1].set_title("Forward scatter (descriptive; inference NOT verified)")
    fig.tight_layout()
    fig.savefig(FIGD / "cot_wti_is.png", dpi=110)
    plt.close(fig)

    h = hashlib.sha256()
    for y in range(2015, 2024):
        h.update(open(RAWDIR / f"fut_disagg_txt_{y}.zip", "rb").read())
    stats["inputs_sha256"] = {"cot_zips_2015_2023_combined": h.hexdigest(), "wti_csv": _sha(WTI)}
    (PROCD / "stats.json").write_text(json.dumps(stats, indent=2, default=str))
    print(json.dumps(stats, indent=2, default=str))


def _rank_corr(a, b) -> float:
    r = a.rank().corr(b.rank())
    return round(float(r), 4)


def _sha(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


if __name__ == "__main__":
    sys.exit(main())
