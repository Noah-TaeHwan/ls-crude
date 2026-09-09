"""CALMF permitted-aggregate collector; no scraping, accounts, or personal data."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
RECEIPTS = ROOT / "receipts"
WEEKLY = DATA / "calmf_weekly.csv"
MILESTONES = DATA / "facility_milestones.csv"
RECEIPT = RECEIPTS / "latest_execution.json"
GEO = {"cushing ok", "payne county ok"}
METRICS = {"driver_posting", "delivery_block", "facility_milestone"}


def day(value: object) -> date:
    text = str(value).strip().replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text).date()
    except ValueError:
        return date.fromisoformat(text[:10])


def geography(value: object) -> str:
    return " ".join(str(value).lower().replace(",", " ").replace(".", " ").split())


def rows(path: Path) -> list[dict]:
    if path.suffix.lower() == ".json":
        item = json.loads(path.read_text(encoding="utf-8"))
        return item.get("items", []) if isinstance(item, dict) else item
    if path.suffix.lower() == ".csv":
        with path.open(encoding="utf-8", newline="") as handle:
            return list(csv.DictReader(handle))
    raise ValueError("input must be CSV or JSON")


def valid(raw: list[dict]) -> tuple[list[dict], int]:
    kept, rejected = [], 0
    for item in raw:
        try:
            metric, place = str(item.get("metric", "")).lower().strip(), geography(item.get("geography", ""))
            source_id, source_url = str(item.get("source_id", "")).strip(), str(item.get("source_url", "")).strip()
            value = float(item.get("value", 1))
            if metric not in METRICS or place not in GEO or not source_id or not source_url or not math.isfinite(value) or value < 0:
                raise ValueError
            if metric in {"driver_posting", "facility_milestone"} and value != 1:
                raise ValueError
            kept.append({"date": day(item.get("available_at", "")), "metric": metric, "value": value, "source_id": source_id, "source_url": source_url, "geography": place})
        except (TypeError, ValueError):
            rejected += 1
    return kept, rejected


def score(items: list[dict]) -> tuple[list[dict], list[dict]]:
    drivers: dict[date, set[str]] = defaultdict(set)
    blocks: dict[date, dict[str, float]] = defaultdict(dict)
    milestones = []
    for item in items:
        if item["metric"] == "driver_posting":
            drivers[item["date"]].add(item["source_id"])
        elif item["metric"] == "delivery_block":
            blocks[item["date"]][item["source_id"]] = max(blocks[item["date"]].get(item["source_id"], 0), item["value"])
        else:
            milestones.append(item)
    observed = sorted(set(drivers) | set(blocks))
    if not observed:
        return [], milestones
    panel, cursor = [], observed[0]
    while cursor <= observed[-1]:
        d, b = (float(len(drivers[cursor])) if cursor in drivers else None), (sum(blocks[cursor].values()) if cursor in blocks else None)
        panel.append({"date": cursor, "drivers": d, "blocks": b, "raw": math.log1p(d) + math.log1p(b) if d is not None and b is not None else None, "score": None})
        cursor += timedelta(days=1)
    for i, item in enumerate(panel):
        window = panel[i - 29:i + 1]
        values = [x["raw"] for x in window]
        if len(values) == 30 and all(x is not None for x in values):
            mean = sum(values) / 30
            sd = math.sqrt(sum((x - mean) ** 2 for x in values) / 30)
            item["score"] = max(0, min(100, 50 + 10 * (0 if sd == 0 else (values[-1] - mean) / sd)))
    return panel, milestones


def write(path: Path, fields: list[str], records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader(); writer.writerows(records)


def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--input", type=Path); args = parser.parse_args()
    raw, items, rejected, error, digest = [], [], 0, None, None
    status = "park_no_reproducible_weekly_inputs"
    try:
        if args.input:
            raw = rows(args.input); digest = hashlib.sha256(args.input.read_bytes()).hexdigest(); items, rejected = valid(raw)
            status = "ok_forward_only" if items else "no_usable_authorized_rows"
    except Exception as exc:
        status, error = f"input_error:{type(exc).__name__}", str(exc)[:300]
    panel, milestones = score(items)
    weeks: dict[date, list[dict]] = defaultdict(list)
    for item in panel:
        if item["score"] is not None: weeks[item["date"] + timedelta(days=6-item["date"].weekday())].append(item)
    output = [{"date": key.isoformat(), "driver_posting_density": f"{sum(x['drivers'] for x in group)/len(group):.4f}", "delivery_block_count": f"{sum(x['blocks'] for x in group):.4f}", "fulfillment_velocity_score": f"{sum(x['score'] for x in group)/len(group):.4f}"} for key, group in sorted(weeks.items())]
    if items and not output and status == "ok_forward_only": status = "insufficient_30_day_daily_coverage"
    write(WEEKLY, ["date", "driver_posting_density", "delivery_block_count", "fulfillment_velocity_score"], output)
    write(MILESTONES, ["available_at", "source_id", "source_url", "geography", "value"], [{"available_at": x["date"].isoformat(), "source_id": x["source_id"], "source_url": x["source_url"], "geography": x["geography"], "value": x["value"]} for x in milestones])
    RECEIPTS.mkdir(parents=True, exist_ok=True)
    report = {"status": status, "collector": "calmf.py", "executed_at_utc": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"), "input_path": str(args.input) if args.input else None, "input_sha256": digest, "input_rows": len(raw), "accepted_rows": len(items), "rejected_rows": rejected, "daily_observation_days": len(panel), "milestone_events": len(milestones), "output_rows": len(output), "output_path": "data/calmf_weekly.csv", "error": error}
    RECEIPT.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("status", "input_rows", "accepted_rows", "output_rows")}, separators=(",", ":")))


if __name__ == "__main__":
    main()
