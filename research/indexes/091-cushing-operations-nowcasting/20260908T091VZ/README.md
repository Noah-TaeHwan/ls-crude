# 091 CFAM — broad validation battery

## Scope and non-negotiable limitation

This battery tests the lone long public proxy—city-scale nightlight—not the unobserved state ‘Cushing is busy.’ EIA inventory is a separate physical state, not ground truth for labour, traffic, check-ins, parking or terminal throughput. A pass here would therefore be insufficient to publish a busy indicator.

## Methods run

Pearson, Spearman, Kendall; 5–95% winsor sensitivity; HAC and HC3 regressions; 6-month moving-block bootstrap; random-permutation and circular-shift nulls; leave-one-year-out stability; pre-2020/2020+ split; five-fold expanding-window Ridge cross-validation; raw-versus-seasonalized feature sensitivity; and an exploratory ±6-month shift audit. All use the frozen 2015–2023, 96-row panel and the month-end +45d availability contract.

## Results

| signal → target | r | Spearman | Kendall | HAC p | block-bootstrap 95% CI | circular p | permutation p | CV R² | early / late r | LOO range |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- | --- |
| core_control_anomaly → next_28d_inventory_change_kbbl | +0.053 | +0.096 | +0.057 | 0.419 | [-0.073, +0.188] | 0.625 | 0.607 | -0.033 | -0.039 / +0.125 | [+0.022, +0.090] |
| core_control_anomaly → next_28d_abs_weekly_change_kbbl | +0.068 | +0.150 | +0.101 | 0.327 | [-0.071, +0.258] | 0.583 | 0.501 | -0.133 | +0.232 / +0.024 | [+0.034, +0.207] |
| core_vs_control_log → next_28d_inventory_change_kbbl | +0.048 | +0.046 | +0.033 | 0.438 | [-0.069, +0.174] | 0.604 | 0.637 | -0.032 | +0.007 / +0.092 | [+0.004, +0.072] |
| core_vs_control_log → next_28d_abs_weekly_change_kbbl | +0.012 | -0.003 | -0.010 | 0.834 | [-0.105, +0.146] | 0.948 | 0.912 | -0.151 | +0.090 / +0.031 | [-0.031, +0.063] |

## Decision

**KILL as a quantitative CFAM input.** The predeclared seasonalized signal remains near zero for both targets; robust, resampling, temporal and cross-validation checks do not turn it into a stable relation. The raw radiance sensitivity may show different numbers, but it is not valid across the documented processing/seasonal change and cannot rescue the input.

**No busy indicator is emitted.** Missing a real operational ground truth is not fixed by more models. Resume only with at least two independently collected operational series (for example fixed truck counts and dated aggregate lodging/operations data) at 60+ months, then run this same locked battery against that ground truth before any EIA or market study.
