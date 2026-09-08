"""Cushing Field Activity Monitor (CFAM) data build and frozen IS test.

This is deliberately a *nowcasting* experiment.  It tests whether a public
night-light anomaly around Cushing is associated with later changes in the
official EIA Cushing inventory series.  It does not identify a motel, worker,
or individual vehicle, and it does not claim to forecast WTI direction.

Dependencies (kept outside the repository): pandas, numpy, scipy, rasterio.
Example:
  python run_cfam.py --end 2023-12 --run-id 20260908T000000Z
The default end date is frozen at 2023-12 so model construction cannot inspect
the 2024+ out-of-sample period by accident.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
import pandas as pd
import rasterio
import requests
from scipy.stats import pearsonr, spearmanr


REPO = Path(__file__).resolve().parents[3]
BUCKET = "https://globalnightlight.s3.amazonaws.com"
EIA_HISTORY = (
    "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?"
    "f=W&n=PET&s=W_EPC0_SAX_YCUOK_MBBL"
)

# Public, deliberately coarse pixels: city core and four fixed rural controls.
# They are not lodging, household, or business-level observations.
CUSHING_CORE = (-96.7668, 35.9851)
RURAL_CONTROLS = [
    (-96.9000, 35.9800),
    (-96.6400, 35.9800),
    (-96.7700, 36.1150),
    (-96.7700, 35.8500),
]
WINDOW_RADIUS = 2  # 5 x 5 ~500 m VIIRS cells; fixed before testing.


@dataclass(frozen=True)
class TestResult:
    signal: str
    target: str
    n: int
    pearson_r: float
    pearson_p: float
    spearman_r: float


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def month_source(month: pd.Period) -> tuple[str, str]:
    """Return a fixed monthly URL and its processing family.

    The publisher changed its processing convention in 2018.  That is retained
    as an explicit feature field and normalized separately below, never spliced
    into one raw radiance level.
    """
    start = month.to_timestamp()
    end = month.to_timestamp(how="end")
    if month < pd.Period("2018-01", freq="M"):
        processing, correction, tag = "rp2", "vcm-slcorr", "rp2"
    else:
        processing, correction, tag = "ops", "ecm-slcorr", "ops"
    sensor = "npp"
    return (
        f"{BUCKET}/composites/{sensor}_{month.strftime('%Y%m')}_{tag}/"
        f"DNB_{sensor}_{start:%Y%m%d}-{end:%Y%m%d}_global_{correction}_v10_{tag}.avg_rade9.tif",
        processing,
    )


def sample_window(dataset: rasterio.io.DatasetReader, point: tuple[float, float]) -> float:
    row, col = dataset.index(*point)
    array = dataset.read(
        1,
        window=((row - WINDOW_RADIUS, row + WINDOW_RADIUS + 1), (col - WINDOW_RADIUS, col + WINDOW_RADIUS + 1)),
        masked=True,
    )
    values = np.asarray(array.compressed(), dtype=float)
    values = values[np.isfinite(values) & (values > -100)]
    return float(np.median(values)) if len(values) else float("nan")


def collect_month(month: pd.Period) -> dict[str, object]:
    # Keep IS entirely on Suomi-NPP. NOAA-20/j01 starts later and is a separate,
    # future OOS sensor bridge rather than a silent level splice.
    url, processing = month_source(month)
    try:
        with rasterio.open(url) as dataset:
            core = sample_window(dataset, CUSHING_CORE)
            controls = [sample_window(dataset, point) for point in RURAL_CONTROLS]
    except Exception as exc:
        return {"month": str(month), "status": f"read_error:{type(exc).__name__}", "source_url": url}
    control = float(np.nanmedian(np.asarray(controls, dtype=float)))
    return {
        "month": str(month),
        "status": "ok",
        "sensor": "npp",
        "processing_version": processing,
        "source_url": url,
        "core_median_radiance": core,
        "control_median_radiance": control,
        "core_vs_control_log": float(np.log1p(core) - np.log1p(control)),
    }


def build_nightlights(start: str, end: str) -> pd.DataFrame:
    months = list(pd.period_range(start, end, freq="M"))
    # Twelve bounded COG range reads keep a calendar year below a single session
    # while avoiding full-file downloads; no crawler retries or broad scans.
    with ThreadPoolExecutor(max_workers=12) as executor:
        rows = list(executor.map(collect_month, months))
    signal = pd.DataFrame(rows)
    signal["month"] = pd.PeriodIndex(signal["month"], freq="M")
    good = signal[signal["status"] == "ok"].copy()
    # Month-of-year demeaning stops ordinary winter/summer illumination patterns
    # from masquerading as operational activity.
    good["month_of_year"] = good["month"].dt.month
    good["core_control_anomaly"] = good["core_vs_control_log"] - good.groupby(["processing_version", "month_of_year"])["core_vs_control_log"].transform("mean")
    return signal.merge(good[["month", "core_control_anomaly"]], on="month", how="left")


def fetch_cushing_inventory() -> pd.DataFrame:
    response = requests.get(EIA_HISTORY, timeout=90)
    response.raise_for_status()
    tables = pd.read_html(io.StringIO(response.text))
    table = max(tables, key=len).copy()
    table.columns = ["_".join(str(part) for part in col if str(part) != "nan") for col in table.columns]
    date_columns = [column for column in table.columns if "End Date" in column]
    value_columns = [column for column in table.columns if "Value" in column]
    rows: list[dict[str, object]] = []
    for date_col, value_col in zip(date_columns, value_columns, strict=True):
        part = table[[date_col, value_col]].rename(columns={date_col: "date_raw", value_col: "cushing_inventory_kbbl"})
        part["date_raw"] = part["date_raw"].astype(str)
        # EIA table omits year in weekly columns; Year-Month supplies it.
        year = table[table.columns[0]].astype(str).str.extract(r"(\d{4})")[0]
        part["date"] = pd.to_datetime(year + "-" + part["date_raw"], format="%Y-%m/%d", errors="coerce")
        rows.extend(part[["date", "cushing_inventory_kbbl"]].dropna().to_dict("records"))
    inventory = pd.DataFrame(rows).drop_duplicates("date").sort_values("date")
    inventory["cushing_inventory_kbbl"] = pd.to_numeric(inventory["cushing_inventory_kbbl"], errors="coerce")
    inventory = inventory.dropna().set_index("date")
    inventory["weekly_change_kbbl"] = inventory["cushing_inventory_kbbl"].diff()
    return inventory.reset_index()


def make_targets(inventory: pd.DataFrame) -> pd.DataFrame:
    weekly = inventory.set_index("date").sort_index()
    rows: list[dict[str, object]] = []
    for month in pd.period_range("2015-01", "2023-12", freq="M"):
        # A monthly composite is treated as available 45 days after month-end.
        # Target is only *subsequent* 28-day stock movement.
        available_at = month.to_timestamp(how="end").normalize() + pd.DateOffset(days=45)
        post = weekly[(weekly.index > available_at) & (weekly.index <= available_at + pd.DateOffset(days=28))]
        if len(post) < 3:
            continue
        rows.append(
            {
                "month": month,
                "available_at": available_at,
                "next_28d_inventory_change_kbbl": float(post["cushing_inventory_kbbl"].iloc[-1] - post["cushing_inventory_kbbl"].iloc[0]),
                "next_28d_abs_weekly_change_kbbl": float(post["weekly_change_kbbl"].abs().mean()),
            }
        )
    return pd.DataFrame(rows)


def correlations(panel: pd.DataFrame) -> list[TestResult]:
    results: list[TestResult] = []
    for target in ["next_28d_inventory_change_kbbl", "next_28d_abs_weekly_change_kbbl"]:
        values = panel[["core_control_anomaly", target]].dropna()
        if len(values) < 2:
            results.append(
                TestResult(
                    signal="nightlight core-control seasonal anomaly",
                    target=target,
                    n=len(values),
                    pearson_r=float("nan"),
                    pearson_p=float("nan"),
                    spearman_r=float("nan"),
                )
            )
            continue
        pearson = pearsonr(values["core_control_anomaly"], values[target])
        results.append(
            TestResult(
                signal="nightlight core-control seasonal anomaly",
                target=target,
                n=len(values),
                pearson_r=float(pearson.statistic),
                pearson_p=float(pearson.pvalue),
                spearman_r=float(spearmanr(values["core_control_anomaly"], values[target]).statistic),
            )
        )
    return results


def write_report(path: Path, results: list[TestResult], signal: pd.DataFrame, panel: pd.DataFrame, run_id: str) -> None:
    ok = signal[signal["status"] == "ok"]
    lines = [
        "# 091 CFAM — frozen in-sample result",
        "",
        f"- run: `{run_id}` (UTC {datetime.now(UTC).isoformat()})",
        "- signal: Cushing city-core night radiance minus four fixed rural-control medians, then month-of-year demeaned.",
        "- universe: Suomi-NPP only, 2015-01–2023-12; the rp2/ops processing break is retained and seasonally normalized within version; missing months are omitted.",
        "- availability contract: monthly composite +45 calendar days; target is the following 28-day official EIA Cushing inventory movement.",
        "- important: this is a city-scale proxy, not motel occupancy and not a WTI trading result.",
        "",
        "| test | n | Pearson r | p-value | Spearman r |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for item in results:
        lines.append(f"| {item.target} | {item.n} | {item.pearson_r:+.3f} | {item.pearson_p:.3f} | {item.spearman_r:+.3f} |")
    lines += [
        "",
        f"Coverage: {len(ok)} valid public monthly observations of {len(signal)} requested months; {len(panel)} aligned target rows.",
        "",
        "## Interpretation",
        "",
        "This frozen IS calculation is descriptive. A low p-value alone would not establish an operational mechanism; an OOS run needs a documented NPP→NOAA-20 sensor bridge and may be opened only after the feature definition above is frozen.",
    ]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", default="2015-01")
    parser.add_argument("--end", default="2023-12")
    parser.add_argument("--run-id", default=datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ"))
    args = parser.parse_args()
    if pd.Period(args.end, freq="M") > pd.Period("2023-12", freq="M"):
        raise SystemExit("Refusing to open 2024+ before the frozen IS report is reviewed.")

    processed = REPO / "research" / "data" / "processed" / "091-cushing-cfam" / args.run_id
    index_dir = REPO / "research" / "indexes" / "091-cushing-operations-nowcasting" / args.run_id
    raw_dir = REPO / "research" / "gathering" / "raw" / "091-cushing-cfam" / args.run_id
    for directory in [processed, index_dir, raw_dir]:
        directory.mkdir(parents=True, exist_ok=True)

    signal = build_nightlights(args.start, args.end)
    inventory = fetch_cushing_inventory()
    targets = make_targets(inventory)
    panel = signal.merge(targets, on="month", how="inner")
    signal.to_csv(processed / "nightlight_signal.csv", index=False)
    inventory.to_csv(raw_dir / "eia_cushing_inventory_weekly.csv", index=False)
    panel.to_csv(processed / "aligned_panel.csv", index=False)
    results = correlations(panel)
    (raw_dir / "README.md").write_text(
        "# 091 CFAM raw collection manifest\n\n"
        f"- retrieved_at: {datetime.now(UTC).isoformat()}\n"
        f"- EIA URL: {EIA_HISTORY}\n"
        "- World Bank Light Every Night COG URLs: stored in the processed signal `source_url` field; retrieval is via public S3 range reads.\n"
        f"- EIA weekly rows: {len(inventory)}\n"
        f"- sha256 (EIA CSV): {sha256(raw_dir / 'eia_cushing_inventory_weekly.csv')}\n"
        "- original source terms and availability assumptions are documented in the factor and source registry.\n",
        encoding="utf-8",
    )
    write_report(index_dir / "README.md", results, signal, panel, args.run_id)
    (index_dir / "results.json").write_text(json.dumps([asdict(item) for item in results], indent=2), encoding="utf-8")
    print(f"Wrote {index_dir / 'README.md'}")


if __name__ == "__main__":
    main()
