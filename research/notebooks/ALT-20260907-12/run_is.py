"""IS analysis for ALT-20260907 data candidates (01..04). Frozen plan, single run.

Reads:  research/gathering/raw/{WTI-CLF,ALT-20260907-0X}/20260907T000000Z/
Writes: research/data/processed/ALT-20260907-0X/run-20260907-01/ (gitignored)
        research/indexes/ALT-20260907-0X/run-20260907-01/ (small committed outputs)

Usage: /tmp/altvenv/bin/python run_all.py [01|02|03|04|all]
Rule: analysis window ends 2023-12-31. No 2024+ values are printed or used.
"""
import csv
import datetime as dt
import glob
import hashlib
import json
import os
import sys
import zipfile

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

BASE = "/Users/noah/orca/workspaces/ls-crude/petrel/research"
RAW = os.path.join(BASE, "gathering/raw")
END = "2023-12-31"
RUN = "run-20260907-01"


def wti():
    df = pd.read_csv(f"{RAW}/WTI-CLF/20260907T000000Z/clf_daily_2015_2023.csv",
                     parse_dates=["date"])
    df = df[(df["date"] <= END) & (df["close"] > 0)].sort_values("date").reset_index(drop=True)
    df["r"] = df["close"].pct_change()
    for h in (5, 21):
        sq = df["r"] ** 2
        df[f"RV{h}"] = 100 * ((252.0 / h) * sq.shift(-h).rolling(h).sum()) ** 0.5
    cal = df["date"]
    return df, cal


def next_td(cal, day):
    nd = cal[cal > pd.Timestamp(day)]
    return nd.iloc[0] if len(nd) else pd.NaT


def pear(df, x, y):
    d = df[[x, y]].dropna()
    return (float(d[x].corr(d[y])), len(d)) if len(d) > 2 else (float("nan"), len(d))


def lag_curve(pairs, signal, target, lags):
    out = []
    for k in lags:
        d = pairs[[signal, target]].copy()
        d[target] = d[target].shift(-k)
        r, n = pear(d, signal, target)
        out.append((k, r, n))
    return out


def evaluate(name, pairs, signal, target, lag_list, placebo_shift, outdir, wti_df,
             title_extra=""):
    os.makedirs(outdir, exist_ok=True)
    pairs = pairs.dropna(subset=[signal, target]).reset_index(drop=True)
    r0, n0 = pear(pairs, signal, target)
    lags = lag_curve(pairs, signal, target, lag_list)
    half = len(pairs) // 2
    rh1, _ = pear(pairs.iloc[:half], signal, target)
    rh2, _ = pear(pairs.iloc[half:], signal, target)
    pl = pairs.copy()
    pl[signal] = pl[signal].shift(placebo_shift)
    rp, np_ = pear(pl, signal, target)
    # robustness A: drop 2020-03/04 pairs
    no_cov = pairs[~pairs["td"].astype(str).str.slice(0, 7).isin(["2020-03", "2020-04"])]
    ra, na = pear(no_cov, signal, target)
    # robustness B: raw (unz-scored) signal
    raw_col = signal + "_raw"
    rb, nb = pear(pairs, raw_col, target) if raw_col in pairs else (float("nan"), 0)
    tab = pd.DataFrame(
        [("primary", None, r0, n0), ("placebo", placebo_shift, rp, np_),
         ("no_covid", None, ra, na), ("raw_signal", None, rb, nb)] +
        [(f"lag_{k}", k, r, n) for k, r, n in lags] +
        [("half1", None, rh1, half), ("half2", None, rh2, len(pairs) - half)],
        columns=["test", "shift", "pearson_r", "n"])
    tab.to_csv(f"{outdir}/test_table.csv", index=False)
    pairs[[ "sig_date", "td", signal, target]].to_csv(f"{outdir}/pairs.csv", index=False)
    # plots
    fig, ax = plt.subplots(figsize=(8, 3.5))
    ax.plot(pairs["td"], pairs[signal], lw=1, label="signal z")
    ax.set_title(f"{name} signal vs WTI target {title_extra}")
    ax.legend(fontsize=8)
    ax2 = ax.twinx()
    ax2.plot(wti_df["date"], wti_df["close"], lw=0.8, color="gray", alpha=0.7, label="CL=F")
    fig.tight_layout()
    fig.savefig(f"{outdir}/fig_signal.png", dpi=80)
    plt.close(fig)
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.bar([k for k, _, _ in lags], [r for _, r, _ in lags])
    ax.set_title(f"{name} lag curve (pearson r)")
    fig.tight_layout()
    fig.savefig(f"{outdir}/fig_lag.png", dpi=80)
    plt.close(fig)
    return {"r": r0, "n": n0, "placebo_r": rp, "half": (rh1, rh2),
            "no_covid_r": ra, "raw_r": rb, "lags": lags}


def build_01(wti_df, cal):
    rows = []
    for zp in sorted(glob.glob(f"{RAW}/ALT-20260907-10/20260907T000000Z/*.zip")):
        with zipfile.ZipFile(zp) as z:
            txt = z.read(z.namelist()[0]).decode("utf-8", "replace")
        for r in csv.DictReader(txt.splitlines()):
            if r.get("CFTC_Contract_Market_Code") == "067651":
                rows.append(r)
    c = pd.DataFrame(rows)
    c["tue"] = pd.to_datetime(c["Report_Date_as_YYYY-MM-DD"])
    for col in ("M_Money_Positions_Long_All", "M_Money_Positions_Short_All", "Open_Interest_All"):
        c[col] = pd.to_numeric(c[col])
    c = c[(c["tue"] <= END)].sort_values("tue").reset_index(drop=True)
    c["mm_net_raw"] = (c["M_Money_Positions_Long_All"] - c["M_Money_Positions_Short_All"]) / c["Open_Interest_All"]
    c["mm_net"] = (c["mm_net_raw"] - c["mm_net_raw"].shift(1).rolling(52, min_periods=26).mean()) / \
                  c["mm_net_raw"].shift(1).rolling(52, min_periods=26).std()
    c["fri"] = c["tue"] + pd.to_timedelta(3, unit="D")
    c["td"] = c["fri"].apply(lambda d: next_td(cal, d))
    m = c.merge(wti_df[["date", "RV5"]], left_on="td", right_on="date", how="left")
    m = m.rename(columns={"mm_net": "z", "mm_net_raw": "z_raw", "RV5": "tgt", "fri": "sig_date"})
    return m[["sig_date", "td", "z", "z_raw", "tgt"]].rename(columns={"z_raw": "z_raw"})


def build_02(wti_df, cal):
    import xlrd
    b = xlrd.open_workbook(f"{RAW}/ALT-20260907-11/20260907T000000Z/WDIUPUS2w.xls")
    s = b.sheet_by_name("Data 1")
    epoch = dt.date(1899, 12, 30)
    recs = []
    for r in range(3, s.nrows):
        try:
            d = epoch + dt.timedelta(days=int(float(s.cell(r, 0).value)))
            v = float(s.cell(r, 1).value)
            recs.append((d.isoformat(), v))
        except (ValueError, TypeError):
            continue
    e = pd.DataFrame(recs, columns=["wdate", "val"])
    e["wdate"] = pd.to_datetime(e["wdate"])
    e = e[e["wdate"] <= END].sort_values("wdate").reset_index(drop=True)
    e["dist4"] = e["val"].rolling(4).mean()
    e["z_raw"] = e["dist4"]
    e["z"] = (e["dist4"] - e["dist4"].shift(1).rolling(52, min_periods=26).mean()) / \
             e["dist4"].shift(1).rolling(52, min_periods=26).std()
    e["avail"] = e["wdate"] + pd.to_timedelta(5, unit="D")
    e["td"] = e["avail"].apply(lambda d: next_td(cal, d))
    m = e.merge(wti_df[["date", "RV5"]], left_on="td", right_on="date", how="left")
    return m.rename(columns={"RV5": "tgt", "avail": "sig_date"})[["sig_date", "td", "z", "z_raw", "tgt"]]


def build_03(wti_df, cal):
    t = pd.read_csv(f"{RAW}/ALT-20260907-12/20260907T000000Z/TSIFRGHT.csv",
                    parse_dates=["observation_date"])
    t = t[(t["observation_date"] <= END)].sort_values("observation_date").reset_index(drop=True)
    t["mom_raw"] = t["TSIFRGHT"].pct_change()
    t["mom"] = t["mom_raw"]
    t["z_raw"] = t["mom"]
    t["z"] = (t["mom"] - t["mom"].shift(1).rolling(12, min_periods=12).mean()) / \
             t["mom"].shift(1).rolling(12, min_periods=12).std()
    t["avail"] = t["observation_date"] + pd.offsets.MonthEnd(0) + pd.to_timedelta(75, unit="D")
    t["td"] = t["avail"].apply(lambda d: next_td(cal, d))
    m = t.merge(wti_df[["date", "RV21"]], left_on="td", right_on="date", how="left")
    return m.rename(columns={"RV21": "tgt", "avail": "sig_date"})[["sig_date", "td", "z", "z_raw", "tgt"]]


def build_04(wti_df, cal):
    recs = []
    for jp in sorted(glob.glob(f"{RAW}/ALT-20260907-13/20260907T000000Z/*.json")):
        d = json.load(open(jp))
        for f in d["features"]:
            a = f["attributes"]
            recs.append((f"{a['year']:04d}-{a['month']:02d}-{a['day']:02d}", a["n_tanker"]))
    p = pd.DataFrame(recs, columns=["date", "n_tanker"]).drop_duplicates("date")
    p["date"] = pd.to_datetime(p["date"])
    p = p[(p["date"] <= END)].sort_values("date").reset_index(drop=True)
    p["tanker7_raw"] = p["n_tanker"].rolling(7, min_periods=7).sum()
    p["tanker7"] = p["tanker7_raw"]
    p["z_raw"] = p["tanker7"]
    mu = p["tanker7"].shift(1).rolling(364, min_periods=180).mean()
    sd = p["tanker7"].shift(1).rolling(364, min_periods=180).std()
    p["z"] = (p["tanker7"] - mu) / sd
    p = p.rename(columns={"date": "obs"})
    p["avail"] = p["obs"] + pd.to_timedelta(9, unit="D")
    p["td"] = p["avail"].apply(lambda d: next_td(cal, d))
    m = p.merge(wti_df[["date", "RV5"]], left_on="td", right_on="date", how="left")
    wk = m[m["obs"].dt.weekday == 4].reset_index(drop=True)  # weekly Friday grid
    return wk.rename(columns={"RV5": "tgt", "avail": "sig_date"})[["sig_date", "td", "z", "z_raw", "tgt"]]


def run(cid):
    builders = {"10": (build_01, "RV5", list(range(-4, 5)), 26),
                "11": (build_02, "RV5", list(range(-4, 5)), 26),
                "12": (build_03, "RV21", list(range(-3, 4)), 12),
                "13": (build_04, "RV5", list(range(-4, 5)), 26)}
    build, tgt, lags, pshift = builders[cid]
    wti_df, cal = wti()
    bad = int(((pd.read_csv(f"{RAW}/WTI-CLF/20260907T000000Z/clf_daily_2015_2023.csv")["close"] <= 0).sum()))
    pairs = build(wti_df, cal)
    proc = f"{BASE}/data/processed/ALT-20260907-{cid}/{RUN}"
    idx = f"{BASE}/indexes/ALT-20260907-{cid}/{RUN}"
    os.makedirs(proc, exist_ok=True)
    os.makedirs(idx, exist_ok=True)
    res = evaluate(f"ALT-20260907-{cid}", pairs, "z", "tgt", lags, pshift, proc, wti_df, tgt)
    # mirror small committed outputs
    pd.read_csv(f"{proc}/test_table.csv").to_csv(f"{idx}/test_table.csv", index=False)
    for f in ("fig_signal.png", "fig_lag.png"):
        open(f"{idx}/{f}", "wb").write(open(f"{proc}/{f}", "rb").read())
    with open(f"{idx}/receipt.json", "w") as f:
        json.dump({"candidate": f"ALT-20260907-{cid}", "run": RUN,
                   "wti_rows": len(wti_df),
                   "wti_span": [str(wti_df['date'].iloc[0].date()), str(wti_df['date'].iloc[-1].date())],
                   "wti_nonpositive_excluded": bad, "pairs_n": res["n"],
                   "primary_r": res["r"], "env": "altvenv pandas+matplotlib",
                   "code": f"research/notebooks/ALT-20260907-{cid}/run_is.py"}, f, indent=1)
    print(f"== ALT-20260907-{cid} n={res['n']} primary_r={res['r']:.4f} "
          f"placebo={res['placebo_r']:.4f} halves=({res['half'][0]:.4f},{res['half'][1]:.4f}) "
          f"no_covid={res['no_covid_r']:.4f} raw={res['raw_r']:.4f}")
    print("lags:", [(k, round(r, 4), n) for k, r, n in res["lags"]])


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "all"
    for cid in (["10", "11", "12", "13"] if arg == "all" else [arg]):
        run(cid)
