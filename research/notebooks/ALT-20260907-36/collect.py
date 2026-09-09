"""USDA 수박 단독 품목의 주간 공표값을 수집·대사한다. 가격 검정은 하지 않는다."""
import argparse
import csv
import hashlib
import io
import json
import math
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
import urllib.error
import zipfile
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
CID = "ALT-20260907-36"
URL = "https://www.ams.usda.gov/sites/default/files/media/WeeklyTruckAvailabilitybyOriginandCommodity.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def collect_requests(raw, requests, opener=urllib.request.urlopen):
    """첫 요청 전 영수증을 보존하고 실패·중단 시 뒤 요청을 실행하지 않는다."""
    receipt = {"started_at": datetime.now(timezone.utc).isoformat(), "status": "RUNNING", "requests": []}
    target = raw / "requests.json"
    if target.exists():
        raise FileExistsError("existing receipt; use a new UTC run")

    def save():
        with tempfile.NamedTemporaryFile(mode="w", dir=raw, delete=False) as stream:
            json.dump(receipt, stream, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(stream.name, target)

    save()
    for name, url in requests:
        entry = {"url": url, "parameters": {}, "file": name,
                 "started_at": datetime.now(timezone.utc).isoformat(), "status": "RUNNING"}
        receipt["requests"].append(entry)
        save()
        try:
            with opener(urllib.request.Request(url, headers={"User-Agent": "ls-crude-research/1.0"}), timeout=30) as response:
                entry["http_status"] = response.status
                if response.status != 200:
                    raise ValueError("unexpected HTTP status")
                data = response.read(20_000_001)
                if not data or len(data) > 20_000_000:
                    raise ValueError("empty or oversized response")
                entry.update(content_type=response.headers.get("Content-Type"),
                             last_modified=response.headers.get("Last-Modified"),
                             bytes=len(data), sha256=sha(data))
            with (raw / name).open("xb") as stream:
                stream.write(data)
            entry["status"] = "PASS"
        except BaseException as exc:
            entry.update(status="INTERRUPTED" if isinstance(exc, (KeyboardInterrupt, SystemExit)) else "FAILED",
                         error=type(exc).__name__)
            if getattr(exc, "code", None) is not None:
                entry["http_status"] = exc.code
            receipt["status"] = entry["status"]
            raise
        finally:
            entry["completed_at"] = datetime.now(timezone.utc).isoformat()
            receipt["updated_at"] = entry["completed_at"]
            save()
    receipt["status"] = "PASS"
    save()
    return receipt


def sha(data):
    return hashlib.sha256(data).hexdigest()


def preserve(path, data):
    """동일 바이트는 재사용하고 기존 원본·산출물 변경은 거부한다."""
    if path.exists():
        assert path.read_bytes() == data, f"different output; use a new run: {path}"
    else:
        path.write_bytes(data)


def parse(data, retrieved_at):
    """확인한 XLSX의 네 열만 읽고 날짜·키·등급을 엄격하게 검사한다."""
    # ponytail: 단일 USDA 워크시트 전용. 구조가 바뀌면 실패하며 범용 Excel 지원은 추가하지 않는다.
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        assert sum(i.file_size for i in z.infolist()) < 30_000_000, "oversized workbook"
        book = ET.fromstring(z.read("xl/workbook.xml"))
        props = book.find("m:workbookPr", NS)
        assert props is None or props.get("date1904", "0") in ("0", "false"), "date epoch changed"
        sheets = book.findall("m:sheets/m:sheet", NS)
        assert len(sheets) == 1 and sheets[0].get("name") == "WeeklyTruckAvailabilitybyOrigin", "sheet changed"
        strings = ["".join(e.itertext()) for e in ET.fromstring(z.read("xl/sharedStrings.xml"))]
        records = []
        for row in ET.fromstring(z.read("xl/worksheets/sheet1.xml")).findall("m:sheetData/m:row", NS):
            cells = {}
            row_number = row.get("r")
            for cell in row:
                assert cell.find("m:f", NS) is None, "formula not accepted"
                address = re.fullmatch(r"([A-D])([1-9][0-9]*)", cell.attrib["r"])
                assert address is not None, "invalid cell address"
                if row_number is None:
                    row_number = address[2]
                assert address[2] == row_number, "cell belongs to another row"
                col = re.sub(r"\d+$", "", cell.attrib["r"])
                assert col in "ABCD" and len(col) == 1 and col not in cells, "column changed"
                value = cell.find("m:v", NS)
                assert value is not None and value.text is not None, "missing cell"
                kind = cell.get("t", "n")
                assert kind in ("s", "n"), "cell type changed"
                if kind == "s":
                    assert re.fullmatch(r"[0-9]+", value.text) and int(value.text) < len(strings), "invalid shared string index"
                cells[col] = strings[int(value.text)] if kind == "s" else value.text
            assert set(cells) == set("ABCD"), "missing column"
            records.append([cells[c] for c in "ABCD"])
    assert records[0] == ["Date", "district", "Commodities", "Availability"], "header changed"
    rows = []
    seen = set()
    for serial, district, commodity, value in records[1:]:
        assert re.fullmatch(r"\d+", serial), "date must be a whole Excel day"
        day = date(1899, 12, 30) + timedelta(days=int(serial))
        assert date(2000, 1, 1) <= day <= date.fromisoformat(retrieved_at[:10]), "date out of range"
        assert district.strip() and commodity.strip(), "empty label"
        rating = float(value)
        assert math.isfinite(rating) and 1 <= rating <= 5, "invalid availability"
        key = (day, district.strip(), commodity.strip())
        assert key not in seen, "duplicate date/district/commodity"
        seen.add(key)
        rows.append({"date": day.isoformat(), "district": district, "commodity": commodity, "value": rating})
    assert rows, "empty workbook"
    return rows


def pure(row):
    return row["commodity"].strip().upper().rstrip(".").strip() in ("WATERMELON", "WATERMELONS")


def summarize(rows):
    """수박 단독 관측 분모를 고정하고 없는 날짜를 채우지 않는다."""
    selected = [r for r in rows if pure(r)]
    assert selected, "no watermelon-only records"
    assert len({(r["date"], r["district"]) for r in selected}) == len(selected), "duplicate pure district/week"
    by_week = {}
    for row in selected:
        by_week.setdefault(row["date"], []).append(row["value"])
    weekly = []
    for day, values in sorted(by_week.items()):
        count = len(values)
        above = sum(v >= 4 for v in values)
        integers = [v for v in values if v.is_integer()]
        weekly.append({"date": day, "observed_districts": count, "value_ge4": above,
                       "share_ge4_pct": 100 * above / count if count else None,
                       "fractional_values": count - len(integers),
                       "integer_only_share_pct": 100 * sum(v >= 4 for v in integers) / len(integers) if integers else None})
    counts = Counter("pure" if pure(r) else "mixed_watermelon" if "WATERMELON" in r["commodity"].upper() else "other" for r in rows)
    assert sum(counts.values()) == len(rows) and sum(w["observed_districts"] for w in weekly) == len(selected)
    yearly = []
    for year in sorted({r["date"][:4] for r in rows}):
        sample = [r for r in selected if r["date"].startswith(year)]
        weeks = [w for w in weekly if w["date"].startswith(year)]
        yearly.append({"year": year, "rows": len(sample), "observed_dates": len(weeks), "district_labels": len({r["district"] for r in sample}),
                       "fractional_rows": sum(not r["value"].is_integer() for r in sample)})
    comparable = [w for w in weekly if w["share_ge4_pct"] is not None and w["integer_only_share_pct"] is not None]
    quality = {"all_rows": len(rows), "row_partition": dict(counts), "all_start": min(r["date"] for r in rows), "all_end": max(r["date"] for r in rows),
               "pure_start": min(by_week), "pure_end": max(by_week), "pure_district_labels": len({r["district"] for r in selected}),
               "pure_rows": len(selected), "pure_fractional_rows": sum(not r["value"].is_integer() for r in selected),
               "pure_value_ge4_rows": sum(r["value"] >= 4 for r in selected), "missing_cells": 0, "duplicate_keys": 0,
               "observed_dates": len(by_week), "pure_non_tuesday_rows": sum(date.fromisoformat(r["date"]).weekday() != 1 for r in selected),
               "dates_n_ge2": sum(w["observed_districts"] >= 2 for w in weekly),
               "integer_only_lost_dates": sum(w["share_ge4_pct"] is not None and w["integer_only_share_pct"] is None for w in weekly),
               "integer_only_changed_dates": sum(w["share_ge4_pct"] != w["integer_only_share_pct"] for w in comparable),
               "integer_only_max_change_pp": max(abs(w["share_ge4_pct"]-w["integer_only_share_pct"]) for w in comparable),
               "published_at": None, "available_at": None, "asof_safe": "NOT_PROVEN",
               "WTI_HO_tests": "NOT_RUN", "legacy_52week_zscore": "NOT_CONSTRUCTED"}
    return selected, weekly, yearly, quality


def csv_bytes(rows):
    out = io.StringIO(newline="")
    writer = csv.DictWriter(out, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
    return out.getvalue().encode()


def plot(weekly, yearly, end):
    """발표용 최근 관측과 전체 기간 커버리지를 다른 축으로 표시한다."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(2, 1, figsize=(12, 6.5), layout="constrained")
    recent = [w for w in weekly if w["date"] >= "2022-01-01"]
    xs = [date.fromisoformat(w["date"]) for w in recent]
    ys = [w["share_ge4_pct"] if w["share_ge4_pct"] is not None else float("nan") for w in recent]
    axes[0].scatter(xs, ys, color="#16745b", s=14)
    axes[0].set(title="Watermelon-only district reports: published value >= 4", ylabel="Share of observed reports (%)", ylim=(-5,105))
    axes[0].grid(axis="y", alpha=.2)
    axes[0].set_xlim(date(2022,1,1), date.fromisoformat(end))
    axes[1].bar([int(y["year"]) for y in yearly], [y["observed_dates"] for y in yearly], color="#16745b")
    axes[1].set(title="Dates with watermelon-only records (source dates retained; not all shipping)", ylabel="Observed dates", ylim=(0,54), xlabel=f"Year (source snapshot ends {end})")
    axes[1].grid(axis="y", alpha=.2)
    fig.suptitle("Watermelon truck availability: a research observation, not an oil forecast", fontsize=14)
    fig.supxlabel("Source: U.S. Department of Agriculture / AMS. Mixed commodities excluded; fractions unrounded. Unobserved dates are absent, not zero.", fontsize=9)
    out = io.BytesIO()
    fig.savefig(out, format="png", dpi=130)
    plt.close(fig)
    return out.getvalue()


def self_test():
    for fail_after, error in [(0, urllib.error.HTTPError(URL, 403, "Forbidden", {}, None)),
                              (0, urllib.error.HTTPError(URL, 429, "Limited", {}, None)),
                              (1, KeyboardInterrupt())]:
        with tempfile.TemporaryDirectory() as folder:
            raw = Path(folder)
            calls = []

            class Reply:
                status = 200
                headers = {}

                def __enter__(self): return self
                def __exit__(self, *args): pass
                def read(self, limit): return b"sample"

            def opener(request, timeout):
                initial = json.loads((raw/"requests.json").read_text())
                assert initial["requests"][-1]["status"] == "RUNNING"
                calls.append(request.full_url)
                if len(calls) > fail_after:
                    raise error
                return Reply()

            try:
                collect_requests(raw, [(f"{i}.bin", URL) for i in range(3)], opener)
            except BaseException as exc:
                assert exc is error
            else:
                raise AssertionError("ignored failure")
            final = json.loads((raw/"requests.json").read_text())
            assert len(calls) == fail_after+1 == len(final["requests"])
            assert final["status"] == ("INTERRUPTED" if fail_after else "FAILED")
            assert len(list(raw.glob("*.bin"))) == fail_after
    print("PASS: receipt before request; 403/429 first failure; partial success then interruption; no later requests")
    xml = '<worksheet xmlns="'+NS['m']+'"><sheetData><row>'+''.join(f'<c r="{c}1" t="s"><v>{i}</v></c>' for i,c in enumerate('ABCD'))+'</row><row><c r="A2"><v>45664</v></c><c r="B2" t="s"><v>4</v></c><c r="C2" t="s"><v>5</v></c><c r="D2"><v>3.5</v></c></row></sheetData></worksheet>'
    def workbook(sheet):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as z:
            z.writestr('xl/workbook.xml', '<workbook xmlns="'+NS['m']+'"><sheets><sheet name="WeeklyTruckAvailabilitybyOrigin"/></sheets></workbook>')
            z.writestr('xl/sharedStrings.xml', '<sst xmlns="'+NS['m']+'">'+''.join('<si><t>'+s+'</t></si>' for s in ['Date','district','Commodities','Availability','A','WATERMELONS'])+'</sst>')
            z.writestr('xl/worksheets/sheet1.xml', sheet)
        return stream.getvalue()
    assert parse(workbook(xml), '2025-02-01')[0] == {"date":"2025-01-07","district":"A","commodity":"WATERMELONS","value":3.5}
    for broken in [xml.replace('<v>3.5</v>', '<v>NaN</v>'), xml.replace('<v>3.5</v>', '<v>6</v>'), xml.replace('<v>3.5</v>', ''), xml.replace('<v>3.5</v>', '<f>1+2</f><v>3.5</v>'),
                   xml.replace('<v>4</v>', '<v>-1</v>'), xml.replace('B2', 'B999'),
                   xml.replace('45664', '-1'), xml.replace('45664', '99999'),
                   xml.replace('<c r="D2"><v>3.5</v></c>', '')]:
        try: parse(workbook(broken), '2025-02-01')
        except AssertionError: pass
        else: raise AssertionError('accepted malformed workbook')
    data_row = xml[xml.index('<row><c r="A2"'):xml.index('</sheetData>')]
    for invalid in [b'<html>not an XLSX</html>', workbook(xml.replace(data_row, '')),
                    workbook(xml.replace(data_row, data_row+data_row)),
                    workbook(xml.replace(xml[xml.index('<row>'):xml.index('</row>')+6], ''))]:
        try: parse(invalid, '2025-02-01')
        except (AssertionError, zipfile.BadZipFile): pass
        else: raise AssertionError('accepted wrong file or missing/duplicate rows')
    rows = [{"date":"2025-01-07","district":"A","commodity":"WATERMELONS.","value":3.5},
            {"date":"2025-01-07","district":"B","commodity":"WATERMELON","value":4.0},
            {"date":"2025-01-21","district":"C","commodity":"LIMES AND WATERMELONS","value":5.0}]
    selected, weekly, _, q = summarize(rows)
    assert len(selected) == 2 and q["row_partition"]["mixed_watermelon"] == 1
    assert weekly[0]["share_ge4_pct"] == 50 and weekly[0]["integer_only_share_pct"] == 100
    assert len(weekly) == 1 and weekly[0]["date"] == "2025-01-07"
    try: summarize(rows + rows[:1])
    except AssertionError: pass
    else: raise AssertionError("accepted duplicate district/week")
    with tempfile.TemporaryDirectory() as folder:
        path = Path(folder)/"receipt"
        preserve(path, b"a")
        preserve(path, b"a")
        try: preserve(path, b"b")
        except AssertionError: pass
        else: raise AssertionError("overwrote snapshot")
    print("PASS: XLSX schema/date/value/formula checks, exact commodity, fractional values, gaps, duplicates, immutable output")


def run(run_id, collect):
    assert re.fullmatch(r"\d{8}T\d{6}Z", run_id), "UTC run ID required"
    raw = ROOT/"research/gathering/raw"/CID/run_id
    if collect:
        raw.mkdir(parents=True, exist_ok=False)
        receipt = collect_requests(raw, [("weekly.xlsx", URL)])["requests"][0]
        receipt["retrieved_at"] = receipt["completed_at"]
        preserve(raw/"request.json", (json.dumps(receipt, indent=2)+"\n").encode())
    receipt = json.loads((raw/"request.json").read_text())
    data = (raw/"weekly.xlsx").read_bytes()
    assert receipt["http_status"] == 200 and receipt["url"] == URL and receipt["sha256"] == sha(data), "source receipt/hash mismatch"
    rows = parse(data, receipt["retrieved_at"])
    selected, weekly, yearly, quality = summarize(rows)
    out, evidence = ROOT/"research/data/processed"/CID/run_id, ROOT/"research/indexes"/CID/run_id
    out.mkdir(parents=True, exist_ok=True)
    evidence.mkdir(parents=True, exist_ok=True)
    outputs = {out/"watermelon.csv":csv_bytes(selected), out/"weekly.csv":csv_bytes(weekly), evidence/"yearly-coverage.csv":csv_bytes(yearly), evidence/"observation.png":plot(weekly,yearly,quality["all_end"])}
    for path, content in outputs.items(): preserve(path, content)
    quality.update(source=receipt, output_sha256={str(p.relative_to(ROOT)):sha(b) for p,b in outputs.items()})
    preserve(evidence/"quality.json", (json.dumps(quality, indent=2)+"\n").encode())
    execution = {"command": sys.argv, "executed_at": datetime.now(timezone.utc).isoformat(), "python": sys.version,
                 "code_sha256":sha(Path(__file__).read_bytes()), "git_revision":subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip(),
                 "worktree_dirty":bool(subprocess.check_output(["git","status","--porcelain"],cwd=ROOT,text=True)), "raw_sha256":sha(data)}
    execution_path = evidence/("execution-"+datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")+".json")
    preserve(execution_path, (json.dumps(execution,indent=2)+"\n").encode())
    print(json.dumps({k:v for k,v in quality.items() if k not in ("output_sha256","source")},indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--collect", action="store_true")
    parser.add_argument("--run")
    args = parser.parse_args()
    if args.self_test: self_test()
    else:
        run_id = args.run or (datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") if args.collect else None)
        assert run_id, "--run required for replay"
        run(run_id, args.collect)
