"""ALT-20260907-02 LA항 빈 컨테이너 반출 — 공식 연도별 월표 수집·파서·대사.

표준 라이브러리만 사용한다. assert 검사를 쓰므로 -O 옵션 없이 실행한다.

    python3 research/notebooks/ALT-20260907-02/collect.py --self-test
    python3 research/notebooks/ALT-20260907-02/collect.py --collect
    python3 research/notebooks/ALT-20260907-02/collect.py --run <RUN_ID>
"""

import argparse
import csv
import hashlib
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW_BASE = ROOT / "research/gathering/raw/ALT-20260907-02"
IDX_BASE = ROOT / "research/indexes/ALT-20260907-02"
PROCESSED_BASE = ROOT / "research/data/processed/ALT-20260907-02"

BASE_URL = "https://portoflosangeles.org/business/statistics/container-statistics"
UA = "ls-crude-research/1.0 (+https://github.com/Noah-TaeHwan/ls-crude)"
TIMEOUT = 25
INTERVAL = 2.5

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
EXPECTED_HEADER = ["Loaded Imports", "Empty Imports", "Total Imports",
                   "Loaded Exports", "Empty Exports", "Total Exports",
                   "Total TEUs", "Prior Year Change"]

VALUE_RE = re.compile(r"^-?\(?\d{1,3}(,\d{3})*(\.\d+)?\)?$")
PCT_RE = re.compile(r"^-?\(?\d+(\.\d+)?%\)?$")


def utc_now():
    return datetime.now(timezone.utc)


class TableParser(HTMLParser):
    """모든 <table>을 (헤더 후보, 행) 형태로 회수한다."""

    def __init__(self):
        super().__init__()
        self.tables = []
        self._rows = None
        self._row = None
        self._cell = None

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self._rows = []
        elif tag == "tr" and self._rows is not None:
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._cell = ""

    def handle_data(self, data):
        if self._cell is not None:
            self._cell += data

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._row is not None and self._cell is not None:
            self._row.append(self._cell)
            self._cell = None
        elif tag == "tr" and self._rows is not None and self._row is not None:
            self._rows.append(self._row)
            self._row = None
        elif tag == "table" and self._rows is not None:
            self.tables.append(self._rows)
            self._rows = None


def clean(text):
    return text.replace("\xa0", " ").strip()


def parse_number(token):
    """TEU 수치. 괄호는 음수 표기. 소수는 보존하며 정수로 강제하지 않는다."""
    token = clean(token)
    if not VALUE_RE.fullmatch(token):
        raise ValueError(f"bad TEU value: {token!r}")
    negative = (token.startswith("-") or
                (token.startswith("(") and token.endswith(")")))
    token = token.strip("()").lstrip("-")
    try:
        value = Decimal(token.replace(",", ""))
    except InvalidOperation:
        raise ValueError(f"bad TEU value: {token!r}")
    return -value if negative else value


def parse_pct(token):
    token = clean(token)
    if not PCT_RE.fullmatch(token):
        raise ValueError(f"bad pct value: {token!r}")
    negative = (token.startswith("-") or
                (token.startswith("(") and token.endswith(")")))
    token = token.strip("()%").lstrip("-")
    try:
        value = Decimal(token)
    except InvalidOperation:
        raise ValueError(f"bad pct value: {token!r}")
    return -value if negative else value


def extract_monthly_table(html):
    """연도별 월표 1개만 수락한다. 0개·2개 이상이면 실패한다."""
    parser = TableParser()
    parser.feed(html)
    found = []
    for rows in parser.tables:
        if not rows:
            continue
        header = [clean(c) for c in rows[0][1:]]
        if header == EXPECTED_HEADER and clean(rows[0][0]) == "":
            found.append(rows)
    if len(found) != 1:
        raise ValueError(f"expected exactly 1 monthly table, found {len(found)}")
    return found[0]


def _isolated_total_typo(cells):
    """Total TEUs(cells[6]) 하나만 깨진 경우 나머지 깨끗한 값을 돌려준다.
    아니면 None. 격리된 월도 패널에서 제외한다(추정·수정 없음)."""
    try:
        values = [parse_number(c) for c in cells[:6]]
        pct = parse_pct(cells[7])
    except ValueError:
        return None
    try:
        parse_number(cells[6])
    except ValueError:
        pass
    else:
        return None
    if values[0] + values[1] != values[2]:
        return None
    if values[3] + values[4] != values[5]:
        return None
    return {"loaded_imports": values[0], "empty_imports": values[1],
            "total_imports": values[2], "loaded_exports": values[3],
            "empty_exports": values[4], "total_exports": values[5],
            "provider_yoy_pct": pct}


def parse_year_table(html, year, quarantined=None):
    """해당 연도의 월별 행을 파싱한다. 미래 미관측 월(8셀 전부 빈칸)은 결측으로 둔다.
    연간·회계연도 합계 행은 별도 검증용으로 분리한다.
    Total TEUs 단일 셀에만 오타가 있고 양쪽 분할 합계가 검증되면 해당 월을 격리하고
    계속한다(원본 수정·추정 금지). 그 외 파싱 실패는 그대로 물을고 앉는다."""
    rows = extract_monthly_table(html)
    months = {}
    missing = []
    annual_row = None
    fiscal_rows = {}
    for row in rows[1:]:
        label = clean(row[0])
        if label in MONTHS:
            if label in months or label in missing:
                raise ValueError(f"duplicate month: {label}")
            if len(row) != 9:
                raise ValueError(f"bad column count for {label}: {len(row)}")
            cells = [clean(c) for c in row[1:]]
            if all(c == "" for c in cells):
                missing.append(label)
                continue
            if any(c == "" for c in cells):
                raise ValueError(f"partially empty cells in {label}")
            try:
                record = {
                    "loaded_imports": parse_number(cells[0]),
                    "empty_imports": parse_number(cells[1]),
                    "total_imports": parse_number(cells[2]),
                    "loaded_exports": parse_number(cells[3]),
                    "empty_exports": parse_number(cells[4]),
                    "total_exports": parse_number(cells[5]),
                    "total_teus": parse_number(cells[6]),
                    "provider_yoy_pct": parse_pct(cells[7]),
                }
            except ValueError as exc:
                if quarantined is None:
                    raise
                # 격리 조건: Total TEUs 셀 하나만 깨졌고 나머지 7셀·양쪽 분할이 깨끗해야 한다.
                isolated = _isolated_total_typo(cells)
                if isolated is None:
                    raise
                quarantined.append({"year": year, "month": label,
                                    "bad_cell": cells[6], "error": str(exc),
                                    "clean_cells": {k: str(v) for k, v in isolated.items()}})
                continue
            months[label] = record
        elif label == f"Total Calendar Year {year}":
            if annual_row is not None:
                raise ValueError("duplicate annual row")
            cells = [clean(c) for c in row[1:]]
            if len(cells) != 8 or any(c == "" for c in cells[:7]):
                raise ValueError("bad annual row")
            annual_row = {"label": label,
                          "values": [parse_number(c) for c in cells[:7]],
                          "prior_year_change": cells[7]}
        elif label.startswith("Total Fiscal Year"):
            if label in fiscal_rows:
                raise ValueError(f"duplicate fiscal row: {label}")
            fiscal_rows[label] = [clean(c) for c in row[1:]]
        elif label == "":
            continue
        else:
            raise ValueError(f"unexpected row label: {label!r}")
    seen = set(months) | set(missing)
    if quarantined is not None:
        seen |= {q["month"] for q in quarantined if q["year"] == year}
    assert seen == set(MONTHS), f"table does not cover 12 month labels: {sorted(seen)}"
    return months, missing, annual_row, fiscal_rows


def atomic_write_json(path, payload):
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")
    tmp.replace(path)


def fetch(url, timeout=TIMEOUT):
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.status, response.read()


def collect(years, main_page=True):
    run_id = utc_now().strftime("%Y%m%dT%H%M%SZ")
    run_dir = RAW_BASE / run_id
    run_dir.mkdir(parents=True, exist_ok=False)
    receipt_path = run_dir / "request.json"
    targets = []
    if main_page:
        targets.append(("main", BASE_URL))
    targets += [(str(y), f"{BASE_URL}/historical-teu-statistics-{y}") for y in years]
    receipt = {"run_id": run_id, "candidate_id": "ALT-20260907-02",
               "started_at": utc_now().isoformat(), "user_agent": UA,
               "status": "running", "requests": []}
    atomic_write_json(receipt_path, receipt)
    try:
        for name, url in targets:
            entry = {"name": name, "url": url,
                     "started_at": utc_now().isoformat()}
            try:
                status, body = fetch(url)
                entry.update({"completed_at": utc_now().isoformat(),
                              "status": status, "bytes": len(body),
                              "sha256": hashlib.sha256(body).hexdigest()})
                if status == 200:
                    (run_dir / f"pola_{name}.html").write_bytes(body)
                else:
                    entry["error"] = f"HTTP {status}"
            except Exception as exc:  # noqa: BLE001 - 영수증에 기록이 목적
                entry.update({"completed_at": utc_now().isoformat(),
                              "status": "ERROR", "error": f"{type(exc).__name__}: {exc}"})
            receipt["requests"].append(entry)
            atomic_write_json(receipt_path, receipt)
            code = entry["status"]
            if code in (403, 429):
                receipt["status"] = "aborted"
                receipt["abort_reason"] = f"HTTP {code} at {name}; remaining requests not attempted"
                atomic_write_json(receipt_path, receipt)
                break
            time.sleep(INTERVAL)
        else:
            receipt["status"] = "complete"
            atomic_write_json(receipt_path, receipt)
    finally:
        # 중간 중단·전체 실패에도 영수증이 남는다.
        if receipt["status"] == "running":
            receipt["status"] = "interrupted"
            atomic_write_json(receipt_path, receipt)
    # run 폴더 README 뼈대 (해시·행수는 --run이 채운다)
    (run_dir / "README.md").write_text(
        f"# ALT-20260907-02 원본 {run_id}\n\nreceipt: request.json\n", encoding="utf-8")
    print(f"run {run_id}: {receipt['status']}")
    return run_id


def load_run_html(run_id):
    run_dir = RAW_BASE / run_id
    files = {}
    for path in sorted(run_dir.glob("pola_*.html")):
        files[path.stem.replace("pola_", "")] = path.read_bytes()
    return files


def parse_main_latest(html):
    """메인 페이지의 최신월 표에서 당월·전년동월 값을 회수한다(교차 대조용)."""
    parser = TableParser()
    parser.feed(html)
    wanted = {"Loaded Imports", "Loaded Exports", "Total Loaded", "Total Empty", "Total"}
    for rows in parser.tables:
        if not rows or len(rows[0]) != 5:
            continue
        head = [clean(c) for c in rows[0]]
        if not (head[1].isdigit() and head[2].isdigit() and head[3] == "Change"
                and head[4] == "% Change"):
            continue
        out = {"ref_month": head[0], "ref_year": head[1], "cmp_year": head[2]}
        for row in rows[1:]:
            if len(row) == 5 and clean(row[0]) in wanted:
                out[clean(row[0])] = {"current": clean(row[1]), "prior": clean(row[2])}
        if len(out) == 8:
            return out
    raise ValueError("main latest-month table not found")


def build_panel(run_id):
    """원본 HTML → 월별 패널·대사. 원본을 수정하지 않는다."""
    files = load_run_html(run_id)
    assert files, "no source html in run"
    panel = {}
    missing_months = {}
    quarantined_months = []
    annual_rows = {}
    fiscal_rows = {}
    main_latest = None
    for name, body in files.items():
        text = body.decode("utf-8", errors="replace")
        if name == "main":
            main_latest = parse_main_latest(text)
            continue
        year = int(name)
        months, missing, annual_row, fiscal = parse_year_table(text, year, quarantined_months)
        for i, m in enumerate(MONTHS, start=1):
            if m in months:
                key = f"{year}-{i:02d}"
                assert key not in panel, f"duplicate key {key}"
                panel[key] = months[m]
        if missing:
            missing_months[str(year)] = missing
        if annual_row is not None:
            annual_rows[str(year)] = annual_row
        if fiscal:
            fiscal_rows[str(year)] = fiscal
    ordered = sorted(panel)
    # 분모·합계 대사 (Decimal 정확 연산)
    recon = {"months": len(ordered), "import_side_ok": 0, "export_side_ok": 0,
             "grand_total_ok": 0, "mismatches": []}
    for key in ordered:
        r = panel[key]
        ok_imp = r["loaded_imports"] + r["empty_imports"] == r["total_imports"]
        ok_exp = r["loaded_exports"] + r["empty_exports"] == r["total_exports"]
        ok_tot = r["total_imports"] + r["total_exports"] == r["total_teus"]
        recon["import_side_ok"] += ok_imp
        recon["export_side_ok"] += ok_exp
        recon["grand_total_ok"] += ok_tot
        if not (ok_imp and ok_exp and ok_tot):
            recon["mismatches"].append(key)
    # 제공 Prior Year Change 대조 (같은 월 전년도 패널이 있을 때만 비교 가능)
    yoy = {"compared": 0, "matched": 0, "mismatches": []}
    for key in ordered:
        y, m = key.split("-")
        prev = f"{int(y)-1}-{m}"
        if prev in panel and panel[prev]["total_teus"] != 0:
            computed = 100 * (panel[key]["total_teus"] - panel[prev]["total_teus"]) / panel[prev]["total_teus"]
            provided = panel[key]["provider_yoy_pct"]
            yoy["compared"] += 1
            if abs(computed - provided) < Decimal("0.015"):
                yoy["matched"] += 1
            else:
                yoy["mismatches"].append({"month": key, "computed": str(computed),
                                          "provided": str(provided)})
    # 연간 합계행 vs 관측월 합계 (Decimal 정확 연산; 2026 등 YTD도 관측월 합과 비교)
    annual_check = {"compared": 0, "matched": 0, "mismatches": []}
    keys = ["loaded_imports", "empty_imports", "total_imports", "loaded_exports",
            "empty_exports", "total_exports", "total_teus"]
    for year, row in annual_rows.items():
        year_keys = [k for k in ordered if k.startswith(year + "-")]
        if not year_keys:
            continue
        annual_check["compared"] += 1
        sums = [sum(panel[k][f] for k in year_keys) for f in keys]
        if sums == row["values"]:
            annual_check["matched"] += 1
        else:
            annual_check["mismatches"].append(
                {"year": year, "months": len(year_keys),
                 "computed": [str(v) for v in sums],
                 "provided": [str(v) for v in row["values"]]})
    # 메인 최신월 표 vs 연도표 같은 달 (제공자 간 교차 대조)
    main_check = {"compared": 0, "matched": 0, "mismatches": [], "ref": None}
    if main_latest is not None:
        ref_key = f"{main_latest['ref_year']}-{MONTHS.index(main_latest['ref_month']) + 1:02d}"
        main_check["ref"] = ref_key
        if ref_key in panel:
            pairs = [("Loaded Exports", "loaded_exports"), ("Total Empty", None),
                     ("Total", "total_teus")]
            r = panel[ref_key]
            expect = {"Loaded Exports": r["loaded_exports"],
                      "Total Empty": r["empty_imports"] + r["empty_exports"],
                      "Total": r["total_teus"]}
            main_check["compared"] = len(pairs)
            for label, _ in pairs:
                if main_latest[label]["current"] == f"{expect[label]:,.2f}":
                    main_check["matched"] += 1
                else:
                    main_check["mismatches"].append(
                        {"field": label, "main_page": main_latest[label]["current"],
                         "year_page": f"{expect[label]:,.2f}"})
    return {"panel": panel, "ordered": ordered, "recon": recon, "yoy": yoy,
            "missing_months": missing_months, "quarantined_months": quarantined_months,
            "annual_rows": annual_rows,
            "fiscal_rows": fiscal_rows, "main_latest": main_latest,
            "annual_check": annual_check, "main_check": main_check}


def _fmt_teu(value):
    """표시용 TEU 소수 둘째 자리 표기. 원본은 정수·소수2자리만 존재하므로 값 변경 없음."""
    assert value.as_tuple().exponent >= -2, f"unexpected precision: {value}"
    return f"{value:.2f}"


def write_figure(idx_dir, ordered, panel):
    """월별 빈수출 비중·중간 원단위 2단 그림(SVG, 표준 라이브러리만)."""
    W, H, PAD_L, PAD_T, PANEL_H, GAP = 860, 470, 64, 26, 170, 60
    xs = list(range(len(ordered)))
    shares = []
    for key in ordered:
        r = panel[key]
        denom = r["loaded_exports"] + r["empty_exports"]
        shares.append(float(100 * r["empty_exports"] / denom))
    raw_e = [float(panel[k]["empty_exports"]) for k in ordered]
    raw_l = [float(panel[k]["loaded_exports"]) for k in ordered]

    def scale(vals, top, h):
        lo, hi = min(vals), max(vals)
        pad = (hi - lo) * 0.08 or 1
        lo -= pad
        hi += pad
        return lo, hi, lambda v, i: (PAD_L + i * (W - PAD_L - 20) / max(1, len(vals) - 1),
                                     top + h - (v - lo) / (hi - lo) * h)

    slo, shi, sxy = scale(shares, PAD_T, PANEL_H)
    rlo, rhi, rxy = scale(raw_e + raw_l, PAD_T + PANEL_H + GAP, PANEL_H)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" role="img">',
             f'<text x="{PAD_L}" y="16" font-size="13">LA항 빈수출 비중 S_m = 100 x Empty/(Empty+Loaded) — 월별 TEU (2015-01~2026-07)</text>']
    for top, lo, hi, unit in ((PAD_T, slo, shi, "%"), (PAD_T + PANEL_H + GAP, rlo, rhi, "TEU")):
        for frac, lab in ((0, f"{hi:,.1f}{unit}"), (0.5, f"{(lo+hi)/2:,.1f}{unit}"),
                          (1, f"{lo:,.1f}{unit}")):
            y = top + PANEL_H * frac
            parts.append(f'<line x1="{PAD_L}" y1="{y}" x2="{W-20}" y2="{y}" stroke="#ccc"/>'
                         f'<text x="4" y="{y+4}" font-size="10">{lab}</text>')
    # 연도 눈금
    for i, key in enumerate(ordered):
        if key.endswith("-01"):
            x = PAD_L + i * (W - PAD_L - 20) / (len(ordered) - 1)
            parts.append(f'<text x="{x}" y="{H-6}" font-size="10">{key[:4]}</text>')
    # 비중 선(결측월에서 끊음)
    d, pen = "", False
    for i, v in enumerate(shares):
        x, y = sxy(v, i)
        if not pen:
            d += f"M{x:.1f},{y:.1f}"
            pen = True
        else:
            prev_key, key = ordered[i - 1], ordered[i]
            py, pm = int(prev_key[:4]), int(prev_key[5:])
            y2, m2 = int(key[:4]), int(key[5:])
            gap = (y2 - py) * 12 + (m2 - pm)
            d += f"L{x:.1f},{y:.1f}" if gap == 1 else f"M{x:.1f},{y:.1f}"
    parts.append(f'<path d="{d}" fill="none" stroke="#1d4ed8" stroke-width="1.5"/>')
    for vals, color in ((raw_e, "#b45309"), (raw_l, "#0d9488")):
        dd = ""
        prev = None
        for i, v in enumerate(vals):
            x, y = rxy(v, i)
            key = ordered[i]
            if prev is None:
                dd += f"M{x:.1f},{y:.1f}"
            else:
                py, pm = int(prev[:4]), int(prev[5:])
                y2, m2 = int(key[:4]), int(key[5:])
                dd += (f"L{x:.1f},{y:.1f}" if (y2 - py) * 12 + (m2 - pm) == 1
                       else f"M{x:.1f},{y:.1f}")
            prev = key
        parts.append(f'<path d="{dd}" fill="none" stroke="{color}" stroke-width="1.2"/>')
    parts.append(f'<text x="{PAD_L}" y="{PAD_T + PANEL_H + GAP - 8}" font-size="11">아래: Empty Exports(주황) vs Loaded Exports(청록), TEU. '
                 "2020-11 제외(원본 Total 셀 오타). 출처: Port of Los Angeles (credit). 빈티지: 2026-09-09 수집 현재본.</text>")
    parts.append("</svg>")
    path = idx_dir / "observation.svg"
    path.write_text("\n".join(parts) + "\n", encoding="utf-8")
    return path


def write_index_artifacts(run_id, result):
    panel, ordered = result["panel"], result["ordered"]
    idx_dir = IDX_BASE / run_id
    proc_dir = PROCESSED_BASE / run_id
    proc_dir.mkdir(parents=True, exist_ok=True)
    idx_dir.mkdir(parents=True, exist_ok=True)
    out_csv = proc_dir / "monthly.csv"
    with out_csv.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["month", "loaded_imports", "empty_imports", "total_imports",
                         "loaded_exports", "empty_exports", "total_exports",
                         "total_teus", "empty_export_share_pct", "provider_yoy_pct"])
        for key in ordered:
            r = panel[key]
            denom = r["loaded_exports"] + r["empty_exports"]
            share = (100 * r["empty_exports"] / denom) if denom > 0 else ""
            writer.writerow([key, str(r["loaded_imports"]), str(r["empty_imports"]),
                             str(r["total_imports"]), str(r["loaded_exports"]),
                             str(r["empty_exports"]), str(r["total_exports"]),
                             str(r["total_teus"]),
                             (str(share) if share == "" else f"{share:.6f}"),
                             str(r["provider_yoy_pct"])])
    # 표시용 동결 JSON (앱 빌드타임 import)
    points = []
    snake_to_camel = {"loaded_imports": "loadedImports", "empty_imports": "emptyImports",
                      "total_imports": "totalImports", "loaded_exports": "loadedExports",
                      "empty_exports": "emptyExports", "total_exports": "totalExports",
                      "total_teus": "totalTeus"}
    for key in ordered:
        r = panel[key]
        denom = r["loaded_exports"] + r["empty_exports"]
        share = (100 * r["empty_exports"] / denom) if denom > 0 else None
        # 표시용 TEU는 소수 둘째 자리로 표기 정규화(값 변경 없음: 원본은 정수·소수2자리만 존재).
        point = {"month": key}
        point.update({snake_to_camel[f]: _fmt_teu(r[f]) for f in snake_to_camel})
        point["emptySharePct"] = None if share is None else f"{share:.6f}"
        points.append(point)
    display = {"candidateId": "ALT-20260907-02", "runId": run_id, "points": points}
    display_path = idx_dir / "display.json"
    display_path.write_text(json.dumps(display, ensure_ascii=False, separators=(",", ":")) + "\n",
                            encoding="utf-8")
    quality = {"candidate_id": "ALT-20260907-02", "run_id": run_id,
               "months": len(ordered), "first_month": ordered[0], "last_month": ordered[-1],
               "missing_months": result["missing_months"],
               "quarantined_months": result["quarantined_months"],
               "reconciliation": result["recon"], "provider_yoy_check": result["yoy"],
               "annual_total_check": result["annual_check"],
               "main_page_crosscheck": result["main_check"],
               "output_sha256": {}}
    for path in [out_csv, display_path]:
        quality["output_sha256"][str(path.relative_to(ROOT))] = hashlib.sha256(path.read_bytes()).hexdigest()
    fig_path = write_figure(idx_dir, ordered, panel)
    quality["output_sha256"][str(fig_path.relative_to(ROOT))] = hashlib.sha256(fig_path.read_bytes()).hexdigest()
    (idx_dir / "quality.json").write_text(json.dumps(quality, ensure_ascii=False, indent=2) + "\n",
                                          encoding="utf-8")
    return quality


def self_test():
    # 1. 정상 연도표 파싱
    good = ("<table><tr><th></th><th>Loaded Imports</th><th>Empty Imports</th>"
            "<th>Total Imports</th><th>Loaded Exports</th><th>Empty Exports</th>"
            "<th>Total Exports</th><th>Total TEUs</th><th>Prior Year Change</th></tr>"
            "<tr><td>January</td><td>483,831.25</td><td>144.00</td><td>483,975.25</td>"
            "<td>113,270.75</td><td>326,999.00</td><td>440,269.75</td>"
            "<td>924,245.00</td><td>8.02%</td></tr>"
            "<tr><td>February</td><td>413,236.25</td><td>33.00</td><td>413,269.25</td>"
            "<td>109,156.25</td><td>278,972.50</td><td>388,128.75</td>"
            "<td>801,398.00</td><td>2.55%</td></tr>"
            "<tr><td>March</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>April</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>May</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>June</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>July</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>August</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>September</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>October</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>November</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr>"
            "<tr><td>December</td><td></td><td></td><td></td><td></td>"
            "<td></td><td></td><td></td><td></td></tr></table>")
    months, missing, annual_row, fiscal_rows = parse_year_table(good, 2025)
    assert set(months) == {"January", "February"} and missing == MONTHS[2:]
    assert months["January"]["empty_exports"] == Decimal("326999.00")
    assert annual_row is None and fiscal_rows == {}
    # 실제 연도표의 마이너스 부호(-22.77%)도 수락한다.
    assert parse_pct("-22.77%") == Decimal("-22.77")
    assert parse_number("-1,234.50") == Decimal("-1234.50")
    # 표시 정규화: 정수 표기(2024-04 Empty Imports 253)는 253.00으로 표기만 맞춘다.
    assert _fmt_teu(Decimal("253")) == "253.00"
    assert _fmt_teu(Decimal("348691.25")) == "348691.25"

    # 2. 음성: 다른 종류 파일(연간 총계표)은 거부
    annual = ("<table><tr><th></th><th>2020</th><th>2021</th></tr>"
              "<tr><td>Total</td><td>9,213,396</td><td>10,677,610</td></tr></table>")
    try:
        parse_year_table(annual, 2021)
    except ValueError:
        pass
    else:
        raise AssertionError("annual table accepted")

    # 3. 음성: 필요한 월 누락 + 다음 구간 유사 행(다음 연도 표)이 있어도 통과 금지
    try:
        extract_monthly_table("<table><tr><td>January</td></tr></table>")
    except ValueError:
        pass
    else:
        raise AssertionError("month-less table accepted")

    # 4. 음성: 중복 월·잘못된 날짜·빈 값·잘못된 단위
    dup = good.replace("</table>", "<tr><td>January</td><td>1</td><td>2</td><td>3</td>"
                                   "<td>4</td><td>5</td><td>9</td><td>12</td><td>1%</td></tr></table>")
    for bad, label in [(dup, "duplicate"),
                       (good.replace("January", "Jan"), "bad month"),
                       (good.replace("483,831.25", ""), "empty"),
                       (good.replace("8.02%", "8.02 percent"), "bad unit")]:
        try:
            parse_year_table(bad, 2025)
        except ValueError:
            pass
        else:
            raise AssertionError(f"{label} accepted")

    # 4b. 음성: 일부만 빈 월행·연간행 연도 불일치·예상 밖 라벨
    partial = good.replace("483,831.25</td><td>144.00",
                           "483,831.25</td><td>")
    annual_bad = good.replace("</table>", "<tr><td>Total Calendar Year 2024</td><td>1</td>"
                                          "<td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>"
                                          "<td>7</td><td>1%</td></tr></table>")
    for bad, label in [(partial, "partial-empty"),
                       (annual_bad, "annual-year-mismatch"),
                       (good.replace("January</td>", "Janvier</td>"), "foreign-label")]:
        try:
            parse_year_table(bad, 2025)
        except (ValueError, AssertionError):
            pass
        else:
            raise AssertionError(f"{label} accepted")
    # 전부 빈 미래 월행은 결측으로 둔다(0으로 채우지 않음).
    future = good.replace("<td>February</td><td>413,236.25</td><td>33.00</td><td>413,269.25</td>"
                          "<td>109,156.25</td><td>278,972.50</td><td>388,128.75</td>"
                          "<td>801,398.00</td><td>2.55%</td>",
                          "<td>February</td><td></td><td></td><td></td><td></td>"
                          "<td></td><td></td><td></td><td></td>")
    months_future, missing_future, _, _ = parse_year_table(future, 2025)
    assert "February" not in months_future and "February" in missing_future
    # 연간 합계행 파싱
    with_annual = good.replace("</table>", "<tr><td>Total Calendar Year 2025</td><td>897,067.50</td>"
                                           "<td>177.00</td><td>897,244.50</td><td>222,427.00</td>"
                                           "<td>605,971.50</td><td>828,398.50</td><td>1,725,643.00</td>"
                                           "<td>5.00%</td></tr></table>")
    _, _, annual_ok, _ = parse_year_table(with_annual, 2025)
    assert annual_ok is not None and annual_ok["values"][6] == Decimal("1725643.00")
    # 4c. 격리: Total TEUs 단일 셀 오타는 해당 월만 격리하고 계속한다.
    typo = good.replace("924,245.00</td><td>8.02%",
                        "924,.245.00</td><td>8.02%")
    q = []
    months_typo, _, _, _ = parse_year_table(typo, 2025, q)
    assert "January" not in months_typo and len(q) == 1 and q[0]["month"] == "January"
    # 분할 셀까지 깨지면 격리가 아니라 실패한다.
    bad_split = good.replace("326,999.00</td><td>440,269.75",
                             "326,XYZ.00</td><td>440,269.75")
    try:
        parse_year_table(bad_split, 2025, [])
    except ValueError:
        pass
    else:
        raise AssertionError("non-isolated corruption quarantined")
    #    Total 열만 검사하는 순진한 검사는 통과하지만, 분할 합계 검사는 반드시 실패해야 한다.
    shifted = good.replace("326,999.00</td><td>440,269.75",
                           "326,999.01</td><td>440,269.75")
    months_shifted, _, _, _ = parse_year_table(shifted, 2025)
    r = months_shifted["January"]
    naive_ok = (r["total_exports"] == Decimal("440269.75")
                and r["total_teus"] == Decimal("924245.00"))
    strict_ok = (r["loaded_exports"] + r["empty_exports"] == r["total_exports"])
    assert naive_ok, "fixture broken: totals should still match"
    assert not strict_ok, "strict split check passed on swapped values"

    # 6. 모의 실행: 403 뒤 남은 요청을 계속하지 않고 영수증이 남는다.
    calls = {"n": 0}

    def fake_fetch(url, timeout=TIMEOUT):
        calls["n"] += 1
        if calls["n"] == 1:
            return 200, b"<html></html>"
        return 403, b"forbidden"

    real_fetch = globals()["fetch"]
    real_sleep = time.sleep
    tmp_base = globals()["RAW_BASE"]
    import tempfile
    sandbox = Path(tempfile.mkdtemp(prefix="pola-mock-"))
    try:
        globals()["fetch"] = fake_fetch
        globals()["RAW_BASE"] = sandbox
        time.sleep = lambda s: None
        run_id = collect([2099, 2100], main_page=False)
        receipt = json.loads((sandbox / run_id / "request.json").read_text())
        assert receipt["status"] == "aborted", receipt["status"]
        assert len(receipt["requests"]) == 2, "requests after 403 must not continue"
        assert (sandbox / run_id / "pola_2099.html").exists()
        assert not (sandbox / run_id / "pola_2100.html").exists()
    finally:
        globals()["fetch"] = real_fetch
        globals()["RAW_BASE"] = tmp_base
        time.sleep = real_sleep
    print("SELF-TEST PASS")


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--collect", action="store_true")
    parser.add_argument("--run", default=None)
    parser.add_argument("--years", default="2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026")
    args = parser.parse_args(argv)
    if args.self_test:
        self_test()
        return 0
    if args.collect:
        years = [int(y) for y in args.years.split(",") if y.strip()]
        collect(years)
        return 0
    if args.run:
        result = build_panel(args.run)
        quality = write_index_artifacts(args.run, result)
        print(json.dumps({"months": quality["months"],
                          "first": quality["first_month"],
                          "last": quality["last_month"],
                          "mismatches": quality["reconciliation"]["mismatches"],
                          "yoy_mismatches": len(quality["provider_yoy_check"]["mismatches"])},
                         ensure_ascii=False))
        return 0
    parser.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
