#!/usr/bin/env python3
"""FHWA TMAS 월별 연속교통(.VOL) 파서 + 품질 점검 — 표준 라이브러리만.

두 실제 형식을 지원한다(2026-09-11 OK 실측):
- 2016 legacy fixed-width: [0]='3', [1:3]=state, [3:5]=f_system,
  [5:11]=station_id, [11]=dir, [12]=lane, [13:15]=YY, [15:17]=MM,
  [17:19]=DD, [19]=dow(Sun=1), [20:140]=24×5자리 시간별 볼륨, [140]=여분 1자.
- 2023 pipe: 헤더 1행(record_type|...|hour_00..hour_23), 레코드 'V|...'.
  끝에 구분자만 있는 경우가 있어 trailing empty 1개는 제거.

품질 점검: 관측일 범위/방향/차선/단위/중복(lane 0 vs lane별)/결측(빈 셀)을 실측 기록.
중복 방지: 같은 (station,date,dir,hour)에 lane 0(합계)과 lane별 레코드가 함께 있으면
lane 0만 사용해야 한다. 여기서는 존재 여부를 감사(audit)만 한다.

사용:
  python3 parse_volume.py --vol FILE --year YYYY --station AVC040 \
      --out-hourly h.csv --out-daily d.csv --out-quality q.json
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict

DOW_NAMES = {1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat"}


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_fixed(line: str):
    """2016 legacy fixed-width 한 줄 -> dict 또는 None."""
    if len(line) < 140 or line[0] != "3":
        return None
    station = line[5:11].strip()
    try:
        yy = int(line[13:15]); mm = int(line[15:17]); dd = int(line[17:19])
    except ValueError:
        return None
    year = 2000 + yy if yy < 90 else 1900 + yy
    hours = []
    for h in range(24):
        cell = line[20 + 5 * h:25 + 5 * h]
        cell = cell.strip()
        if cell == "" or not cell.isdigit():
            hours.append(None)
        else:
            hours.append(int(cell))
    return {
        "station_id": station,
        "state_fips": line[1:3],
        "f_system": line[3:5].strip(),
        "direction": line[11],
        "lane": line[12].strip(),
        "year": year, "month": mm, "day": dd, "day_of_week": line[19],
        "hours": hours,
        "trailing_char": line[140] if len(line) > 140 else "",
    }


def parse_pipe(lines):
    """2023 pipe 파일 -> (records, meta). 첫 줄 헤더 사용."""
    header = [h.strip() for h in lines[0].split("|")]
    hour_idx = {}
    for i, name in enumerate(header):
        m = re.fullmatch(r"hour_(\d{2})", name)
        if m:
            hour_idx[int(m.group(1))] = i
    out = []
    dropped_trailing = 0
    for ln in lines[1:]:
        p = ln.split("|")
        if len(p) == len(header) + 1 and p[-1] == "":
            p = p[:-1]
            dropped_trailing += 1
        if len(p) != len(header):
            continue
        rec = dict(zip(header, p))
        hours = []
        for h in range(24):
            cell = rec.get(f"hour_{h:02d}", "")
            hours.append(int(cell) if cell.strip().isdigit() else None)
        out.append({
            "station_id": rec.get("station_id", "").strip(),
            "state_fips": rec.get("state_code", ""),
            "f_system": rec.get("f_system", "").strip(),
            "direction": rec.get("travel_dir", "").strip(),
            "lane": rec.get("travel_lane", "").strip(),
            "year": int(rec["year_record"]), "month": int(rec["month_record"]),
            "day": int(rec["day_record"]), "day_of_week": rec.get("day_of_week", ""),
            "hours": hours,
        })
    return out, {"header_fields": len(header), "trailing_empty_dropped": dropped_trailing}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--vol", required=True)
    ap.add_argument("--year", type=int, required=True)
    ap.add_argument("--station", required=True)
    ap.add_argument("--out-hourly", required=True)
    ap.add_argument("--out-daily", required=True)
    ap.add_argument("--out-quality", required=True)
    args = ap.parse_args()

    raw = open(args.vol, encoding="utf-8", errors="replace").read()
    lines = [ln for ln in raw.splitlines() if ln.strip()]
    meta = {"path": args.vol, "bytes": len(raw.encode("utf-8")), "sha256": sha256_file(args.vol)}

    if lines[0].startswith("record_type|"):
        fmt = "pipe_2023"
        records, pmeta = parse_pipe(lines)
        meta.update(pmeta)
    else:
        fmt = "fixed_legacy"
        records = [r for r in (parse_fixed(ln) for ln in lines) if r]

    # 파일 전체 감사
    all_stations = Counter(r["station_id"] for r in records)
    rec_types = Counter(r["station_id"][:3] for r in records)
    lane_counter = Counter(r["lane"] for r in records)
    fsystem_counter = Counter(r["f_system"] for r in records)
    date_counter = Counter((r["year"], r["month"], r["day"]) for r in records)
    date_min = min(date_counter); date_max = max(date_counter)
    # lane0 감사: (station,date,dir,hour)에 lane0과 lane>0 공존 여부
    lane_group = defaultdict(set)
    for r in records:
        key = (r["station_id"], r["year"], r["month"], r["day"], r["direction"])
        has0 = r["lane"] == "0"
        has_specific = r["lane"] not in ("0", "")
        lane_group[key].add("lane0" if has0 else ("laneN" if has_specific else "other"))
    both = sum(1 for v in lane_group.values() if "lane0" in v and "laneN" in v)
    dup_keys = Counter(
        (r["station_id"], r["year"], r["month"], r["day"], r["direction"], r["lane"])
        for r in records
    )
    dup_count = sum(c - 1 for c in dup_keys.values() if c > 1)

    # 선택 역 품질
    sel = [r for r in records if r["station_id"] == args.station]
    per_dir = defaultdict(list)
    missing_hours = 0
    zero_hours = 0
    total_hours = 0
    for r in sel:
        per_dir[r["direction"]].append(r)
        for v in r["hours"]:
            total_hours += 1
            if v is None:
                missing_hours += 1
            elif v == 0:
                zero_hours += 1

    days_by_dir = {}
    import calendar
    months = sorted(set(r["month"] for r in sel))
    month_days = calendar.monthrange(args.year, months[0])[1] if len(months) == 1 else None
    for d, rs in sorted(per_dir.items()):
        days = sorted(set(r["day"] for r in rs))
        days_by_dir[d] = {"days_present": len(days), "first": days[0] if days else None,
                          "last": days[-1] if days else None,
                          "missing_days": [x for x in range(1, (month_days or 31) + 1) if x not in days] if month_days else []}

    # 일별 집계(방향/차선별)
    daily_rows = []
    for r in sorted(sel, key=lambda r: (r["day"], r["direction"], r["lane"])):
        vals = [v for v in r["hours"] if v is not None]
        daily_rows.append({
            "station_id": r["station_id"], "date": f"{r['year']:04d}-{r['month']:02d}-{r['day']:02d}",
            "day_of_week": r["day_of_week"], "direction": r["direction"], "lane": r["lane"],
            "hours_present": len(vals), "hours_missing": 24 - len(vals),
            "day_total_veh": sum(vals) if vals else None,
        })

    hourly_rows = []
    for r in sel:
        for h, v in enumerate(r["hours"]):
            if v is not None:
                hourly_rows.append({
                    "station_id": r["station_id"], "date": f"{r['year']:04d}-{r['month']:02d}-{r['day']:02d}",
                    "direction": r["direction"], "lane": r["lane"], "hour": h, "volume_veh": v,
                })

    with open(args.out_hourly, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["station_id", "date", "direction", "lane", "hour", "volume_veh"])
        w.writeheader(); w.writerows(hourly_rows)
    with open(args.out_daily, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["station_id", "date", "day_of_week", "direction", "lane",
                                           "hours_present", "hours_missing", "day_total_veh"])
        w.writeheader(); w.writerows(daily_rows)

    quality = {
        "format": fmt,
        "file": meta,
        "file_level": {
            "total_records": len(records),
            "unique_stations": len(all_stations),
            "record_prefix_types": dict(rec_types.most_common(6)),
            "lane_distribution": dict(lane_counter),
            "f_system_distribution": dict(fsystem_counter.most_common(10)),
            "observation_date_min": f"{date_min[0]:04d}-{date_min[1]:02d}-{date_min[2]:02d}",
            "observation_date_max": f"{date_max[0]:04d}-{date_max[1]:02d}-{date_max[2]:02d}",
            "duplicate_station_day_dir_lane_keys": dup_count,
            "lane0_and_laneN_coexist_groups": both,
        },
        "station": {
            "station_id": args.station,
            "records": len(sel),
            "f_system_values": sorted(set(r["f_system"] for r in sel)),
            "directions": sorted(set(r["direction"] for r in sel)),
            "lanes": sorted(set(r["lane"] for r in sel)),
            "hours_total_cells": total_hours,
            "hours_missing_cells": missing_hours,
            "hours_zero_cells": zero_hours,
            "days_by_direction": days_by_dir,
            "day_of_week_map": {str(k): v for k, v in DOW_NAMES.items()},
        },
        "units": "vehicles per hour (파일 hour 필드 그대로; 환산 없음)",
        "timing": {
            "observation_dates": f"{meta_path_dates(daily_rows)}",
        },
    }
    with open(args.out_quality, "w", encoding="utf-8") as fh:
        json.dump(quality, fh, ensure_ascii=False, indent=2)

    print(f"format={fmt} records={len(records)} unique_stations={len(all_stations)}")
    print(f"station={args.station} records={len(sel)} dirs={sorted(set(r['direction'] for r in sel))} "
          f"lanes={sorted(set(r['lane'] for r in sel))}")
    print(f"missing_hour_cells={missing_hours}/{total_hours} zero_hour_cells={zero_hours}")
    for d, dd in sorted(days_by_dir.items()):
        print(f"  dir={d} days={dd['days_present']} missing_days={dd['missing_days']}")
    print(f"file dup keys={dup_count} lane0+laneN coexist groups={both}")
    return 0


def meta_path_dates(daily_rows):
    ds = sorted(set(r["date"] for r in daily_rows))
    return f"{ds[0]}..{ds[-1]}" if ds else "none"


if __name__ == "__main__":
    sys.exit(main())
