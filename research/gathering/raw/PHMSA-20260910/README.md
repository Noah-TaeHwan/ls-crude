# PHMSA raw probe notes, 2026-09-10

Preferred keyless surfaces probed for Cushing, OK pipeline incidents:

1. **www.phmsa.dot.gov direct (FAILED for automation):** the incident-data
   page and the flagged-incidents ZIP
   (`.../PHMSA_Pipeline_Safety_Flagged_Incidents.zip`) return Akamai 403
   `Access Denied` to curl/webfetch (bot manager; browser clients may pass).
   No login was attempted; no map was scraped.
2. **USDOT DataHub Socrata mirror (WORKED, no login):**
   `https://datahub.transportation.gov/api/views/27nc-rsge` lists the same
   PHMSA operator-submission ZIPs as attachments. Downloaded:
   - `hl2010.zip` (4,597,548 bytes) → `accident_hazardous_liquid_jan2010_present.txt` (5850 rows, 648 cols, tab-delimited)
   - `gt2010.zip` (2,241,740 bytes) → `incident_gas_transmission_gathering_jan2010_present.txt` (1996 rows)
   - `qdme-9bbm` (flagged files) and `27nc-rsge` Socrata views are
     `viewType: href` (non-tabular) — attachments are the data path.
3. **data.transportation.gov Socrata API:** `qdme-9bbm.json` returns
   `no row or column access to non-tabular tables` — not a table. No keyless
   tabular PHMSA mirror found.

Filter: `ONSHORE_STATE_ABBREVIATION=OK` + `ONSHORE_CITY_NAME` contains
`CUSHING` → 141 HL rows (all `LOCAL_DATETIME` present, unique
`REPORT_NUMBER`s), 0 GT rows. Date rule: `LOCAL_DATETIME` date part only.

Files here (gitignored, not committed): `hl2010.zip`, `gt2010.zip`, both
extracted `.txt` files. The 403 HTML and error JSON probes were deleted.
