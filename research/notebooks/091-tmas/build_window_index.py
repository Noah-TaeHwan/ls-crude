#!/usr/bin/env python3
"""DATA-05 후속 처리 — 2015–2018 AVC040 창(window) 인덱스 빌더 + 영수증 렌더러.

서브커맨드:
  quality  : 새 인덱스 런의 월별 품질 롤업 monthly_quality.csv/.json (2015-01..2018-12,
             2016-03은 앞 런 0757 인덱스에서 재사용 — DATA-03 규약 재사용)
  daily    : avc040_daily_all.csv — 2015–2018 + (재사용) 2020-03·2023 12개월
  receipts : raw README.md / index README.md / receipt.sha256 생성

기존 parse_volume.py·monthly_quality.py 산출물만 읽는다. 다운로드·실험 없음. stdlib만.
"""

from __future__ import annotations

import argparse
import calendar
import csv
import datetime as dt
import hashlib
import json
import os
import re
import sys

TPS = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(TPS, "..", "..", ".."))
sys.path.insert(0, TPS)
import monthly_quality  # noqa: E402

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun",
          "jul", "aug", "sep", "oct", "nov", "dec"]
RUN_ID = "20260911T123706Z"
RAW_DIR = os.path.join(REPO, "research/gathering/raw/091-tmas", RUN_ID)
IDX_DIR = os.path.join(REPO, "research/indexes/091-tmas", RUN_ID)
PRIOR_0757 = os.path.join(REPO, "research/indexes/091-tmas/20260911T075705Z")
PRIOR_0825 = os.path.join(REPO, "research/indexes/091-tmas/20260911T082500Z")
BASE_TOTAL = 370845364  # DATA-02+03 누적 (B)
CAP = 2147483648        # 2 GiB


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def rel(path: str) -> str:
    return os.path.relpath(path, REPO)


def us_dst_map(years):
    """미국 DST 전이일: 3월 2번째 일요일 개시, 11월 1번째 일요일 종료."""
    out = {}
    for y in years:
        def nth_sun(n, month):
            days = [d for d in calendar.Calendar().itermonthdates(y, month)
                    if d.month == month and d.weekday() == 6]
            return days[n - 1].isoformat()
        out[f"{y}-03"] = nth_sun(2, 3)
        out[f"{y}-11"] = nth_sun(1, 11)
    return out


def md_table(headers, rows) -> str:
    lines = ["| " + " | ".join(headers) + " |",
             "|" + "|".join([" --- " if i == 0 else " ---: " if i > 0 and _numeric_col(i, rows)
                             else " --- " for i in range(len(headers))]) + "|"]
    for r in rows:
        lines.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(lines)


def _numeric_col(i, rows):
    return False  # 전체 좌측 정렬(기존 영수증과 동일한 단순 표기)


# ── quality ──────────────────────────────────────────────────────────────────

def cmd_quality(args) -> int:
    for k, v in us_dst_map(range(2015, 2019)).items():
        monthly_quality.DST_DATES.setdefault(k, v)
    rows, missing = [], []
    for y in range(2015, 2019):
        for mi, mon in enumerate(MONTHS, 1):
            label = f"{y}-{mi:02d}"
            d = args.prior_0757 if label == "2016-03" else args.run_dir
            qp, hp = monthly_quality.month_files(d, y, mi)
            if not qp or not hp:
                missing.append(label)
                continue
            row = monthly_quality.summarize(label, qp, hp)
            # 파서의 per-direction missing_days(전체 달 기준)를 합집합으로 재계산 —
            # summarize()는 [first..last] 밖 꼬리 결측을 놓친다.
            q = json.load(open(qp, encoding="utf-8"))
            n_days = calendar.monthrange(y, mi)[1]
            all_days = set(range(1, n_days + 1))
            present = set()
            for v in q["station"]["days_by_direction"].values():
                if v["first"] is not None:
                    present |= all_days - set(v["missing_days"])
            row["days_present"] = len(present)
            row["missing_dates"] = ";".join(f"{y}-{mi:02d}-{x:02d}" for x in sorted(all_days - present))
            rows.append({"month": label, "avc040_present": q["station"]["records"] > 0, **row})
    fields = ["month", "avc040_present"] + [k for k in rows[0] if k not in ("month", "avc040_present")]
    with open(f"{args.out_prefix}.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    json.dump({"window": "2015-01..2018-12", "months": rows, "missing_months": missing},
              open(f"{args.out_prefix}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    for r in rows:
        print(f"{r['month']} {'PRESENT' if r['avc040_present'] else 'ABSENT '} "
              f"days={r['days_present']:>2} miss={r['missing_dates'] or '-'} rec={r['records']:>3} "
              f"dirs={r['directions']} lanes={r['lanes']} zero={r['zero_hours']} "
              f"min={r['min_hourly_veh']} max={r['max_hourly_veh']} dst={r['dst_overlap']}")
    print("missing_months:", missing or "none")
    print(f"rows={len(rows)} -> {args.out_prefix}.csv/.json")
    return 0


# ── daily ────────────────────────────────────────────────────────────────────

def read_rows(path):
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def cmd_daily(args) -> int:
    sources = []
    for y in range(2015, 2019):
        for mi in range(1, 13):
            d = args.prior_0757 if (y, mi) == (2016, 3) else args.run_dir
            sources.append((y, mi, d))
    sources.append((2020, 3, args.prior_0825))
    for mi in range(1, 13):
        sources.append((2023, mi, args.prior_0825))

    groups, covered, missing = {}, [], []
    for y, mi, d in sources:
        p = os.path.join(d, f"avc040_{MONTHS[mi - 1]}{y}_daily.csv")
        if not os.path.exists(p):
            missing.append(f"{y}-{mi:02d}")
            continue
        covered.append(f"{y}-{mi:02d}")
        for r in read_rows(p):
            groups.setdefault((r["date"], r["direction"]), []).append(r)
    out = []
    for date, direction in sorted(groups):
        rs = groups[(date, direction)]
        l0 = [r for r in rs if r.get("lane") == "0"]
        pool = l0 if l0 else rs  # lane 0(총계)가 있으면 그것만; 없으면 차선 합산
        totals = [int(r["day_total_veh"]) for r in pool if r.get("day_total_veh") not in (None, "")]
        out.append({
            "date": date, "direction": direction,
            "day_total_veh": sum(totals) if totals else "",
            "hours_present": max(int(r["hours_present"]) for r in rs),
            "hours_missing": max(int(r["hours_missing"]) for r in rs),
        })
    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["date", "direction", "day_total_veh",
                                           "hours_present", "hours_missing"])
        w.writeheader()
        w.writerows(out)
    print(f"covered_months={len(covered)} missing_daily_sources={missing or 'none'}")
    print(f"rows={len(out)} range={out[0]['date']}..{out[-1]['date']} -> {rel(args.out)}")
    return 0


# ── receipts ─────────────────────────────────────────────────────────────────

def parse_log_times(path):
    start = end = None
    if os.path.exists(path):
        text = open(path, encoding="utf-8").read()
        m = re.search(r"START (\S+)", text)
        start = m.group(1) if m else None
        m = re.search(r"(?:PARSE )?DONE (\S+)", text)
        end = m.group(1) if m else None
    return start, end


def cmd_receipts(args) -> int:
    raw, idx = args.raw_dir, args.index_dir
    manifest = json.load(open(os.path.join(raw, "download_manifest.json"), encoding="utf-8"))
    entries = manifest["entries"]
    cum = sum(int(e.get("bytes", 0)) for e in entries.values())
    new_bytes = cum - BASE_TOTAL
    new_entries = [e for e in entries.values() if e["path"].startswith(raw.rstrip("/") + "/")]

    def ym(u):
        m = re.search(r"/(\d{4})/([a-z]{3})_\1_ccs_data\.zip$", u)
        return (int(m.group(1)), MONTHS.index(m.group(2)) + 1)  # 1-based month
    new_entries.sort(key=lambda e: ym(e["url"]))

    dst = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    dl_start, _ = parse_log_times(os.path.join(raw, "logs/download.log"))
    p_start, p_end = parse_log_times(os.path.join(raw, "logs/parse.log"))
    done = open(os.path.join(raw, "DONE"), encoding="utf-8").read().strip()
    dl_log = open(os.path.join(raw, "logs/download.log"), encoding="utf-8").read()
    fails = len(re.findall(r"^FAIL ", dl_log, re.M))
    oks = len(re.findall(r"^OK attempt=", dl_log, re.M))
    retries = len(re.findall(r"^RETRY_", dl_log, re.M))
    done_ts = done.split()[1] if " " in done else dst
    pct = 100.0 * cum / CAP
    checks = re.findall(r"^CHECK .*projected_final=(\d+) cap=(\d+)", dl_log, re.M)
    proj_txt = (f"마지막 점검(n={len(checks) * 5}) 투영 최종 {int(checks[-1][0]):,} B, "
                f"cap {int(checks[-1][1]):,} B") if checks else "점검 기록 없음"

    # 품질 JSON에서 추출 파일 정보 수집
    qfiles = {}
    for y in range(2015, 2019):
        for mi, mon in enumerate(MONTHS, 1):
            if (y, mon) == (2016, "mar"):
                continue
            qp = os.path.join(idx, f"avc040_{mon}{y}_quality.json")
            if os.path.exists(qp):
                qfiles[(y, mi)] = json.load(open(qp, encoding="utf-8"))

    rights = (
        "- 이 런에서 권리 페이지를 새로 받지 않았다. 앞 런 `../20260911T075705Z/rights/` 기록"
        "(2026-09-11 07:57–07:58 UTC)을 근거로 쓴다: 공식 페이지 "
        "<https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/> HTTP 200, ©·이용제한 "
        "표기 없음; `transportation.gov/web-policies`·`highways.dot.gov/about/policies-notices` "
        "정책 페이지는 각각 403(원문 보존, 재시도·우회 없음) → **재배포 조건 미확인**. "
        "미국 연방정부 공개물(TMAS). 로컬 연구 분석용 보관만, 재배포 없음."
    )

    # ── raw README ──
    z_rows = [(os.path.basename(e["path"]), e["url"], f"{int(e['bytes']):,}", e["sha256"],
               e.get("last_modified") or "-", e["downloaded_at_utc"]) for e in new_entries]
    x_rows = []
    for e in new_entries:
        y, mi = ym(e["url"])
        q = qfiles.get((y, mi))
        if not q:
            x_rows.append((os.path.basename(e["path"]).replace(".zip", " (TRUNC)"), "-", "-", "-", "-"))
            continue
        f = q["file"]
        name = os.path.basename(f["path"])
        fl = q["file_level"]
        x_rows.append((name, f"{int(f['bytes']):,}", f["sha256"],
                       f"{fl['total_records']:,}",
                       f"{fl['observation_date_min']}..{fl['observation_date_max']}"))

    raw_md = f"""# 091 TMAS — FHWA 연속교통 2015–2018 월별 확장 (DATA-05)

| 항목 | 값 |
| --- | --- |
| Run ID | `{RUN_ID}` |
| 수집 시각 | 다운로드 {dl_start}–{done_ts} UTC, 파싱 {p_start}–{p_end} UTC |
| 작업 루트 | 저장소 루트(프로젝트 상대경로) |
| 목적 | AVC040 기준 2015–2018 47개월 카운트 패널 확장 (2016-03은 앞 런 보유분 재사용) |
| 상태 | 수집·압축해제·파싱 완료 (`{done}`). URL 실패 {fails}건, 재시도 {retries}건, OK {oks}건 |
| 누적 다운로드 | 이 런 {new_bytes:,} B + 앞선 런 370,845,364 B = **{cum:,} B** (2 GiB의 {pct:.2f}%) |

## 권리·출처 근거

{rights}

## 다운로드 목록 ({len(new_entries)}건, 전부 HTTP 200 · 1회 시도)

{md_table(["파일", "URL", "bytes", "SHA-256", "Last-Modified", "수집(UTC)"], z_rows)}

- 실패·중단 없음: `logs/download.log`에 `FAIL` {fails}건, `STOP_CAP`·`STOP_PROJECTED` 없음. 5개마다 누적 캡 점검 — {proj_txt}.
- `mar_2016` zip은 앞선 런(DATA-02) 보유분을 manifest dedup으로 재다운로드하지 않았고, 요청 목록에서도 제외했다(총 47건).

## 추출 파일 ({len(x_rows)}건, zip에서 OK_* 멤버만)

{md_table(["파일", "bytes", "SHA-256", "레코드", "관측일 범위"], x_rows)}

## 정확한 명령

```bash
# 1) 2015–2018 47개월 순차 수집 + OK_* 추출 (driver: URL마다 download.py, 5개마다 캡 점검)
bash research/gathering/raw/091-tmas/{RUN_ID}/run_download.sh

# 2) 47개월 AVC040 파싱 (DATA-03과 동일 명령·출력 규약; 2016-03 제외)
bash research/gathering/raw/091-tmas/{RUN_ID}/run_parse.sh

# 3) 품질 롤업 / 통합 일별 CSV / 영수증
python3 research/notebooks/091-tmas/build_window_index.py quality \\
  --run-dir research/indexes/091-tmas/{RUN_ID} \\
  --prior-0757 research/indexes/091-tmas/20260911T075705Z \\
  --out-prefix research/indexes/091-tmas/{RUN_ID}/monthly_quality
python3 research/notebooks/091-tmas/build_window_index.py daily \\
  --run-dir research/indexes/091-tmas/{RUN_ID} \\
  --prior-0757 research/indexes/091-tmas/20260911T075705Z \\
  --prior-0825 research/indexes/091-tmas/20260911T082500Z \\
  --out research/indexes/091-tmas/{RUN_ID}/avc040_daily_all.csv
python3 research/notebooks/091-tmas/build_window_index.py receipts \\
  --raw-dir research/gathering/raw/091-tmas/{RUN_ID} \\
  --index-dir research/indexes/091-tmas/{RUN_ID}
```

## 형식 경계 (실측)

- 2015–2018 47개월 OK 파일 전부 **legacy 고정폭(`fixed_legacy`)**. 파서 자동 판별 결과이며, DATA-03에서 실측한 2016·2020 고정폭 / 2023 파이프와 일치한다(FHWA 페이지 "2020 데이터셋부터 파이프" 문장과도 일치).
- 2016-03은 이 런에서 받지 않았다(앞 런 보유). 파싱도 재사용 인덱스 수치를 쓴다.

## 재취득 (re-acquisition)

- 각 zip URL·HTTP 상태·Last-Modified·SHA-256은 `download_manifest.json`에 원장으로 남아 있다. 재취득은 같은 URL을 `research/notebooks/091-tmas/download.py`로 다시 요청한다(manifest dedup으로 보유분은 재다운로드하지 않음).
- 무결성 검증: `shasum -a 256 -c research/indexes/091-tmas/{RUN_ID}/receipt.sha256` (레포 루트 기준 상대경로).
- 인덱스(월별 품질·통합 일별 CSV·영수증): `research/indexes/091-tmas/{RUN_ID}/README.md`
"""

    open(os.path.join(raw, "README.md"), "w", encoding="utf-8").write(raw_md)

    # ── index README ──
    inp_rows = [(os.path.basename(e["path"]), f"{int(e['bytes']):,}", e["sha256"],
                 e["downloaded_at_utc"]) for e in new_entries]
    x2_rows = [(r[0], r[1], r[2]) for r in x_rows]
    prior_inputs = [
        "research/gathering/raw/091-tmas/20260911T082500Z/download_manifest.json",
    ] + [f"research/indexes/091-tmas/20260911T075705Z/avc040_mar2016_{k}.{ext}"
         for k, ext in [("quality", "json"), ("hourly", "csv"), ("daily", "csv")]] \
      + ["research/indexes/091-tmas/20260911T082500Z/avc040_mar2020_daily.csv"] \
      + [f"research/indexes/091-tmas/20260911T082500Z/avc040_{m}2023_daily.csv" for m in MONTHS]
    prior_rows = [(p, f"{os.path.getsize(os.path.join(REPO, p)):,}",
                   sha256_file(os.path.join(REPO, p))) for p in prior_inputs]
    code_paths = [
        "research/notebooks/091-tmas/download.py",
        "research/notebooks/091-tmas/parse_volume.py",
        "research/notebooks/091-tmas/monthly_quality.py",
        "research/notebooks/091-tmas/build_window_index.py",
        f"research/gathering/raw/091-tmas/{RUN_ID}/run_download.sh",
        f"research/gathering/raw/091-tmas/{RUN_ID}/run_parse.sh",
    ]
    code_rows = [(p, f"{os.path.getsize(os.path.join(REPO, p)):,}",
                  sha256_file(os.path.join(REPO, p))) for p in code_paths]
    out_files = []
    for root, _dirs, files in os.walk(idx):
        for fn in files:
            if fn == "receipt.sha256":
                continue
            out_files.append(os.path.join(root, fn))
    out_files.sort()
    out_rows = [(rel(p), f"{os.path.getsize(p):,}", sha256_file(p)) for p in out_files]

    # receipt에 들어갈 전체 파일 목록(README류 포함, receipt.sha256 자신 제외)
    receipt_paths = []
    for root, _dirs, files in os.walk(raw):
        for fn in files:
            if fn == "download_manifest.json.tmp":
                continue
            receipt_paths.append(os.path.join(root, fn))
    for root, _dirs, files in os.walk(idx):
        for fn in files:
            if fn == "receipt.sha256":
                continue
            receipt_paths.append(os.path.join(root, fn))
    receipt_paths += [os.path.join(REPO, p) for p in prior_inputs] + [os.path.join(REPO, p) for p in code_paths]
    receipt_paths.append(os.path.join(idx, "README.md"))  # 아래에서 쓴 뒤 해시된다
    receipt_paths = list(dict.fromkeys(receipt_paths))    # 드라이버가 raw walk와 중복되는 것 제거
    n_receipt = len(receipt_paths)

    idx_md = f"""# 091 TMAS 인덱스 영수증 — {RUN_ID} (DATA-05)

이 런의 입력→코드→출력 SHA-256 영수증이다. 전체 {n_receipt}행은 [`receipt.sha256`](receipt.sha256) (레포 루트 기준 상대경로)이며 다음으로 검증한다:

```bash
shasum -a 256 -c research/indexes/091-tmas/{RUN_ID}/receipt.sha256
```

월별 품질 표는 [`monthly_quality.csv`](monthly_quality.csv)(+`.json`), 통합 일별 패널은 [`avc040_daily_all.csv`](avc040_daily_all.csv)이다.

## 1. 입력 (input) — 이 런 다운로드 {len(new_entries)}건

{md_table(["파일", "bytes", "SHA-256", "수집(UTC)"], inp_rows)}

## 2. 입력 (input) — 이 런 zip에서 추출한 OK_* 원본 {len(x2_rows)}건

{md_table(["파일", "bytes", "SHA-256"], x2_rows)}

## 3. 입력 (input) — 앞선 런 산출물에서 읽은 파일 {len(prior_rows)}건

{md_table(["파일", "bytes", "SHA-256"], prior_rows)}

## 4. 코드 (code)

{md_table(["파일", "bytes", "SHA-256"], code_rows)}

## 5. 출력 (output) {len(out_rows)}건 + 이 README(receipt.sha256 포함)

{md_table(["파일", "bytes", "SHA-256"], out_rows)}

## 6. 메모

- **AVC040 전무 월 3개:** 2016-09·2016-10·2016-11은 AVC040 레코드 0건(존재하지 않음). `monthly_quality`에서 `avc040_present=false`, `days_present=0`, 결측일=그 달 전 날짜로 기록했다(보간 없음).
- **DST:** 2015-03-08·2015-11-01·2016-03-13·2016-11-06·2017-03-12·2017-11-05·2018-03-11·2018-11-04 전이일과 겹치는 결측은 `dst_overlap=true`로만 표시한다. **상관 기록, 원인 미확정.**
- 단위는 파일의 hour 필드 그대로 vehicles/hour이며 환산·보간·대체 없다. `lane0+laneN` 공존 그룹은 파일 수준 감사값이며 AVC040 자체는 차선 1만 존재.
- `avc040_daily_all.csv` 커버리지: **2015-01..2018-12 + 2020-03 + 2023-01..2023-12**(61개 달; 2019·2021·2022 미포함). 컬럼: `date,direction,day_total_veh,hours_present,hours_missing`. (date,direction)당 lane 0(총계) 행이 있으면 lane 0만, 없으면 차선 합산.
- 2016-03·2020-03·2023 12개월의 일별 행은 앞선 런 인덱스 산출물에서 읽었다(재파싱 없음).
"""

    open(os.path.join(idx, "README.md"), "w", encoding="utf-8").write(idx_md)

    # ── receipt.sha256 (README류가 모두 쓰인 뒤 해시) ──
    receipt_lines = sorted(f"{sha256_file(p)}  {rel(p)}" for p in receipt_paths)
    open(os.path.join(idx, "receipt.sha256"), "w", encoding="utf-8").write("\n".join(receipt_lines) + "\n")
    print(f"raw README, index README, receipt.sha256 ({len(receipt_lines)} lines) written")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    q = sub.add_parser("quality")
    q.add_argument("--run-dir", default=IDX_DIR)
    q.add_argument("--prior-0757", default=PRIOR_0757)
    q.add_argument("--out-prefix", default=os.path.join(IDX_DIR, "monthly_quality"))
    q.set_defaults(fn=cmd_quality)

    d = sub.add_parser("daily")
    d.add_argument("--run-dir", default=IDX_DIR)
    d.add_argument("--prior-0757", default=PRIOR_0757)
    d.add_argument("--prior-0825", default=PRIOR_0825)
    d.add_argument("--out", default=os.path.join(IDX_DIR, "avc040_daily_all.csv"))
    d.set_defaults(fn=cmd_daily)

    r = sub.add_parser("receipts")
    r.add_argument("--raw-dir", default=RAW_DIR)
    r.add_argument("--index-dir", default=IDX_DIR)
    r.set_defaults(fn=cmd_receipts)

    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
