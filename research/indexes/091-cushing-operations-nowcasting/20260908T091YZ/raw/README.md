# 091-Y source receipt

| input | actual observation | history / timestamp test |
| --- | --- | --- |
| Maverik #5097, Cushing | official public station page displays Regular and Diesel credit prices | one observed snapshot; page did not expose a historical panel or visible measurement timestamp in this audit |
| Cushing WTI | EIA `RWTC` daily public spot price; sample already retained in [091-X](../20260908T091XZ/raw/eia-cushing-wti-sample-20260908.json) | long daily public history available |
| Cushing multi-station average | GasBuddy/Way-style pages display discovery/current-style information | no reproducible long station-level panel retained; excluded from correlation test |

The CSV is a manually verified public display snapshot, not a scraped customer or
transaction dataset. SHA-256: `bd2c2ad3b83b82880366c54528a536d62b116578f2ccb209b3f5e11a7d3390b0`.
