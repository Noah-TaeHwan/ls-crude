# 091-Y source receipt

| input | actual observation | history / timestamp test |
| --- | --- | --- |
| Maverik #5097, Cushing | official public station page displays Regular and Diesel credit prices | four public Wayback page snapshots plus one live observation were recovered; irregular dates and page-capture time are not a designed history |
| Cushing WTI | EIA `RWTC` daily public spot price; sample already retained in [091-X](../20260908T091XZ/raw/eia-cushing-wti-sample-20260908.json) | long daily public history available |
| Cushing multi-station average | GasBuddy/Way-style pages display discovery/current-style information | no reproducible long station-level panel retained; excluded from correlation test |

The original CSV is a manually verified public display snapshot, not a scraped customer or
transaction dataset. SHA-256: `bd2c2ad3b83b82880366c54528a536d62b116578f2ccb209b3f5e11a7d3390b0`.

`maverik-wayback-wti-paired-sample-20260908.csv` adds four public Wayback
captures and matches each to the most recent EIA WTI observation on or before
the capture date. The predecessor Kum & Go #0842 archive and Common Crawl were
also checked: the former supplies identity only (no displayed price) and the
latter duplicates the 2025-12 Maverik capture. It is an exploratory `n=5`
sample only. SHA-256:
`d0c378a312f807390c5952eb84010c6a84eb882709d7d0661207cf5dedf3f53a`.
