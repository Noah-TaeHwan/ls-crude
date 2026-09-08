"""Preserve the public-source recheck for parked CFAM 091 sub-tracks."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-27" / "20260908T200000Z"
SOURCES = {
    "city_agenda_2025_tax_comparison.pdf": "https://www.cityofcushing.com/sites/g/files/vyhlif4306/f/agendas/cma.agenda.11.17.25.pdf",
    "city_agendas_2024.html": "https://www.cityofcushing.com/node/14/agenda/2024",
    "city_agendas_2025.html": "https://www.cityofcushing.com/node/14/agenda/2025",
    "deq_public_review.html": "https://applications.deq.ok.gov/PermitsPublicReview/viewpermits.aspx",
    "deq_cushing_south_terminal_permit.pdf": "https://applications.deq.ok.gov/permitspublic/storedpermits/9030.pdf",
    "odot_payne_aadt_2023.pdf": "https://oklahoma.gov/content/dam/ok/en/odot/maps/aadt/county-maps/60_Payne.pdf",
    "faa_weathercams_cuh_shell.html": "https://weathercams.faa.gov/map/-97.63163,35.35188,-94.15721,36.54363/airport/CUH/details/pdfs",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for filename, url in SOURCES.items():
        request = Request(url, headers={"User-Agent": "ls-crude-research/1.0 (+091-park-recheck)"})
        with urlopen(request, timeout=60) as response:
            body, status = response.read(), response.status
        path = OUT / filename
        path.write_bytes(body)
        manifest.append({"file": filename, "url": url, "http_status": status, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()})
    (OUT / "sources_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (OUT / "current_deq_industrial_event_routes.csv").write_text(
        "facility,permit_number,permit_class,status_at_recheck,scope\n"
        "Cushing South Terminal,2024-1235-O,minor-source operating permit,technical review,public regulatory event; not a construction-count\n"
        "Cushing Tank Terminal,2024-1222-TVR,title-v operating permit,issued,public regulatory event; not a construction-count\n"
        "Tidal Cushing Crude Terminal,2025-0311-TVR2,title-v operating permit,issued,public regulatory event; not a construction-count\n",
        encoding="utf-8",
    )
    (OUT / "README.md").write_text(
        "# ALT-20260908-27 — CFAM PARK recheck receipt\n\n"
        "**Collection date:** 2026-09-08  \\n"
        "**Scope:** City agenda/tax availability, DEQ industrial permit routes, ODOT and FAA recheck.\n\n"
        "Every response has URL, HTTP status, byte count and SHA-256 in `sources_manifest.json`. "
        "The audit result is in "
        "[`20260908T091PARKZ`](../../../../indexes/091-cushing-operations-nowcasting/20260908T091PARKZ/README.md).\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
