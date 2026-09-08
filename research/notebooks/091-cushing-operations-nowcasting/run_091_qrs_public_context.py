"""Collect and render CFAM 091-Q/R/S public-context samples.

No sales, order, device, person, guest, patient or membership records are used.
Google Maps is recorded as a one-time, user-visible presence/feature audit only;
this script does not query or automate Google Maps.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091QRSZ"
RAW = ROOT / "gathering" / "raw" / "ALT-20260908-19" / "20260908T180000Z"
NOAA_URL = "https://api.weather.gov/stations/KCUH/observations?limit=24"
KUSH_CATEGORIES = "https://www.1600kush.com/wp-json/wp/v2/categories"
KUSH_POSTS = "https://www.1600kush.com/wp-json/wp/v2/posts"


def fetch_json(url: str, destination: Path) -> object:
    req = Request(url, headers={"User-Agent": "ls-crude-CFAM-research/1.0"})
    with urlopen(req, timeout=40) as response:  # nosec B310 - fixed public HTTPS endpoints
        payload = response.read()
    destination.write_bytes(payload)
    return json.loads(payload)


def fetch_raw(raw: Path) -> tuple[dict, list[dict]]:
    raw.mkdir(parents=True, exist_ok=True)
    weather = fetch_json(NOAA_URL, raw / "noaa-kcuh-observations-24h.json")
    categories = fetch_json(f"{KUSH_CATEGORIES}?{urlencode({'search': 'KUSH After Dark', 'per_page': 100})}", raw / "kush-categories.json")
    category = next((item for item in categories if item.get("name") == "KUSH After Dark"), None)
    if category is None:
        raise ValueError("KUSH After Dark category was not returned by the public endpoint")
    events = fetch_json(f"{KUSH_POSTS}?{urlencode({'categories': category['id'], 'per_page': 100, '_fields': 'date,title,content,link'})}", raw / "kush-after-dark-posts.json")
    return weather, events


def write_receipt(raw: Path) -> None:
    lines = [
        "# ALT-20260908-19 — CFAM public context retrieval receipt",
        "",
        f"- Retrieved at (UTC): `{datetime.now(timezone.utc).isoformat(timespec='seconds')}`",
        f"- NOAA current-observation endpoint: `{NOAA_URL}`",
        "- KUSH endpoint: public WordPress category lookup plus the KUSH After Dark category’s post metadata.",
        "- Raw JSON is ignored by Git. It can include publicly posted article text/title strings; tracked outputs contain only aggregate/event-audit fields and no author names, text, customer, visitor, device, patient, guest or member records.",
        "- Google Maps restaurant results are **not** fetched by code. The source audit is a one-time visible UI observation, and no historic Popular-times series is claimed.",
        "",
        "| file | bytes | SHA-256 |",
        "| --- | ---: | --- |",
    ]
    for path in sorted(raw.glob("*.json")):
        lines.append(f"| {path.name} | {path.stat().st_size} | `{hashlib.sha256(path.read_bytes()).hexdigest()}` |")
    (raw / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def weather_frame(weather: dict) -> pd.DataFrame:
    rows = []
    for feature in weather.get("features", []):
        props = feature["properties"]
        temp = props.get("temperature", {}).get("value")
        wind = props.get("windSpeed", {}).get("value")
        if temp is not None:
            rows.append({"timestamp": props["timestamp"], "temperature_c": temp, "wind_speed_kmh": wind})
    frame = pd.DataFrame(rows)
    if frame.empty:
        raise ValueError("KCUH observation endpoint returned no non-null temperatures")
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True)
    return frame.sort_values("timestamp")


def event_frame(events: list[dict]) -> pd.DataFrame:
    rows = []
    for item in events:
        # This intentionally measures candidate *posts*, not the event’s actual attendance/date.
        title = str(item.get("title", {}).get("rendered", ""))
        content = str(item.get("content", {}).get("rendered", ""))
        rows.append({
            "post_date": item["date"],
            "cushing_mentioned": "cushing" in f"{title} {content}".lower(),
            "scheduled_event_date_structured": False,
        })
    return pd.DataFrame(rows)


def maps_snapshot() -> pd.DataFrame:
    # Visible Google Maps audit performed in-app on 2026-09-08 KST.
    # Presence means Maps displayed the feature on that visit; it is not a numeric busyness value.
    rows = [
        ("Wendy's", True, True, True),
        ("Taco Bell", True, True, True),
        ("Sonic Drive-In", True, True, True),
        ("Golden Chick", True, True, True),
        ("Pizza Hut", True, False, False),
        ("Boomarang Diner", True, True, True),
    ]
    return pd.DataFrame(rows, columns=["venue", "popular_times_visible", "delivery_visible", "drive_through_visible"])


def render(weather: pd.DataFrame, events: pd.DataFrame, maps: pd.DataFrame) -> None:
    figures = OUT / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    weather.to_csv(OUT / "091q_kcuh_weather_24h_sample.csv", index=False)
    events.to_csv(OUT / "091r_kush_after_dark_audit.csv", index=False)
    maps.to_csv(OUT / "091s_google_maps_feature_snapshot.csv", index=False)

    x = weather["timestamp"]
    fig, ax = plt.subplots(figsize=(10, 4.6), constrained_layout=True)
    ax.plot(x, weather["temperature_c"], color="#d75a2b", marker="o", linewidth=1.9, label="air temperature (°C)")
    ax.set_ylabel("temperature °C")
    ax.set_title("091-Q — KCUH public weather observation sample (latest 24 reports)", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    ax.legend(frameon=False)
    ax.text(0.01, -0.24, "Weather is an external operating-condition context (heat, wind, precipitation), not a direct city-activity count. Report timestamps are the only availability dates.", transform=ax.transAxes, fontsize=8.4)
    fig.savefig(figures / "091q-kcuh-weather-sample.png", dpi=180, bbox_inches="tight")
    fig.savefig(figures / "091q-kcuh-weather-sample.svg", bbox_inches="tight")
    plt.close(fig)

    summary = pd.Series({"All category\nposts": len(events), "Cushing-mentioned\nposts": int(events["cushing_mentioned"].sum()), "Structured\nevent dates": int(events["scheduled_event_date_structured"].sum())})
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.bar(summary.index, summary.values, color=["#b9cce4", "#d79654", "#c96d6d"])
    ax.set_ylabel("post count")
    ax.set_title("091-R — KUSH After Dark: category audit, not an event-attendance series", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    for i, value in enumerate(summary.values): ax.text(i, value + 0.1, str(value), ha="center", fontsize=10)
    ax.text(0.01, -0.28, "Category includes non-Cushing regional material and posts do not provide a stable structured event-date field. No event-load score is created.", transform=ax.transAxes, fontsize=8.4)
    fig.savefig(figures / "091r-after-dark-category-audit.png", dpi=180, bbox_inches="tight")
    fig.savefig(figures / "091r-after-dark-category-audit.svg", bbox_inches="tight")
    plt.close(fig)

    values = [int(maps[col].sum()) for col in ["popular_times_visible", "delivery_visible", "drive_through_visible"]]
    labels = ["Popular times\nshown", "Delivery\nshown", "Drive-through\nshown"]
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    ax.bar(labels, values, color=["#5b8db8", "#6fab82", "#d79654"])
    ax.set_ylim(0, len(maps) + 1)
    ax.set_ylabel(f"venues out of {len(maps)}")
    ax.set_title("091-S — Google Maps quick-service feature snapshot", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=0.2)
    for i, value in enumerate(values): ax.text(i, value + 0.12, f"{value}/{len(maps)}", ha="center", fontsize=10)
    ax.text(0.01, -0.25, "One visible UI snapshot only. Popular times is a relative visit profile, not a live numeric count or historical dataset; no automatic collection or backtest is performed.", transform=ax.transAxes, fontsize=8.3)
    fig.savefig(figures / "091s-maps-quick-service-feature-audit.png", dpi=180, bbox_inches="tight")
    fig.savefig(figures / "091s-maps-quick-service-feature-audit.svg", bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fetch", action="store_true")
    parser.add_argument("--raw-dir", type=Path, default=RAW)
    args = parser.parse_args()
    if args.fetch:
        weather, events = fetch_raw(args.raw_dir)
        write_receipt(args.raw_dir)
    else:
        weather = json.loads((args.raw_dir / "noaa-kcuh-observations-24h.json").read_text(encoding="utf-8"))
        events = json.loads((args.raw_dir / "kush-after-dark-posts.json").read_text(encoding="utf-8"))
    render(weather_frame(weather), event_frame(events), maps_snapshot())


if __name__ == "__main__":
    main()
