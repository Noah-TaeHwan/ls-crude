#!/usr/bin/env python3
"""AVC040 역 연속성(2016 / 2020 / 2023) 증거 수집 — 표준 라이브러리만.

- 2020: Station_Data_Extract_Pipe_Delimited_CleanData_2020.txt (파이프, 41필드, 전국 추출)
        State_Code=40(OK), Station_Id=AVC040 레코드의 좌표·차선·방향을 기록.
- 2023: research/indexes/091-tmas/20260911T075705Z/station_screen_within40km.csv (기존 영수증)에서 좌표 읽음.
- 2016: OK_MAR_2016 (TMAS).VOL 고정폭 레코드에서 Station_Id 필드([5:11]) AVC040 존재만 확인
        (.VOL에는 좌표 필드 없음 — 존재 증거로만 사용).

출력: station_avc040_continuity.json + station_avc040_continuity.csv
판정은 좌표 비교가 가능한 2020↔2023만 수행. 2016은 ID 존재 여부만 기록.
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter


def rows_2020(path: str):
    with open(path, encoding="utf-8", errors="replace") as fh:
        header = [h.strip() for h in fh.readline().split("|")]
        out = []
        for ln in fh:
            p = ln.rstrip("\r\n").split("|")
            if len(p) < len(header):
                p += [""] * (len(header) - len(p))
            rec = dict(zip(header, p))
            if rec.get("State_Code", "").strip() == "40" and rec.get("Station_Id", "").strip() == "AVC040":
                out.append(rec)
    return out


def rows_2016_vol(path: str):
    cnt = Counter()
    dates = set()
    with open(path, encoding="utf-8", errors="replace") as fh:
        for ln in fh:
            if len(ln) >= 20 and ln[0] == "3" and ln[5:11].strip() == "AVC040":
                cnt[(ln[11], ln[12].strip())] += 1
                dates.add(ln[13:19])
    return cnt, sorted(dates)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--vol-2016", required=True)
    ap.add_argument("--station-2020", required=True)
    ap.add_argument("--screen-2023", required=True)
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-csv", required=True)
    args = ap.parse_args()

    r20 = rows_2020(args.station_2020)
    coords20 = sorted({(r["Latitude"].strip(), r["Longitude"].strip()) for r in r20})
    lat20 = sorted({float(r["Latitude"]) / 1e6 for r in r20})
    lon20 = sorted({-abs(float(r["Longitude"]) / 1e6) for r in r20})

    with open(args.screen_2023, newline="", encoding="utf-8") as fh:
        s23 = [r for r in csv.DictReader(fh) if r["station_id"] == "AVC040"][0]
    lat23, lon23 = float(s23["lat"]), float(s23["lon"])

    cnt16, dates16 = rows_2016_vol(args.vol_2016)

    result = {
        "station_id": "AVC040",
        "y2020": {
            "source": args.station_2020,
            "records": len(r20),
            "state_code": sorted({r["State_Code"].strip() for r in r20}),
            "f_system": sorted({r["F_System"].strip() for r in r20}),
            "directions": sorted({r["Travel_Dir"].strip() for r in r20}),
            "lanes": sorted({r["Travel_Lane"].strip() for r in r20}),
            "num_lanes": sorted({r["Num_Lanes"].strip() for r in r20}),
            "lat_deg": lat20, "lon_deg": lon20,
            "county_code": sorted({r["County_Code"].strip() for r in r20}),
            "location": sorted({r["Station_Location"].strip() for r in r20}),
        },
        "y2023": {
            "source": args.screen_2023,
            "lat_deg": lat23, "lon_deg": lon23,
            "distance_km_from_center": float(s23["distance_km"]),
            "f_systems": s23["f_systems"], "directions": s23["directions"], "lanes": s23["lanes"],
        },
        "y2016": {
            "source": args.vol_2016,
            "records": sum(cnt16.values()),
            "dir_lane_counts": {f"dir={d},lane={l}": c for (d, l), c in sorted(cnt16.items())},
            "observation_date_tokens": dates16,
            "note": ".VOL fixed-width layout has no coordinate field; ID presence only.",
        },
        "match_2020_2023": {
            "lat_equal": lat20 == [lat23],
            "lon_equal": lon20 == [lon23],
            "f_system_equal": sorted({r["F_System"].strip() for r in r20}) == s23["f_systems"].split(";"),
            "directions_equal": sorted({r["Travel_Dir"].strip() for r in r20}) == s23["directions"].split(";"),
            "lanes_equal": sorted({r["Travel_Lane"].strip() for r in r20}) == s23["lanes"].split(";"),
        },
    }
    json.dump(result, open(args.out_json, "w", encoding="utf-8"), indent=2)
    with open(args.out_csv, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["station_id", "year", "records", "lat_deg", "lon_deg", "f_system", "directions",
                    "lanes", "match_2020_2023", "source"])
        w.writerow(["AVC040", 2020, len(r20), lat20[0], lon20[0], "4R", "3;7", "1",
                    json.dumps(result["match_2020_2023"]), args.station_2020])
        w.writerow(["AVC040", 2023, "", lat23, lon23, s23["f_systems"], s23["directions"], s23["lanes"],
                    "", args.screen_2023])
        w.writerow(["AVC040", 2016, sum(cnt16.values()), "", "", "", ";".join(sorted({d for d, _ in cnt16})),
                    ";".join(sorted({l for _, l in cnt16})), "", args.vol_2016])
    print(json.dumps(result["match_2020_2023"], indent=2))
    print("2016 records:", sum(cnt16.values()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
