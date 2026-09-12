# 091-OPS monthly raw — Cushing Regional / KCUH airport operations hunt (2026-09-10)

- **retrieved_at:** 2026-09-10 Asia/Seoul (keyless public HTTP, no login, no AirNav)
- **purpose:** hunt for a monthly airport-operations series for Cushing Regional /
  KCUH (FAA LID `CUH`): operations (itinerant / local / total) as published.
  Not fuel sales, not busy, not WTI.
- **finding:** 0 dated monthly rows. Fail-closed, nothing frozen.

## Keyless probes (all without login)

| # | probe | result |
| --- | --- | --- |
| 1 | OPSNET/ATADS Airport Ops query form `https://www.aspm.faa.gov/opsnet/sys/airport.asp` (guest cookie) | **HTTP 200, 128,689 bytes, `guest=true`** — form itself is keyless |
| 2 | Facility autocomplete `loader.asp?area=loc&locInput_param=CUH` | **empty `<ul></ul>` (11 bytes)** — CUH not in universe |
| 3 | Same loader for `KCUH` | **empty** — not in universe |
| 4 | Same loader full-text `Cushing` | **empty** — not in universe |
| 5 | Same loader `CUS` | 1 row: `SYR - Syracuse Hancock Intl` only — no Cushing |
| 6 | Same loader `CU` | 8 rows (CGF, EDC, FXE, JYO, ORL, SAC, SYR, TME) — no Cushing field |
| 7 | Positive controls `OKC`, `TUL` | `OKC - Oklahoma City/Will Rogers`, `TUL` + `RVS` — loader works |
| 8 | Negative control `PNC` (Ponca City, non-towered) | **empty** — non-towered fields are out of the universe |
| 9 | TFMSC `https://www.aspm.faa.gov/tfms/sys/main.asp` + `/tfms/sys/Airport.asp` (guest) | **302 → ASPM login landing** (`Direct Login / MyAccess Login`, 11,925 bytes) — login-walled, not keyless |
| 10 | OPSNET Facility Info form (guest) | loads; same facility universe as probe 1–8 |
| 11 | FAA 5010 (form 5010 master record for CUH) | **annual operations estimate only** (one 12-month figure per cycle, e.g. 2,500 GA ops year ending 2011-09-23) — not monthly itinerant/local/total by definition |
| 12 | GCR AirportIQ 5010 `airport.cfm?Site=CUH` | 404 on guessed URL form — not pursued; 5010 already fails the monthly bar per #11 |
| 13 | Oklahoma ODAA (`oklahoma.gov/aerospace`) | per-airport economic-impact reports + construction program + annual reports — **no monthly per-airport operations table**; monthly activity reports exist only for towered airline airports (e.g. OKC Will Rogers self-published ACI reports, not KCUH) |
| 14 | AirNav `airnav.com/airport/CUH` | **not scraped per contract**; used only to confirm `Control tower: no`, CTAF 122.8 (non-towered, consistent with OPSNET absence) |

## Why this fails the freeze bar

- Dated monthly operations rows for KCUH/CUH: **0** (bar: ≥2).
- OPSNET/ATADS Airport Ops counts tower-reported operations (`tower_day`
  table in the query builder); Cushing Regional is non-towered, so it has no
  rows even though the query form itself is keyless.
- TFMSC (the radar-based count that could cover a non-towered field) demands
  an ASPM login as guest — not a keyless public table.
- FAA 5010 gives at most one annual estimate per cycle, never a monthly
  itinerant/local/total series. No 0-fill, no ops invented from based-aircraft.
- ODAA publishes no monthly ops table for this airport.

## Reproduce

```sh
JAR=$(mktemp)
curl -sS -c "$JAR" -b "$JAR" -A "Mozilla/5.0" \
  "https://www.aspm.faa.gov/opsnet/sys/loader.asp?area=loc&locInput_param=CUH"
# -> <ul>\n</ul>   (compare locInput_param=OKC -> one <li id="OKC"> row)
curl -sS -A "Mozilla/5.0" -b "$JAR" -L --max-redirs 5 \
  -o /dev/null -w "%{url_effective}\n" \
  "https://www.aspm.faa.gov/tfms/sys/Airport.asp"
# -> https://www.aspm.faa.gov/  (login landing)
```

No passenger, pilot, employee, or individual aircraft data. No WTI, no busy
relabel. If the FAA ever publishes keyless monthly ops for CUH (or ODAA starts
a monthly table), re-run this hunt from the recipe above.
