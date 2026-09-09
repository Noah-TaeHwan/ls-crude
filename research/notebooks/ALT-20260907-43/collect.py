"""STB EP 724 주간 Petroleum Products 차종 적재를 수집·대사한다. 가격 검정은 하지 않는다."""
import argparse
import csv
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import zipfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
CID = "ALT-20260907-43"
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
NSMAP = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
XLSX_URL = (
    "https://www.stb.gov/wp-content/uploads/files/rsir/"
    "All%20Class%201%20Railroads/EP724%20Consolidated%20Data%20through%202026-09-02.xlsx"
)
XLSX_NAME = "ep724-consolidated.xlsx"
LABEL_COLS = ("A", "B", "C", "D", "E", "F")
HEADER = ("Railroad/\nRegion", "Category No.", "Sub-Category", "Measure", "Variable", "Sub-Variable")
MEASURE = "Weekly Carloads By 22 Commodity Categories"
COMMODITY = "Petroleum Products"
FLOWS = ("Originated", "Received", "Total")
RAILS = ("BNSF", "CN", "CP", "CSX", "KCS", "NS", "UP", "CPKC")
COMPLETE = ("BNSF", "CN", "CSX", "NS", "UP")
US_DISPLAY = ("BNSF", "UP", "CSX", "NS")
ABORT_STATUS = frozenset({401, 403, 429})
UA = "ls-crude-research/1.0"
EPOCH = date(1899, 12, 30)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def preserve(path, data):
    """동일 바이트는 재사용하고 기존 원본·산출물 변경은 거부한다."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        assert path.read_bytes() == data, f"different output; use a new run: {path}"
    else:
        path.write_bytes(data)


def atomic_write_json(path, obj):
    """임시 파일 기록 후 교체한다. 중단 시에도 마지막까지의 영수증이 남는다."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(obj, indent=2) + "\n")
    os.replace(tmp, path)


def col_letters(ref):
    return re.match(r"[A-Z]+", ref).group(0)


def col_n(letters):
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n


def col_letters_from_n(n):
    letters = ""
    while n:
        n, rem = divmod(n - 1, 26)
        letters = chr(65 + rem) + letters
    return letters


def excel_day(serial):
    return EPOCH + timedelta(days=serial)


def missing(value):
    return value is None or str(value).strip() in ("", "-")


def cell_value(cell, strings):
    """숫자·공유문자만 읽고 수식 셀은 거부한다."""
    assert cell.find(NS + "f") is None, "formula not accepted"
    kind = cell.get("t")
    node = cell.find(NS + "v")
    text = None if node is None else node.text
    if kind == "s":
        assert text is not None and text.isdigit(), "shared string index"
        return strings[int(text)]
    if kind not in (None, "n"):
        raise AssertionError(f"cell type changed: {kind}")
    return text


def parse_count(value):
    """결측은 유지하고, 정수 차종만 받는다. 0을 결측으로 바꾸지 않는다."""
    if missing(value):
        return None
    assert re.fullmatch(r"-?\d+(?:\.0+)?", value), f"carload not an integer: {value!r}"
    number = int(float(value))
    assert number >= 0, "negative carloads"
    return number


def parse(data, retrieved_at):
    """EP 724 통합표의 Petroleum Products 주간 차종만 읽는다."""
    # ponytail: 단일 Sheet1·이 유종·수요일 주간 헤더 전용. 범용 철도표 파서는 추가하지 않는다.
    assert zipfile.is_zipfile(io.BytesIO(data)), "not a zip workbook"
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        assert sum(i.file_size for i in z.infolist()) < 80_000_000, "oversized workbook"
        book = ET.fromstring(z.read("xl/workbook.xml"))
        props = book.find("m:workbookPr", NSMAP)
        assert props is None or props.get("date1904", "0") in ("0", "false"), "date epoch changed"
        sheets = book.findall("m:sheets/m:sheet", NSMAP)
        assert len(sheets) == 1 and sheets[0].get("name") == "Sheet1", "sheet changed"
        strings = ["".join(e.itertext()) for e in ET.fromstring(z.read("xl/sharedStrings.xml"))]
        dates = []
        series = {}
        for event, elem in ET.iterparse(z.open("xl/worksheets/sheet1.xml"), events=("end",)):
            if elem.tag != NS + "row":
                continue
            cells = {}
            for cell in elem.findall(NS + "c"):
                cells[col_letters(cell.attrib["r"])] = cell_value(cell, strings)
            row = int(elem.attrib["r"])
            if row == 1:
                assert tuple(cells.get(c) for c in LABEL_COLS) == HEADER, "header changed"
                numbered = []
                for col, value in cells.items():
                    n = col_n(col)
                    if n < 7:
                        continue
                    assert re.fullmatch(r"\d+", value or ""), "date must be a whole Excel day"
                    serial = int(value)
                    day = excel_day(serial)
                    limit = date.fromisoformat(retrieved_at[:10])
                    assert date(2017, 1, 1) <= day <= limit, "date out of range"
                    assert day.weekday() == 2, "week date is not Wednesday"
                    numbered.append((n, serial, day))
                numbered.sort()
                assert numbered, "no week columns"
                serials = [item[1] for item in numbered]
                assert all(b - a == 7 for a, b in zip(serials, serials[1:])), "week step changed"
                assert [item[0] for item in numbered] == list(range(7, 7 + len(numbered))), "date columns not contiguous"
                dates = numbered
            elif cells.get("D") == MEASURE and cells.get("E") == COMMODITY:
                rail, flow = cells.get("A"), cells.get("F")
                assert cells.get("B") == "11" and cells.get("C") == "i", "category changed"
                key = (rail, flow)
                assert key not in series, "duplicate railroad/flow"
                series[key] = [parse_count(cells.get(col_letters_from_n(n))) for n, _, _ in dates]
            elem.clear()
    assert dates, "header row missing"
    for rail in RAILS:
        for flow in FLOWS:
            key = (rail, flow)
            assert key in series, f"missing {rail} {flow}"
            if rail in COMPLETE:
                assert all(v is not None for v in series[key]), f"unexpected gap in {rail}"
    extra = set(series) - {(rail, flow) for rail in RAILS for flow in FLOWS}
    assert not extra, f"unexpected petroleum rows: {extra}"
    return [day.isoformat() for _, _, day in dates], series


def csv_bytes(rows):
    out = io.StringIO(newline="")
    writer = csv.DictWriter(out, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
    return out.getvalue().encode()


def summarize(days, series):
    """미국 4사 originated만 표시 분모로 고정하고, Total=Originated+Received를 표로만 대조한다."""
    n = len(days)
    mismatch_values = 0
    mismatch_weeks = 0
    for i in range(n):
        week_bad = False
        for rail in RAILS:
            orig = series[(rail, "Originated")][i]
            recv = series[(rail, "Received")][i]
            total = series[(rail, "Total")][i]
            if orig is None or recv is None or total is None:
                continue
            if orig + recv != total:
                mismatch_values += 1
                week_bad = True
        if week_bad:
            mismatch_weeks += 1
    coverage = {}
    for rail in RAILS:
        present = [i for i, v in enumerate(series[(rail, "Originated")]) if v is not None]
        coverage[rail] = {
            "originated_weeks": len(present),
            "first": days[present[0]] if present else None,
            "last": days[present[-1]] if present else None,
            "originated_sum": sum(series[(rail, "Originated")][i] for i in present),
        }
    cp, kcs, cpkc = coverage["CP"], coverage["KCS"], coverage["CPKC"]
    assert cp["originated_weeks"] == kcs["originated_weeks"]
    assert cp["last"] == kcs["last"] and cpkc["first"] is not None
    assert date.fromisoformat(cp["last"]) + timedelta(days=7) == date.fromisoformat(cpkc["first"])
    assert cp["originated_weeks"] + cpkc["originated_weeks"] == n
    weekly = []
    for i, day in enumerate(days):
        row = {"date": day}
        for rail in RAILS:
            value = series[(rail, "Originated")][i]
            row[rail.lower()] = "" if value is None else value
        weekly.append(row)
    yearly = []
    for year in sorted({d[:4] for d in days}):
        idx = [i for i, d in enumerate(days) if d.startswith(year)]
        row = {"year": year, "weeks": len(idx)}
        for rail in US_DISPLAY:
            values = [series[(rail, "Originated")][i] for i in idx]
            assert all(v is not None for v in values)
            row[rail.lower()] = sum(values)
        yearly.append(row)
    quality = {
        "weeks": n,
        "start": days[0],
        "end": days[-1],
        "railroads": list(RAILS),
        "complete_railroads": list(COMPLETE),
        "display_railroads": list(US_DISPLAY),
        "originated_us4_sum": {rail: coverage[rail]["originated_sum"] for rail in US_DISPLAY},
        "originated_us4_total": sum(coverage[rail]["originated_sum"] for rail in US_DISPLAY),
        "cp_kcs_last": cp["last"],
        "cpkc_first": cpkc["first"],
        "cp_weeks": cp["originated_weeks"],
        "cpkc_weeks": cpkc["originated_weeks"],
        "coverage": coverage,
        "total_equals_originated_plus_received": mismatch_values == 0,
        "mismatch_values": mismatch_values,
        "mismatch_weeks": mismatch_weeks,
        "zeros_in_us4_originated": sum(
            1 for rail in US_DISPLAY for v in series[(rail, "Originated")] if v == 0
        ),
        "fractional_originated": 0,
        "yoy_log_index": "NOT_CONSTRUCTED",
        "WTI_tests": "NOT_RUN",
        "asof_safe": "NOT_PROVEN",
        "unit": "carloads originated",
        "commodity": COMMODITY,
        "measure": MEASURE,
        "industry_total": "NOT_CONSTRUCTED",
    }
    return weekly, yearly, quality


def render_svg(days, series):
    """미국 4사 originated 원단위 선을 그린다. 결측은 연결하지 않는다."""
    width, height, left, bottom = 880, 340, 58, 46
    values = [series[(rail, "Originated")][i] for rail in US_DISPLAY for i in range(len(days))]
    vmax = max(values) * 1.08
    span = max(1, (date.fromisoformat(days[-1]) - date.fromisoformat(days[0])).days)

    def x(i):
        offset = (date.fromisoformat(days[i]) - date.fromisoformat(days[0])).days
        return left + offset * (width - left - 14) / span

    def y(v):
        return (height - bottom) - v / vmax * (height - bottom - 30)

    colors = {"BNSF": "#16745b", "UP": "#edb958", "CSX": "#78b7ed", "NS": "#c47c5a"}
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="880" height="340" viewBox="0 0 880 340" role="img" aria-labelledby="t d">',
        '<title id="t">STB Petroleum Products originated carloads, four U.S. Class I railroads</title>',
        '<desc id="d">Weekly originated carloads, not crude oil barrels, not an industry total, no WTI test.</desc>',
        '<rect width="880" height="340" fill="white"/>',
        '<text x="58" y="24">Petroleum Products originated carloads (STB EP 724; not crude-by-rail barrels)</text>',
    ]
    for tick in range(5):
        v = vmax * tick / 4
        parts.append(f'<text x="8" y="{y(v):.1f}" font-size="11">{v:.0f}</text><path d="M58 {y(v):.1f} H866" stroke="#ddd"/>')
    years = []
    for i, day in enumerate(days):
        year = day[:4]
        if year not in years:
            years.append(year)
            parts.append(f'<text x="{x(i):.1f}" y="310" font-size="11">{year}</text>')
    for rail in US_DISPLAY:
        pts = " ".join(f"{x(i):.1f},{y(series[(rail, 'Originated')][i]):.1f}" for i in range(len(days)))
        parts.append(f'<polyline points="{pts}" fill="none" stroke="{colors[rail]}" stroke-width="1.4"/>')
    legend_x = 620
    for i, rail in enumerate(US_DISPLAY):
        yy = 38 + i * 16
        parts.append(f'<rect x="{legend_x}" y="{yy}" width="12" height="12" fill="{colors[rail]}"/>')
        parts.append(f'<text x="{legend_x + 16}" y="{yy + 11}" font-size="12">{rail} originated</text>')
    parts.append(
        '<text x="58" y="328" font-size="11">Source: Surface Transportation Board, EP 724 consolidated file. Current vintage; weekly first-release dates not restored. Not fuel use.</text></svg>'
    )
    return "\n".join(parts)


def workbook(sheet_name, strings, rows):
    """음성 검사용 최소 XLSX를 만든다."""
    sst = "".join(f"<si><t>{s}</t></si>" for s in strings)
    body = []
    for r, cells in enumerate(rows, 1):
        items = []
        for col, (kind, value) in cells.items():
            ref = f"{col}{r}"
            if kind == "s":
                items.append(f'<c r="{ref}" t="s"><v>{value}</v></c>')
            else:
                items.append(f'<c r="{ref}"><v>{value}</v></c>')
        body.append(f'<row r="{r}">{"".join(items)}</row>')
    sheet = f'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>{"".join(body)}</sheetData></worksheet>'
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w") as z:
        z.writestr("xl/workbook.xml", f'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="{sheet_name}"/></sheets></workbook>')
        z.writestr("xl/sharedStrings.xml", f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">{sst}</sst>')
        z.writestr("xl/worksheets/sheet1.xml", sheet)
    return stream.getvalue()


def sample_workbook(mutate=None):
    """8개 철도·4주의 정상 표본. mutate가 있으면 복사본을 바꾼다."""
    strings = list(HEADER) + [MEASURE, COMMODITY, "i", "11", *RAILS, *FLOWS, "Weekly Carloads of Fertilizer", "Grain"]
    index = {s: i for i, s in enumerate(strings)}
    serials = [42823, 42830, 42837, 42844]
    cols = [col_letters_from_n(7 + i) for i in range(4)]
    rows = [{c: ("s", index[HEADER[i]]) for i, c in enumerate(LABEL_COLS)}]
    for i, col in enumerate(cols):
        rows[0][col] = ("n", str(serials[i]))
    for rail in RAILS:
        for flow in FLOWS:
            cells = {
                "A": ("s", index[rail]),
                "B": ("s", index["11"]),
                "C": ("s", index["i"]),
                "D": ("s", index[MEASURE]),
                "E": ("s", index[COMMODITY]),
                "F": ("s", index[flow]),
            }
            for j, col in enumerate(cols):
                if rail in ("CP", "KCS") and j == 3:
                    continue
                if rail == "CPKC" and j < 3:
                    continue
                base = {"BNSF": 3000, "UP": 2000, "CSX": 1000, "NS": 800, "CN": 400, "CP": 200, "KCS": 250, "CPKC": 500}[rail]
                orig = base + j
                recv = 10 + j
                value = orig if flow == "Originated" else recv if flow == "Received" else orig + recv
                cells[col] = ("n", str(value))
            rows.append(cells)
    fertilizer = {
        "A": ("s", index["BNSF"]),
        "B": ("s", index["11"]),
        "C": ("s", index["i"]),
        "D": ("s", index["Weekly Carloads of Fertilizer"]),
        "E": ("s", index["Grain"]),
        "F": ("s", index["Originated"]),
        "G": ("n", "99"),
    }
    rows.append(fertilizer)
    if mutate:
        mutate(rows, index, strings)
    return workbook("Sheet1", strings, rows)


def must_fail(data, retrieved="2026-09-09"):
    try:
        parse(data, retrieved)
    except AssertionError:
        return
    raise AssertionError("accepted malformed workbook")


def self_test_parse():
    days, series = parse(sample_workbook(), "2026-09-09")
    assert days == ["2017-03-29", "2017-04-05", "2017-04-12", "2017-04-19"]
    weekly, yearly, quality = summarize(days, series)
    assert quality["mismatch_values"] == 0 and quality["weeks"] == 4
    assert series[("BNSF", "Originated")] == [3000, 3001, 3002, 3003]
    assert series[("CP", "Originated")][3] is None and series[("CPKC", "Originated")][0] is None
    assert yearly[0]["bnsf"] == sum(series[("BNSF", "Originated")])
    must_fail(workbook("Data", list(HEADER), [{}]))
    must_fail(b"not-a-workbook")
    def drop_petroleum(rows, index, strings):
        rows[:] = [rows[0]] + [row for row in rows[1:] if row.get("E") != ("s", index[COMMODITY])]
    must_fail(sample_workbook(drop_petroleum))
    def dup(rows, index, strings):
        rows.append(rows[1])
    must_fail(sample_workbook(dup))
    def bad_date(rows, index, strings):
        rows[0]["H"] = ("n", "42824")
    must_fail(sample_workbook(bad_date))
    def fraction(rows, index, strings):
        rows[1]["G"] = ("n", "12.5")
    must_fail(sample_workbook(fraction))
    def empty_bnsf(rows, index, strings):
        del rows[1]["G"]
    must_fail(sample_workbook(empty_bnsf))
    def space_missing(rows, index, strings):
        strings.append(" ")
        rows[1]["G"] = ("s", len(strings) - 1)
    must_fail(sample_workbook(space_missing))
    # 수식 셀: 기존 정상표를 직접 바꿔 파서가 거부하는지 본다.
    xml = zipfile.ZipFile(io.BytesIO(sample_workbook())).read("xl/worksheets/sheet1.xml").replace(
        b'<c r="G2"><v>3000</v></c>', b'<c r="G2"><f>1+2</f><v>3000</v></c>'
    )
    stream = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(sample_workbook())) as src, zipfile.ZipFile(stream, "w") as z:
        for item in src.infolist():
            z.writestr(item, xml if item.filename.endswith("sheet1.xml") else src.read(item))
    must_fail(stream.getvalue())
    with tempfile.TemporaryDirectory() as folder:
        path = Path(folder) / "out"
        preserve(path, b"a")
        preserve(path, b"a")
        try:
            preserve(path, b"b")
        except AssertionError:
            pass
        else:
            raise AssertionError("overwrote snapshot")
    print("PASS: sheet/commodity/date/integer/gap/duplicate/formula/fertilizer-lookalike checks")


def probe(urls, run_id, fetch, root):
    """요청마다 영수증을 남기고 401/403/429·사용자 중단 뒤에는 나머지를 호출하지 않는다."""
    raw = root / "research/gathering/raw" / CID / run_id
    raw.mkdir(parents=True, exist_ok=False)
    receipt = {"candidate_id": CID, "run_id": run_id, "initialized_at": datetime.now(timezone.utc).isoformat(), "requests": []}
    path = raw / "requests.json"
    atomic_write_json(path, receipt)
    try:
        for url in urls:
            rec = {"url": url, "started_at": datetime.now(timezone.utc).isoformat()}
            receipt["requests"].append(rec)
            atomic_write_json(path, receipt)
            try:
                data, status = fetch(url)
                rec.update(completed_at=datetime.now(timezone.utc).isoformat(), http_status=status, bytes=len(data))
                if status in ABORT_STATUS:
                    rec["aborted"] = True
                    rec["status"] = "blocked"
                    atomic_write_json(path, receipt)
                    raise AssertionError("stopped after HTTP abort; no retry")
                rec["status"] = "ok"
                atomic_write_json(path, receipt)
            except KeyboardInterrupt:
                rec.update(failed_at=datetime.now(timezone.utc).isoformat(), error_type="KeyboardInterrupt", aborted=True)
                atomic_write_json(path, receipt)
                raise
            except urllib.error.HTTPError as exc:
                rec.update(failed_at=datetime.now(timezone.utc).isoformat(), error_type="HTTPError", http_status=exc.code, aborted=exc.code in ABORT_STATUS)
                atomic_write_json(path, receipt)
                if exc.code in ABORT_STATUS:
                    raise AssertionError("stopped after HTTP abort; no retry") from exc
                raise
    finally:
        atomic_write_json(path, receipt)
    return receipt


def self_test_collect():
    urls = ["https://example.test/a", "https://example.test/b", "https://example.test/c"]

    def http_error(url, code):
        return urllib.error.HTTPError(url, code, "blocked", hdrs=None, fp=io.BytesIO())

    with tempfile.TemporaryDirectory() as folder:
        root = Path(folder)
        calls = []

        def two_then_429(url):
            calls.append(url)
            if len(calls) <= 2:
                return b"ok", 200
            raise http_error(url, 429)

        try:
            probe(urls, "20200104T000000Z", two_then_429, root)
        except AssertionError as exc:
            assert "stopped" in str(exc)
        else:
            raise AssertionError("collect continued after HTTP 429")
        receipt = json.loads((root / "research/gathering/raw" / CID / "20200104T000000Z" / "requests.json").read_text())
        assert len(receipt["requests"]) == 3 == len(calls)
        assert receipt["requests"][2]["aborted"] is True

        def first_403(url):
            raise http_error(url, 403)

        try:
            probe(urls, "20200105T000000Z", first_403, root)
        except AssertionError:
            pass
        else:
            raise AssertionError("collect continued after HTTP 403")
        receipt = json.loads((root / "research/gathering/raw" / CID / "20200105T000000Z" / "requests.json").read_text())
        assert len(receipt["requests"]) == 1 and receipt["requests"][0]["aborted"] is True

        def boom(url):
            raise KeyboardInterrupt("simulated")

        try:
            probe(urls, "20200106T000000Z", boom, root)
        except KeyboardInterrupt:
            pass
        else:
            raise AssertionError("swallowed KeyboardInterrupt")
        receipt = json.loads((root / "research/gathering/raw" / CID / "20200106T000000Z" / "requests.json").read_text())
        assert receipt["requests"][0]["aborted"] and receipt["requests"][0]["error_type"] == "KeyboardInterrupt"
    print("PASS: per-attempt receipts on 403/429/interrupt, no remaining requests")


def xlsx_receipt(receipts):
    matches = [r for r in receipts["requests"] if r.get("local_file") == XLSX_NAME and r.get("status") == "ok"]
    assert len(matches) == 1, "xlsx GET receipt missing"
    return matches[0]


def run(run_id):
    assert re.fullmatch(r"\d{8}T\d{6}Z", run_id), "UTC run ID required"
    raw = ROOT / "research/gathering/raw" / CID / run_id
    receipts = json.loads((raw / "receipts.json").read_text())
    assert receipts["candidate_id"] == CID and receipts["run_id"] == run_id
    source = xlsx_receipt(receipts)
    data = (raw / XLSX_NAME).read_bytes()
    assert source["http_status"] == 200 and source["url"] == XLSX_URL
    assert source["sha256"] == sha(data) and source["bytes"] == len(data)
    days, series = parse(data, source["completed_at"])
    weekly, yearly, quality = summarize(days, series)
    out, evidence = ROOT / "research/data/processed" / CID / run_id, ROOT / "research/indexes" / CID / run_id
    svg = render_svg(days, series).encode()
    outputs = {
        out / "weekly-originated.csv": csv_bytes(weekly),
        evidence / "yearly-coverage.csv": csv_bytes(yearly),
        evidence / "observation.svg": svg,
    }
    for path, content in outputs.items():
        preserve(path, content)
    quality.update(
        source={k: source.get(k) for k in ("url", "http_status", "completed_at", "last_modified", "bytes", "sha256", "local_file")},
        output_sha256={str(path.relative_to(ROOT)): sha(content) for path, content in outputs.items()},
    )
    preserve(evidence / "quality.json", (json.dumps(quality, indent=2) + "\n").encode())
    execution = {
        "command": sys.argv,
        "executed_at": datetime.now(timezone.utc).isoformat(),
        "python": sys.version,
        "code_sha256": sha(Path(__file__).read_bytes()),
        "git_revision": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        "worktree_dirty": bool(subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True)),
        "raw_sha256": sha(data),
    }
    preserve(evidence / ("execution-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ") + ".json"), (json.dumps(execution, indent=2) + "\n").encode())
    print(json.dumps({k: quality[k] for k in quality if k not in ("coverage", "output_sha256", "source")}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--run")
    args = parser.parse_args()
    if args.self_test:
        self_test_parse()
        self_test_collect()
    else:
        assert args.run, "--run required for replay"
        run(args.run)
