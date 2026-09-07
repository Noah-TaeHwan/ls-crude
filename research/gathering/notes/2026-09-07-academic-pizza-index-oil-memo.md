# Academic memo — Pizza-index-class signals and crude oil (WTI)

| field | value |
| --- | --- |
| date | 2026-09-07 |
| authors | Joint hunt (Academic · Finance · Research · Specialized) |
| scope | Why local-activity / attention proxies can and cannot relate to WTI |
| status | Literature-backed memo for hunt framing — not a trading claim |

## Question

Can “weird local activity → observable time series → market narrative” proxies (Pentagon Pizza Index style) inform research on WTI futures volatility or returns—without pretending we have causal alpha?

## What the pizza analogy actually licenses

1. **Activity before (or beside) official releases.** The pizza folklore is a *pattern*: abnormal local demand near a sensitive institution as a soft signal of unusual staffing/operations. It is **grey literature / media meme**, not a peer-reviewed identification strategy. Treat it as a *design metaphor*, not as validated oil alpha ([repo framing](../../docs/research-methodology.md); project Oil Slice notes in vault / `docs/experiments/000`).
2. **Observability + honesty about measurement.** Useful proxies must be (a) lawfully obtainable, (b) aggregated, (c) timestampable. Order-level food delivery near bases fails (a)–(b) in this repo’s audits (`001`, `064`–`067`).
3. **Narrative link ≠ predictive edge.** Even a real activity series may only *co-move* with news that markets already price. Choi & Varian’s Google Trends work shows search data can help *nowcast* economic statistics; it does not automatically imply tradable oil foresight (Choi & Varian, 2012, *Economic Record* — Trends as nowcasting aids).

## Where literature supports oil-relevant activity proxies

| Mechanism | Why it can touch oil | Caveats | Exemplars / sources |
| --- | --- | --- | --- |
| Chokepoint shipping | Physical crude flows concentrate at Hormuz/Bab/Suez; transit anomalies map to supply risk narratives | AIS privacy/security; aggregates start late; publish lag | IMF PortWatch methodology (Kpler/UNGP/IMF); World Bank alt-data chokepoint notebooks |
| Credit / risk appetite | HY spreads co-move with risk assets; oil often in same risk basket | Mostly **market-on-market**; pizza-unlike | ICE BofA HY OAS on FRED `BAMLH0A0HYM2` |
| Attention / Wikipedia | Public attention spikes around crises, choke points, household stress pages | Attention ≠ physical activity; as-of hard | Wikimedia Pageviews API (CC0 analytics); prior repo `049W`/`052W` tests |
| Official inventories / rigs | Direct supply statistics | Slow, revised, often already in the oil complex | EIA WPSR; Baker Hughes rig counts (manual/Excel) |
| Mobility / power | Fuel demand proxies | Confounders, seasonality, weak oil link | FHWA VMT, CTA ridership — mostly **rejected** in-repo for WTI RV |

Kilian-type oil-market shock decompositions emphasize that **not all oil price moves are the same shock** (supply vs demand vs inventory); an activity proxy must state which channel it claims (Kilian, 2009, *AER* — oil market shocks). A Hormuz transit drop is closer to a *supply-disruption narrative* than a US latte index.

## Where pizza-class ideas fail for WTI (this repo’s empirical map)

Repo empirical only unless cited:

- **No public long panel of facility-adjacent food orders** → literal pizza clone **KILL** (`ALT-20260907-06`; factors `064`–`067` audit).
- **Raw AIS going-dark** fails ethics/ToS/security → **KILL**; use aggregates (`ALT-20260907-07` → PortWatch).
- Many cute consumer indexes (iced americano, trailhead traffic, urban mobility) show **IS/OOS sign flips** on WTI RV — classic overfit / regime dependence (`factors/README.md` live scoreboard; pass count **0**).
- Wikipedia chokepoint attention (`049W`) was **strong only in OOS geopolitics**, near-zero IS → rejected as selection on a later regime ([validation note](2026-09-07-wikipedia-factor-validation.md)).

## Annotated shortlist (this run)

| ID | Class | Academic read | Decision |
| --- | --- | --- | --- |
| ALT-01 Oil Slice | News intensity | Public narrative draft; not pizza-local | KEEP |
| ALT-02 Household Panic Wiki | Attention | Weak but same-sign IS/OOS on monthly RV; still attention≠behavior | KEEP (WATCH) |
| ALT-03 PortWatch Hormuz | Shipping activity | Best pizza-*shaped* physical aggregate obtained this run | PARK (weak WTI link) |
| ALT-04 HY OAS residual | Credit | Market-on-market; sign flip → dead as RV predictor | KILL |
| ALT-05 Rig count | Supply activity | Conceptually clean; **blocked** on automated access | PARK |
| ALT-06 Food AOI | Literal pizza | Unmeasurable publicly | KILL |
| ALT-07 Raw AIS | Shipping micro | Disallowed | KILL |
| ALT-08 Watermelon reefer | Seasonal logistics | Needs key/vintage | PARK |
| ALT-09 Midnight lights | Satellite AOI | Partial source; identification fail | PARK |
| ALT-10 BDRY placebo | Shipping placebo | Designed null for ALT-03 follow-up | PARK |

## Claims discipline

- Every non-obvious external claim above is tied to a citation or labeled **repo empirical only**.
- No Sharpe/MDD invented. Numbers used for ALT-03/04 come from `research/reports/2026-09-07-joint-hunt-portwatch-hyoas.json` (repo empirical this run).
- Presentation rule: “we can *observe* Hormuz transit aggregates; we do **not** yet have a stable WTI RV relationship.”

## References (selected)

1. Choi, H., & Varian, H. (2012). Predicting the Present with Google Trends. *Economic Record*, 88(s1), 2–9.
2. Kilian, L. (2009). Not All Oil Price Shocks Are Alike. *American Economic Review*, 99(3), 1053–1069.
3. IMF PortWatch — Daily Chokepoints Data (ArcGIS FeatureServer; Hormuz `chokepoint6`); cite Kpler / UNGP / IMF per product terms.
4. Wikimedia Foundation — Pageviews REST API documentation (analytics CC0).
5. FRED — ICE BofA US High Yield Index OAS (`BAMLH0A0HYM2`).
6. LS CRUDE repo — `docs/research-methodology.md`, `docs/testing-protocol.md`, `research/factors/README.md` (pass count 0 as of 2026-09-07).
