# FINANCE reconciliation — ALT-20260907-10/11/12/13 (IS 2015–2023, 2024+ untouched)

- author: FINANCE division, joint alt-data hunt · date: 2026-09-07
- scope: reconcile Family A vs Family B numbers only. No new tests, no new numbers, no verdict changes to cards/ledger. All correlations are 기술적 상관 + 추론 미검증 (docs/testing-protocol.md §4–6: overlapping windows, no p-value claims).
- check paths executed (read-only, no outputs written): `run_is_frozen.py --check` for all four candidates → **REPRODUCE OK × 4** (see §1 per-candidate lines).

## 1. Reconciliation table

Family A = card-referenced primary (`research/indexes/ALT-20260907-{id}/run-20260907-01/test_table.csv` + `receipt.json`, spec in `research/indexes/ALT-20260907-{id}/README.md`, code `research/notebooks/ALT-20260907-{id}/run_is.py`).
Family B = independent second opinion (`research/indexes/ALT-20260907-{id}/run-20260907-01/{results.md,summary.csv,lag_table.csv}`, code `research/notebooks/ALT-20260907-{id}/run_is_frozen.py`).
Verdict column = each family's own frozen-rule application, not a new judgment.

| cand | Family A: n / main r / placebo r / split-half / verdict | Family B: n / Pearson / Spearman / placebo / split-half / verdict | tie? |
| --- | --- | --- | --- |
| 10 COT | n=441, r=-0.1045, placebo(-0.1484, n=415), halves -0.3978/+0.0078 → PARK (`.../ALT-20260907-10/run-20260907-01/test_table.csv:2-3,15-16`; `receipt.json:10-11`; spec `.../ALT-20260907-10/README.md:19-25`) | n=440, Pearson -0.1254, Spearman -0.2301, placebo -0.1543 (n=414), halves -0.3928(neg)/+0.0142(pos) → PARK (`.../ALT-20260907-10/run-20260907-01/summary.csv:21-32`; `results.md:42-46`; `--check` REPRODUCE OK) | TIE — same sign family, both PARK on identical falsifiers (placebo ≥ main, half sign flip) |
| 11 diesel | n=468, r=-0.1840, placebo +0.0029 (n=442), halves -0.2116/-0.1737; lag -3 -0.2728 → +4 -0.0074 decay → PARK on lag-decay (`.../ALT-20260907-11/run-20260907-01/test_table.csv:2-3,7,14-16`; `receipt.json:10-11`; spec `.../ALT-20260907-11/README.md:18-26`) | n=467, Pearson -0.1623, Spearman -0.1200, placebo -0.0113 (n=441), halves -0.1896(neg)/-0.1413(neg) → frozen-rule KEEP-candidate (`.../ALT-20260907-11/run-20260907-01/summary.csv:22-33`; `results.md:34-38`; `--check` REPRODUCE OK) | **DIVERGENCE — adjudicated in §2, PARK stands** |
| 12 freight TSI | n=106, r=+0.0159, placebo -0.0754 (n=94), halves -0.1331/+0.0709 → PARK (`.../ALT-20260907-12/run-20260907-01/test_table.csv:2-3,13-14`; `receipt.json:10-11`; spec `.../ALT-20260907-12/README.md:18-24`) | n=106, Pearson -0.0394, Spearman +0.0145, placebo -0.1096 (n=94), halves -0.1176(neg)/+0.0077(pos) → PARK (`.../ALT-20260907-12/run-20260907-01/summary.csv:22-32`; `results.md:34-38`; `--check` REPRODUCE OK) | TIE (null) — sign differs only because \|r\|≈0.02–0.04 noise band; both PARK, same falsifiers |
| 13 Hormuz | n=231 (IS-partial 2019–2023), r=-0.0302, placebo +0.0406 (n=205), halves -0.1341/+0.2469, no_covid +0.1416 → PARK (`.../ALT-20260907-13/run-20260907-01/test_table.csv:2-3,4,15-16`; `receipt.json:10-11`; spec `.../ALT-20260907-13/README.md:18-24`) | n=1611 daily rows (same IS-partial window, no daily→weekly aggregation), Pearson -0.0230, Spearman +0.0792, placebo -0.0874 (n=1481), halves -0.1591(neg)/+0.2728(pos) → PARK (`.../ALT-20260907-13/run-20260907-01/summary.csv:22-33`; `results.md:36-40`; `--check` REPRODUCE OK) | TIE (null) — n differs by construction (weekly 231 vs daily 1611, `results.md:30-32` "일별 복제를 독립 표본으로 세지 않음"); both PARK |

Figures (not re-read numerically, existence only): Family A `fig_lag.png`/`fig_signal.png` (README "파일" rows); Family B `plot_series.png`/`plot_lag.png` (each `results.md` "그림" row).

## 2. Divergence adjudication — candidate 11 (the ONE known divergence)

- Family A PARK rests on lag-decay reading: predictive lags +1…+4 decay −0.1338/−0.0788/−0.0377/−0.0074 while negative lags are stronger (−0.2728 at −3) — a lagging/coincident structure, not a leading signal (`.../ALT-20260907-11/run-20260907-01/test_table.csv:6-14`; README §가정·한계·시나리오 B).
- Family B frozen-rule pass (KEEP-candidate) uses only the three-part rule (|r|≥0.10, same-sign halves, |placebo|<|r|/2) and does not score lag shape (`.../ALT-20260907-11/run-20260907-01/results.md:38`).
- Magnitude gap (−0.184 vs −0.162) is a different-WTI-input/method effect, not a contradiction: Family A `receipt.json` (wti_rows 2261, pairs 468) vs Family B local `clf-daily-2015-2026.csv` pipeline (pairs 467, 1 invalid-window + 1 end-beyond-IS exclusion, `results.md:24-30`). Same sign-magnitude family.
- **Adjudication: divergence does NOT change the PARK decision. PARK stands**, conservatively, because (a) lag-decay is a legitimate falsifier under docs/testing-protocol.md §4 lag-curve semantics (k>0 = signal leads; here predictive lags vanish); (b) the 039-gasoline base rate is pessimistic for the sibling fuel-demand path (card §1 legacy_ref; oil memo §1 path A); (c) the as-of vintage is NOT_PROVEN for DNAV current-vintage inputs, so a borderline rule-pass must not promote. Card decision PARK (`research/candidates/ALT-20260907-11.md:79-80`) unchanged.

## 3. Assumptions ledger (per tested candidate)

Common: price = Yahoo CL=F daily Close, `interval="1d", auto_adjust=True` (docs/testing-protocol.md §4); IS window 2015-01-01–2023-12-31, analysis capped 2023-12-31, 2024+ untouched (oos_exposure UNKNOWN on all four cards); nonpositive/missing-price windows excluded with before/after n reported; log-returns never applied to nonpositive prices.

| cand | price input + vintage | as-of contract | exclusions | IS window | vintage as-of-safe |
| --- | --- | --- | --- | --- | --- |
| 10 | Family B: `clf-daily-2015-2026.csv` SHA `ea70f934…` (full SHA in `.../ALT-20260907-10/run-20260907-01/results.md:23`), pre-2015 0 / post-2023 672 rows ignored; Family A: 2261–2262 WTI rows 2015-01-02–2023-12-29 (`receipt.json:3-9`; README "WTI: 2262행") | Fri 15:30 ET release → first WTI session after (card §4; README 명세) | Family B: 2 invalid-window (incl. 2020-04-20 −37.63 window) + 1 end-beyond-IS → 443→440 (`results.md:33-38`); Family A: 441 pairs (`receipt.json:10`) | full 2015–2023 | NOT_PROVEN — CFTC history treated as final, revision history unverified (card §3; `results.md:52`) |
| 11 | `WDIUPUS2w.xls` SHA `7416fa33…` (card §3 `raw_sha256`; `results.md:14`), 1856 wks, 1386 out-of-IS ignored, 0 gaps; WTI same daily file as 10 | report-week +5d → first WTI session (card §4; 074 contract) | 1 invalid-window + 1 end-beyond-IS → 469→467 (B) / 468 pairs (A) | full 2015–2023 | NOT_PROVEN — DNAV current vintage, revisions not restored (card §3; `results.md:44`) |
| 12 | `TSIFRGHT.csv` (FRED, BTS source) SHA `f23deae0…` (card §3; `results.md:14`), 318 months, 210 out-of-IS ignored; WTI same daily file | month-end +75d → first WTI session (card §4; FHWA VMT precedent) | 1 invalid-window + 1 end-beyond-IS → 108→106 (both families agree) | full 2015–2023, monthly n≈106 | NOT_PROVEN — FRED current vintage (card §3) |
| 13 | `chokepoint6_2019_2023_p00/p01.json` SHAs `fe53e558…`/`7b55e5bc…` (card §3; `results.md:14-15`), 1826 daily rows, 0 calendar gaps; WTI pre-2019 1004 + post-2023 672 ignored | obs-date +9d → first WTI session (card §4; weekly release + revision buffer) | B: 11 invalid-window + 8 end-beyond-IS → 1630→1611 daily pairs; A: 231 weekly pairs (Friday grid) | **IS-PARTIAL 2019–2023 only** — no full-IS or OOS claim (`results.md:6`; card §5 split_plan) | NOT_PROVEN — collection-time vintage, retroactive revision possible (card §3) |

## 4. Scenario / robustness notes (no verdict flips to KEEP on current evidence)

- 10-a (COVID window excluded): Family A `no_covid` r=-0.1567 n=432 (`test_table.csv:4`) — magnitude persists but placebo (−0.1484) and half sign-flip falsifiers persist → stays PARK.
- 10-b (Spearman primary): Family B rho=-0.2301 is stronger than Pearson, yet split-half flip (−0.3928/+0.0142) and placebo (−0.1543) fail the same rule → stays PARK. Tightening placebo to \|placebo\|<\|r\|/4 only fails harder.
- 11-a (COVID window excluded): Family A `no_covid` r=-0.1471 n=459 (`test_table.csv:4`) — same sign family, but predictive-lag decay is unaffected by this cut → stays PARK.
- 11-b (Spearman primary): Family B rho=-0.1200 is weaker than Pearson −0.1623 (`summary.csv:23-24`) — the frozen-rule pass gets thinner, supporting conservative PARK; and no placebo tightening flips PARK→KEEP because the binding falsifier is lag shape, not placebo.
- 12 (post-hoc lag −3): Family A lag −3 r=-0.3784 (`test_table.csv:6`) is the only eye-catching cell; adopting it post-hoc would manufacture signal — forbidden cherry-pick (protocol §2/§5), so it cannot flip PARK→KEEP. Spearman-primary (+0.0145/−0.0394) is even weaker → stays PARK.
- 13 (COVID window excluded): Family A `no_covid` r=+0.1416 n=222 (`test_table.csv:4`) flips sign vs main −0.0302 — window dependence confirms PARK; it cannot support KEEP in either sign. Cross-aggregation check (weekly −0.030 vs daily −0.023) converges on null → stays PARK.

## 5. Tested-and-null results (plain listing, no trading-edge language)

- 10 (COT money-manager): placebo (−0.15/−0.154) exceeds main in magnitude; halves flip sign (−0.40/+0.01). No evidence of a usable relationship. PARK.
- 11 (diesel demand surprise): strongest headline number (−0.18/−0.16) but predictive lags decay to ~0 with dominant reverse lags — coincident/lagging structure, consistent with sibling 039-gasoline rejection. PARK.
- 12 (freight TSI): near-zero full-sample (+0.02/−0.04, Spearman ≈+0.01), halves flip, monthly n=106. No relationship evidence; TSI contains oil/gas pipeline volume so independence fails regardless. PARK.
- 13 (Hormuz tanker): partial-sample null (−0.03/−0.02), halves flip (−0.13/+0.25), COVID-cut sign flip (+0.14). No full-IS claim permitted by construction. PARK.

## 6. Human-judgment handoffs (owner + date; from ledger + alt-data memo §6)

| item | owner | date | one-line |
| --- | --- | --- | --- |
| 16 FIRMS MAP_KEY issuance (key authority + cost) | 손성찬 (+오태환 협의) | 2026-09-12 | `ledger.csv:16` |
| 17 Guardian key issuance (authority + quota) | 손성찬 (+오태환 협의) | 2026-09-12 | `ledger.csv:17` |
| 09 gas-storage manual filename check (2 filenames 404) | 오태환 | 2026-09-12 | `ledger.csv:18` |
| 14 monthly-path docs (CAG monthly or EIA STEO degree-day alternative) | 오태환 | 2026-09-12 | `ledger.csv:13` |
| 15 history terms (OpenSky history docs + account conditions) | 오태환 | 2026-09-12 | `ledger.csv:14` |

## 7. Provenance index (every number above traces here)

- Cards: `research/candidates/ALT-20260907-10.md` (§4 construction line 49; §5 lines 63–70, 73), `-11.md` (same §§), `-12.md` (same §§), `-13.md` (same §§).
- Family A: `research/indexes/ALT-20260907-{10,11,12,13}/run-20260907-01/test_table.csv`, `receipt.json`; `research/indexes/ALT-20260907-{10..13}/README.md`; `research/notebooks/ALT-20260907-{10..13}/run_is.py`.
- Family B: `research/indexes/ALT-20260907-{10,11,12,13}/run-20260907-01/{results.md,summary.csv,lag_table.csv}`; `research/notebooks/ALT-20260907-{10..13}/run_is_frozen.py` (`--check` REPRODUCE OK × 4, 2026-09-07).
- Rules: `docs/testing-protocol.md` §4 (RV/lag semantics, exclusion rules), §5 (leakage/placebo), §6 (reporting minima).
- Context: `research/gathering/notes/2026-09-07-pizza-class-alt-data-memo.md` (§5 table, §6 shortlist); `research/gathering/notes/2026-09-07-pizza-class-oil-memo.md` (§1 paths A–D, §3 assumptions); `research/candidates/ledger.csv` (rows 10–13 decisions, rows 9/14/15/16/17 handoffs).
