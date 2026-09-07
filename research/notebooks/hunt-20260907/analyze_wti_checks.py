#!/usr/bin/env python3
"""Hunt 2026-09-07 — Finance division: index recipes + WTI relationship checks.

Reads ONLY repo-local inputs (no network):
  research/data/clf-daily-2015-2026.csv            (Yahoo CL=F seed, committed)
  research/gathering/raw/ALT-20260907-*/...        (2026-09-07 collection, gitignored)

Writes:
  research/data/processed/hunt-20260907/*.csv      (derived panels, gitignored)
  research/data/processed/hunt-20260907/summary.json
  research/indexes/ALT-20260907-*/run-20260907/*.png (small committed figures)

Protocol: IS 2015-01-01~2023-12-31 only. No 2024+ tuning. Pearson+Spearman,
lag curves, one placebo per RUN candidate. Numbers are exploratory (E3 max);
as-of safety is marked per candidate, never assumed.
"""

from __future__ import annotations

import json
from pathlib import Path
from zipfile import ZipFile

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "gathering" / "raw"
STAMP = "20260907T063658Z"
OUT = ROOT / "data" / "processed" / "hunt-20260907"
IDX = ROOT / "indexes"
OUT.mkdir(parents=True, exist_ok=True)
IS_END = "2023-12-31"

summary: dict = {"run": "hunt-20260907", "is_window": ["2015-01-01", IS_END],
                 "wti_source": "research/data/clf-daily-2015-2026.csv (committed seed)",
                 "candidates": {}}


def note(cid: str, row: dict) -> None:
    summary["candidates"][cid] = row


# ---------------------------------------------------------------- WTI base
wti = pd.read_csv(ROOT / "data" / "clf-daily-2015-2026.csv", parse_dates=["date"])
wti = wti.sort_values("date").set_index("date")
wti["logret"] = np.log(wti["Close"] / wti["Close"].shift(1))
wti["ret_fwd5"] = np.log(wti["Close"].shift(-5) / wti["Close"])
wti["rv_fwd5"] = (
    wti["logret"].shift(-1).rolling(5).apply(lambda x: 100 * np.sqrt(252 / 5 * np.sum(x**2)), raw=True)
)
wti_is = wti.loc[:"2023-12-31"]
print(f"WTI rows={len(wti)} is_rows={len(wti_is)} close_is_last={wti_is['Close'].iloc[-1]:.2f}")


def corr_pair(x: pd.Series, y: pd.Series) -> dict:
    df = pd.concat([x, y], axis=1).dropna()
    df.columns = ["x", "y"]
    if len(df) < 10 or df["x"].std() == 0 or df["y"].std() == 0:
        return {"n": int(len(df)), "pearson": None, "spearman": None}
    return {"n": int(len(df)),
            "pearson": round(float(df["x"].corr(df["y"], method="pearson")), 4),
            "spearman": round(float(df["x"].corr(df["y"], method="spearman")), 4)}


def lag_curve(idx: pd.Series, tgt: pd.Series, lags: list[int], freq_label: str) -> dict:
    out = {}
    for k in lags:
        out[f"k={k:+d}"] = corr_pair(idx, tgt.shift(-k))
    return out


def save_fig(path: Path, fig_fn) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig_fn()
    plt.tight_layout()
    plt.savefig(path, dpi=90)
    plt.close()
    print("FIG", path.relative_to(ROOT.parent), f"{path.stat().st_size}B")


# ------------------------------------------------- 01 PortWatch Hormuz
try:
    recs = []
    for fname, label in [("hormuz.json", "hormuz"), ("malacca.json", "malacca"),
                         ("placebo_chokepoint1.json", "suez_placebo")]:
        d = json.loads((RAW / f"ALT-20260907-18/{STAMP}/{fname}").read_text())
        for f in d["features"]:
            a = f["attributes"]
            recs.append({"date": a["date"], "series": label,
                         "n_tanker": a.get("n_tanker"), "n_cargo": a.get("n_cargo")})
    pw = pd.DataFrame(recs)
    pw["date"] = pd.to_datetime(pw["date"])
    piv = pw.pivot_table(index="date", columns="series", values="n_tanker").sort_index()
    # weekly (Friday close week), as-of: weekly Tue release -> shift +7d before use
    wk = piv.resample("W-FRI").mean()
    wk_avail = wk.shift(1)  # conservative: prior-week value at current week label
    wti_wk = wti["Close"].resample("W-FRI").last()
    wti_wkret = np.log(wti_wk / wti_wk.shift(1))
    wti_wkret_fwd1 = wti_wkret.shift(-1)
    hz = pd.concat([wk_avail["hormuz"], wti_wkret_fwd1], axis=1).dropna()
    hz.columns = ["hormuz_tanker_wk", "wti_next_wkret"]
    hz_is = hz.loc[:"2023-12-31"]
    hz_is.to_csv(OUT / "ALT-20260907-18_panel.csv", index_label="week")
    c_main = corr_pair(hz_is["hormuz_tanker_wk"], hz_is["wti_next_wkret"])
    suez_panel = pd.concat([wk_avail["suez_placebo"], wti_wkret_fwd1], axis=1).dropna().loc[:"2023-12-31"]
    c_placebo = corr_pair(suez_panel.iloc[:, 0], suez_panel.iloc[:, 1])
    lags = lag_curve(hz_is["hormuz_tanker_wk"], wti_wkret.reindex(hz_is.index).loc[hz_is.index],
                     [-4, -2, -1, 0, 1, 2, 4], "weekly")
    note("ALT-20260907-18", {
        "coverage": f"{piv.index.min().date()}~{piv.index.max().date()} daily; weekly IS n={c_main['n']}",
        "asof": "conservative +1wk shift (Tue release); AIS-jam/spoof caveat per PortWatch FAQ",
        "index": "weekly mean Hormuz n_tanker, prior-week value",
        "main_pearson": c_main["pearson"], "main_spearman": c_main["spearman"], "n": c_main["n"],
        "placebo_suez_pearson": c_placebo["pearson"], "placebo_n": c_placebo["n"],
        "lags": lags, "oos": "NOT_OPENED",
    })

    def fig01():
        fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
        ax[0].plot(hz_is.index, hz_is["hormuz_tanker_wk"], lw=1)
        ax[0].set_title("Hormuz weekly tanker transits (prior-wk, IS 2019-2023)")
        ax[1].plot(hz_is.index, 100 * hz_is["wti_next_wkret"], lw=1)
        ax[1].set_title("WTI next-week logret % (Yahoo CL=F seed)")
    save_fig(IDX / "ALT-20260907-18" / "run-20260907" / "hormuz_vs_wti.png", fig01)
    print("01 OK", c_main, "placebo", c_placebo)
except Exception as e:  # noqa: BLE001
    note("ALT-20260907-18", {"error": f"{type(e).__name__}: {e}"})
    print("01 FAIL", e)

# ------------------------------------------------- 03 CFTC WTI positioning
try:
    frames = []
    for yr in range(2015, 2024):
        z = RAW / f"ALT-20260907-20/{STAMP}/fut_disagg_txt_{yr}.zip"
        with ZipFile(z) as zf:
            df = pd.read_csv(zf.open(zf.namelist()[0]), low_memory=False)
        w = df[df["CFTC_Contract_Market_Code"] == "06765A"].copy()
        w["date"] = pd.to_datetime(w["Report_Date_as_YYYY-MM-DD"])
        w = w.sort_values("date").drop_duplicates("date")
        w["mm_net"] = w["M_Money_Positions_Long_All"] - w["M_Money_Positions_Short_All"]
        frames.append(w[["date", "mm_net", "Open_Interest_All"]])
    cftc = pd.concat(frames).sort_values("date").set_index("date")
    # Friday release for Tuesday positions -> available next Wed; map to WTI weekly Fri close, shift +1wk
    cftc_wk = cftc["mm_net"].resample("W-FRI").last().ffill()
    sig = cftc_wk.shift(1)
    panel = pd.concat([sig, wti_wkret.shift(-1)], axis=1).dropna()
    panel.columns = ["mm_net_priorwk", "wti_next_wkret"]
    panel_is = panel.loc[:"2023-12-31"]
    panel_is.to_csv(OUT / "ALT-20260907-20_panel.csv", index_label="week")
    c_main = corr_pair(panel_is["mm_net_priorwk"], panel_is["wti_next_wkret"])
    # change-based variant
    chg = cftc_wk.diff().shift(1)
    c_chg = corr_pair(pd.concat([chg, wti_wkret.shift(-1)], axis=1).dropna().iloc[:, 0],
                      pd.concat([chg, wti_wkret.shift(-1)], axis=1).dropna().iloc[:, 1])
    note("ALT-20260907-20", {
        "coverage": f"{cftc.index.min().date()}~{cftc.index.max().date()} weekly; IS n={c_main['n']}",
        "asof": "Tue positions, Fri release -> prior-week value only",
        "index": "NYMEX WTI Fin (06765A) Managed-Money net long, level + weekly change",
        "level_pearson": c_main["pearson"], "level_spearman": c_main["spearman"], "n": c_main["n"],
        "change_pearson": c_chg["pearson"], "change_n": c_chg["n"],
        "oos": "NOT_OPENED",
    })

    def fig03():
        fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
        ax[0].plot(panel_is.index, panel_is["mm_net_priorwk"] / 1000, lw=1)
        ax[0].set_title("WTI MM net long, k contracts (prior-wk, IS)")
        ax[1].plot(panel_is.index, 100 * panel_is["wti_next_wkret"], lw=1)
        ax[1].set_title("WTI next-week logret %")
    save_fig(IDX / "ALT-20260907-20" / "run-20260907" / "cftc_vs_wti.png", fig03)
    print("03 OK", c_main, c_chg)
except Exception as e:  # noqa: BLE001
    note("ALT-20260907-20", {"error": f"{type(e).__name__}: {e}"})
    print("03 FAIL", e)

# ------------------------------------------------- 04 SG bunker sales
try:
    b = pd.read_csv(RAW / f"ALT-20260907-21/{STAMP}/bunker_sales.csv")
    b["date"] = pd.to_datetime(b["month"])
    tot = b.groupby("date")["bunker_sales"].sum().sort_index()
    tot_m = tot.resample("MS").sum()
    # monthly availability ~ +1 month; shift 1
    sig = tot_m.shift(1)
    wti_m = wti["Close"].resample("MS").last()
    wti_mret = np.log(wti_m / wti_m.shift(1))
    wti_mret_fwd1 = wti_mret.shift(-1)
    panel = pd.concat([sig, wti_mret_fwd1], axis=1).dropna()
    panel.columns = ["bunker_prior_m", "wti_next_mret"]
    panel_is = panel.loc[:"2023-12-31"]
    panel_is.to_csv(OUT / "ALT-20260907-21_panel.csv", index_label="month")
    c_main = corr_pair(panel_is["bunker_prior_m"], panel_is["wti_next_mret"])
    # yoy variant (seasonality control)
    yoy = tot_m.pct_change(12).shift(1)
    c_yoy = corr_pair(pd.concat([yoy, wti_mret_fwd1], axis=1).dropna().iloc[:, 0],
                      pd.concat([yoy, wti_mret_fwd1], axis=1).dropna().iloc[:, 1])
    note("ALT-20260907-21", {
        "coverage": f"{tot_m.index.min().date()}~{tot_m.index.max().date()} monthly; IS n={c_main['n']}",
        "asof": "monthly file, conservative +1mo shift; vintage not restored",
        "index": "SG total bunker sales (all types summed), prior-month value + YoY variant",
        "level_pearson": c_main["pearson"], "level_spearman": c_main["spearman"], "n": c_main["n"],
        "yoy_pearson": c_yoy["pearson"], "yoy_n": c_yoy["n"],
        "oos": "NOT_OPENED",
    })

    def fig04():
        fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
        ax[0].plot(panel_is.index, panel_is["bunker_prior_m"] / 1000, lw=1)
        ax[0].set_title("SG bunker sales, k tonnes (prior-mo, IS)")
        ax[1].plot(panel_is.index, 100 * panel_is["wti_next_mret"], lw=1)
        ax[1].set_title("WTI next-month logret %")
    save_fig(IDX / "ALT-20260907-21" / "run-20260907" / "bunker_vs_wti.png", fig04)
    print("04 OK", c_main, c_yoy)
except Exception as e:  # noqa: BLE001
    note("ALT-20260907-21", {"error": f"{type(e).__name__}: {e}"})
    print("04 FAIL", e)

# ------------------------------------------------- 06 Wiki attention
try:
    series = {}
    for art, key in [("cushing.json", "cushing"), ("spr.json", "spr"), ("pizza_placebo.json", "pizza")]:
        d = json.loads((RAW / f"ALT-20260907-23/{STAMP}/{art}").read_text())
        s = pd.Series({pd.to_datetime(i["timestamp"], format="%Y%m%d%H"): i["views"] for i in d["items"]})
        s.index = s.index.normalize()
        series[key] = s.sort_index()
    wiki = pd.DataFrame(series)
    # attention z: log views vs trailing 30d median, D+2 shift (NOT_PROVEN as-of-safe)
    z = (np.log1p(wiki) - np.log1p(wiki).rolling(30).median()).div(
        np.log1p(wiki).rolling(30).std().replace(0, np.nan))
    z_avail = z.shift(2)
    wti_d = wti["ret_fwd5"]
    out06 = {}
    for key in ["cushing", "spr", "pizza"]:
        c = corr_pair(z_avail[key].reindex(wti_is.index), wti_d.reindex(wti_is.index))
        out06[key] = c
    pd.DataFrame({k: z_avail[k] for k in z_avail}).loc[:"2023-12-31"].to_csv(
        OUT / "ALT-20260907-23_panel.csv", index_label="date")
    lags = lag_curve(z_avail["spr"].reindex(wti_is.index),
                     wti_is["logret"], [-5, -2, -1, 0, 1, 2, 5], "daily")
    note("ALT-20260907-23", {
        "coverage": f"{wiki.index.min().date()}~{wiki.index.max().date()} daily; 3106d each",
        "asof": "NOT_PROVEN as-of-safe: retrospective D+2 shift only, no vintage receipts",
        "index": "log-views 30d-median z; Cushing + SPR vs Pizza placebo",
        "cushing": out06["cushing"], "spr": out06["spr"], "pizza_placebo": out06["pizza"],
        "target": "WTI next-5d logret (fwd5)", "lags_spr": lags, "oos": "NOT_OPENED",
    })

    def fig06():
        fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
        ax[0].plot(z_avail.loc[:"2023-12-31"].index, z_avail["spr"].loc[:"2023-12-31"], lw=0.7)
        ax[0].set_title("SPR wiki attention z (D+2, IS)")
        ax[1].plot(wti_is.index, 100 * wti_is["ret_fwd5"], lw=0.7)
        ax[1].set_title("WTI next-5d logret %")
    save_fig(IDX / "ALT-20260907-23" / "run-20260907" / "wiki_vs_wti.png", fig06)
    print("06 OK", out06)
except Exception as e:  # noqa: BLE001
    note("ALT-20260907-23", {"error": f"{type(e).__name__}: {e}"})
    print("06 FAIL", e)

# ------------------------------------------------- 07 FRED freight TSI
try:
    t = pd.read_csv(RAW / f"ALT-20260907-24/{STAMP}/TSIFRGHT.csv")
    t["date"] = pd.to_datetime(t["observation_date"])
    t = t.set_index("date").sort_index()
    t["TSIFRGHT"] = pd.to_numeric(t["TSIFRGHT"], errors="coerce")
    sig = t["TSIFRGHT"].pct_change(12).shift(1)  # YoY, prior-month value
    wti_m = wti["Close"].resample("MS").last()
    wti_mret_fwd1 = np.log(wti_m / wti_m.shift(1)).shift(-1)
    panel = pd.concat([sig, wti_mret_fwd1], axis=1).dropna()
    panel.columns = ["tsi_yoy_prior", "wti_next_mret"]
    panel_is = panel.loc[:"2023-12-31"]
    panel_is.to_csv(OUT / "ALT-20260907-24_panel.csv", index_label="month")
    c_main = corr_pair(panel_is["tsi_yoy_prior"], panel_is["wti_next_mret"])
    note("ALT-20260907-24", {
        "coverage": f"{t.index.min().date()}~{t.index.max().date()} monthly; IS n={c_main['n']}",
        "asof": "BTS TSI revised monthly; current-vintage only, no vintage restore",
        "index": "Freight TSI YoY, prior-month value",
        "pearson": c_main["pearson"], "spearman": c_main["spearman"], "n": c_main["n"],
        "oos": "NOT_OPENED",
    })
    print("07 OK", c_main)
except Exception as e:  # noqa: BLE001
    note("ALT-20260907-24", {"error": f"{type(e).__name__}: {e}"})
    print("07 FAIL", e)

# ------------------------------------------------- 08 EIA jet product supplied
try:
    j = pd.read_excel(RAW / f"ALT-20260907-25/{STAMP}/jet_weekly.xls", sheet_name="Data 1", header=2)
    j.columns = [str(c).strip() for c in j.columns]
    date_col = [c for c in j.columns if "date" in c.lower()][0]
    val_col = [c for c in j.columns if "thousand" in c.lower() or "jet" in c.lower() or "value" in c.lower()]
    val_col = val_col[0] if val_col else j.columns[1]
    j["date"] = pd.to_datetime(j[date_col])
    j = j.set_index("date").sort_index()
    js = pd.to_numeric(j[val_col], errors="coerce").dropna()
    js_w = js.resample("W-FRI").mean()
    sig = js_w.shift(1)  # EIA weekly +5d conservative
    wti_wk = wti["Close"].resample("W-FRI").last()
    wti_wkret_fwd1 = np.log(wti_wk / wti_wk.shift(1)).shift(-1)
    panel = pd.concat([sig, wti_wkret_fwd1], axis=1).dropna()
    panel.columns = ["jet_prior_wk", "wti_next_wkret"]
    panel_is = panel.loc[:"2023-12-31"]
    panel_is.to_csv(OUT / "ALT-20260907-25_panel.csv", index_label="week")
    c_main = corr_pair(panel_is["jet_prior_wk"], panel_is["wti_next_wkret"])
    note("ALT-20260907-25", {
        "coverage": f"{js.index.min().date()}~{js.index.max().date()} weekly; IS n={c_main['n']}",
        "asof": "EIA weekly, conservative +1wk shift; vintage not restored",
        "index": "US jet-fuel product supplied (kbd), prior-week value",
        "pearson": c_main["pearson"], "spearman": c_main["spearman"], "n": c_main["n"],
        "oos": "NOT_OPENED",
    })

    def fig08():
        fig, ax = plt.subplots(2, 1, figsize=(8, 5), sharex=True)
        ax[0].plot(panel_is.index, panel_is["jet_prior_wk"], lw=1)
        ax[0].set_title("US jet product supplied, kbd (prior-wk, IS)")
        ax[1].plot(panel_is.index, 100 * panel_is["wti_next_wkret"], lw=1)
        ax[1].set_title("WTI next-week logret %")
    save_fig(IDX / "ALT-20260907-25" / "run-20260907" / "jet_vs_wti.png", fig08)
    print("08 OK", c_main)
except Exception as e:  # noqa: BLE001
    note("ALT-20260907-25", {"error": f"{type(e).__name__}: {e}"})
    print("08 FAIL", e)

(OUT / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
print("SUMMARY n=", len(summary["candidates"]))
for k, v in summary["candidates"].items():
    print(k, {kk: vv for kk, vv in v.items() if kk in ("n", "main_pearson", "pearson", "level_pearson", "error")})
