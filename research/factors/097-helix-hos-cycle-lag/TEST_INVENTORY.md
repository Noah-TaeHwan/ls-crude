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

## G. Added 2026-09-10 — SEC quarterly revenue

CIK 0000866829 companyfacts. 33 three-month revenue points.
YoY growth → next-quarter HLX r=+0.20 n=28. Weak. Not a trade.

## H. Wall — what is left that we will not pretend to have

These exist in the world but are not free, not historical enough, or not HLX-tape:

- IHS Petrodata / Westwood marketed utilization and dayrates (weekly, paid)
- Baker Hughes NAM weekly microdata Excel (site anti-bot from this host)
- FRED graph csv (HTTP2 reset from this host)
- HLX listed-option history 2012–2026
- Full FINRA short-interest 2012–2026
- BSEE incident / shut-in well-level
- 13F holder-level time series parsed
- Insider Form 4 panel
- Private contract FIDs / Petrobras dayrate awards not in 8-K

Stopping rule used here: remaining series are paid, blocked, or n too small to WF.
That is not “no data left in the world.” It is “no more *valid free HLX-era tests* we can run without buying a terminal.”
ALPHA CANDIDATE: still NO.

## I. Same frozen gates on other tickers (2026-09-10)

Question: is the engine Helix-specific, or does it work on OII / TDW / FTI / RIG / SLB / HAL / OSB?

Frozen: G1 2-of-3, G2 OSB/OIH, G3 target 60d minus OSB ≤ −10pp (OSB uses OSB−WTI), 2-day confirm, next session, 10bp. No TP/pyramid. No 5-day drop filter.
IS = 2012–2019. OOS = 2020–2026-09-01.

| target | IS nav | IS B&H | OOS nav | OOS B&H |
| --- | ---: | ---: | ---: | ---: |
| HLX | 1.10 | 0.58 | 2.33 | 1.10 |
| OII | 0.92 | 0.32 | 1.34 | 3.44 |
| TDW | 0.28 | 0.01 | 0.79 | 4.98 |
| FTI | 1.07 | 0.41 | 1.29 | 4.91 |
| RIG | 1.23 | 0.17 | 1.43 | 0.86 |
| SLB | 1.01 | 0.57 | 1.00 | 1.42 |
| HAL | 0.68 | 0.72 | 1.13 | 1.50 |
| OSB vs WTI lag | 0.98 | 0.39 | 1.25 | 1.40 |

OII/TDW/FTI/SLB/HAL/OSB all lose to buy-and-hold out of sample.
RIG beats its own B&H because B&H RIG OOS is 0.86 — cash default again, not a new oil alpha.
HLX 2.33 here is the *looser* book (no 5-day drop). The tighter WF in WALKFORWARD.md still lost. Do not reopen HLX on this table.

Alternative oil/asset engine from this transfer: **KILL**. The rule is “sit out crashes in high-beta oil service names,” not a forecast of WTI or of a single name.
