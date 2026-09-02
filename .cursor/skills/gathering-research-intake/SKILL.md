---
name: gathering-research-intake
description: Use when saving AI or human research dumps, curated notes, source registry rows, pizza-hunt candidates, or promoting an experiment card for LS CRUDE.
---

# Gathering Research Intake

Read `research/INTAKE.md` before writing any research output.

```text
dump     → research/gathering/raw/          (gitignored)
note     → research/gathering/notes/        (copy notes/_TEMPLATE.md)
source   → research/gathering/sources/REGISTRY.md
pizza    → research/notebooks/pizza-hunt.md (leave table empty if none)
promote  → docs/experiments/NNN-….md        (next number after 000)
seed     → research/data/pizza/             (curated CSV only)
```

Teammate lab drops (`research/data/TTS scrapper`, `iran whale tracker`, and similar) stay under `research/data/`. Do not move them into `gathering/`.

## Rules

- Yahoo `CL=F` futures for prices. Do not scrape Investing.com.
- In-sample selection only: 2015-01-01 .. 2023-12-31.
- Do not open out-sample for choosing a candidate.
- Do not invent Sharpe, MDD, or hit-rate numbers.
- Do not commit secrets or large binaries.
- Do not write experiment cards until the note passes INTAKE checks.

## Common mistakes

- Pasting a raw dump into `docs/experiments/`
- Filling `pizza-hunt.md` without both «crypto what» and «news what»
- Treating Oil Slice as the final pizza (it is experiment `000`, kitchen draft)
