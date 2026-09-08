# 091 CFAM raw collection set

- Final collection: `bg2015` through `bg2023`, one frozen calendar-year run per directory.
- Stored input: official EIA Cushing weekly inventory response, plus the public World Bank COG URL recorded in the derived signal (the global COG itself is never copied locally).
- Scope: 2015-01 through 2023-12; 2015–17 use `rp2`, 2018–23 use `ops` processing, handled as separate families in the assembled test.
- Final assembly receipt: [`research/indexes/091-cushing-operations-nowcasting/20260908T110000Z/`](../../../indexes/091-cushing-operations-nowcasting/20260908T110000Z/).
- Raw and processed CSVs are intentionally Git-ignored. Each annual manifest retains retrieval time, row count, source URL, and checksum.
