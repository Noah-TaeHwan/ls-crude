# 091-GHGZ — Cushing city annual GHGRP CO2e, 2016..2019 (2026-09-10)

**What this is:** a frozen **annual time series** of EPA Greenhouse Gas
Reporting Program **total reported direct emissions (metric tons CO2e, IPCC
AR4 GWP)** for the single GHGRP direct emitter in **Cushing city, Oklahoma**:
Battle Ridge Plant (Enlink Midstream, subparts C + W gas processing,
ZIP 74023). A dated facility-emissions log. It cannot answer "is Cushing busy
this week?" and is not tested against WTI, EIA inventories, or other CFAM
tracks. It complements — never substitutes — the TRI pound series
(`20260910T091TRIZ`) and the DEQ VOC ton series (`20260910T091VOCYZ`), which
measure different pollutants in different units.

**What this is not:** field activity, a weekly busy series, a 0–100 score, a
WTI overlay, TRI pounds, DEQ VOC tons, supplier/injection quantities, or
Stillwater/Payne County/statewide Oklahoma. City = `Cushing`, ST = `OK` only.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-10T00:00:00Z |
| Source | EPA GHGRP 2023 Data Summary Spreadsheets, keyless zip (`ghgp_data_2016..2019.xlsx`, Direct (Point) Emitters, `Total reported direct emissions`), corroborated by keyless Envirofacts REST (`ghg.PUB_DIM_FACILITY` city CUSHING/state OK) |
| Raw | `research/gathering/raw/091-cushing-ghg/` (gitignored; zip + 14 xlsx + 2 REST JSON) |
| Universe | 1 Cushing-city direct emitter (Battle Ridge Plant, facility 1012793) |
| Range | 2016..2019 — 4 rows; 2010–2015 and 2020–2023 have no Cushing-city direct-emitter rows (missing, not 0) |
| Totals (t CO2e) | 44337.004, 46316.15, 38251.638, 36271.846 (checksum **165176.638**, see `receipt.json`) |
| REST gap | No keyless Envirofacts facility-total CO2e table exists (~35 probes 404); subpart `ef_w_*` tables carry source-category details only |

The reader is `app/app/lib/cushing-ghg.ts`; it fails closed on a
filled-zero year, swapped years, last-value copies, a Stillwater/county/busy
relabel, a TRI-pound or VOC-ton copy, or any edited CO2e value.
