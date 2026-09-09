# 091-LM — Cushing Last-Mile Logistics Feasibility (CALMF)

**Parent:** [091 — Cushing Field Activity Monitor](../../README.md)
**Status:** PARK / E0 — no permitted, reproducible weekly regional inputs exist yet.
**Weight:** none; this is a CFAM subtrack, not an independent factor.

> “A delivery offer is not a delivery route.”

CALMF asks a limited measurement question: can public, aggregated activity show
whether **Cushing or Payne County** is experiencing a genuine change in
last-mile fulfilment? Until a defined local service geography and lawful
aggregate data source are verified, it does not claim to measure Amazon,
completed deliveries, fuel consumption, terminal activity, or WTI.

## Causal boundary

```text
driver job posting / app-displayed offer / facility permit
≠ completed delivery route
≠ parcel volume
≠ fleet fuel consumption
≠ Cushing crude-terminal activity
```

The first validation target is local consumer-fulfilment activity. An energy
relationship can be considered only after agreement with an independent,
lawful local ground-truth series such as aggregate road volume or fleet-fuel
data.

## Source-gate audit — 2026-09-08

| Proposed input | Public-source result | Decision |
| --- | --- | --- |
| Regional delivery-driver postings | [EmployOklahoma](https://www.employoklahoma.gov/Participants/s/) is an interactive dashboard; no anonymous API/export or historical posting series was verified. The [City of Cushing jobs page](https://www.cityofcushing.com/human-resources/pages/open-positions) is public but municipal, current-only and unrelated to regional delivery hiring. | **PARK** |
| Amazon Flex delivery-block count | Public Flex material directs drivers to account/app workflow; no public, aggregate historical Flex-block API was verified. Amazon’s [SP-API registration](https://developer-docs.amazon.com/sp-api/lang-en_EN/docs/sp-api-registration-overview) requires authorized developer/seller access and does not turn Flex offers into an open regional series. | **BLOCKED** |
| Micro-fulfilment facility milestones | [Cushing agendas](https://www.cityofcushing.com/minutes-and-agendas) and [OK DEQ permit material](https://oklahoma.gov/deq/permits/air-permits/pp-ip.html) can support individually checked public event flags, but do not provide weekly completed-route or parcel-volume data. | **SOURCE-PASS for sparse event ledger only** |
| Slow regional logistics benchmark | [BLS QCEW open data](https://www.bls.gov/cew/additional-resources/open-data/home.htm) can supply Payne County NAICS 48–49 covered employment quarterly with publication lag. It is not a job-posting or delivery-block series. | **CONTEXT ONLY** |

No primary source was found that verifies an Amazon fulfilment or Flex station in
Cushing/Payne County. A project reported in Perry is excluded: [Perry is in
Noble County](https://www.noblecountyok.com/), outside the frozen geography.

## Factor-local collector

[`calmf.py`](calmf.py) accepts only a future permitted local export of
already-aggregated, non-personal observations. It does no web scraping, app
login, private-endpoint access, account-offer collection, or personal-data
collection. Required fields:

```text
available_at,metric,value,source_id,geography,source_url
2026-01-05T09:00:00-06:00,driver_posting,1,public-listing-id,Cushing OK,https://permitted.example/
2026-01-05T09:00:00-06:00,delivery_block,18,aggregate-snapshot-id,Payne County OK,https://permitted.example/
2026-01-07T09:00:00-06:00,facility_milestone,1,permit-id,Cushing OK,https://public.example/
```

- `driver_posting` is a deduplicated posting-intent event, not an active driver count.
- `delivery_block` must be a permitted anonymous aggregate count; app-only or account-specific offers are ineligible.
- `facility_milestone` stays in a separate dated ledger.
- A score requires 30 consecutive daily opportunities with both first two inputs. Weekly values are never interpolated into fake daily observations.

Current header-only outputs and source receipt:

- [`data/calmf_weekly.csv`](data/calmf_weekly.csv)
- [`data/facility_milestones.csv`](data/facility_milestones.csv)
- [`receipts/latest_execution.json`](receipts/latest_execution.json)
- [`receipts/20260908T093126Z-source-gate.json`](receipts/20260908T093126Z-source-gate.json)

```json
{"status":"park_no_reproducible_weekly_inputs","input_rows":0,"accepted_rows":0,"output_rows":0}
```

Run only with an authorized local aggregate export:

```text
python research/factors/091-cushing-motel-lights-index/subtracks/calmf/calmf.py --input permitted_aggregate.csv
```

## Re-open gate

1. Verify a Cushing/Payne County facility, service area, or fixed delivery geography from a primary public source.
2. Obtain a documented permitted public/aggregated feed for both de-duplicated driver-posting intent and delivery-block or completed-route count.
3. Collect 30 consecutive daily opportunities before calculating a first score; collect a 90-day forward panel before testing measurement validity.
4. Validate first against independent local ground truth; only then consider an energy target.

## Related research

- [031 Live Commerce Burn Rate](../../../031-live-commerce-burn-rate/README.md)
- [046 Urban Mobility Tempo](../../../046-urban-mobility-tempo/README.md)
- [069 Ulsan Late Delivery Index](../../../069-ulsan-late-delivery-index/README.md)

None of their inputs may be copied into CALMF without a new source and measurement review.
