# 091-WQPZ raw (gitignored)

- `stations_payne.csv` — WQP Station search, Payne County OK (`countrycode=US`,
  `statecode=US:40`, `countycode=US:40:119`), complete http 200, 404 lines
  (header + 403 stations).
- `result_cushing20km_all.csv` — WQP Result search `lat=35.9849&long=-96.7645&
  within=12.5&sorted=no`, complete http 200 exit 0, 62,839 data rows.
  Frozen source for `20260910T091WQPZ` (IOWATROK_WQX-SND1 pH panel).
- `result_cushing20km_nitrate.csv` — same geo + `characteristicName=Nitrate-N`:
  headers only, 0 rows (local orgs file nitrate as `Nitrate`, not `Nitrate-N`).
- Discarded: `siteids=USGS-07161450` queries (service ignored the filter and
  returned national ARS CEAP rows); one unconstrained site download truncated
  at 160 MB / 1700 s. Documented in the freeze `receipt.json`.
