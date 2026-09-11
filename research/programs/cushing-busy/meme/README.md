# CFAM meme nowcast (not alpha)

Free public series only. Not a trade. Not 091-B night lights. Not a 0–100 that predicts WTI.

\[
\text{score}=
0.4\cdot q(\text{wiki 7d})+
0.4\cdot q(|\Delta \text{Cushing stocks}|_{52w})+
0.2\cdot(100-q(\text{stock level}_{5y}))
\]

- Wikipedia daily views, page `Cushing, Oklahoma`
- EIA weekly Cushing stocks excluding SPR (`W_EPC0_SAX_YCUOK_MBBL`)
- \(q\) = percentile in the window above

| now (2026-09-11) | |
| --- | --- |
| score | **37.5 quiet** |
| wiki 7d | 66 views, 12th pctile (little attention) |
| EIA week | 2026-09-04, 21,824 kbbl, |Δ| 684, 39th pctile |
| tightness | 87th pctile (tanks lower than most of 5y) |

Tanks look somewhat light. Field-attention and weekly pipe move do not. The old line still holds: the field can look quiet while tanks are not full.

![score](score.png)
![inputs](inputs.png)

Do not feed this into a WTI model. If 091 later gets truck/hotel panels, replace the wiki leg.
