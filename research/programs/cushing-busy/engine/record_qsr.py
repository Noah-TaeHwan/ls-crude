#!/usr/bin/env python3
"""Type the Maps label you see. Writes qsr_observer.json. Does not open Google."""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

VENUES = [
    ("Wendy's", "1415 E Main St"),
    ("Taco Bell", "1438 E Main St"),
    ("Sonic Drive-In", "705 E Main St"),
    ("Golden Chick", "1544 E Main St"),
    ("Pizza Hut", "2007 E Main St"),
    ("Boomarang Diner", "929 E Main St"),
]
ALLOWED = [
    "not busy",
    "somewhat busy",
    "busy",
    "as busy as it gets",
    "closed",
    "skip",
]
OUT = Path(__file__).with_name("qsr_observer.json")

def main():
    print("Allowed:", ", ".join(ALLOWED))
    rows = []
    for name, addr in VENUES:
        while True:
            lab = input(f"{name} ({addr}): ").strip().lower()
            if lab in ALLOWED:
                break
            print("  not in list")
        if lab != "skip":
            rows.append({"name": name, "address": addr, "label": lab})
    payload = {
        "asof": datetime.now(ZoneInfo("America/Chicago")).isoformat(),
        "recorded_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "protocol": "091-S visible Maps label only",
        "venues": rows,
    }
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print("wrote", OUT)

if __name__ == "__main__":
    main()
