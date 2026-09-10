# 091-DMRZ — Cushing city EPA ECHO DMR effluent flow, dated (2026-09-10, FROZEN)

**What this is:** a frozen **dated Discharge Monitoring Report (DMR)
quantity** series for NPDES permits whose filed city is **CUSHING, OK** —
parameter **50050 Flow, in conduit or thru treatment plant**, 1722 dated
rows, monitoring periods **2015-01-31..2026-07-31**. A water discharge log:
**not** busy, **not** WTI, **not** last-inspection counts (`20260910T091CWAZ`
rows not copied), **not** CAA air FCE, **not** TRI, **not** DEQ VOC, **not**
throughput.

**Keyless surface that worked (no login):** ECHO effluent charts REST —
`https://echodata.epa.gov/echo/eff_rest_services.get_effluent_chart?p_id=<NPDES>&output=JSON`
— with an **explicit date range** `start_date=01/01/2015&end_date=09/09/2026`.
Omitting the range silently returns only the current permit window; passing
it routes the same call to real historical DMR data. Raw JSON saved under
`research/gathering/raw/091-cushing-dmr/` (gitignored; probe notes in that
folder's README).

| Field | Value |
| --- | --- |
| Run | `20260910T091DMRZ` |
| Geography | Cushing city, Oklahoma (ECHO `CWPCity=CUSHING`, state OK, all 18 responses confirm) |
| Rows | 1722 dated flow rows (one per permit × outfall × period × value type, no duplicates) |
| Dated | 1722/1722 carry `MonitoringPeriodEndDate` (2015-01-31..2026-07-31); missing periods stay missing, never 0 |
| Quantities | 880 numeric as filed (`DMRValueNmbr`); 842 null, every one with NODI (C No Discharge), kept empty |
| Units | As filed: MGD, gal/d, or null on older valued rows — never invented |
| Value types | `Q1` MO AVG / `Q2` DAILY MX pairs as filed, with qualifier (`=`, `<`) and received date |
| Permits | 5 of 18 Cushing-city permits disclose flow (OK0026701 SOUTH STP 278, OK0043320 834, OK0044598 278, OK0100374 40, OKG270057 14, OKG950028 278); 13 disclose none and contribute zero rows |
| CSV / JSON | `cushing_echo_dmr_flow.csv`, `cushing_echo_dmr_flow.json` |
| TS reader / test | `app/app/lib/cushing-echo-dmr.ts`, `app/tests/cushing-echo-dmr.test.mjs` (3 tests pass) |
| Checksum | 1722 rows; 880 numeric; value-sum thousandths 7487398621 (integrity only, mixed MGD/gal/d never totaled physically) |

**Filed-data notes (kept, not relabeled):** city is the filter — every row
is `CUSHING`, no `CRUSHING` typo row entered this table (that exclusion lives
in 091-CWAZ). Outfalls are as filed (`001`, plus `007`/`008` on OK0043320 and
`002` on OK0100374). NODI `C` rows are disclosed no-discharge months, not
zero flow. The reader fails closed on any null→0 fill, redate, reorder,
unit invention, or statewide relabel.

**Not this:** not Cushing-city busy, not throughput, not WTI, not TRI, not
DEQ VOC, not CAA air FCE, not CWA last-inspection counts, not a statewide
Oklahoma relabel.
