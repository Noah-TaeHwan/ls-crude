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

| Venue | Public Maps short link |
| --- | --- |
| Wendy's | https://maps.app.goo.gl/g8bMaDQDnoMc9roT8 |
| Taco Bell | https://maps.app.goo.gl/yTqHLrTgNEpwXSar9 |
| Sonic Drive-In | https://maps.app.goo.gl/XuwHFkr1iwhEnCcT7 |
| Golden Chick | https://maps.app.goo.gl/eNWcXPHvQcWH9iB1A |
| Pizza Hut | https://maps.app.goo.gl/2pi7HqucdZ1J1m527 |
| Boomarang Diner | https://maps.app.goo.gl/ajaYq841CJrCgL898 |

If a short link does not open that venue, stop and fix the URL before recording.

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
