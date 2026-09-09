# 091 — Factor-local source-retry ledger

This directory is the isolated retry boundary for source checks and the five
previously blocked
collection ideas.  Code, output headers, source receipts, and reopening
conditions live **only** below `091-cushing-motel-lights-index/subtracks/`.
Nothing here is a CFAM composite input, a backtest, or a trading signal yet.

| Track | Narrow question | Actual result | Current state |
| --- | --- | --- | --- |
| [091-E / FPATSI](fpatsi/README.md) | Is there a complete, dated public notice series for apportionment on a frozen Cushing-linked pipeline universe? | No reproducible public operating-notice feed was established for Plains, Enbridge, and Enterprise. The collector therefore produced a header-only output and a no-source receipt. | **PARK / E1** |
| [091-E2 / PEBB-FCI](pebb_fci/README.md) | Do these operators expose a public daily crude capacity/flow EBB? | No reproducible daily Cushing-linked liquids EBB/RSS/API was verified. The factor-local collector accepts an audited feed when one exists and otherwise produces a header-only output. | **PARK / E1** |
| [091-X2 / WMCSI](wmcsi/README.md) | Can a free historically rolled WTI M1–M2 panel measure prompt delivery pressure? | The spread definition and factor-local calculator are complete, but no verified daily rolling M1/M2 settlement panel is present. `CL=F` is not used as a fabricated M2 leg. | **PARK / E1** |
| [091-Z2 / Oklahoma Energy Today](okenergytoday/README.md) | Does a regional energy outlet add earlier, independently confirmable Cushing event discovery? | One dated Cushing inventory/maintenance/pipeline-context article was audited. It is useful as a human-reviewed cue, not as a numeric activity input. | **FORWARD_ONLY / source-pass** |
| [091-X / MCBI-WTT](mcbi/README.md) | Can a free Midland–Cushing physical basis be constructed without changing the definition? | Three real CME WTT observations were retained. WTT is a Midland (Argus) versus WTI Trade Month futures differential, not Midland cash minus Cushing spot. | **SOURCE-PASS / SERIES-PARK** |
| [091-GC / GCPSI](gcpsi/README.md) | Can a verified Cushing-area SPP PNode congestion series be retrieved and interpreted as an operational context? | The correct hourly aggregation route was implemented. The one-day public archive probe timed out before download and no Cushing PNode mapping is verified. | **PARK / E1** |

## What this retry did and did not do

- It retained an explicit source/error receipt for every attempt.
- It never turns missing coverage into a zero activity, zero congestion, or zero
  apportionment observation.
- It does not substitute Brent, a generic SPP settlement location, a tariff, or
  a press report for the missing physical series.
- It does not alter the existing forward CFAM observation panel outside this
  factor directory.

## Gates before combination

| Track | Minimum reopening condition |
| --- | --- |
| FPATSI | Stable public notices with route, dated publication/effective timestamp, and documented 60-month or 90-observation coverage. |
| PEBB-FCI | Public dated Cushing-linked liquids capacity/flow records for the frozen operator list, with 90 daily observations or 60 service cycles. |
| WMCSI | Authorized or reproducible daily M1/M2 settlements with a frozen roll and availability rule, then at least 30 sessions. |
| MCBI | Ninety valid daily WTT bulletins under a frozen contract rule **and** a source-authorized, definition-matched Midland physical price leg. |
| GCPSI | A publicly verified Cushing-area PNode, 168 continuous hourly observations, then agreement with an independent CFAM physical observation. |

The detailed code, raw-minimal sample, results, and receipts remain in each
linked subdirectory above.
