#!/usr/bin/env python3
"""HOS/HLX cycle-lag BUY engine. Flat is the default. Do not splice HLX and HOS."""
from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import numpy as np
import pandas as pd

LOOKBACK_12M, LOOKBACK_60, LOOKBACK_120 = 252, 60, 120
LAG_THRESH, WTI_RALLY, WTI_CRASH, VIX_Q = -0.10, 0.20, -0.25, 0.80
HLX_END = pd.Timestamp("2026-09-01")
HOS_START = pd.Timestamp("2026-09-02")
MIN_HOS_DAYS = 60

@dataclass
class Signal:
    date: pd.Timestamp
    ticker: str
    action: str
    g1: bool
    g2: bool
    g3: bool
    size: float
    reason: str

def _logret(s: pd.Series) -> pd.Series:
    return np.log(s.clip(lower=1e-6)).diff()

def build_panel(px: pd.DataFrame) -> pd.DataFrame:
    wti = px["WTI"].mask(px["WTI"] <= 0)
    osb = np.exp(np.log(px[["SLB", "HAL", "NOV", "RIG", "OII"]].clip(1e-4)).mean(axis=1))
    upb = np.exp(np.log(px[["XOM", "CVX", "COP", "EOG", "OXY"]].clip(1e-4)).mean(axis=1))
    out = pd.DataFrame(index=px.index)
    out["WTI"], out["OSB"], out["UPB"] = wti, osb, upb
    out["OIH"], out["VIX"] = px["OIH"], px["VIX"]
    out["HLX"] = px["HLX"]
    out.loc[out.index > HLX_END, "HLX"] = np.nan
    out["HOS"] = px["HOS"] if "HOS" in px.columns else np.nan
    if "HOS" in px.columns:
        out.loc[out.index < HOS_START, "HOS"] = np.nan
    return out

def gates(panel: pd.DataFrame) -> pd.DataFrame:
    wti = panel["WTI"]
    r_osb, r_upb = _logret(panel["OSB"]), _logret(panel["UPB"])
    low = wti.rolling(LOOKBACK_12M, min_periods=120).min()
    high = wti.rolling(LOOKBACK_12M, min_periods=120).max()
    g1 = (((wti / low - 1) >= WTI_RALLY).astype(int)
          + ((wti / high - 1) >= WTI_CRASH).astype(int)
          + (r_upb.rolling(LOOKBACK_60, min_periods=40).sum() > 0).astype(int)) >= 2
    oih_low = panel["OIH"].rolling(LOOKBACK_120, min_periods=60).min()
    g2 = (r_osb.rolling(LOOKBACK_60, min_periods=40).sum() > 0) | (panel["OIH"] > oih_low * 1.02)
    r_hlx, r_hos = _logret(panel["HLX"]), _logret(panel["HOS"])
    lag_hlx = r_hlx.rolling(LOOKBACK_60, min_periods=40).sum() - r_osb.rolling(LOOKBACK_60, min_periods=40).sum()
    lag_hos = r_hos.rolling(LOOKBACK_60, min_periods=40).sum() - r_osb.rolling(LOOKBACK_60, min_periods=40).sum()
    hos_ok = panel["HOS"].notna().cumsum() >= (MIN_HOS_DAYS + 1)
    g3 = pd.Series(False, index=panel.index)
    g3.loc[:HLX_END] = lag_hlx.loc[:HLX_END] <= LAG_THRESH
    g3.loc[HOS_START:] = (lag_hos.loc[HOS_START:] <= LAG_THRESH) & hos_ok.loc[HOS_START:]
    lag60 = lag_hlx.copy(); lag60.loc[HOS_START:] = lag_hos.loc[HOS_START:]
    hot = panel["VIX"] > panel["VIX"].rolling(LOOKBACK_12M, min_periods=120).quantile(VIX_Q)
    on = (g1 & g1.shift(1)) & (g2 & g2.shift(1)) & (g3 & g3.shift(1))
    size = on.astype(float)
    size = size.where(~hot, size * 0.5).shift(1).fillna(0.0)
    return pd.DataFrame({"g1": g1, "g2": g2, "g3": g3, "lag60": lag60, "size_next": size,
                         "ticker": np.where(panel.index <= HLX_END, "HLX", "HOS")}, index=panel.index)

def snapshot(panel: pd.DataFrame, g: pd.DataFrame) -> Signal:
    t = g.dropna(how="all").index[-1]
    row = g.loc[t]
    ticker = str(row.ticker)
    if ticker == "HOS" and panel["HOS"].notna().sum() < MIN_HOS_DAYS:
        return Signal(t, "HOS", "WAIT", bool(row.g1), bool(row.g2), False, 0.0,
                      "HOS history shorter than 60 days — G3 locked")
    prev = g.iloc[-2] if len(g) > 1 else row
    g1c, g2c, g3c = bool(row.g1 and prev.g1), bool(row.g2 and prev.g2), bool(row.g3 and prev.g3)
    if not (g1c and g2c and g3c):
        miss = []
        if not g1c: miss.append("G1 (2-day)")
        if not g2c: miss.append("G2 (2-day)")
        if not g3c: miss.append("G3 (2-day)")
        return Signal(t, ticker, "OFF", bool(row.g1), bool(row.g2), bool(row.g3), 0.0, "off: " + ", ".join(miss))
    sz = 0.5 if ticker == "HOS" else (0.5 if row.size_next < 1 else 1.0)
    return Signal(t, ticker, "BUY_0.5x" if sz < 1 else "BUY_1x", True, True, True, sz,
                  "all gates ON" + (" — HOS cap 0.5x" if ticker == "HOS" else ""))

def main():
    root = Path("prices_raw.csv")
    if not root.exists():
        root = Path("/home/workdir/artifacts/hecm/prices_raw.csv")
    px = pd.read_csv(root, parse_dates=["Date"], index_col="Date").sort_index()
    panel = build_panel(px)
    g = gates(panel)
    sig = snapshot(panel, g)
    print("=" * 60)
    print("CYCLE-LAG BUY ENGINE")
    print(f"as of {sig.date.date()}   ticker={sig.ticker}")
    print(f"ACTION: {sig.action}   size={sig.size}")
    print(f"G1={sig.g1}  G2={sig.g2}  G3={sig.g3}")
    print(sig.reason)
    print("=" * 60)

if __name__ == "__main__":
    main()
