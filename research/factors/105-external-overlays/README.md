# 105 — Where the Helix tape can sit on someone else's book

We do not donate +3.85% DEV means. We donate three constraints that free Yahoo/public repos usually omit.

1. Well-intervention is oil-service beta, not an oil-gap trade.
2. Daily residual half-life versus the closest twin is ~0.2 sessions.
3. If you already hold the name, hedge with OII (104). Do not enter on Z.

## Overlay A — USO vs XLE stat-arb

Repo: https://github.com/ianchanhy/Black-Gold-StatArbitrage-Engine  
Claim there: USO–XLE spread mean-reverts; z-score pair.

What we add:
- Replace or supplement XLE with an **ex-producer service basket** if the object is OFS. XLE is upstream-heavy.
- Do **not** swap XLE for HLX. 103 residual vs OII is white noise at daily frequency.
- Report half-life before advertising z=2 entries. Our HLX–OII half-life fails that test.

Patch sentence to drop in their README:

> Single-name well-intervention (historical HLX) comoves with oil services but its daily residual versus OII has half-life ≈ 0.2d and does not clear a 20-session costed pair book. Keep the pair at the ETF layer.

## Overlay B — equity-alpha → commodity futures

Repo: https://github.com/diegodalvarez/CommodityEquityAlpha  
File they already have: `3OilServices.ipynb`  
Claim there: oil-service equity residual leads the commodity.

What we add:
- Use OSB / OIH, not HLX, as the equity leg. 102 HIR versus OSB did not lead WTI.
- After 2026-09-01 do not splice HOS onto an HLX residual.
- If their notebook shows a lead, rerun with our frozen HOLD end 2026-04-21 and 40 bp. If it dies, their lead was the same in-sample curve we killed in 097.

## Overlay C — equity–oil minimum-variance hedge

Papers: Kuang (Energy, 2022; 2023) hedge equities with crude.  
Free implementation: our 104.

What we add:
- For an OFS / well-intervention sleeve, the cheaper hedge is **OII**, not CL=F. HLX–WTI correlation is much weaker than HLX–OII.
- Gate on volatility cut, not on sleeve Sharpe. HOLD 2022–2026-04-21: vol 50.9% → 37.8%.

## Do not overlay

- Geman–Chang–Liu *Quant. Finance* oil-company **intraday** pairs. We have no minute tape. Daily half-life does not speak to their horizon.
- QuantConnect `GasAndCrudeOilEnergyCorrelationAlpha` (UNG leads USO). Our gas desk Stage 1 did not find that lead; we also should not paste Helix into a gas–oil ETF pair.
- Crack / Brent–WTI engines. Different market.

## Status

```
MAP only
No new trade
```
