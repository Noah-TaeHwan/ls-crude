# Deep research — Can a Cushing retail pump price lead WTI or another energy asset?

**Audience:** LS Crude research team

**Date:** 2026-09-08

**Scope:** The public fuel display at Maverik #5097, 2001 E Main St, Cushing,
Oklahoma; WTI Cushing and related energy-market interpretation.
**Decision:** Whether to promote the local pump-price board from a human-facing
widget to a leading indicator.

## Direct answer

**There is a real price relationship, but it runs from upstream markets to the
pump—not from this pump to WTI.** Archive recovery supplied five irregular
same-date Cushing retail observations. They have high contemporaneous
correlations with matched WTI, but cannot establish prediction or direction of
causality. A single Cushing retail station should not be used as a leading
indicator for WTI, crude oil, gasoline futures, diesel futures, or energy
equities.

The causal ordering is normally the reverse: crude and wholesale product markets
move first; retail prices then pass through those changes with a lag. The U.S.
Energy Information Administration (EIA) says roughly half of a crude-price
change generally reaches retail gasoline within two weeks and roughly 80% within
four weeks, subject to refining and local conditions. [EIA pass-through
analysis](https://www.eia.gov/todayinenergy/detail.php?id=6850)

The premise that a Cushing retail station sits beside a cluster of operating
refineries is not supported. The documented Hudson refinery in Cushing operated
until 1982 and is now a Superfund cleanup site; the city is principally a crude
storage, pipeline, and pricing hub. [EPA Hudson Refinery profile](https://cumulis.epa.gov/supercpad/SiteProfiles/index.cfm?fuseaction=second.cleanup&id=0601160)

## Evidence review

| question | best evidence | finding | implication |
| --- | --- | --- | --- |
| What does a pump price measure? | EIA lists crude, refining, distribution/marketing, and taxes as components. | A retailer price combines several markets and local business conditions. | It is not a clean crude-price observation. |
| Does retail normally lead crude? | EIA reports that retail prices typically adjust after spot/wholesale changes. | Standard pass-through points from upstream to downstream. | A leading-WTI claim has the wrong default direction. |
| Can local prices deviate? | EIA notes retail price variation across nearby stations from supply, traffic, rent, competition, and marketing strategy. | A single station can be idiosyncratic. | One Maverik site cannot represent Cushing. |
| Does Cushing have operating refinery proximity that reverses the ordering? | EPA documents Hudson as an abandoned former refinery, closed in 1982. | No verified operating Cushing refinery mechanism was found. | The proposed refinery-neighborhood explanation fails. |
| Can a pump price still be useful? | EIA notes disruptions to refinery operations or product pipelines can move retail prices even with stable crude. | It may reflect local product stress. | Useful descriptive monitor; possible *product* incident candidate only after validation. |

## Actual archive sample and current local observation

The official Maverik page displayed Regular credit at **$3.799/gal** and Diesel
credit at **$5.499/gal** when observed on 2026-09-08. The source did not expose
a historical local series or a visible observation timestamp. The raw receipt is
in [cushing-maverik-pump-price-snapshot-20260908.csv](raw/cushing-maverik-pump-price-snapshot-20260908.csv).

Wayback captures dated 2025-08-09, 2025-11-25, 2025-12-14 and 2026-04-15
recovered historical Regular and Diesel displays from the same official page.
Together with the live observation, `n=5` same-date/previous-business-day pairs
produce exploratory Pearson correlations of `+0.973` (Regular, two-sided
`p=.005`) and `+0.952` (Diesel, `p=.013`) with WTI. That is a **real,
descriptive co-movement finding**, not a forecast result. The paired sample and
chart are in the [091-Y README](README.md).

The address was previously Kum & Go #0842 (same `2001 E Main St` address and
`918-225-4407` phone number). Its 2023-02-27 first-party Wayback capture was
also recovered. It confirms the predecessor site identity, but its HTML has no
fuel-price field. A Common Crawl 2025-12 copy duplicates the 2025-12-14
Maverik observation rather than adding a date. Public archive coverage is
therefore exhausted at five usable price dates as of this research vintage.

This is still not predictive evidence: captures are irregular, selected by
archive availability, one WTI match is seven calendar days earlier because no
later EIA value was returned during collection, and no future-return target was
tested. The free EIA daily Cushing WTI series solves the crude leg, but it does
not transform archive captures into a designed local-retail panel. [EIA Cushing
WTI](https://www.eia.gov/dnav/pet/hist/leafhandler.ashx?f=a&n=pet&s=rwtc)

## Why “high Cushing gasoline/diesel” is not WTI alpha

1. **The station sells refined products, not Cushing-delivered crude.** Product
   price formation includes product supply, blending, taxes, trucking, terminal
   replenishment, inventory and retailer strategy.
2. **Retail is downstream and slower.** EIA's own pump-component methodology
   explicitly describes a lag between spot and retail price changes. [EIA pump
   methodology](https://www.eia.gov/petroleum/gasdiesel/pump_methodology.php)
3. **Cushing’s central physical role is storage/interconnection.** A retail
   shortage or diesel premium could occur without a change in Cushing crude
   storage utilization; conversely, terminal stress can occur while local pumps
   look ordinary.
4. **One station magnifies microstructure noise.** Even nearby outlets can have
   different supply sources, competitive strategies, traffic and costs. [EIA
   retail-price factors](https://www.eia.gov/energyexplained/gasoline/factors-affecting-gasoline-prices.php)

## The only defensible upgrade path

Keep 091-Y as a **Cushing Pump Price Board** and collect a fixed weekly panel.
Do not call it alpha until all gates pass:

1. At least 12 weekly observations at three or more fixed Cushing stations;
2. exact time, fuel grade, cash/credit condition, source freshness and
   missingness logged;
3. station-level and robust city-median series agree directionally;
4. tests separate `WTI → pump` from `pump → WTI` using pre-specified one- to
   four-week lags; and
5. a positive pump-leading result survives controls for gasoline/diesel wholesale
   prices, regional supply disruption, seasonality, and the WTI level.

Even then, the economically plausible target is not WTI direction. It is a
**local refined-product stress/dislocation monitor**—for example an unusually
wide Cushing diesel-minus-gasoline retail spread—requiring confirmation from a
public product-stock, product-price, or pipeline-disruption series.

## Recommendation

Keep the widget. Do **not** trade WTI from it and do **not** label it a leading
indicator. The sharp local diesel premium is an excellent meme/display feature:
“At the WTI delivery hub, the truck fuel hurts more than the crude.” It becomes
researchable only after a multi-station forward panel exists.

## Claim-to-source ledger

| claim | source | access / relevance |
| --- | --- | --- |
| Retail price components and local-station variation | [EIA, Factors affecting gasoline prices](https://www.eia.gov/energyexplained/gasoline/factors-affecting-gasoline-prices.php) | Current EIA explanatory page; primary U.S. energy authority |
| Retail price lag behind spot/wholesale movements | [EIA, Gasoline and Diesel Fuel Update methodology](https://www.eia.gov/petroleum/gasdiesel/pump_methodology.php) | Current methodology; primary source |
| Approximate two-/four-week retail pass-through | [EIA, Drop in U.S. gasoline prices](https://www.eia.gov/todayinenergy/detail.php?id=6850) | EIA analysis; general U.S. relationship, not Cushing-specific |
| Cushing former refinery closed in 1982 | [EPA, Hudson Refinery profile](https://cumulis.epa.gov/supercpad/SiteProfiles/index.cfm?fuseaction=second.cleanup&id=0601160) | Primary regulatory record |
| Current local price observation | [Maverik #5097 official page](https://locations.maverik.com/ok/cushing/2001-e-main-st) | First-party current display; lacks historical export/freshness metadata |

## Historical-recovery audit and next measurement

This was not stopped at a single live screen. The following public-history
paths were checked:

| route | result | contribution |
| --- | --- | --- |
| Maverik first-party page + Internet Archive | Four unique price-bearing captures, 2025-08 to 2026-04 | four dated Regular/Diesel observations |
| live Maverik first-party page | current display on 2026-09-08 | fifth observation |
| predecessor Kum & Go #0842 first-party page + Internet Archive | 2023 capture identifies the same address and telephone, but no prices | identity validation, no price point |
| Common Crawl | one 2025-12 duplicate of the archived Maverik HTML | no incremental observation |
| public discovery/listing pages | current/estimated values with no reproducible dated panel | excluded from the numerical test |

The resulting price relationship is useful in two narrow ways:

1. **A local pass-through board.** The Maverik display visibly translates
   upstream energy conditions into a Cushing household/trucker price. It is
   valid to say ``higher WTI and tighter product conditions coincide with higher
   local pump prices`` in this sample.
2. **A local-dislocation monitor.** With a fixed panel of multiple stations,
   the residual after upstream WTI/product moves—not the dollar price itself—is
   the testable object. A persistent Cushing diesel-minus-gasoline premium or
   Cushing-vs-Oklahoma median residual could flag local product/logistics stress.

It is **not** valid to call the raw board a WTI lead. The first pre-registered
forward test will observe at least 12 weekly, time-stamped values at three or
more fixed Cushing stations and test (a) local price changes after WTI changes,
and (b) whether the residual adds anything after WTI and wholesale-product
controls. No current result is promoted until then.
