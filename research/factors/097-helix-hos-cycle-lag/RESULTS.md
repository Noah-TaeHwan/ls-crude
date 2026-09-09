# Results dump (updated 2026-09-09)

## Live snapshot

- Brent ~$99, WTI ~$94. Shock premium vs ~$72 Feb-2026 baseline (~+38% Brent).
- HLX last print 2026-09-01 **$10.60**. HOS 2026-09-08 close **$9.08**, cap ~$2.9bn.
- Engine: **WAIT**. G1 on (oil). G3 locked (HOS < 60 days). Do not splice.

## Oil-up / stock-down event study (the trader thesis)

Definition: trailing window WTI return high AND HLX minus WTI gap deeply negative. Non-overlapping. Forward HLX log-return. Sample HLX 2010-01-01 to 2026-04-21 (pre-deal).

**Windows into 2026-09-01 (description, not a signal)**

| window | HLX | WTI | OSB | HLX-WTI |
|---|---|---|---|---|
| 20d | +6.1% | +18.0% | +9.1% | -11.9pp |
| 60d | +9.7% | +2.8% | +7.2% | +6.9pp |
| 126d | +10.2% | +34.3% | +13.7% | -24.1pp |
| 252d | +44.2% | +49.5% | +58.9% | -5.4pp |

6-month gap matches the narrative. 3-month gap does not. Post-09-02 HOS drop is ticker/float, not a tested HLX event.

**Loose rule: 60d WTI >= +10% AND gap <= -15pp**

| sample | n | hit 60d | avg 60d | hit 20d | avg 20d | vs OSB 60d |
|---|---|---|---|---|---|---|
| 2010-19 | 13 | 62% | -0.7% | 62% | +2.2% | +0.2% |
| 2020-26 | 11 | 55% | -0.9% | 73% | +5.7% | +0.4% |
| full | 24 | 58% | -0.8% | 67% | +3.8% | +0.3% |

Unconditional 60d HLX hit rate ~54%. Loose rule is a coin.

**Tight 2022-like rule: 60d WTI >= +20% AND gap <= -20pp — 8 events**

| date | WTI 60d | HLX 60d | gap | HLX +20d | HLX +60d | vs OSB 60d |
|---|---|---|---|---|---|---|
| 2015-04-16 | +24% | -9% | -33pp | +1.6% | **-28%** | -10% |
| 2015-06-15 | +32% | +12% | -21pp | -17% | **-87%** | -68% |
| 2017-02-10 | +23% | -24% | -47pp | -1% | **-27%** | -12% |
| 2020-07-16 | +159% | +83% | -75pp | +18% | -26% | +8% |
| 2021-10-28 | +20% | -2% | -22pp | -19% | -7% | -14% |
| 2022-03-01 | +46% | +23% | -22pp | +20% | +13% | +3% |
| 2022-05-13 | +22% | -4% | -26pp | +1% | 0% | +12% |
| 2026-03-06 | +46% | +21% | -25pp | +7% | +6% | -5% |

Hit 60d **25%**. Average 60d **-19.5%**. This is the opposite of a buy rule.

**Short trader window: 20d WTI >= +8% AND gap <= -10pp** — n=39, next-20d hit 54%, avg +3.1%, vs OSB +0.5%.

Quant conclusion: the 6-month gap is a **description**. It is not a **forecast**. Deploy only if G2 (services/peers) and HOS ops (utilization/dayrates) confirm, which they do not as of 2026-09-09.

## Market + ops + fundamentals (one page)

- Combined fleet ~85 vessels. LTM active utilization: OSV-side 77% / ~$49k, MPSV 68% / ~$107k, well-intervention 88% / ~$342k.
- Backlog $2.0bn. PF LTM adj. EBITDA $551mm. Net debt / EBITDA 0.4x.
- US offshore Baker Hughes ~8 rigs. Brazil is the volume growth basin (Helix SH1/SH2 Petrobras; HOS OSVs already in Brazil/Suriname/Colombia).
- GoM is a high-spec, low-count basin. Oil at $99 does not automatically lift stacked OSVs or 68% MPSVs.

## Earlier kills (unchanged)

- HLX/WTI 60d beta z-pairs on real data: 2021-22 **-66%** cumulative. ADF p=0.11.
- Crack z does not transmit to HLX.
- HECM six-factor residual does not beat OSB out of sample.
- Tight cycle-lag engine (2-day confirm, episodes >=5d): 21 trades, 71% hit, avg +3.9%, account +106% vs BH -31%, **in-sample after 2022**.
