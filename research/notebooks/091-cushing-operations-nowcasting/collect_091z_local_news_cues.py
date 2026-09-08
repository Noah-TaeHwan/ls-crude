"""Collect public Cushing news headlines for CFAM 091-Z.

This is a forward-only event-cue monitor. It counts only frozen, industry-
relevant phrases in public headlines/excerpts; it does not infer people,
transactions, confidential operations, or a continuous "busy" score.
"""

from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[3]
STAMP = "20260908T190000Z"
RAW = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-26" / STAMP
OUT = ROOT / "research" / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091ZNEWSZ"
FIG = OUT / "figures"

GOOGLE_QUERY = '"Cushing" (pipeline OR terminal OR crude OR storage OR refinery OR midstream OR oilfield) when:30d'
SOURCES = {
    "kush_news_feed.xml": "https://www.1600kush.com/category/news/feed/",
    "kush_wp_posts.json": "https://www.1600kush.com/wp-json/wp/v2/posts?per_page=20",
    "google_news_cushing_industry.xml": "https://news.google.com/rss/search?q=" + quote(GOOGLE_QUERY) + "&hl=en-US&gl=US&ceid=US:en",
}

# Frozen for the pilot. Terms are classified into an event lane, not a bullish/bearish score.
LEXICON = {
    "physical": ("pipeline", "terminal", "tank farm", "refinery", "midstream", "oilfield"),
    "operations": ("turnaround", "maintenance", "outage", "shutdown", "spill", "leak", "rupture", "fire"),
    "logistics": ("truck", "rail", "railcar", "diesel", "fuel", "shipment"),
    "project_labor": ("construction", "permit", "hiring", "welder", "pipefitter", "operator"),
    "market_context": ("storage", "crude", "barrel", "inventory"),
}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(value or ""))).strip()


def fetch(name: str, url: str) -> dict[str, object]:
    request = Request(url, headers={"User-Agent": "ls-crude-research/1.0 (+091z-public-news-cue)"})
    with urlopen(request, timeout=60) as response:
        body = response.read()
        status = response.status
    path = RAW / name
    path.write_bytes(body)
    return {"file": name, "url": url, "http_status": status, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}


def feed_items(path: Path, source: str) -> list[dict[str, str]]:
    root = ET.fromstring(path.read_bytes())
    rows: list[dict[str, str]] = []
    for item in root.findall(".//item"):
        title, link = clean(item.findtext("title", "")), clean(item.findtext("link", ""))
        description, published = clean(item.findtext("description", "")), clean(item.findtext("pubDate", ""))
        try:
            observed = parsedate_to_datetime(published).astimezone(timezone.utc).isoformat()
        except (TypeError, ValueError):
            observed = published
        rows.append({"source": source, "published_at": observed, "title": title, "excerpt": description, "url": link})
    return rows


def wp_items(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for item in json.loads(path.read_text(encoding="utf-8")):
        rows.append({
            "source": "KUSH WordPress API",
            "published_at": item.get("date_gmt", ""),
            "title": clean(item.get("title", {}).get("rendered", "")),
            "excerpt": clean(item.get("excerpt", {}).get("rendered", "")),
            "url": item.get("link", ""),
        })
    return rows


def tag(row: dict[str, str]) -> dict[str, str]:
    haystack = f"{row['title']} {row['excerpt']}".lower()
    # The Google query is deliberately broad enough to discover stories, so an
    # article must independently contain the place name before it can be a cue.
    # This rejects generic crude stories and medical "Cushing's syndrome" noise.
    is_cushing_context = bool(re.search(r"\bcushing\b", haystack))
    lanes = [lane for lane, terms in LEXICON.items() if any(re.search(rf"\b{re.escape(term)}\b", haystack) for term in terms)]
    matches = [term for terms in LEXICON.values() for term in terms if re.search(rf"\b{re.escape(term)}\b", haystack)]
    financial_noise = bool(re.search(r"\b(fund|nyse|shares|director|distribution|stock)\b", haystack))
    cue_lanes = [lane for lane in lanes if lane != "market_context"]
    return {**row, "lanes": ";".join(lanes), "matched_terms": ";".join(matches), "is_cushing_context": str(is_cushing_context).lower(), "is_industry_cue": str(is_cushing_context and bool(cue_lanes) and not financial_noise).lower()}


def svg(lanes: Counter[str], cues: list[dict[str, str]], path: Path) -> None:
    colors = {"physical": "#1f77b4", "operations": "#d95f02", "logistics": "#2ca25f", "project_labor": "#756bb1"}
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="760" height="350" viewBox="0 0 760 350">',
        '<rect width="100%" height="100%" fill="#f8fafc"/>',
        '<text x="28" y="32" font-family="Arial" font-size="19" font-weight="700" fill="#172033">091-Z — public Cushing news cue snapshot</text>',
        '<text x="28" y="53" font-family="Arial" font-size="11" fill="#556070">Frozen industry lexicon; a cue board, not a continuous local-activity score or trading signal.</text>',
    ]
    for index, lane in enumerate(lane for lane in LEXICON if lane != "market_context"):
        count = lanes[lane]
        x = 55 + index * 165
        height = min(150, count * 28)
        parts.append(f'<rect x="{x}" y="240" width="72" height="{-height}" rx="4" fill="{colors[lane]}"/>')
        parts.append(f'<text x="{x+25}" y="260" font-family="Arial" font-size="11" fill="#172033">{lane}</text>')
        parts.append(f'<text x="{x+31}" y="{232-height}" font-family="Arial" font-size="15" font-weight="700" fill="#172033">{count}</text>')
    parts.append('<text x="28" y="290" font-family="Arial" font-size="11" font-weight="700" fill="#172033">Current matched headlines (deduplicated):</text>')
    for index, item in enumerate(cues[:3]):
        title = html.escape(item["title"][:88])
        terms = html.escape(item["matched_terms"])
        parts.append(f'<text x="28" y="{312 + index*15}" font-family="Arial" font-size="10" fill="#374151">• {title} [{terms}]</text>')
    parts.append('</svg>')
    path.write_text("\n".join(parts), encoding="utf-8")


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    FIG.mkdir(parents=True, exist_ok=True)
    manifest = [fetch(name, url) for name, url in SOURCES.items()]
    (RAW / "sources_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    candidates = feed_items(RAW / "kush_news_feed.xml", "KUSH News RSS")
    candidates += wp_items(RAW / "kush_wp_posts.json")
    candidates += feed_items(RAW / "google_news_cushing_industry.xml", "Google News RSS")
    seen: set[str] = set()
    rows: list[dict[str, str]] = []
    for item in candidates:
        key = item["url"] or item["title"].lower()
        if key and key not in seen:
            seen.add(key)
            rows.append(tag(item))
    rows.sort(key=lambda item: item["published_at"], reverse=True)
    cues = [row for row in rows if row["is_industry_cue"] == "true"]
    with (OUT / "headline_audit.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    lane_count: Counter[str] = Counter(lane for row in cues for lane in row["lanes"].split(";") if lane)
    svg(lane_count, cues, FIG / "091z-public-news-cue-snapshot.svg")
    summary = f"""# 091-Z — Cushing Public News Cue Monitor\n\n**Status:** FORWARD ONLY / E1  \n**Purpose:** catch publicly reported Cushing industrial events quickly and\ntransparently. It is an event queue, not an inferred local-busyness score.\n\n## Free, live sources proved accessible\n\n| source | collection route | current use |\n| --- | --- | --- |\n| [1600 KUSH News](https://www.1600kush.com/category/news/) | WordPress News RSS plus public `wp-json` posts endpoint | local context; headlines/excerpts only |\n| [Google News RSS](https://news.google.com/) | frozen Cushing industrial query | broader pickup; retain the retrieved feed each run |\n\nThe collection obtained **{len(rows)}** deduplicated current items, of which\n**{len(cues)}** matched at least one frozen industry term. Current lane counts:\nphysical `{lane_count['physical']}`, operations `{lane_count['operations']}`,\nlogistics `{lane_count['logistics']}`, project/labor `{lane_count['project_labor']}`.\n\n![Current public-news cue snapshot](figures/091z-public-news-cue-snapshot.svg)\n\n## Frozen interpretation rules\n\n- **Physical:** terminal, pipeline, storage, crude, refinery, midstream, oilfield.\n- **Operations:** turnaround, maintenance, outage, shutdown, spill, leak, rupture, fire.\n- **Logistics:** truck, rail, diesel, fuel, shipment.\n- **Project/labor:** construction, permit, hiring, welder, pipefitter, operator.\n\nA term match means only that the article is eligible for human review. It does\nnot prove a terminal event, the size of any effect, or that Cushing is busier.\nSeparate calendar/incident articles remain visible in the raw audit but do not\nenter this cue count.\n\n## Valid next test\n\nCollect this unchanged feed at a fixed daily time for at least 90 days. First\nvalidate whether manually confirmed physical/industrial local events are caught\nwithin 24 hours. Only then test pre-specified event windows against CFAM\nobservations such as EIA inventory changes or the future 091-S/091-U panels.\nDo not correlate a single current headline snapshot with WTI.\n\n## Reproduction\n\n- [Collector](../../../notebooks/091-cushing-operations-nowcasting/collect_091z_local_news_cues.py)\n- [Headline-level audit](headline_audit.csv)\n- [Raw responses + SHA-256 receipt](../../../gathering/raw/ALT-20260908-26/{STAMP}/README.md)\n"""
    summary = summary.replace(
        "- **Physical:** terminal, pipeline, storage, crude, refinery, midstream, oilfield.",
        "- **Physical:** terminal, pipeline, tank farm, refinery, midstream, oilfield.",
    ).replace(
        "A term match means only that the article is eligible for human review. It does\nnot prove a terminal event, the size of any effect, or that Cushing is busier.",
        "An item must contain the Cushing place-name anchor and one cue lane; finance/fund\nheadlines are excluded. A match only makes an article eligible for human review; it\ndoes not prove a terminal event, the size of any effect, or that Cushing is busier.",
    )
    (OUT / "README.md").write_text(summary, encoding="utf-8")
    raw_note = """# ALT-20260908-26 — 091-Z local-news collection receipt\n\n**Collection date:** 2026-09-08  \n**Scope:** public KUSH feeds/API and a frozen Google News Cushing-industrial query.\n\nThe source-response manifest records URL, HTTP status, byte count and SHA-256.\nThis collection contains publicly published article metadata/excerpts only; it\ncollects no private messages, user identities, device data or individual movement.\n\nResult and visual audit: [`091-Z`](../../../../indexes/091-cushing-operations-nowcasting/20260908T091ZNEWSZ/README.md).\n"""
    (RAW / "README.md").write_text(raw_note, encoding="utf-8")


if __name__ == "__main__":
    main()
