"""공식 활동 자료 수집과 2023년까지의 월별 탐색 검정. 저장소 루트에서 실행."""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import platform
import subprocess
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import urlopen

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "research/src"))
IDS = {"01": "ALT-20260907-01", "03": "ALT-20260907-03"}
MONTHS = pd.period_range("2015-01", "2023-12", freq="M")


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n")


def fetch(url, path, receipts):
    """원문 bytes를 새 경로에 보존한다. HTTP 차단은 우회하지 않는다."""
    record = {"url": url, "attempted_at_utc": now(), "method": "stdlib urllib GET, default headers, no credentials"}
    try:
        with urlopen(url, timeout=40) as response:
            payload = response.read()
            record.update(status=response.status, content_type=response.headers.get("Content-Type"))
    except HTTPError as error:
        payload = error.read()
        record.update(status=error.code, error=str(error))
    except Exception as error:
        receipts.append(dict(record, status="FAILED", error=str(error)))
        return False
    with path.open("xb") as stream:
        stream.write(payload)
    record.update(path=str(path.relative_to(ROOT)), sha256=digest(path), bytes=len(payload))
    receipts.append(record)
    return record["status"] == 200


def collect(candidate):
    cid = IDS[candidate]
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    raw = ROOT / "research/gathering/raw" / cid / stamp
    raw.mkdir(parents=True, exist_ok=False)
    plan = ROOT / "research/indexes" / cid / "plan-v1.json"
    assert plan.exists(), "수집 전 계획 동결 필요"
    receipts = []
    if candidate == "01":
        fetch("https://agtransport.usda.gov/api/views/n4pw-9ygw.json", raw / "metadata.json", receipts)
        params = {"$where": "date >= '2015-01-01T00:00:00' AND date < '2024-01-01T00:00:00' AND lock in ('MS Locks 27','Miss Locks 27')", "$order": "date,commodity", "$limit": 10000}
        fetch("https://agtransport.usda.gov/resource/n4pw-9ygw.json?" + urlencode(params), raw / "activity.json", receipts)
    else:
        for year in range(2019, 2024):
            if not fetch(f"https://www.tsa.gov/travel/passenger-volumes/{year}", raw / f"tsa-{year}.html", receipts):
                break
    yahoo_ok = fetch_yahoo(raw, receipts)
    manifest = {"candidate_id": cid, "run": stamp, "created_at_utc": now(), "plan_sha256": digest(plan), "code_sha256": digest(__file__), "command": " ".join(sys.argv), "requests": receipts, "license_note": "USDA GTR page identifies aggregated non-confidential/non-copyrighted sources; raw stays local. TSA access does not establish redistribution permission. Yahoo personal research only; no price payload redistribution.", "rights_url": "https://www.ams.usda.gov/services/transportation-analysis/gtr-datasets"}
    write_json(raw / "manifest.json", manifest)
    (raw / "README.md").write_text(f"# {cid} {stamp}\n\nImmutable local snapshot; payloads and manifest are ignored by Git.\n\n- Collection: `{manifest['command']}`\n- Plan SHA256: `{digest(plan)}`\n- Manifest SHA256: `{digest(raw / 'manifest.json')}`\n\n" + "\n".join(f"- {r['url']} — HTTP {r.get('status','Yahoo library')}; `{r.get('path','no payload')}`; SHA256 `{r.get('sha256','N/A')}`" for r in receipts) + "\n")
    print(raw.relative_to(ROOT))
    if not yahoo_ok or any(r.get("status") not in {None, 200} for r in receipts):
        raise SystemExit("BLOCKED/FAILED: persisted manifest; no data substitution")


def fetch_yahoo(raw, receipts):
    """가격 오류도 영수증으로 보존한다. 2024+ 관측을 요청하지 않는다."""
    from ls_crude.data.yahoo import download_ohlcv
    from ls_crude.data.splits import add_sample_split
    try:
        prices = add_sample_split(download_ohlcv("CL=F", start="2015-01-01", end="2024-01-01"))
        assert (prices["sample"] == "in").all() and prices.index.max() < pd.Timestamp("2024-01-01")
        prices.to_csv(raw / "wti.csv", mode="x")
    except Exception as error:
        receipts.append({"url": "https://finance.yahoo.com/quote/CL=F/history/", "status": "FAILED", "error": type(error).__name__ + ": " + str(error)[:300], "attempted_at_utc": now(), "options": {"ticker": "CL=F", "start": "2015-01-01", "end_exclusive": "2024-01-01"}})
        return False
    receipts.append({"url": "https://finance.yahoo.com/quote/CL=F/history/", "path": str((raw / "wti.csv").relative_to(ROOT)), "sha256": digest(raw / "wti.csv"), "rows": len(prices), "start": str(prices.index.min().date()), "end": str(prices.index.max().date()), "format": "immutable yfinance-returned normalized CSV; HTTP wire bytes unavailable", "options": {"ticker": "CL=F", "start": "2015-01-01", "end_exclusive": "2024-01-01", "interval": "1d", "auto_adjust": True, "multi_level_index": False}, "collected_at_utc": now()})
    return True


class TableRows(HTMLParser):
    """TSA 표의 셀 텍스트만 읽는 표준 라이브러리 파서."""
    def __init__(self):
        super().__init__(); self.rows = []; self.row = []; self.cell = None
    def handle_starttag(self, tag, attrs):
        if tag == "tr": self.row = []
        if tag in {"td", "th"}: self.cell = []
    def handle_data(self, text):
        if self.cell is not None: self.cell.append(text)
    def handle_endtag(self, tag):
        if tag in {"td", "th"} and self.cell is not None:
            self.row.append("".join(self.cell).strip()); self.cell = None
        if tag == "tr" and self.row: self.rows.append(self.row)


def monthly_activity(raw, candidate):
    """빈 관측을 0으로 바꾸지 않고 월별 완전성과 전년동월 신호를 계산한다."""
    if candidate == "01":
        frame = pd.DataFrame(json.loads((raw / "activity.json").read_text()))
        required = {"date", "commodity", "lock", "tons"}
        assert required <= set(frame), "USDA schema drift"
        frame["date"] = pd.to_datetime(frame["date"])
        frame["tons"] = pd.to_numeric(frame["tons"], errors="raise")
        assert np.isfinite(frame["tons"].dropna()).all(), "nonfinite source tons"
        assert len(frame) < 10000, "API result may be truncated"
        assert not frame.duplicated(["date", "commodity", "lock"]).any()
        # 제공자 설명은 Other, 실제 API 범주는 Other Grain이다.
        assert set(frame["commodity"]) == {"Corn", "Soybeans", "Wheat", "Other Grain"}
        assert frame["lock"].nunique() == 1 and (frame["date"].dt.dayofweek == 5).all()
        assert not (frame["tons"] < 0).any()
        grouped = frame.groupby("date")["tons"].agg(["sum", "count"])
        observed = grouped["sum"].where(grouped["count"] == 4)
        calendar = pd.date_range("2015-01-01", "2023-12-31", freq="W-SAT")
        source_system = "USDA/USACE LPMS n4pw-9ygw"
        unit = "mean weekly short tons assigned by Saturday week-end month"
        source_rows = len(frame)
        source_missing_cells = int(frame["tons"].isna().sum())
    else:
        rows = []
        for year in range(2019, 2024):
            path = raw / f"tsa-{year}.html"
            assert path.exists(), f"TSA year{year} unavailable; collection remains partial"
            parser = TableRows(); parser.feed(path.read_text())
            for row in parser.rows:
                if len(row) >= 2:
                    try:
                        date = pd.to_datetime(row[0], format="%m/%d/%Y")
                        count = int(row[1].replace(",", ""))
                    except (ValueError, TypeError):
                        continue
                    assert date.year == year, "TSA archive contains unexpected year"
                    rows.append((date, count))
        frame = pd.DataFrame(rows, columns=["date", "count"])
        assert not frame.empty and not frame["date"].duplicated().any()
        assert (frame["count"] >= 0).all()
        observed = frame.set_index("date")["count"]
        calendar = pd.date_range("2019-01-01", "2023-12-31", freq="D")
        source_system = "TSA checkpoint passenger volumes"
        unit = "mean daily checkpoint travelers"
        source_rows = len(frame)
        source_missing_cells = 0
    assert observed.index.min() >= pd.Timestamp("2015-01-01") and observed.index.max() < pd.Timestamp("2024-01-01")
    series = observed.reindex(calendar)
    result = series.groupby(series.index.to_period("M")).agg(activity="mean", observed="count", expected="size").reindex(MONTHS)
    result["complete"] = result["observed"].eq(result["expected"]) & result["observed"].gt(0)
    result["activity"] = result["activity"].where(result["complete"])
    positive = result["activity"].where(result["activity"] > 0)
    result["signal"] = 100 * np.log(positive / positive.shift(12))
    result["data_quality_score"] = result["complete"].astype(int)
    result["source_system"] = source_system
    result["created_at"] = json.loads((raw / "manifest.json").read_text())["created_at_utc"]
    result["updated_at"] = result["created_at"]
    result["deleted_at"] = ""
    result["unit"] = unit
    return result, {"source_rows": source_rows, "source_start": str(observed.index.min().date()), "source_end": str(observed.index.max().date()), "source_zero_values": int((observed == 0).sum()), "source_missing_cells": source_missing_cells, "missing_observations": int(series.isna().sum()), "complete_months": int(result["complete"].sum()), "signal_months": int(result["signal"].notna().sum())}


def monthly_prices(prices):
    assert not prices.index.duplicated().any()
    assert prices.index.max() < pd.Timestamp("2024-01-01"), "OOS leakage"
    close = prices["Close"].astype(float).sort_index()
    assert np.isfinite(close.dropna()).all(), "nonfinite WTI price"
    rows = []
    for month in MONTHS:
        current = close[close.index.to_period("M") == month]
        previous = close[close.index.to_period("M") == month - 1]
        if current.empty or previous.empty:
            rows.append({"month": month, "p": current.iloc[-1] if len(current) else np.nan, "r": np.nan, "d": np.nan, "bad_window": True})
            continue
        window = close.loc[previous.index[-1]:current.index[-1]]
        bad = window.isna().any() or (window <= 0).any()
        rows.append({"month": month, "p": current.iloc[-1], "r": np.nan if bad else current.iloc[-1] / previous.iloc[-1] - 1, "d": current.iloc[-1] - previous.iloc[-1], "bad_window": bool(bad)})
    return pd.DataFrame(rows).set_index("month")


def pairs(monthly, prices, start, end, lag=1, variant="primary"):
    idx = monthly.index
    signal = monthly["signal"].copy()
    if variant == "placebo12":
        signal = signal.where((idx >= start) & (idx <= end)).shift(12)
    if variant == "delay1": signal = signal.shift(1)
    if variant == "wti_baseline": signal = prices["r"]
    metric = "d" if variant == "dollar" else "r"
    result = pd.DataFrame({"signal": signal, "target": prices[metric].shift(-lag)})
    # Both target endpoints must remain in the same split, including negative lags.
    valid = (idx >= start) & (idx <= end) & (idx + lag <= end) & (idx + lag - 1 >= start)
    if variant == "delay1": valid &= idx - 1 >= start
    if variant == "no2020":
        valid &= (idx.year != 2020) & ((idx - 12).year != 2020) & ((idx + lag).year != 2020) & ((idx + lag - 1).year != 2020)
    return result.loc[valid].dropna()


def analyses(monthly, prices):
    rows = []
    for split, start, end in [("train", "2015-01", "2020-12"), ("validation", "2021-01", "2023-12")]:
        for variant, lag in [("primary", k) for k in [-1, 0, 1, 2]] + [(x, 1) for x in ["dollar", "placebo12", "no2020", "delay1", "wti_baseline"]]:
            data = pairs(monthly, prices, pd.Period(start), pd.Period(end), lag, variant)
            corr = data["signal"].corr(data["target"]) if len(data) >= 3 else np.nan
            rows.append({"split": split, "variant": variant, "lag_months": lag, "n": len(data), "pearson_r": corr, "first_signal_month": str(data.index.min()) if len(data) else "", "last_signal_month": str(data.index.max()) if len(data) else "", "inference": "NOT_PROVEN; no p-values", "asof_safe": "NOT_PROVEN"})
    return pd.DataFrame(rows)


def analyze(raw, candidate):
    raw = raw.resolve()
    cid = IDS[candidate]
    manifest = json.loads((raw / "manifest.json").read_text())
    assert manifest["candidate_id"] == cid, "raw candidate mismatch"
    plan = ROOT / "research/indexes" / cid / "plan-v1.json"
    assert digest(plan) == manifest["plan_sha256"], "frozen plan changed"
    for entry in manifest["requests"]:
        if "path" in entry: assert digest(ROOT / entry["path"]) == entry["sha256"]
    monthly, coverage = monthly_activity(raw, candidate)
    daily = pd.read_csv(raw / "wti.csv", index_col="date", parse_dates=True)
    price = monthly_prices(daily)
    stats = analyses(monthly, price)
    run = raw.name
    processed = ROOT / "research/data/processed" / cid / run
    outputs = ROOT / "research/indexes" / cid / run
    processed.mkdir(parents=True, exist_ok=True); outputs.mkdir(parents=True, exist_ok=True)
    monthly.join(price).to_csv(processed / "monthly.csv", index_label="month")
    stats.to_csv(outputs / "tests.csv", index=False, float_format="%.12g")
    monthly[["observed", "expected", "complete", "data_quality_score"]].to_csv(outputs / "coverage.csv", index_label="month")
    price.loc[price["bad_window"]].to_csv(outputs / "excluded-price-windows.csv", index_label="return_month")
    monthly.loc[monthly["signal"].abs() > 100, ["activity", "signal"]].to_csv(outputs / "outlier-signals.csv", index_label="month")
    coverage.update(wti_daily_rows=len(daily), wti_nonpositive_days=int((daily.Close <= 0).sum()), wti_missing_close=int(daily.Close.isna().sum()), monthly_invalid_return_windows=int(price.bad_window.sum()), signal_abs_over100=int((monthly.signal.abs() > 100).sum()))
    write_json(outputs / "coverage.json", coverage)
    plt.rcParams.update({"svg.hashsalt": "ls-crude-hunt-v1", "font.size": 9})
    fig, axes = plt.subplots(2, 1, figsize=(9, 5), sharex=True)
    axes[0].plot(monthly.index.to_timestamp(), monthly.activity, color="#176b79")
    axes[0].set_ylabel("Activity (" + ("short tons/week" if candidate == "01" else "travelers/day") + ")")
    axes[1].plot(monthly.index.to_timestamp(), monthly.signal, color="#8d4e1d")
    axes[1].set_ylabel("100 ln(activity / year-ago)")
    for ax in axes: ax.axvline(pd.Timestamp("2021-01-01"), color="gray", linestyle="--"); ax.grid(alpha=.2)
    axes[0].set_title(cid + " | observed-month snapshot; as-of timing NOT_PROVEN")
    fig.tight_layout(); fig.savefig(outputs / "activity.svg", metadata={"Date": None}); plt.close(fig)
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.7))
    for split, start, end, color in [("train", "2015-01", "2020-12", "#176b79"), ("validation", "2021-01", "2023-12", "#b36428")]:
        data = pairs(monthly, price, pd.Period(start), pd.Period(end))
        axes[0].scatter(data.signal, data.target * 100, label=split, s=14, alpha=.65, color=color)
        curve = stats[(stats.split == split) & (stats.variant == "primary")]
        axes[1].plot(curve.lag_months, curve.pearson_r, marker="o", label=split, color=color)
    axes[0].set(xlabel="Activity YoY log change ×100", ylabel="Next-month WTI return (%)")
    axes[1].set(xlabel="k in corr(I_m, r_(m+k)); months", ylabel="Pearson r", xticks=[-1, 0, 1, 2], ylim=(-1, 1))
    for ax in axes: ax.grid(alpha=.2); ax.legend()
    fig.suptitle("Exploratory only | all variants in tests.csv | no significance claim")
    fig.tight_layout(); fig.savefig(outputs / "relationship.svg", metadata={"Date": None}); plt.close(fig)
    output_files = list(outputs.glob("*.csv")) + list(outputs.glob("*.svg")) + [outputs / "coverage.json", processed / "monthly.csv"]
    import yfinance
    receipt = {"candidate_id": cid, "run": run, "analyzed_at_utc": now(), "command": " ".join(sys.argv), "cwd": str(ROOT), "git_head": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(), "git_dirty": bool(subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True)), "code_sha256": digest(__file__), "plan_path": str(plan.relative_to(ROOT)), "plan_sha256": digest(plan), "raw_manifest": str((raw / "manifest.json").relative_to(ROOT)), "raw_manifest_sha256": digest(raw / "manifest.json"), "inputs": manifest["requests"], "versions": {"python": platform.python_version(), "pandas": pd.__version__, "numpy": np.__version__, "matplotlib": matplotlib.__version__}, "outputs": {str(p.relative_to(ROOT)): digest(p) for p in output_files}, "status": "exploratory observed-month relationship only", "asof_safe": "NOT_PROVEN", "oos_evaluation": "NOT_RUN; no2024+ loaded", "review": "Finance independent recomputation pending"}
    receipt["versions"]["yfinance"] = yfinance.__version__
    receipt["shared_code_hashes"] = {str(p.relative_to(ROOT)): digest(p) for p in [ROOT / "research/src/ls_crude/data/yahoo.py", ROOT / "research/src/ls_crude/data/splits.py"]}
    write_json(outputs / "receipt.json", receipt)
    print(stats.to_string(index=False)); print(json.dumps(coverage)); print(outputs.relative_to(ROOT))


def self_check():
    """합성값은 누수/정렬/음수가격 회귀검사에만 쓰고 실증 출력에 섞지 않는다."""
    ix = pd.to_datetime(["2019-12-31", "2020-01-02", "2020-01-15", "2020-01-31", "2020-02-28"])
    price = monthly_prices(pd.DataFrame({"Close": [10, 11, -1, 12, 15]}, index=ix))
    assert np.isnan(price.loc["2020-01", "r"]) and price.loc["2020-01", "d"] == 2
    assert price.loc["2020-02", "r"] == .25
    monthly = pd.DataFrame({"signal": np.arange(len(MONTHS), dtype=float)}, index=MONTHS)
    synthetic_price = pd.DataFrame({"r": np.arange(len(MONTHS), dtype=float), "d": 1}, index=MONTHS)
    train = pairs(monthly, synthetic_price, pd.Period("2015-01"), pd.Period("2020-12"))
    assert str(train.index.max()) == "2020-11" and (train.target == train.signal + 1).all()
    validation = pairs(monthly, synthetic_price, pd.Period("2021-01"), pd.Period("2023-12"), -1)
    assert str(validation.index.min()) == "2021-03"
    placebo = pairs(monthly, synthetic_price, pd.Period("2021-01"), pd.Period("2023-12"), 1, "placebo12")
    assert str(placebo.index.min()) == "2022-01"
    delayed = pairs(monthly, synthetic_price, pd.Period("2021-01"), pd.Period("2023-12"), 1, "delay1")
    assert str(delayed.index.min()) == "2021-02"
    try:
        monthly_prices(pd.DataFrame({"Close": [1]}, index=pd.to_datetime(["2024-01-02"])))
    except AssertionError:
        pass
    else:
        raise AssertionError("OOS guard failed")
    from tempfile import TemporaryDirectory
    from unittest.mock import patch
    with TemporaryDirectory() as temp, patch("ls_crude.data.yahoo.download_ohlcv", side_effect=ConnectionError("synthetic test failure")):
        receipts = []
        assert fetch_yahoo(Path(temp), receipts) is False
        assert receipts[0]["status"] == "FAILED" and not (Path(temp) / "wti.csv").exists()
    print("PASS: synthetic-only checks for target alignment, split purge, nonpositive interior price, placebo boundary, OOS rejection, Yahoo failure receipt")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["collect", "analyze", "check"])
    parser.add_argument("--candidate", choices=IDS, default="01")
    parser.add_argument("--raw", type=Path)
    args = parser.parse_args()
    if args.command == "collect": collect(args.candidate)
    elif args.command == "analyze":
        if args.raw is None: parser.error("analyze requires --raw")
        analyze(args.raw, args.candidate)
    else: self_check()
