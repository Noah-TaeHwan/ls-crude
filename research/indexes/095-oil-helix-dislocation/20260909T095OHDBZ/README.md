# 20260909T095OHDBZ — OHD catch-up battery

Frozen before looking at event rates:

- IS fit ≤ 2023-12-31, n=1836 daily returns
- `HLX = α + β1 WTI + β2 OIH + β3 SPY + ε`
- Frozen HLX betas: α=0.00111, β_WTI=0.0036, β_OIH=1.199, β_SPY=-0.0388
- `OHD=ε`, `OHDZ` uses mean/sd of `[t-252, t-1]` only
- Primary `|OHDZ|≥1.5`, extreme `|OHDZ|≥2.0`. No other cuts.
- Catch-up: `|OHD_{t+k}| < |OHD_t|`
- WTI reversal: sign of next-k WTI return opposite sign of prior-5d WTI
- Placebo: OIH ~ WTI+XLE+SPY; SLB/HAL ~ WTI+OIH+SPY

k=20 primary table (all four |z| buckets):

| name | n | catch-up | WTI reversal |
| --- | ---: | ---: | ---: |
| HLX | 200 | 91.5% | 52.0% |
| OIH | 310 | 92.3% | 45.2% |
| SLB | 269 | 90.7% | 45.4% |
| HAL | 254 | 91.7% | 46.5% |

HLX is not above the oil-service placebos. Residual mean reversion is the regression error coming home, not Helix-specific information. WTI reversal is a coin flip.

Helix-specific information: **NO** on this battery.
