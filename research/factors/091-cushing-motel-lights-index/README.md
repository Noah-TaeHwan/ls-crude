# 091 — Cushing Field Activity Monitor (CFAM)

> “When the field stays active, the tanks may still be asleep.”

**Status:** HOLD — public data does not yet measure “Cushing is busy” well enough
to create a score or a trading signal.
**Weight:** 0.0

CFAM is a public-data nowcasting project for Cushing’s *operational activity*:
terminal work, logistics, outside crews and local service intensity. It is not a
WTI price factor, a proxy for EIA inventory, or a claim that motel lights measure
tank activity.

The earlier meme name, *Cushing Motel Lights Index*, is retained only as project
history. **Cushing Field Activity Monitor** is the current name.

## Read this first

- [Workflow, all sub-tracks, sources and visuals](workflow.md)
- [Current Cushing pump-price board](../../indexes/091-cushing-operations-nowcasting/20260908T091YZ/README.md)
- [Five-track combination plan](../../reports/2026-09-08-cfam-five-track-combination-plan.md)
- [Completed validation battery](../../indexes/091-cushing-operations-nowcasting/20260908T091VZ/README.md)

## What we can use now

| Track | What it observes | Status | Proper use |
| --- | --- | --- | --- |
| **EIA Cushing inventory** | Actual weekly storage level | LIVE | Physical market context and research target; not an activity score input |
| [091-Y Pump Price Board](../../indexes/091-cushing-operations-nowcasting/20260908T091YZ/README.md) | Local retail gasoline and diesel prices | FORWARD ONLY | Local product-stress display; add fixed stations before testing |
| [091-S Quick-service activity](../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/091s-live-monitor-protocol.md) | Google Maps live busy labels at six fixed locations | FORWARD ONLY | 90-day manual activity-observation pilot |
| [091-U Industrial Job Pulse](../../indexes/091-cushing-operations-nowcasting/20260908T091UZ/README.md) | Direct terminal, pipeline and industrial job postings | FORWARD ONLY | 90-day frozen-rule hiring panel |
| [091-O Airport activity](../../indexes/091-cushing-operations-nowcasting/20260908T091OZ/README.md) | Jet-A, AvGas and ramp activity | PARK | Promising direct activity context; longer monthly history required |

### Live inventory source

[OilPriceAPI Cushing Storage](https://www.oilpriceapi.com/data/cushing-storage)
is a convenient live presentation of **EIA’s** weekly Cushing inventory. It is
useful for the dashboard, but not a second independent signal: do not double
count it with EIA data. Long-run tests use the official [EIA Cushing ending
stocks series](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=W_EPC0_SAX_YCUOK_MBBL).

## What has already failed

| Test | Result | Decision |
| --- | --- | --- |
| City-scale nightlight anomaly → following 28-day Cushing inventory movement | `r=+0.053`, `p=.607`, `n=96` | Do not use nightlights as a CFAM score |
| Hotel/motel-tax level → following-month WTI realized volatility | `r=+0.235`, `p=.440`, `n=13` | Not validated; preserve only as a data-collection lead |
| 052W / 086 / 090 external-context bridge | No pre-specified relation passed | Context only, not CFAM inputs |

The detailed robustness tests, charts and raw-data receipts remain in the
[validation battery](../../indexes/091-cushing-operations-nowcasting/20260908T091VZ/README.md)
and [workflow](workflow.md). They are intentionally not repeated on this card.

## Next gates

CFAM can move beyond HOLD only when each candidate is independently observable
and time-stamped.

1. Obtain **60+ months** of official hotel-tax and split sales/use-tax records.
2. Obtain a **fixed Cushing-adjacent road segment** with a long, consistently
defined truck-count history.
3. Complete the 90-day forward panels for 091-S, 091-U and 091-Y. Test each
before forming a composite.

At most two or three independently validated observations may be combined. No
missing series may be replaced by prices, zeros or synthetic proxies.

## Track archive and reproduction

All other explored tracks—including tank shadows, apportionment notices,
air-quality context, permits, calls-for-service, travel search, public mobility,
city pages, weather, events and community data—are retained with their evidence
and restart conditions in the [workflow](workflow.md).

- [CFAM collector](../../notebooks/091-cushing-operations-nowcasting/run_cfam.py)
- [Frozen in-sample receipt](../../indexes/091-cushing-operations-nowcasting/20260908T110000Z/README.md)
- [Original hotel-tax sample](data-sample-2023.md)
