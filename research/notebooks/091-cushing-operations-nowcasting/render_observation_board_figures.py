"""Render individual, data-backed figures for the Cushing observation board.

No missing hotel-tax or truck observation is visualised as a numeric series.
Those sources remain a documented data-gap in the accompanying report.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.stats import pearsonr


ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "gathering" / "raw"
FROZEN_END = pd.Timestamp("2023-12-31")


def future_inventory_targets(available: pd.Series, inventory: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, float | None]] = []
    for timestamp in pd.to_datetime(available):
        future = inventory.loc[(inventory.index > timestamp) & (inventory.index <= timestamp + pd.Timedelta(days=28))]
        rows.append({"future_inventory_change_kbbl": None if len(future) < 3 else float(future["cushing_inventory_kbbl"].iloc[-1] - future["cushing_inventory_kbbl"].iloc[0])})
    return pd.DataFrame(rows)


def spaced(frame: pd.DataFrame, date_col: str) -> pd.DataFrame:
    keep: list[int] = []
    last: pd.Timestamp | None = None
    for idx, date in frame.sort_values(date_col)[date_col].items():
        if last is None or date - last >= pd.Timedelta(days=28):
            keep.append(idx)
            last = date
    return frame.loc[keep].copy()


def scatter(frame: pd.DataFrame, x: str, title: str, x_label: str, output: Path) -> None:
    data = frame[[x, "future_inventory_change_kbbl"]].dropna()
    r, p = pearsonr(data[x], data["future_inventory_change_kbbl"])
    slope, intercept = np.polyfit(data[x], data["future_inventory_change_kbbl"], 1)
    grid = np.linspace(data[x].min(), data[x].max(), 200)
    fig, ax = plt.subplots(figsize=(7.1, 4.4), constrained_layout=True)
    ax.scatter(data[x], data["future_inventory_change_kbbl"], s=28, color="#2962a8", alpha=0.72, edgecolors="none")
    ax.plot(grid, slope * grid + intercept, color="#b23a48", linewidth=1.8)
    ax.axhline(0, color="#777777", linewidth=0.8)
    ax.set_title(title, loc="left", fontsize=12, fontweight="bold")
    ax.set_xlabel(x_label)
    ax.set_ylabel("Future 28d Cushing inventory change (kbbl)")
    ax.text(0.02, 0.96, f"n={len(data)}   Pearson r={r:+.3f}   p={p:.3f}", transform=ax.transAxes, va="top", fontsize=10,
            bbox={"facecolor": "white", "edgecolor": "#bbbbbb", "pad": 3})
    ax.grid(axis="y", color="#dddddd", linewidth=0.6)
    fig.savefig(output, format="svg", bbox_inches="tight")
    plt.close(fig)
    # Matplotlib's SVG writer leaves cosmetic end-of-line spaces in path data.
    # Strip only those spaces so repository whitespace checks remain meaningful.
    output.write_text("\n".join(line.rstrip() for line in output.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T030000Z" / "figures"))
    args = parser.parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)

    inventory = pd.read_csv(RAW / "091-cushing-cfam" / "bg2023" / "eia_cushing_inventory_weekly.csv", parse_dates=["date"]).set_index("date").sort_index()

    wiki = pd.read_csv(RAW / "2026-09-07-wikipedia-factor-probe" / "052W_WTI_panel.csv", parse_dates=["available_date"])
    wiki = wiki.loc[wiki["available_date"] <= FROZEN_END, ["available_date", "z_mean"]].copy()
    wiki = pd.concat([wiki.reset_index(drop=True), future_inventory_targets(wiki["available_date"], inventory)], axis=1)
    scatter(wiki, "z_mean", "052W Household Panic Wiki", "Wikipedia panic-attention z-score", output / "052w-household-panic.svg")

    harvest = pd.read_csv(RAW / "2026-09-07-harvest-combine" / "results" / "harvest_combine_ho_events.csv", parse_dates=["entry_date"])
    harvest = harvest.loc[harvest["entry_date"] <= FROZEN_END, ["entry_date", "harvest_pace_surprise_pct_pt"]].rename(columns={"entry_date": "available_date"})
    harvest = spaced(harvest, "available_date")
    harvest = pd.concat([harvest.reset_index(drop=True), future_inventory_targets(harvest["available_date"], inventory)], axis=1)
    scatter(harvest, "harvest_pace_surprise_pct_pt", "086 Harvest Combine Diesel Pulse", "Harvest pace surprise (percentage points)", output / "086-harvest-combine.svg")

    ice = pd.read_csv(RAW / "2026-09-07-great-lakes-icebreaker" / "great_lakes_icebreaker_event_panel.csv", parse_dates=["observation_date", "available_date"])
    ice = ice.loc[(ice["available_date"] <= FROZEN_END) & (ice["observation_date"].dt.weekday == 4), ["available_date", "total_ice_anomaly_0814"]]
    ice = spaced(ice, "available_date")
    ice = pd.concat([ice.reset_index(drop=True), future_inventory_targets(ice["available_date"], inventory)], axis=1)
    scatter(ice, "total_ice_anomaly_0814", "090 Great Lakes Ice Constraint", "Great Lakes ice anomaly (z-score)", output / "090-great-lakes-ice.svg")

    night = pd.read_csv(ROOT / "data" / "processed" / "091-cushing-cfam" / "20260908T110000Z" / "frozen_is_panel.csv")
    night = night.loc[night["status"].eq("ok"), ["core_control_anomaly", "next_28d_inventory_change_kbbl"]].rename(columns={"next_28d_inventory_change_kbbl": "future_inventory_change_kbbl"})
    scatter(night, "core_control_anomaly", "091 Cushing urban night-light control", "Core-versus-control brightness anomaly", output / "091-urban-night-light.svg")


if __name__ == "__main__":
    main()
