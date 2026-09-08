# 091-YD — research process log

**Run date:** 2026-09-08  
**Question:** can a live, fixed Cushing retail fuel-price board be retained as a meaningful CFAM observation rather than a decorative dashboard widget?

## 1. Claim boundary set before testing

The original proposed story—high local diesel prices imply truck queues, terminal activity and then WTI—is a chain of separate claims. It was separated into two testable questions:

1. Is a **fixed Cushing station** reproducibly observable over a long enough period to test it directly?
2. If not, does the closest correctly labelled **public long proxy** show crude → retail transmission, or retail → future crude prediction?

No local price observation was treated as a gallon volume, truck count, tank activity or future WTI signal.

## 2. Discovery and availability check

| Candidate source | Finding | Decision |
| --- | --- | --- |
| Maverik Cushing #5097 | First-party page publishes Regular and Diesel display prices live; it provides no public historical export or sales-volume series. | Retain for fixed-time forward collection only. |
| Internet Archive CDX | Four distinct historical page captures were located. | Preserve as a visibility check; do not calculate a correlation from four irregular dates. |
| Way Cushing price page | Public page request returned HTTP 403 in the collection environment. | Preserve failure receipt; do not rely on it as a second source. |
| EIA Oklahoma retail pricing | Official monthly regular-retail history is available for 1983–2022; EIA’s page confirms this history ended in 2022. | Use only as a labelled **state proxy**, never as a substituted Cushing-station history. |
| EIA Cushing WTI | Official monthly history available. | Use as the crude leg. |

All retrieved responses, the 403 failure, byte counts and SHA-256 values are preserved in the [raw collection receipt](../../../../gathering/raw/ALT-20260908-28/20260908T210000Z/README.md).

## 3. Frozen proxy test

**Inputs:** EIA Oklahoma Regular Retail Gasoline and EIA Cushing WTI, monthly levels.  
**Sample:** paired month-on-month percentage changes, 1983–2022; 299 usable pairs after lag construction.  
**No tuning:** one contemporaneous direction, one crude-to-next-month-retail direction, and one reverse retail-to-next-month-crude direction. No threshold, feature selection or cherry-picked subperiod was applied.

| Test | Why it was run | Result | Interpretation |
| --- | --- | ---: | --- |
| WTI change at month *t* → retail-gas change at *t* | Immediate pass-through | `r=+0.680` | Strong same-month crude-to-retail connection |
| WTI change at *t* → retail-gas change at *t+1* | Delayed repricing | `r=+0.340` | Some retail adjustment continues into the following month |
| Retail-gas change at *t* → WTI change at *t+1* | The claimed leading direction | `r=+0.105` | No useful evidence of retail leading crude |

The exact aligned rows and outputs are linked from the [result README](README.md).

## 4. Decision and forward protocol

**Accepted use:** a local *retail repricing lag* and Diesel-minus-Regular display.  
**Rejected use:** WTI forecast, direct truck-demand gauge, terminal-throughput estimate or CFAM composite input today.

From now on, collect the fixed Maverik board at the same time weekly: regular, diesel, spread, capture timestamp and current/previous WTI change. Audit data integrity at 12 weeks; consider a pre-registered local-versus-regional product-price test only after 52 weeks. Any later truck-activity claim additionally requires a dated independent truck-count series.

## 5. Reproduction

Run:

```text
python research/notebooks/091-cushing-operations-nowcasting/run_091y_retail_pass_through_proxy.py
```

The script reads only the preserved EIA source responses and writes the aligned dataset, lag-test table and SVG in this folder.
