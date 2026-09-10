# opencode worker — wire 091-P enrollment + KUSH charts on the Cushing board

Read first: `research/programs/cushing-busy/loop-contract.md` then `loop-lessons.md` then `PROGRAM.md` then the two freeze folders.

## Outcome
Attach **two time-series charts** on the existing Cushing dated-context board. Keep every chart already on the page.

1. Cushing High School annual enrollment from `20260910T091PENRZ` / `readCushingEnrollment`. Keep 2023-24 as a gap (omit the year; never 0). Last disclosed year 2024-25 = 529. Checksum of five totals = 2532.
2. KUSH monthly operational-attention from `20260910T091KUSHZ` / `readKushMonthly` (export name is `readKushMonthly`, not readCushingKush). Zeros stay zeros. n=221, sum=101, last 2026-06-01 = 1. Not busy.

Verdict stays INSUFFICIENT. No 0–100 score. No WTI overlay. No invented r/R².

## Own these files only
- `app/app/components/cushing-observation.tsx`
- `app/app/routes/cushing-busy-board.json`
- `app/public/cushing-busy-board.json`
- `research/programs/cushing-busy/board.py`
- `research/programs/cushing-busy/snapshot.json`
- `research/programs/cushing-busy/PROGRAM.md` (add the two lanes as dated context, not activity)
- `app/tests/cushing-context.test.mjs` (import checksums only)
- `app/tests/deployment-cwd.test.mjs` (assert new chart ids + last values + keep existing QCEW/EIA assertions)

Do not edit enrollment/kush/qcew reader files. Do not commit. Do not remove existing ResearchChart ids: `cushing-stocks-plot`, `cushing-monthly-stocks-plot`, `cushing-aadt-plot`, `cushing-bps-plot`, `cushing-qcew-quarterly-plot`, `cushing-qcew-mining-plot`.

## Pattern
Mirror QCEW wiring in `cushing-observation.tsx`:
- `import enrollInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091PENRZ/cushing_hs_enrollment.json"`
- `import kushInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091KUSHZ/kush_operational_attention_monthly.json"`
- `readCushingEnrollment` from `~/lib/cushing-enrollment`
- `readKushMonthly` from `~/lib/cushing-kush`
- Chart ids: `cushing-enrollment-plot`, `cushing-kush-plot`
- Enrollment dates: map school year `YYYY-YY` to `${YYYY}-07-01`. Do not insert 2023-24.
- Enrollment axis 0–600, unit 명. KUSH axis 0–3, unit 건.
- Copy: 재적은 학교 인원, 바쁨 아님. KUSH는 제목 관심, 현장 인원 아님. 2023-24 재적은 결측.

Board JSON: add `091-P` (annual school enrollment) and `091-KUSH` (monthly attention) under `physical_context`. Do not move them into activity.

`deployment-cwd.test.mjs` Cushing page must still contain `35,001명`, `아직 판단할 수 없습니다`, and must not contain `현장 바쁨 점수`. Also match `cushing-enrollment-plot`, `cushing-kush-plot`, `529`, and a Korean note that 2023-24 is missing.

## Acceptance
`cd app && node --test tests/cushing-enrollment.test.mjs tests/cushing-kush.test.mjs tests/cushing-context.test.mjs` and `npm run typecheck` pass.

## Do not ask the human
Use `orca orchestration ask`.

When done:
`orca orchestration send --type worker_done --subject "wired 091-P series" --body "<3 sentences>" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --outcome succeeded|failed --files-modified "<paths>" --json`
Then idle.
