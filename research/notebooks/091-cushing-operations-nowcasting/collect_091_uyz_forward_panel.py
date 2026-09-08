"""Collect the reproducible, public part of CFAM's 091-U/Y/Z forward panel.

This deliberately does *not* scrape job platforms. 091-U remains a scheduled
manual public-listing review under its frozen protocol. 091-Y and 091-Z can be
collected from first-party/public feed endpoints, with every raw response kept
in a new, timestamped local receipt directory.

The script is intentionally useful with one observation: it records a baseline
without manufacturing a time series or a composite "Cushing busy" score.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[3]
PANEL = ROOT / "research" / "indexes" / "091-cushing-operations-nowcasting" / "forward-panel"
RAW_ROOT = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-91"
MAVERIK_URL = "https://locations.maverik.com/ok/cushing/2001-e-main-st#fuel"
KUSH_RSS_URL = "https://www.1600kush.com/category/news/feed/"
KUSH_API_URL = "https://www.1600kush.com/wp-json/wp/v2/posts?per_page=20"
GOOGLE_QUERY = '"Cushing" (pipeline OR terminal OR crude OR storage OR refinery OR midstream OR oilfield) when:30d'
GOOGLE_RSS_URL = "https://news.google.com/rss/search?q=" + quote(GOOGLE_QUERY) + "&hl=en-US&gl=US&ceid=US:en"
LEXICON = {
    "physical": ("pipeline", "terminal", "tank farm", "refinery", "midstream", "oilfield"),
    "operations": ("turnaround", "maintenance", "outage", "shutdown", "spill", "leak", "rupture", "fire"),
    "logistics": ("truck", "rail", "railcar", "diesel", "fuel", "shipment"),
    "project_labor": ("construction", "permit", "hiring", "welder", "pipefitter", "operator"),
}
FIELDS = [
    "observed_at_utc", "run_id", "track", "status", "measurement", "value", "unit",
    "source_name", "source_url", "freshness", "note",
]


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(value or ""))).strip()


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def fetch(url: str, destination: Path) -> dict[str, Any]:
    request = Request(url, headers={"User-Agent": "ls-crude-research/1.0 (+cfam-091-forward-panel)"})
    with urlopen(request, timeout=60) as response:
        body = response.read()
        status = response.status
        content_type = response.headers.get("content-type", "")
    destination.write_bytes(body)
    return {
        "file": destination.name,
        "url": url,
        "http_status": status,
        "content_type": content_type,
        "bytes": len(body),
        "sha256": sha256(body),
    }


def decimal(value: str) -> float | None:
    try:
        return round(float(value.replace(",", "")), 3)
    except ValueError:
        return None


def parse_maverik(document: str) -> dict[str, float]:
    """Extract only clearly labelled displayed prices; never infer a price."""
    found: dict[str, float] = {}
    text = html.unescape(document)
    patterns = {
        "regular": (
            r'(?is)regular.{0,260}?(?:\$|&dollar;)?\s*(\d{1,2}\.\d{2,3})',
            r'(?is)(\d{1,2}\.\d{2,3}).{0,260}?regular',
        ),
        "diesel": (
            r'(?is)diesel.{0,260}?(?:\$|&dollar;)?\s*(\d{1,2}\.\d{2,3})',
            r'(?is)(\d{1,2}\.\d{2,3}).{0,260}?diesel',
        ),
    }
    for product, candidates in patterns.items():
        values: list[float] = []
        for pattern in candidates:
            for match in re.finditer(pattern, text):
                price = decimal(match.group(1))
                if price is not None and 1.0 <= price <= 12.0:
                    values.append(price)
        if values:
            # A public page may repeat the same price in structured and visible
            # markup. Conflicting values are intentionally reported as missing.
            unique = sorted(set(values))
            if len(unique) == 1:
                found[product] = unique[0]
    return found


def feed_items(payload: bytes) -> list[dict[str, str]]:
    root = ET.fromstring(payload)
    rows: list[dict[str, str]] = []
    for item in root.findall(".//item"):
        rows.append({
            "title": clean(item.findtext("title", "")),
            "excerpt": clean(item.findtext("description", "")),
            "url": clean(item.findtext("link", "")),
        })
    return rows


def wp_items(payload: bytes) -> list[dict[str, str]]:
    items = json.loads(payload.decode("utf-8"))
    return [{
        "title": clean(item.get("title", {}).get("rendered", "")),
        "excerpt": clean(item.get("excerpt", {}).get("rendered", "")),
        "url": str(item.get("link", "")),
    } for item in items]


def cue_lanes(item: dict[str, str]) -> list[str]:
    haystack = f"{item['title']} {item['excerpt']}".lower()
    if not re.search(r"\bcushing\b", haystack):
        return []
    if re.search(r"\b(fund|nyse|shares|director|distribution|stock)\b", haystack):
        return []
    return [
        lane for lane, terms in LEXICON.items()
        if any(re.search(rf"\b{re.escape(term)}\b", haystack) for term in terms)
    ]


def append_observations(rows: list[dict[str, str]]) -> None:
    PANEL.mkdir(parents=True, exist_ok=True)
    target = PANEL / "observations.csv"
    exists = target.exists()
    with target.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerows(rows)


def render_panel() -> None:
    target = PANEL / "observations.csv"
    output = PANEL / "figures" / "091-uyz-forward-panel.svg"
    output.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        return
    rows = list(csv.DictReader(target.open(encoding="utf-8")))
    y_rows = [r for r in rows if r["track"] == "091-Y" and r["status"] in {"observed", "baseline_observed"}]
    z_rows = [r for r in rows if r["track"] == "091-Z" and r["measurement"] == "industry_cue_count" and r["status"] in {"observed", "baseline_observed"}]
    u_rows = [r for r in rows if r["track"] == "091-U"]
    colors = {"regular_price_usd_per_gallon": "#2563eb", "diesel_price_usd_per_gallon": "#dc2626"}
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="940" height="510" viewBox="0 0 940 510">',
        '<rect width="100%" height="100%" fill="#f8fafc"/>',
        '<text x="28" y="34" font-family="Arial" font-size="21" font-weight="700" fill="#172033">CFAM 091-U / 091-Y / 091-Z — forward observation panel</text>',
        '<text x="28" y="56" font-family="Arial" font-size="12" fill="#556070">Separate observations only. No composite score; missing collection is never zero.</text>',
        '<line x1="55" y1="280" x2="885" y2="280" stroke="#cbd5e1"/>',
        '<line x1="55" y1="100" x2="55" y2="280" stroke="#94a3b8"/>',
        '<text x="55" y="89" font-family="Arial" font-size="13" font-weight="700" fill="#172033">091-Y — displayed local pump prices ($/gal)</text>',
    ]
    y_values = [float(r["value"]) for r in y_rows if r["value"]]
    if y_values:
        low, high = min(y_values), max(y_values)
        if high == low:
            low -= 0.5
            high += 0.5
        for product in ("regular_price_usd_per_gallon", "diesel_price_usd_per_gallon"):
            product_rows = [r for r in y_rows if r["measurement"] == product]
            for index, row in enumerate(product_rows):
                x = 95 + index * (740 / max(1, len(product_rows) - 1))
                y = 260 - (float(row["value"]) - low) / (high - low) * 140
                parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{colors[product]}"/>')
                parts.append(f'<text x="{x+8:.1f}" y="{y+4:.1f}" font-family="Arial" font-size="11" fill="#172033">{row["value"]}</text>')
        parts.extend([
            '<rect x="650" y="83" width="11" height="11" fill="#2563eb"/>',
            '<text x="668" y="93" font-family="Arial" font-size="11" fill="#334155">Regular</text>',
            '<rect x="742" y="83" width="11" height="11" fill="#dc2626"/>',
            '<text x="760" y="93" font-family="Arial" font-size="11" fill="#334155">Diesel</text>',
        ])
    else:
        parts.append('<text x="70" y="185" font-family="Arial" font-size="13" fill="#64748b">No verified price observation yet.</text>')
    parts.extend([
        '<line x1="55" y1="470" x2="885" y2="470" stroke="#cbd5e1"/>',
        '<line x1="55" y1="325" x2="55" y2="470" stroke="#94a3b8"/>',
        '<text x="55" y="314" font-family="Arial" font-size="13" font-weight="700" fill="#172033">091-Z — public industrial-news cues; 091-U — manual review status</text>',
    ])
    if z_rows:
        maximum = max(1, max(int(float(r["value"])) for r in z_rows if r["value"]))
        for index, row in enumerate(z_rows):
            x = 110 + index * (660 / max(1, len(z_rows) - 1))
            height = int(float(row["value"])) / maximum * 95
            parts.append(f'<rect x="{x:.1f}" y="{455-height:.1f}" width="30" height="{height:.1f}" fill="#7c3aed"/>')
            parts.append(f'<text x="{x+8:.1f}" y="{445-height:.1f}" font-family="Arial" font-size="11" fill="#172033">{row["value"]}</text>')
    else:
        parts.append('<text x="70" y="400" font-family="Arial" font-size="13" fill="#64748b">No verified news-cue observation yet.</text>')
    u_note = "not due"
    if u_rows:
        u_note = u_rows[-1]["note"][:105]
    parts.append(f'<text x="520" y="430" font-family="Arial" font-size="11" fill="#475569">091-U: {html.escape(u_note)}</text>')
    parts.append('</svg>')
    output.write_text("\n".join(parts) + "\n", encoding="utf-8")


def write_panel_readme() -> None:
    (PANEL / "README.md").write_text(
        """# CFAM 091-U / 091-Y / 091-Z — forward observation panel

**Status:** COLLECTION STARTED — not a backtest, not a composite and not an
activity verdict.  This is the durable record that converts the first one-off
samples into time-stamped observations.

![Forward observation panel](figures/091-uyz-forward-panel.svg)

## Collection contract

| Track | What is recorded | Cadence | Rule |
| --- | --- | --- | --- |
| 091-U | frozen-rule count of eligible public industrial roles | Thursday 01:00 KST fixed weekly slot | manual review only; record the U.S. Central equivalent; no job-platform automation; missing is never zero |
| 091-Y | visibly labelled Regular and Diesel price at Maverik #5097 | Thursday 01:00 KST fixed weekly public-page check | ambiguous/unlabelled page output is `source_unavailable`, never inferred |
| 091-Z | deduplicated, Cushing-anchored public industry-news cue count | daily 01:00 KST fixed-time public-feed check | raw feeds and headline decisions are retained per run; count is an event queue, not busyness |

The panel begins with an **unscheduled baseline**. It is visualised so the
reference is not lost, but is excluded from the fixed-cadence count. A time
pattern starts only after multiple scheduled rows exist. After seven valid
091-Z dates and twelve scheduled 091-U/091-Y snapshots, inspect the separate
trend panels. Only then consider independent operational validation. No score
is summed across the tracks.

## Baseline actually captured

The first run is a reference, not an evidence claim: **091-U = 4** distinct
high-confidence public industrial listings in the earlier manual audit;
**091-Y = $3.790 Regular / $5.490 Diesel** per gallon at Maverik #5097; and
**091-Z = 1** deduplicated frozen-lexicon cue lane. The values are retained so
future scheduled observations have an auditable starting point.

## Files

- [`observations.csv`](observations.csv): append-only observation ledger.
- [`figures/091-uyz-forward-panel.svg`](figures/091-uyz-forward-panel.svg): separate-track board.
- Raw response receipts: `research/gathering/raw/ALT-20260908-91/<UTC run>/README.md`.
- [091-U frozen protocol](../20260908T091UZ/091u-industrial-job-pulse-protocol.md).
- [091-Y board](../20260908T091YZ/README.md) and [091-Z monitor](../20260908T091ZNEWSZ/README.md).
""",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stamp", help="UTC run id, e.g. 20260908T120000Z")
    parser.add_argument(
        "--tracks",
        default="y,z",
        help="Comma-separated subset of u,y,z. U only writes its manual-review gate.",
    )
    parser.add_argument(
        "--baseline",
        action="store_true",
        help="Label retrieved values as an unscheduled reference, not a pilot observation.",
    )
    parser.add_argument(
        "--render-only",
        action="store_true",
        help="Regenerate the committed panel README and SVG without fetching sources.",
    )
    args = parser.parse_args()
    tracks = {value.strip().lower() for value in args.tracks.split(",") if value.strip()}
    unknown = tracks.difference({"u", "y", "z"})
    if unknown:
        parser.error(f"unknown track(s): {', '.join(sorted(unknown))}")
    if args.render_only:
        write_panel_readme()
        render_panel()
        print(json.dumps({"status": "rendered", "panel": str(PANEL)}, sort_keys=True))
        return
    now = datetime.now(timezone.utc)
    stamp = args.stamp or now.strftime("%Y%m%dT%H%M%SZ")
    observed_at = now.isoformat().replace("+00:00", "Z")
    raw = RAW_ROOT / stamp
    raw.mkdir(parents=True, exist_ok=False)
    receipts: list[dict[str, Any]] = []
    observations: list[dict[str, str]] = []

    def row(track: str, status: str, measurement: str, value: str, unit: str, source_name: str, source_url: str, freshness: str, note: str) -> None:
        observations.append({
            "observed_at_utc": observed_at, "run_id": stamp, "track": track, "status": status,
            "measurement": measurement, "value": value, "unit": unit, "source_name": source_name,
            "source_url": source_url, "freshness": freshness, "note": note,
        })

    if "u" in tracks:
        # U is intentionally not scraped. This row keeps the collection schedule
        # visible without pretending the one-time four-listing audit is a new count.
        row("091-U", "manual_review_due", "eligible_industrial_job_count", "", "roles", "Public listing review", "", "weekly fixed slot", "Use frozen Thursday 01:00 KST manual review; record the U.S. Central equivalent; do not automate job platforms.")

    observation_status = "baseline_observed" if args.baseline else "observed"
    if "y" in tracks:
        try:
            receipt = fetch(MAVERIK_URL, raw / "maverik_cushing_5097.html")
            receipts.append(receipt)
            prices = parse_maverik((raw / "maverik_cushing_5097.html").read_text(encoding="utf-8", errors="replace"))
            for product, label in (("regular", "regular_price_usd_per_gallon"), ("diesel", "diesel_price_usd_per_gallon")):
                if product in prices:
                    row("091-Y", observation_status, label, f"{prices[product]:.3f}", "USD/gallon", "Maverik #5097 official station page", MAVERIK_URL, "page timestamp not visible", "Credit/cash tier must be confirmed from page text before comparison.")
                else:
                    row("091-Y", "source_unavailable", label, "", "USD/gallon", "Maverik #5097 official station page", MAVERIK_URL, "", "No unique, clearly labelled displayed price parsed; not recorded as zero.")
        except Exception as error:  # source outages must remain visible
            row("091-Y", "source_unavailable", "pump_price_page", "", "", "Maverik #5097 official station page", MAVERIK_URL, "", f"Fetch error: {type(error).__name__}.")

    if "z" in tracks:
        all_items: list[dict[str, str]] = []
        z_receipts: list[dict[str, Any]] = []
        for name, url, parser_fn in (
            ("kush_news_feed.xml", KUSH_RSS_URL, feed_items),
            ("kush_wp_posts.json", KUSH_API_URL, wp_items),
            ("google_news_cushing_industry.xml", GOOGLE_RSS_URL, feed_items),
        ):
            try:
                receipt = fetch(url, raw / name)
                receipts.append(receipt)
                z_receipts.append(receipt)
                all_items.extend(parser_fn((raw / name).read_bytes()))
            except Exception as error:
                receipt = {"file": name, "url": url, "error": type(error).__name__}
                receipts.append(receipt)
                z_receipts.append(receipt)
        if any("http_status" in receipt for receipt in z_receipts):
            deduped: dict[str, dict[str, str]] = {}
            for item in all_items:
                key = item["url"] or item["title"].lower()
                if key:
                    deduped.setdefault(key, item)
            counts: Counter[str] = Counter()
            for item in deduped.values():
                counts.update(cue_lanes(item))
            total = sum(counts.values())
            row("091-Z", observation_status, "industry_cue_count", str(total), "deduplicated matched lanes", "KUSH RSS/API + Google News RSS", "https://www.1600kush.com/category/news/", "current feeds", "A story may have more than one lane; no claim of confirmed local activity.")
            for lane in LEXICON:
                row("091-Z", observation_status, f"{lane}_cue_count", str(counts[lane]), "deduplicated matched lanes", "KUSH RSS/API + Google News RSS", "https://www.1600kush.com/category/news/", "current feeds", "Frozen Cushing-anchor lexicon.")
        else:
            row("091-Z", "source_unavailable", "industry_cue_count", "", "", "KUSH RSS/API + Google News RSS", "https://www.1600kush.com/category/news/", "", "No feed was retrieved; not recorded as zero.")

    (raw / "sources_manifest.json").write_text(json.dumps(receipts, indent=2) + "\n", encoding="utf-8")
    lines = [
        f"# ALT-20260908-91 — CFAM U/Y/Z forward-panel receipt ({stamp})",
        "",
        f"- **Collected at:** {observed_at}",
        "- **Scope:** first-party Maverik display plus public KUSH/Google RSS feeds. 091-U is explicitly a manual-only review.",
        "- **Raw response policy:** local raw responses are gitignored; this receipt and the panel ledger are versioned.",
        "- **Manifest:** `sources_manifest.json` records URL, HTTP status, bytes and SHA-256 when fetch succeeded.",
        "- **Reproduction:** `python research/notebooks/091-cushing-operations-nowcasting/collect_091_uyz_forward_panel.py`.",
        "",
        "No individual, applicant, customer, payment, location-history, or device data was collected.",
    ]
    (raw / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    append_observations(observations)
    write_panel_readme()
    render_panel()
    counts = Counter(f"{r['track']}:{r['status']}" for r in observations)
    print(json.dumps({"status": "ok", "run_id": stamp, "rows_written": len(observations), "row_counts": dict(sorted(counts.items()))}, sort_keys=True))


if __name__ == "__main__":
    main()
