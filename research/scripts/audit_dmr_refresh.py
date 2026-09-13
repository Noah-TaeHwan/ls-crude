#!/usr/bin/env python3
"""2023 South STP 재수집본을 전처리하고 기존 입력과 대조한다. 학습·다운로드는 하지 않는다."""
import argparse
import csv
import hashlib
import json
import math
import statistics
from datetime import datetime
from pathlib import Path

from build_pilot_inputs import build_dmr


def extract(doc):
    """공식 응답의 시설·기간·통계 기준을 검증하고 두 유량 계열을 분리한다."""
    result = doc["Results"]
    if (result.get("SourceId"), result.get("CWPCity"), result.get("CWPState")) != ("OK0026701", "CUSHING", "OK"):
        raise ValueError("대상 시설 불일치")
    if (result.get("StartDate"), result.get("EndDate")) != ("01/01/2023", "12/31/2023"):
        raise ValueError("2023년 고정 조회 범위 불일치")
    rows, keys = [], set()
    for feature in result.get("PermFeatures", []):
        if feature.get("PermFeatureNmbr") != "001":
            continue
        for parameter in feature.get("Parameters", []):
            if parameter.get("ParameterCode") != "50050":
                continue
            if parameter.get("MonitoringLocationDesc") != "Effluent Gross":
                raise ValueError("측정 위치 불일치")
            for item in parameter.get("DischargeMonitoringReports", []):
                date = datetime.strptime(item["MonitoringPeriodEndDate"], "%d-%b-%y").date().isoformat()
                basis = item.get("StatisticalBaseDesc")
                if not date.startswith("2023-") or basis not in ("MO AVG", "DAILY MX") or item.get("DMRUnitDesc") != "MGD":
                    raise ValueError("기간·단위·통계 기준 불일치")
                key = (date, basis)
                if key in keys:
                    raise ValueError("중복 계열 날짜")
                keys.add(key)
                raw = item.get("DMRValueNmbr")
                value = ""
                if raw is not None and not item.get("NODICode"):
                    if item.get("DMRValueQualifierCode") != "=":
                        raise ValueError("부등호·추정값을 정확한 관측값으로 처리할 수 없음")
                    numeric = float(raw)
                    if not math.isfinite(numeric) or numeric < 0:
                        raise ValueError("잘못된 유량")
                    value = str(numeric)
                received = item.get("ValueReceivedDate")
                received = datetime.strptime(received, "%d-%b-%y").date().isoformat() if received else ""
                if value and (not received or received < date):
                    raise ValueError("접수일 누락·역전")
                rows.append(dict(permit_id="OK0026701", outfall="001", unit="MGD", basis=basis,
                                 date=date, value_num=value, received_date=received, nodi=item.get("NODICode") or ""))
    if not rows:
        raise ValueError("유량 관측 없음")
    return sorted(rows, key=lambda row: (row["basis"], row["date"]))


def audit(raw, baseline, out):
    """새 폴더에 정제 CSV·기초통계·기존값 비교를 저장한다. 과거 입력을 덮어쓰지 않는다."""
    rows = extract(json.loads(raw.read_text()))
    with baseline.open(newline="") as file:
        old = [row for row in csv.DictReader(file) if row["date"].startswith("2023-")]
    if len({row["date"] for row in old}) != len(old):
        raise ValueError("기존 입력 날짜 중복")
    out.mkdir(parents=True, exist_ok=False)
    series = out / "dmr_series_rows.csv"
    with series.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader(); writer.writerows(rows)
    build_dmr(str(series), str(out / "dmr_daily_max_2023.csv"))
    with (out / "dmr_monthly_mean_2023.csv").open("w", newline="") as file:
        writer = csv.writer(file, lineterminator="\n")
        writer.writerow(["date", "value", "available_at"])
        writer.writerows((r["date"], r["value_num"], r["received_date"]) for r in rows if r["basis"] == "MO AVG")
    stats = {}
    for basis in ("MO AVG", "DAILY MX"):
        group = [r for r in rows if r["basis"] == basis]
        valid = [r for r in group if r["value_num"]]
        values = [float(r["value_num"]) for r in valid]
        lags = [(datetime.fromisoformat(r["received_date"]) - datetime.fromisoformat(r["date"])).days for r in valid]
        stats[basis] = dict(rows=len(group), numeric_rows=len(valid), missing_values=len(group)-len(valid),
                            missing_months=sorted(set(range(1,13))-{int(r["date"][5:7]) for r in group}),
                            min=min(values) if values else None, max=max(values) if values else None,
                            mean=statistics.mean(values) if values else None,
                            receipt_lag_days=dict(min=min(lags), median=statistics.median(lags), max=max(lags)) if lags else None)
    old_by_date = {r["date"]: r for r in old}
    new_by_date = {r["date"]: r for r in rows if r["basis"] == "DAILY MX" and r["value_num"]}
    common = sorted(old_by_date.keys() & new_by_date.keys())
    changed = [date for date in common if float(old_by_date[date]["value"]) != float(new_by_date[date]["value_num"]) or old_by_date[date]["available_at"] != new_by_date[date]["received_date"]]
    report = dict(window=["2023-01-01","2023-12-31"], unit="MGD", raw_rows=len(rows), stats=stats,
                  comparison=dict(common_rows=len(common), changed_value_or_receipt_dates=changed,
                                  added_dates=sorted(new_by_date.keys()-old_by_date.keys()), removed_dates=sorted(old_by_date.keys()-new_by_date.keys())),
                  limitations=["월평균과 월중 일최댓값은 별도 계열이며 서로 평균하지 않음.", "ValueReceivedDate is regulatory receipt, not first public date.", "Retrospective only; no training or OOS; no new CAI component."],
                  files={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in [raw,baseline,Path(__file__),Path(__file__).with_name("build_pilot_inputs.py"),*sorted(out.glob("*.csv"))]})
    (out / "audit.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({"raw_rows":len(rows),"stats":stats,"comparison":report["comparison"]},ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw", type=Path, required=True)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    audit(args.raw, args.baseline, args.out)
