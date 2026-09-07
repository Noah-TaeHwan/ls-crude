"""FRED US retail gasoline (GASREGW) vs WTI — sanity/placebo run, IS-only 2015..2023.

Expectation (pre-committed): strong CONTEMPORANEOUS co-move (mechanical:
retail gasoline is refined from crude + taxes/margin), NO reliable lead.
A lead-looking blip would be treated as shared-shock simultaneity, not signal.
Timing: GASREGW is a Monday observation; forward window starts next trading day.
"""
from __future__ import annotations

import datetime
import hashlib
import json
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "research/gathering/raw/ALT-20260907-48/20260907T064937Z/GASREGW.csv"
WTI = ROOT / "research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv"
RUN = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
PROCD = ROOT / f"research/data/processed/ALT-20260907-48/{RUN}"
FIGD = ROOT / f"research/indexes/ALT-20260907-48/{RUN}/figures"


def main() -> None:
    PROCD.mkdir(parents=True, exist_ok=True)
    FIGD.mkdir(parents=True, exist_ok=True)
    g = pd.read_csv(RAW, parse_dates=["observation_date"]).rename(columns={"observation_date": "monday"})
    g = g[(g["monday"] >= "2015-01-01") & (g["monday"] <= "2023-12-31")].sort_values("monday")
    g["wow"] = g["GASREGW"].pct_change()
    px = pd.read_csv(WTI, parse_dates=["date"]).sort_values("date").set_index("date")
    px = px[(px.index >= "2015-01-01") & (px.index <= "2023-12-31")]
    recs = []
    for _, r in g.iterrows():
        fut = px.index[px.index > r["monday"].normalize()]
        if len(fut) <= 5:
            continue
        # contemporaneous: prior-5TD WTI move ending at t0 (same information week)
        past = px.index[px.index <= fut[0]]
        prev5 = past[-6] if len(past) >= 6 else None
        conc = float(px.loc[fut[0], "Close"] / px.loc[prev5, "Close"] - 1) if prev5 is not None else None
        p0, p1 = px.loc[fut[0], "Close"], px.loc[fut[5], "Close"]
        recs.append({"monday": r["monday"], "t0": fut[0], "gas": r["GASREGW"], "wow": r["wow"],
                     "wti_contemp5": conc, "wti_fwd5": float(p1 / p0 - 1)})
    frame = pd.DataFrame(recs).dropna().reset_index(drop=True)
    frame.to_csv(PROCD / "gasregw_wti_weekly_is.csv", index=False)
    stats: dict = {"run": RUN, "n_weeks": len(frame)}
    stats["pearson_wow_vs_contemp5"] = round(float(frame["wow"].corr(frame["wti_contemp5"])), 4)
    stats["pearson_wow_vs_fwd5"] = round(float(frame["wow"].corr(frame["wti_fwd5"])), 4)
    stats["placebo_wow_shift52_vs_fwd5"] = round(float(frame["wow"].shift(52).corr(frame["wti_fwd5"])), 4)
    ex20 = frame[~pd.to_datetime(frame["t0"]).dt.year.isin([2020])]
    stats["scenario_ex2020_wow_vs_fwd5"] = round(float(ex20["wow"].corr(ex20["wti_fwd5"])), 4)

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].scatter(frame["wow"], frame["wti_contemp5"], s=8, alpha=0.6)
    axes[0].set_xlabel("retail gas WoW")
    axes[0].set_ylabel("same-week WTI 5TD move")
    axes[0].set_title("Contemporaneous (expected: strong)")
    axes[1].scatter(frame["wow"], frame["wti_fwd5"], s=8, alpha=0.6)
    axes[1].axhline(0, color="black", linewidth=0.8)
    axes[1].set_xlabel("retail gas WoW")
    axes[1].set_ylabel("next-5TD WTI return")
    axes[1].set_title("Lead (expected: null)")
    fig.suptitle("GASREGW sanity: mechanical co-move, no lead expected (IS 2015-2023)")
    fig.tight_layout()
    fig.savefig(FIGD / "gasregw_wti_is.png", dpi=110)
    plt.close(fig)

    stats["inputs_sha256"] = {"gasregw_csv": _sha(RAW), "wti_csv": _sha(WTI)}
    (PROCD / "stats.json").write_text(json.dumps(stats, indent=2, default=str))
    print(json.dumps(stats, indent=2, default=str))


def _sha(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


if __name__ == "__main__":
    sys.exit(main())
