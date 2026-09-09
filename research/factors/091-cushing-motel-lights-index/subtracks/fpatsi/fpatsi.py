"""Factor-local collector for the FERC Pipeline Apportionment & Tariff Stress Index.

The collector intentionally has no default network source.  FERC eLibrary makes
individual public filings searchable, but the source audit found no public,
complete operating-notice feed for the fixed Cushing-linked pipeline universe.
It therefore writes no observations until a reproducible local export or an
explicit public RSS/Atom endpoint is supplied.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET


PIPELINES: dict[str, tuple[str, ...]] = {
    "Plains Pipeline, L.P.": ("plains pipeline, l.p.", "plains pipeline l.p.", "plains pipeline"),
    "Enbridge Pipelines": ("enbridge pipelines", "enbridge pipeline"),
    "Enterprise Products": ("enterprise products", "enterprise products partners"),
}
KEYWORD_RE = re.compile(
    r"\b(apportion(?:ment|ed)?|prorat(?:ion|ed)?|capacity allocation|force majeure)\b",
    re.IGNORECASE,
)
PERCENT_RE = re.compile(
    r"(?:apportion(?:ment|ed)?|prorat(?:ion|ed)?|capacity allocation)"
    r"[^%]{0,100}?(\d{1,3}(?:\.\d+)?)\s*%"
    r"|(\d{1,3}(?:\.\d+)?)\s*%[^.]{0,100}?"
    r"(?:apportion(?:ment|ed)?|prorat(?:ion|ed)?|capacity allocation)",
    re.IGNORECASE | re.DOTALL,
)
DATE_RE = re.compile(r"\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b")
OUTPUT_FIELDS = ("date", "pipeline_name", "apportionment_pct", "stress_score")


def parse_date(value: object) -> date | None:
    """Return an explicit source date; never substitute the collection date."""
    text = str(value or "")
    match = DATE_RE.search(text)
    if match:
        return date(int(match.group(1)), int(match.group(2)), int(match.group(3)))
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"):
        try:
            return datetime.strptime(text.strip(), fmt).date()
        except ValueError:
            pass
    return None


def canonical_pipeline(record: dict[str, object], text: str) -> str | None:
    candidate = f"{record.get('pipeline_name', '')} {text}".lower()
    for canonical, aliases in PIPELINES.items():
        if any(alias in candidate for alias in aliases):
            return canonical
    return None


def source_text(record: dict[str, object]) -> str:
    return " ".join(
        str(record.get(field, ""))
        for field in ("title", "description", "content", "filing_text", "text")
    ).strip()


def extract_event(record: dict[str, object]) -> dict[str, object] | None:
    """Extract only named-operator, dated stress notices from supplied records."""
    text = source_text(record)
    pipeline = canonical_pipeline(record, text)
    observed_on = parse_date(record.get("date"))
    keywords = KEYWORD_RE.findall(text)
    if not pipeline or not observed_on or not keywords:
        return None

    percentages = [float(left or right) for left, right in PERCENT_RE.findall(text)]
    apportionment_pct: float | None = max(percentages) if percentages else None
    # A notice with no quoted percentage is retained as a low-severity event,
    # rather than fabricated as "0% apportionment".  The number is an event
    # flag, not a measure of unavailable capacity.
    event_score = min(100.0, apportionment_pct if apportionment_pct is not None else 15.0 * len(keywords))
    return {
        "date": observed_on,
        "pipeline_name": pipeline,
        "apportionment_pct": apportionment_pct,
        "event_score": event_score,
    }


def load_local(path: Path) -> list[dict[str, object]]:
    raw = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".jsonl":
        records = [json.loads(line) for line in raw.splitlines() if line.strip()]
    else:
        parsed = json.loads(raw)
        records = parsed.get("items", []) if isinstance(parsed, dict) else parsed
    if not isinstance(records, list) or not all(isinstance(item, dict) for item in records):
        raise ValueError("input must be a JSON/JSONL list of record objects")
    return records


def load_feed(url: str) -> list[dict[str, object]]:
    request = Request(url, headers={"User-Agent": "ls-crude-cfam-fpatsi/1.0"})
    with urlopen(request, timeout=30) as response:
        payload = response.read()
    root = ET.fromstring(payload)
    records: list[dict[str, object]] = []
    for item in root.findall(".//item") + root.findall(".//{*}entry"):
        values = {node.tag.rsplit("}", 1)[-1]: (node.text or "") for node in item.iter()}
        records.append(
            {
                "date": values.get("pubDate") or values.get("published") or values.get("updated"),
                "title": values.get("title", ""),
                "description": values.get("description") or values.get("summary", ""),
                "content": values.get("content", ""),
            }
        )
    return records


def aggregate(events: list[dict[str, object]]) -> list[dict[str, str]]:
    """Aggregate same-day notices and compute a 30-calendar-day rolling maximum.

    Only dates represented by actual notices are emitted.  Missing source
    coverage is not converted to a zero-stress daily observation.
    """
    grouped: dict[tuple[date, str], list[dict[str, object]]] = defaultdict(list)
    for event in events:
        grouped[(event["date"], str(event["pipeline_name"]))].append(event)
    daily: list[dict[str, object]] = []
    for (observed_on, pipeline), same_day in grouped.items():
        values = [value["apportionment_pct"] for value in same_day if value["apportionment_pct"] is not None]
        daily.append(
            {
                "date": observed_on,
                "pipeline_name": pipeline,
                "apportionment_pct": max(values) if values else None,
                "event_score": max(float(value["event_score"]) for value in same_day),
            }
        )

    output: list[dict[str, str]] = []
    for pipeline in PIPELINES:
        series = sorted((row for row in daily if row["pipeline_name"] == pipeline), key=lambda row: row["date"])
        for row in series:
            cutoff = row["date"] - timedelta(days=29)
            active = [float(candidate["event_score"]) for candidate in series if cutoff <= candidate["date"] <= row["date"]]
            percentage = row["apportionment_pct"]
            output.append(
                {
                    "date": row["date"].isoformat(),
                    "pipeline_name": pipeline,
                    "apportionment_pct": "" if percentage is None else f"{float(percentage):.2f}",
                    "stress_score": f"{max(active):.2f}",
                }
            )
    return output


def write_csv(rows: list[dict[str, str]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="Dated, local JSON or JSONL public-notice export.")
    parser.add_argument("--feed-url", help="Explicit, public RSS/Atom feed URL; no default is assumed.")
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("data") / "fpatsi_daily.csv")
    args = parser.parse_args()

    status, source, records = "no_source", "none", []
    try:
        if args.input:
            records, source, status = load_local(args.input), "local", "ok"
        elif args.feed_url:
            records, source, status = load_feed(args.feed_url), "public_feed", "ok"
    except Exception as exc:  # Receipt records class only; no partial data are emitted.
        status = f"fetch_error:{type(exc).__name__}"

    events = [event for record in records if (event := extract_event(record))]
    rows = aggregate(events)
    write_csv(rows, args.output)
    print(
        json.dumps(
            {
                "status": status,
                "source": source,
                "input_records": len(records),
                "matched_events": len(events),
                "output_rows": len(rows),
            },
            separators=(",", ":"),
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
