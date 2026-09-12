# 091 QCEW quarterly raw set

- Range: 2015-Q1 through 2026-Q1, one BLS QCEW area file per quarter
  (`payne_40119_{year}q{q}.csv`), plus `manifest.json` with per-file bytes and
  SHA-256.
- Source: `https://data.bls.gov/cew/data/api/{year}/{qtr}/area/40119.csv`
  (no key, User-Agent `ls-crude-observations/1.0`). No www.bls.gov HTML.
- Trailing probe: 2026-Q2 returned HTTP 404, so the series stops at 2026-Q1.
- Raw CSVs are intentionally Git-ignored. Frozen series:
  [`research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWQZ/`](../../../indexes/091-cushing-operations-nowcasting/20260909T091QCEWQZ/).
