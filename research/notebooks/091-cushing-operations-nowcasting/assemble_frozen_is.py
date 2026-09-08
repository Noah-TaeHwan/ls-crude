"""Assemble the year-chunked CFAM collection into one frozen 2015--2023 test."""

from __future__ import annotations

import io
import json
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from scipy.stats import pearsonr, spearmanr


REPO = Path(__file__).resolve().parents[3]
EIA_HISTORY = "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=W_EPC0_SAX_YCUOK_MBBL"
RUN_ID = "20260908T110000Z"


def fetch_inventory() -> pd.DataFrame:
    html = requests.get(EIA_HISTORY, timeout=90).text
    table = max(pd.read_html(io.StringIO(html)), key=len).copy()
    table.columns = ["_".join(str(part) for part in col if str(part) != "nan") for col in table.columns]
    year = table[table.columns[0]].astype(str).str.extract(r"(\d{4})")[0]
    rows = []
    for date_col, value_col in zip(
        [column for column in table.columns if "End Date" in column],
        [column for column in table.columns if "Value" in column],
        strict=True,
    ):
        part = table[[date_col, value_col]].rename(columns={date_col: "raw_date", value_col: "inventory_kbbl"})
        part["date"] = pd.to_datetime(year + "-" + part["raw_date"].astype(str), format="%Y-%m/%d", errors="coerce")
        rows.append(part[["date", "inventory_kbbl"]])
    output = pd.concat(rows).dropna().drop_duplicates("date").sort_values("date")
    output["inventory_kbbl"] = pd.to_numeric(output["inventory_kbbl"], errors="coerce")
    return output.dropna().set_index("date")


def make_targets(inventory: pd.DataFrame) -> pd.DataFrame:
    records = []
    for month in pd.period_range("2015-01", "2023-12", freq="M"):
        available_at = month.to_timestamp(how="end").normalize() + pd.DateOffset(days=45)
        post = inventory[(inventory.index > available_at) & (inventory.index <= available_at + pd.DateOffset(days=28))]
        if len(post) < 3:
            continue
        changes = post["inventory_kbbl"].diff().dropna()
        records.append(
            {
                "month": month,
                "available_at": available_at,
                "next_28d_inventory_change_kbbl": float(post["inventory_kbbl"].iloc[-1] - post["inventory_kbbl"].iloc[0]),
                "next_28d_abs_weekly_change_kbbl": float(changes.abs().mean()),
            }
        )
    return pd.DataFrame(records)


def corr(panel: pd.DataFrame, target: str) -> dict[str, float | int | str]:
    values = panel[["core_control_anomaly", target]].dropna()
    p = pearsonr(values["core_control_anomaly"], values[target])
    return {
        "target": target,
        "n": len(values),
        "pearson_r": float(p.statistic),
        "pearson_p": float(p.pvalue),
        "spearman_r": float(spearmanr(values["core_control_anomaly"], values[target]).statistic),
    }


def main() -> None:
    signals = []
    missing = []
    for year in range(2015, 2024):
        path = REPO / "research" / "data" / "processed" / "091-cushing-cfam" / f"bg{year}" / "nightlight_signal.csv"
        if path.exists():
            signals.append(pd.read_csv(path))
        else:
            missing.append(year)
    if missing:
        raise SystemExit(f"Missing CFAM annual chunks: {missing}")

    signal = pd.concat(signals, ignore_index=True)
    signal["month"] = pd.PeriodIndex(signal["month"], freq="M")
    signal = signal.sort_values("month").drop_duplicates("month", keep="last")
    signal = signal[signal["status"] == "ok"].copy()
    signal["month_of_year"] = signal["month"].dt.month
    # Product break protection: normalize inside each processing version and month.
    signal["core_control_anomaly"] = signal["core_vs_control_log"] - signal.groupby(["processing_version", "month_of_year"])["core_vs_control_log"].transform("mean")

    inventory = fetch_inventory()
    panel = signal.merge(make_targets(inventory), on="month", how="inner")
    results = [
        corr(panel, "next_28d_inventory_change_kbbl"),
        corr(panel, "next_28d_abs_weekly_change_kbbl"),
    ]

    out = REPO / "research" / "indexes" / "091-cushing-operations-nowcasting" / RUN_ID
    processed = REPO / "research" / "data" / "processed" / "091-cushing-cfam" / RUN_ID
    out.mkdir(parents=True, exist_ok=True)
    processed.mkdir(parents=True, exist_ok=True)
    panel.to_csv(processed / "frozen_is_panel.csv", index=False)
    (out / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    rows = "\n".join(
        f"| {item['target']} | {item['n']} | {item['pearson_r']:+.3f} | {item['pearson_p']:.3f} | {item['spearman_r']:+.3f} |"
        for item in results
    )
    (out / "README.md").write_text(
        "# 091 CFAM — frozen in-sample result\n\n"
        f"Run UTC: {datetime.now(UTC).isoformat()}\n"
        "Input: 2015-01–2023-12 public Suomi-NPP monthly radiance. City-core minus four fixed rural controls; month-of-year anomalies are normalized within the rp2/ops processing family.\n"
        "Availability: month end +45 calendar days. Target: only subsequent 28-day official EIA Cushing stock movement.\n"
        "This is a coarse city-activity nowcast, not hotel occupancy and not a WTI directional test.\n\n"
        "| test | n | Pearson r | p-value | Spearman r |\n| --- | ---: | ---: | ---: | ---: |\n"
        + rows
        + "\n\n"
        "## Fixed interpretation\n\n"
        "No WTI claim is licensed by this calculation. The 2024+ period remains unopened until the sensor-bridge and any target-selection policy are reviewed.\n",
        encoding="utf-8",
    )
    print((out / "README.md").read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
