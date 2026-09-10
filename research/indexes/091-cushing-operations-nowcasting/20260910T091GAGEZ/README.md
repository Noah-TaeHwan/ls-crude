# 091-GAGEZ — Cushing/Payne USGS daily gage-height hunt (2026-09-10)

**Verdict: FAIL-CLOSED, no freeze.** NWIS daily values disclose no
parameter-`00065` (gage height, feet) daily-mean series for site `07161450`
(Cimarron River near Ripley, OK, 12.8 km from Cushing town center — not a
Cushing-city gage). Nothing was frozen, no reader, no test.

**Label:** USGS 07161450 daily mean gage height, dated, 12.8 km, not
discharge cfs, not busy.

## Why this fails the freeze bar

- DV `00065` with `statCd=00003` (daily mean), without `statCd`, with
  `statCd=00001`/`00002`, and as JSON all return `No sites found matching
  all criteria` / `timeSeries: []`.
- The site's DV inventory lists exactly one daily series: `00060`
  discharge mean (`TS_ID 111131`). Discharge cfs was explicitly NOT copied
  into this freeze.
- IV `00065` returns one latest instantaneous unit value (`6.56 ft`,
  `2026-09-09T20:00-05:00`, provisional). Unit values are not daily means —
  rejected, not relabeled, not copied.
- New dated daily-mean gage-height rows: **0** (bar: ≥2 dated rows). No
  0-fill, no county/state substitute, no IV-to-DV invention.

## Pointers

- Raw probe recipe + quoted evidence:
  `research/gathering/raw/091-usgs-gage-cushing/README.md`
- Sibling discharge freeze (cfs, untouched):
  `research/indexes/091-cushing-operations-nowcasting/20260910T091USGSZ/`
- If NWIS later publishes a DV `00065` daily series for `07161450`, re-run
  from the raw README's probe recipe and freeze ≥2 dated rows before writing
  `app/app/lib/cushing-usgs-gage.ts`.

| Field | Value |
| --- | --- |
| Run | `20260910T091GAGEZ` |
| Retrieved | 2026-09-10T01:16:00Z |
| Site | `07161450` Cimarron River near Ripley, OK (12.8 km, not Cushing city) |
| Parameter | `00065` gage height, daily mean (`00003`) — not disclosed |
| Dated gage-height rows | 0 |
