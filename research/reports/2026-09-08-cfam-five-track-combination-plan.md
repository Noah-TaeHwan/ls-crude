# CFAM 091 — five-track combination plan

## Decision first

The five candidates are not five interchangeable votes on one invisible number. They observe different things.

| track | direct observation | cadence / disclosure | role now |
| --- | --- | --- | --- |
| 091-S | relative live footfall UI state at six fixed quick-service venues | forward-only, three fixed CT snapshots daily | live city-presence candidate |
| 091-A | aggregate hotel/motel tax receipts | monthly and lagged | external-stay context candidate |
| 091-D | possible tank-roof shadow pattern in Sentinel-2 imagery | irregular satellite scenes | storage-state feasibility pilot |
| 091-F | separate sales-tax and use-tax receipts | monthly and lagged | local-consumption / inbound-procurement control |
| 091-O | airport Jet-A, AvGas, ramp stays and emergency-flight support | irregular municipal monthly reports | independently measured local physical-activity candidate |

The goal is not a forced *Cushing Busy Score*. It is to establish whether a small, time-aligned **City Presence Monitor** can be measured. A separate storage-state observation (091-D) may later sit beside it, but does not get averaged into it.

## The only combinations worth pursuing

### 1. S × O — live city footfall versus physical airport activity

**Why this is first:** S is the closest public live city-presence reading; O is the strongest already-obtained numeric physical activity record. They come from independent collection systems and neither is a price proxy.

**Pre-registered check:** turn the three S snapshots into a complete-month venue-hour anomaly only after its 90-day collection gate. Match it to a separately dated monthly O report. Before modelling, retain only months with at least 80% S completion and a stated O metric period. Examine Jet-A, AvGas, ramp stays and emergency-flight support **separately**. We need at least 24 contiguous matched months before an association estimate; until then this is measurement validation, not proof.

**Decision rule:** a positive relationship must survive fixed-hour and weekday normalisation, leave-one-month-out sensitivity, and a forward time-split. A single fuel series or a visually pleasing four-point chart does not pass. If S fails to explain any independent O series, S remains a live observation board only.

### 2. A residualised by F — external-stay intensity, not a tax sum

**Why this is second:** hotel/motel tax can contain external workers or visitors, while sales tax represents broader local retail activity. The useful question is whether lodging is unusually high *given* local retail, not whether two city receipts are both high.

**Frozen construction after collection:** for each comparable disclosed tax month, fit only on the past data:

`external_stay_residual = log(hotel_motel_tax) − E[log(hotel_motel_tax) | log(sales_tax), month-of-year]`

Use tax stays separate as an inbound-procurement context series; it is not added to sales tax and is not called foot traffic. The residual is a within-source control, not an independent confirmation.

**Gate:** at least 60 complete, definition-stable months of hotel, sales and use tax with tax month, receipt date and public availability date recovered. Then validate the residual first against an independent local aggregate (O or a fixed road-truck panel), with disclosure lag enforced. No EIA or WTI test precedes this measurement check.

### 3. D beside the monitor — never mixed into city-presence

091-D asks whether large Cushing tanks look more empty or full in free 10 m Sentinel-2 imagery. That is a storage feasibility question, not a count of people, traffic, work shifts or local spending.

**Gate:** two blinded human readers inspect a pre-fixed 20–30 large-tank sample across cloud-light scene pairs. If interior-shadow states cannot be repeatedly distinguished at 10 m, kill D. If they can, test aggregate storage-state classification independently against same-date public Cushing inventory timing. Even a pass is displayed next to the City Presence Monitor, not averaged with S/A/F/O.

## Rejected combinations

| proposed mix | why it is rejected now |
| --- | --- |
| S + A today | daily forward-only UI and lagged monthly tax have no shared completed panel |
| A + F simple sum | same municipal accounting environment and different economic meanings; it would double count rather than confirm |
| D + S/A/F/O score | tank fill state and city presence are distinct constructs |
| any mix + WTI/EIA | the question is first whether Cushing is observably busy; market data cannot become its ground truth |
| nightlight added as filler | 091-B failed its predeclared robust battery and is excluded |

## Actual collection result: public agenda archive discovery, 2022–2023

A read-only retrieval pass traversed the public calendar → agenda page → PDF attachment structure rather than assuming calendar links were PDFs. It retrieved **65 public PDFs**. Keyword discovery found two `Hotel/Motel Tax` hits, but **zero** `Sales/Use/Tobacco`, `Airport Monthly Report`, or `Jet-A` hits in this particular archive path. The two hits are budget documents, not new comparable monthly reports. Full URLs, byte sizes and SHA-256 hashes are in the [ALT-20260908-20 receipt](../gathering/raw/ALT-20260908-20/20260908T055418Z/README.md).

This is a useful null on that route: the calendar archive alone does not yet recover the required O/F history. The collector itself preserves the two-hop path and can be rerun for a bounded historic range without changing any raw observation.

## Current status

| rank | work item | status |
| ---: | --- | --- |
| 1 | S × O measurement-validation panel | **PREPARED / not yet testable** — S must accrue forward observations; O needs dated contiguous reports |
| 2 | A residualised by F | **PREPARED / not yet testable** — 60-month separate tax panel absent |
| 3 | D standalone visual feasibility | **PARK** — actual 10 m pixel review still absent |

No combination is claimed to be proven as of this report. That is the honest result of the available samples, not a reason to substitute WTI, imputed values, web-page counts, or an ML target for the missing operational truth.
