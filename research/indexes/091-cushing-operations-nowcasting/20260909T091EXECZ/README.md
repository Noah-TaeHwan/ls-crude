# 20260909T091EXECZ — 091-EXEC ledger freeze

Status on this stamp: KEEP / FORWARD_ONLY / E1.

- Card: `research/factors/091-cushing-motel-lights-index/subtracks/exec/README.md`
- Parent ledger section 1b on the 091 README
- PRs: 115 (layer created), 117 (90-day / EXE excess / physical-first targets)

Frozen rules

- Communication is not a busy-meter input.
- `ExecPressure` product forbidden before 90 forward days of rows.
- `EXE_t = Actual_30d − ExpectedScheduled_30d`. Earnings and AGM are Expected.
- Target order: truck / permit / job / lodging → EIA Cushing stocks → WTI last.
- Preferred path if it ever lives: Executive Surprise → Permit/Job → Heavy truck.
- Basket start: Plains. Then Enbridge, ONEOK.
- Sample: plains_events_20260615_20260807.csv (5 official IR/call rows). Not 90 days. No z-score.

## 2026-09-09 Plains sample (IR only)

Window: 2026-06-15 to 2026-08-07. ir.plains.com press list plus official Q2 call summaries.

- 2026-06-15 capex guidance PR — unscheduled vs quarterly calendar — capacity/expansion, no Cushing
- 2026-06-30 K-3 notice — scheduled admin — no tokens
- 2026-07-06 distribution + earnings date — scheduled — no tokens
- 2026-08-07 earnings release — scheduled — capacity/expansion
- 2026-08-07 earnings call, Willie Chiang CEO — scheduled — Cushing terminal named; capacity/throughput/expansion

Unscheduled CNBC/Bloomberg hit for Chiang in this window: none found. EXE excess in the slice is the 06-15 capex PR only. Cushing language sits on the scheduled call, so it is EXL on a baseline event, not EXE surprise.

Do not treat 5 rows as VisibilityShock. Enbridge/ONEOK not opened.

## Figures (2026-09-09 upload)

- `operator_events_20260615_20260807.csv` — Plains + first Enbridge/ONEOK official IR rows in the same window (11 rows).
- `fig_exec_timeline.png` — calendar. Gold = unscheduled vs own calendar. Orange ring = Cushing token.
- `fig_exec_tokens.png` — EXL flags. Only Plains 08-07 call has Cushing=1.
- `fig_coverage_gaps.png` — this pass vs the 90-day / Stage-1 bar.

Not drawn, and why

- 091-S live labels: zero dated human rows. Maps popular-times are time-of-day blank at Seoul noon / Cushing 03:00.
- 094 SHSI DustAOD: MERRA-2 DUEXTTAU grid needs Earthdata login and a box mean. No file, no chart. Stage 1 still unopened.
- ExecPressure / z-scores: forbidden before 90 forward days.
