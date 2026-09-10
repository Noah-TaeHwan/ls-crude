# Gas Stage 1 — EIA L48 stocks vs next Henry Hub session

**VERDICT: NOT_PROVEN** (this stage only)

Print: EIA Weekly Natural Gas Storage, Thursday 10:30 ET, week ending prior Friday.
Price: NG=F close. Return = Thursday close → Friday close (session after the print).
History: 870 weeks, 2010-01-01 to 2026-08-28. n usable 869.
DEV report dates through 2021-12-31 (625). HOLD 2022+ (244).

Textbook: injection (+) cheapens gas, so corr(Δstocks, r1) should be negative.

| book | corr(Δ, r1) | corr(Δ, r5) | n |
| --- | ---: | ---: | ---: |
| DEV | **−0.030** | +0.101 | 625 |
| HOLD | **+0.028** | +0.152 | 244 |

Seasonal surprise = Δstocks − week-of-year mean, mean frozen on DEV.

| book | corr(surprise, r1) |
| --- | ---: |
| DEV | +0.047 |
| HOLD | −0.013 |

Rule tested (not promoted): |surprise| ≥ 20 Bcf, short gas on fat injection, long on fat draw, 1 session, 10 bp.

| book | n | mean | win | ann. Sharpe-ish | boot 95% lo |
| --- | ---: | ---: | ---: | ---: | ---: |
| DEV | 301 | −0.29% | 43% | −0.77 | −0.60% |
| HOLD | 134 | +0.19% | 54% | +0.28 | **−0.69%** |

|surprise|≥30 same story. HOLD plus is inside a negative bootstrap bound.

Files: [csv](20260910T200S1Z/eia_l48_vs_hh.csv) · [figure](20260910T200S1Z/eia_l48_vs_hh.png)

Stage 2 (survey surprise) still closed — no free consensus archive this pass.
Do not import oil 038/101 conclusions. Do not trade raw Δstocks.
