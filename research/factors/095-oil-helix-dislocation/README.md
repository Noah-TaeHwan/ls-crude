# 095 — Oil–Helix Dislocation (OHD)

**Status:** PARK / E1  
**Candidate:** ALT-20260909-02  
**Weight:** 0.0

Question: when WTI and Helix (then HOS) disagree, does one market contain information the other has not priced?

Do not splice HLX and HOS. Merger close **2026-09-01**. HLX last NYSE print that day. Combined company trades **HOS** from **2026-09-02**. Accounting acquirer is legacy Hornbeck (reverse acquisition). Hornbeck holders ~55%, Helix ~45%.

- REGIME A: HLX through 2026-09-01  
- REGIME B: HOS from 2026-09-02 — too short for any OOS as of 2026-09-09  

The historical HLX model may generate hypotheses for HOS. It does not validate HOS.

## This pass (20260909T095HLXZ)

Yahoo daily 2016-09-09 → 2026-09-01. Aligned n=2481 with CL=F, SPY, XLE.

| Test | Result |
| --- | --- |
| 1d contemporaneous Pearson | IS 0.174 (n=1836) / OOS 2024–2026-09-01 0.305 (n=644) |
| 20d contemporaneous Pearson | 0.498 |
| WTI_t → HLX_{t+k} for k=1,3,5,10,20,40,60 | all \|r\| ≤ 0.061 |
| HLX_t → WTI_{t+k} same k | all \|r\| ≤ 0.060 |
| HOS successor panel | pre-merger HOS ticker already existed; do not use 2025 HOS prints as Regime B |
| OHD / catch-up / Granger / placebo / costs | not run this pass |

Contemporaneous oil-service beta exists. A lead from either side does not, in this pre-registered 1-day lag set.

## Verdict so far

```
MEASUREMENT VALIDITY: PASS (prices)
WTI → HLX LEAD: NO
HLX → WTI LEAD: NO
DISLOCATION MEAN REVERSION: NOT TESTED
HELIX-SPECIFIC INFORMATION: NOT TESTED
INCREMENTAL OOS VALUE: FAIL for the lead-lag battery
TRADING VALUE: NOT TESTED
STRUCTURAL-BREAK RISK: HIGH
FINAL STATUS: PARK
```

What we learned: HLX moved with oil in the same window. It did not print tomorrow’s oil, and oil did not print tomorrow’s HLX, at 1–60 day 1-return lags.

What would falsify a later KEEP: Regime B HOS lead-lag matching Regime A, or an OHD catch-up that beats OIH/SLB/HAL after costs.

Monitor: HOS-only tape from 2026-09-02, backlog, vessel utilization, no spliced series.
