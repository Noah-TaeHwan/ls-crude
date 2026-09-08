"""FERC Pipeline Apportionment & Tariff Stress Index (FPATSI)."""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

PIPELINES = ("Plains Pipeline L.P.", "Enbridge Pipelines", "Enterprise Products")
KEYWORDS = ("apportionment", "proration", "capacity allocation", "force majeure")
PERCENT = re.compile(r"(?:apportion(?:ed|ment)|prorat(?:ed|ion)|allocation)[^%]{0,80}?(\d{1,3}(?:\.\d+)?)\s*%|(?:\b)(\d{1,3}(?:\.\d+)?)\s*%(?:[^.]{0,80}?)(?:apportion|prorat|allocation)", re.I | re.S)
DATE = re.compile(r"\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b")


def iso_date(value: str) -> str:
    m = DATE.search(value or "")
    return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}" if m else datetime.now(timezone.utc).date().isoformat()


def pipeline_for(text: str) -> str | None:
    lower = text.lower()
    return next((name for name in PIPELINES if name.lower() in lower), None)


def parse_text(text: str, date_hint: str = "") -> tuple[float, float] | None:
    lower = text.lower()
    hits = sum(word in lower for word in KEYWORDS)
    if not hits:
        return None
    values = [float(a or b) for a, b in PERCENT.findall(text)]
    apportionment = max(values) if values else 0.0
    # A documented force-majeure/capacity event has nonzero stress even when no
    # percentage is stated; a numeric apportionment dominates the event score.
    stress = min(100.0, max(apportionment, 15.0 * hits))
    return apportionment, stress


def records_from_json(path: Path) -> list[dict]:
    raw = path.read_text(encoding="utf-8")
    loaded = json.loads(raw) if path.suffix.lower() == ".json" else [json.loads(line) for line in raw.splitlines() if line.strip()]
    return loaded if isinstance(loaded, list) else loaded.get("items", [])


def records_from_feed(url: str) -> list[dict]:
    request = Request(url, headers={"User-Agent": "ls-crude-fpatsi/1.0"})
    with urlopen(request, timeout=30) as response:
        payload = response.read()
    root = ET.fromstring(payload)
    out = []
    for item in root.findall(".//item") + root.findall(".//{*}entry"):
        title = " ".join(item.itertext())
        published = next((node.text or "" for node in item.iter() if node.tag.rsplit("}", 1)[-1] in {"pubDate", "published", "updated", "date"}), "")
        out.append({"date": published, "text": title})
    return out


def normalize(records: list[dict]) -> list[dict]:
    rows = []
    for record in records:
        text = " ".join(str(record.get(key, "")) for key in ("text", "title", "description", "content", "filing_text"))
        pipeline = record.get("pipeline_name") or pipeline_for(text)
        parsed = parse_text(text, str(record.get("date", "")))
        if pipeline and parsed:
            apportionment, stress = parsed
            rows.append({"date": iso_date(str(record.get("date", ""))), "pipeline_name": pipeline, "apportionment_pct": apportionment, "event_stress": stress})
    return rows


def aggregate(rows: list[dict]) -> list[dict]:
    by_key: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in rows:
        by_key[(row["pipeline_name"], row["date"])].append(row)
    daily = []
    for (pipeline, day), values in by_key.items():
        daily.append({"date": day, "pipeline_name": pipeline, "apportionment_pct": max(v["apportionment_pct"] for v in values), "event_stress": max(v["event_stress"] for v in values)})
    out = []
    for pipeline in PIPELINES:
        series = sorted((r for r in daily if r["pipeline_name"] == pipeline), key=lambda r: r["date"])
        for i, row in enumerate(series):
            start = max(0, i - 29)
            window = series[start:i + 1]
            out.append({"date": row["date"], "pipeline_name": pipeline, "apportionment_pct": f"{row['apportionment_pct']:.2f}", "stress_score": f"{sum(v['event_stress'] for v in window) / len(window):.2f}"})
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, help="Local JSON or JSONL FERC/RSS sample.")
    parser.add_argument("--feed-url", default=os.getenv("FERC_ELIBRARY_RSS_URL"), help="Public FERC eLibrary RSS/filing feed URL.")
    parser.add_argument("--output", type=Path, default=Path("data/processed/fpatsi_daily.csv"))
    args = parser.parse_args()
    source, records, status = "none", [], "no_source"
    try:
        if args.input:
            source, records, status = "local", records_from_json(args.input), "ok"
        elif args.feed_url:
            source, records, status = "ferc_feed", records_from_feed(args.feed_url), "ok"
    except Exception as exc:
        status = f"fetch_error:{type(exc).__name__}"
    parsed = normalize(records)
    output = aggregate(parsed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=("date", "pipeline_name", "apportionment_pct", "stress_score"))
        writer.writeheader(); writer.writerows(output)
    print(json.dumps({"status": status, "source": source, "input_records": len(records), "matched_events": len(parsed), "output_rows": len(output)}, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
