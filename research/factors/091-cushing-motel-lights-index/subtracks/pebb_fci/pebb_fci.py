"""Factor-local PEBB-FCI collector; no default network source or synthetic data."""
from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "data" / "pebb_fci_daily.csv"
RECEIPT = ROOT / "receipts" / "latest_execution.json"
FIELDS = ("date", "pipeline_operator", "nominal_capacity_kbpd", "operational_capacity_kbpd", "constraint_flag", "flow_constraint_score")
OPERATORS = {
    "Plains Pipeline, L.P.": ("plains pipeline",),
    "Enbridge Pipelines": ("enbridge pipeline", "enbridge liquids"),
    "Enterprise Products": ("enterprise products", "enterprise pipeline"),
}
FLAG_RE = re.compile(r"\b(apportionment|proration|capacity allocation|force majeure|operational constraint|operational restriction|service outage|capacity reduction)\b", re.I)
DATE_RE = re.compile(r"\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b")


def as_date(value: object) -> date | None:
    match = DATE_RE.search(str(value or ""))
    if match:
        return date(*map(int, match.groups()))
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"):
        try:
            return datetime.strptime(str(value).strip(), fmt).date()
        except ValueError:
            pass
    return None


def text_of(record: dict[str, object]) -> str:
    return " ".join(str(record.get(key, "")) for key in ("title", "description", "content", "text", "notice_text", "route")).strip()


def operator_of(record: dict[str, object], text: str) -> str | None:
    candidate = f"{record.get('pipeline_operator', '')} {record.get('operator', '')} {text}".lower()
    return next((name for name, aliases in OPERATORS.items() if any(alias in candidate for alias in aliases)), None)


def capacity(record: dict[str, object], kind: str) -> float | None:
    for unit, multiplier in (("kbpd", 1.0), ("bpd", 0.001), ("mbpd", 1000.0)):
        value = record.get(f"{kind}_capacity_{unit}")
        if value not in (None, ""):
            try:
                return float(value) * multiplier
            except (TypeError, ValueError):
                return None
    return None


def extract(record: dict[str, object]) -> dict[str, object] | None:
    text = text_of(record)
    observed = as_date(record.get("date") or record.get("published") or record.get("effective_date"))
    operator = operator_of(record, text)
    cushing = bool(record.get("cushing_linked")) or "cushing" in text.lower()
    if not (observed and operator and cushing):
        return None
    nominal, operational = capacity(record, "nominal"), capacity(record, "operational")
    scheduled = capacity(record, "scheduled")
    flag = bool(FLAG_RE.search(text)) or bool(record.get("constraint_flag"))
    reduction = max(0.0, 1 - operational / nominal) * 100 if nominal and operational is not None else 0.0
    utilization = scheduled / operational if scheduled is not None and operational else None
    pressure = max(0.0, min(100.0, (utilization - 0.90) / 0.10 * 100)) if utilization is not None else 0.0
    score = max(reduction, pressure) if (flag or reduction or pressure) else 0.0
    return {"date": observed.isoformat(), "pipeline_operator": operator, "nominal_capacity_kbpd": nominal, "operational_capacity_kbpd": operational, "constraint_flag": str(flag).lower(), "flow_constraint_score": round(score, 3)}


def load_local(path: Path) -> list[dict[str, object]]:
    raw = path.read_text(encoding="utf-8")
    parsed = [json.loads(line) for line in raw.splitlines() if line.strip()] if path.suffix.lower() == ".jsonl" else json.loads(raw)
    return parsed if isinstance(parsed, list) else [parsed]


def load_rss(url: str) -> list[dict[str, object]]:
    request = Request(url, headers={"User-Agent": "ls-crude-research/1.0"})
    with urlopen(request, timeout=20) as response:
        root = ET.fromstring(response.read())
    records = []
    for item in root.findall(".//item") + root.findall(".//{http://www.w3.org/2005/Atom}entry"):
        values = {child.tag.rsplit("}", 1)[-1]: child.text or "" for child in item}
        records.append({"title": values.get("title", ""), "description": values.get("description", values.get("summary", "")), "published": values.get("pubDate", values.get("published", ""))})
    return records


def write(rows: list[dict[str, object]]) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--input", type=Path)
    source.add_argument("--rss-url")
    args = parser.parse_args()
    raw = load_local(args.input) if args.input else load_rss(args.rss_url) if args.rss_url else []
    events = [event for record in raw if isinstance(record, dict) and (event := extract(record))]
    grouped: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for event in events:
        grouped[(str(event["date"]), str(event["pipeline_operator"]))].append(event)
    rows = []
    for _, group in sorted(grouped.items()):
        best = max(group, key=lambda row: float(row["flow_constraint_score"]))
        rows.append(best)
    write(rows)
    status = "ok" if rows else "park_no_public_oil_ebb_feed"
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(json.dumps({"status": status, "input_records": len(raw), "accepted_records": len(events), "output_rows": len(rows)}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": status, "input_records": len(raw), "output_rows": len(rows)}))


if __name__ == "__main__":
    main()
