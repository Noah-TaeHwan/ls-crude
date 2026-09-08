# 091-GCPSI — SPP Grid Congestion & Pumping Stress Screen

**State:** PARK / E1 — implementation and public-source probe exist; no
verified Cushing-area SPP node panel has yet been collected.

## Question

Can a Cushing-area SPP bus's congestion component be a separate, public
operational-context signal? The proposed calculation is an hourly congestion
anomaly screen, not proof that any pipeline pump is running harder.

```text
SPP bus congestion component
  → possible local grid constraint context
  → only after a verified Cushing-area node mapping
  → compare first with an independent CFAM operational observation
```

## What is implemented

[`gcpsi.py`](gcpsi.py) uses `gridstatus.SPP()` where installed. It requests one
public SPP daily bus-LMP file at a time, requires an explicit Cushing-area bus
ID or a discovery-only `CUSH` name match, resamples five-minute values to
hourly, then calculates 24-hour and 168-hour congestion z-scores. Its output is
strictly:

```text
date,node_id,avg_lmp,congestion_spike_zscore,pumping_stress_index
```

The score is a bounded display transformation of the positive congestion
z-score. It must not be labelled a pumping measurement before validation.

## Actual retry result

The earlier broad multi-day SPP request timed out. The first factor-local retry
also exposed a code-level issue: `gridstatus` exposes no daily-file option on
its public bus method. That call was corrected to the version-pinned official
`RTBM-LMP-DAILY-B` archive route. A source timeout or a failed Cushing-node
match is written as an explicit factor-local receipt with an empty header; it
never becomes a synthetic zero series.

The corrected one-day archive request for `2026-09-07` returned a documented
network timeout (`WinError 10060`) before a source file was received. The
header-only output and error receipt are retained in [`runs/`](runs/). This is
**source unavailable in this environment**, not an inference that SPP had zero
congestion or that Cushing had no grid activity.

SPP's [2020 Integrated Transmission Plan](https://www.spp.org/documents/63434/2020%20integrated%20transmission%20plan%20report%20v1.0.pdf)
describes the Cushing Oilfield and Cushing Tap/Shell Cushing Tap/Shell Pipeline
69kV corridor. It supports a
future physical interpretation only after an exact public PNode mapping is
verified; the report does not provide an ID that can be silently inserted here.

## Re-open gate

1. Verify at least one SPP bus/PNode that is physically in or immediately serves
   the Cushing terminal area, including source, coordinates, and stable ID.
2. Obtain at least 168 continuous hourly values for that fixed node.
3. Validate congestion anomalies against an independent CFAM operational series
   before interpreting them as pumping or activity.

Until then this is a technically runnable collection route, not a CFAM input,
backtest, or oil-trading signal.

## Run

```text
python gcpsi.py --date YYYY-MM-DD --nodes VERIFIED_NODE_ID
```

No source, output or raw file is written outside this 091 factor directory.
