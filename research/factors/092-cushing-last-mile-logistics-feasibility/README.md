# 092 — Cushing Last-Mile Logistics Feasibility (CALMF)

**Status:** PARK / E0 — no permitted, reproducible weekly regional inputs
exist yet.
**Weight:** 0.0

> “A delivery offer is not a delivery route.”

CALMF asks a limited measurement question: can public, aggregated activity show
whether **Cushing or Payne County** is experiencing a genuine change in
last-mile fulfilment?  Until an Amazon/Flex/facility presence is verified in the
defined geography, the card deliberately does **not** call itself an Amazon
activity indicator.

## Causal boundary

```text
driver job posting / app-displayed offer / facility permit
≠ completed delivery route
≠ parcel volume
≠ fleet fuel consumption
≠ Cushing crude-terminal activity
```

The closest eventual target is local consumer-fulfilment activity, not WTI,
Cushing stocks, refinery utilization, or pipeline throughput.  A relationship
with an energy asset could only be considered after the activity measure first
agrees with an independent local ground-truth series such as lawful aggregate
road-volume or fleet-fuel data.

## Source-gate audit — 2026-09-08

| Proposed input | Public-source result | Decision |
| --- | --- | --- |
| Regional delivery-driver postings | [EmployOklahoma](https://www.employoklahoma.gov/Participants/s/) is an interactive dashboard; no anonymous API/export or historical posting series was verified. The [City of Cushing jobs page](https://www.cityofcushing.com/human-resources/pages/open-positions) is public but municipal, current-only and unrelated to regional delivery hiring. | **PARK** |
| Amazon Flex delivery-block count | Public Flex material directs drivers to account/app workflow; no public, aggregate historical Flex-block API was verified. Amazon’s [SP-API registration](https://developer-docs.amazon.com/sp-api/lang-en_EN/docs/sp-api-registration-overview) requires authorized developer/seller access and does not turn Flex offers into an open regional series. | **BLOCKED** |
| Micro-fulfilment facility milestones | [Cushing agendas](https://www.cityofcushing.com/minutes-and-agendas) and [OK DEQ permit material](https://oklahoma.gov/deq/permits/air-permits/pp-ip.html) can support individually checked public event flags, but do not provide weekly completed-route or parcel-volume data. | **SOURCE-PASS for sparse event ledger only** |
| Slow regional logistics benchmark | [BLS QCEW open data](https://www.bls.gov/cew/additional-resources/open-data/home.htm) can supply Payne County NAICS 48–49 covered employment quarterly with publication lag. It is not a job-posting or delivery-block series. | **CONTEXT ONLY** |

No primary source was found in this audit that verifies an Amazon fulfilment or
Flex station in Cushing/Payne County.  A project reported in Perry is excluded:
[Perry is in Noble County](https://www.noblecountyok.com/), outside the frozen
geography.

## Factor-local collector

[`calmf.py`](calmf.py) performs no web scraping, app login, private-endpoint
access, account-offer collection, or personal-data collection.  It only accepts
a future permitted local export of aggregated rows:

```text
available_at,metric,value,source_id,geography,source_url
2026-01-05T09:00:00-06:00,driver_posting,1,public-listing-id,Cushing OK,https://permitted.example/
2026-01-05T09:00:00-06:00,delivery_block,18,aggregate-snapshot-id,Payne County OK,https://permitted.example/
2026-01-07T09:00:00-06:00,facility_milestone,1,permit-id,Cushing OK,https://public.example/
```

- `driver_posting` is a deduplicated **posting-intent** event, never an active
  driver count.
- `delivery_block` must be a permitted, anonymous **aggregate** count; app-only
  or account-specific offers are not eligible.
- `facility_milestone` remains a separate dated ledger and is never folded into
  the fulfilment score.
- A 30-day z-score is calculated only from 30 consecutive daily opportunities
  with both first two inputs.  Weekly rows are not interpolated into fake daily
  observations.  With true weekly data, the future specification must be
  changed and re-frozen to a 4-week/13-week statistic.

The current no-source execution produces header-only factor-local files:

- [`data/calmf_weekly.csv`](data/calmf_weekly.csv)
- [`data/facility_milestones.csv`](data/facility_milestones.csv)
- [`receipts/latest_execution.json`](receipts/latest_execution.json)
- [`receipts/20260908T093126Z-source-gate.json`](receipts/20260908T093126Z-source-gate.json)

### Executed result

```json
{"status":"park_no_reproducible_weekly_inputs","input_rows":0,"accepted_rows":0,"output_rows":0}
```

The collector's syntax check and a 35-day **in-memory code fixture** passed; the
fixture is not stored as a Cushing observation and is not an empirical result.

Run only with an authorized local aggregate export:

```text
python research/factors/092-cushing-last-mile-logistics-feasibility/calmf.py --input permitted_aggregate.csv
```

## Re-open gate

1. Verify a Cushing/Payne County facility, service area, or fixed delivery
   geography from a primary public source.
2. Obtain a documented permitted public/aggregated feed for both de-duplicated
   driver-posting intent and delivery-block or completed-route count.
3. Collect at least 30 consecutive daily opportunities before calculating the
   first score; collect a 90-day forward panel before testing measurement
   validity.
4. Validate first against an independent local ground truth.  Only then decide
   whether an energy-target hypothesis is appropriate.

## Related but non-duplicated research

- [031 Live Commerce Burn Rate](../031-live-commerce-burn-rate/README.md)
- [046 Urban Mobility Tempo](../046-urban-mobility-tempo/README.md)
- [069 Ulsan Late Delivery Index](../069-ulsan-late-delivery-index/README.md)
- [091 Cushing Field Activity Monitor](../091-cushing-motel-lights-index/README.md)

None of their inputs may be copied into CALMF without a new source and
measurement review.
