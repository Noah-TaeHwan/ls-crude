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
| OHD catch-up vs OIH/SLB/HAL | RUN — [095-B](../../indexes/095-oil-helix-dislocation/20260909T095OHDBZ/README.md) |

## 095-B (20260909T095OHDBZ)

Frozen IS model through 2023-12-31. `|OHDZ|≥1.5` primary, `≥2.0` extreme. No other cuts.

At k=20, `|OHDZ|≥1.5` pooled:

HLX catch-up 91.5% (n=200) vs OIH 92.3% / SLB 90.7% / HAL 91.7%.  
WTI reversal 52% vs 45–47%. Coin flip.

Residual |OHD| shrinks because regression errors mean-revert. That is not Helix-specific.

## 095-C triangles (20260909T095TRIZ)

Independent T1 WTI–Brent–HLX and T2 WTI–HLX–OSB(ex-HLX). Sign states only. Isolated catch-up ~50–56%. WTI reversal ~50%. Brent almost never isolates WTI. No 4-way score. Trading not opened.

## Verdict

```
MEASUREMENT VALIDITY: PASS
CONTEMPORANEOUS RELATION: PASS
WTI → HLX LEAD: FAIL
HLX → WTI LEAD: FAIL
OHD DISLOCATION: OPENED
CATCH-UP VS REVERSAL: residual catch-up YES, WTI reversal NO, peer-equal
HELIX-SPECIFIC INFORMATION: NO
TRIANGLE 1 BRENT ID MISPRICED SIDE: NO
TRIANGLE 2 OSB ID MISPRICED SIDE: NO
TRADING VALUE: NOT OPENED
STRUCTURAL BREAK: HIGH
STATUS: PARK
```

What we learned: they move together. When they gap, the *gap* closes like every other oil-service residual. Neither WTI nor Helix is systematically “the wrong market.”

Falsify later only with HOS-only tape beating OIH/SLB/HAL on the same frozen rule. Do not retune 1.5 / 2.0.
