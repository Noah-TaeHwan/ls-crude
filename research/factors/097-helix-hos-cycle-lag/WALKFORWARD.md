# 20260910T097WFZ — HLX engine walk-forward

Universe: HLX 2012-01-03 → 2026-09-01. HOS out. No splice.
Cost: 10bp one-way when size changes.
Gates frozen as 097: G1 2-of-3, G2 OSB/OIH, G3 lag60 ≤ −10pp, 2-day confirm, next session.
Drop-pack knobs (TP +15% / SL −15% / 5d +0.5 pyramid) tested separately. Not used to retune gates.

Prices: Yahoo daily aligned n=3660. WTI = CL=F.

## Frozen gates, no TP/pyramid

| window | Engine | HLX B&H | OSB |
| --- | ---: | ---: | ---: |
| 2012–2019 | 0.76× | 0.58× | 0.39× |
| 2020–2026-09-01 | **0.45×** | **1.10×** | **1.40×** |
| full | 0.34× | 0.64× | 0.54× |

## Same gates + drop-pack TP/SL/pyramid

| window | Engine | HLX B&H | OSB |
| --- | ---: | ---: | ---: |
| 2012–2019 | 0.74× | 0.58× | 0.39× |
| 2020–2026-09-01 | **0.72×** | **1.10×** | **1.40×** |
| full | 0.53× | 0.64× | 0.54× |
| full minus 2021–22 (cash those years) | 0.51× | 0.64× | 0.54× |

G1+G2 with G3 removed reprints the raw-gate book. Lag gate adds nothing.

The source drop-pack 4.19× vs B&H 0.69× is the same 21-trade path after TP/SL/pyramid were added with 2022 already seen. It is not this walk-forward.

## Verdict

```
ALPHA CANDIDATE: NO
OOS vs B&H: FAIL
OOS vs OSB: FAIL
G3 INCREMENT: FAIL
DROP-PACK KNOPS: not pre-registered
LIVE ENGINE: KILL
HISTORY BOOK: PARK (descriptive only)
```
