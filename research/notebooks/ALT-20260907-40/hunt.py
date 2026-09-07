"""Wikimedia 에너지 문서 조회수 수집과 2023년까지의 월별 탐색 검정. 저장소 루트에서 실행.

수집 전 research/indexes/ALT-20260907-40/plan-v1.json 동결 필요.
원문·대형 파생물은 gitignored. 2024+ 관측을 요청하지 않는다.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import platform
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "research/src"))
CID = "ALT-20260907-40"
ARTICLES = ["OPEC", "Petroleum", "Shale_gas"]
API = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
       "en.wikipedia/all-access/user/{article}/daily/{start}/{end}")
UA = "ls-crude-research/1.0 (https://github.com/Noah-TaeHwan/ls-crude; contact: repo docs)"
YEARS = list(range(2015, 2024))
TRAIN_END = "2020-12"
VAL_START = "2021-01"
VAL_END = "2023-12"


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n")


def fetch_json(url, path, receipts):
    record = {"url": url, "attempted_at_utc": now(), "method": "stdlib urllib GET + contact User-Agent, no credentials"}
    try:
        req = Request(url, headers={"User-Agent": UA})
        with urlopen(req, timeout=60) as response:
            payload = response.read()
            record.update(status=response.status, content_type=response.headers.get("Content-Type"))
    except Exception as error:
        receipts.append(dict(record, status="FAILED", error=type(error).__name__ + ": " + str(error)[:300]))
        return None
    with open(path, "xb") as stream:
        stream.write(payload)
    record.update(path=str(path.relative_to(ROOT)), sha256=digest(path), bytes=len(payload))
    receipts.append(record)
    return payload if record["status"] == 200 else None


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
    for article in ARTICLES:
        for year in YEARS:
            start = f"{year}0101" if not (year == 2015) else "20150701"
            end = f"{year}1231"
            out = raw / f"views_{article}_{year}.json"
            payload = fetch_json(API.format(article=article, start=start, end=end), out, receipts)
            time.sleep(0.4)
            if payload is None:
                ok = False
                break
            items = json.loads(payload).get("items", [])
            if year > 2015 and not items:
                receipts.append({"url": out.name, "status": "FAILED", "error": "empty items for full year",
                                 "attempted_at_utc": now()})
                ok = False
                break
            if any(pd.Timestamp(i["timestamp"][:8]) >= pd.Timestamp("2024-01-01") for i in items):
                raise RuntimeError("2024+ 관측 거부")
        if not ok:
            break
    yahoo_ok = fetch_yahoo(raw, receipts)
    manifest = {"candidate_id": CID, "run": stamp, "created_at_utc": now(),
                "plan_sha256": digest(plan), "code_sha256": digest(__file__), "command": " ".join(sys.argv),
                "articles": ARTICLES, "requests": receipts,
                "license_note": "Wikimedia pageview data (CC0 per API docs cited in memo); contact User-Agent used. Raw stays local. Yahoo personal research only; no price payload redistribution.",
                "rights_url": "https://wikimedia.org/api/rest_v1/"}
    write_json(raw / "manifest.json", manifest)
    (raw / "README.md").write_text(
        f"# {CID} {stamp}\n\nImmutable local snapshot; payloads and manifest are ignored by Git.\n\n"
        f"- Collection: `{manifest['command']}`\n- Plan SHA256: `{digest(plan)}`\n"
         f"- Manifest SHA256: `{digest(raw / 'manifest.json')}`\n\n"
        + "\n".join(f"- {r['url']} — HTTP {r.get('status', 'Yahoo library')}; `{r.get('path', 'no payload')}`; SHA256 `{r.get('sha256', 'N/A')}`" for r in receipts) + "\n")
    print(raw.relative_to(ROOT))
    if not (ok and yahoo_ok):
        raise SystemExit("BLOCKED/FAILED: persisted manifest; no data substitution")


def daily_sum(raw):
    frames = []
    for article in ARTICLES:
        for year in YEARS:
            path = raw / f"views_{article}_{year}.json"
            items = json.loads(path.read_text())["items"]
            for item in items:
                day = pd.Timestamp(item["timestamp"][:8])
                if day >= pd.Timestamp("2024-01-01"):
                    raise RuntimeError("2024+ 관측 거부")
                frames.append((day, article, int(item["views"])))
    frame = pd.DataFrame(frames, columns=["day", "article", "views"])
    pivot = frame.pivot_table(index="day", columns="article", values="views", aggfunc="sum")
    pivot["total"] = pivot.sum(axis=1)
    pivot["days_observed_articles"] = pivot[ARTICLES].notna().sum(axis=1)
    return pivot.sort_index()


def month_start(periods):
    """월 Period를 월초 Timestamp로 정규화한다. 신호·가격 공통 규약."""
    return pd.to_datetime([f"{p.year:04d}-{p.month:02d}-01" for p in periods])


def monthly_signal(pivot):
    monthly = pivot["total"].groupby(pivot.index.to_period("M")).mean()
    counts = pivot["total"].groupby(pivot.index.to_period("M")).count()
    ok_months = counts[counts >= 15].index
    A = monthly.loc[monthly.index.intersection(ok_months)]
    A.index = month_start(A.index)
    signal = (100 * np.log(A / A.shift(12))).rename("I_m").dropna()
    coverage = {"days": len(pivot), "first_day": str(pivot.index.min().date()), "last_day": str(pivot.index.max().date()),
                "signal_months": len(signal), "signal_start": str(signal.index.min().date()),
                "signal_end": str(signal.index.max().date())}
    return signal, coverage


def month_ends(prices):
    daily = prices.copy()
    daily.index = pd.to_datetime(daily.index).tz_localize(None).normalize()
    closes = daily["Close"].dropna()
    ends = closes.groupby(closes.index.to_period("M")).tail(1)
    ends.index = month_start(ends.index.to_period("M"))
    return ends.rename("P_m")


def pairs(signal, ends, start, end, lag=1, drop2020=False, shift12=False):
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
    return pd.DataFrame(out)


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
    signal, coverage = monthly_signal(daily_sum(raw))
    ends = month_ends(prices)
    monthly = pd.DataFrame({"I_m": signal}).join(pd.DataFrame({"P_m": ends}), how="left")
    monthly.index.name = "month"
    monthly.to_csv(proc / "monthly.csv")
    tests = []
    for split, s, e in [("train 2015-2020", "2015-01", TRAIN_END), ("validation 2021-2023", VAL_START, VAL_END)]:
        for lag in (-1, 0, 1, 2):
            fr = pairs(signal, ends, s, e, lag=lag)
            tests.append(test_row(f"corr lag{lag:+d}" + (" [PRIMARY]" if lag == 1 else ""), split, fr))
            if lag == 1:
                tests.append(test_row("dollar change aux lag+1", split, pairs(signal, ends, s, e, lag=1), col="d"))
        tests.append(test_row("placebo 12m shift lag+1", split, pairs(signal, ends, s, e, lag=1, shift12=True)))
        tests.append(test_row("delay +1m sensitivity", split, pairs(signal, ends, s, e, lag=2)))
        tests.append(test_row("drop-2020 sensitivity lag+1", split, pairs(signal, ends, s, e, lag=1, drop2020=True)))
        base = []
        for month in pd.period_range(s, e, freq="M"):
            t = month_start([month])[0]
            t1 = (t + pd.offsets.DateOffset(months=1)).replace(day=1)
            if t in ends.index and t1 in ends.index:
                p1, p0 = float(ends[t1]), float(ends[t])
                pp = (t - pd.offsets.DateOffset(months=1)).replace(day=1)
                if pp in ends.index and p1 > 0 and p0 > 0 and float(ends[pp]) > 0:
                    base.append({"I": p0 / float(ends[pp]) - 1, "r": p1 / p0 - 1})
        tests.append(test_row("WTI autocorr baseline (ref only)", split, pd.DataFrame(base)))
    tests_frame = pd.DataFrame(tests)
    tests_frame.to_csv(outdir / "tests.csv", index=False)
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
    for split, s, e in [("train 2015-2020", "2015-01", TRAIN_END), ("validation 2021-2023", VAL_START, VAL_END)]:
        n, r = ind_r(*ind_pairs(s, e))
        main = tests_frame[(tests_frame["test"] == "corr lag+1 [PRIMARY]") & (tests_frame["split"] == split)].iloc[0]
        match = bool(n == int(main["n"]) and ((math.isnan(r) and math.isnan(float(main["r"]))) or abs(r - float(main["r"])) < 1e-9))
        review[split] = {"n_lib": int(main["n"]), "r_lib": float(main["r"]), "n_std": n, "r_std": r, "match": match}
    review["verdict"] = "PASS" if all(v["match"] for k, v in review.items() if isinstance(v, dict)) else "FAIL"
    write_json(outdir / "independent-finance-review.json", review)
    fig, ax = plt.subplots(figsize=(9, 3.5))
    ax.plot(signal.index, signal.values, lw=1)
    ax.axvspan(pd.Timestamp("2015-01-01"), pd.Timestamp("2020-12-31"), alpha=0.12)
    ax.set_title(f"{CID} energy-wiki attention YoY (100*ln)")
    ax.set_xlabel("month")
    fig.tight_layout()
    fig.savefig(outdir / "activity.svg")
    plt.close(fig)
    prim = {}
    for split, s, e in [("train", "2015-01", TRAIN_END), ("validation", VAL_START, VAL_END)]:
        prim[split] = pairs(signal, ends, s, e, lag=1)
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
    for k, fr in prim.items():
        if len(fr):
            axes[0].scatter(fr["I"], fr["r"], s=8, alpha=0.7, label=f"{k} n={len(fr)}")
        else:
            axes[0].scatter([], [], s=8, alpha=0.7, label=f"{k} n=0 (EMPTY)")
    axes[0].set_xlabel("I_m (wiki attention YoY)")
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
    days = pd.DataFrame({"day": pd.to_datetime(["2023-01-01", "2023-01-02"]), "total": [100.0, 200.0]}).set_index("day")["total"]
    m = days.groupby(days.index.to_period("M")).mean()
    assert len(m) == 1 and abs(m.iloc[0] - 150.0) < 1e-9, "월평균 집계"
    ends = pd.Series([10.0, 15.0], index=pd.to_datetime(["2023-01-01", "2023-02-01"]))
    sig = pd.Series([1.0], index=pd.to_datetime(["2023-01-01"]))
    assert pairs(sig, ends, "2023-01", "2023-02", lag=1)["r"].tolist() == [0.5], "유효한 가격 창 포함"
    ends.iloc[1] = -5.0
    assert pairs(sig, ends, "2023-01", "2023-02", lag=1).empty, "비양수 가격 창 제외"
    print("PASS: synthetic-only checks for monthly mean, nonpositive exclusion")


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
