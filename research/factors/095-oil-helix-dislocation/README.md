# 095 — Oil–Helix Dislocation (OHD)

| | |
| --- | --- |
| Status | **PARK** / E1 / weight 0.0 |
| Candidate | [ALT-20260909-02](../../candidates/ALT-20260909-02.md) |
| Regime A | HLX through **2026-09-01** |
| Regime B | new HOS from **2026-09-02** — forward only, not yet a panel |
| Trading | **not opened** |

Question that survived after the failed lead-lag:

> When WTI and offshore-service equity disagree, which market is wrong?

Answer so far: **neither, systematically.** They move together the same day. The gap that closes is a generic oil-service residual, not a Helix-vs-crude truth signal. Brent and an ex-HLX service basket do not name the mispriced side.

## Structural break — do not splice

| Date | Event |
| --- | --- |
| 2026-04-22 | Helix–Hornbeck merger agreement |
| 2026-08-31 | Helix shareholder approval |
| 2026-09-01 | Close. Last HLX print. Minnesota→Delaware conversion. Reverse acquisition: **Hornbeck is the accounting acquirer**. ~55% Hornbeck / ~45% Helix |
| 2026-09-02 | Combined company trades **HOS** |

Pre-2026-09-02 prints on an older HOS ticker are **not** Regime B. Historical HLX betas are hypotheses only for HOS.

## Frozen rules

- Yahoo daily aligned calendar dates. Last Regime A day 2026-09-01.
- IS ≤ 2023-12-31. 2024-01-01 → 2026-09-01 is OOS for the tests already run.
- Lead-lag k ∈ {1,3,5,10,20,40,60}. Do not add k to chase significance.
- OHD z: trailing `[t-252, t-1]` only. Primary `|z|≥1.5`, extreme `|z|≥2.0`. No other cuts.
- OSB = equal-weight SLB, HAL, BKR, FTI, RIG, OII, TDW. NE out (listed 2021-06-09, 52% coverage). HLX/HOS never in OSB.
- No zeros for missing. No HOS+HLX splice. No ML rescue. No trading until a later battery beats placebos **and** costs.

## Batteries

### A — contemporaneous + lead-lag  
[20260909T095HLXZ](../../indexes/095-oil-helix-dislocation/20260909T095HLXZ/README.md)

| | IS | OOS |
| --- | ---: | ---: |
| 1-day corr(WTI, HLX) | 0.174 (n=1836) | 0.305 (n=644) |
| 20-day corr | 0.498 (full A) | — |
| WTI_t → HLX_{t+k} | all \|r\| ≤ 0.061 | not re-opened |
| HLX_t → WTI_{t+k} | all \|r\| ≤ 0.060 | not re-opened |

Lead-lag **FAIL**. Do not retest that family.

### B — residual catch-up vs peers  
[20260909T095OHDBZ](../../indexes/095-oil-helix-dislocation/20260909T095OHDBZ/README.md)

IS-frozen: `HLX = 0.0011 + 0.0036 WTI + 1.199 OIH − 0.0388 SPY + ε`.  
WTI coefficient is near zero. OHD is almost **HLX vs OIH**.

k=20, `|OHDZ|≥1.5` pooled:

| name | n | \|OHD\| shrinks | WTI reverses |
| --- | ---: | ---: | ---: |
| HLX | 200 | 91.5% | 52.0% |
| OIH | 310 | 92.3% | 45.2% |
| SLB | 269 | 90.7% | 45.4% |
| HAL | 254 | 91.7% | 46.5% |

Helix-specific information **NO**. Paper fade of HLX vs WTI: 66 non-overlap trades, +1.17%/trade before variance, max DD −76%, compound negative. Trading stayed closed.

### C — two triangles, independent  
[20260909T095TRIZ](../../indexes/095-oil-helix-dislocation/20260909T095TRIZ/README.md)

Same-day sign states. Isolated catch-up = isolated +20d sign equals majority sign on day t.

T1 WTI–Brent–HLX, k=20

| State | n | WTI +20d | HLX +20d | Catch-up | WTI rev |
| --- | ---: | ---: | ---: | ---: | ---: |
| all agree | 1451 | +1.16% | +2.53% | — | 48.9% |
| HLX isolated | 742 | +0.93% | +1.79% | 51.8% | 50.7% |
| WTI isolated | 95 | +1.59% | +1.50% | 52.6% | 52.6% |
| Brent isolated | 103 | +2.44% | +4.09% | 52.4% | 46.6% |

T2 WTI–HLX–OSB, k=20

| State | n | WTI +20d | HLX +20d | Catch-up | WTI rev |
| --- | ---: | ---: | ---: | ---: | ---: |
| all agree | 1364 | +1.18% | +2.83% | — | 48.7% |
| HLX isolated | 294 | +1.38% | +1.70% | 51.7% | 50.0% |
| WTI isolated | 550 | +0.97% | +1.89% | 51.5% | 51.5% |
| OSB isolated | 194 | +1.80% | +1.13% | 45.9% | 49.5% |

Brent almost never isolates WTI. OOS catch-up 56% is coin-flip. Both triangles **FAIL**.

## Verdict

```
MEASUREMENT VALIDITY:              PASS
CONTEMPORANEOUS RELATION:          PASS
WTI → HLX LEAD:                    FAIL
HLX → WTI LEAD:                    FAIL
OHD GAP CLOSES:                    YES, peer-equal
WTI REVERSAL AFTER DISLOCATION:    FAIL
BRENT NAMES THE WRONG SIDE:        NO
OSB NAMES THE WRONG SIDE:          NO
HELIX-SPECIFIC INFORMATION:        NO
INCREMENTAL OOS VALUE:             FAIL
PLACEBO (OIH/SLB/HAL):             not beaten
TRADING VALUE:                     NOT OPENED
STRUCTURAL-BREAK RISK:             HIGH
HOS:                               FORWARD_ONLY
FINAL:                             PARK
```

Learned: same-day oil-service beta is real. Predictive “who is lying” is not.

Falsify PARK only with a **HOS-only** tape, same frozen 1.5/2.0 and same OSB rule, that beats SLB/HAL/OIH after costs. Do not invent 1.3. Do not splice. Do not open a 4-way score or an ML model on these fails.

Inventory note: a separate PARK card also used the number 095 (Energy Executive Public Visibility). That is not this factor. Do not merge the folders.
