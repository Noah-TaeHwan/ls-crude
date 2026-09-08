# ALT-20260908-19 — CFAM public context retrieval receipt

- Retrieved at (UTC): `2026-09-08T05:28:57+00:00`
- NOAA current-observation endpoint: `https://api.weather.gov/stations/KCUH/observations?limit=24`
- KUSH endpoint: public WordPress category lookup plus the KUSH After Dark category’s post metadata.
- Raw JSON is ignored by Git. It can include publicly posted article text/title strings; tracked outputs contain only aggregate/event-audit fields and no author names, text, customer, visitor, device, patient, guest or member records.
- Google Maps restaurant results are **not** fetched by code. The source audit is a one-time visible UI observation, and no historic Popular-times series is claimed.

| file | bytes | SHA-256 |
| --- | ---: | --- |
| kush-after-dark-posts.json | 129766 | `9fc3b55011740fcc3f765519889c049df2af5d754ab7587968716e33b2f246fc` |
| kush-categories.json | 874 | `3fc9c91cd0f8d7ba0249acded375109443813004305e6db639a85613a611d5c3` |
| noaa-kcuh-observations-24h.json | 101906 | `e26fe97521f659e440f2858b231582dd6a79954eeca6fd1fee4ceeaee1d8a844` |
