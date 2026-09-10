# 102 / v23 — capped-episode 2TURN (DEV only)

Allowed move A. HOLD sealed. Engine has no proof mode.

Change vs v22: after Z ≤ −1.50, two-turn confirmation must arrive within **10 sessions** or the episode is abandoned.

## Selftest
PASS. Synthetic ADVANCE true. Cannot emit ALPHA_PROVEN.

## Real DEV (baseline OSB = SLB HAL NOV RIG OII)

| | v22 | v23 cap=10 |
| --- | ---: | ---: |
| n | 38 | **37** |
| mean net | +2.65% | **+3.85%** |
| boot lo | −2.31% | **−1.24%** |
| sign-flip p | 0.25 | 0.12 |
| neighbors + | 6/9 | **6/9** |
| ADVANCE | false | false |

Neighbor means (%):

| z \ h | 15 | 20 | 25 |
| --- | ---: | ---: | ---: |
| −1.2 | −2.19 | +2.15 | +2.75 |
| −1.5 | −2.94 | +3.85 | +3.16 |
| −1.8 | −4.96 | +3.44 | +2.59 |

15-day column still kills the 7/9 floor. n still under 40.
No seal written.

```
NOT_PROVEN — DEV move documented, HOLD still sealed
```

Next allowed move later: C open-to-open on the v22/v23 baseline panel. Not another cap. Not HOLD.
