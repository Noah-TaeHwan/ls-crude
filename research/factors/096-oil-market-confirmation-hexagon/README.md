# 096 — Oil Market Confirmation Hexagon (OMCH)

| | |
| --- | --- |
| Status | **PARK** / E1 / weight 0.0 |
| Candidate | [ALT-20260909-03](../../candidates/ALT-20260909-03.md) |
| Stamp | [20260909T096OMCHZ](../../indexes/096-omch/20260909T096OMCHZ/README.md) |
| Trading | **LOCKED** |

Not a rescue of 095. HLX/HOS is not a vertex.

Question: when WTI moves more than Brent + RBOB + ULSD + producer basket + service basket imply, does that isolation forecast the next 20 days of WTI?

\[
WIR_t = WTI_t - \widehat{WTI}_t(\text{other five, trailing 252})
\]

Primary H1, frozen: \(\gamma < 0\) in \(WTI_{t\to t+20} = \alpha + \gamma\,WIRZ_t + e\).

## Vertices

| Vertex | Series | Role |
| --- | --- | --- |
| WTI | `CL=F` | target |
| Brent | `BZ=F` | global crude |
| RBOB | `RB=F` | gasoline layer |
| ULSD | `HO=F` | distillate layer |
| UPB | equal-weight CVX XOM COP EOG OXY | producers |
| OSB | equal-weight SLB HAL RIG OII NOV | services, **ex-HOS** |

Yahoo front continuous, same calendar day. Common n=2510 (2016-09-09 → 2026-09-08). Cracks are diagnostics only, not votes.

Frozen: trailing 252 coefficients, trailing 252 z on prior residuals, \|z\| 1.5 / 2.0, primary horizon 20d. IS ≤ 2023-12-31.

## Primary result

| | IS n=1332 | OOS n=653 |
| --- | ---: | ---: |
| Full-hexagon \(\gamma\) | **+0.0108** (R² 0.066) | **−0.0001** (R² ≈ 0) |
| Brent-only \(\gamma\) | +0.0106 (R² 0.065) | −0.0005 (R² ≈ 0) |

H1 wanted \(\gamma<0\). In-sample the isolation **continues**, it does not reverse. Out of sample it is zero. Full hexagon ≈ Brent alone.

Overlapping +20d means, full model, all sample after warmup:

| WIR state | n | WTI +20d | win |
| --- | ---: | ---: | ---: |
| ≤ −2 | 55 | −4.66% | 45.5% |
| −2 to −1.5 | 29 | −1.81% | 31.0% |
| mid | 1810 | +1.30% | 53.4% |
| +1.5 to +2 | 38 | +0.67% | 34.2% |
| ≥ +2 | 53 | −2.91% | 39.6% |

Negative isolation is followed by more negative WTI (continuation). Extreme positive isolation is mixed and dies in non-overlap / OOS (OOS ≥+2: +1.85%, n=22).

Non-overlap isolation counts are too small to trade (11 / 7 / 14 / 24).

## Nested models

Adding RBOB+ULSD or UPB+OSB does not change IS R² or OOS γ versus Brent-only. The six-node story is unnecessary complexity on this battery.

## Verdict

```
MEASUREMENT VALIDITY: PASS
TIMESTAMP ALIGNMENT: PASS as same-calendar-day; session-shift not opened
FULL HEXAGON COMMON SAMPLE: 2510
PRIMARY 20D HYPOTHESIS: FAIL
POSITIVE WTI ISOLATION → REVERSAL: FAIL
NEGATIVE WTI ISOLATION → CATCH-UP: FAIL (continuation)
BRENT-ONLY BASELINE: same sign and size as full
FULL HEXAGON ADDS VALUE OVER BRENT: NO
DOWNSTREAM INFORMATION ADDS VALUE: NO
PRODUCER EQUITY INFORMATION ADDS VALUE: NO
OIL-SERVICE INFORMATION ADDS VALUE: NO
MATCHED CONTROL: not needed — primary already dead
PLACEBO BATTERY: not opened
ABLATION TEST: Full ≈ Full minus each vertex ≈ Brent
NON-OVERLAPPING EVENTS: underpowered, no rescue
INCREMENTAL OOS VALUE: FAIL
TRADING GATE: LOCKED
TRADING VALUE: NOT TESTED
FINAL STATUS: PARK
```

PARK not KILL only because the measurement is clean and a later session-aligned or contract-matched futures tape could still be run. Do not rescue with 1.3σ, 17d, ML, or putting Helix back in.

If the next cut is smaller, it is **Brent–WTI isolation alone**, not a hexagon.
