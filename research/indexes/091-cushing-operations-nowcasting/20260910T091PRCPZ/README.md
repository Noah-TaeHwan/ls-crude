# 091-PRCPZ — Cushing monthly precipitation, 2017-05..2021-11 (2026-09-10)

**What this is:** a frozen **monthly time series** of precipitation at
Cushing, Oklahoma from NOAA NCEI GHCN-Daily station `US1OKPY0019`
(`CUSHING 3.2 E`, CoCoRaHS volunteer gauge, 35.9705,-96.7057, Payne County):
disclosed monthly totals in inches per calendar month.
**A weather confounder for the Cushing desk, explicitly not activity, not
busy, never joined with WTI, never mixed with temperature.**

**What this is not:** the `CUH`/`KCUH` airport ASOS series (IEM `OK_ASOS`
precip is too sparse: 0 complete months 2015–2026, see raw README), a busy
score, a worker/truck count, tank levels, or a trading signal. Rain moves
the field but does not measure it. Never relabel as busy.

| Field | Value |
| --- | --- |
| Retrieved | 2026-09-09T17:33:30Z (NCEI bulk `.dly`; frozen here 2026-09-10) |
| Source | NOAA NCEI GHCN-Daily `PRCP` (tenths of mm), keyless bulk `.dly` |
| Station | `US1OKPY0019` CUSHING 3.2 E, OK — nearest dated Cushing-town gauge with complete months; **not** CUH airport ASOS |
| Not stitched | long-record `USC00342318` CUSHING COOP ends 2013; `US1OKPY0008` (2011–2018) not merged — one gauge, one series |
| Raw | `research/gathering/raw/091-prcp-monthly/` (gitignored data + kept README) |
| Range | 2017-05 through 2021-11, **55** months: **47** disclosed, **8** missing |
| Missing rule | month disclosed only if every calendar day carries a PRCP value; partial months stay `null` / empty cell, never 0 |
| Unit | `precip_in = round(monthly tenths-of-mm / 254, 3)`; `0.000` means observed zero, never filled |
| Observed dry | **2021-09 = 0.000** (30/30 days present incl. 3 trace flags) stays disclosed |
| Trace | 42 trace days (`mflag T`, value 0) inside disclosed months add 0 to sums — no coercion issue at monthly granularity |
| QC | `qflag` blank on every disclosed daily value |
| Tenths checksum | monthly tenths-of-mm sum **44838**; disclosed thousandths-of-in sum **176524** (see `receipt.json`) |

The reader is `app/app/lib/cushing-precip.ts`; it fails closed on swapped
station, reordered/redated periods, filled zeros, extra months past 2021-11,
edited values, a busy-score relabel, or a WTI mix-in.
