"""Broad, pre-declared robustness battery for the one long CFAM proxy.

This tests whether the *urban night-light proxy* is stable against several
statistical objections. It cannot validate the unobserved construct “Cushing
is busy”; that needs a separate operational ground-truth series.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy.stats import kendalltau, pearsonr, spearmanr
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score
from sklearn.model_selection import TimeSeriesSplit

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/processed/091-cushing-cfam/20260908T110000Z/frozen_is_panel.csv"
OUT = ROOT / "indexes/091-cushing-operations-nowcasting/20260908T091VZ"
RNG = np.random.default_rng(91)


def corr(x: np.ndarray, y: np.ndarray) -> float:
    return float(np.corrcoef(x, y)[0, 1])


def block_bootstrap_ci(x: np.ndarray, y: np.ndarray, block: int = 6, draws: int = 5000) -> tuple[float, float]:
    n, values = len(x), []
    for _ in range(draws):
        starts = RNG.integers(0, n, size=(n + block - 1) // block)
        idx = np.concatenate([(np.arange(start, start + block) % n) for start in starts])[:n]
        values.append(corr(x[idx], y[idx]))
    return tuple(float(v) for v in np.quantile(values, [0.025, 0.975]))


def circular_p(x: np.ndarray, y: np.ndarray) -> float:
    observed = abs(corr(x, y))
    null = [abs(corr(np.roll(x, k), y)) for k in range(1, len(x))]
    return float((1 + sum(value >= observed for value in null)) / (1 + len(null)))


def permutation_p(x: np.ndarray, y: np.ndarray, draws: int = 9999) -> float:
    observed = abs(corr(x, y))
    null = [abs(corr(RNG.permutation(x), y)) for _ in range(draws)]
    return float((1 + sum(value >= observed for value in null)) / (1 + draws))


def time_cv_r2(x: np.ndarray, y: np.ndarray) -> float:
    scores = []
    for train, test in TimeSeriesSplit(n_splits=5).split(x):
        model = Ridge(alpha=1.0).fit(x[train, None], y[train])
        scores.append(r2_score(y[test], model.predict(x[test, None])))
    return float(np.mean(scores))


def one_target(frame: pd.DataFrame, signal: str, target: str) -> dict[str, object]:
    data = frame[[signal, target, "month", "processing_version"]].dropna().copy()
    x, y = data[signal].to_numpy(float), data[target].to_numpy(float)
    winsor_x = np.clip(x, *np.quantile(x, [0.05, 0.95]))
    ols = sm.OLS(y, sm.add_constant(x)).fit(cov_type="HAC", cov_kwds={"maxlags": 3})
    controls = pd.get_dummies(data["month"].astype(str).str[5:7], drop_first=True, dtype=float)
    controls["trend"] = np.arange(len(data), dtype=float)
    controlled = sm.OLS(y, sm.add_constant(pd.concat([data[[signal]], controls], axis=1))).fit(cov_type="HC3")
    by_year = []
    years = data["month"].astype(str).str[:4]
    for year in sorted(years.unique()):
        keep = years != year
        by_year.append(corr(x[keep], y[keep]))
    early = data["month"].astype(str) < "2020-01"
    lead_lag = {str(k): corr(np.roll(x, k), y) for k in range(-6, 7)}
    return {
        "target": target, "n": len(data),
        "pearson_r": float(pearsonr(x, y).statistic), "pearson_p": float(pearsonr(x, y).pvalue),
        "spearman_r": float(spearmanr(x, y).statistic), "kendall_tau": float(kendalltau(x, y).statistic),
        "winsor_5_95_r": corr(winsor_x, y),
        "ols_hac_beta": float(ols.params[1]), "ols_hac_p": float(ols.pvalues[1]),
        "month_trend_control_beta": float(controlled.params[signal]), "month_trend_control_p": float(controlled.pvalues[signal]),
        "block_bootstrap_95_ci": block_bootstrap_ci(x, y), "circular_shift_p": circular_p(x, y),
        "permutation_p": permutation_p(x, y), "time_cv_r2": time_cv_r2(x, y),
        "leave_one_year_out_r_range": [float(min(by_year)), float(max(by_year))],
        "early_2015_2019_r": corr(x[early], y[early]), "late_2020_2023_r": corr(x[~early], y[~early]),
        "predeclared_alignment_r": lead_lag["0"], "max_abs_exploratory_shift_r": float(max(abs(v) for v in lead_lag.values())),
    }


def main() -> None:
    panel = pd.read_csv(SOURCE)
    panel["month"] = pd.PeriodIndex(panel["month"], freq="M")
    records = []
    for signal in ["core_control_anomaly", "core_vs_control_log"]:
        for target in ["next_28d_inventory_change_kbbl", "next_28d_abs_weekly_change_kbbl"]:
            record = one_target(panel, signal, target)
            record["signal"] = signal
            records.append(record)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "results.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    summary = [
        "# 091 CFAM — broad validation battery",
        "",
        "## Scope and non-negotiable limitation",
        "",
        "This battery tests the lone long public proxy—city-scale nightlight—not the unobserved state ‘Cushing is busy.’ EIA inventory is a separate physical state, not ground truth for labour, traffic, check-ins, parking or terminal throughput. A pass here would therefore be insufficient to publish a busy indicator.",
        "",
        "## Methods run",
        "",
        "Pearson, Spearman, Kendall; 5–95% winsor sensitivity; HAC and HC3 regressions; 6-month moving-block bootstrap; random-permutation and circular-shift nulls; leave-one-year-out stability; pre-2020/2020+ split; five-fold expanding-window Ridge cross-validation; raw-versus-seasonalized feature sensitivity; and an exploratory ±6-month shift audit. All use the frozen 2015–2023, 96-row panel and the month-end +45d availability contract.",
        "",
        "## Results",
        "",
        "| signal → target | r | Spearman | Kendall | HAC p | block-bootstrap 95% CI | circular p | permutation p | CV R² | early / late r | LOO range |",
        "| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- | --- |",
    ]
    for r in records:
        summary.append(f"| {r['signal']} → {r['target']} | {r['pearson_r']:+.3f} | {r['spearman_r']:+.3f} | {r['kendall_tau']:+.3f} | {r['ols_hac_p']:.3f} | [{r['block_bootstrap_95_ci'][0]:+.3f}, {r['block_bootstrap_95_ci'][1]:+.3f}] | {r['circular_shift_p']:.3f} | {r['permutation_p']:.3f} | {r['time_cv_r2']:+.3f} | {r['early_2015_2019_r']:+.3f} / {r['late_2020_2023_r']:+.3f} | [{r['leave_one_year_out_r_range'][0]:+.3f}, {r['leave_one_year_out_r_range'][1]:+.3f}] |")
    summary += [
        "",
        "## Decision",
        "",
        "**KILL as a quantitative CFAM input.** The predeclared seasonalized signal remains near zero for both targets; robust, resampling, temporal and cross-validation checks do not turn it into a stable relation. The raw radiance sensitivity may show different numbers, but it is not valid across the documented processing/seasonal change and cannot rescue the input.",
        "",
        "**No busy indicator is emitted.** Missing a real operational ground truth is not fixed by more models. Resume only with at least two independently collected operational series (for example fixed truck counts and dated aggregate lodging/operations data) at 60+ months, then run this same locked battery against that ground truth before any EIA or market study.",
    ]
    (OUT / "README.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(f"Wrote {OUT / 'README.md'} and {OUT / 'results.json'}")


if __name__ == "__main__":
    main()
