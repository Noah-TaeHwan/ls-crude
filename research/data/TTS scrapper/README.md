# Factor Lab — the honest upgrade to the OilAlpha proposal

## What this is NOT

This is **not** an implementation of the 25/25/15/15/10/10 six-bucket,
~30-parameter architecture from the OilAlpha proposal. That architecture
was rejected on stone-cold review for three fatal reasons:

1. Most of its sub-factors (tanker AIS, dark fleet, options skew, port
   congestion, capex/M&A) require paid commercial data this project has
   no budget for, or aren't reliably gettable from any source at all.
2. ~30 free weights cannot be honestly fit to a sample where the
   underlying strategy's own evidence (18 STRICT signals over a decade,
   100% of profit from 5 trades) suggests single-digit independent
   "oil regime events" to learn from.
3. Every new data source reintroduces the same publication-lag /
   lookahead risk already found and fixed three times over in this
   project (same-bar entry, same-bar exit, RSI-during-uptrend) — and
   the proposal didn't account for any of that.

## What this IS

A bottom-up **factor validation lab**: an honest map of what's actually
accessible (`factor_registry.py`), real implementations of the ~3
sub-factors that are both free and lookahead-auditable, and a unified
test runner that only lets a factor into a combined model if it clears
a **pre-registered pass bar** — declared before any result is computed,
so it can't be quietly loosened after seeing the numbers.

## Files

- `factor_registry.py` — run this first. Prints every sub-factor from
  the original 6-bucket proposal, tagged TESTED / ACCESSIBLE (free but
  not yet built) / COMMERCIAL (needs paid data) / INFEASIBLE (no
  reliable free source exists). Only 6 of 31 sub-factors are currently
  TESTED; that's the honest starting point.
- `cot_factor.py` — CFTC Managed Money positioning (carried over from
  the earlier work, already publication-lag-verified).
- `natgas_factor.py` — new: natural gas vs. WTI relative-return
  divergence (the "Gas/LNG" cross-commodity sub-factor). No separate
  publication lag needed (same-day market prices), but goes through the
  same one-bar-lag treatment as everything else in the test runner.
- `gpr_factor.py` — new: Caldara & Iacoviello Geopolitical Risk index.
  Free, monthly, with a real ~10-day publication lag handled explicitly.
  **Column-name parsing is defensive, not verified live** (this sandbox
  couldn't reach matteoiacoviello.com) — the first real run prints the
  parsed columns so you can sanity-check them immediately.
- `trump_truth_factor.py` — new: Trump's Truth Social posts, via CNN's
  free, public, auto-updating JSON archive (verified live from this
  sandbox — real posts, real timestamps, oil-relevant content already
  visible in the sample). This upgraded "Sentiment/news" in the registry
  from INFEASIBLE to TESTED. **Important**: the archive's historical
  depth is checked at runtime — if it's a shallow rolling window (which
  is what was actually observed live: ~7 days), the factor is
  automatically excluded from historical testing and flagged as
  prospective-only, rather than silently running a meaningless test on
  too little data.
- `factor_lab.py` — the driver. Fetches WTI, merges all three factors,
  and runs each through the same Welch t-test + permutation test
  machinery already used in `oil_v101.py`. **Pre-registered pass bar**:
  p<0.05 at the 5-day horizon (matching the strategy's actual holding
  period) AND consistent effect sign across at least 3 of 5 horizons.
- `combine_factors.py` — equal-weight z-score averaging of ONLY the
  factors that passed. Deliberately not a fitted regression — see the
  module docstring for why.

## How to run it for real

```bash
pip install yfinance pandas numpy scipy requests openpyxl xlrd
python factor_lab.py
```

This will:
1. Print the full honest registry (what's tested vs. aspirational).
2. Fetch real WTI, COT, natural gas, and GPR data.
3. Run every factor through the phenomenon test.
4. Tell you exactly which factors (if any) cleared the bar.

**I could not run this against live data myself** — this sandbox has no
network access to Yahoo Finance, the CFTC API, or matteoiacoviello.com.
Everything above was verified with synthetic data engineered to exercise
each piece of logic (publication lag, merge correctness, pass-bar
arithmetic) — not with real market data. Run it yourself and see what
actually clears the bar before trusting any specific verdict.

## What to do with the result

- If **nothing** passes: that's a real, informative result. It means
  none of geopolitics-proxy, cross-commodity divergence, or positioning
  extremes (at least in the simple forms tested here) add anything
  beyond what the existing RSI/Z-score/SPY/VIX signal already captures.
  Don't force a factor into the model because the story sounds good.
- If **one or two** pass: combine them via `combine_factors.py`
  (equal-weight), then re-run the full `oil_v101.py` pipeline with the
  composite score as an additional AND condition — remembering to bump
  the Deflated Sharpe Ratio's `n_trials` count for having tested this
  many new variants.
- If you want to extend the registry further, `factor_registry.py`
  already tells you the next-best free targets: EIA weekly storage/
  refinery data (Physical Oil Market bucket) is the most promising
  thing not yet built.
