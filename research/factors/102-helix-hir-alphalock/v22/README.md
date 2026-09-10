# 102 / v22 — PROD-2TURN-HIR on the real HLX tape

Engine selftest: PASS (synthetic).  
Real DEV: **does not ADVANCE**. HOLD stays closed.  
**VERDICT: NOT_PROVEN**

## What v22 adds

Same economic rule as v21: distress at Z ≤ −1.50, then two consecutive HIR improvements, next session, 20d, HLX−OSB, 40 bp.  
Production layer: open-to-open fills, liquidity/cluster diagnostics, event t ≠ HAC t.  
No HLX–HOS splice. HOLD end 2026-04-21. M&A from 2026-04-22.

The bundled `HELIX_v22_ALL_IN_ONE.py` is not importable as-is (`from __future__` is after the header docstring). Runnable copy: `helix_v22_engine.py`.

## Real tape DEV (2012-01-03 to 2021-12-31, exit purge)

n=38 (floor 40)  
mean net **+2.65%**  
median +0.68%  
win 55%  
event Sharpe 0.14  
event t 0.86  
bootstrap 95% lo **−2.31%**  
sign-flip p 0.25  
neighbors positive **6 / 9** (need 7)

ADVANCE checks:
- n ≥ 40 FAIL
- mean > 0 PASS
- neighbors ≥ 7/9 FAIL

No `DEV_ADVANCE.seal.json`. Proof mode was not run. 2022–2026-04-21 was not opened.

## Synthetic (not proof)

Alpha world DEV n=51 mean +1.78% neighbors 9/9 ADVANCE true.  
Null world DEV n=44 mean −1.83% neighbors 0/9.  
Selftest must not emit ALPHA_PROVEN. It did not.

## Do not

- Drop the n=40 floor because 38 is close.
- Open HOLD after a failed ADVANCE.
- Call +2.65% DEV mean an alpha. The same book’s bootstrap lower bound is negative.
