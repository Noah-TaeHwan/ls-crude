"""Collect and visualize the public-source audit supplied for CFAM on 2026-09-08.

The collector preserves source responses and HTTP access outcomes. It does not
request, retain, infer, or process licence plates, vehicle identities, or
individual movement histories.
"""

from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "research" / "gathering" / "raw" / "ALT-20260908-24" / "20260908T170000Z"
FIG = ROOT / "research" / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091SOURCEZ" / "figures"

SOURCES = {
    "oilpriceapi_cushing_storage.html": "https://www.oilpriceapi.com/data/cushing-storage",
    "macromicro_cushing_collection.html": "https://en.macromicro.me/collections/19/mm-oil-price/1051/cushing-crude-oil-inventory",
    "faa_weathercams_cuh_shell.html": "https://weathercams.faa.gov/map/-97.63163,35.35188,-94.15721,36.54363/airport/CUH/details/pdfs",
    "faa_weathercams_cuh_api_status.txt": "https://weathercams.faa.gov/api/summary?airport=CUH",
    "odot_payne_aadt_2023.pdf": "https://oklahoma.gov/content/dam/ok/en/odot/maps/aadt/county-maps/60_Payne.pdf",
    "odot_traffic_engineering.html": "https://oklahoma.gov/odot/programs-and-projects/projects/traffic-engineering.html",
    "deflock_okc_map.html": "https://deflockokc.com/map.html",
    "osm_node_13654690602.json": "https://api.openstreetmap.org/api/0.6/node/13654690602.json",
    "osm_node_13651150001.json": "https://api.openstreetmap.org/api/0.6/node/13651150001.json",
}


def fetch(url: str) -> tuple[int, bytes]:
    request = Request(url, headers={"User-Agent": "ls-crude-research/1.0 (+public-source-audit)"})
    try:
        with urlopen(request, timeout=45) as response:
            return response.status, response.read()
    except HTTPError as error:
        return error.code, error.read()
    except URLError as error:
        return 0, str(error).encode("utf-8")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def svg_map(rows: list[dict[str, str]]) -> str:
    lats = [float(row["latitude"]) for row in rows]
    lons = [float(row["longitude"]) for row in rows]
    pad = 0.003
    min_lat, max_lat = min(lats) - pad, max(lats) + pad
    min_lon, max_lon = min(lons) - pad, max(lons) + pad

    def xy(lat: float, lon: float) -> tuple[float, float]:
        x = 55 + (lon - min_lon) / (max_lon - min_lon) * 430
        y = 240 - (lat - min_lat) / (max_lat - min_lat) * 160
        return x, y

    marks = []
    for row in rows:
        x, y = xy(float(row["latitude"]), float(row["longitude"]))
        marks.append(
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="#c73e1d"/>'
            f'<text x="{x + 13:.1f}" y="{y - 5:.1f}" font-size="12" fill="#172033">{row["label"]}</text>'
            f'<text x="{x + 13:.1f}" y="{y + 11:.1f}" font-size="10" fill="#556070">direction {row["direction_degrees"]}°</text>'
        )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="540" height="285" viewBox="0 0 540 285">
<rect width="540" height="285" fill="#f8fafc"/><text x="28" y="33" font-size="18" font-weight="700" fill="#172033">Cushing public ALPR-location audit</text>
<text x="28" y="55" font-size="11" fill="#556070">Locations and camera directions only — no vehicle, plate or traffic-count data.</text>
<rect x="45" y="75" width="450" height="175" rx="8" fill="#e8eef5" stroke="#b8c4d2"/>
<text x="50" y="269" font-size="10" fill="#556070">North ↑</text>{''.join(marks)}</svg>'''


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    FIG.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, object]] = []
    for filename, url in SOURCES.items():
        status, content = fetch(url)
        path = OUT / filename
        path.write_bytes(content)
        manifest.append({"file": filename, "url": url, "http_status": status, "bytes": len(content), "sha256": digest(path)})
    (OUT / "sources_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    rows: list[dict[str, str]] = []
    for filename, label in (("osm_node_13654690602.json", "Northern Flock ALPR"), ("osm_node_13651150001.json", "Southern Flock ALPR")):
        payload = json.loads((OUT / filename).read_text(encoding="utf-8"))
        node = payload["elements"][0]
        rows.append({
            "label": label,
            "node_id": str(node["id"]),
            "latitude": str(node["lat"]),
            "longitude": str(node["lon"]),
            "direction_degrees": node.get("tags", {}).get("direction", ""),
            "manufacturer": node.get("tags", {}).get("manufacturer", ""),
            "surveillance_type": node.get("tags", {}).get("surveillance:type", ""),
            "surveillance_zone": node.get("tags", {}).get("surveillance:zone", ""),
        })
    with (OUT / "cushing_flock_camera_nodes.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    (OUT / "odot_avc40_2023.csv").write_text(
        "station_label,aadt_2023,unit,source_note\nAVC 40,6178,vehicles_per_day,Official ODOT Payne County 2023 AADT map; AVC records daily volume and classification\n",
        encoding="utf-8",
    )
    (FIG / "091-source-osm-alpr-location-audit.svg").write_text(svg_map(rows), encoding="utf-8")


if __name__ == "__main__":
    main()
