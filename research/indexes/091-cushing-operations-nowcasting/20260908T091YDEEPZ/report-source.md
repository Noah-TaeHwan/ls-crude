# Source ledger — 091-YD deep check

**Audience:** CFAM research team  
**Scope:** decide whether a live fixed Cushing pump-price page can be retained as a meaningful research observation.

| Claim | Source | Access / scope note |
| --- | --- | --- |
| Oklahoma retail gasoline history ends in 2022 | [EIA Oklahoma portal](https://www.eia.gov/dnav/pet/pet_sum_mkt_dcu_sok_m.htm) | Official page; it displays the 1983–2022 history label and 2022 retail-price release note. |
| Long proxy relationship results | EIA historical series linked in the result README | Reproduced from preserved official source responses; code is `run_091y_retail_pass_through_proxy.py`. |
| Fixed local source has displayed regular/diesel prices but no public volume/history export | [Maverik Cushing #5097](https://locations.maverik.com/ok/cushing/2001-e-main-st#fuel) | First-party current page; only use as a forward observation. |
| Four distinct archived Cushing page snapshots exist | [Internet Archive CDX](https://web.archive.org/cdx/search/cdx?url=locations.maverik.com/ok/cushing/2001-e-main-st*&output=json&filter=statuscode:200&filter=mimetype:text/html&fl=timestamp,original,statuscode,mimetype,digest&collapse=digest) | Index query performed 2026-09-08. Insufficient for statistical testing. |

**Bottom line:** a strong crude-to-retail pass-through relationship exists in the public long proxy; the reverse relationship does not. The local board is retained as a forward local repricing display, not an alpha claim.
