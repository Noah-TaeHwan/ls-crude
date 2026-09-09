#!/usr/bin/env python3
"""Cushing Busy Board — one program, no composite score."""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
SNAPSHOT = HERE / "snapshot.json"

BOARD = {
    "question": "Is Cushing busy right now?",
    "program": "cushing-busy",
    "factor_ledger": "091 CFAM",
    "composite": None,
    "verdict": "INSUFFICIENT",
    "score": {
        "readiness": 80,
        "readiness_label": "관측 충실도",
        "readiness_detail": "4/5 activity lanes have a dated snapshot. 091-S restaurant labels: 0 rows.",
        "busy": None,
        "busy_label": "현장 바쁨",
        "busy_detail": "Not computed. 091-S has no quieter/usual/busier row yet.",
    },
    "verdict_note": "No independently validated local activity series. Do not invent a 0–100 busy index.",
    "as_of_utc": "2026-09-09T16:00:00Z",
    "lanes": {
        "activity_forward": [
            {
                "id": "091-S",
                "name": "Cushing restaurant strip — relative busy label",
                "status": "FORWARD_ONLY",
                "last_observation": "basket frozen: Wendy's, Taco Bell, Sonic, Golden Chick, Pizza Hut, Boomarang Diner. No dated human label row yet.",
                "note": "This IS the restaurant-busy lane. Allowed: quieter / usual / busier / not shown. Excluded: mock 0–100, order counts, Uber Eats volume.",
                "venues": ["Wendy's", "Taco Bell", "Sonic Drive-In", "Golden Chick", "Pizza Hut", "Boomarang Diner"],
            },
            {
                "id": "091-U",
                "name": "Industrial job pulse",
                "status": "FORWARD_ONLY",
                "last_observation": "2026-09-08 snapshot, 4 high-trust postings",
                "note": "Hiring list is not crew-on-site.",
            },
            {
                "id": "091-Y",
                "name": "Cushing pump posted price",
                "status": "FORWARD_ONLY",
                "last_observation": "Maverik one-shot on 2026-09-08",
                "note": "Local product price, not gallons pumped.",
            },
            {
                "id": "091-Z",
                "name": "Local industrial news cue",
                "status": "FORWARD_ONLY",
                "last_observation": "KUSH / Google News / OK Energy Today audit 2026-09-08",
                "note": "Headline count is not activity.",
            },
            {
                "id": "091-V",
                "name": "DEQ permit status events",
                "status": "FORWARD_ONLY",
                "last_observation": "Cushing Tank Terminal 2024-1222-TVR issued, receipt 2024-12-04; Tidal 2025-0311-TVR2 issued; South Terminal technical review",
                "note": "Event log, not monthly construction volume.",
            },
        ],
        "physical_context": [
            {
                "id": "091-EIA",
                "name": "Cushing ending stocks excl. SPR",
                "status": "LIVE_CONTEXT",
                "last_observation": "week 2026-08-28 = 22,508 kbbl (+80 wow)",
                "note": "How full the tanks are. Not how busy the field is.",
            },
            {
                "id": "091-AADT",
                "name": "East Main annual AADT",
                "status": "ANNUAL_CONTEXT",
                "last_observation": "SITE_ID 600645, 2015-2025. 2025 AADT 11,648. Not a permanent station.",
                "note": "Annual average daily traffic, not daily trucks.",
            },
            {
                "id": "091-BPS",
                "name": "Cushing city residential building permits",
                "status": "MONTHLY_CONTEXT",
                "last_observation": "Census BPS 2024-01..2026-07, 31 months, 29 housing units total.",
                "note": "Housing units authorized, not tank or industrial construction.",
            },
            {
                "id": "091-Q",
                "name": "KCUH METAR weather",
                "status": "LIVE_CONTEXT",
                "last_observation": "AWC JSON, keyless. Confounder only.",
                "note": "Airport weather, not activity.",
            },
        ],
        "excluded": [
            {"id": "091-B", "reason": "Nightlights failed the 28-day inventory test; killed as quantitative input."},
            {"id": "091-CFSP", "reason": "National gasoline/wage/sentiment. Wrong geography."},
            {"id": "WTI", "reason": "Price is the research target, not a busy sensor."},
            {"id": "pipeline-by-name flow", "reason": "No free EIA named-line series."},
            {"id": "Cushing tankers", "reason": "Inland hub. No ocean tanker panel."},
            {"id": "mock Maps 0–100", "reason": "Synthetic hour-of-day, not an observation."},
        ],
    },
}


def render_text(board: dict) -> str:
    lines = [
        f"# {board['question']}",
        f"verdict: {board['verdict']} — {board['verdict_note']}",
        f"as of {board['as_of_utc']}",
        "",
        "## Activity (forward only)",
    ]
    for row in board["lanes"]["activity_forward"]:
        seen = row["last_observation"] or "no dated row yet"
        lines.append(f"- {row['id']} {row['name']} [{row['status']}] {seen}")
    lines += ["", "## Physical context (not busy)"]
    for row in board["lanes"]["physical_context"]:
        lines.append(f"- {row['id']} {row['name']}: {row['last_observation']}")
    lines += ["", "## Kept off this dash"]
    for row in board["lanes"]["excluded"]:
        lines.append(f"- {row['id']}: {row['reason']}")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--write", action="store_true", help="Refresh snapshot.json")
    args = parser.parse_args()
    board = dict(BOARD)
    board["generated_at_utc"] = datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    if args.write:
        SNAPSHOT.write_text(json.dumps(board, indent=2) + "\n")
    if args.json:
        print(json.dumps(board, indent=2))
        return
    print(render_text(board))


if __name__ == "__main__":
    main()
