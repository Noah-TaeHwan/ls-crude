"""Record one permitted manual 091-S Google Maps busy-label observation.

This program never calls Google Maps, scrapes a page, uses a key, or estimates
visits. A researcher reads the public UI and supplies only its visible relative
label. The resulting CSV is a forward-only audit log, not a numeric footfall
series.
"""
from __future__ import annotations

import argparse
import csv
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "forward-panel" / "091s_manual_busy_labels.csv"
LABELS = {"quieter_than_usual", "usual", "busier_than_usual", "not_shown"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--venue", required=True, help="One frozen 091-S venue name")
    parser.add_argument("--maps-url", required=True, help="Public venue URL")
    parser.add_argument("--label", required=True, choices=sorted(LABELS))
    parser.add_argument("--open", dest="is_open", required=True, choices=("yes", "no", "unknown"))
    parser.add_argument("--delivery", required=True, choices=("shown", "not_shown", "unknown"))
    parser.add_argument("--drive-through", required=True, choices=("shown", "not_shown", "unknown"))
    args = parser.parse_args()

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    fields = ["observed_at_utc", "venue", "maps_url", "busy_label", "open", "delivery", "drive_through"]
    exists = OUTPUT.exists()
    with OUTPUT.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        if not exists:
            writer.writeheader()
        writer.writerow({
            "observed_at_utc": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "venue": args.venue,
            "maps_url": args.maps_url,
            "busy_label": args.label,
            "open": args.is_open,
            "delivery": args.delivery,
            "drive_through": args.drive_through,
        })


if __name__ == "__main__":
    main()
