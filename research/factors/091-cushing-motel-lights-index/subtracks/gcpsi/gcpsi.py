"""091-GCPSI: public SPP congestion screen, kept inside CFAM 091.

This is a source/measurement feasibility tool.  It does not call power-grid
congestion a pipeline-pumping measurement unless an independently validated
Cushing-area node mapping and physical operational target are later supplied.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import date, timedelta
from pathlib import Path
from urllib.error import URLError

import pandas as pd


HERE = Path(__file__).resolve().parent
OUTPUT_COLUMNS = ["date", "node_id", "avg_lmp", "congestion_spike_zscore", "pumping_stress_index"]


def empty_daily() -> pd.DataFrame:
    return pd.DataFrame(columns=OUTPUT_COLUMNS)


def gridstatus_spp():
    import gridstatus

    # gridstatus 0.36 exposes SPP; older package releases used a shorter alias.
    factory = getattr(gridstatus, "SP", None) or getattr(gridstatus, "SPP")
    return factory()


def normalize(frame: pd.DataFrame, pattern: str, nodes: set[str]) -> pd.DataFrame:
    aliases = {
        "time": ("Interval Start", "Interval End", "Time", "Timestamp", "Interval"),
        "node_id": ("Location", "Location Id", "Location ID", "Node", "Node ID", "Settlement Location", "PNode"),
        "avg_lmp": ("LMP", "LMP Price", "lmp"),
        "congestion_price": ("Congestion", "MCC", "Congestion Price", "congestion_price"),
    }
    rename: dict[str, str] = {}
    for target, candidates in aliases.items():
        source = next((column for column in candidates if column in frame.columns), None)
        if source:
            rename[source] = target
    if set(rename.values()) != set(aliases):
        return pd.DataFrame(columns=["time", "node_id", "avg_lmp", "congestion_price"])
    out = frame.rename(columns=rename)[["time", "node_id", "avg_lmp", "congestion_price"]].copy()
    out["time"] = pd.to_datetime(out["time"], utc=True, errors="coerce")
    out["node_id"] = out["node_id"].astype(str)
    out["avg_lmp"] = pd.to_numeric(out["avg_lmp"], errors="coerce")
    out["congestion_price"] = pd.to_numeric(out["congestion_price"], errors="coerce")
    out = out.dropna().sort_values("time")
    if nodes:
        return out.loc[out["node_id"].isin(nodes)].copy()
    return out.loc[out["node_id"].str.contains(pattern, case=False, na=False, regex=True)].copy()


def fetch_day(day: date, pattern: str, nodes: set[str]) -> tuple[pd.DataFrame, dict[str, object]]:
    spp = gridstatus_spp()
    # One daily file is deliberately requested at a time. It bounds a public
    # feasibility test and avoids declaring a 7-day bulk timeout as no data.
    # gridstatus exposes a public 5-minute-by-bus method but no public daily-file
    # flag on that method. Version 0.36's daily archive needs these two internal
    # calls; retain this explicit dependency rather than silently substituting
    # settlement locations for physical buses.
    import gridstatus
    from gridstatus.spp import LOCATION_TYPE_BUS

    raw = spp._get_real_time_5_min_data_from_daily_files(pd.Timestamp(day), location_type=LOCATION_TYPE_BUS)
    finalized = spp._finalize_spp_df(raw, market=gridstatus.Markets.REAL_TIME_5_MIN, location_type=LOCATION_TYPE_BUS)
    normalized = normalize(finalized, pattern, nodes)
    return normalized, {"source": "SPP official RTBM-LMP-DAILY-B archive via gridstatus 0.36", "source_rows": len(finalized), "matched_rows": len(normalized)}


def aggregate(hourly_input: pd.DataFrame) -> pd.DataFrame:
    """Resample first, then calculate z-scores on the hourly series.

    Averaging the whole node before rolling would turn congestion into a
    constant and make the requested 24-hour/7-day z-score meaningless.
    """
    if hourly_input.empty:
        return empty_daily()
    hourly = (
        hourly_input.set_index("time")
        .groupby("node_id")[["avg_lmp", "congestion_price"]]
        .resample("1h")
        .agg(avg_lmp=("avg_lmp", "mean"), congestion_price=("congestion_price", "mean"))
        .dropna()
        .reset_index()
        .sort_values(["node_id", "time"])
    )

    def zscore(values: pd.Series, window: int) -> pd.Series:
        mean = values.rolling(window, min_periods=window).mean()
        std = values.rolling(window, min_periods=window).std(ddof=0)
        return (values - mean) / std.replace(0, pd.NA)

    hourly["z24"] = hourly.groupby("node_id")["congestion_price"].transform(lambda values: zscore(values, 24))
    hourly["z168"] = hourly.groupby("node_id")["congestion_price"].transform(lambda values: zscore(values, 168))
    hourly["congestion_spike_zscore"] = hourly[["z24", "z168"]].max(axis=1).clip(lower=0).fillna(0.0)
    hourly["date"] = hourly["time"].dt.date.astype(str)
    daily = hourly.groupby(["date", "node_id"], as_index=False).agg(
        avg_lmp=("avg_lmp", "mean"),
        congestion_spike_zscore=("congestion_spike_zscore", "max"),
    )
    daily["pumping_stress_index"] = (daily["congestion_spike_zscore"] / 3 * 100).clip(lower=0, upper=100)
    return daily[OUTPUT_COLUMNS].round(4)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", type=date.fromisoformat, default=date.today() - timedelta(days=1))
    parser.add_argument("--nodes", default="", help="Comma-separated pre-verified Cushing-area bus IDs.")
    parser.add_argument("--node-pattern", default="CUSH", help="Discovery-only name pattern when --nodes is absent.")
    parser.add_argument("--input", type=Path, help="Previously permitted local SPP CSV; avoids a network request.")
    parser.add_argument("--output", type=Path, default=HERE / "runs" / "gcpsi_daily.csv")
    parser.add_argument("--receipt", type=Path, default=HERE / "runs" / "latest_receipt.json")
    args = parser.parse_args()
    nodes = {item.strip() for item in args.nodes.split(",") if item.strip()}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.receipt.parent.mkdir(parents=True, exist_ok=True)
    frame, detail, status = pd.DataFrame(), {}, "no_input"
    try:
        if args.input:
            raw = pd.read_csv(args.input)
            frame = normalize(raw, args.node_pattern, nodes)
            detail = {"source": str(args.input), "source_rows": len(raw), "matched_rows": len(frame)}
            status = "ok" if not frame.empty else "no_matching_node"
        else:
            frame, detail = fetch_day(args.date, args.node_pattern, nodes)
            status = "ok" if not frame.empty else "no_matching_node"
    except URLError as error:
        detail = {"error": str(error)[:300]}
        status = "source_network_timeout" if any(term in str(error).lower() for term in ("timed out", "10060", "connection")) else "source_unavailable"
    except Exception as error:
        status = f"fetch_error:{type(error).__name__}"
        detail = {"error": str(error)[:300]}
    daily = aggregate(frame) if status == "ok" else empty_daily()
    daily.to_csv(args.output, index=False, quoting=csv.QUOTE_MINIMAL)
    receipt = {
        "status": status,
        "date_requested": args.date.isoformat(),
        "node_pattern": args.node_pattern,
        "explicit_nodes": sorted(nodes),
        "matched_5m_rows": len(frame),
        "daily_rows": len(daily),
        **detail,
    }
    args.receipt.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": status, "matched_5m_rows": len(frame), "daily_rows": len(daily)}, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
