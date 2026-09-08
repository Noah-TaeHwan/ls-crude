# 091-Y — Cushing Pump Price Board

## First local observation

The official Maverik #5097 public station page provides a real Cushing retail
display. On the 2026-09-08 retrieval it showed credit prices of **$3.799/gal
Regular** and **$5.499/gal Diesel**.

![Cushing local pump-price snapshot](figures/091y-cushing-pump-price-observation.svg)

## Correlation verdict

**Leading relationship: not established.** Four public Wayback snapshots plus
the live display recovered five irregular local observations. Same-date
exploratory correlations with matched EIA WTI are high—Regular `r=+0.973,
p=.005`; Diesel `r=+0.952, p=.013`; `n=5`—but this is not a lead-lag test and
is far too small, irregular and archive-selected to validate an indicator.

![Irregular archival Maverik price observations paired with WTI](figures/091y-wayback-wti-exploratory-scatter.svg)

The exact paired observations and matching rule are retained in
[raw](raw/maverik-wayback-wti-paired-sample-20260908.csv). The 2026-09-08 live
display had to match 2026-09-01 WTI because no later EIA daily observation was
returned at collection time; this is another reason it cannot support a lead claim.

EIA's Cushing WTI `RWTC` series is long and daily, but that only solves one side
of the pair. Oklahoma or U.S. retail averages may be useful external context,
but are not substituted for Cushing local pump prices.

## Deep-research verdict on a leading-indicator claim

The premise fails twice: local retail price data has no historical panel here,
and the economic ordering normally runs from crude/wholesale prices to retail
prices. Cushing's documented Hudson refinery closed in 1982, so an operating
local-refinery mechanism was not verified. The evidence, exceptions and frozen
upgrade gates are in the [deep-research report](report-source.md).

## Forward-only contract

For 90 days, record at a fixed weekly time:

1. price, price type and visible freshness at Maverik #5097;
2. the same fields at at least two additional fixed Cushing stations **only if**
   their public pages expose a price and source timestamp;
3. EIA WTI `RWTC` value available at that observation time; and
4. a missingness reason—not an imputed zero—when a station does not publish.

After at least 12 paired weekly observations, test both contemporaneous and
one-week-lag changes. Report station-level results before any city composite.

## What this can become

This is a human-facing Cushing widget: what local drivers and truck operators
pay for gasoline and diesel near the WTI hub. It is **not** a CFAM activity
score, and the diesel–gasoline gap is not inferred to represent terminal
throughput without independent evidence.

Raw receipt: [raw](raw/README.md).

## Sources

- [Maverik #5097 official Cushing station page](https://locations.maverik.com/ok/cushing/2001-e-main-st)
- [EIA Cushing WTI daily series](https://www.eia.gov/dnav/pet/hist/leafhandler.ashx?f=a&n=pet&s=rwtc)
- [GasBuddy location-price search documentation](https://help.gasbuddy.com/hc/en-us/articles/27612659871767-Finding-Prices)
