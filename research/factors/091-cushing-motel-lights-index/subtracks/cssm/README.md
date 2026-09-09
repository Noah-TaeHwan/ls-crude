# 091-EIA / CSSM — Cushing Storage & Stress Monitor

**Parent:** [091 CFAM](../../README.md)  
**State:** LIVE context / E1 — official weekly **stock level**, not field activity.  
**Evidence run:** [20260909T091EIAZ](../../../indexes/091-cushing-operations-nowcasting/20260909T091EIAZ/README.md)

This is the factor-local home for the submitted Cushing Storage Monitor.
It lives under 091 because the series is the physical inventory context
already named on the CFAM card. It is **not** a new factor number and not
a CFAM activity input.

## Question

Can we lawfully reprint EIA’s weekly Cushing ending stocks (excl. SPR) and
show level / week-over-week change without calling that “how busy the field
is”?

## What ran on 2026-09-09

| Path | Result |
| --- | --- |
| Submitted `cushing_storage_monitor.py --once` without `EIA_API_KEY` | blocked |
| EIA v2 seriesid without key | 403 |
| Genscape / Kpler stubs | not called |
| Free hist XLS `W_EPC0_SAX_YCUOK_MBBLw.xls` | **PASS** — 1,169 weeks |

Latest published week on that file: **2026-08-28 = 22,508 kbbl** (+80).

## Code here

- [`cushing_storage_monitor.py`](cushing_storage_monitor.py) — submitted API/watch/plot shell. Needs `EIA_API_KEY`. Does not invent pipeline flows or tankers.
- [`collect_eia_cushing_xls.py`](collect_eia_cushing_xls.py) — the path that actually collected.

```bash
python research/factors/091-cushing-motel-lights-index/subtracks/cssm/collect_eia_cushing_xls.py --out /tmp/cushing_stocks_weekly.csv
```

## Do not

- Treat stocks as pipeline throughput or QSR/truck busyness
- Double-count OilPriceAPI / MacroMicro
- Draw Keystone/Seaway line flows or a Cushing tanker map
- Promote the 76,000 / 20,000 kbbl guide rails to official capacity
