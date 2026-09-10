# 103 — Helix peer pair book


> Helix confirms oil-service comovement. On the same tape, residual pairs and the cycle-lag engine did not clear frozen out-of-sample and cost gates. That is supporting material for models that assume comovement, and a counter-example for models that turn comovement into alpha.
>
> 헬릭스 테이프는 석유서비스 동행을 확인한다. 같은 테이프에서 잔차 페어와 사이클 래그 엔진은 고정 표본 밖·비용 후 전진 규칙을 통과하지 못했다. 동행을 가정하는 모형에는 보조 자료가 되고, 동행을 알파로 바꾸는 모형에는 반례에 가깝다.

**VERDICT: NOT_PROVEN**

Question: if Helix and its closest listed peers are substitutes, does a rolling-beta long-cheap / short-rich book earn peer-neutral catch-up?

This is 102 HIR unfolded onto two names. Same freeze as 102.

## Rule (frozen)

- Hedge: 252d OLS `r_A ~ β r_B` using days before t
- Z of the day's residual vs prior 252 residuals only
- |Z| ≥ 1.5 → long cheap, short rich
- Enter next session, hold 20 sessions, non-overlap
- Cost 40 bp round-trip for the pair
- DEV entries through 2021-12-31, exits purged
- HOLD entries 2022-01-03 through 2026-04-21, exits purged
- HLX tape ends 2026-09-01. No HOS. No pre-merger HOS.

## 20d contemporaneous correlation (context, not a trade)

| pair | IS | HOLD to 2026-04-21 |
| --- | ---: | ---: |
| HLX–OII | 0.88 | 0.70 |
| HLX–FTI | 0.85 | 0.75 |
| HLX–SLB | 0.87 | 0.78 |
| HLX–XPRO | 0.45 | 0.61 |
| HLX–TDW | 0.67 | 0.62 |

Lead-lag |r| on the same 20d grid is ≤ 0.26 and unstable. Nobody leads.

## Pair book

| pair | DEV n | DEV mean | HOLD n | HOLD mean | HOLD Sharpe | HOLD boot 95% lo |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| HLX–OII | 43 | **−3.23%** | 35 | +1.08% | 0.39 | **−1.97%** |
| HLX–FTI | 51 | −2.18% | 33 | −0.59% | −0.23 | −3.68% |
| HLX–SLB | 45 | −4.03% | 36 | +0.20% | 0.08 | −2.85% |
| HLX–XPRO | 42 | −3.03% | 34 | −1.73% | −0.50 | −5.93% |
| HLX–TDW | 51 | +0.49% | 34 | +1.18% | 0.34 | −3.06% |
| OII–FTI | 52 | +1.63% | 32 | **−4.32%** | −1.42 | −7.86% |
| OII–SLB | 47 | −0.54% | 31 | −0.19% | −0.07 | −3.90% |
| FTI–SLB | 49 | +1.45% | 33 | −0.56% | −0.25 | −3.30% |

HLX–OII HOLD by year: 2022 −0.12%, 2023 −0.39%, 2024 +2.08%, 2025–Apr-21 +1.84%.
The plus lives in 2024–25, same slice that flattered 102.

## Why the spread is not a pair

DEV HLX–OII daily residual AR(1) = 0.016. Half-life ≈ 0.2 days.

The residual is almost white noise. A 20-day hold is not harvesting a mean-reverting level. It is sitting on a one-day idiosyncratic tick.

OII is the closest listed twin (ROV / subsea). That shows up as **correlation**, not as a tradable error.

## Gates (same bar as 102)

Mean net > 0 on both books: FAIL  
HOLD bootstrap lo > 0: FAIL  
HOLD Sharpe > 0.50: FAIL  
Four HOLD years all +: FAIL  
DEV neighbors not run as a selector; the primary pair already dies on DEV.

```
NOT_PROVEN
```

Do not promote HOLD HLX–OII +1.08%. Do not retune |Z| or 20d after seeing 2024.

## Use

This line is a **filter**, not a signal.

- Use: if the well-intervention name is already on, hedge with OII (104). Do not splice HOS. Do not drop HLX into a USO–XLE or OFS-equity-alpha notebook as its own residual (105).
- Do not use: fade a gap with oil, predict WTI, or turn the 2.06× in-sample NAV back on.

A filter does not pay. It stops one more bad book from opening.
