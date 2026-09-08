# 091-X2 — WTI M1–M2 Calendar Spread Index (WMCSI)

**Status: PARK / E1.** The M1–M2 WTI spread is a valid market-context measure
of prompt delivery economics at Cushing, but a free, verified **historically
rolled daily M1 and M2 settlement panel** has not been established here.

## Definition

`calendar_spread = M1 − M2`.

A higher positive spread is relative backwardation / prompt tightness; a lower
or negative spread is relative contango / storage pressure. `prompt_stress_score`
is the larger of the contemporaneous 14- and 30-trading-day spread z-scores,
only after both windows exist. It is a market-price context, not a direct
measure of physical Cushing activity.

## Data boundary

The collector writes only inside this factor directory. A valid panel must have
`date,m1_price,m2_price`, with M1 and M2 defined by a frozen daily roll rule and
an availability timestamp. `CL=F` alone is not valid M2 data. An explicitly
provided Yahoo contract pair can be inspected, but it is not automatically a
historically rolling M1/M2 chain and must not be promoted as one.

```powershell
python wmcsi.py
python wmcsi.py --input verified_rolling_m1_m2.csv
python wmcsi.py --yahoo-symbols CLV26.NYM CLX26.NYM
```

No input produces a header-only output and a PARK receipt; it never invents a
second contract from a continuous front-month series.

## Reopening condition

Obtain an authorized daily settlement archive or reproducible public contract
chain, freeze the roll/availability rule, and retain at least 30 sessions before
scoring. Before combining it with CFAM, test whether it provides information not
already contained in Cushing inventory and the WTI price itself.
