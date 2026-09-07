**Verdict: PARTIAL**

> ID note: main `#54/#55/#56`이 ALT-01…29를 선점. PortWatch z/RV는 ALT-04, 나머지 joint-hunt는 ALT-30…38.

# 2026-09-07 Joint hunt — WTI pizza-index-class alt-data

## Review verdict

**PARTIAL (GOAL_MET for hunt process; not for a winning index).**

| Deliverable | Status |
| --- | --- |
| Academic cited memo | `research/gathering/notes/2026-09-07-academic-pizza-index-oil-memo.md` |
| ≥8 ledger rows | **10** in `research/candidates/ledger.csv` |
| Data-path candidates with assumptions + stats | ALT-03 PortWatch; ALT-04 HY OAS (KILL) |
| Plots | `research/indexes/ALT-20260907-04/20260907T064559Z/*20260907T064559Z*.png` |
| Demo script | below |
| Winning index | **None** — honest |

## Decisions this run

| ID | Decision | One-liner |
| --- | --- | --- |
| 01 Oil Slice | KEEP | Public draft baseline |
| 02 Household Panic Wiki | KEEP | WATCH only; weight 0 |
| 03 PortWatch Hormuz | PARK | Data yes; WTI RV link weak |
| 04 HY OAS residual | KILL | OOS sign flip |
| 05 Rig count | PARK | Blocked — human Excel/ToS |
| 06 Food AOI pizza | KILL | Unmeasurable |
| 07 Raw AIS | KILL | Policy |
| 08 Watermelon reefer | PARK | Needs USDA key (손성찬) |
| 09 Midnight lights | PARK | TLS/ID limits |
| 10 BDRY placebo | PARK | Not run; reserved |

## Finance reconciliation (ALT-03/04)

See JSON: `research/reports/2026-09-07-joint-hunt-portwatch-hyoas.json`.

- PortWatch coverage 2019-01-01..2026-08-30, n=2799 — **null before 2019**.
- z20 vs RV5: IS +0.088 / OOS −0.008.
- Placebo +180d IS −0.043 (does not mimic a strong effect).
- CODC residual IS +0.390 / OOS −0.297 → kill.

## Demo script (≈3 minutes)

1. **Hook (20s):** “We’re hunting Pentagon-Pizza-*shaped* traces for WTI — weird activity you can lawfully see, not a fake pizza CSV.”
2. **Map (60s):** Show `candidates/ledger.csv` — 10 rows today: 2 KEEP, 3 KILL, 5 PARK. Point at dead pizza clones (06) and AIS (07) so we don’t rediscover them.
3. **Evidence (70s):** Open PortWatch plot under `indexes/ALT-20260907-04/20260907T064559Z/`. “We *can* pull Hormuz daily transits. Linked to next-5d WTI RV: in-sample correlation about 0.09, out-of-sample about zero. So the series is real; the WTI claim is not ready.”
4. **Contrast (20s):** HY OAS residual looked good in-sample and **flipped** out-of-sample — killed on purpose.
5. **Tomorrow (20s):** Human blockers — USDA key (08), Baker Hughes Excel ToS (05), IMF redistribution (03). Still hunting; pass count on the big factor board remains 0.

## Blockers needing humans

- **손성찬:** USDA API key (08); Baker Hughes Excel license (05); IMF PortWatch redistribution email if we publish dumps.
- **오태환:** PortWatch tanker/event follow-up; midnight-lights polygons (09).
