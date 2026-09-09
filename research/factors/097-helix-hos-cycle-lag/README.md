# 097 — Helix / HOS Cycle-Lag Screen

| | |
| --- | --- |
| Status | **PARK** / E1 / weight 0.0 |
| Source repo | [Liam-Son/helix-factor-screen](https://github.com/Liam-Son/helix-factor-screen) (imported 2026-09-09) |
| Live ticker | **HOS** from 2026-09-02. HLX last print 2026-09-01. **Do not splice.** |
| Engine | **WAIT** — G3 locked until 60 HOS sessions |
| Trading | **LOCKED** on HOS. Historical HLX engine is in-sample after 2022. |

This is **not** a revival of the deleted 095 Oil–Helix Dislocation card. That card asked whether WTI or HLX was “wrong.” This card asks a different question:

> When oil and oil-service peers are already in a cycle, and HLX/HOS still lags the peer basket, does a two-day confirmed three-gate rule beat buy-and-hold **on HLX only**?

Target is the **equity**, not WTI. Same-day energy-chain ICs in `screen/factor_screen.csv` are descriptive. They are not an oil-trading signal.

## Workflow

```
prices (Yahoo) → build_panel() → gates G1 G2 G3
                 → 2-day confirm → size next session
                 → WAIT if ticker is HOS and n_HOS < 60
```

| Gate | Meaning | Frozen rule |
| --- | --- | --- |
| G1 oil | WTI off 12m low ≥ +20%, **or** off 12m high ≥ −25% crash bounce, **or** UPB 60d log-sum > 0. Need 2 of 3. | `WTI_RALLY=0.20`, `WTI_CRASH=-0.25` |
| G2 services | OSB 60d log-sum > 0 **or** OIH > 120d low × 1.02 | peers on |
| G3 lag | HLX (then HOS) 60d log-sum − OSB 60d ≤ **−10pp**, two days | HOS needs 60 sessions first |

Exit when any gate drops. VIX above 12m 80th percentile → 0.5x. Code: [`engine/buy_engine.py`](engine/buy_engine.py).

OSB = equal-weight SLB HAL NOV RIG OII. UPB = XOM CVX COP EOG OXY. HLX/HOS never in OSB.

## What the source repo already showed

Imported snapshot 2026-09-09. Full notes: [`RESULTS.md`](RESULTS.md), trades: [`signals/SIGNALS.md`](signals/SIGNALS.md).

Cycle-lag engine on **HLX 2012-01-01 → 2026-09-01** (21 tight trades):

| | End NAV (start=1) |
| --- | ---: |
| Strategy | 2.06× |
| Buy & hold HLX | 0.69× |
| OSB peers | 0.71× |

Hit 71%, avg +3.9%. **Path lives in 2021–22.** Not an untouched OOS claim.

Oil-up / stock-down as a **buy** rule (the trader sentence):

| Rule | n | HLX +60d hit | avg +60d |
| --- | ---: | ---: | ---: |
| Loose 60d WTI ≥ +10% and gap ≤ −15pp | 24 | 58% | −0.8% |
| Tight 60d WTI ≥ +20% and gap ≤ −20pp | 8 | **25%** | **−19.5%** |

Tight “buy the lag after an oil spike” is the **opposite** of a buy rule.

Factor screen (same-day IC vs HLX vs forward 20d) lives in [`screen/factor_screen.csv`](screen/factor_screen.csv). Same-day WTI/Brent ICs are large because they are the energy complex. Forward-20d ICs are small or negative. Do not promote a same-day IC to a forecast.

## Live as of source snapshot

- HLX last $10.60 (2026-09-01). HOS 2026-09-08 $9.08. Combined name, new float.
- Engine: WAIT. G1 on (oil). G3 locked.
- Ops context in RESULTS: utilization / dayrates / backlog are **not** yet a coded gate.

## Verdict

```
MEASUREMENT VALIDITY: PASS on HLX tape
HOS TAPE: FORWARD_ONLY, < 60 days
SPLICE: FORBIDDEN
CYCLE-LAG vs BUY-HOLD ON HLX: descriptive 2.06x vs 0.69x, IS after 2022
OIL-UP STOCK-DOWN BUY RULE: FAIL
SAME-DAY ENERGY IC → 20D HLX: FAIL as alpha
INCREMENTAL vs OSB: not shown out of sample
TRADING GATE: LOCKED
FINAL: PARK
```

Falsify PARK only with a **HOS-only** tape, same frozen gates, after day 60, that beats OSB after costs. Do not retune −10pp / 20% / 2-day confirm on that tape.

Run:

```
python3 research/factors/097-helix-hos-cycle-lag/engine/buy_engine.py
```

Needs a local price panel with columns WTI, HLX, HOS, SLB, HAL, NOV, RIG, OII, XOM, CVX, COP, EOG, OXY, OIH, VIX.
