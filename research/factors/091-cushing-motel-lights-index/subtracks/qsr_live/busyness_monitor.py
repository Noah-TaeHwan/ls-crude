"""091-S forward busy-label recorder.

The submitted live monitor is kept as a recording shell only. It does not call
Google Maps, does not use an API key, and does not write mock 0-100 scores.
A person reads the public venue page and types the visible relative label.
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
import webbrowser
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUTPUT = (
    ROOT
    / "research"
    / "indexes"
    / "091-cushing-operations-nowcasting"
    / "forward-panel"
    / "091s_manual_busy_labels.csv"
)

FROZEN_VENUES = [
    {"name": "Wendy's", "maps_url": "https://maps.app.goo.gl/g8bMaDQDnoMc9roT8"},
    {"name": "Taco Bell", "maps_url": "https://maps.app.goo.gl/yTqHLrTgNEpwXSar9"},
    {"name": "Sonic Drive-In", "maps_url": "https://maps.app.goo.gl/XuwHFkr1iwhEnCcT7"},
    {"name": "Golden Chick", "maps_url": "https://maps.app.goo.gl/eNWcXPHvQcWH9iB1A"},
    {"name": "Pizza Hut", "maps_url": "https://maps.app.goo.gl/2pi7HqucdZ1J1m527"},
    {"name": "Boomarang Diner", "maps_url": "https://maps.app.goo.gl/ajaYq841CJrCgL898"},
]

OPTIONAL_WATCHLIST = [
    {"name": "watchlist-gym-2", "maps_url": "https://maps.app.goo.gl/FYmMSzSd4GiC2fN86"},
    {"name": "watchlist-community-1", "maps_url": "https://maps.app.goo.gl/xBJ17g4Wj3ZJnxDfA"},
    {"name": "watchlist-community-2", "maps_url": "https://maps.app.goo.gl/Cw3bKcxzCR9tkPAe6"},
    {"name": "watchlist-gym-3", "maps_url": "https://maps.app.goo.gl/1xzvrj6CB7iaCTpF7"},
    {"name": "watchlist-community-3", "maps_url": "https://maps.app.goo.gl/UaFWpMyC3agXc7779"},
    {"name": "watchlist-gym-4", "maps_url": "https://maps.app.goo.gl/wubck7LvNokGxVhG6"},
    {"name": "watchlist-community-4", "maps_url": "https://maps.app.goo.gl/oP5NfGyEugjsAQzq5"},
]

LABELS = ("quieter_than_usual", "usual", "busier_than_usual", "not_shown")
YES_NO = ("yes", "no", "unknown")
SHOWN = ("shown", "not_shown", "unknown")
FIELDS = [
    "observed_at_utc",
    "venue",
    "maps_url",
    "busy_label",
    "open",
    "delivery",
    "drive_through",
    "source",
]


def prompt_choice(label: str, allowed: tuple[str, ...], default: str) -> str:
    allowed_text = "/".join(allowed)
    raw = input(f"  {label} [{allowed_text}] (default {default}): ").strip().lower()
    if not raw:
        return default
    if raw not in allowed:
        print(f"  skipped invalid value {raw!r}; using {default}")
        return default
    return raw


def append_row(row: dict[str, str]) -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    exists = OUTPUT.exists()
    with OUTPUT.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerow(row)


def record_venue(venue: dict[str, str], *, open_browser: bool) -> None:
    print(f"\n{venue['name']}")
    print(f"  {venue['maps_url']}")
    if open_browser:
        try:
            webbrowser.open(venue["maps_url"])
        except Exception as exc:  # pragma: no cover
            print(f"  browser open failed: {exc}")
    label = prompt_choice("live busy label", LABELS, "not_shown")
    is_open = prompt_choice("open", YES_NO, "unknown")
    delivery = prompt_choice("delivery", SHOWN, "unknown")
    drive_through = prompt_choice("drive-through", SHOWN, "unknown")
    append_row(
        {
            "observed_at_utc": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "venue": venue["name"],
            "maps_url": venue["maps_url"],
            "busy_label": label,
            "open": is_open,
            "delivery": delivery,
            "drive_through": drive_through,
            "source": "manual_ui",
        }
    )
    print(f"  wrote {OUTPUT.name}")


def print_mock_demo() -> None:
    hour = datetime.now().hour
    print("MOCK DISPLAY ONLY — not written, not a 091-S observation")
    print(f"local hour={hour}")
    for venue in FROZEN_VENUES:
        print(f"  {venue['name']:<20} label=not_shown  {venue['maps_url']}")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--once", action="store_true", help="One pass over the frozen basket")
    mode.add_argument("--loop", action="store_true", help="Repeat the frozen basket")
    mode.add_argument("--mock", action="store_true", help="Print a demo table and exit")
    parser.add_argument("--interval-seconds", type=int, default=300)
    parser.add_argument("--open-browser", action="store_true")
    parser.add_argument(
        "--include-watchlist",
        action="store_true",
        help="Also prompt optional gym/community URLs; still not 091-S inputs",
    )
    return parser.parse_args(argv)


def venues(include_watchlist: bool) -> list[dict[str, str]]:
    if include_watchlist:
        return [*FROZEN_VENUES, *OPTIONAL_WATCHLIST]
    return list(FROZEN_VENUES)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    if args.mock:
        print_mock_demo()
        return 0
    if not args.once and not args.loop:
        args.once = True
    selected = venues(args.include_watchlist)
    print("091-S manual busy-label recorder")
    print("Type the visible Maps relative label. Do not invent a 0-100 score.")
    print(f"log: {OUTPUT}")
    try:
        while True:
            print(f"\npass {datetime.now().isoformat(timespec='seconds')}")
            for venue in selected:
                record_venue(venue, open_browser=args.open_browser)
            if args.once:
                return 0
            time.sleep(max(args.interval_seconds, 30))
    except KeyboardInterrupt:
        print("\nstopped")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
