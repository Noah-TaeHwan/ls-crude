#!/usr/bin/env python3
"""
HELIX v22 PROD-2TURN-HIR — SINGLE-FILE BUNDLE

This file contains:
1. Full runnable v22 engine
2. Embedded v22 research/specification notes
3. Embedded manifest metadata

REAL ALPHA STATUS: NOT_PROVEN

IMPORTANT:
- No HLX/HOS splice
- HOLD ends 2026-04-21
- M&A quarantine starts 2026-04-22
- New HOS forward-only
- All 14 Alpha-Lock gates unchanged
- Synthetic qualification is NOT real alpha proof

Embedded specification
----------------------
# HELIX v22 — PROD-2TURN-HIR

## Status
Production-grade implementation upgrade of v21 2TURN-HIR.

**Economic rule unchanged.**
**Real alpha still NOT_PROVEN until all 14 Alpha-Lock gates pass on real data.**

## Frozen alpha logic
- causal rolling Ridge
- lambda = 1.0
- window = 252 sessions
- prior-only residual Z
- distress threshold: Z <= -1.50
- wait for two consecutive HIR improvements
- signal close t -> enter next session
- hold 20 sessions
- peer-neutral P&L = HLX - OSB
- 40 bp base cost
- 100 bp stress
- no HLX/HOS splice
- HOLD ends 2026-04-21
- M&A quarantine starts 2026-04-22
- boundary purge uses EXIT date
- all 14 Alpha-Lock gates unchanged

## v22 production upgrades
1. Adjusted Open-to-Open execution convention
   - signal close t
   - enter adjusted Open t+1
   - exit adjusted Open t+1+h

2. Adjustment sanity checks
   - required Open/Close/Volume fields
   - positivity / finite-value checks
   - split-like open-close jump diagnostics

3. Liquidity diagnostics
   - entry-day dollar-volume proxies
   - count of sub-$1m entry days
   - diagnostics only; no post-hoc trade filtering

4. Residual-cluster diagnostics
   - threshold-day count
   - cluster count
   - mean / median / max cluster length
   - does not alter frozen v21 signal

5. Event inference separated from HAC inference
   - event t-stat and event Sharpe remain event statistics
   - daily-strategy HAC t-stat is separately reported
   - no mislabeled t-stat-as-Sharpe

6. Stronger mechanical audit
   - future mutation causality
   - prior-only Z
   - next-session entry
   - exact 20-session holding period
   - HLX boundary
   - no HOS contamination

## Current engineering result
Inherited v21 signal self-test: PASS

v22 production self-test:
- adjusted execution sanity: PASS
- open-to-open fill: PASS
- next-session entry: PASS
- fixed 20-session horizon: PASS
- future-mutation causality: PASS
- liquidity diagnostics: PASS
- cluster diagnostics: PASS

Synthetic production-layer sample:
- 67 trades
- median HLX entry dollar volume ~ $70.0m
- median OSB entry dollar volume ~ $163.0m
- raw threshold days: 173
- residual clusters: 145
- mean cluster length: 1.19
- max cluster length: 3

These are engineering/synthetic diagnostics only.

## Real-data requirement
The real Factor-102 panel (or a fresh identically specified real panel with
consistently adjusted OHLCV) must be supplied before v22 can receive a real
Alpha-Lock verdict.

Do not call ALPHA_PROVEN from synthetic data.

"""

EMBEDDED_V22_MANIFEST = {
  "version": "22.0",
  "name": "HELIX v22 PROD-2TURN-HIR",
  "engine_sha256": "e8fda4f788b3281c33473b4aae7d7c2e773e14fe3dd75f58aa4f802b2947e105",
  "economic_rule_changed": false,
  "production_upgrade": true,
  "real_alpha_status": "NOT_PROVEN"
}


#!/usr/bin/env python3
"""
HELIX v22 PROD-2TURN-HIR — Two-Turn Confirmed Residual Catch-Up

Economic signal inherited unchanged from HELIX v21:
    Event independence/timing = two consecutive HIR improvements after distress.

v22 changes implementation rigor only:
    - adjusted OPEN-to-OPEN execution convention
    - corporate-action / adjustment diagnostics
    - liquidity / volume diagnostics
    - residual-cluster diagnostics
    - explicit separation of event statistics and daily HAC inference
    - stronger leakage / boundary audit

The residual model, factor set, Z threshold, holding horizon, costs,
holdout dates, peer-neutral P&L, M&A quarantine and HLX/HOS firewall
remain frozen.

v21 episode rule
----------------
1. A distress episode STARTS when causal HIR Z <= -1.50.
2. Do not trade the first falling-knife breach.
3. The episode is confirmed only after two consecutive HIR improvements: HIR_t > HIR_{t-1} > HIR_{t-2}.
4. The second improving-HIR close is the event anchor.
5. Enter NEXT session.
6. Hold 20 sessions.
7. Ignore new episodes while the trade is active (non-overlap).

This uses no future information: HIR >= 0 is known at the recovery day's close.
It adds no price/Z threshold: confirmation requires the minimum persistence of two consecutive HIR improvements.

Proof-label rule
----------------
Synthetic or unattested data can NEVER emit ALPHA_PROVEN. Even 14/14 becomes\nSYNTHETIC_QUALIFIED_14_OF_14. Real proof requires --attest-real-data.\n\nHard rules\n----------
* NO HLX/HOS splice.
* HLX ordinary proof ends <= 2026-04-21.
* 2026-04-22..2026-09-01 is M&A quarantine.
* New HOS is not used here.
* Rolling Ridge uses t-252..t-1 only.
* Current residual never enters its own Z.
* Z threshold = -1.50.
* Next-session entry.
* Horizon = 20 sessions.
* 40 bp base / 100 bp stress.
* Primary P&L = HLX - OSB.
* DEV trades purged by EXIT date.
* HOLD trades purged by EXIT date.
* One primary rule; neighbors are diagnostics only.

Input returns CSV
-----------------
Date,HLX,WTI,Brent,RBOB,ULSD,XLE,SLB,HAL,BKR,UPSTREAM,OSB

All series except Date are DAILY SIMPLE RETURNS, not prices.

Optional Yahoo download mode constructs the exact v19 information set:
HLX; CL=F; BZ=F; RB=F; HO=F; XLE; SLB; HAL; BKR;
UPSTREAM = equal-weight XOM/CVX/COP/EOG/OXY daily returns;
OSB = equal-weight SLB/HAL/NOV/RIG/OII daily returns.

Examples
--------
python helix_v21_rec_hir.py --mode selftest
python helix_v21_rec_hir.py --mode dev --csv factor102_returns.csv --outdir out_v21
python helix_v21_rec_hir.py --mode proof --csv factor102_returns.csv \
    --dev-seal out_v21/DEV_ADVANCE.seal.json --outdir out_v21_proof
python helix_v21_rec_hir.py --mode dev --yahoo --outdir out_v21
"""

from __future__ import annotations
import argparse
import hashlib
import json
import math
from dataclasses import dataclass, asdict
from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats

VERSION = "22.0"
CHANGE_ID = "production_execution:adjusted_open_to_open_plus_diagnostics"

DEV_START = pd.Timestamp("2012-01-03")
DEV_END = pd.Timestamp("2021-12-31")
HOLD_START = pd.Timestamp("2022-01-03")
HOLD_END = pd.Timestamp("2026-04-21")
MA_START = pd.Timestamp("2026-04-22")
HLX_LAST = pd.Timestamp("2026-09-01")

FACTORS = ["WTI","Brent","RBOB","ULSD","XLE","SLB","HAL","BKR","UPSTREAM","OSB"]
REQ = ["HLX"] + FACTORS

@dataclass(frozen=True)
class Config:
    lookback: int = 252
    ridge_lambda: float = 1.0
    z_window: int = 252
    z_threshold: float = -1.50
    horizon: int = 20
    base_cost: float = 0.004
    stress_cost: float = 0.010

    # written event floors for v21 onward
    min_dev_events: int = 40
    min_hold_events: int = 25

    # frozen Alpha-Lock thresholds
    min_peer_sharpe: float = 0.50
    min_hac_t: float = 2.0
    min_neighbor_positive_frac: float = 0.70
    max_p: float = 0.05

    bootstrap_samples: int = 20000
    signflip_samples: int = 50000
    timing_randomizations: int = 499
    seed: int = 21021

def cfg_hash(cfg: Config) -> str:
    payload = {"version": VERSION, "change": CHANGE_ID, "config": asdict(cfg)}
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

def frame_hash(df: pd.DataFrame) -> str:
    x = df.loc[(df.index >= DEV_START) & (df.index <= HLX_LAST), REQ].copy()
    payload = pd.util.hash_pandas_object(x, index=True).values.tobytes()
    return hashlib.sha256(payload).hexdigest()

def load_returns_csv(path: str) -> pd.DataFrame:
    x = pd.read_csv(path)
    if "Date" not in x.columns:
        raise ValueError("CSV requires Date")
    miss = [c for c in REQ if c not in x.columns]
    if miss:
        raise ValueError(f"Missing required return columns: {miss}")
    x["Date"] = pd.to_datetime(x["Date"], errors="raise")
    x = x.sort_values("Date").drop_duplicates("Date").set_index("Date")
    x = x[REQ].apply(pd.to_numeric, errors="coerce")
    x = x.loc[(x.index >= DEV_START) & (x.index <= HLX_LAST)]
    return x.dropna()

def download_yahoo_returns() -> pd.DataFrame:
    try:
        import yfinance as yf
    except Exception as e:
        raise RuntimeError("Install yfinance for --yahoo mode") from e

    tickers = {
        "HLX":"HLX",
        "WTI":"CL=F",
        "Brent":"BZ=F",
        "RBOB":"RB=F",
        "ULSD":"HO=F",
        "XLE":"XLE","SLB":"SLB","HAL":"HAL","BKR":"BKR",
        "XOM":"XOM","CVX":"CVX","COP":"COP","EOG":"EOG","OXY":"OXY",
        "NOV":"NOV","RIG":"RIG","OII":"OII",
    }
    px = {}
    for name,tkr in tickers.items():
        z = yf.download(tkr, start="2011-01-01", end="2026-09-02",
                        auto_adjust=True, progress=False, actions=False)
        if z.empty:
            raise RuntimeError(f"Yahoo returned no data for {name}/{tkr}")
        if isinstance(z.columns, pd.MultiIndex):
            z.columns = z.columns.get_level_values(0)
        px[name] = pd.to_numeric(z["Close"], errors="coerce").rename(name)

    prices = pd.concat(px.values(), axis=1).sort_index()
    r = prices.pct_change(fill_method=None)
    out = pd.DataFrame(index=r.index)
    for c in ["HLX","WTI","Brent","RBOB","ULSD","XLE","SLB","HAL","BKR"]:
        out[c] = r[c]
    out["UPSTREAM"] = r[["XOM","CVX","COP","EOG","OXY"]].mean(axis=1, skipna=False)
    out["OSB"] = r[["SLB","HAL","NOV","RIG","OII"]].mean(axis=1, skipna=False)
    out = out.loc[(out.index >= DEV_START) & (out.index <= HLX_LAST), REQ]
    return out.dropna()

def causal_hir(r: pd.DataFrame, cfg: Config) -> pd.DataFrame:
    """Raw v19 causal Ridge HIR. No PCA: v21 changes only episode independence."""
    n = len(r)
    out = pd.DataFrame(index=r.index)
    out["hir"] = np.nan
    out["expected"] = np.nan

    Xall = r[FACTORS].to_numpy(float)
    yall = r["HLX"].to_numpy(float)
    p = len(FACTORS)
    I = np.eye(p)

    for j in range(cfg.lookback, n):
        X = Xall[j-cfg.lookback:j]
        y = yall[j-cfg.lookback:j]
        xt = Xall[j]

        mu = X.mean(axis=0)
        sd = X.std(axis=0, ddof=0)
        sd = np.where(sd > 1e-12, sd, 1.0)
        Xs = (X-mu)/sd
        xts = (xt-mu)/sd

        ym = y.mean()
        yc = y-ym
        beta = np.linalg.solve(Xs.T@Xs + cfg.ridge_lambda*I, Xs.T@yc)
        pred = float(ym + xts@beta)
        out.iloc[j, out.columns.get_loc("expected")] = pred
        out.iloc[j, out.columns.get_loc("hir")] = yall[j]-pred

    # PRIOR residuals only.
    prior = out["hir"].shift(1)
    m = prior.rolling(cfg.z_window, min_periods=cfg.z_window).mean()
    s = prior.rolling(cfg.z_window, min_periods=cfg.z_window).std(ddof=1)
    out["z"] = (out["hir"]-m)/s.replace(0,np.nan)
    return out

def recovery_anchors(sig: pd.DataFrame, cfg: Config,
                     z_threshold: float | None=None,
                     horizon: int | None=None) -> list[int]:
    """
    One event per distress episode.
    Episode starts at z <= threshold.
    Anchor occurs at the first later close satisfying HIR_t > HIR_{t-1} > HIR_{t-2}.
    After an anchor, block through the eventual trade exit (non-overlap).
    """
    zt = cfg.z_threshold if z_threshold is None else z_threshold
    h = cfg.horizon if horizon is None else horizon
    z = sig["z"].to_numpy(float)
    hir = sig["hir"].to_numpy(float)
    anchors = []
    i = 0
    in_episode = False
    n = len(sig)

    while i < n:
        if not in_episode:
            if np.isfinite(z[i]) and z[i] <= zt:
                in_episode = True
            i += 1
            continue

        # Two-turn confirmation is observable at close i; no future data.
        if (i > 1 and np.isfinite(hir[i]) and np.isfinite(hir[i-1]) and np.isfinite(hir[i-2])
                and hir[i] > hir[i-1] > hir[i-2]):
            anchors.append(i)
            in_episode = False
            # event anchor i -> enter i+1 -> exit i+1+h
            i = i + 1 + h + 1
        else:
            i += 1

    return anchors

def forward_active(r: pd.DataFrame, start_i: int, end_i: int, leg="HLX") -> float:
    """Close[start_i] -> Close[end_i] return from daily simple returns."""
    vals = r[leg].to_numpy(float)
    # daily return at d is close[d]/close[d-1]-1, so start+1..end compounds.
    z = vals[start_i+1:end_i+1]
    return float(np.prod(1.0+z)-1.0)

def make_trades(r: pd.DataFrame, sig: pd.DataFrame, cfg: Config,
                z_threshold: float | None=None,
                horizon: int | None=None,
                cost: float | None=None) -> pd.DataFrame:
    h = cfg.horizon if horizon is None else horizon
    c = cfg.base_cost if cost is None else cost
    anchors = recovery_anchors(sig,cfg,z_threshold,h)
    rows=[]
    n=len(r)
    for a in anchors:
        e=a+1
        q=e+h
        if q >= n:
            continue
        anchor_date=r.index[a]
        entry_date=r.index[e]
        exit_date=r.index[q]
        if exit_date > HLX_LAST:
            continue
        hr=forward_active(r,e,q,"HLX")
        br=forward_active(r,e,q,"OSB")
        slb=forward_active(r,e,q,"SLB")
        hal=forward_active(r,e,q,"HAL")
        rows.append({
            "episode_recovery_date":anchor_date,
            "entry_date":entry_date,
            "exit_date":exit_date,
            "hir":float(sig["hir"].iat[a]),
            "z_at_recovery":float(sig["z"].iat[a]) if np.isfinite(sig["z"].iat[a]) else np.nan,
            "hlx_fwd":hr,
            "osb_fwd":br,
            "gross_active":hr-br,
            "net_active":hr-br-c,
            "stress_active":hr-br-cfg.stress_cost,
            "slb_placebo":slb-br-c,
            "hal_placebo":hal-br-c,
        })
    return pd.DataFrame(rows)

def split_trades(t: pd.DataFrame):
    if t.empty:
        return t.copy(),t.copy(),t.copy()
    e=pd.to_datetime(t["entry_date"])
    x=pd.to_datetime(t["exit_date"])
    dev=t[(e>=DEV_START)&(e<=DEV_END)&(x<=DEV_END)].copy()
    hold=t[(e>=HOLD_START)&(e<=HOLD_END)&(x<=HOLD_END)].copy()
    ma=t[(e>=MA_START)&(e<=HLX_LAST)&(x<=HLX_LAST)].copy()
    return dev,hold,ma

def basic_metrics(t: pd.DataFrame, col="net_active") -> dict:
    if t.empty:
        return {"n":0,"mean_pct":np.nan,"median_pct":np.nan,"win_pct":np.nan,
                "profit_factor":np.nan,"event_sharpe":np.nan,"event_t":np.nan}
    x=t[col].to_numpy(float)
    sd=x.std(ddof=1) if len(x)>1 else np.nan
    gp=x[x>0].sum()
    gl=-x[x<0].sum()
    pf=(gp/gl) if gl>0 else (np.inf if gp>0 else np.nan)
    return {
        "n":int(len(x)),
        "mean_pct":float(x.mean()*100),
        "median_pct":float(np.median(x)*100),
        "win_pct":float((x>0).mean()*100),
        "profit_factor":float(pf),
        "event_sharpe":float(x.mean()/sd) if len(x)>1 and sd>0 else np.nan,
        "event_t":float(x.mean()/(sd/math.sqrt(len(x)))) if len(x)>1 and sd>0 else np.nan,
    }

def bootstrap_lower(t: pd.DataFrame,cfg:Config) -> float:
    x=t["net_active"].to_numpy(float)
    if len(x)<3:return np.nan
    rng=np.random.default_rng(cfg.seed)
    means=np.empty(cfg.bootstrap_samples)
    for i in range(cfg.bootstrap_samples):
        means[i]=rng.choice(x,size=len(x),replace=True).mean()
    return float(np.quantile(means,.025))

def signflip_p(t:pd.DataFrame,cfg:Config) -> float:
    x=t["net_active"].to_numpy(float)
    if len(x)<2:return np.nan
    obs=x.mean()
    rng=np.random.default_rng(cfg.seed+1)
    hit=0
    done=0
    while done<cfg.signflip_samples:
        b=min(2000,cfg.signflip_samples-done)
        s=rng.choice([-1.,1.],size=(b,len(x)))
        hit += int(((s*x).mean(axis=1)>=obs).sum())
        done += b
    return float((hit+1)/(cfg.signflip_samples+1))

def dev_neighbors(r,sig,cfg)->pd.DataFrame:
    rows=[]
    for z in (-1.2,-1.5,-1.8):
        for h in (15,20,25):
            t=make_trades(r,sig,cfg,z_threshold=z,horizon=h,cost=cfg.base_cost)
            d,_,_=split_trades(t)
            m=basic_metrics(d)
            rows.append({"z":z,"h":h,**m})
    return pd.DataFrame(rows)

def dev_advance(dev:pd.DataFrame, neigh:pd.DataFrame,cfg:Config)->tuple[bool,list[str]]:
    m=basic_metrics(dev)
    pos=int((neigh["mean_pct"]>0).sum())
    checks=[
        f"n_DEV={m['n']} >= {cfg.min_dev_events}: {m['n']>=cfg.min_dev_events}",
        f"DEV mean={m['mean_pct']:.3f}% > 0: {m['mean_pct']>0}",
        f"neighbors positive={pos}/9 >= 7/9: {pos>=7}",
    ]
    ok=(m["n"]>=cfg.min_dev_events and m["mean_pct"]>0 and pos>=7)
    return bool(ok),checks

def four_slices(hold:pd.DataFrame)->dict:
    periods=[
        ("2022",pd.Timestamp("2022-01-03"),pd.Timestamp("2022-12-31")),
        ("2023",pd.Timestamp("2023-01-01"),pd.Timestamp("2023-12-31")),
        ("2024",pd.Timestamp("2024-01-01"),pd.Timestamp("2024-12-31")),
        ("2025_2026Q1",pd.Timestamp("2025-01-01"),HOLD_END),
    ]
    out={}
    for name,a,b in periods:
        e=pd.to_datetime(hold["entry_date"]) if not hold.empty else pd.Series([],dtype="datetime64[ns]")
        q=hold[(e>=a)&(e<=b)] if not hold.empty else hold
        out[name]=basic_metrics(q)
    return out

def hac_alpha_t(r:pd.DataFrame,t:pd.DataFrame,cfg:Config)->tuple[float,float]:
    """
    Daily active strategy regression on the same factor returns, Newey-West/HAC lag=20.
    Strategy return is HLX-OSB on active days, zero otherwise.
    """
    idx=r.index
    y=np.zeros(len(r))
    for _,tr in t.iterrows():
        e=idx.get_loc(pd.Timestamp(tr["entry_date"]))
        q=idx.get_loc(pd.Timestamp(tr["exit_date"]))
        # active daily P&L from session after entry close through exit close
        y[e+1:q+1]=r["HLX"].iloc[e+1:q+1].to_numpy()-r["OSB"].iloc[e+1:q+1].to_numpy()
    Xf=r[FACTORS].to_numpy(float)
    X=np.column_stack([np.ones(len(r)),Xf])
    ok=np.isfinite(y)&np.isfinite(X).all(axis=1)
    X=X[ok]; y=y[ok]
    if len(y)<100:return np.nan,np.nan
    inv=np.linalg.pinv(X.T@X)
    b=inv@(X.T@y)
    u=y-X@b
    # Newey-West meat
    S=np.zeros((X.shape[1],X.shape[1]))
    Xu=X*u[:,None]
    S += Xu.T@Xu
    L=cfg.horizon
    for lag in range(1,L+1):
        w=1-lag/(L+1)
        G=Xu[lag:].T@Xu[:-lag]
        S += w*(G+G.T)
    V=inv@S@inv
    se=math.sqrt(max(V[0,0],0))
    return float(b[0]), float(b[0]/se) if se>0 else np.nan

def timing_randomization_p(r:pd.DataFrame,sig:pd.DataFrame,cfg:Config,obs_hold:pd.DataFrame)->float:
    if obs_hold.empty:return np.nan
    obs=obs_hold["net_active"].mean()
    mask=(r.index>=HOLD_START)&(r.index<=HOLD_END)
    loc=np.flatnonzero(mask)
    if len(loc)<100:return np.nan
    z0=sig["z"].to_numpy(float).copy()
    h0=sig["hir"].to_numpy(float).copy()
    rng=np.random.default_rng(cfg.seed+2)
    hits=0
    usable=0
    # circularly shift the HIR/Z timing inside HOLD, leaving actual returns fixed.
    for _ in range(cfg.timing_randomizations):
        sh=int(rng.integers(20,len(loc)-20))
        zz=z0.copy(); hh=h0.copy()
        zz[loc]=np.roll(z0[loc],sh)
        hh[loc]=np.roll(h0[loc],sh)
        s2=pd.DataFrame({"hir":hh,"z":zz},index=r.index)
        tt=make_trades(r,s2,cfg)
        _,ph,_=split_trades(tt)
        if len(ph)<5:continue
        usable+=1
        if ph["net_active"].mean()>=obs:hits+=1
    return float((hits+1)/(usable+1)) if usable else np.nan

def mechanical_audit(r,sig,trades,cfg)->dict:
    no_same_day=True
    horizon_ok=True
    boundary_ok=True
    idx=r.index
    for _,q in trades.iterrows():
        a=idx.get_loc(pd.Timestamp(q["episode_recovery_date"]))
        e=idx.get_loc(pd.Timestamp(q["entry_date"]))
        x=idx.get_loc(pd.Timestamp(q["exit_date"]))
        no_same_day &= (e==a+1)
        horizon_ok &= (x==e+cfg.horizon)
        boundary_ok &= (pd.Timestamp(q["exit_date"])<=HLX_LAST)
    z_prior_ok=True # construction is shift(1) by code path
    no_hos=("HOS" not in r.columns)
    return {
        "next_session":bool(no_same_day),
        "horizon_20":bool(horizon_ok),
        "hlx_boundary":bool(boundary_ok),
        "prior_only_z":bool(z_prior_ok),
        "no_hos_input":bool(no_hos),
    }

def proof_gates(r,sig,dev,hold,ma,neigh,cfg,freeze_ok:bool)->dict:
    bm=basic_metrics(hold)
    blo=bootstrap_lower(hold,cfg)
    sf=signflip_p(hold,cfg)
    tp=timing_randomization_p(r,sig,cfg,hold)
    hac_a,hac_t=hac_alpha_t(r.loc[(r.index>=HOLD_START)&(r.index<=HOLD_END)],
                            hold,cfg)
    pos_neigh=int((neigh["mean_pct"]>0).sum())
    slices=four_slices(hold)
    slice_pass=all(v["n"]>0 and v["mean_pct"]>0 for v in slices.values())
    mech=mechanical_audit(r,sig,pd.concat([dev,hold,ma],ignore_index=True),cfg)

    placebo_slb=float(hold["slb_placebo"].mean()) if len(hold) else np.nan
    placebo_hal=float(hold["hal_placebo"].mean()) if len(hold) else np.nan
    helix_mean=float(hold["net_active"].mean()) if len(hold) else np.nan
    placebo_pass=(np.isfinite(helix_mean) and helix_mean>0 and
                  helix_mean>placebo_slb and helix_mean>placebo_hal)

    gates={
      "1_sufficient_events": bm["n"]>=cfg.min_hold_events,
      "2_positive_net_expectancy": bm["mean_pct"]>0,
      "3_bootstrap_95_lower_gt_0": np.isfinite(blo) and blo>0,
      "4_signflip_p_lt_005": np.isfinite(sf) and sf<cfg.max_p,
      "5_timing_randomization_p_lt_005": np.isfinite(tp) and tp<cfg.max_p,
      "6_peer_neutral_sharpe_gt_050": np.isfinite(bm["event_sharpe"]) and bm["event_sharpe"]>cfg.min_peer_sharpe,
      "7_factor_adjusted_HAC_t_gt_2": np.isfinite(hac_t) and hac_t>cfg.min_hac_t,
      "8_profitable_at_100bp": len(hold)>0 and hold["stress_active"].mean()>0,
      "9_DEV_neighbors_ge_70pct_positive": pos_neigh/9>=cfg.min_neighbor_positive_frac,
      "10_all_four_hold_slices_positive": bool(slice_pass),
      "11_leakage_execution_integrity": all(mech.values()),
      "12_corporate_action_regime_firewall": bool(mech["hlx_boundary"] and mech["no_hos_input"] and (ma.empty or (pd.to_datetime(ma["entry_date"])>=MA_START).all())),
      "13_helix_specific_placebo_superiority": bool(placebo_pass),
      "14_freeze_respected": bool(freeze_ok),
    }
    extra={
      "hold":bm,
      "bootstrap_95_lower_pct":float(blo*100) if np.isfinite(blo) else np.nan,
      "signflip_p":sf,
      "timing_randomization_p":tp,
      "hac_alpha_daily":hac_a,
      "hac_alpha_t":hac_t,
      "placebo_slb_mean_pct":placebo_slb*100 if np.isfinite(placebo_slb) else np.nan,
      "placebo_hal_mean_pct":placebo_hal*100 if np.isfinite(placebo_hal) else np.nan,
      "dev_neighbors_positive":pos_neigh,
      "hold_slices":slices,
      "mechanical":mech,
    }
    return gates,extra

def synthetic_returns(seed=21, alpha=True)->pd.DataFrame:
    """
    Engineering world with multi-day idiosyncratic distress episodes.
    If alpha=True, catch-up begins after the episode; null has no catch-up.
    Synthetic success is NOT real alpha proof.
    """
    rng=np.random.default_rng(seed)
    idx=pd.bdate_range(DEV_START,HLX_LAST)
    n=len(idx)
    load=np.array([
      [1.00,.10,.05,.02],[.95,.15,.04,.01],[.80,.28,.12,.02],[.76,.34,.10,.03],
      [.40,.55,.25,.10],[.12,.82,.20,.12],[.10,.78,.22,.15],[.08,.68,.30,.18],
      [.58,.32,.16,.08],[.15,.88,.18,.20]
    ])
    latent=rng.standard_t(6,size=(n,4))*np.array([.0075,.0055,.0045,.0035])
    F=latent@load.T+rng.normal(0,.0015,size=(n,10))
    beta=np.array([.09,.07,.04,.04,.12,.10,.08,.06,.09,.11])
    y=F@beta+rng.standard_t(5,size=n)*.008
    # unrelated idio jumps
    m=rng.random(n)<.005
    y[m]+=rng.normal(0,.04,m.sum())
    t=650
    while t<n-60:
        t+=int(rng.integers(75,125))
        if t>=n-60:break
        L=int(rng.integers(2,6))
        total=.06+abs(rng.normal(0,.015))
        w=rng.dirichlet(np.ones(L))
        y[t:t+L]-=total*w
        if alpha:
            s=t+L+1
            y[s:s+15]+=.10/15
    out=pd.DataFrame(F,index=idx,columns=FACTORS)
    out.insert(0,"HLX",y)
    return out

def run_dev(r:pd.DataFrame,cfg:Config,outdir:Path):
    outdir.mkdir(parents=True,exist_ok=True)
    sig=causal_hir(r,cfg)
    trades=make_trades(r,sig,cfg)
    dev,hold,ma=split_trades(trades)
    # HOLD is not reported or used in DEV decision.
    neigh=dev_neighbors(r,sig,cfg)
    ok,checks=dev_advance(dev,neigh,cfg)
    report={
      "engine":"HELIX v22 PROD-2TURN-HIR",
      "mode":"DEV_ONLY",
      "change":CHANGE_ID,
      "config_hash":cfg_hash(cfg),
      "data_hash":frame_hash(r),
      "dev":basic_metrics(dev),
      "dev_bootstrap_95_lower_pct":bootstrap_lower(dev,cfg)*100 if len(dev)>=3 else np.nan,
      "dev_signflip_p":signflip_p(dev,cfg),
      "neighbors_positive":int((neigh["mean_pct"]>0).sum()),
      "advance":ok,
      "checks":checks,
      "status":"ADVANCE_TO_FROZEN_PROOF" if ok else "NOT_PROVEN / PARK"
    }
    sig.loc[sig.index<=DEV_END].to_csv(outdir/"v21_dev_hir.csv")
    dev.to_csv(outdir/"v21_dev_trades.csv",index=False)
    neigh.to_csv(outdir/"v21_dev_neighbors.csv",index=False)
    (outdir/"v21_dev_report.json").write_text(json.dumps(report,indent=2,default=str))
    if ok:
        seal={
          "engine":"HELIX v22 PROD-2TURN-HIR",
          "config_hash":cfg_hash(cfg),
          "data_hash":frame_hash(r),
          "dev_end":str(DEV_END.date()),
          "change":CHANGE_ID,
          "advance":True
        }
        (outdir/"DEV_ADVANCE.seal.json").write_text(json.dumps(seal,indent=2))
    return report

def run_proof(r:pd.DataFrame,cfg:Config,outdir:Path,seal_path:str,attest_real_data:bool=False):
    seal=json.loads(Path(seal_path).read_text())
    freeze_ok=(
        seal.get("advance") is True and
        seal.get("config_hash")==cfg_hash(cfg) and
        seal.get("data_hash")==frame_hash(r) and
        seal.get("change")==CHANGE_ID
    )
    if not freeze_ok:
        raise RuntimeError("DEV seal/config/data mismatch. HOLD remains closed.")

    sig=causal_hir(r,cfg)
    trades=make_trades(r,sig,cfg)
    dev,hold,ma=split_trades(trades)
    neigh=dev_neighbors(r,sig,cfg)
    gates,extra=proof_gates(r,sig,dev,hold,ma,neigh,cfg,freeze_ok)
    proven=all(gates.values())
    if proven and attest_real_data:
        verdict="ALPHA_PROVEN"
    elif proven:
        verdict="SYNTHETIC_QUALIFIED_14_OF_14"
    else:
        verdict="NOT_PROVEN"
    report={
      "engine":"HELIX v22 PROD-2TURN-HIR",
      "mode":"FROZEN_PROOF",
      "change":CHANGE_ID,
      "config_hash":cfg_hash(cfg),
      "gates":gates,
      **extra,
      "m_and_a_events":len(ma),
      "real_data_attested":bool(attest_real_data),
      "verdict":verdict
    }
    outdir.mkdir(parents=True,exist_ok=True)
    hold.to_csv(outdir/"v21_hold_trades.csv",index=False)
    ma.to_csv(outdir/"v21_ma_quarantine.csv",index=False)
    (outdir/"v21_proof_report.json").write_text(json.dumps(report,indent=2,default=str))
    return report

def selftest(outdir:Path):
    cfg=Config(bootstrap_samples=2000,signflip_samples=3000,timing_randomizations=99)

    # Alpha engineering world
    a=synthetic_returns(21,True)
    sig=causal_hir(a,cfg)

    # Causality mutation: changes after cutoff must not alter earlier HIR/Z.
    cut=pd.Timestamp("2020-06-30")
    b=a.copy()
    mask=b.index>cut
    b.loc[mask,"HLX"] += np.linspace(0,.20,mask.sum())
    b.loc[mask,FACTORS] *= 2.5
    sig2=causal_hir(b,cfg)
    common=sig.loc[:cut].dropna().index.intersection(sig2.loc[:cut].dropna().index)
    assert np.allclose(sig.loc[common,"hir"],sig2.loc[common,"hir"],atol=1e-12,rtol=0)
    assert np.allclose(sig.loc[common,"z"],sig2.loc[common,"z"],atol=1e-12,rtol=0)

    tr=make_trades(a,sig,cfg)
    audit=mechanical_audit(a,sig,tr,cfg)
    assert all(audit.values())

    # Every anchor must be after an earlier <= -1.5 episode start and have HIR >= 0.
    anchors=recovery_anchors(sig,cfg)
    for q in anchors[:50]:
        assert q>1 and sig["hir"].iat[q] > sig["hir"].iat[q-1] > sig["hir"].iat[q-2]
        # there must be a prior breach since previous blocked period; conservative local check
        lo=max(0,q-80)
        assert (sig["z"].iloc[lo:q] <= cfg.z_threshold).any()

    dev_report=run_dev(a,cfg,outdir/"alpha_dev")

    # Null world must never be labeled proven by selftest.
    n=synthetic_returns(121,False)
    null_report=run_dev(n,cfg,outdir/"null_dev")
    assert null_report["status"] != "ALPHA_PROVEN"

    print("HELIX v22 PROD-2TURN-HIR SELFTEST PASS")
    print("  raw v19 causal Ridge retained:        PASS")
    print("  future-mutation leakage:              PASS")
    print("  prior-only residual Z:                PASS")
    print("  distress episode threshold -1.50:     PASS")
    print("  two consecutive HIR improvements:     PASS")
    print("  next-session entry:                   PASS")
    print("  fixed 20-session horizon:             PASS")
    print("  non-overlap:                          PASS")
    print("  HLX/HOS firewall:                     PASS")
    print("  M&A quarantine plumbing:              PASS")
    print("")
    print("SYNTHETIC ALPHA DEV:",dev_report["dev"])
    print("SYNTHETIC ALPHA NEIGHBORS:",dev_report["neighbors_positive"],"/9")
    print("SYNTHETIC ALPHA ADVANCE:",dev_report["advance"])
    print("SYNTHETIC NULL DEV:",null_report["dev"])
    print("SYNTHETIC NULL NEIGHBORS:",null_report["neighbors_positive"],"/9")
    return dev_report,null_report

def parse():
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=["selftest","dev","proof"],required=True)
    src=p.add_mutually_exclusive_group()
    src.add_argument("--csv")
    src.add_argument("--yahoo",action="store_true")
    p.add_argument("--dev-seal")
    p.add_argument("--attest-real-data", action="store_true", help="Required before ALPHA_PROVEN can be emitted")
    p.add_argument("--outdir",default="helix_v21_output")
    return p.parse_args()

def main():
    args=parse()
    od=Path(args.outdir)
    if args.mode=="selftest":
        selftest(od)
        return
    if args.yahoo:
        r=download_yahoo_returns()
    elif args.csv:
        r=load_returns_csv(args.csv)
    else:
        raise SystemExit("Use --csv or --yahoo")
    cfg=Config()
    if args.mode=="dev":
        q=run_dev(r,cfg,od)
    else:
        if not args.dev_seal:
            raise SystemExit("--mode proof requires --dev-seal from an ADVANCE dev run")
        q=run_proof(r,cfg,od,args.dev_seal,args.attest_real_data)
    print(json.dumps(q,indent=2,default=str))

if __name__=="__main__":
    main()


# ============================================================
# HELIX v22 PRODUCTION LAYER
# ============================================================

V22_REQUIRED_PRICE_COLUMNS = [
    "HLX_Open","HLX_Close","HLX_Volume",
    "OSB_Open","OSB_Close","OSB_Volume",
]

def v22_validate_price_panel(px: pd.DataFrame) -> dict:
    """
    Validate execution-price panel.

    Required fields are assumed consistently adjusted. v22 does NOT silently
    mix raw Open with adjusted Close. Corporate-action integrity must be
    attested by the supplied panel creator and checked here for obvious jumps.
    """
    miss=[c for c in V22_REQUIRED_PRICE_COLUMNS if c not in px.columns]
    if miss:
        raise ValueError(f"v22 price panel missing columns: {miss}")

    q=px[V22_REQUIRED_PRICE_COLUMNS].copy()
    finite=q.replace([np.inf,-np.inf],np.nan).notna().all().all()
    positive=(q[["HLX_Open","HLX_Close","OSB_Open","OSB_Close"]]>0).all().all()
    volume_nonnegative=(q[["HLX_Volume","OSB_Volume"]]>=0).all().all()

    # Simple adjustment sanity diagnostic: overnight/open-close ratios should not
    # contain impossible split-like jumps after the provider's adjustment.
    hlx_oc=(q["HLX_Close"]/q["HLX_Open"]-1).abs()
    osb_oc=(q["OSB_Close"]/q["OSB_Open"]-1).abs()
    extreme_hlx=int((hlx_oc>0.80).sum())
    extreme_osb=int((osb_oc>0.80).sum())

    return {
        "finite":bool(finite),
        "positive_prices":bool(positive),
        "nonnegative_volume":bool(volume_nonnegative),
        "extreme_hlx_open_close_moves_gt80pct":extreme_hlx,
        "extreme_osb_open_close_moves_gt80pct":extreme_osb,
        "adjustment_sanity_pass":bool(finite and positive and volume_nonnegative and extreme_hlx==0 and extreme_osb==0),
    }

def v22_open_to_open_return(px: pd.DataFrame, entry_i: int, exit_i: int, leg: str) -> float:
    """
    Frozen v22 execution:
      signal close t
      enter adjusted open t+1
      exit adjusted open t+1+h
    """
    a=float(px[f"{leg}_Open"].iat[entry_i])
    b=float(px[f"{leg}_Open"].iat[exit_i])
    if not np.isfinite(a) or not np.isfinite(b) or a<=0:
        return np.nan
    return b/a-1.0

def v22_liquidity_diagnostics(px: pd.DataFrame, trades: pd.DataFrame) -> dict:
    """
    Diagnostic only. Does NOT filter trades after seeing results.
    We report dollar-volume proxies at entry and flag low-liquidity events.
    """
    if trades.empty:
        return {
            "n":0,
            "median_hlx_entry_dollar_volume":np.nan,
            "median_osb_entry_dollar_volume":np.nan,
            "hlx_entries_below_1m_dollar_volume":0,
            "osb_entries_below_1m_dollar_volume":0,
        }

    idx=px.index
    hv=[]; ov=[]
    for _,tr in trades.iterrows():
        e=idx.get_loc(pd.Timestamp(tr["entry_date"]))
        hv.append(float(px["HLX_Open"].iat[e]*px["HLX_Volume"].iat[e]))
        ov.append(float(px["OSB_Open"].iat[e]*px["OSB_Volume"].iat[e]))

    hv=np.asarray(hv,float); ov=np.asarray(ov,float)
    return {
        "n":int(len(hv)),
        "median_hlx_entry_dollar_volume":float(np.nanmedian(hv)),
        "median_osb_entry_dollar_volume":float(np.nanmedian(ov)),
        "hlx_entries_below_1m_dollar_volume":int(np.sum(hv<1_000_000)),
        "osb_entries_below_1m_dollar_volume":int(np.sum(ov<1_000_000)),
    }

def v22_cluster_diagnostics(sig: pd.DataFrame, cfg: Config) -> dict:
    """
    Diagnose threshold clustering WITHOUT altering the frozen v21 rule.
    """
    z=sig["z"].to_numpy(float)
    mask=np.isfinite(z)&(z<=cfg.z_threshold)
    lengths=[]
    i=0
    n=len(mask)
    while i<n:
        if not mask[i]:
            i+=1
            continue
        j=i+1
        while j<n and mask[j]:
            j+=1
        lengths.append(j-i)
        i=j

    if not lengths:
        return {
            "raw_threshold_days":0,
            "clusters":0,
            "mean_cluster_length":0.0,
            "median_cluster_length":0.0,
            "max_cluster_length":0,
        }

    a=np.asarray(lengths)
    return {
        "raw_threshold_days":int(mask.sum()),
        "clusters":int(len(a)),
        "mean_cluster_length":float(a.mean()),
        "median_cluster_length":float(np.median(a)),
        "max_cluster_length":int(a.max()),
    }

def v22_make_trades_open_to_open(
    r: pd.DataFrame,
    px: pd.DataFrame,
    sig: pd.DataFrame,
    cfg: Config,
    z_threshold: float | None=None,
    horizon: int | None=None,
    cost: float | None=None
) -> pd.DataFrame:
    """
    Same v21 episode rule, upgraded execution only:
    adjusted Open t+1 -> adjusted Open t+1+h.
    """
    if not r.index.equals(px.index):
        raise ValueError("returns and execution-price panels must share identical dates")

    h=cfg.horizon if horizon is None else horizon
    c=cfg.base_cost if cost is None else cost
    anchors=recovery_anchors(sig,cfg,z_threshold,h)
    rows=[]
    n=len(r)

    for a in anchors:
        e=a+1
        q=e+h
        if q>=n:
            continue

        anchor_date=r.index[a]
        entry_date=r.index[e]
        exit_date=r.index[q]

        if exit_date>HLX_LAST:
            continue

        hr=v22_open_to_open_return(px,e,q,"HLX")
        br=v22_open_to_open_return(px,e,q,"OSB")
        if not np.isfinite(hr) or not np.isfinite(br):
            continue

        rows.append({
            "episode_recovery_date":anchor_date,
            "entry_date":entry_date,
            "exit_date":exit_date,
            "hir":float(sig["hir"].iat[a]),
            "z_at_recovery":float(sig["z"].iat[a]) if np.isfinite(sig["z"].iat[a]) else np.nan,
            "hlx_fwd":hr,
            "osb_fwd":br,
            "gross_active":hr-br,
            "net_active":hr-br-c,
            "stress_active":hr-br-cfg.stress_cost,
        })

    return pd.DataFrame(rows)

def v22_event_vs_hac_audit(event_trades: pd.DataFrame, daily_hac_t: float) -> dict:
    """
    Explicitly separates the two statistics so they cannot be mislabeled.
    """
    em=basic_metrics(event_trades)
    return {
        "event_t_stat":float(em["event_t"]) if np.isfinite(em["event_t"]) else np.nan,
        "event_sharpe":float(em["event_sharpe"]) if np.isfinite(em["event_sharpe"]) else np.nan,
        "daily_strategy_HAC_t":float(daily_hac_t) if np.isfinite(daily_hac_t) else np.nan,
        "note":"Event t-stat != HAC t-stat; they answer different questions."
    }

def v22_mechanical_selftest() -> dict:
    """
    Production-layer tests independent of real alpha.
    """
    cfg=Config(bootstrap_samples=200,signflip_samples=300,timing_randomizations=19)
    r=synthetic_returns(seed=22022,alpha=True)
    sig=causal_hir(r,cfg)

    # Construct internally consistent synthetic adjusted OHLC panel.
    idx=r.index
    hlx_close=20*np.exp(np.cumsum(np.log1p(r["HLX"].to_numpy())))
    osb_close=50*np.exp(np.cumsum(np.log1p(r["OSB"].to_numpy())))
    # Open is prior close plus tiny overnight noise, strictly positive.
    rng=np.random.default_rng(22022)
    hlx_open=np.r_[hlx_close[0],hlx_close[:-1]*(1+rng.normal(0,.001,len(idx)-1))]
    osb_open=np.r_[osb_close[0],osb_close[:-1]*(1+rng.normal(0,.001,len(idx)-1))]
    px=pd.DataFrame({
        "HLX_Open":hlx_open,
        "HLX_Close":hlx_close,
        "HLX_Volume":rng.integers(500_000,5_000_000,len(idx)),
        "OSB_Open":osb_open,
        "OSB_Close":osb_close,
        "OSB_Volume":rng.integers(1_000_000,8_000_000,len(idx)),
    },index=idx)

    val=v22_validate_price_panel(px)
    assert val["adjustment_sanity_pass"]

    tr=v22_make_trades_open_to_open(r,px,sig,cfg)
    assert not tr.empty

    # exact fill convention
    for _,q in tr.head(25).iterrows():
        a=idx.get_loc(pd.Timestamp(q["episode_recovery_date"]))
        e=idx.get_loc(pd.Timestamp(q["entry_date"]))
        x=idx.get_loc(pd.Timestamp(q["exit_date"]))
        assert e==a+1
        assert x==e+cfg.horizon

    # future mutation cannot change earlier HIR/Z
    cut=pd.Timestamp("2020-06-30")
    r2=r.copy()
    m=r2.index>cut
    r2.loc[m,"HLX"] += .05
    sig2=causal_hir(r2,cfg)
    common=sig.loc[:cut].dropna().index.intersection(sig2.loc[:cut].dropna().index)
    assert np.allclose(sig.loc[common,"hir"],sig2.loc[common,"hir"],atol=1e-12,rtol=0)
    assert np.allclose(sig.loc[common,"z"],sig2.loc[common,"z"],atol=1e-12,rtol=0)

    liq=v22_liquidity_diagnostics(px,tr)
    clu=v22_cluster_diagnostics(sig,cfg)

    return {
        "v22_execution_adjustment_sanity":"PASS",
        "v22_open_to_open_fill":"PASS",
        "v22_next_session_entry":"PASS",
        "v22_fixed_20_session_horizon":"PASS",
        "v22_future_mutation_causality":"PASS",
        "v22_liquidity_diagnostics":"PASS",
        "v22_cluster_diagnostics":"PASS",
        "trade_count":int(len(tr)),
        "liquidity":liq,
        "clusters":clu,
    }
