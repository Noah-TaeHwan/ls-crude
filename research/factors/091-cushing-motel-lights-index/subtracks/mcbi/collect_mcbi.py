"""Collect the public CME WTT bulletin without inventing a Midland spot leg.

WTT is the CME-listed ``WTI Midland (Argus) vs. WTI Trade Month`` future.  Its
settlement is a quoted futures differential, not an observed Midland cash price
and not a same-day EIA RWTC (Cushing spot) observation.  This collector therefore
stores WTT observations under their own name and intentionally never emits a
``Midland - Cushing`` spot basis.

The default source is CME's public current Energy Futures Products bulletin.  The
same program can be pointed at an archived, source-authorized CME bulletin using
``--pdf-url``.  It produces factor-local receipts only.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from urllib.request import Request, urlopen


DEFAULT_PDF_URL = (
    "https://www.cmegroup.com/daily_bulletin/current/"
    "Section61_Energy_Futures_Products.pdf"
)
ROOT = Path(__file__).resolve().parent
RAW_DIR = ROOT / "raw"
RESULTS_DIR = ROOT / "results"
OBSERVATIONS = RESULTS_DIR / "wtt_daily_observations.csv"
RECEIPT = RESULTS_DIR / "latest_receipt.json"
EXCERPT = RAW_DIR / "current_wtt_excerpt.txt"

OBSERVATION_FIELDS = [
    "bulletin_date",
    "contract_month",
    "wtt_settlement_usd_per_bbl",
    "source_url",
    "source_representation",
    "source_content_sha256",
    "parser",
]


def download(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "ls-crude-cfam-mcbi/1.0"})
    with urlopen(request, timeout=30) as response:
        return response.read()


def pdf_to_text(payload: bytes) -> str:
    """Prefer Poppler; fall back to pypdf when it is installed."""
    command = shutil.which("pdftotext")
    if command:
        completed = subprocess.run(
            [command, "-layout", "-", "-"],
            input=payload,
            capture_output=True,
            check=False,
        )
        if completed.returncode == 0 and completed.stdout.strip():
            return completed.stdout.decode("utf-8", errors="replace")
    try:
        from pypdf import PdfReader  # type: ignore[import-not-found]

        return "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(payload)).pages)
    except Exception as exc:  # pragma: no cover - depends on local PDF tools
        raise RuntimeError("no_pdf_text_extractor") from exc


def bulletin_date(text: str) -> str | None:
    """Return the bulletin calendar date printed by CME, when recognisable."""
    match = re.search(
        r"(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})",
        text,
    )
    if not match:
        return None
    return datetime.strptime(" ".join(match.groups()), "%b %d %Y").date().isoformat()


def wtt_section(text: str) -> list[str]:
    """Keep the WTT table only, ending at the next listed futures product."""
    lines = [line.rstrip() for line in text.splitlines()]
    start = next(
        (
            index
            for index, line in enumerate(lines)
            if re.search(r"\bWTT\s+FUT\b", line) and "WTI MIDLAND" in " ".join(lines[index:index + 3]).upper()
        ),
        None,
    )
    if start is None:
        return []
    section: list[str] = []
    for line in lines[start:]:
        if section and re.match(r"^[A-Z0-9]{1,5}\s+FUT\b", line) and not line.startswith("WTT FUT"):
            break
        section.append(line)
    return section


def parse_wtt_rows(lines: list[str]) -> list[dict[str, str]]:
    """Parse displayed settlement values; never infer an omitted settlement."""
    rows: list[dict[str, str]] = []
    # CME contract rows identify a contract month and then quote settlement followed
    # by either UNCH or a signed daily point change, e.g. ``SEP26 ... 0.74 - 0.01``.
    pattern = re.compile(
        r"^\s*([A-Z]{3}\d{2})\b.*?(-?\d+(?:\.\d+)?)(?:[ABNP])?\s+(?:UNCH|[+-]\s*\d+(?:\.\d+)?)\b"
    )
    for line in lines:
        match = pattern.search(line)
        if match:
            rows.append(
                {
                    "contract_month": match.group(1),
                    "wtt_settlement_usd_per_bbl": match.group(2),
                }
            )
    return rows


def read_existing(path: Path) -> dict[tuple[str, str], dict[str, str]]:
    if not path.exists():
        return {}
    with path.open(newline="", encoding="utf-8") as handle:
        return {
            (row["bulletin_date"], row["contract_month"]): row
            for row in csv.DictReader(handle)
            if row.get("bulletin_date") and row.get("contract_month")
        }


def write_observations(rows: list[dict[str, str]]) -> None:
    existing = read_existing(OBSERVATIONS)
    existing.update({(row["bulletin_date"], row["contract_month"]): row for row in rows})
    ordered = sorted(existing.values(), key=lambda row: (row["bulletin_date"], row["contract_month"]))
    with OBSERVATIONS.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OBSERVATION_FIELDS)
        writer.writeheader()
        writer.writerows(ordered)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf-url", default=DEFAULT_PDF_URL)
    parser.add_argument("--pdf-file", type=Path, help="Use an already-downloaded, authorised CME bulletin.")
    parser.add_argument(
        "--text-file",
        type=Path,
        help="Use a saved, source-authorized text extraction of the CME bulletin.",
    )
    args = parser.parse_args()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    collected_at = datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    receipt: dict[str, object] = {
        "collector": "collect_mcbi.py",
        "collected_at_utc": collected_at,
        "source_url": args.pdf_url,
        "instrument": "CME WTT: WTI Midland (Argus) vs. WTI Trade Month futures",
        "not_a_midland_cushing_spot_basis": True,
    }

    try:
        if args.text_file:
            text = args.text_file.read_text(encoding="utf-8")
            payload = text.encode("utf-8")
            source_representation = "official_pdf_text_extract"
        else:
            payload = args.pdf_file.read_bytes() if args.pdf_file else download(args.pdf_url)
            text = pdf_to_text(payload)
            source_representation = "official_pdf"
        receipt["source_bytes"] = len(payload)
        receipt["source_representation"] = source_representation
        receipt["source_content_sha256"] = hashlib.sha256(payload).hexdigest()
        date = bulletin_date(text)
        section = wtt_section(text)
        parsed = parse_wtt_rows(section)
        receipt.update(
            {
                "bulletin_date": date,
                "wtt_section_found": bool(section),
                "parsed_contract_rows": len(parsed),
                "status": "ok" if date and parsed else "parse_incomplete",
            }
        )
        # Keep a small human-auditable excerpt and content hash, not a copied daily PDF.
        EXCERPT.write_text("\n".join(section) + "\n", encoding="utf-8")
        if date:
            rows = [
                {
                    "bulletin_date": date,
                    "contract_month": row["contract_month"],
                    "wtt_settlement_usd_per_bbl": row["wtt_settlement_usd_per_bbl"],
                    "source_url": args.pdf_url,
                    "source_representation": source_representation,
                    "source_content_sha256": str(receipt["source_content_sha256"]),
                    "parser": "cme_section61_wtt_v1",
                }
                for row in parsed
            ]
            write_observations(rows)
        else:
            rows = []
    except Exception as exc:
        receipt.update({"status": f"fetch_or_extract_error:{type(exc).__name__}", "error": str(exc)})
        rows = []

    RECEIPT.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"status": receipt["status"], "parsed_rows": len(rows)}, separators=(",", ":")))
    return 0 if receipt["status"] == "ok" else 1


if __name__ == "__main__":
    sys.exit(main())
