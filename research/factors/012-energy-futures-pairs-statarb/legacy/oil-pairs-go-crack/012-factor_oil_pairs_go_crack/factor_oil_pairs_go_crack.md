# Factor: Oil Futures Pairs Trading – Gasoil Crack Spreads

**Factor Name:** GO-Crack Mean-Reversion  
**Asset Class:** Energy Futures (Oil)  
**Style:** Statistical Arbitrage / Pairs Trading  
**Universe:** ICE Gasoil (GO) vs ICE Brent (LCO) or NYMEX WTI (CL)  
**Frequency:** Daily  
**Horizon:** Medium-term (half-life typically 15–30 days)

---

## 1. Economic Rationale

Crack spreads (product – crude) reflect refining margins.  
Temporary imbalances arise from:

- Refinery turnarounds or outages
- Seasonal demand shifts (heating vs driving season)
- Sudden changes in crude quality or product specifications
- Geopolitical supply shocks

Physical market participants arbitrage these imbalances, causing the spread to mean-revert.  
This creates a statistical arbitrage opportunity that is largely orthogonal to outright directional oil price risk.

Empirical evidence (Alizadeh & Nomikos 2008, Cummins & Bucca 2012, and this implementation) consistently shows that spreads involving **Gasoil (GO)** exhibit some of the shortest half-lives and strongest risk-adjusted performance among energy pairs.

---

## 2. Construction

### 2.1 Candidate Spreads (short half-life)
| Spread     | Half-life (days) | Notes                          |
|------------|------------------|--------------------------------|
| LCOGO6     | ~15.6            | Strongest GO crack             |
| LCOGO1     | ~17.1            | Front-month                    |
| LCOGO3     | ~18.0            | Intermediate                   |
| CLRB1      | ~29.5            | Gasoline crack (secondary)     |

**Primary recommended leg:** `LCOGO3` or `LCOGO1` (best balance of liquidity and mean-reversion speed).

### 2.2 Spread Estimation Methods
1. **Engle-Granger** (primary)
2. **Johansen VECM**
3. **Kalman Filter** (time-varying hedge ratio)

Hedge ratio is estimated on log prices.  
Residual is tested for stationarity (ADF) and fitted to an Ornstein-Uhlenbeck process to obtain half-life, mean, and volatility.

### 2.3 Signal Generation
- Compute z-score of the residual (or use fixed threshold Z calibrated to maximize Sharpe).
- **Entry:** Residual crosses ±Z (or ±2σ for Kalman version)
- **Exit:** Residual returns to mean (or 0)
- Optional: Bertram (2010) optimal thresholds for OU process

---

## 3. Performance Snapshot (Full History, Engle-Granger)

| Spread    | Avg Annual Return | Sharpe | Max Drawdown |
|-----------|-------------------|--------|--------------|
| LCOGO1    | 6.7%              | 0.80   | -12.4%       |
| LCOGO3    | 5.6%              | 0.82   | -8.9%        |
| LCOGO6    | 5.3%              | 0.86   | -7.4%        |
| HO4GO3*   | 7.1%              | 1.12   | -4.5%        |

\*Locational (Heating Oil – Gasoil) also strong; included for reference.

**Note:** Full-history results are optimistic. Rolling 3-year estimation / 4-month out-of-sample testing produces lower but more realistic Sharpes (typically 0.4–0.7) and larger drawdowns that require risk management.

---

## 4. Implementation Notes

- Prices converted to USD/bbl where necessary and log-transformed.
- Continuous series rolled on first trading day of the month.
- Granger causality present in both directions for all short half-life pairs.
- Johansen procedure sometimes fails to find rank = 1 on the tightest cracks; Engle-Granger remains more robust.

### Recommended Risk Controls
- Transaction costs & slippage (critical)
- Volume / open interest filter
- Volatility targeting or inverse-vol weighting
- Hard stop-loss (e.g., 1.5–2× average trade loss)
- Maximum holding period

---

## 5. Future Enhancements

1. Incorporate transaction costs and liquidity constraints
2. Regime-switching or structural-break detection (RVO effects, shale, geopolitics)
3. Alternative data overlays (satellite storage, AIS floating storage, refinery runs)
4. Optimal portfolio of multiple GO cracks + selected timespreads
5. Bertram analytic thresholds + dynamic position sizing

---

## 6. References

- Alizadeh, A. & Nomikos, N. (2008). Performance of statistical arbitrage in petroleum futures markets. *Journal of Energy Markets*.
- Cummins, M. & Bucca, A. (2012). Quantitative spread trading on crude oil and refined products markets. *Quantitative Finance*.
- Lubnau, T. & Todorova, N. (2015). Trading on mean-reversion in energy futures markets. *Energy Economics*.
- Bertram, W. (2010). Analytic solutions for optimal statistical arbitrage trading. *Physica A*.
- Granger, J. (2023). Pairs Trading Strategy Design and Backtest (TS). SSRN.

---

**Status:** Research / Prototype  
**Last Updated:** 2026-09-02  
**Author:** [Your Name / Handle]

---

*This factor is part of a broader energy futures statistical arbitrage framework focusing on calendar, crack, and locational spreads.*
