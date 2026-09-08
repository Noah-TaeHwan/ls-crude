"""CALMF — factor-local last-mile logistics feasibility collector.

This program deliberately has no Amazon Flex, job-board, or municipal-web
scraper.  Those sources currently lack a documented, public, reusable regional
time series.  It accepts only a permitted local export of already-aggregated,
non-personal observations and writes all outputs below this factor directory.

The required input schema is CSV or JSON rows with:
    available_at, metric, value, source_id, geography, source_url

``metric`` is one of ``driver_posting``, ``delivery_block``, or
``facility_milestone``.  ``available_at`` is the first time the source could
have been used, not a retrospectively inferred observation date.  Driver
postings are hiring intent; delivery blocks are offered/aggregated blocks; a
facility milestone is stored in a separate event ledger and never treated as
weekly fulfilment velocity.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import sys
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
RECEIPT_DIR = ROOT / "receipts"
WEEKLY_PATH = DATA_DIR / "calmf_weekly.csv"
MILESTONE_PATH = DATA_DIR / "facility_milestones.csv"
RECEIPT_PATH = RECEIPT_DIR / "latest_execution.json"
WEEKLY_FIELDS = [
    "date",
    "driver_posting_density",
    "delivery_block_count",
    "fulfillment_velocity_score",
]
MILESTONE_FIELDS = ["available_at", "source_id", "source_url", "geography", "value"]
ALLOWED_METRICS = {"driver_posting", "delivery_block", "facility_milestone"}
ALLOWED_GEOGRAPHIES = {"cushing ok", "payne county ok"}


def normalized_geography(value: str) -> str:
    return " ".join(value.lower().replace(",", " ").replace(".", " ").split())


def parse_available_date(value: Any) -> date:
    text = str(value).strip().replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text).date()
    except ValueError:
        return date.fromisoformat(text[:10])


def nonnegative_number(value: Any) -> float:
    number = float(value)
    if not math.isfinite(number) or number < 0:
        raise ValueError("value must be finite and non-negative")
    return number


def load_input(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".json":
        payload = json.loads(path.read_text(encoding="utf-8"))
        rows = payload.get("items", []) if isinstance(payload, dict) else payload
    elif path.suffix.lower() == ".csv":
        with path.open(newline="", encoding="utf-8") as handle:
            rows = list(csv.DictReader(handle))
    else:
        raise ValueError("input must be a .csv or .json aggregate export")
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        raise ValueError("input must contain a list of row objects")
    return rows


def validate_rows(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    """Retain only time-stamped, regional, aggregate observation rows.

    Input coverage cannot be inferred.  Invalid/ambiguous rows are excluded and
    counted in the receipt rather than changed into a zero observation.
    """
    valid: list[dict[str, Any]] = []
    rejected = 0
    for row in rows:
        try:
            metric = str(row.get("metric", "")).strip().lower()
            geography = normalized_geography(str(row.get("geography", "")))
            source_id = str(row.get("source_id", "")).strip()
            source_url = str(row.get("source_url", "")).strip()
            if metric not in ALLOWED_METRICS or geography not in ALLOWED_GEOGRAPHIES:
                raise ValueError("metric or geography outside frozen scope")
            if not source_id or not source_url:
                raise ValueError("source_id and source_url are required")
            available_on = parse_available_date(row.get("available_at", ""))
            value = nonnegative_number(row.get("value", 1))
            if metric in {"driver_posting", "facility_milestone"} and value != 1:
                raise ValueError("event metrics must use value=1")
            valid.append(
                {
                    "available_on": available_on,
                    "metric": metric,
                    "value": value,
                    "source_id": source_id,
                    "source_url": source_url,
                    "geography": geography,
                }
            )
        except (TypeError, ValueError):
            rejected += 1
    return valid, rejected


def daily_panel(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Build a real daily panel; missing daily coverage remains missing.

    A 30-day statistic needs 30 consecutive daily observation opportunities for
    both driver-posting intent and aggregate block availability.  No weekly data
    are interpolated into days.
    """
    driver_ids: dict[date, set[str]] = defaultdict(set)
    block_values: dict[date, dict[str, float]] = defaultdict(dict)
    milestones: list[dict[str, Any]] = []
    for row in rows:
        day = row["available_on"]
        if row["metric"] == "driver_posting":
            driver_ids[day].add(row["source_id"])
        elif row["metric"] == "delivery_block":
            # Same source snapshot can be supplied once per day; retain the
            # maximum if an authorized correction is re-exported.
            block_values[day][row["source_id"]] = max(
                block_values[day].get(row["source_id"], 0.0), row["value"]
            )
        else:
            milestones.append(row)

    observed_days = sorted(set(driver_ids) | set(block_values))
    if not observed_days:
        return [], milestones
    panel: list[dict[str, Any]] = []
    cursor = observed_days[0]
    final_day = observed_days[-1]
    while cursor <= final_day:
        has_both = cursor in driver_ids and cursor in block_values
        drivers = float(len(driver_ids[cursor])) if cursor in driver_ids else None
        blocks = sum(block_values[cursor].values()) if cursor in block_values else None
        raw = math.log1p(drivers) + math.log1p(blocks) if has_both else None
        panel.append(
            {
                "date": cursor,
                "driver_posting_density": drivers,
                "delivery_block_count": blocks,
                "raw_velocity": raw,
                "fulfillment_velocity_score": None,
            }
        )
        cursor += timedelta(days=1)

    for index, row in enumerate(panel):
        if index < 29:
            continue
        window = panel[index - 29 : index + 1]
        values = [candidate["raw_velocity"] for candidate in window]
        if any(value is None for value in values):
            continue
        numeric = [float(value) for value in values]
        mean = sum(numeric) / len(numeric)
        variance = sum((value - mean) ** 2 for value in numeric) / len(numeric)
        deviation = math.sqrt(variance)
        z_score = 0.0 if deviation == 0 else (numeric[-1] - mean) / deviation
        row["fulfillment_velocity_score"] = max(0.0, min(100.0, 50.0 + 10.0 * z_score))
    return panel, milestones


def week_ending(day: date) -> date:
    return day + timedelta(days=(6 - day.weekday()))


def weekly_panel(panel: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Aggregate only days with a legitimate 30-day score into weekly output."""
    groups: dict[date, list[dict[str, Any]]] = defaultdict(list)
    for row in panel:
        if row["fulfillment_velocity_score"] is not None:
            groups[week_ending(row["date"])].append(row)
    output: list[dict[str, str]] = []
    for ending, rows in sorted(groups.items()):
        drivers = sum(float(row["driver_posting_density"]) for row in rows) / len(rows)
        blocks = sum(float(row["delivery_block_count"]) for row in rows)
        score = sum(float(row["fulfillment_velocity_score"]) for row in rows) / len(rows)
        output.append(
            {
                "date": ending.isoformat(),
                "driver_posting_density": f"{drivers:.4f}",
                "delivery_block_count": f"{blocks:.4f}",
                "fulfillment_velocity_score": f"{score:.4f}",
            }
        )
    return output


def write_csv(path: Path, fields: list[str], rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_receipt(receipt: dict[str, Any]) -> None:
    RECEIPT_DIR.mkdir(parents=True, exist_ok=True)
    RECEIPT_PATH.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="Permitted local aggregate CSV or JSON; no web scraping occurs.")
    args = parser.parse_args()

    raw_rows: list[dict[str, Any]] = []
    accepted: list[dict[str, Any]] = []
    rejected = 0
    input_hash: str | None = None
    status = "park_no_reproducible_weekly_inputs"
    error: str | None = None
    try:
        if args.input:
            raw_rows = load_input(args.input)
            input_hash = hashlib.sha256(args.input.read_bytes()).hexdigest()
            accepted, rejected = validate_rows(raw_rows)
            status = "ok_forward_only" if accepted else "no_usable_authorized_rows"
    except Exception as exc:
        status = f"input_error:{type(exc).__name__}"
        error = str(exc)[:300]

    panel, milestones = daily_panel(accepted)
    weekly = weekly_panel(panel)
    if accepted and not weekly and status == "ok_forward_only":
        status = "insufficient_30_day_daily_coverage"

    write_csv(WEEKLY_PATH, WEEKLY_FIELDS, weekly)
    write_csv(
        MILESTONE_PATH,
        MILESTONE_FIELDS,
        [
            {
                "available_at": row["available_on"].isoformat(),
                "source_id": row["source_id"],
                "source_url": row["source_url"],
                "geography": row["geography"],
                "value": row["value"],
            }
            for row in milestones
        ],
    )
    receipt = {
        "status": status,
        "collector": "calmf.py",
        "executed_at_utc": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "input_path": str(args.input) if args.input else None,
        "input_sha256": input_hash,
        "input_rows": len(raw_rows),
        "accepted_rows": len(accepted),
        "rejected_rows": rejected,
        "daily_observation_days": len(panel),
        "milestone_events": len(milestones),
        "output_rows": len(weekly),
        "output_path": str(WEEKLY_PATH.relative_to(ROOT)),
        "error": error,
    }
    write_receipt(receipt)
    print(
        json.dumps(
            {
                "status": status,
                "input_rows": len(raw_rows),
                "accepted_rows": len(accepted),
                "output_rows": len(weekly),
            },
            separators=(",", ":"),
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
