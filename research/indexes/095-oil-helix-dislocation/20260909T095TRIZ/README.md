# 20260909T095TRIZ — two independent triangles

Frozen before rates:

- Same-calendar-day Yahoo closes. No session-shift in this pass.
- Sign of 1-day return only. Zero days dropped. No extra thresholds.
- T1: WTI=`CL=F`, Brent=`BZ=F`, HLX through 2026-09-01.
- T2 OSB equal-weight of SLB HAL BKR FTI RIG OII TDW. NE dropped (52% coverage, listed 2021-06-09). HLX not in OSB.
- Isolated catch-up: isolated asset’s +k return has the same sign as the two-asset majority on day t.
- WTI reversal: +k WTI sign opposite day-t WTI.
- k frozen 5 and 20. IS ≤ 2023-12-31.

T1 k=20

| State | N | WTI +20D | HLX +20D | Catch-up | WTI rev |
| --- | ---: | ---: | ---: | ---: | ---: |
| all agree | 1451 | +1.16% | +2.53% | n/a | 48.9% |
| HLX isolated | 742 | +0.93% | +1.79% | 51.8% | 50.7% |
| WTI isolated | 95 | +1.59% | +1.50% | 52.6% | 52.6% |
| Brent isolated | 103 | +2.44% | +4.09% | 52.4% | 46.6% |

T2 k=20

| State | N | WTI +20D | HLX +20D | Catch-up | WTI rev |
| --- | ---: | ---: | ---: | ---: | ---: |
| all agree | 1364 | +1.18% | +2.83% | n/a | 48.7% |
| HLX isolated | 294 | +1.38% | +1.70% | 51.7% | 50.0% |
| WTI isolated | 550 | +0.97% | +1.89% | 51.5% | 51.5% |
| OSB isolated | 194 | +1.80% | +1.13% | 45.9% | 49.5% |

OOS HLX-isolated catch-up T1 55.9% / T2 56.6% — coin-flip noise, not a frozen edge. WTI-isolated T1 OOS n=18: no power.

Brent rarely isolates WTI (n=95 in 10y) because WTI and Brent same-sign most days.
