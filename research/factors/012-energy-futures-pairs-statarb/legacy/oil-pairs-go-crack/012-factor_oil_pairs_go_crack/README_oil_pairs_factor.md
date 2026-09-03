# Oil Futures Pairs Trading Factor

**Statistical Arbitrage on Energy Futures Spreads**

A mean-reversion framework applied to calendar spreads (timespreads), crack spreads, and locational spreads in the oil complex.

---

## Overview

Oil futures prices (Brent, WTI, Heating Oil, Gasoil, Gasoline, Natural Gas) reflect physical supply-demand balances. Temporary imbalances — refinery outages, seasonal demand shifts, inventory builds/draws, or geopolitical shocks — create deviations in relative prices. These deviations tend to mean-revert because physical market participants arbitrage them.

This factor exploits that mean-reversion through classic pairs trading / statistical arbitrage techniques.

**Core Idea**  
Identify cointegrated pairs → estimate the residual (spread) → trade when the residual becomes sufficiently extreme → exit when it reverts toward its mean.

---

## Factor Family

| Type              | Description                                      | Best Performing Examples          | Typical Half-life |
|-------------------|--------------------------------------------------|-----------------------------------|-------------------|
| **Timespreads**   | Same commodity, different maturities             | GO13, RB13, HO13, CL13, LCO13    | 12–30 days       |
| **Crack Spreads** | Product vs Crude                                 | LCOGO1, LCOGO3, LCOGO6, CLRB1    | 15–30 days       |
| **Locational**    | Same product, different hubs / contracts         | HO2GO1, HO4GO3, HO7GO6, CL1LCO2  | 5–30 days        |

**Key Insight from Research**  
Spreads that include **Gasoil (GO)** consistently show the shortest half-lives and strongest risk-adjusted returns.

---

## Methodology

### 1. Cointegration Testing
Three approaches are implemented and compared:

- **Engle-Granger** (primary, implemented from first principles)
- **Johansen VECM**
- **Kalman Filter** (time-varying hedge ratio)

### 2. Spread Construction
- Log prices
- Hedge ratio estimated via OLS / Johansen / Kalman
- Residual tested for stationarity (ADF)
- Fitted to Ornstein-Uhlenbeck process → half-life, mean, volatility

### 3. Trading Rules
- Enter long/short when residual crosses ±Z (or ±2σ)
- Exit when residual returns to its estimated mean
- Optional: analytic optimal thresholds (Bertram 2010)

### 4. Backtesting Approaches
- **Full-history** estimation (optimistic upper bound)
- **Rolling window** (3-year estimation → 4-month out-of-sample) — more realistic, avoids look-ahead bias

---

## Performance Summary (Full History, Engle-Granger)

| Spread     | Type       | Avg Annual Return | Sharpe | Max DD  |
|------------|------------|-------------------|--------|---------|
| HO4GO3     | Locational | 7.1%              | 1.12   | -4.5%   |
| LCOGO1     | Crack      | 6.7%              | 0.80   | -12.4%  |
| LCOGO3     | Crack      | 5.6%              | 0.82   | -8.9%   |
| HO2GO1     | Locational | 5.5%              | 0.95   | -4.0%   |
| RB112      | Timespread | 5.3%              | 0.96   | -10.0%  |
| LCOGO6     | Crack      | 5.3%              | 0.86   | -7.4%   |
| RB13       | Timespread | 4.9%              | 1.16   | -3.9%   |

> **Note**: Full-history results are optimistic. Rolling out-of-sample tests produce lower Sharpes (typically 0.4–0.7) and larger drawdowns. Transaction costs and liquidity filters further reduce performance.

---

## Implementation Stack

- Python
- Custom classes: `MyPair`, `MyOLS`, `MyVAR`, `MyKalmanFilter`
- Engle-Granger & Kalman implemented from first principles
- Johansen via `statsmodels`
- Continuous futures series (rolled on first trading day of the month)
- Data: 1989–present (Refinitiv)

---

## Risk Considerations

- Look-ahead bias (addressed via rolling estimation)
- Transaction costs & slippage (especially important on deferred contracts)
- Liquidity / volume constraints
- Structural breaks (shale revolution, COVID, 2022 geopolitics, RVO effects on Heating Oil)
- Regime changes in refining margins and inventory dynamics

**Recommended controls**: volatility targeting, stop-losses, maximum holding period, and multi-spread portfolio construction.

---

## Recommended Next Steps

1. Add realistic transaction costs and liquidity filters
2. Implement Bertram optimal entry/exit thresholds
3. Build a diversified portfolio of the top 5–8 short half-life spreads
4. Overlay alternative data (satellite storage levels, AIS floating storage, refinery runs)
5. Regime detection / structural break monitoring
6. Full walk-forward + bootstrap robustness testing

---

## References

- Alizadeh, A. & Nomikos, N. (2008). *Performance of statistical arbitrage in petroleum futures markets*
- Cummins, M. & Bucca, A. (2012). *Quantitative spread trading on crude oil and refined products markets*
- Lubnau, T. & Todorova, N. (2015). *Trading on mean-reversion in energy futures markets*
- Bertram, W. (2010). *Analytic solutions for optimal statistical arbitrage trading*
- Granger, J. (2023). *Pairs Trading Strategy Design and Backtest (TS)*. SSRN 4601806

---

**Status**: Research / Prototype  
**Last Updated**: September 2026

*This factor sits within a broader energy statistical arbitrage research framework focused on calendar, crack, and locational relationships in the oil complex.*
