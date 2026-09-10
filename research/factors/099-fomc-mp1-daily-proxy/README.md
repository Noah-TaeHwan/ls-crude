# 099 — FOMC MP1 daily proxy (not the 30-minute window)

**Asked:** hawkish FOMC surprise → WTI down.
**What we could run today:** SF Fed USMPD `Statements.MP1` (true 30-min construction) joined to **Yahoo daily CL=F closes**. That is not the literature window.

Source file lives on the SF Fed USMPD page. Local copy of the workbook was read 2026-09-10. Coverage through 2026-07-29.

## Battery

Join: announcement date → next session WTI log return. Cost 10bp. Short if MP1>0, long if MP1<0, skip 0.

| window | n events | MP1 vs WTI+1d r | MP1 vs WTI+5d r | 1d LS nav |
| --- | ---: | ---: | ---: | ---: |
| IS 2012–2019 | 65 | +0.015 | −0.025 | 1.06× / 38 trades / 61% |
| OOS 2020–2026-07 | 58 | +0.016 | **+0.384** | 1.60× / 39 / 59% |

Literature tight-window sign is **negative** (hawkish → oil down, ~−3% per +100bp). Daily +5d OOS is the **wrong sign**. The 1d book is small-n and not the 30-minute contract.

```
MEASUREMENT VALIDITY: FAIL for "intraday surprise"
DAILY PROXY ALPHA: NOT OPENED
STATUS: PARK — need futures ticks or the USMPD window return on CL, not the close
```

Do not promote the 1.60× OOS 1-day book. It is not 099 as specified on the wrap-up slide.
