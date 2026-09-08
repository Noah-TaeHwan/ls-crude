# Deep research — Can a Cushing retail pump price lead WTI or another energy asset?

**Audience:** LS Crude research team

**Date:** 2026-09-08

**Scope:** The public fuel display at Maverik #5097, 2001 E Main St, Cushing,
Oklahoma; WTI Cushing and related energy-market interpretation.
**Decision:** Whether to promote the local pump-price board from a human-facing
widget to a leading indicator.

## Direct answer

**No—not on the evidence and data currently available.** A single Cushing retail
station price should not be used as a leading indicator for WTI, crude oil,
gasoline futures, diesel futures, or energy equities.

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

## The current local observation

The official Maverik page displayed Regular credit at **$3.799/gal** and Diesel
credit at **$5.499/gal** when observed on 2026-09-08. The source did not expose
a historical local series or a visible observation timestamp. The raw receipt is
in [cushing-maverik-pump-price-snapshot-20260908.csv](raw/cushing-maverik-pump-price-snapshot-20260908.csv).

This is `n = 1`; it cannot produce a correlation, lead-lag coefficient, or
trading conclusion. The free EIA daily Cushing WTI series solves only the crude
leg, not the local-retail history. [EIA Cushing WTI](https://www.eia.gov/dnav/pet/hist/leafhandler.ashx?f=a&n=pet&s=rwtc)

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

## Research stop rule

The decisive mechanism and the local historical-data gap are both established.
Further broad searching would not justify a lead-lag test without creating a
local panel. Research stops here pending forward observations or a legitimate
historical station-price source.
