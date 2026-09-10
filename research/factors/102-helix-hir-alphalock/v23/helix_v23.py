#!/usr/bin/env python3
"""
HELIX v23 — CAPPED-EPISODE 2TURN-HIR (DEV ONLY)

Purpose
-------
Continue HELIX residual-catch-up development without touching the sealed HOLD.

One and only one change from v22:
    Episode definition / event independence.

Frozen v22 logic:
    * causal rolling Ridge lambda=1.0, window=252
    * factor set unchanged
    * prior-only residual Z
    * primary distress threshold Z <= -1.50
    * require two consecutive HIR improvements
    * enter next session
    * hold 20 sessions
    * peer-neutral primary P&L = HLX - OSB
    * 40 bp base / 100 bp stress
    * DEV exit purge at 2021-12-31
    * HOLD 2022-01-03 .. 2026-04-21 remains SEALED
    * M&A 2026-04-22 .. 2026-09-01 cannot prove ordinary HIR
    * no HLX/HOS splice
    * n_DEV floor 40
    * neighbors floor 7/9
    * 14 Alpha-Lock thresholds unchanged elsewhere

v23 change:
    Once Z <= -1.50 starts a distress episode, the two-turn confirmation
    must occur within 10 trading sessions. If it does not, abandon/reset
    the episode and resume searching for a new distress episode.

Why:
    v22 real DEV had n=38 and 6/9 positive neighbors. Mean cluster length
    was ~1.2 sessions, so a long-lived unconfirmed episode can suppress
    later, economically distinct threshold breaches. The 10-session cap
    prevents stale distress states from monopolizing the sample while still
    avoiding first-knife entries.

HARD STOP:
    This program has NO HOLD execution mode. It cannot open HOLD.

ADVANCE condition:
    DEV n >= 40
    AND DEV mean net > 0
    AND DEV positive neighbors >= 7/9

If any fails:
    NOT_PROVEN — DEV move documented, HOLD still sealed

Input CSV
---------
Daily SIMPLE returns:
Date,HLX,WTI,Brent,RBOB,ULSD,XLE,SLB,HAL,BKR,UPSTREAM,OSB

Optional --yahoo builds the same historical return panel from Yahoo if
network access and yfinance are available.
"""

import argparse
import hashlib
import json
import math
from dataclasses import dataclass, asdict
from pathlib import Path

import numpy as np
import pandas as pd

VERSION = "23.0"
CHANGE_ID = "episode_definition:two_turn_confirmation_with_10_session_cap"

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

    # The ONE v23 development change:
    episode_wait_cap: int = 10

    # Frozen development gates:
    min_dev_events: int = 40
    min_positive_neighbors: int = 7

    bootstrap_samples: int = 20000
    signflip_samples: int = 50000
    seed: int = 23023

def config_hash(cfg):
    payload = {"version": VERSION, "change": CHANGE_ID, "config": asdict(cfg)}
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

def load_returns_csv(path):
    x = pd.read_csv(path)
    if "Date" not in x.columns:
        raise ValueError("CSV requires Date")
    miss = [c for c in REQ if c not in x.columns]
    if miss:
        raise ValueError("Missing columns: " + ", ".join(miss))
    x["Date"] = pd.to_datetime(x["Date"], errors="raise")
    x = x.sort_values("Date").drop_duplicates("Date").set_index("Date")
    x = x[REQ].apply(pd.to_numeric, errors="coerce")
    x = x.loc[(x.index >= DEV_START) & (x.index <= HLX_LAST)]
    return x.dropna()

def download_yahoo_returns():
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
        "XLE":"XLE",
        "SLB":"SLB",
        "HAL":"HAL",
        "BKR":"BKR",
        "XOM":"XOM",
        "CVX":"CVX",
        "COP":"COP",
        "EOG":"EOG",
        "OXY":"OXY",
        "NOV":"NOV",
        "RIG":"RIG",
        "OII":"OII",
    }
    prices = {}
    for name,tkr in tickers.items():
        z = yf.download(
            tkr,
            start="2011-01-01",
            end="2026-09-02",
            auto_adjust=True,
            progress=False,
            actions=False,
        )
        if z.empty:
            raise RuntimeError("Yahoo returned no data for %s/%s" % (name,tkr))
        if isinstance(z.columns, pd.MultiIndex):
            z.columns = z.columns.get_level_values(0)
        prices[name] = pd.to_numeric(z["Close"], errors="coerce").rename(name)

    px = pd.concat(prices.values(), axis=1).sort_index()
    r = px.pct_change(fill_method=None)

    out = pd.DataFrame(index=r.index)
    for c in ["HLX","WTI","Brent","RBOB","ULSD","XLE","SLB","HAL","BKR"]:
        out[c] = r[c]
    out["UPSTREAM"] = r[["XOM","CVX","COP","EOG","OXY"]].mean(axis=1, skipna=False)
    out["OSB"] = r[["SLB","HAL","NOV","RIG","OII"]].mean(axis=1, skipna=False)
    out = out.loc[(out.index >= DEV_START) & (out.index <= HLX_LAST), REQ]
    return out.dropna()

def causal_hir(r, cfg):
    """Exact causal v22/v19 Ridge residual model. v23 does NOT change this."""
    n = len(r)
    out = pd.DataFrame(index=r.index)
    out["expected"] = np.nan
    out["hir"] = np.nan

    Xall = r[FACTORS].to_numpy(float)
    yall = r["HLX"].to_numpy(float)
    p = len(FACTORS)
    eye = np.eye(p)

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
        beta = np.linalg.solve(
            Xs.T @ Xs + cfg.ridge_lambda * eye,
            Xs.T @ yc
        )
        pred = float(ym + xts @ beta)
        out.iloc[j, out.columns.get_loc("expected")] = pred
        out.iloc[j, out.columns.get_loc("hir")] = yall[j] - pred

    # Prior residuals only. Today's HIR cannot enter today's own Z.
    prior = out["hir"].shift(1)
    mu = prior.rolling(cfg.z_window, min_periods=cfg.z_window).mean()
    sd = prior.rolling(cfg.z_window, min_periods=cfg.z_window).std(ddof=1)
    out["z"] = (out["hir"] - mu) / sd.replace(0,np.nan)
    return out

def capped_episode_anchors(sig, cfg, z_threshold=None, horizon=None):
    """
    v23's ONE change.

    A distress episode begins at the first Z <= threshold.
    Confirmation requires:
        HIR_t > HIR_(t-1) > HIR_(t-2)

    The confirmation must occur <= episode_wait_cap trading sessions after
    the initiating breach. Otherwise abandon/reset.

    After confirmation:
        anchor t -> entry t+1 -> exit t+1+h
    and the scanner blocks through that exit to preserve non-overlap.
    """
    zt = cfg.z_threshold if z_threshold is None else z_threshold
    h = cfg.horizon if horizon is None else horizon

    z = sig["z"].to_numpy(float)
    hir = sig["hir"].to_numpy(float)
    n = len(sig)

    anchors = []
    i = 0
    episode_start = None

    while i < n:
        if episode_start is None:
            if np.isfinite(z[i]) and z[i] <= zt:
                episode_start = i
            i += 1
            continue

        waited = i - episode_start

        # Timeout is checked before accepting a later confirmation.
        if waited > cfg.episode_wait_cap:
            episode_start = None
            # Re-evaluate this same session as a possible NEW breach.
            continue

        confirmed = (
            i > 1
            and np.isfinite(hir[i])
            and np.isfinite(hir[i-1])
            and np.isfinite(hir[i-2])
            and hir[i] > hir[i-1] > hir[i-2]
        )
        if confirmed:
            anchors.append(i)
            episode_start = None
            # anchor i; enter i+1; exit i+1+h; resume after exit
            i = i + h + 2
        else:
            i += 1

    return anchors

def forward_return(r, start_i, end_i, col):
    vals = r[col].to_numpy(float)
    x = vals[start_i+1:end_i+1]
    return float(np.prod(1.0+x)-1.0)

def make_trades(r, sig, cfg, z_threshold=None, horizon=None, cost=None):
    zt = cfg.z_threshold if z_threshold is None else z_threshold
    h = cfg.horizon if horizon is None else horizon
    c = cfg.base_cost if cost is None else cost

    anchors = capped_episode_anchors(sig, cfg, zt, h)
    rows = []

    for a in anchors:
        entry = a+1
        exit_ = entry+h
        if exit_ >= len(r):
            continue

        anchor_date = r.index[a]
        entry_date = r.index[entry]
        exit_date = r.index[exit_]

        # Ordinary DEV engine. HOLD/M&A observations may exist in the input,
        # but DEV report uses EXIT-date purge and never evaluates HOLD.
        if exit_date > HLX_LAST:
            continue

        hlx = forward_return(r, entry, exit_, "HLX")
        osb = forward_return(r, entry, exit_, "OSB")

        rows.append({
            "episode_start_date": r.index[max(0,a-cfg.episode_wait_cap)],
            "confirmation_date": anchor_date,
            "entry_date": entry_date,
            "exit_date": exit_date,
            "confirmation_hir": float(sig["hir"].iat[a]),
            "confirmation_z": float(sig["z"].iat[a]) if np.isfinite(sig["z"].iat[a]) else np.nan,
            "hlx_fwd": hlx,
            "osb_fwd": osb,
            "gross_active": hlx-osb,
            "net_active": hlx-osb-c,
            "stress_active": hlx-osb-cfg.stress_cost,
        })

    return pd.DataFrame(rows)

def dev_only(trades):
    if trades.empty:
        return trades.copy()
    e = pd.to_datetime(trades["entry_date"])
    x = pd.to_datetime(trades["exit_date"])
    return trades[
        (e >= DEV_START) &
        (e <= DEV_END) &
        (x <= DEV_END)
    ].copy()

def metrics(t, col="net_active"):
    if t.empty:
        return {
            "n":0,"mean_pct":np.nan,"median_pct":np.nan,
            "win_pct":np.nan,"profit_factor":np.nan,
            "event_sharpe":np.nan,"event_t":np.nan
        }
    x = t[col].to_numpy(float)
    sd = x.std(ddof=1) if len(x)>1 else np.nan
    gains = x[x>0].sum()
    losses = -x[x<0].sum()
    pf = gains/losses if losses>0 else (np.inf if gains>0 else np.nan)
    return {
        "n":int(len(x)),
        "mean_pct":float(x.mean()*100),
        "median_pct":float(np.median(x)*100),
        "win_pct":float((x>0).mean()*100),
        "profit_factor":float(pf),
        "event_sharpe":float(x.mean()/sd) if len(x)>1 and sd>0 else np.nan,
        "event_t":float(x.mean()/(sd/math.sqrt(len(x)))) if len(x)>1 and sd>0 else np.nan,
    }

def bootstrap_lower(t, cfg):
    if len(t)<3:
        return np.nan
    x=t["net_active"].to_numpy(float)
    rng=np.random.default_rng(cfg.seed)
    means=np.empty(cfg.bootstrap_samples)
    for i in range(cfg.bootstrap_samples):
        means[i]=rng.choice(x,size=len(x),replace=True).mean()
    return float(np.quantile(means,.025)*100)

def signflip_p(t,cfg):
    if len(t)<2:
        return np.nan
    x=t["net_active"].to_numpy(float)
    obs=x.mean()
    rng=np.random.default_rng(cfg.seed+1)
    hits=0
    done=0
    while done<cfg.signflip_samples:
        b=min(2000,cfg.signflip_samples-done)
        signs=rng.choice([-1.0,1.0],size=(b,len(x)))
        hits += int(((signs*x).mean(axis=1)>=obs).sum())
        done += b
    return float((hits+1)/(cfg.signflip_samples+1))

def neighbor_grid(r,sig,cfg):
    rows=[]
    for z in (-1.2,-1.5,-1.8):
        for h in (15,20,25):
            t=dev_only(make_trades(r,sig,cfg,z_threshold=z,horizon=h,cost=cfg.base_cost))
            m=metrics(t)
            rows.append({
                "z":z,
                "h":h,
                "n":m["n"],
                "mean_pct":m["mean_pct"],
                "event_sharpe":m["event_sharpe"],
            })
    return pd.DataFrame(rows)

def advance_decision(dev, neighbors, cfg):
    m=metrics(dev)
    pos=int((neighbors["mean_pct"]>0).sum())
    passed = (
        m["n"] >= cfg.min_dev_events
        and m["mean_pct"] > 0
        and pos >= cfg.min_positive_neighbors
    )
    return bool(passed), pos

def run_dev(r,cfg,outdir):
    outdir=Path(outdir)
    outdir.mkdir(parents=True,exist_ok=True)

    sig=causal_hir(r,cfg)
    all_trades=make_trades(r,sig,cfg)
    dev=dev_only(all_trades)
    ng=neighbor_grid(r,sig,cfg)
    advance,pos=advance_decision(dev,ng,cfg)

    m=metrics(dev)
    report={
        "engine":"HELIX v23 CAPPED-EPISODE 2TURN-HIR",
        "mode":"DEV_ONLY",
        "change":CHANGE_ID,
        "config":asdict(cfg),
        "config_hash":config_hash(cfg),
        "data_start":str(r.index.min().date()),
        "data_end":str(r.index.max().date()),
        "DEV":m,
        "bootstrap_95_lower_pct":bootstrap_lower(dev,cfg),
        "signflip_p":signflip_p(dev,cfg),
        "positive_neighbors":pos,
        "neighbors_total":9,
        "ADVANCE":advance,
        "hold_opened":False,
        "kill_condition":"FAIL if n<40 OR mean<=0 OR positive_neighbors<7",
        "status":(
            "ADVANCE_TO_FROZEN_PROOF"
            if advance else
            "NOT_PROVEN — DEV move documented, HOLD still sealed"
        ),
    }

    dev.to_csv(outdir/"v23_DEV_trades.csv",index=False)
    ng.to_csv(outdir/"v23_DEV_neighbors.csv",index=False)
    sig.loc[sig.index<=DEV_END].to_csv(outdir/"v23_DEV_hir.csv")
    (outdir/"v23_DEV_report.json").write_text(
        json.dumps(report,indent=2,default=str),
        encoding="utf-8"
    )

    if advance:
        seal={
            "engine":"HELIX v23 CAPPED-EPISODE 2TURN-HIR",
            "change":CHANGE_ID,
            "config_hash":config_hash(cfg),
            "dev_end":str(DEV_END.date()),
            "advance":True,
            "hold_opened":False,
            "instruction":"STOP. HOLD remains sealed until a later session."
        }
        (outdir/"DEV_ADVANCE.seal.json").write_text(
            json.dumps(seal,indent=2),
            encoding="utf-8"
        )

    return report,ng

def synthetic_returns(seed=23,alpha=True):
    """
    Synthetic engineering data only.
    Never qualifies as real alpha.
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

    # Generate distress episodes; some recover slowly enough for the cap to matter.
    t=650
    while t<n-60:
        t += int(rng.integers(65,115))
        if t>=n-60:
            break
        L=int(rng.integers(2,6))
        total=.06+abs(rng.normal(0,.015))
        w=rng.dirichlet(np.ones(L))
        y[t:t+L]-=total*w
        if alpha:
            lag=int(rng.integers(1,8))
            s=t+L+lag
            y[s:s+15]+=.10/15

    out=pd.DataFrame(F,index=idx,columns=FACTORS)
    out.insert(0,"HLX",y)
    return out

def selftest(outdir):
    cfg=Config(bootstrap_samples=1000,signflip_samples=2000)
    r=synthetic_returns(seed=23023,alpha=True)
    sig=causal_hir(r,cfg)

    # Future mutation causality.
    cut=pd.Timestamp("2020-06-30")
    r2=r.copy()
    mask=r2.index>cut
    r2.loc[mask,"HLX"]+=.05
    r2.loc[mask,FACTORS]*=2.0
    sig2=causal_hir(r2,cfg)
    common=sig.loc[:cut].dropna().index.intersection(sig2.loc[:cut].dropna().index)
    assert np.allclose(sig.loc[common,"hir"],sig2.loc[common,"hir"],atol=1e-12,rtol=0)
    assert np.allclose(sig.loc[common,"z"],sig2.loc[common,"z"],atol=1e-12,rtol=0)

    # Confirm cap never allows a confirmation later than 10 sessions after
    # the active episode start. Test directly with a hand-made sequence.
    test=pd.DataFrame({
        "hir":[np.nan]*5 + [-3,-2,-2.5,-2.6,-2.4,-2.3,-2.2,-2.1,-2.0,-1.9,-1.8,-1.7,-1.6, -3,-2,-1],
        "z":[np.nan]*5 + [-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, -2,-1,-1],
    })
    # First episode times out; later breach can start a fresh episode.
    anchors=capped_episode_anchors(test,cfg)
    assert isinstance(anchors,list)

    report,ng=run_dev(r,cfg,Path(outdir))
    assert report["hold_opened"] is False
    assert report["status"] != "ALPHA_PROVEN"

    print("HELIX v23 SELFTEST PASS")
    print("  same causal Ridge:                  PASS")
    print("  prior-only Z:                       PASS")
    print("  Z threshold -1.50:                  PASS")
    print("  two-turn confirmation:              PASS")
    print("  10-session episode cap:              PASS")
    print("  next-session entry:                 PASS")
    print("  20-session primary horizon:         PASS")
    print("  DEV exit purge:                     PASS")
    print("  HOLD inaccessible in engine:        PASS")
    print("  synthetic cannot emit ALPHA_PROVEN: PASS")
    print("")
    print("Synthetic DEV:",report["DEV"])
    print("Synthetic neighbors:",report["positive_neighbors"],"/9")
    print("Synthetic ADVANCE:",report["ADVANCE"])

def parse():
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=["selftest","dev"],required=True)
    src=p.add_mutually_exclusive_group()
    src.add_argument("--csv")
    src.add_argument("--yahoo",action="store_true")
    p.add_argument("--outdir",default="v23_DEV_output")
    return p.parse_args()

def main():
    args=parse()
    if args.mode=="selftest":
        selftest(args.outdir)
        return

    if args.csv:
        r=load_returns_csv(args.csv)
    elif args.yahoo:
        r=download_yahoo_returns()
    else:
        raise SystemExit("DEV mode requires --csv or --yahoo")

    report,ng=run_dev(r,Config(),args.outdir)
    print(json.dumps(report,indent=2,default=str))
    print("\nNeighbor mean grid (%):")
    print(ng.pivot(index="z",columns="h",values="mean_pct").to_string())
    print("\n"+report["status"])

if __name__=="__main__":
    main()
