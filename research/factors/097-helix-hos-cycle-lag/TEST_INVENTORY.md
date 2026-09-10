# 097 — What was collected, what was tested, what was not

Stamp: 20260910T097INVZ. Universe still HLX 2012-01-03 → 2026-09-01. HOS out.

This is an inventory, not a new alpha claim.

## A. Data actually sitting in the repo

| file | what |
| --- | --- |
| `indexes/.../20260910T097DEEPZ/panel_daily.csv` | Yahoo daily: HLX WTI BRENT OIH VIX SPY SLB HAL NOV RIG OII TDW FTI BKR WFRD XOM CVX COP + HLX volume |
| `factors/097-.../figures/*.png` | 8 charts on the factor README |
| `WALKFORWARD.md` | frozen 3-gate engine vs B&H / OSB, 10bp |
| `DEEP_LOG.md` | corr, gap IC, volume z, crash bounce, beta |
| `signals/SIGNALS.md` | 21 in-sample episodes from source repo |
| `screen/factor_screen.csv` | same-day vs fwd20 ICs from helix-factor-screen |

## B. Tests already run (and result)

| # | hypothesis | window | result |
| --- | --- | --- | --- |
| 1 | WTI leads HLX or HLX leads WTI | IS/OOS | FAIL. Same-day only. |
| 2 | OHD residual catch-up is Helix-specific vs SLB/HAL/OIH | earlier 095 | FAIL. Peer-like. Deleted as 095. |
| 3 | G1 oil + G2 OSB + G3 60d lag, 2-day confirm | WF 2020–2026-09-01 | FAIL. 0.45× vs B&H 1.10×. |
| 4 | same + TP15/SL15/pyramid | WF OOS | FAIL. 0.72× vs B&H 1.10×. |
| 5 | drop 2021–22 from the book | full | FAIL. Edge was those years. |
| 6 | G3 removed (G1+G2 only) | WF | same as raw gates. G3 adds 0. |
| 7 | oil-up + deep lag as a buy rule | 8 tight events | FAIL. 60d hit 25%, avg −19.5%. |
| 8 | same-day energy IC → HLX +20d | screen CSV | FAIL as forecast. |
| 9 | gap60 vs OSB/OII/TDW/OIH → +20d raw | nonoverlap | OOS raw r ≈ −0.31 to −0.34. Looks like catch-up. |
| 10 | same gap → +20d *excess* vs that peer | nonoverlap | weaker / two corner points on scatter. Not a rule. |
| 11 | volume z≥2 → +5/+20 excess vs OSB | IS/OOS | OOS ~0, hit ~46–53%. FAIL. |
| 12 | HLX day ≤−5% or −8% bounce vs OSB | IS/OOS | OOS hit ≤48%. FAIL. |
| 13 | rolling beta HLX on OSB | IS 1.21 / OOS 0.96 | description, not a signal. |
| 14 | same-day corr map | IS/OOS | OIH 0.79 OOS. HLX is oil-service beta. |

## C. Added 2026-09-10 afternoon

| # | hypothesis | result |
| --- | --- | --- |
| 15 | North Sea / weather seasonality (MJJAS vs NDJFM excess vs OSB) | IS both ~0. OOS summer +0.055%/day, winter −0.075%/day, hit 51% both. Too thin to trade. |
| 16 | calendar month excess | no month repeats IS and OOS with the same sign and a usable hit rate. January weak both samples, nothing else. |
| 17 | 2026-04-22 merger-announce event | +5d +4.8%, +20d +6.0%. One event. Not a series. Pre-60d was already +22%. |

## D. Looked up, not turned into a long panel

| source | what we know | why not a daily factor |
| --- | --- | --- |
| Helix 10-Q / calls | WI utilization Q2’26 91% vs 72% y/y. Backlog ~$1.1bn standalone, ~$2.0bn PF with Hornbeck. Dayrate WI ~$300k+ effective. | Quarterly. 8–12 points a year. Cannot WF a 3-gate rule on it. |
| Hornbeck 8-K combo deck | 85 vessels, PF EBITDA $551mm, net debt 0.4x. Segment util / dayrate table 1Q23–2Q26. | That table is **HOS + HLX mix after the deal**. Out of HLX-only universe. |
| Baker Hughes | US offshore rigs exist weekly. Public archive is Excel on bakerhughesrigcount, not a clean API here. | Not ingested this pass. Next if we open a *rig* factor, not 097 equity alpha. |
| FINRA / Fintel short interest | HLX short ~3–5% of float, days-to-cover ~2–4. Not a squeeze tape. | Biweekly, short history scraped, not a 2012–2026 panel. |
| Options | IV rank low in one 2026 snapshot. Put/call not a history. | No free 15y HLX option tape. |
| BSEE shut-ins / NOAA storms | relevant to GoM vessels | not wired. Separate weather-ops factor. |
| 13F / insider Form 4 | exists on SEC | not parsed. |

## E. Still not alpha

The only number that still looks like a sentence is **#9/#10**: when HLX has already lagged OSB for 60 days, the next 20 days of *raw* HLX tend to be higher in 2020–26. The scatter is two corners plus a blob at zero. After you subtract OSB, after you skip 2021–22, after you add 10bp, the engine that tried to trade that sentence is dead.

```
ALPHA CANDIDATE: NO
LIVE ENGINE: KILL
NEXT DATA WORTH INGESTING (not 097 alpha): quarterly WI utilization, US offshore BH rigs
```

## F. Added 2026-09-10 — quarterly WI utilization

Source: Hornbeck 8-K combo deck, Helix Well Intervention active-fleet utilization and dayrate 1Q23–2Q26 (14 quarters). File: `indexes/097-.../20260910T097UTILZ/wi_utilization_quarterly.csv`.

| test | r | n |
| --- | ---: | ---: |
| util_t → HLX log return t+1 | −0.07 | 12 |
| same-quarter util vs HLX | +0.16 | 13 |

FRED drilling IP / oil-gas payrolls: download blocked from this host (HTTP2). Baker Hughes weekly offshore: no clean public CSV ingested. Still not alpha.
