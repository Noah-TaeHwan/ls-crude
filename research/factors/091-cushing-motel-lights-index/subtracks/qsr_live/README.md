# 091-S — Live busy-label recorder (submitted monitor)

**State:** FORWARD_ONLY / E1 — recording workflow only.  
**Parent card:** [091 README](../../README.md) · [protocol](../../../indexes/091-cushing-operations-nowcasting/20260908T091QRSZ/091s-live-monitor-protocol.md)

Submitted five-minute “LIVE BUSYNESS MONITOR” is kept after removing the
parts that invent Cushing activity.

| Submitted | Kept here |
| --- | --- |
| `mock_busyness()` 0–100 by hour | Off. `--mock` prints a demo and writes nothing |
| `YOUR_GOOGLE_MAPS_API_KEY` | Unused. Live Popular Times is not a public Places poll we run |
| Generic restaurant / gym / community names | Frozen 091-S basket only |
| Automatic numeric loop | Prompt loop: open the public URL, type the visible label |

Gym and community-center links from the submitted list are an optional
watchlist. They are not in the frozen basket and must not enter a QSR share
or a CFAM score.

## Frozen basket

| Venue | Address | Maps query (do not use goo.gl) |
| --- | --- | --- |
| Wendy's | 1415 E Main St, Cushing, OK 74023 | https://www.google.com/maps/search/?api=1&query=Wendy%27s+1415+E+Main+St+Cushing+OK+74023 |
| Taco Bell | 1438 E Main St, Cushing, OK 74023 | https://www.google.com/maps/search/?api=1&query=Taco+Bell+1438+E+Main+St+Cushing+OK+74023 |
| Sonic Drive-In | 705 E Main St, Cushing, OK 74023 | https://www.google.com/maps/search/?api=1&query=Sonic+Drive-In+705+E+Main+St+Cushing+OK+74023 |
| Golden Chick | 1544 E Main St, Cushing, OK 74023 | https://www.google.com/maps/search/?api=1&query=Golden+Chick+1544+E+Main+St+Cushing+OK+74023 |
| Pizza Hut | 2007 E Main St, Cushing, OK 74023 | https://www.google.com/maps/search/?api=1&query=Pizza+Hut+2007+E+Main+St+Cushing+OK+74023 |
| Boomarang Diner | 929 E Main St, Cushing, OK 74023 | https://www.google.com/maps/search/?api=1&query=Boomarang+Diner+929+E+Main+St+Cushing+OK+74023 |

2026-09-09: goo.gl short links retired. Wendy's old short link opened Cushing Sports Complex. Record only if the opened pin matches the address.

## Run

```bash
python research/factors/091-cushing-motel-lights-index/subtracks/qsr_live/busyness_monitor.py --once
python research/factors/091-cushing-motel-lights-index/subtracks/qsr_live/busyness_monitor.py --loop --interval-seconds 300
python research/factors/091-cushing-motel-lights-index/subtracks/qsr_live/busyness_monitor.py --mock
```

Rows append to
`research/indexes/091-cushing-operations-nowcasting/forward-panel/091s_manual_busy_labels.csv`.
That file is a forward log, not a WTI/EIA input, until the 90-day / 80%
measurement-validity gate in the protocol passes.
