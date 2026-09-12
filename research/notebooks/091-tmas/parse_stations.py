#!/usr/bin/env python3
"""FHWA TMAS station (.STA) 스크리닝 파서 — 표준 라이브러리만.

2023 OK_2023 (TMAS).STA 실제 형식 기준:
- 1행: 파이프 구분 헤더(41필드).
- S 레코드: 파이프 구분. latitude/longitude는 10^6 스케일의 양수(서경 W = 양수).
- 방향/차선별 레코드가 여러 줄이므로 station_id로 묶고 좌표는 중앙값.

사용:
  python3 parse_stations.py --sta FILE --center 35.9851,-96.7670 --radius-km 40 \
      --out-all all.csv --out-within within.csv
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from collections import defaultdict

CENTER = (35.9851, -96.7670)
EARTH_R_KM = 6371.0088


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_R_KM * math.asin(math.sqrt(a))


def decode_latlon(lat_raw: str, lon_raw: str):
    """10^6 스케일 정수 좌표를 도(degree)로. longitude는 W(서경) 양수 표기."""
    lat = float(lat_raw.strip()) / 1e6
    lon = -abs(float(lon_raw.strip()) / 1e6)
    return lat, lon


def decode_route(posted: str, con: str) -> str:
    """'0287On U' -> US-287, '0018On S' -> SH-18, '0035On I' -> I-35."""
    s = (posted or "").strip()
    con = (con or "").strip()
    kind = {"U": "US", "S": "SH", "I": "I"}
    if "On" in s:
        num, _, suffix = s.partition("On")
        suffix = suffix.strip()
        if suffix in kind and num.strip().isdigit():
            return f"{kind[suffix]}-{int(num)}"
    if con and con[0] in ("US",) and con[2:].strip().isdigit():
        return f"US-{int(con[2:])}"
    return s or con


def read_sta(path: str):
    with open(path, encoding="utf-8", errors="replace") as fh:
        raw = fh.read()
    lines = [ln for ln in raw.splitlines() if ln.strip()]
    header = [h.strip() for h in lines[0].split("|")]
    if "station_id" not in header or "latitude" not in header:
        raise SystemExit("HEADER_UNRECOGNIZED: 첫 행이 알려진 TMAS 헤더가 아닙니다")
    records = []
    for ln in lines[1:]:
        parts = ln.split("|")
        if len(parts) != len(header):
            continue
        rec = dict(zip(header, parts))
        if rec.get("record_type", "").strip().upper() != "S":
            continue
        records.append(rec)
    return header, records


def build_stations(records, center=CENTER):
    stations = {}
    for rec in records:
        sid = rec.get("station_id", "").strip()
        if not sid:
            continue
        try:
            lat, lon = decode_latlon(rec["latitude"], rec["longitude"])
        except (ValueError, KeyError):
            continue
        st = stations.setdefault(sid, {
            "station_id": sid,
            "lats": [], "lons": [],
            "directions": set(), "lanes": set(),
            "f_systems": set(), "counties": set(),
            "routes": set(), "locations": set(),
            "class_types": set(), "num_lanes": set(), "year_est": set(),
            "rows": 0, "lat": None, "lon": None,
        })
        st["lats"].append(lat); st["lons"].append(lon)
        st["directions"].add(rec.get("travel_dir", "").strip())
        st["lanes"].add(rec.get("travel_lane", "").strip())
        st["f_systems"].add(rec.get("f_system", "").strip())
        st["counties"].add(rec.get("county_code", "").strip())
        st["routes"].add(decode_route(rec.get("posted_signed_route"), rec.get("con_signed_route")))
        st["locations"].add(rec.get("station_location", "").strip())
        st["class_types"].add(rec.get("sample_type_class", "").strip())
        st["num_lanes"].add(rec.get("num_lanes", "").strip())
        st["year_est"].add(rec.get("year_established", "").strip())
        st["rows"] += 1

    out = []
    for st in stations.values():
        lats, lons = sorted(st.pop("lats")), sorted(st.pop("lons"))
        st["lat"] = lats[len(lats) // 2]
        st["lon"] = lons[len(lons) // 2]
        st["distance_km"] = haversine_km(center[0], center[1], st["lat"], st["lon"])
        for k in ("directions", "lanes", "f_systems", "counties", "routes", "locations", "class_types", "num_lanes", "year_est"):
            st[k] = sorted(x for x in st[k] if x)
        out.append(st)
    out.sort(key=lambda s: s["distance_km"])
    return out


def write_csv(path: str, stations) -> None:
    cols = [
        "station_id", "distance_km", "lat", "lon", "counties", "routes",
        "f_systems", "directions", "lanes", "num_lanes", "class_types",
        "year_est", "rows", "location",
    ]
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(cols)
        for s in stations:
            w.writerow([
                s["station_id"], f"{s['distance_km']:.3f}", f"{s['lat']:.6f}", f"{s['lon']:.6f}",
                ";".join(s["counties"]), ";".join(r for r in s["routes"] if r),
                ";".join(s["f_systems"]), ";".join(s["directions"]), ";".join(s["lanes"]),
                ";".join(s["num_lanes"]), ";".join(s["class_types"]), ";".join(s["year_est"]),
                s["rows"], " | ".join(s["locations"])[:120],
            ])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sta", required=True)
    ap.add_argument("--center", default=f"{CENTER[0]},{CENTER[1]}")
    ap.add_argument("--radius-km", type=float, default=40.0)
    ap.add_argument("--out-all", required=True)
    ap.add_argument("--out-within", required=True)
    ap.add_argument("--top", type=int, default=12)
    args = ap.parse_args()

    center = tuple(float(x) for x in args.center.split(","))

    header, records = read_sta(args.sta)
    stations = build_stations(records, center)
    within = [s for s in stations if s["distance_km"] <= args.radius_km]

    write_csv(args.out_all, stations)
    write_csv(args.out_within, within)

    print(f"STA_HEADER_FIELDS={len(header)}")
    print(f"S_RECORDS={len(records)}")
    print(f"UNIQUE_STATIONS={len(stations)}")
    print(f"WITHIN_{args.radius_km:g}KM={len(within)}")
    print("NEAREST:")
    for s in stations[:args.top]:
        print(f"  {s['distance_km']:8.2f} km | {s['station_id']:8} | {','.join(s['routes']) or '?':10} | "
              f"county={','.join(s['counties'])} f_sys={','.join(s['f_systems'])} | "
              f"{s['lat']:.6f},{s['lon']:.6f} | rows={s['rows']} | {s['locations'][0][:60] if s['locations'] else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
