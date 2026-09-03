# LS CRUDE — Factor validation share sheet

## Scope

- Price file: user-provided `clf-daily-2015-2026.csv`
- In sample: 2015-01-02~2023-12-29, 2,262 trading days
- Out sample: 2024-01-02~2026-09-02, 672 trading days
- Free-source catalog: [`../data/factor-free-source-catalog.csv`](../data/factor-free-source-catalog.csv), 20 factor rows

## Rerunnable inputs and results

| Factor | Stored signal | IS result | OOS result | Team decision |
| --- | --- | --- | --- | --- |
| 003 Trump text | Truth archive; existing strict lexical rule | n=32; mean next-5d return +1.497% | n=168; +0.375% | Effect weakens; no alpha claim |
| 004 EV displacement | IEA annual displacement | n=8; Pearson r=-0.280 | n=2; correlation undefined | Too few observations |
| 009 Iran FX | USD/IRR archive; depreciation >=2% | +0.887%p vs FX-day baseline | -0.150%p | Sign reversal; reject as trading factor |
| 010 Petroleum buffer | EIA commercial + SPR total-buffer z score | r=-0.141; tight-minus-all 20d RV -14.871%p | n=1; undefined | Raw source ends 2023, no valid OOS |
| 020 Gulf AC Panic | NASA POWER city-grid temperature retrieval script | r=-0.060 | not run | No IS relation; do not tune |

## Data readiness

| State | Factors | Meaning |
| --- | --- | --- |
| Rerunnable stored raw signal | 003, 004, 009, 010 | Raw input exists locally under `gathering/raw/`; raw dumps are intentionally gitignored. |
| Partial | 020 | Retrieval script and IS result exist; raw temperature response was not retained. |
| Source catalog only | 001, 002, 005–008, 011–018 | A reusable free-source route exists, but not a compliant, long, stored signal time series. |
| Excluded | 019 | No data collection due to privacy and eligibility constraints. |

## Bottom line

No factor has an independently reproduced 0.1% relationship across both samples. The next work is data acquisition and timestamp/vintage validation—not weighting or combining factors.
