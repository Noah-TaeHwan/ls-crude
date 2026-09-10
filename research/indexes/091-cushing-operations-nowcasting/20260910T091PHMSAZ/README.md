# 091-PHMSA-Z — PHMSA Cushing hazardous-liquid incident dates, 2026-09-10 (FROZEN)

**What this is:** a frozen **dated event list** of PHMSA pipeline incidents
whose filed location is Cushing, Oklahoma — 141 unique incidents,
2010-01-11..2025-12-08, all system `HL` (hazardous liquid). This is an
incident log: **not** throughput, **not** busy, **not** WTI.

**Keyless surface that worked (no login):** USDOT DataHub Socrata mirror of
PHMSA operator submissions —
`https://datahub.transportation.gov/api/views/27nc-rsge`
(attachment `Hazardous Liquid Accident Data - January 2010 to present.zip`,
file `accident_hazardous_liquid_jan2010_present.txt`, 5850 rows).
Raw saved under `research/gathering/raw/PHMSA-20260910/` (gitignored; probe
notes in that folder's README). `www.phmsa.dot.gov` itself returns Akamai 403
to non-browser clients, so the DataHub attachment mirror is the frozen
source; it is the same PHMSA operator-submission file.

| Field | Value |
| --- | --- |
| Run | `20260910T091PHMSAZ` |
| Geography | Cushing, Oklahoma (`ONSHORE_STATE_ABBREVIATION=OK` + `ONSHORE_CITY_NAME=CUSHING` as filed) |
| System | `HL` only |
| Rows | 141 dated incidents (one row per `REPORT_NUMBER`, no duplicates) |
| Date range | 2010-01-11 .. 2025-12-08 (`LOCAL_DATETIME` date part; `REPORT_RECEIVED_DATE` never substituted; zero empty dates) |
| Causes | EQUIPMENT FAILURE 62, CORROSION FAILURE 47, INCORRECT OPERATION 20, NATURAL FORCE DAMAGE 4, MATERIAL FAILURE OF PIPE OR WELD 3, EXCAVATION DAMAGE 2, OTHER ACCIDENT CAUSE 2, OTHER OUTSIDE FORCE DAMAGE 1 |
| Fatalities / injuries | 0 / 0 across all 141 rows (as filed: `FATAL`, `INJURE`) |
| Gas transmission | 0 Cushing rows in `incident_gas_transmission_gathering_jan2010_present.txt` (101 OK rows, none Cushing) — HL only |
| CSV / JSON | `cushing_phmsa_incidents.csv`, `cushing_phmsa_incidents.json` |
| TS reader / test | `app/app/lib/cushing-phmsa.ts`, `app/tests/cushing-phmsa.test.mjs` (3 tests pass) |
| Checksum | 141 rows; cause counts above; fatal sum 0; injury sum 0 |

**Filed-data quirks (kept, not relabeled):** three rows file
`ONSHORE_CITY_NAME=CUSHING` with off-quirk counties — rpt 20120181 county
`ADAIR`, rpt 20100162 county `OKLAHOMA`, rpt 20110113 county blank — but
their lat/lon (35.93–36.02, −96.74–−96.76) sit on the Cushing terminal area
and operators name Cushing facilities, so they stay. One row (2012-11-02 rpt
20120341) files an empty `NARRATIVE`; its date + `EQUIPMENT FAILURE` cause
carry it. Narratives are whitespace-collapsed and truncated to 300 chars +
`…`; full text stays in the gitignored raw file.

**Not this:** not Cushing-city busy, not tank-farm throughput, not WTI, not a
busy relabel, not statewide Oklahoma. Supplemental reports are not double
counted (source slice carries one row per `REPORT_NUMBER`).
