"""CFTC COT WTI-PHYSICAL 순포지셔닝 수집과 2023년까지의 월별 탐색 검정. 저장소 루트에서 실행.

수집 전 research/indexes/ALT-20260907-39/plan-v1.json 동결 필요.
원문·대형 파생물은 gitignored. 2024+ 관측을 요청하지 않는다.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import platform
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "research/src"))
CID = "ALT-20260907-39"
CONTRACT = "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE"
ZIP_URL = "https://www.cftc.gov/files/dea/history/fut_disagg_txt_{year}.zip"
YEARS = list(range(2015, 2024))
TRAIN_END = "2020-12"
VAL_START = "2021-01"
VAL_END = "2023-12"


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def clean(value):
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    if isinstance(value, dict):
        return {k: clean(v) for k, v in value.items()}
    if isinstance(value, list):
        return [clean(v) for v in value]
    return value


def write_json(path, value):
    Path(path).write_text(json.dumps(clean(value), ensure_ascii=False, indent=2) + "\n")


UA = "ls-crude-research/1.0 (https://github.com/Noah-TaeHwan/ls-crude; contact: repo docs)"


def fetch(url, path, receipts, timeout=90):
    # CFTC 역사 아카이브는 무명 스크립트 UA를 403으로 거른다(공개 자료, 로그인·과금 없음).
    # 식별용 연구 UA를 명시한다. 브라우저 사칭·프록시·미러를 쓰지 않으며 방법은 manifest에 기록한다.
    from urllib.request import Request
    record = {"url": url, "attempted_at_utc": now(),
              "method": "stdlib urllib GET + contact User-Agent (no browser impersonation, no credentials)",
              "user_agent": UA}
    try:
        with urlopen(Request(url, headers={"User-Agent": UA}), timeout=timeout) as response:
            payload = response.read()
            record.update(status=response.status, content_type=response.headers.get("Content-Type"))
    except Exception as error:
        receipts.append(dict(record, status="FAILED", error=type(error).__name__ + ": " + str(error)[:300]))
        return False
    with open(path, "xb") as stream:
        stream.write(payload)
    record.update(path=str(path.relative_to(ROOT)), sha256=digest(path), bytes=len(payload))
    receipts.append(record)
    return record["status"] == 200


def fetch_yahoo(raw, receipts):
    from ls_crude.data.yahoo import download_ohlcv
    from ls_crude.data.splits import add_sample_split
    try:
        prices = add_sample_split(download_ohlcv("CL=F", start="2015-01-01", end="2024-01-01"))
        assert (prices["sample"] == "in").all() and prices.index.max() < pd.Timestamp("2024-01-01")
        prices.to_csv(raw / "wti.csv", mode="x")
    except Exception as error:
        receipts.append({"url": "https://finance.yahoo.com/quote/CL=F/history/", "status": "FAILED",
                         "error": type(error).__name__ + ": " + str(error)[:300], "attempted_at_utc": now(),
                         "options": {"ticker": "CL=F", "start": "2015-01-01", "end_exclusive": "2024-01-01"}})
        return False
    receipts.append({"url": "https://finance.yahoo.com/quote/CL=F/history/",
                     "path": str((raw / "wti.csv").relative_to(ROOT)), "sha256": digest(raw / "wti.csv"),
                     "rows": len(prices), "start": str(prices.index.min().date()), "end": str(prices.index.max().date()),
                     "format": "immutable yfinance-returned normalized CSV; HTTP wire bytes unavailable",
                     "options": {"ticker": "CL=F", "start": "2015-01-01", "end_exclusive": "2024-01-01",
                                 "interval": "1d", "auto_adjust": True, "multi_level_index": False},
                     "collected_at_utc": now()})
    return True


def collect():
    plan = ROOT / "research/indexes" / CID / "plan-v1.json"
    assert plan.exists(), "수집 전 계획 동결 필요"
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    raw = ROOT / "research/gathering/raw" / CID / stamp
    raw.mkdir(parents=True, exist_ok=False)
    receipts = []
    ok = True
    for year in YEARS:
        if not fetch(ZIP_URL.format(year=year), raw / f"fut_disagg_txt_{year}.zip", receipts):
            ok = False
            break
    yahoo_ok = fetch_yahoo(raw, receipts)
    manifest = {"candidate_id": CID, "run": stamp, "created_at_utc": now(),
                "plan_sha256": digest(plan), "code_sha256": digest(__file__), "command": " ".join(sys.argv),
                "contract": CONTRACT, "requests": receipts,
                "license_note": "CFTC COT reports are US government public releases; redistribution terms and revision policy must be checked against CFTC before any republication. Raw stays local. Yahoo personal research only; no price payload redistribution.",
                "rights_url": "https://www.cftc.gov/MarketReports/CommitmentsofTraders/ExplanatoryNotes/index.htm"}
    write_json(raw / "manifest.json", manifest)
    (raw / "README.md").write_text(
        f"# {CID} {stamp}\n\nImmutable local snapshot; payloads and manifest are ignored by Git.\n\n"
        f"- Collection: `{manifest['command']}`\n- Plan SHA256: `{digest(plan)}`\n"
        f"- Manifest SHA256: `{digest(raw / 'manifest.json')}`\n\n"
        + "\n".join(f"- {r['url']} — HTTP {r.get('status', 'Yahoo library')}; `{r.get('path', 'no payload')}`; SHA256 `{r.get('sha256', 'N/A')}`" for r in receipts) + "\n")
    print(raw.relative_to(ROOT))
    if not (ok and yahoo_ok):
        raise SystemExit("BLOCKED/FAILED: persisted manifest; no data substitution")


def weekly_net(raw):
    """연별 zip에서 상품코드 067651 주간 Managed Money 순포지션을 읽는다.

    동일 코드는 2015~2021년 'CRUDE OIL, LIGHT SWEET - NYMEX' · 2022년 혼재 ·
    2023년 'WTI-PHYSICAL - NYMEX'로 명명됐다. 이름이 아니라 코드로 추적하고
    연도별 관측 명칭을 coverage에 보존한다.
    """
    rows = []
    names = {}
    for year in YEARS:
        with zipfile.ZipFile(raw / f"fut_disagg_txt_{year}.zip") as zf:
            inner = [n for n in zf.namelist() if n.lower().endswith(".txt")]
            assert len(inner) == 1, f"unexpected zip contents {inner}"
            text = zf.read(inner[0]).decode("utf-8", "replace")
        reader = csv.DictReader(text.splitlines())
        assert "M_Money_Positions_Long_All" in reader.fieldnames, "CFTC 스키마 변경 가능성과 중단"
        for row in reader:
            if row["CFTC_Contract_Market_Code"].strip() != "067651":
                continue
            names.setdefault(year, set()).add(row["Market_and_Exchange_Names"].strip())
            date = pd.Timestamp(row["Report_Date_as_YYYY-MM-DD"])
            if date >= pd.Timestamp("2024-01-01"):
                raise RuntimeError("2024+ 관측 거부")
            long = int(row["M_Money_Positions_Long_All"].strip() or 0)
            short = int(row["M_Money_Positions_Short_All"].strip() or 0)
            rows.append((date, long - short))
    frame = pd.DataFrame(rows, columns=["date", "net"]).drop_duplicates("date").sort_values("date")
    assert not frame.empty and frame["date"].min() <= pd.Timestamp("2015-02-01"), "2015 초반 커버리지 부족"
    frame.attrs["names_by_year"] = {y: sorted(v) for y, v in names.items()}
    return frame


def month_start(periods):
    """월 Period를 월초 Timestamp로 정규화한다. 신호·가격 공통 규약."""
    return pd.to_datetime([f"{p.year:04d}-{p.month:02d}-01" for p in periods])


def monthly_signal(weekly):
    """월별 마지막 화요일 NET_m과 YoY 차분 I_m."""
    weekly = weekly.copy()
    weekly["month"] = weekly["date"].dt.to_period("M")
    last = weekly.groupby("month").tail(1).set_index("month")["net"].rename("net_m")
    last.index = month_start(last.index)
    signal = (last - last.shift(12)).rename("I_m").dropna()
    coverage = {"weeks": len(weekly), "first_tuesday": str(weekly['date'].min().date()),
                "last_tuesday": str(weekly['date'].max().date()), "signal_months": len(signal),
                "signal_start": str(signal.index.min().date()), "signal_end": str(signal.index.max().date())}
    return signal, coverage


def month_ends(prices):
    daily = prices.copy()
    daily.index = pd.to_datetime(daily.index).tz_localize(None).normalize()
    closes = daily["Close"].dropna()
    ends = closes.groupby(closes.index.to_period("M")).tail(1)
    ends.index = month_start(ends.index.to_period("M"))
    return ends.rename("P_m")


def pairs(signal, ends, start, end, lag=1, variant="primary", drop2020=False, shift12=False):
    sig = signal.copy()
    if shift12:
        sig = sig.copy()
        sig.index = sig.index + pd.offsets.DateOffset(months=12)
    out = []
    for month, I in sig.items():
        target = (month + pd.offsets.DateOffset(months=lag)).replace(day=1)
        if not (pd.Timestamp(start).replace(day=1) <= month <= pd.Timestamp(end).replace(day=1)):
            continue
        if not (pd.Timestamp(start).replace(day=1) <= target <= pd.Timestamp(end).replace(day=1)):
            continue
        if drop2020 and (month.year in (2020, 2021)):
            continue
        prev = target - pd.offsets.DateOffset(months=1)
        if target not in ends.index or prev not in ends.index:
            continue
        p1, p0 = float(ends[target]), float(ends[prev])
        if not (np.isfinite(I) and np.isfinite(p1) and np.isfinite(p0)) or p1 <= 0 or p0 <= 0:
            continue
        out.append({"I": float(I), "r": p1 / p0 - 1, "d": p1 - p0})
    frame = pd.DataFrame(out)
    return frame


def pearson(x, y):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    if len(x) < 2 or np.std(x) == 0 or np.std(y) == 0:
        return float("nan")
    return float(np.corrcoef(x, y)[0, 1])


def test_row(name, split, frame, col="r"):
    return {"test": name, "split": split, "n": len(frame),
            "r": pearson(frame["I"], frame[col]) if len(frame) else float("nan")}


def analyze(raw_arg):
    raw = (ROOT / raw_arg).resolve()
    assert raw.exists(), "raw 경로 없음"
    plan = ROOT / "research/indexes" / CID / "plan-v1.json"
    manifest = json.loads((raw / "manifest.json").read_text())
    stamp = manifest["run"]
    outdir = ROOT / "research/indexes" / CID / stamp
    proc = ROOT / "research/data/processed" / CID / stamp
    outdir.mkdir(parents=True, exist_ok=False)
    proc.mkdir(parents=True, exist_ok=False)
    prices = pd.read_csv(raw / "wti.csv", index_col=0, parse_dates=True)
    assert prices.index.max() < pd.Timestamp("2024-01-01"), "2024+ 가격 거부"
    weekly = weekly_net(raw)
    signal, coverage = monthly_signal(weekly)
    coverage["contract_code"] = "067651"
    coverage["names_by_year"] = weekly.attrs.get("names_by_year", {})
    ends = month_ends(prices)
    monthly = pd.DataFrame({"I_m": signal}).join(pd.DataFrame({"P_m": ends}), how="left")
    monthly.index.name = "month"
    monthly.to_csv(proc / "monthly.csv")
    tests = []
    for split, s, e in [("train 2015-2020", "2015-01", TRAIN_END), ("validation 2021-2023", VAL_START, VAL_END)]:
        for lag in (-1, 0, 1, 2):
            fr = pairs(signal, ends, s, e, lag=lag)
            row = test_row(f"corr lag{lag:+d}" + (" [PRIMARY]" if lag == 1 else ""), split, fr)
            tests.append(row)
            if lag == 1:
                tests.append(test_row("dollar change aux lag+1", split, pairs(signal, ends, s, e, lag=1), col="d"))
        tests.append(test_row("placebo 12m shift lag+1", split, pairs(signal, ends, s, e, lag=1, shift12=True)))
        tests.append(test_row("delay +1m sensitivity", split, pairs(signal, ends, s, e, lag=2)))
        tests.append(test_row("drop-2020 sensitivity lag+1", split, pairs(signal, ends, s, e, lag=1, drop2020=True)))
        base = []
        for month in pd.period_range(s, e, freq="M"):
            t = month_start([month])[0]
            t1 = (t + pd.offsets.DateOffset(months=1)).replace(day=1)
            if t1 > pd.Timestamp(e).replace(day=1) or t not in ends.index or (t1 - pd.offsets.DateOffset(months=1)).replace(day=1) not in ends.index:
                pass
            if t in ends.index and t1 in ends.index:
                p1, p0 = float(ends[t1]), float(ends[t])
                pp = (t - pd.offsets.DateOffset(months=1)).replace(day=1)
                if pp in ends.index and p1 > 0 and p0 > 0 and float(ends[pp]) > 0:
                    base.append({"I": p0 / float(ends[pp]) - 1, "r": p1 / p0 - 1})
        tests.append(test_row("WTI autocorr baseline (ref only)", split, pd.DataFrame(base)))
    tests_frame = pd.DataFrame(tests)
    tests_frame.to_csv(outdir / "tests.csv", index=False)
    # 독립 재계산 (stdlib, pandas 미사용)
    import csv as _csv
    im, pm = {}, {}
    with open(proc / "monthly.csv", newline="") as f:
        for row in _csv.DictReader(f):
            if row["I_m"]:
                im[row["month"][:7]] = float(row["I_m"])
            if row["P_m"]:
                pm[row["month"][:7]] = float(row["P_m"])
    def months(a, b):
        out, y, m = [], int(a[:4]), int(a[5:7])
        while f"{y:04d}-{m:02d}" <= b:
            out.append(f"{y:04d}-{m:02d}")
            m += 1
            if m == 13:
                y, m = y + 1, 1
        return out
    def ind_pairs(s, e):
        xs, ys = [], []
        for mm in months(s, e):
            y, m = int(mm[:4]), int(mm[5:7])
            nm = f"{y + (m == 12):04d}-{m % 12 + 1:02d}"
            if mm in im and mm in pm and nm in pm and pm[mm] > 0 and pm[nm] > 0 and nm <= e:
                xs.append(im[mm])
                ys.append(pm[nm] / pm[mm] - 1)
        return xs, ys
    def ind_r(xs, ys):
        n = len(xs)
        if n < 2:
            return n, float("nan")
        mx, my = sum(xs) / n, sum(ys) / n
        cov = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        vx = sum((a - mx) ** 2 for a in xs)
        vy = sum((b - my) ** 2 for b in ys)
        return n, (cov / (vx * vy) ** 0.5) if vx and vy else float("nan")
    review = {"checked_at_utc": now(), "method": "stdlib csv 월별 재계산 (pandas 미사용)"}
    for split, s, e in [("train 2015-2020", "2016-01", TRAIN_END), ("validation 2021-2023", VAL_START, VAL_END)]:
        n, r = ind_r(*ind_pairs(s, e))
        main = tests_frame[(tests_frame["test"] == "corr lag+1 [PRIMARY]") & (tests_frame["split"] == split)].iloc[0]
        review[split] = {"n_lib": int(main['n']), "r_lib": float(main['r']), "n_std": n, "r_std": r,
                         "match": bool(n == int(main['n']) and abs(r - float(main['r'])) < 1e-9)}
    review["verdict"] = "PASS" if all(v["match"] for k, v in review.items() if isinstance(v, dict)) else "FAIL"
    write_json(outdir / "independent-finance-review.json", review)
    # 그림
    fig, ax = plt.subplots(figsize=(9, 3.5))
    ax.plot(signal.index, signal.values, lw=1)
    ax.axvspan(pd.Timestamp("2015-01-01"), pd.Timestamp("2020-12-31"), alpha=0.12)
    ax.set_title(f"{CID} Managed Money net YoY change (contracts)")
    ax.set_xlabel("month")
    fig.tight_layout()
    fig.savefig(outdir / "activity.svg")
    plt.close(fig)
    prim = {}
    for split, s, e in [("train", "2015-01", TRAIN_END), ("validation", VAL_START, VAL_END)]:
        fr = pairs(signal, ends, s, e, lag=1)
        prim[split] = fr
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
    for axi, (k, fr) in zip(axes, prim.items()):
        if len(fr):
            axes[0].scatter(fr["I"], fr["r"], s=8, alpha=0.7, label=f"{k} n={len(fr)}")
        else:
            axes[0].scatter([], [], s=8, alpha=0.7, label=f"{k} n=0 (EMPTY)")
    axes[0].set_xlabel("I_m (MM net YoY, contracts)")
    axes[0].set_ylabel("next-month WTI return")
    axes[0].legend(fontsize=8)
    lagrows = tests_frame[(tests_frame["test"].str.startswith("corr lag")) & (tests_frame["split"] == "train 2015-2020")]
    axes[1].plot([-1, 0, 1, 2], lagrows["r"].tolist(), marker="o")
    axes[1].set_xticks([-1, 0, 1, 2])
    axes[1].set_title("lag curve (train, exploratory)")
    fig.tight_layout()
    fig.savefig(outdir / "relationship.svg")
    plt.close(fig)
    outputs = [proc / "monthly.csv", outdir / "tests.csv", outdir / "independent-finance-review.json",
               outdir / "activity.svg", outdir / "relationship.svg"]
    receipt = {"candidate_id": CID, "run": stamp, "analyzed_at_utc": now(), "command": " ".join(sys.argv),
               "cwd": str(ROOT), "git_head": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
               "git_dirty": bool(subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True)),
               "code_sha256": digest(__file__), "plan_path": str(plan.relative_to(ROOT)), "plan_sha256": digest(plan),
               "raw_manifest": str((raw / "manifest.json").relative_to(ROOT)),
               "raw_manifest_sha256": digest(raw / "manifest.json"), "inputs": manifest["requests"],
               "coverage": coverage, "outputs": {str(p.relative_to(ROOT)): digest(p) for p in outputs},
               "status": "exploratory observed-month relationship only", "asof_safe": "NOT_PROVEN",
               "oos_evaluation": "NOT_RUN; no 2024+ loaded",
               "review": "Finance independent recomputation " + review["verdict"]}
    write_json(outdir / "receipt.json", receipt)
    print(f"analyzed {stamp} finance-{review['verdict']}")
    for _, row in tests_frame.iterrows():
        print(f"{row['split']} | {row['test']} | n={int(row['n'])} r={row['r']:.6f}")


def self_check():
    """합성 전용 검사. 실제 연구 통계에 포함되지 않는다."""
    wk = pd.DataFrame({"date": pd.to_datetime(["2023-01-03", "2023-01-10", "2023-01-31", "2023-02-07"]), "net": [1, 2, 3, 4]})
    wk["month"] = wk["date"].dt.to_period("M")
    last = wk.groupby("month").tail(1)
    assert last.iloc[0]["net"] == 3 and last.iloc[1]["net"] == 4, "월별 마지막 화요일 선택"
    monthly = pd.DataFrame({"date": pd.date_range("2022-01-01", periods=13, freq="MS"), "net": range(13)})
    signal, _ = monthly_signal(monthly)
    assert signal.to_dict() == {pd.Timestamp("2023-01-01"): 12.0}, "실제 산식의 전년동월 차분"
    with tempfile.TemporaryDirectory() as directory:
        raw = Path(directory)
        with zipfile.ZipFile(raw / "fut_disagg_txt_2015.zip", "w") as archive:
            archive.writestr("sample.txt", "CFTC_Contract_Market_Code,Market_and_Exchange_Names,Report_Date_as_YYYY-MM-DD,M_Money_Positions_Long_All,M_Money_Positions_Short_All\n067651,synthetic,2024-01-02,2,1\n")
        try:
            weekly_net(raw)
        except RuntimeError as error:
            assert str(error) == "2024+ 관측 거부"
        else:
            raise AssertionError("2024+ 가드 미작동")
    ends = pd.Series([10.0, 15.0], index=pd.to_datetime(["2023-01-01", "2023-02-01"]))
    sig = pd.Series([1.0], index=pd.to_datetime(["2023-01-01"]))
    assert pairs(sig, ends, "2023-01", "2023-02", lag=1)["r"].tolist() == [0.5], "유효한 가격 창 포함"
    ends.iloc[1] = -5.0
    assert pairs(sig, ends, "2023-01", "2023-02", lag=1).empty, "비양수 가격 창 제외"
    print("PASS: synthetic-only checks for last-Tuesday pick, nonpositive exclusion, 2024+ guard")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["collect", "analyze", "check"])
    parser.add_argument("--raw", default=None)
    args = parser.parse_args()
    if args.command == "collect":
        collect()
    elif args.command == "analyze":
        if args.raw is None:
            parser.error("analyze requires --raw")
        analyze(args.raw)
    else:
        self_check()
