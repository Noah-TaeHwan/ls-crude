"""Exploratory bridge: existing public factors against future Cushing inventory.

This deliberately does *not* make a composite score.  The three candidate
signals have different observation scopes and two have non-overlapping
seasons.  It produces reproducible, availability-aware individual tests only.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd
from scipy.stats import pearsonr, spearmanr


ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "gathering" / "raw"
DEFAULT_END = pd.Timestamp("2023-12-31")


def next_28d_targets(available: pd.Series, inventory: pd.DataFrame) -> pd.DataFrame:
    """Future-only EIA targets; no same-day inventory observation is used."""
    rows: list[dict[str, object]] = []
    for timestamp in pd.to_datetime(available):
        future = inventory.loc[(inventory.index > timestamp) & (inventory.index <= timestamp + pd.Timedelta(days=28))]
        if len(future) < 3:
            rows.append({"future_28d_inventory_change_kbbl": None, "future_28d_abs_weekly_change_kbbl": None})
            continue
        rows.append({
            "future_28d_inventory_change_kbbl": float(future["cushing_inventory_kbbl"].iloc[-1] - future["cushing_inventory_kbbl"].iloc[0]),
            "future_28d_abs_weekly_change_kbbl": float(future["weekly_change_kbbl"].abs().mean()),
        })
    return pd.DataFrame(rows)


def spacing_filter(frame: pd.DataFrame, date_col: str, days: int = 28) -> pd.DataFrame:
    """Greedy de-overlap so 28-day future windows do not share observations."""
    kept: list[int] = []
    last: pd.Timestamp | None = None
    for idx, date in frame.sort_values(date_col)[date_col].items():
        if last is None or date - last >= pd.Timedelta(days=days):
            kept.append(idx)
            last = date
    return frame.loc[kept].copy()


def correlations(frame: pd.DataFrame, signal_col: str) -> dict[str, dict[str, float | int | None]]:
    output: dict[str, dict[str, float | int | None]] = {}
    for target in ("future_28d_inventory_change_kbbl", "future_28d_abs_weekly_change_kbbl"):
        sample = frame[[signal_col, target]].dropna()
        if len(sample) < 8 or sample[signal_col].nunique() < 3:
            output[target] = {"n": int(len(sample)), "pearson_r": None, "pearson_p": None, "spearman_r": None, "spearman_p": None}
            continue
        pearson = pearsonr(sample[signal_col], sample[target])
        spearman = spearmanr(sample[signal_col], sample[target])
        output[target] = {
            "n": int(len(sample)), "pearson_r": round(float(pearson.statistic), 3), "pearson_p": round(float(pearson.pvalue), 3),
            "spearman_r": round(float(spearman.statistic), 3), "spearman_p": round(float(spearman.pvalue), 3),
        }
    return output


def add_targets(frame: pd.DataFrame, available_col: str, inventory: pd.DataFrame) -> pd.DataFrame:
    return pd.concat([frame.reset_index(drop=True), next_28d_targets(frame[available_col], inventory)], axis=1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--end", default="2023-12-31", help="availability cutoff; default frozen 2015-2023 IS")
    parser.add_argument("--output", default=str(ROOT / "data" / "processed" / "091-cushing-cfam" / "context_bridge_2015_2023"))
    args = parser.parse_args()
    end = pd.Timestamp(args.end)
    if end > DEFAULT_END:
        raise ValueError("This bridge is frozen to 2023-12-31: later data is already explored and cannot be called OOS.")

    inventory = pd.read_csv(RAW / "091-cushing-cfam" / "bg2023" / "eia_cushing_inventory_weekly.csv", parse_dates=["date"]).set_index("date").sort_index()

    wiki = pd.read_csv(RAW / "2026-09-07-wikipedia-factor-probe" / "052W_WTI_panel.csv", parse_dates=["observation_date", "available_date"])
    wiki = wiki.loc[wiki["available_date"] <= end, ["observation_date", "available_date", "z_mean", "breadth"]].copy()
    wiki["factor"] = "052W Household Panic Wiki"
    wiki = add_targets(wiki, "available_date", inventory)

    harvest = pd.read_csv(RAW / "2026-09-07-harvest-combine" / "results" / "harvest_combine_ho_events.csv", parse_dates=["release_date", "entry_date"])
    harvest = harvest.loc[harvest["entry_date"] <= end, ["release_date", "entry_date", "harvest_pace_surprise_pct_pt"]].copy()
    harvest = spacing_filter(harvest, "entry_date")
    harvest = harvest.rename(columns={"entry_date": "available_date", "release_date": "observation_date"})
    harvest["factor"] = "086 Harvest Combine Diesel Pulse"
    harvest = add_targets(harvest, "available_date", inventory)

    ice = pd.read_csv(RAW / "2026-09-07-great-lakes-icebreaker" / "great_lakes_icebreaker_event_panel.csv", parse_dates=["observation_date", "available_date"])
    # Friday observations are the pre-specified weekly sampling convention of the original 090 probe.
    ice = ice.loc[(ice["available_date"] <= end) & (ice["observation_date"].dt.weekday == 4), ["observation_date", "available_date", "total_ice_anomaly_0814", "ice_level_z90"]].copy()
    ice = spacing_filter(ice, "available_date")
    ice["factor"] = "090 Great Lakes Ice Constraint"
    ice = add_targets(ice, "available_date", inventory)

    panels = {
        "052W": (wiki, "z_mean"),
        "086": (harvest, "harvest_pace_surprise_pct_pt"),
        "090": (ice, "total_ice_anomaly_0814"),
    }
    result = {
        "scope": "Exploratory 2015-2023 bridge to EIA Cushing inventory; descriptive only, not an OOS certification.",
        "availability_rule": "signal is joined only to EIA observations strictly after signal_ready/available date, through +28 calendar days; sparse signals de-overlapped by 28 days.",
        "tests": {name: correlations(frame, signal) for name, (frame, signal) in panels.items()},
        "combination_gate": {
            "086_observation_months": sorted(harvest["observation_date"].dt.month.unique().tolist()),
            "090_observation_months": sorted(ice["observation_date"].dt.month.unique().tolist()),
            "same_day_086_090_observations": int(len(set(harvest["observation_date"]) & set(ice["observation_date"]))),
            "decision": "No scalar 086+090 score: their seasonal windows do not overlap. 052W remains contextual only, not a Cushing-local activity measure.",
        },
    }
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    pd.concat([wiki, harvest, ice], ignore_index=True, sort=False).to_csv(output / "context_bridge_panel.csv", index=False)
    (output / "context_bridge_results.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
