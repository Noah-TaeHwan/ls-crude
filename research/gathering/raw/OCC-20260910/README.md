# OCC-20260910 — Payne County monthly production probe (fail-closed, no dated rows)

Date: 2026-09-10. Target: monthly county production for Payne County, OK (FIPS 40119),
per month `crude_bbl` and/or `gas_mcf` as the source labels them.

## Route 1 — EIA county production (no API key): NOT FOUND
- EIA FAQ `faq.php?id=807&t=6` (county-level energy production): EIA publishes
  county-level oil/gas only as Drilling Productivity Report *regional* estimates
  (region-county worksheet), not monthly per-county rows. Payne County has no
  EIA monthly crude series; EIA dnav offers statewide Oklahoma monthly only
  (e.g. `MCRFPOK2`, `M_EPC99A_FPF_SOK_MBBLD`).
- Saved statewide page as control: `eia_statewide_production_page.html`
  (Oklahoma Field Production of Crude Oil; no Payne rows — grep found none).
- EIA v2 API not called (key required). Statewide production NOT substituted.

## Route 2 — OCC public monthly county production tables (no login): NOT FOUND
- `oklahoma.gov/occ/divisions/oil-gas/oil-gas-data.html` (saved as
  `occ_oil_gas_data_page.html`, 2026-09-10): downloadable files are RBDMS well
  data, completions, transfers, orphan/state-funds lists, and annual UIC
  injection volumes — no monthly county oil/gas production CSV/XLS.
- The page's only production pointer: "Gas Production Master Files — Available
  from the Oklahoma Tax Commission" → OTC OkTAP `web?link=PUBLICPUNLKP`, an
  interactive per-lease lookup. `curl` follows 50 redirects and lands nowhere
  downloadable (session/JS-gated); not a monthly county table.
- OTC gross-production page (`otc_gross_production_page.html`): forms + FAQ PDF
  only, no county monthly download. OTC ledger page (`otc_ledger_page.html`):
  no monthly-apportionment county download links.
- OTC monthly apportionment reports are tax dollars by county, not bbl/mcf
  production volumes — not substitutable even if reachable.

## Third parties seen but NOT used (out of scope)
- Buckhead Energy (`buckheadenergy.com/data/oklahoma/payne`): monthly county
  oil/gas CSV/JSON, CC BY — third-party aggregator, neither EIA nor OCC.
  Internal inconsistency noted (May 2026 oil 5,023 bbl vs shalexp 71.2k bbl),
  reinforcing fail-closed. GIS-scraped months not invented.

## Verdict
`no dated rows`. No CSV/JSON frozen, no TS reader, no test. Receipt only.
