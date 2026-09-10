# 094 Stage 1 proxy — 20260910T094S1Z

MERRA-2 `DUEXTTAU` MDR box still requires Earthdata. This pass used a **labeled proxy**, not SHSI.

## Proxy (not the registered input)

- NASA AERONET v3 Level 2.0 daily AOD, site `Capo_Verde` (16.73N, 22.94W) — eastern edge of the registered box.
- Band: first available of 500 / 675 / 440 / 870 nm.
- Season: Jun 1–Nov 30.
- `DustShock` = (AOD − DOY mean) / DOY sd, climatology frozen on **1999–2009** season days only.
- Target: count of HURDAT2 Atlantic genesis dates in t+1..t+7.
- Weeks non-overlapping (~7 calendar days).

This is **not** mean(DUEXTTAU, 10N–25N, 20W–60W). A point photometer can miss a plume that still fills the MDR, and total AOD is not dust-only.

## Result

Hypothesis: higher shock → fewer genesis (r < 0).

| split | r | n weeks | genesis hits in those windows |
| --- | ---: | ---: | ---: |
| discovery 1999–2009 | **+0.026** | 234 | 147 |
| validation 2010–2015 | −0.099 | 108 | 51 |
| OOS 2016–2024 | **+0.015** | 140 | 86 |

Weekly genesis rate, z≥1 vs z≤−1:

| split | high-dust weeks | low-dust weeks |
| --- | --- | --- |
| disc | 0.65 / 52 | 0.70 / 46 |
| val | 0.57 / 14 | 0.45 / 38 |
| oos | 0.56 / 25 | 0.53 / 32 |

No stable suppression. Discovery and OOS are ~0. Validation is the only negative and is small.

```
STAGE 1 PROXY: FAIL
REGISTERED STAGE 1 (MERRA MDR): UNOPENED
CL / CRACK: LOCKED
STATUS: PARK / E1
```

Do not promote a Cape Verde AOD trading rule. Do not kill 094-as-written until the registered grid is tested once.
