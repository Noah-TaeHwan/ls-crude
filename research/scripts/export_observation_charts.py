"""검증된 관측의 표시용 데이터만 내보낸다. --check는 원본 없는 체크아웃에서도 동작한다."""
import argparse
import csv
import hashlib
import json
from datetime import date
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "research/indexes/web-observations/v2"
SOURCES = {"watermelon": ("ALT-20260907-36", "20260908T065043Z", "weekly.csv", ""),
           "jeju": ("ALT-20260908-20", "20260908T073402Z", "daily.csv", ""),
           "degree-days": ("ALT-20260907-45", "20260908T120546Z", "degree-days.csv", "v2")}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate(kind, data, quality):
    """원본 집계와 행 수·날짜·분모·원단위 합계를 교차 확인한다."""
    rows = data["points"]
    dates = [r["month"]+"-01" if kind == "degree-days" else r["date"] for r in rows]
    assert dates == sorted(set(dates)) and all(date.fromisoformat(d).isoformat() == d for d in dates)
    if kind == "watermelon":
        assert len(rows) == quality["observed_dates"] == 409
        assert dates[0] == quality["pure_start"] and dates[-1] == quality["pure_end"]
        for r in rows:
            assert all(type(r[k]) is int for k in ("denominator", "numerator", "fractional"))
            assert r["denominator"] > 0 and 0 <= r["numerator"] <= r["denominator"] and 0 <= r["fractional"] <= r["denominator"]
        assert sum(r["denominator"] for r in rows) == quality["pure_rows"]
        assert sum(r["numerator"] for r in rows) == quality["pure_value_ge4_rows"]
        assert sum(r["fractional"] for r in rows) == quality["pure_fractional_rows"]
    elif kind == "jeju":
        assert len(rows) == quality["days"] == 336
        assert dates[0] == quality["start"] and dates[-1] == quality["end"]
        for r in rows:
            gas, oil, share = (Decimal(r[k]) for k in ("lngMwh", "oilMwh", "sharePct"))
            assert gas.is_finite() and oil.is_finite() and gas >= 0 and oil >= 0 and gas + oil > 0
            assert share.is_finite() and abs(share - 100 * oil / (gas + oil)) < Decimal("1e-20")
        assert sum(Decimal(r["lngMwh"]) for r in rows) == Decimal(quality["lng_mwh"])
        assert sum(Decimal(r["oilMwh"]) for r in rows) == Decimal(quality["oil_category_mwh"])

    else:
        assert len(rows) == quality["months"] == 108
        assert rows[0]["month"] == "2015-01" and rows[-1]["month"] == "2023-12"
        differences = 0
        for i, r in enumerate(rows):
            assert r["month"] == f"{2015+i//12}-{i%12+1:02d}"
            for field in ["hdd", "cdd"]:
                assert type(r[field]) is int and r[field] >= 0
                own, provider = r[field+"Yoy"], r["provider"+field.upper()+"Yoy"]
                assert provider is None or type(provider) is int
                if i < 12: assert own is None
                else:
                    assert type(own) is int and own == r[field]-rows[i-12][field]
                    differences += provider is not None and own != provider
        assert differences == quality["mismatch_count"] == 20
        assert sum(r["hdd"] for r in rows) == quality["hdd_sum"] == 36249
        assert sum(r["cdd"] for r in rows) == quality["cdd_sum"] == 12720


def run(write=False):
    if write:
        OUT.mkdir(parents=True, exist_ok=True)
        manifest = {"version": 2, "purpose": "Frozen display data, no new inference", "cases": {}}
    else:
        manifest = json.loads((OUT / "manifest.json").read_text())
        assert manifest["version"] == 2 and set(manifest["cases"]) == set(SOURCES), "display version/cases changed"
    for kind, (cid, run_id, filename, revision) in SOURCES.items():
        evidence = ROOT / "research/indexes" / cid / run_id / revision
        quality_path = evidence / "quality.json"
        quality = json.loads(quality_path.read_text())
        for path, expected in quality["output_sha256"].items():
            if path.startswith("research/indexes/"):
                assert sha(ROOT / path) == expected, "tracked source chart/table hash changed"
        output = OUT / (kind + ".json")
        if write:
            source = ROOT / "research/data/processed" / cid / run_id / revision / filename
            assert sha(source) == quality["output_sha256"][str(source.relative_to(ROOT))], "processed source hash changed"
            rows = list(csv.DictReader(source.open()))
            if kind == "watermelon":
                points = [{"date":r["date"], "denominator":int(r["observed_districts"]), "numerator":int(r["value_ge4"]), "fractional":int(r["fractional_values"])} for r in rows]
            elif kind == "jeju":
                points = [{"date":r["date"], "lngMwh":r["lng_mwh"], "oilMwh":r["oil_category_mwh"], "sharePct":r["oil_share_of_two_fuels_pct"]} for r in rows]
            else:
                fields = {"hdd":"hdd", "cdd":"cdd", "hddYoy":"hdd_yoy", "cddYoy":"cdd_yoy", "providerHDDYoy":"provider_hdd_yoy", "providerCDDYoy":"provider_cdd_yoy"}
                points = [{"month":r["month"], **{key:None if r[col] == "" else int(r[col]) for key,col in fields.items()}} for r in rows]
            data = {"candidateId": cid, "runId":run_id, "points":points}
            if revision: data["revision"] = revision
            validate(kind, data, quality)
            content = (json.dumps(data, ensure_ascii=False, separators=(",", ":"))+"\n").encode()
            if output.exists(): assert output.read_bytes() == content, "immutable export changed; use new version"
            else: output.write_bytes(content)
            manifest["cases"][kind] = {"source":str(source.relative_to(ROOT)), "source_sha256":sha(source),
                                       "quality":str(quality_path.relative_to(ROOT)), "quality_sha256":sha(quality_path),
                                       "output_sha256":sha(output), "rows":len(rows)}
        else:
            record = manifest["cases"][kind]
            assert record["source"] == str((Path("research/data/processed") / cid / run_id / revision / filename)) and record["quality"] == str(quality_path.relative_to(ROOT)), "provenance path mismatch"
            assert sha(output) == record["output_sha256"] and sha(quality_path) == record["quality_sha256"], "display/quality hash mismatch"
            assert record["source_sha256"] == quality["output_sha256"][record["source"]]
            data = json.loads(output.read_text())
            assert data["candidateId"] == cid and data["runId"] == run_id and len(data["points"]) == record["rows"]
            assert data.get("revision", "") == revision
            validate(kind, data, quality)
    if write:
        content = (json.dumps(manifest, indent=2)+"\n").encode()
        path = OUT / "manifest.json"
        if path.exists(): assert path.read_bytes() == content
        else: path.write_bytes(content)
    print("PASS: three frozen charts; source hashes, all rows and aggregate reconciliation")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    run(parser.parse_args().write)
