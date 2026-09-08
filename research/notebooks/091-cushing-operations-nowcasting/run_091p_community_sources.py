"""Collect and render public, aggregate-only community context for CFAM 091-P.

This is deliberately an observation audit, not an oil model and not a CFAM score.
It uses only a school-level annual total and anonymised monthly article-count totals.
Article titles are used transiently for the rule-based count and are not emitted into
the tracked output.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
RAW_ROOT = ROOT / "gathering" / "raw" / "ALT-20260908-17"
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091PZ"
API = "https://www.1600kush.com/wp-json/wp/v2/posts"
KEYWORDS = (
    "pipeline", "terminal", "tank farm", "storage", "refinery", "crude", "oil",
    "diesel", "gasoline", "fuel", "jet-a", "avgas", "railroad", "rail", "truck",
    "trucking", "highway", "road closure", "power outage", "electric outage",
    "substation", "water outage", "water main", "construction", "industrial",
)


def fetch_all_posts(raw_dir: Path) -> list[dict]:
    """Fetch public metadata only; raw title metadata remains untracked by .gitignore."""
    raw_dir.mkdir(parents=True, exist_ok=True)
    existing = sorted(raw_dir.glob("posts-page-*.json"))
    all_rows: list[dict] = [row for path in existing for row in json.loads(path.read_text(encoding="utf-8"))]
    page = len(existing) + 1
    while True:
        params = {"per_page": 100, "page": page, "_fields": "date,title"}
        req = Request(f"{API}?{urlencode(params)}", headers={"User-Agent": "ls-crude-CFAM-research/1.0"})
        with urlopen(req, timeout=30) as response:  # nosec B310 - fixed HTTPS public API
            blob = response.read()
            rows = json.loads(blob)
            total_pages = int(response.headers["X-WP-TotalPages"])
        (raw_dir / f"posts-page-{page:03d}.json").write_bytes(blob)
        all_rows.extend(rows)
        if page >= total_pages:
            break
        page += 1
    return all_rows


def selected_monthly(rows: list[dict]) -> pd.DataFrame:
    pattern = re.compile("|".join(re.escape(word) for word in KEYWORDS), re.IGNORECASE)
    selected: list[datetime] = []
    for row in rows:
        title = str(row.get("title", {}).get("rendered", ""))
        # High-precision rule: local-city reference and one operational term in the title.
        if "cushing" in title.lower() and pattern.search(title):
            selected.append(datetime.fromisoformat(row["date"].replace("Z", "+00:00")))
    dates = pd.to_datetime(selected)
    monthly = pd.Series(1, index=dates).resample("MS").sum().fillna(0).astype(int)
    return monthly.rename_axis("month").reset_index(name="article_count")


def write_receipt(raw_dir: Path) -> None:
    files = sorted(raw_dir.glob("posts-page-*.json"))
    lines = [
        "# ALT-20260908-17 — KUSH public metadata retrieval receipt",
        "",
        f"- Retrieved at (UTC): `{datetime.now(timezone.utc).isoformat(timespec='seconds')}`",
        f"- API: `{API}?per_page=100&page=N&_fields=date,title`",
        "- Scope: public WordPress post metadata only. Article titles are retained only in ignored raw JSON to create aggregate counts; no titles, author names, article text, listeners, callers, or individual records are committed.",
        "- Aggregation rule: title contains `Cushing` and at least one pre-registered operational keyword: `" + "`, `".join(KEYWORDS) + "`.",
        "- Interpretation boundary: an article count measures KUSH local operational *attention*, not people, employment, traffic, refinery throughput, or Cushing activity.",
        "",
        "| file | bytes | SHA-256 |",
        "| --- | ---: | --- |",
    ]
    for path in files:
        lines.append(f"| {path.name} | {path.stat().st_size} | `{hashlib.sha256(path.read_bytes()).hexdigest()}` |")
    (raw_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def school_frame() -> pd.DataFrame:
    # Official state public-enrollment workbooks; 2023 was not in the extracted sample.
    rows = [("2019-20", 505), ("2020-21", 474), ("2021-22", 494), ("2022-23", 530), ("2024-25", 529)]
    return pd.DataFrame(rows, columns=["school_year", "cushing_high_school_enrollment"])


def render(school: pd.DataFrame, kush: pd.DataFrame) -> None:
    figures = OUT / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    school.to_csv(OUT / "091p_cushing_hs_enrollment_sample.csv", index=False)
    kush.to_csv(OUT / "091p_kush_operational_attention_monthly.csv", index=False)

    fig, ax = plt.subplots(figsize=(9.5, 4.6), constrained_layout=True)
    ax.plot(school["school_year"], school["cushing_high_school_enrollment"], marker="o", color="#1d4f91", linewidth=2.3)
    for _, row in school.iterrows():
        ax.annotate(str(row["cushing_high_school_enrollment"]), (row["school_year"], row["cushing_high_school_enrollment"]), xytext=(0, 8), textcoords="offset points", ha="center", fontsize=9)
    ax.set_title("091-P1 — Cushing High School: official annual enrollment sample", loc="left", fontweight="bold")
    ax.set_ylabel("students")
    ax.grid(axis="y", alpha=0.22)
    ax.text(0.01, -0.22, "Annual structural footprint only; 2023-24 is absent from the extracted source sample. Not a daily/weekly busy-ness measure and no oil test is run.", transform=ax.transAxes, fontsize=8.5)
    fig.savefig(figures / "091p-school-enrollment-sample.svg", bbox_inches="tight")
    fig.savefig(figures / "091p-school-enrollment-sample.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    kush["month"] = pd.to_datetime(kush["month"])
    kush["rolling_12m"] = kush["article_count"].rolling(12, min_periods=12).sum()
    fig, ax = plt.subplots(figsize=(10.5, 4.8), constrained_layout=True)
    ax.bar(kush["month"], kush["article_count"], width=24, color="#a8c5e8", label="monthly count")
    ax.plot(kush["month"], kush["rolling_12m"], color="#cc5b2c", linewidth=2.0, label="trailing 12-month count")
    ax.set_title("091-P2 — KUSH: local operational-attention count", loc="left", fontweight="bold")
    ax.set_ylabel("matching article titles")
    ax.grid(axis="y", alpha=0.2)
    ax.legend(frameon=False)
    ax.text(0.01, -0.22, "Rule: title contains Cushing + a fixed operational keyword. This is media attention, not a count of residents, workers, traffic, or oil-hub throughput.", transform=ax.transAxes, fontsize=8.4)
    fig.savefig(figures / "091p-kush-operational-attention.svg", bbox_inches="tight")
    fig.savefig(figures / "091p-kush-operational-attention.png", dpi=180, bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fetch-kush", action="store_true", help="fetch the public KUSH metadata archive")
    parser.add_argument("--raw-dir", type=Path, default=RAW_ROOT / "20260908T170000Z")
    args = parser.parse_args()
    if args.fetch_kush:
        rows = fetch_all_posts(args.raw_dir)
        write_receipt(args.raw_dir)
    else:
        files = sorted(args.raw_dir.glob("posts-page-*.json"))
        if not files:
            raise FileNotFoundError("Use --fetch-kush or provide an existing raw metadata directory")
        rows = [row for path in files for row in json.loads(path.read_text(encoding="utf-8"))]
        write_receipt(args.raw_dir)
    render(school_frame(), selected_monthly(rows))


if __name__ == "__main__":
    main()
