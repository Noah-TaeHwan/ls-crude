"""ALT-20260907-02 LA항 빈 컨테이너 반출 — 공식 연도별 월표 수집·파서·대사.

표준 라이브러리만 사용한다. assert 검사를 쓰므로 -O 옵션 없이 실행한다.

    python3 research/notebooks/ALT-20260907-02/collect.py --self-test
    python3 research/notebooks/ALT-20260907-02/collect.py --collect
    python3 research/notebooks/ALT-20260907-02/collect.py --run <RUN_ID>
    python3 research/notebooks/ALT-20260907-02/collect.py --figure-v2 <RUN_ID>
"""

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import time
import urllib.error
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


def _strip_sign_paren(token, kind):
    """선행 '-' 하나 또는 전체 감싸는 괄호 하나만 음수로 인정한다.
    짝없는 괄호('(12.00', '12.00)')와 '-(' 혼합은 거부한다."""
    negative = False
    if token.startswith("-"):
        negative = True
        token = token[1:]
    if "(" in token or ")" in token:
        if negative or not (token.startswith("(") and token.endswith(")")
                            and len(token) >= 2):
            raise ValueError(f"bad {kind} value: {'-' if negative else ''}{token!r}")
        negative = True
        token = token[1:-1]
    return negative, token


def parse_number(token):
    """TEU 수치. 괄호는 음수 표기. 소수는 보존하며 정수로 강제하지 않는다."""
    token = clean(token)
    if not VALUE_RE.fullmatch(token):
        raise ValueError(f"bad TEU value: {token!r}")
    negative, token = _strip_sign_paren(token, "TEU")
    try:
        value = Decimal(token.replace(",", ""))
    except InvalidOperation:
        raise ValueError(f"bad TEU value: {token!r}")
    return -value if negative else value


def parse_pct(token):
    token = clean(token)
    if not PCT_RE.fullmatch(token):
        raise ValueError(f"bad pct value: {token!r}")
    negative, token = _strip_sign_paren(token, "pct")
    token = token.rstrip("%")
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


def _record_request(receipt_path, receipt, entry):
    receipt["requests"].append(entry)
    atomic_write_json(receipt_path, receipt)


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
            except KeyboardInterrupt:
                # 사용자 중단: 해당 요청을 영수증에 남기고 즉시 raise한다.
                entry.update({"completed_at": utc_now().isoformat(),
                              "status": "INTERRUPTED",
                              "error": "KeyboardInterrupt",
                              "error_type": "KeyboardInterrupt"})
                _record_request(receipt_path, receipt, entry)
                receipt["status"] = "aborted"
                receipt["abort_reason"] = (f"KeyboardInterrupt at {name}; "
                                           "remaining requests not attempted")
                atomic_write_json(receipt_path, receipt)
                raise
            except Exception as exc:  # noqa: BLE001 - 영수증에 기록이 목적
                code = getattr(exc, "code", None)
                if isinstance(code, int):
                    # 실제 urllib.error.HTTPError: 코드 정수를 보존한다.
                    entry.update({"completed_at": utc_now().isoformat(),
                                  "status": code,
                                  "error": f"{type(exc).__name__} {code}: {exc}",
                                  "error_type": type(exc).__name__})
                else:
                    entry.update({"completed_at": utc_now().isoformat(),
                                  "status": "ERROR",
                                  "error": f"{type(exc).__name__}: {exc}",
                                  "error_type": type(exc).__name__})
            _record_request(receipt_path, receipt, entry)
            code = entry["status"]
            if code in (403, 429):
                receipt["status"] = "aborted"
                receipt["abort_reason"] = f"HTTP {code} at {name}; remaining requests not attempted"
                atomic_write_json(receipt_path, receipt)
                break
            time.sleep(INTERVAL)
        else:
            ok = sum(1 for e in receipt["requests"] if e["status"] == 200)
            if ok == len(receipt["requests"]) and ok > 0:
                receipt["status"] = "complete"
            elif ok > 0:
                receipt["status"] = "partial"
            else:
                receipt["status"] = "failed"
            atomic_write_json(receipt_path, receipt)
    finally:
        # 예상 밖 경로의 중단에도 영수증이 남는다.
        if receipt["status"] == "running":
            receipt["status"] = "interrupted"
            atomic_write_json(receipt_path, receipt)
    # run 폴더 README 뼈대 (해시·행수는 --run이 채운다)
    (run_dir / "README.md").write_text(
        f"# ALT-20260907-02 원본 {run_id}\n\nreceipt: request.json\n", encoding="utf-8")
    print(f"run {run_id}: {receipt['status']}")
    return run_id


def load_run_html(run_id):
    """원본 HTML을 읽기 전에 request.json 영수증을 먼저 대사한다.
    변조·누락·추가 파일·실패 영수증이면 빌드를 금지한다."""
    run_dir = RAW_BASE / run_id
    receipt_path = run_dir / "request.json"
    if not receipt_path.is_file():
        raise ValueError(f"missing request.json for run {run_id}; build forbidden")
    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    if receipt.get("status") != "complete":
        raise ValueError(f"receipt status {receipt.get('status')!r} is not complete; build forbidden")
    requests = receipt.get("requests", [])
    names = [e.get("name") for e in requests]
    if len(set(names)) != len(names):
        raise ValueError("duplicate request names in receipt; build forbidden")
    expected = {}
    for e in requests:
        for field in ("name", "url", "status", "bytes", "sha256"):
            if field not in e:
                raise ValueError(f"request entry missing {field}: {e.get('name')!r}")
        if e["status"] != 200:
            raise ValueError(f"non-200 entry {e['name']!r} in complete receipt; build forbidden")
        expected[f"pola_{e['name']}.html"] = e
    actual = {p.name: p for p in run_dir.glob("pola_*.html")}
    if set(actual) != set(expected):
        raise ValueError(f"file set mismatch: missing={sorted(set(expected) - set(actual))} "
                         f"extra={sorted(set(actual) - set(expected))}; build forbidden")
    files = {}
    for fname, e in expected.items():
        body = actual[fname].read_bytes()
        if len(body) != e["bytes"] or hashlib.sha256(body).hexdigest() != e["sha256"]:
            raise ValueError(f"tampered file {fname}; build forbidden")
        files[e["name"]] = body
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


def _render_figure_bytes(ordered, panel):
    """월별 빈수출 비중·중간 원단위 2단 그림 바이트(SVG, 표준 라이브러리만).
    v1 렌더러이며 픽셀 단위까지 고정한다. 수정판은 --figure-v2 경로만 쓴다."""
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
    return ("\n".join(parts) + "\n").encode("utf-8")


def _calendar_with_gaps(ordered):
    """ordered(월 오름차순)를 달력 연속으로 펼치고 빈 달에 None을 둔다."""
    months, prev = [], None
    for key in ordered:
        y, m = int(key[:4]), int(key[5:])
        if prev is not None:
            py, pm = prev
            cy, cm = py, pm
            while True:
                cm += 1
                if cm > 12:
                    cm, cy = 1, cy + 1
                if (cy, cm) >= (y, m):
                    break
                months.append(None)
        months.append(key)
        prev = (y, m)
    return months


def _render_figure_v2_bytes(ordered, panel):
    """수정 그림(v2). 양 패널이 같은 달력 x축을 쓰고, 빈 달은 두 계열 다 끊는다.
    v1 렌더러는 손대지 않는다."""
    W, PAD_L, PAD_T, PANEL_H, GAP = 860, 64, 26, 170, 60
    FOOT_H = 30
    H = PAD_T + PANEL_H + GAP + PANEL_H + FOOT_H
    cal = _calendar_with_gaps(ordered)
    n = len(cal)

    def x(i):
        return PAD_L + i * (W - PAD_L - 20) / max(1, n - 1)

    def series(get):
        return [None if k is None else get(panel[k]) for k in cal]

    shares = series(lambda r: float(100 * r["empty_exports"]
                                    / (r["loaded_exports"] + r["empty_exports"])))
    raw_e = series(lambda r: float(r["empty_exports"]))
    raw_l = series(lambda r: float(r["loaded_exports"]))

    def scale(vals, top):
        nums = [v for v in vals if v is not None]
        lo, hi = min(nums), max(nums)
        pad = (hi - lo) * 0.08 or 1
        lo -= pad
        hi += pad
        return lo, hi, lambda v: top + PANEL_H - (v - lo) / (hi - lo) * PANEL_H

    slo, shi, sy = scale(shares, PAD_T)
    rlo, rhi, ry = scale(raw_e + raw_l, PAD_T + PANEL_H + GAP)

    def path(vals, yfun):
        d, prev = "", False
        for i, v in enumerate(vals):
            if v is None:
                prev = False
                continue
            xx, yy = x(i), yfun(v)
            d += f"{'L' if prev else 'M'}{xx:.1f},{yy:.1f}"
            prev = True
        return d

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" role="img">',
             f'<text x="{PAD_L}" y="16" font-size="13">LA항 빈수출 비중 S_m = 100 x Empty/(Empty+Loaded) — 월별 TEU (v2, {ordered[0]}~{ordered[-1]})</text>']
    for top, lo, hi, unit in ((PAD_T, slo, shi, "%"), (PAD_T + PANEL_H + GAP, rlo, rhi, "TEU")):
        for frac, lab in ((0, f"{hi:,.1f}{unit}"), (0.5, f"{(lo + hi) / 2:,.1f}{unit}"),
                          (1, f"{lo:,.1f}{unit}")):
            y = top + PANEL_H * frac
            parts.append(f'<line x1="{PAD_L}" y1="{y}" x2="{W - 20}" y2="{y}" stroke="#ccc"/>'
                         f'<text x="4" y="{y + 4}" font-size="10">{lab}</text>')
    for i, k in enumerate(cal):
        if k is not None and k.endswith("-01"):
            parts.append(f'<text x="{x(i):.1f}" y="{H - FOOT_H + 2}" font-size="10">{k[:4]}</text>')
    parts.append(f'<text x="{x(n - 1):.1f}" y="{H - FOOT_H + 2}" font-size="10" text-anchor="end">{ordered[-1]}</text>')
    parts.append(f'<path d="{path(shares, sy)}" fill="none" stroke="#1d4ed8" stroke-width="1.5"/>')
    parts.append(f'<path d="{path(raw_e, ry)}" fill="none" stroke="#b45309" stroke-width="1.2"/>')
    parts.append(f'<path d="{path(raw_l, ry)}" fill="none" stroke="#0d9488" stroke-width="1.2"/>')
    parts.append(f'<text x="{PAD_L}" y="{H - 8}" font-size="11">아래: Empty Exports(주황) vs Loaded Exports(청록), TEU. '
                 "2020-11 공백(원본 Total 셀 오타 격리). 출처: Port of Los Angeles (credit).</text>")
    parts.append("</svg>")
    return ("\n".join(parts) + "\n").encode("utf-8")


def write_figure_v2(run_id, out_svg=None):
    """v2 그림과 별도 영수증을 v2/ 경로에만 쓴다. v1 산출물은 건드리지 않는다."""
    result = build_panel(run_id)
    ordered, panel = result["ordered"], result["panel"]
    svg_bytes = _render_figure_v2_bytes(ordered, panel)
    v2_dir = IDX_BASE / run_id / "v2"
    v2_dir.mkdir(parents=True, exist_ok=True)
    svg_path = out_svg or (v2_dir / "observation-v2.svg")
    _write_bytes_guarded(svg_path, svg_bytes)
    raw_dir = RAW_BASE / run_id
    raw_hashes = {}
    for p in sorted(raw_dir.glob("pola_*.html")):
        raw_hashes[p.name] = hashlib.sha256(p.read_bytes()).hexdigest()
    monthly_path = PROCESSED_BASE / run_id / "monthly.csv"
    receipt = {"run_id": run_id, "figure": "v2", "generated_at_utc": utc_now().isoformat(),
               "code_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
               "inputs": {"monthly_csv_sha256": hashlib.sha256(monthly_path.read_bytes()).hexdigest(),
                          "raw_html_sha256": raw_hashes},
               "outputs": {svg_path.name: hashlib.sha256(svg_bytes).hexdigest()}}
    receipt_path = v2_dir / "receipt.json"
    _write_receipt_guarded(receipt_path, receipt)
    return {"svg": str(svg_path.relative_to(ROOT)), "receipt": str(receipt_path.relative_to(ROOT))}


def _write_bytes_guarded(path, data):
    """기존 파일과 바이트가 다르면 덮어쓰지 않고 실패한다. 동일하면 허용."""
    if path.exists():
        if path.read_bytes() == data:
            return "identical"
        raise FileExistsError(f"refusing to overwrite with different bytes: {path}")
    path.write_bytes(data)
    return "written"


def _write_receipt_guarded(path, receipt):
    """영수증은 generated_at_utc를 제외한 내용이 동일할 때만 갱신한다."""
    data = (json.dumps(receipt, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    if path.exists():
        old = json.loads(path.read_bytes().decode("utf-8"))
        new = dict(receipt)
        if old.get("generated_at_utc") == new.pop("generated_at_utc", None):
            pass
        old.pop("generated_at_utc", None)
        if old != new:
            raise FileExistsError(f"refusing to overwrite receipt with different content: {path}")
    path.write_bytes(data)
    return "written"


def _quality_key(path):
    """quality.json용 경로 키. 저장소 밖 temp 산출물은 파일명으로 둔다."""
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return path.name


def write_index_artifacts(run_id, result):
    panel, ordered = result["panel"], result["ordered"]
    idx_dir = IDX_BASE / run_id
    proc_dir = PROCESSED_BASE / run_id
    proc_dir.mkdir(parents=True, exist_ok=True)
    idx_dir.mkdir(parents=True, exist_ok=True)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
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
    out_csv = proc_dir / "monthly.csv"
    csv_bytes = buffer.getvalue().encode("utf-8")
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
    display_bytes = (json.dumps(display, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    quality = {"candidate_id": "ALT-20260907-02", "run_id": run_id,
               "months": len(ordered), "first_month": ordered[0], "last_month": ordered[-1],
               "missing_months": result["missing_months"],
               "quarantined_months": result["quarantined_months"],
               "reconciliation": result["recon"], "provider_yoy_check": result["yoy"],
               "annual_total_check": result["annual_check"],
               "main_page_crosscheck": result["main_check"],
               "output_sha256": {}}
    _write_bytes_guarded(out_csv, csv_bytes)
    _write_bytes_guarded(display_path, display_bytes)
    quality["output_sha256"][_quality_key(out_csv)] = hashlib.sha256(csv_bytes).hexdigest()
    quality["output_sha256"][_quality_key(display_path)] = hashlib.sha256(display_bytes).hexdigest()
    fig_bytes = _render_figure_bytes(ordered, panel)
    fig_path = idx_dir / "observation.svg"
    _write_bytes_guarded(fig_path, fig_bytes)
    quality["output_sha256"][_quality_key(fig_path)] = hashlib.sha256(fig_bytes).hexdigest()
    quality_path = idx_dir / "quality.json"
    _write_bytes_guarded(quality_path, (json.dumps(quality, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    quality = json.loads(quality_path.read_bytes().decode("utf-8"))
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
    assert parse_number("(44,176.30)") == Decimal("-44176.30")
    assert parse_pct("(8.02%)") == Decimal("-8.02")
    # 1c. 음성: 짝없는 괄호와 '-(' 혼합은 거부한다.
    for fun, bads in ((parse_number, ["(12.00", "12.00)", "-(1.00)", "(1,000", "1,000)", "((1.00))"]),
                      (parse_pct, ["(12.00%", "12.00%)", "-(1.00%)", "(-1.00%)", "((1.00%)"])):
        for bad in bads:
            try:
                fun(bad)
            except ValueError:
                pass
            else:
                raise AssertionError(f"unbalanced paren accepted: {bad!r}")
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

    # 7. 실패 경로: 실제 HTTPError 예외 형식의 403/429는 코드를 보존하고 즉시중단한다.
    import tempfile

    def _sandbox_collect(fake_fetch, years=(2099, 2100)):
        sandbox = Path(tempfile.mkdtemp(prefix="pola-mock-"))
        real_fetch, real_sleep = globals()["fetch"], time.sleep
        tmp_base, tmp_idx, tmp_proc = globals()["RAW_BASE"], globals()["IDX_BASE"], globals()["PROCESSED_BASE"]
        globals()["fetch"] = fake_fetch
        globals()["RAW_BASE"] = sandbox
        time.sleep = lambda s: None
        try:
            return sandbox, collect(list(years), main_page=False), None
        except KeyboardInterrupt as ki:
            return sandbox, None, ki
        finally:
            globals()["fetch"] = real_fetch
            globals()["RAW_BASE"] = tmp_base
            globals()["IDX_BASE"] = tmp_idx
            globals()["PROCESSED_BASE"] = tmp_proc
            time.sleep = real_sleep

    def _http_error(code):
        return urllib.error.HTTPError("http://x/", code,
                                      "Forbidden" if code == 403 else "Too Many Requests", {}, None)

    def _only_run_dir(sandbox):
        dirs = [d for d in sandbox.iterdir() if d.is_dir()]
        assert len(dirs) == 1, f"expected 1 run dir, got {len(dirs)}"
        return dirs[0]

    for code in (403, 429):
        calls = {"n": 0}

        def fake_status_error(url, timeout=TIMEOUT, _code=code, _calls=calls):
            _calls["n"] += 1
            if _calls["n"] == 1:
                return 200, b"<html></html>"
            raise _http_error(_code)

        sandbox, _, err = _sandbox_collect(fake_status_error)
        assert err is None, f"unexpected raise for HTTP {code}"
        receipt = json.loads((_only_run_dir(sandbox) / "request.json").read_text())
        assert receipt["status"] == "aborted", receipt["status"]
        second = receipt["requests"][1]
        assert second["status"] == code and second["error_type"] == "HTTPError", second
        assert not (_only_run_dir(sandbox) / "pola_2100.html").exists()

    # 7b. KeyboardInterrupt 첫 요청 → 즉시 raise, 1행에 URL/시각/error_type 기록.
    def fake_ki_first(url, timeout=TIMEOUT):
        raise KeyboardInterrupt()

    sandbox, _, err = _sandbox_collect(fake_ki_first)
    assert isinstance(err, KeyboardInterrupt), "KeyboardInterrupt swallowed"
    receipt = json.loads((_only_run_dir(sandbox) / "request.json").read_text())
    assert receipt["status"] == "aborted" and len(receipt["requests"]) == 1
    first = receipt["requests"][0]
    assert first["name"] == "2099" and first["url"].endswith("2099"), first
    assert first["status"] == "INTERRUPTED" and first["error_type"] == "KeyboardInterrupt", first
    assert first["started_at"] and first["completed_at"], first

    # 7c. 2성공 뒤 중단 → 3행, 즉시 raise.
    calls = {"n": 0}

    def fake_ki_third(url, timeout=TIMEOUT):
        calls["n"] += 1
        if calls["n"] <= 2:
            return 200, b"<html></html>"
        raise KeyboardInterrupt()

    sandbox, _, err = _sandbox_collect(fake_ki_third, (2099, 2100, 2101))
    assert isinstance(err, KeyboardInterrupt), "KeyboardInterrupt swallowed"
    receipt = json.loads((_only_run_dir(sandbox) / "request.json").read_text())
    assert receipt["status"] == "aborted" and len(receipt["requests"]) == 3, receipt["status"]
    assert [e["status"] for e in receipt["requests"]] == [200, 200, "INTERRUPTED"]

    # 7d. 일반 실패 1회 뒤 성공 → complete가 아니라 partial.
    calls = {"n": 0}

    def fake_url_error_once(url, timeout=TIMEOUT):
        calls["n"] += 1
        if calls["n"] == 1:
            raise urllib.error.URLError("boom")
        return 200, b"<html></html>"

    sandbox, _, err = _sandbox_collect(fake_url_error_once)
    assert err is None, f"unexpected raise: {err!r}"
    receipt = json.loads((_only_run_dir(sandbox) / "request.json").read_text())
    assert receipt["status"] == "partial", receipt["status"]
    assert receipt["requests"][0]["error_type"] == "URLError"

    # 7e. 전부 실패 → failed.
    def fake_url_error_always(url, timeout=TIMEOUT):
        raise urllib.error.URLError("down")

    sandbox, _, err = _sandbox_collect(fake_url_error_always)
    assert err is None, f"unexpected raise: {err!r}"
    receipt = json.loads((_only_run_dir(sandbox) / "request.json").read_text())
    assert receipt["status"] == "failed", receipt["status"]

    # 8. load_run_html은 영수증을 먼저 대사한다. temp 산출물로만 반증한다.
    load_base = Path(tempfile.mkdtemp(prefix="pola-loadbase-"))
    real_raw = globals()["RAW_BASE"]
    globals()["RAW_BASE"] = load_base
    try:
        def _write_run(dirname, receipt, bodies):
            run_dir = load_base / dirname
            run_dir.mkdir()
            if receipt is not None:
                (run_dir / "request.json").write_text(json.dumps(receipt, ensure_ascii=False) + "\n")
            for fname, body in bodies.items():
                (run_dir / fname).write_bytes(body)
            return dirname

        def _entry(name, body):
            return {"name": name, "url": f"http://x/{name}",
                    "started_at": "2020-01-01T00:00:00+00:00",
                    "completed_at": "2020-01-01T00:00:01+00:00", "status": 200,
                    "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}

        tiny_a, tiny_b = b"<html>a</html>", b"<html>b</html>"

        def _good_receipt(rid):
            return {"run_id": rid, "status": "complete",
                    "requests": [_entry("2099", tiny_a), _entry("2100", tiny_b)]}

        ok_dir = _write_run("20200101T000000Z", _good_receipt("20200101T000000Z"),
                            {"pola_2099.html": tiny_a, "pola_2100.html": tiny_b})
        loaded = load_run_html(ok_dir)
        assert set(loaded) == {"2099", "2100"} and loaded["2099"] == tiny_a

        bad_receipt = _good_receipt("20200202T000000Z")
        bad_receipt["requests"][0] = dict(bad_receipt["requests"][0])
        bad_receipt["requests"][0]["status"] = 404
        cases = [
            ("tampered", _good_receipt("20200202T000000Z"),
             {"pola_2099.html": b"tampered!!", "pola_2100.html": tiny_b}),
            ("missing", _good_receipt("20200202T000000Z"), {"pola_2099.html": tiny_a}),
            ("extra", _good_receipt("20200202T000000Z"),
             {"pola_2099.html": tiny_a, "pola_2100.html": tiny_b, "pola_9999.html": b"<html>e</html>"}),
            ("failed-receipt", {"run_id": "20200202T000000Z", "status": "failed", "requests": []},
             {"pola_2099.html": tiny_a}),
            ("dup-names", {"run_id": "20200202T000000Z", "status": "complete",
                           "requests": [_entry("2099", tiny_a), _entry("2099", tiny_a)]},
             {"pola_2099.html": tiny_a}),
            ("no-receipt", None, {"pola_2099.html": tiny_a}),
            ("non200-in-complete", bad_receipt, {"pola_2099.html": tiny_a, "pola_2100.html": tiny_b}),
        ]
        for i, (label, receipt_obj, bodies) in enumerate(cases):
            dirname = f"20200202T00000{i}Z"
            if receipt_obj is not None:
                receipt_obj = json.loads(json.dumps(receipt_obj))
                receipt_obj["run_id"] = dirname
            _write_run(dirname, receipt_obj, bodies)
            try:
                load_run_html(dirname)
            except ValueError:
                pass
            else:
                raise AssertionError(f"forbidden build allowed: {label}")
    finally:
        globals()["RAW_BASE"] = real_raw
    # 9. 쓰기 가드: 동일 바이트 재실행은 허용, 다른 바이트 덮어쓰기는 거부한다.
    def _mini_result():
        panel = {}
        for key, le, ee in (("2020-01", "100.00", "300.00"),
                            ("2020-02", "200.00", "200.00"),
                            ("2020-04", "150.00", "150.00")):
            panel[key] = {"loaded_imports": Decimal("0"), "empty_imports": Decimal("0"),
                          "total_imports": Decimal("0"), "loaded_exports": Decimal(le),
                          "empty_exports": Decimal(ee),
                          "total_exports": Decimal(le) + Decimal(ee),
                          "total_teus": Decimal(le) + Decimal(ee),
                          "provider_yoy_pct": Decimal("0")}
        return {"panel": panel, "ordered": sorted(panel),
                "recon": {"months": 3, "import_side_ok": 3, "export_side_ok": 3,
                          "grand_total_ok": 3, "mismatches": []},
                "yoy": {"compared": 0, "matched": 0, "mismatches": []},
                "missing_months": {}, "quarantined_months": [],
                "annual_check": {"compared": 0, "matched": 0, "mismatches": []},
                "main_check": {"compared": 0, "matched": 0, "mismatches": [], "ref": None}}

    guard_base = Path(tempfile.mkdtemp(prefix="pola-guard-"))
    real_idx, real_proc = globals()["IDX_BASE"], globals()["PROCESSED_BASE"]
    globals()["IDX_BASE"] = guard_base / "idx"
    globals()["PROCESSED_BASE"] = guard_base / "proc"
    try:
        write_index_artifacts("20990101T000000Z", _mini_result())
        write_index_artifacts("20990101T000000Z", _mini_result())  # 동일 재실행 허용
        disp = guard_base / "idx" / "20990101T000000Z" / "display.json"
        before = disp.read_bytes()
        disp.write_bytes(before + b" ")
        try:
            write_index_artifacts("20990101T000000Z", _mini_result())
        except FileExistsError:
            pass
        else:
            raise AssertionError("overwrite with different bytes allowed")
        assert disp.read_bytes() == before + b" ", "guarded file was modified"
    finally:
        globals()["IDX_BASE"] = real_idx
        globals()["PROCESSED_BASE"] = real_proc

    # 10. v2 그림: 달력 공백에서 끊기고, 양 패널 마지막 x가 일치하며, 재생이 결정적이다.
    cal = _calendar_with_gaps(["2020-01", "2020-02", "2020-04"])
    assert cal == ["2020-01", "2020-02", None, "2020-04"], cal
    mini = _mini_result()
    svg = _render_figure_v2_bytes(mini["ordered"], mini["panel"]).decode("utf-8")
    data_paths = re.findall(r'<path d="([^"]+)"', svg)
    assert len(data_paths) == 3, len(data_paths)
    for d in data_paths:
        first_xs = [float(seg.split("L")[0].split(",")[0]) for seg in d.split("M") if seg]
        assert abs(max(first_xs) - 840.0) < 0.05, max(first_xs)
    assert sum(d.count("M") for d in data_paths) >= 6, "gap break missing"
    assert "2020-04" in svg and "Port of Los Angeles" in svg
    svg2 = _render_figure_v2_bytes(mini["ordered"], mini["panel"])
    assert svg2 == svg.encode("utf-8"), "v2 render not deterministic"
    print("SELF-TEST PASS")


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--collect", action="store_true")
    parser.add_argument("--run", default=None)
    parser.add_argument("--figure-v2", default=None, metavar="RUN_ID",
                        help="v2 수정 그림과 별도 영수증을 v2/ 경로에만 생성한다")
    parser.add_argument("--v2-out", default=None,
                        help="v2 SVG 출력 경로(기본값은 <run>/v2/observation-v2.svg)")
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
    if args.figure_v2:
        out = Path(args.v2_out) if args.v2_out else None
        print(json.dumps(write_figure_v2(args.figure_v2, out), ensure_ascii=False))
        return 0
    parser.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
