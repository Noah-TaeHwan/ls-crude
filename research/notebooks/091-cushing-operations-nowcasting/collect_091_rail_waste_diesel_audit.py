"""Collect first-party/public-source receipts for CFAM rail, waste and pump-spread triage."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-28" / "20260908T210000Z"
SOURCES = {
    "odot_2012_rail_plan.pdf": "https://www.okladot.state.ok.us/rail/rail-plan/pdfs/2012_RailPlan.pdf",
    "usd_stroud_terminal.html": "https://usdg.com/terminal/stroud/",
    "deq_solid_waste_reporting_forms.html": "https://oklahoma.gov/deq/divisions/land-protection/waste-management/solid-waste/solid-waste-reporting-forms.html",
    "deq_monthly_industrial_waste_form.pdf": "https://www.deq.ok.gov/wp-content/uploads/land-division/515-031MonthlyReportApril2017.pdf",
    "maverik_cushing_pump_board.html": "https://locations.maverik.com/ok/cushing/2001-e-main-st#fuel",
    "way_cushing_pump_board.html": "https://www.way.com/gas/prices/oklahoma/cushing",
    "eia_oklahoma_marketing_prices.html": "https://www.eia.gov/dnav/pet/pet_sum_mkt_dcu_sok_m.htm",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for filename, url in SOURCES.items():
        request = Request(url, headers={"User-Agent": "ls-crude-research/1.0 (+091-rail-waste-diesel-audit)"})
        try:
            with urlopen(request, timeout=15) as response:
                body, status = response.read(), response.status
            outcome = "collected"
        except Exception as exc:  # Preserve source failure as a receipt, not a silent omission.
            body, status, outcome = str(exc).encode("utf-8"), None, f"failed: {type(exc).__name__}"
        (OUT / filename).write_bytes(body)
        manifest.append({
            "file": filename, "url": url, "http_status": status, "outcome": outcome,
            "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(),
        })
    (OUT / "sources_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (OUT / "README.md").write_text(
        "# ALT-20260908-28 — CFAM rail, waste and local-product-price audit receipt\n\n"
        "**Collection date:** 2026-09-08  \\n"
        "**Scope:** direct rail-flow feasibility, DEQ waste-report feasibility, and Cushing retail diesel–gasoline spread feasibility.\n\n"
        "Each response (including a failed response) is preserved with URL, byte count and SHA-256 in `sources_manifest.json`. "
        "Interpretation and gates are in `research/indexes/091-cushing-operations-nowcasting/20260908T091RWDTZ/README.md`.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
