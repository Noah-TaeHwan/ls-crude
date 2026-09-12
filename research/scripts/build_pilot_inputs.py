#!/usr/bin/env python3
"""파일럿 입력 CSV 생성기 (표준 라이브러리만) — 배치 F에서 쓴 규칙 그대로.

입력 패널/시리즈는 기존 도구가 만든 산출물을 사용한다:
  traffic: notebooks/091-tmas/build_window_index.py daily → avc040_daily_all.csv
  dmr    : notebooks/091-candidates/dmr_series_build.py → dmr_series_rows.csv

사용:
  python3 build_pilot_inputs.py traffic --daily-panel <avc040_daily_all.csv> --out <traffic_avc040_daily.csv>
  python3 build_pilot_inputs.py dmr     --series     <dmr_series_rows.csv>   --out <dmr_ok0026701_001_mgd.csv>

규칙:
- traffic: (date,direction) 행을 날짜별로 합산. 결측 hour가 하나라도 있으면 value 공백(채움 없음).
  값은 정수 표기(파일럿 입력 CSV와 동일).
- dmr: permit=OK0026701, outfall=001, unit=MGD, basis=DAILY MX, 수치값만.
  available_at=ValueReceivedDate(접수일). 다른 단위·기준·시설은 합치지 않는다.
"""
from __future__ import annotations

import argparse
import csv
import sys
from collections import defaultdict


def build_traffic(panel_path: str, out_path: str) -> int:
    totals: dict[str, int] = defaultdict(int)
    missing: dict[str, int] = defaultdict(int)
    with open(panel_path, newline="") as fh:
        for row in csv.DictReader(fh):
            date = row["date"]
            totals[date] += int(float(row["day_total_veh"]))
            missing[date] += int(float(row["hours_missing"]))
    with open(out_path, "w", newline="") as fh:
        writer = csv.writer(fh, lineterminator="\n")
        writer.writerow(["date", "value"])
        for date in sorted(totals):
            value = str(totals[date]) if missing[date] == 0 else ""
            writer.writerow([date, value])
    return 0


def build_dmr(series_path: str, out_path: str) -> int:
    rows = []
    with open(series_path, newline="") as fh:
        for row in csv.DictReader(fh):
            if row.get("permit_id") != "OK0026701":
                continue
            if str(row.get("outfall", "")).zfill(3) != "001":
                continue
            if row.get("unit") != "MGD" or row.get("basis") != "DAILY MX":
                continue
            value = (row.get("value_num") or "").strip()
            if not value:
                continue
            rows.append((row["date"], value, row["received_date"]))
    rows.sort(key=lambda item: item[0])
    with open(out_path, "w", newline="") as fh:
        writer = csv.writer(fh, lineterminator="\n")
        writer.writerow(["date", "value", "available_at"])
        writer.writerows(rows)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    traffic = sub.add_parser("traffic")
    traffic.add_argument("--daily-panel", required=True)
    traffic.add_argument("--out", required=True)
    dmr = sub.add_parser("dmr")
    dmr.add_argument("--series", required=True)
    dmr.add_argument("--out", required=True)
    args = parser.parse_args()
    if args.cmd == "traffic":
        return build_traffic(args.daily_panel, args.out)
    return build_dmr(args.series, args.out)


if __name__ == "__main__":
    sys.exit(main())
