# ======================================================================
# FACTOR REGISTRY -- the honest map of the proposed "OilAlpha" architecture
# ======================================================================
#
# This is the artifact that operationalizes the core critique of the
# 25/25/15/15/10/10 proposal: most of those sub-factors are not
# actually obtainable for free, and pretending otherwise by assigning
# them a weight in a formula doesn't make the data exist.
#
# STATUS values:
#   TESTED       - implemented in this factor_lab AND run through the
#                  phenomenon-testing framework (see factor_lab.py)
#   ACCESSIBLE   - free data exists and is gettable, but not yet
#                  implemented/tested here (future work, in priority order)
#   COMMERCIAL   - requires a paid data vendor (Kpler, Vortexa, Genscape,
#                  IHS, OptionMetrics, etc.) -- not viable for a personal
#                  project without a real budget
#   INFEASIBLE   - not reliably obtainable at all without building your
#                  own data pipeline (e.g. scraping + NLP + verification)
#                  that is itself a multi-month project on its own
# ======================================================================

FACTOR_REGISTRY = {
    "Geopolitical & OPEC": {
        "proposed_weight": 0.25,
        "sub_factors": {
            "OPEC production/policy": {
                "status": "ACCESSIBLE",
                "note": "OPEC monthly reports are public (opec.org MOMR), but "
                        "structured historical time series require manual "
                        "extraction from PDFs -- doable, not yet built.",
            },
            "Major conflict/supply disruption": {
                "status": "INFEASIBLE",
                "note": "No free, structured, point-in-time-dated feed of "
                        "'is there a major supply-disrupting conflict right now' "
                        "exists. This is what news-NLP factors try to approximate, "
                        "and doing it without lookahead is genuinely hard (see "
                        "'Sentiment/news' below).",
            },
            "Chokepoint risk": {
                "status": "COMMERCIAL",
                "note": "Real-time strait/chokepoint transit risk needs AIS "
                        "vessel tracking (Kpler/Vortexa/Windward tier).",
            },
            "Sanctions": {
                "status": "INFEASIBLE",
                "note": "OFAC sanctions lists are free and public, but turning "
                        "'a new oil-relevant sanction was announced' into a "
                        "dated, backtestable daily series requires manual "
                        "curation or a bespoke NLP pipeline.",
            },
            "Spare capacity": {
                "status": "ACCESSIBLE",
                "note": "EIA publishes OPEC spare capacity estimates (free, "
                        "monthly, via EIA STEO). Not yet built.",
            },
        },
    },
    "Physical Oil Market": {
        "proposed_weight": 0.25,
        "sub_factors": {
            "Tanker/Hormuz flow": {"status": "COMMERCIAL", "note": "AIS data (Kpler/Vortexa/TankerTrackers)."},
            "Storage": {
                "status": "ACCESSIBLE",
                "note": "EIA weekly petroleum status report (free, weekly, "
                        "~4-day publication lag) covers US crude storage "
                        "including Cushing. This is genuinely the most "
                        "promising 'physical' factor to build next.",
            },
            "Port congestion": {"status": "COMMERCIAL", "note": "Requires AIS + port-call data."},
            "Refinery activity": {
                "status": "ACCESSIBLE",
                "note": "EIA weekly refinery utilization rates -- free, same "
                        "report as storage above.",
            },
            "Dark fleet": {"status": "COMMERCIAL", "note": "Specialist AIS-anomaly-detection vendors only."},
            "Flaring": {"status": "COMMERCIAL", "note": "Satellite (VIIRS-derived) data, typically paid access."},
        },
    },
    "Trader Psychology": {
        "proposed_weight": 0.15,
        "sub_factors": {
            "Futures positioning": {
                "status": "TESTED",
                "note": "CFTC COT Managed Money net positioning -- built and "
                        "publication-lag-verified in cot_factor.py. This is "
                        "the ONLY sub-factor in the entire 6-bucket taxonomy "
                        "that has actually been run through a significance "
                        "test so far.",
            },
            "Options/skew": {"status": "COMMERCIAL", "note": "OVX/25-delta risk reversal needs a paid options feed for history."},
            "Volatility": {
                "status": "ACCESSIBLE",
                "note": "Realized vol from OHLC is free (already used inside "
                        "oil_v101.py's own feature set). OVX itself (implied "
                        "vol) is free on CBOE's site for recent history.",
            },
            "Sentiment/news": {
                "status": "TESTED",
                "note": "UPDATED: CNN maintains a free, public, auto-updating JSON "
                        "archive of @realDonaldTrump's Truth Social posts (no auth, "
                        "~5-min refresh) -- verified live in trump_truth_factor.py. "
                        "This was originally marked INFEASIBLE on the assumption that "
                        "no lookahead-safe free source existed; that assumption was "
                        "wrong for this specific account/journalist-maintained archive. "
                        "IMPORTANT CAVEAT: the archive's historical depth is checked "
                        "at runtime (check_archive_depth()) -- if it turns out to be a "
                        "shallow rolling window rather than years of history, this "
                        "factor can only be validated PROSPECTIVELY (paper-tracked "
                        "going forward), not backtested retroactively. Uses simple "
                        "keyword tagging on the post's own text only, specifically to "
                        "avoid the hindsight-leakage risk of LLM-scoring headlines "
                        "after the fact.",
            },
            "Momentum/chasing behavior": {
                "status": "ACCESSIBLE",
                "note": "Derivable from price alone (already partially covered "
                        "by oil_v101.py's z-score/extension features).",
            },
        },
    },
    "Cross-Commodity Relationships": {
        "proposed_weight": 0.15,
        "sub_factors": {
            "Gas/LNG": {
                "status": "TESTED",
                "note": "Natural gas (NG=F) vs. WTI relative-return divergence "
                        "-- free via the same yfinance pipeline already in use, "
                        "built and tested in factor_lab.py.",
            },
            "Power": {"status": "ACCESSIBLE", "note": "Regional power futures data exists but is fragmented/exchange-specific."},
            "Coal": {"status": "ACCESSIBLE", "note": "Free proxies exist (e.g. coal miner ETFs) but direct coal futures history is patchier."},
            "Agriculture": {"status": "ACCESSIBLE", "note": "Free via yfinance (corn, soybeans, etc.) -- the economic link to oil is the weakest of the group though."},
            "Other commodities": {"status": "ACCESSIBLE", "note": "Same as above, free but low priority."},
        },
    },
    "Major Oil Companies": {
        "proposed_weight": 0.10,
        "sub_factors": {
            "Production": {"status": "ACCESSIBLE", "note": "10-Q/10-K filings, free via SEC EDGAR, quarterly."},
            "Capex": {"status": "ACCESSIBLE", "note": "Same source, quarterly."},
            "Reserves": {"status": "ACCESSIBLE", "note": "Annual 10-K disclosures only -- very slow-moving."},
            "Refinery capacity": {"status": "ACCESSIBLE", "note": "Company filings + EIA refinery data."},
            "Strategic investment/M&A": {"status": "INFEASIBLE", "note": "No structured free feed; would need manual news curation."},
        },
    },
    "Market/Technical": {
        "proposed_weight": 0.10,
        "sub_factors": {
            "RSI": {"status": "TESTED", "note": "Already in oil_v101.py (and the RSI-during-uptrend bug found and fixed there)."},
            "Z-score": {"status": "TESTED", "note": "Already in oil_v101.py."},
            "Term structure": {"status": "ACCESSIBLE", "note": "Needs individual WTI contract-month prices, not just the CL=F continuous series -- same limitation flagged since the very first backtest engine review."},
            "Volatility": {"status": "TESTED", "note": "Already in oil_v101.py."},
            "Momentum": {"status": "TESTED", "note": "Already in oil_v101.py (ret_1/ret_5/ret_20 style features)."},
        },
    },
}


def print_registry_report() -> None:
    counts = {"TESTED": 0, "ACCESSIBLE": 0, "COMMERCIAL": 0, "INFEASIBLE": 0}
    print("=" * 78)
    print("FACTOR REGISTRY -- honest accessibility map of the proposed OilAlpha architecture")
    print("=" * 78)
    for bucket, info in FACTOR_REGISTRY.items():
        print(f"\n{bucket}  (proposed weight: {info['proposed_weight']*100:.0f}%)")
        for name, sub in info["sub_factors"].items():
            status = sub["status"]
            counts[status] += 1
            print(f"  [{status:10s}] {name}")
            print(f"               {sub['note']}")

    total = sum(counts.values())
    print("\n" + "=" * 78)
    print("SUMMARY")
    print("=" * 78)
    for status, n in counts.items():
        print(f"{status:12s}: {n:2d} / {total} sub-factors ({n/total*100:.0f}%)")
    print(
        f"\nOnly {counts['TESTED']} of {total} sub-factors in the proposed architecture "
        f"have actually been run through a significance test. "
        f"{counts['COMMERCIAL']} require paid data this project has no budget for. "
        f"{counts['INFEASIBLE']} aren't reliably gettable at all without a "
        f"multi-month NLP/scraping project of their own."
    )


if __name__ == "__main__":
    print_registry_report()
