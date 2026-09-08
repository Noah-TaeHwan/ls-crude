"""Read-only discovery pass over Cushing's public agenda archive for CFAM 091.

This deliberately does *not* calculate a busy score or any market association.
It retrieves public PDFs, preserves reproducible hashes locally, and identifies
documents that visibly contain the three pre-registered operational candidates:
hotel/motel tax (091-A), separated sales/use tax (091-F), and airport reporting
(091-O).  The raw PDFs and CSV manifests are gitignored; the generated README is
the auditable receipt that is committed after human review.
"""

from __future__ import annotations

import argparse
import hashlib
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

import requests
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]
RAW_ROOT = ROOT / "gathering" / "raw" / "ALT-20260908-20"
BASE = "https://www.cityofcushing.com"
YEARS = tuple(range(2017, 2027))
KEYS = {
    "hotel_motel_tax": re.compile(r"hotel\s*(?:/|&|and)?\s*motel\s+tax", re.I),
    "sales_use_tax": re.compile(r"sales\s*/\s*use\s*/\s*tobacco", re.I),
    "airport_monthly": re.compile(r"(?:cushing\s+regional\s+)?airport.{0,80}monthly\s+report", re.I | re.S),
    "jet_a": re.compile(r"jet[\s-]?a", re.I),
}


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.links.append(href)


def text_from_pdf(path: Path) -> str:
    try:
        return "\n".join(page.extract_text() or "" for page in PdfReader(str(path)).pages)
    except Exception as exc:  # Corrupt PDF must remain visible in the receipt.
        return f"[EXTRACTION_ERROR: {type(exc).__name__}: {exc}]"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--years", default="2017-2026", help="inclusive range, e.g. 2020-2023")
    parser.add_argument("--limit", type=int, default=0, help="optional cap for a small read-only probe")
    args = parser.parse_args()
    first, last = (int(part) for part in args.years.split("-", 1))
    years = [year for year in YEARS if first <= year <= last]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = RAW_ROOT / stamp
    out.mkdir(parents=True, exist_ok=False)
    session = requests.Session()
    session.headers["User-Agent"] = "ls-crude-cfam-research/1.0 (public archive audit)"

    agenda_pages: dict[str, set[int]] = {}
    pdf_urls: dict[str, set[int]] = {}
    for year in years:
        response = session.get(f"{BASE}/node/14/agenda/{year}", timeout=30)
        response.raise_for_status()
        parser_html = LinkCollector()
        parser_html.feed(response.text)
        for href in parser_html.links:
            candidate = urljoin(response.url, href)
            if ".pdf" in candidate.lower():
                pdf_urls.setdefault(candidate, set()).add(year)
            elif "/city-commissioners/agenda/" in candidate:
                agenda_pages.setdefault(candidate, set()).add(year)

    # The calendar pages link to human-facing agenda records. Their attachment
    # links are one hop deeper, which is why a direct PDF-only scan is invalid.
    for page_url, page_years in sorted(agenda_pages.items()):
        response = session.get(page_url, timeout=30)
        response.raise_for_status()
        parser_html = LinkCollector()
        parser_html.feed(response.text)
        for href in parser_html.links:
            candidate = urljoin(response.url, href)
            if ".pdf" in candidate.lower():
                pdf_urls.setdefault(candidate, set()).update(page_years)

    urls = sorted(pdf_urls)
    if args.limit:
        urls = urls[: args.limit]
    rows: list[dict[str, str]] = []
    for index, url in enumerate(urls, start=1):
        response = session.get(url, timeout=60)
        response.raise_for_status()
        content = response.content
        if not content.startswith(b"%PDF"):
            raise RuntimeError(f"not a PDF: {url}")
        filename = f"{index:03d}_{Path(url.split('?', 1)[0]).name}"
        path = out / filename
        path.write_bytes(content)
        extracted = text_from_pdf(path)
        flags = {name: bool(pattern.search(extracted)) for name, pattern in KEYS.items()}
        rows.append(
            {
                "source_years": ",".join(map(str, sorted(pdf_urls[url]))),
                "url": url,
                "local_file": filename,
                "bytes": str(len(content)),
                "sha256": hashlib.sha256(content).hexdigest(),
                "pages": str(len(PdfReader(str(path)).pages)),
                **{key: str(value).lower() for key, value in flags.items()},
            }
        )

    fields = list(rows[0]) if rows else ["url"]
    manifest = out / "agenda_manifest.csv"
    manifest.write_text(
        ",".join(fields) + "\n" + "\n".join(
            ",".join('"' + row[field].replace('"', '""') + '"' for field in fields) for row in rows
        ) + "\n",
        encoding="utf-8",
    )
    counts = {key: sum(row[key] == "true" for row in rows) for key in KEYS}
    matching = [row for row in rows if any(row[key] == "true" for key in KEYS)]
    receipt = [
        "# ALT-20260908-20 — CFAM city-agenda discovery receipt",
        "",
        f"- **retrieved_at_utc:** {datetime.now(timezone.utc).isoformat()}",
        f"- **scope:** public City of Cushing commissioner-agenda PDFs for {first}–{last}; {len(rows)} PDFs retrieved.",
        "- **purpose:** discover, not model, repeated official documents for 091-A / 091-F / 091-O.",
        "- **privacy:** aggregate public municipal reports only; no people, device, vehicle, customer, or individual event records.",
        "- **important:** keyword hits only identify candidate documents. They do not establish a comparable monthly series, metric period, publication timestamp, or CFAM relationship.",
        "",
        "## Keyword discovery counts",
        "",
        "| candidate phrase | matching PDFs | meaning |",
        "| --- | ---: | --- |",
        f"| Hotel/Motel Tax | {counts['hotel_motel_tax']} | 091-A candidate text hit |",
        f"| Sales/Use/Tobacco | {counts['sales_use_tax']} | 091-F candidate text hit |",
        f"| Airport Monthly Report | {counts['airport_monthly']} | 091-O candidate text hit |",
        f"| Jet-A | {counts['jet_a']} | aviation-fuel text hit |",
        "",
        "## Candidate-document manifest",
        "",
        "The raw PDFs and complete CSV manifest are intentionally ignored by Git. Each retained row below gives a source URL, size and SHA-256 for reproducible retrieval.",
        "",
        "| source years | candidate flags | bytes | SHA-256 | source URL |",
        "| --- | --- | ---: | --- | --- |",
    ]
    for row in matching:
        flags = ", ".join(key for key in KEYS if row[key] == "true")
        receipt.append(f"| {row['source_years']} | {flags} | {row['bytes']} | `{row['sha256']}` | {row['url']} |")
    (out / "README.md").write_text("\n".join(receipt) + "\n", encoding="utf-8")
    print(f"retrieved={len(rows)} candidates={len(matching)} receipt={out / 'README.md'}")


if __name__ == "__main__":
    main()
