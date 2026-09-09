# 091-CFSP — Consumer Fuel Stress Proxy (national)

**Parent:** [091 CFAM](../../README.md)  
**State:** CONTEXT ONLY / PARK as a Cushing activity input  
**Evidence:** [20260909T091CFSPZ](../../../indexes/091-cushing-operations-nowcasting/20260909T091CFSPZ/README.md)

Submitted FastAPI + React “CFSP dashboard” is parked here as a **national
consumer** construct. It is not terminal throughput, not QSR footfall, and not
a CFAM score.

```text
FWH  = (50 × gasoline USD/liter) / CES0500000003 hourly wage
CFSP = 0.7 × z(FWH) + 0.3 × [−z(UMCSENT)]
```

Geography is the United States. Oklahoma / Cushing pump prices are 091-Y, a
different series.

## Charts (2026-09-09 pull)

Gasoline weekly, Fuel Work Hours, UMCSENT:

![CFSP components](../../../indexes/091-cushing-operations-nowcasting/20260909T091CFSPZ/figures/cfsp_components.png)

Experimental composite (display only, not a CFAM input):

![CFSP score display](../../../indexes/091-cushing-operations-nowcasting/20260909T091CFSPZ/figures/cfsp_score_display.png)

## Gate result (2026-09-09)

| Source | Path that ran | Result |
| --- | --- | --- |
| EIA regular gasoline weekly | hist XLS `EMM_EPMR_PTE_NUS_DPGw.xls` | PASS — 1,875 weeks, last 2026-08-31 = **$4.071/gal** |
| EIA v2 `PET.EMM_EPMR_PTE_NUS_DPG.W` | submitted backend | **not run** — no `EIA_API_KEY` |
| BLS `CES0500000003` | public API POST, no key | PASS — 2017-01–2026-08, last **$37.75/hr** |
| FRED `UMCSENT` API | submitted backend | **not run** — no `FRED_API_KEY` |
| FRED `UMCSENT` | public `fredgraph.csv` | PASS — last **2026-07 = 55.2** |
| Docker / localhost:3000 dashboard | submitted compose | **not run** — keys missing; new app is outside 091 scope |

Aligned month with gas + wage + sentiment: **2026-07**  
FWH = 1.380 h per 50 L · z(FWH)=+0.56 · sentiment-stress z=+1.28 · **CFSP=+0.77**  
(z-scores use the 2017-01–2026-07 overlap the BLS public window actually
returned, not a 2015–2023 frozen IS split. Not a WTI test.)

2026-08 has gasoline and wages but no UMCSENT yet, so the composite is not
defined for that month.

## Decision

Keep the three official series as a **national affordability context board**.
Do not feed CFSP into CFAM, do not test WTI from this pull, do not treat
50 litres or the 0.7/0.3 weights as validated economics. Re-open as a
Cushing input only if a *Cushing-area* wage and pump panel exists and is
tested against an independent local activity series first.
