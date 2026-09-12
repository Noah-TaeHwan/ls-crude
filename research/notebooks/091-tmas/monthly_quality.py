#!/usr/bin/env python3
"""FHWA TMAS AVC040 월별 품질 요약 — parse_volume.py 산출물을 한 표로 모은다.

입력: avc040_<mon><year>_quality.json + avc040_<mon><year>_hourly.csv
출력: monthly_quality.csv (월 1행, 실제 측정값만) + monthly_quality.json
stdlib만 사용. 결측은 결측대로 기록(보간·대체 없음).

DST 전이일(미국): 2016-03-13, 2020-03-08, 2023-03-12(개시) / 2023-11-05(종료).
missing_dates가 DST 전이일과 겹치면 dst_overlap=true로만 표시한다.
상관은 기록하되 원인은 단정하지 않는다.
"""

from __future__ import annotations

import csv
import glob
import json
import sys
from collections import Counter

DST_DATES = {
    "2016-03": "2016-03-13",
    "2020-03": "2020-03-08",
    "2023-03": "2023-03-12",
    "2023-11": "2023-11-05",
}


def month_files(directory: str, year: int, month: int):
    abbr = ["jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec"][month - 1]
    q = glob.glob(f"{directory}/avc040_{abbr}{year}_quality.json")
    h = glob.glob(f"{directory}/avc040_{abbr}{year}_hourly.csv")
    return (q[0] if q else None), (h[0] if h else None)


def summarize(label: str, qpath: str, hpath: str) -> dict:
    q = json.load(open(qpath))
    st = q["station"]
    fl = q["file_level"]
    ddir = st.get("days_by_direction", {})
    # union of present days across directions
    present = set()
    for v in ddir.values():
        # days_present implies 1..last minus missing; reconstruct from first/last/missing
        first, last = v["first"], v["last"]
        missing = set(v["missing_days"])
        if first is not None:
            present |= {d for d in range(first, last + 1) if d not in missing}
    missing_union = sorted(set(range(1, max(present) + 1)) - present) if present else []
    # station-level duplicates + min/max from hourly csv
    keys = Counter()
    vals = []
    lane0_rows = 0
    with open(hpath, newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            keys[(r["date"], r["direction"], r["lane"], r["hour"])] += 1
            vals.append(int(r["volume_veh"]))
            if r["lane"] == "0":
                lane0_rows += 1
    dup_station = sum(c - 1 for c in keys.values() if c > 1)
    dst = DST_DATES.get(label)
    missing_iso = [f"{label[:4]}-{label[5:7]}-{d:02d}" for d in missing_union]
    return {
        "month": label,
        "format": q["format"],
        "days_present": len(present),
        "days_by_dir": ";".join(f"{d}:{v['days_present']}" for d, v in sorted(ddir.items())),
        "missing_dates": ";".join(missing_iso),
        "records": st["records"],
        "directions": ";".join(st["directions"]),
        "lanes": ";".join(st["lanes"]),
        "units": q["units"],
        "dup_keys_file": fl["duplicate_station_day_dir_lane_keys"],
        "dup_keys_station": dup_station,
        "lane0_coexist_groups_file": fl["lane0_and_laneN_coexist_groups"],
        "station_lane0_rows": lane0_rows,
        "zero_hours": st["hours_zero_cells"],
        "min_hourly_veh": min(vals) if vals else None,
        "max_hourly_veh": max(vals) if vals else None,
        "dst_date": dst or "",
        "dst_overlap": bool(dst and dst in missing_iso),
        "source_quality": qpath,
    }


def main() -> int:
    new_dir, old_dir, out_prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    items = [("2016-03", old_dir, 2016, 3), ("2020-03", new_dir, 2020, 3)]
    items += [(f"2023-{m:02d}", new_dir, 2023, m) for m in range(1, 13)]
    rows = []
    missing = []
    for label, d, y, m in items:
        q, h = month_files(d, y, m)
        if not q or not h:
            missing.append(label)
            continue
        rows.append(summarize(label, q, h))
    fields = list(rows[0].keys())
    with open(f"{out_prefix}.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    json.dump({"months": rows, "missing_months": missing},
              open(f"{out_prefix}.json", "w", encoding="utf-8"), indent=2)
    for r in rows:
        print(f"{r['month']} {r['format']:13s} days={r['days_present']} "
              f"miss='{r['missing_dates']}' rec={r['records']} dup(st/file)={r['dup_keys_station']}/{r['dup_keys_file']} "
              f"zero={r['zero_hours']} min={r['min_hourly_veh']} max={r['max_hourly_veh']} dst_overlap={r['dst_overlap']}")
    print("missing months:", missing or "none")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
