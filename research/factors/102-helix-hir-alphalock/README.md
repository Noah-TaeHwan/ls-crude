# 102 — Helix HIR Alpha-Lock (v19 real tape)

**VERDICT: NOT_PROVEN**

Handoff: HELIX v19 ALPHA-LOCK. Real Yahoo daily tape, aligned n=3640, 2012-01-03 → 2026-09-01. No HLX–HOS splice. Proof holdout ends **2026-04-21**. M&A window 2026-04-22–2026-09-01 reported separately (1 event, unused).

## Frozen rule (before holdout)

- Causal rolling Ridge, λ=1, 252d, 10 factors: WTI, Brent, RBOB, ULSD, XLE, SLB, HAL, BKR, UPB, OSB (no HLX).
- HIR_t = r_HLX,t − X_t β_{t−252:t−1}
- Z from prior residuals only (252).
- Event: Z ≤ −1.50. Enter next session. Hold 20 sessions. Non-overlapping.
- Primary P&L: HLX 20d − OSB 20d − 40 bp RT.
- Stress: 100 bp RT.
- Development: entry 2012-01-03–2021-12-31, exit purged at 2021-12-31.
- Holdout: entry 2022-01-03–2026-04-21, exit purged at 2026-04-21.

## Results

| book | n | mean net | win | Sharpe | boot 95% lo | sign-flip p | t |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| DEV | 55 | **−0.60%** | 53% | −0.13 | −4.89% | 0.60 | −0.28 |
| HOLD | 29 | **−0.25%** | 45% | −0.09 | −3.48% | 0.57 | −0.14 |

HOLD 100 bp mean: **−0.85%**.  
Neighbors on DEV (θ ∈ {−1.2,−1.5,−1.8} × h ∈ {15,20,25}): **0 / 9** positive.  
Holdout subperiods: +0.52, +0.23, +3.88, **−1.99**. Fourth fails.  
Placebo on same HOLD windows: SLB−OSB −0.46%, HAL−OSB −1.50%. No Helix-specific lift.  
M&A: one event 2026-05-28, not used for proof.

## Gates

| # | gate | result |
| --- | --- | --- |
| 1 | enough events | HOLD n=29 weak |
| 2 | mean net > 0 | FAIL |
| 3 | bootstrap lo > 0 | FAIL |
| 4 | sign-flip p < 0.05 | FAIL |
| 5 | timing-rand p < 0.05 | FAIL (obs not above random) |
| 6 | Sharpe > 0.50 | FAIL |
| 7 | HAC/t > 2 | FAIL |
| 8 | 100 bp still + | FAIL |
| 9 | ≥70% neighbors + | FAIL 0/9 |
| 10 | four HOLD slices all + | FAIL |
| 11 | no same-day fill | PASS |
| 12 | no M&A / no splice | PASS |
| 13 | placebo weaker than HLX | FAIL uniqueness |
| 14 | freeze before HOLD | PASS |

Do not loosen 2–10 because the book is weak. Do not retune θ or h on HOLD.

```
ALPHA_PROVEN
NOT_PROVEN
```

Related: 095 PARK, 097 KILL engine. This card is the residual-catch-up version of the same stock. It also dies.

## v22 two-turn engine
See [v22/README.md](v22/README.md). Real DEV did not ADVANCE. HOLD unopened. Still NOT_PROVEN.

## v23 capped episode
See [v23/README.md](v23/README.md). DEV n=37, neighbors 6/9. HOLD sealed.
