# 091-candidates run `20260911T102736Z` — DMR per-series audit + SPP access check

**TASK A (DMR, local only):** parse all 18 EPA ECHO DMR permit JSONs from
`research/gathering/raw/091-cushing-dmr/`, build per-facility × outfall × unit × basis flow
series, never summing across anything, no unit conversion, no filling; measure span/gaps/
duplicates and alignment against WTI trading days and the AVC040 2023 TMAS daily dates;
count usable rows for the dev windows (train ≤ 2020-12-31, val 2021-01-01..2023-12-31).

**TASK B (SPP, minimal official sample):** terms/access check first — the portal host is
**unreachable from this environment** and no sample was fetched. Exact blocker and the
fetched official terms pages are recorded in [`spp-access-terms.json`](spp-access-terms.json).

- Run UTC: 2026-09-11T10:27–10:35Z · KST: 2026-09-11 19:27–19:35
- No git commits, no pip installs, no sudo, concurrency 1.
- Forbidden paths untouched: `app/`, `research/src/`, `research/tests/`,
  `docs/cai/tasks.json`, `docs/cai/ORCHESTRATOR_STATE.md`, other candidates,
  TMAS raw re-downloads (none attempted).

## 1. Inputs → script → outputs

Everything is pinned in [`manifest.json`](manifest.json) (32 inputs, 8 outputs, SHA-256).
Key rows:

| role | path | SHA-256 (prefix) |
| --- | --- | --- |
| script | `research/notebooks/091-candidates/dmr_series_build.py` | `e37d4f8fffb9851d…` |
| DMR raw | `research/gathering/raw/091-cushing-dmr/dmr_*.json` (18 files) | per-file in manifest |
| WTI trading days | `research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv` | `89c3a04c994d3741…` |
| TMAS 2023 daily dates | `research/indexes/091-tmas/20260911T082500Z/avc040_*_daily.csv` (13 files: 2023×12 + mar2020) | per-file in manifest |

Outputs (this folder): `dmr_facilities.csv/.json`, `dmr_parameters.csv`, `dmr_series_rows.csv`,
`dmr_series_summary.csv`, `dmr_series_window_counts.csv`, `dmr_tmas2023_common.csv`,
`dmr_quality.json`, `spp-access-terms.json`.

Reproduce: `python3 research/notebooks/091-candidates/dmr_series_build.py research/indexes/091-candidates/20260911T102736Z`
(stdlib only). The script verifies its key set against the frozen CSV and fails loudly on mismatch.

## 2. DMR rules applied (as stated, never relaxed)

- Parameter **50050 Flow only** for series (`dmr_parameters.csv` keeps the full 18-permit /
  634 distinct parameter inventory so the filter is auditable).
- Series key = **(permit, outfall, unit_class, basis)**. Outfall kept separate so 007/008 are
  never merged. No sum across facilities, outfalls, units, or statistical bases.
- **No unit conversion.** MGD / gal/d / null kept as filed; `null` is its own unit class.
- NODI `C` (No Discharge) rows stay null values — never 0. Missing stays missing.
- Dev windows: train 2015-01-01..2020-12-31, val 2021-01-01..2023-12-31.
  - 7-day lookback boundary: date ≥ window_start + 7 calendar days.
  - 5-trading-day label boundary: 5th WTI trading day strictly after the date ≤ window_end.

## 3. DMR key facts (all independent, recomputed from raw)

- 1722 flow rows, **identical key set to the frozen CSV** (`20260910T091DMRZ`, 0 extra/0 missing,
  0 duplicate series-dates). 880 numeric; **842 null = NODI `C` exactly** (0 other NODI).
- Units: MGD 488 · gal/d 230 · null 1004 (162 of the null-unit rows carry numeric values).
  Bases: MO AVG 861 / DAILY MX 861. 6 permits disclose flow, 12 do not.
- 32 series. Only **OK0026701 (City of Cushing South STP), outfall 001, MGD** is contiguous
  (116/116 months, 2016-12-31..2026-07-31). Second best: OK0044598 gal/d (115 obs, 2 gaps);
  OK0043320 007/008 MGD (55 obs, 59 missing months). All received dates present;
  filed publication lag median 7–17 days after period end.
- Unit-label transitions flagged, not resolved: OK0026701 2015-01..2016-11 (null) → 2016-12+ (MGD);
  OK0044598 2015-01..2017-04 (null) → 2016-11+ (gal/d, whose 2016-11-30 row reads `.008` where
  every later row reads 8000 — a factor-1e6 inconsistency kept as filed).
- Per-series verdicts and the full train/val funnel are in
  `docs/cai/execution/runs/DATA-04/RESULT.md` (this run).

## 4. SPP: terms + blocker (no sample fetched)

- `https://portal.spp.org/` and the file-browser download endpoint **timed out at TCP level**
  on every bounded attempt (5 total, 2026-09-11T10:30–10:34Z, HTTPS+HTTP, IPv4 forced,
  0 bytes). `www.spp.org` is reachable. **No bypass attempted.**
- Official terms fetched and quoted in [`spp-access-terms.json`](spp-access-terms.json):
  `https://www.spp.org/terms-conditions/` (non-commercial copy with citation permitted;
  commercial use/publication requires prior written authorization) and the linked
  *External Systems Acceptable Use Policy* (no load that harms availability; polling beyond
  basic reconciliation needs prior SPP approval). Whether the file-browser endpoint needs an
  account could not be verified because the portal host is unreachable.
- **SPP market data downloaded: 0 bytes. SPP sample SHA-256: none.**

## 5. Byte accounting

| item | bytes |
| --- | ---: |
| TMAS cumulative before this run | 370,845,364 |
| this run — SPP market data | 0 |
| **cumulative market data** | **370,845,364** (2 GiB cap: 17.27%) |
| this run — SPP terms/website documents (not market data; `/tmp` only) | 385,286 |

## 6. Checksums

- `manifest.json` pins script + 32 inputs + 8 data outputs (SHA-256, computed at run time).
  Re-verify by re-hashing each listed path; a rerun into a clean directory reproduced all
  8 outputs byte-identically (only `dmr_quality.json.generated_utc` differs).
- `spp-access-terms.json` (this folder) — SHA-256 `87b97d3385e4ac41c7c7904ae44c36c664b8028f4ba6a5a5c42a3c17053dc6d2`
  (self-contained: attempt log + quoted terms + hashes of the fetched page copies).
- This README and the DATA-04 RESULT are prose receipts; their evidence is the hashed
  artifacts above.
