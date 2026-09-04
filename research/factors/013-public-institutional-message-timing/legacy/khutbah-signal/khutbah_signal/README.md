# KhutbahSignal  
**Gulf Sermon Sentiment → Oil Volatility Research System**

> Research prototype that scores the escalation tone of *publicly available* Friday sermons from key Gulf states and tests whether shifts in that tone carry early information about oil market volatility.

**Status:** Research / Educational  
**Not** a live trading system. Not financial advice.

---

## Core Idea

Public Friday sermons (*khutbah*) in Saudi Arabia, Iran, UAE and related environments are often carefully calibrated.  
Sudden rises in anti-Western, anti-Israel, “oil as weapon”, or high-escalation language have historically appeared near periods of elevated tanker risk, supply threats, or politically charged oil decisions.

This system:
1. Ingests public sermon texts / transcripts
2. Scores each one on a transparent escalation scale
3. Aggregates into weekly geopolitical-tone features
4. Tests lead-lag relationships with oil realized volatility and related risk measures

---

## Project Layout

```
khutbah_signal/
├── README.md
├── requirements.txt
├── main.py                     # Full end-to-end demo
├── config/
│   └── settings.yaml
├── src/
│   ├── data/
│   │   ├── loader.py           # Sample + real-data loaders
│   │   └── oil_data.py         # Oil / vol series helpers
│   ├── nlp/
│   │   ├── keywords.py         # Auditable escalation lexicon
│   │   └── scorer.py           # Scoring engine
│   ├── signals/
│   │   └── engine.py           # Weekly aggregation + risk flags
│   ├── eval/
│   │   └── diagnostics.py      # Correlation, hit-rate, event studies
│   └── utils/
├── data/
│   ├── samples/                # Demo sermon texts
│   └── raw/                    # Place real public transcripts here
└── output/
```

---

## Quick Start (Demo)

```bash
pip install -r requirements.txt
python main.py
```

This runs the full pipeline on curated sample texts + a synthetic oil series that contains volatility regimes around high-escalation windows.  
It produces:

- Per-sermon escalation scores
- Weekly tone series + risk flags
- Correlation and forward-volatility diagnostics
- Plots and CSV outputs in `./output/`

---

## Using Real Public Data

1. Collect **only publicly released** transcripts or auto-captions from:
   - Official mosque / government religious channels
   - Public broadcasters (Al Jazeera, etc.)
   - Academic or open archives
2. Place cleaned text files or a CSV in `data/raw/`
3. Update the loader in `src/data/loader.py` to point at your files
4. Re-run. The scoring and signal engine stay the same.

**Do not** scrape private or restricted content. Respect robots.txt and platform terms.

---

## Escalation Scale (Transparent)

| Score Range | Level     | Typical Language                              |
|-------------|-----------|-----------------------------------------------|
| 0.00–0.25   | Calm      | Routine religious / social themes             |
| 0.25–0.50   | Tense     | Sanctions criticism, resistance, grievance    |
| 0.50–0.75   | Hostile   | Strong anti-Western / anti-Israel framing     |
| 0.75–1.00   | War-cry   | High-escalation / conflict-linked language    |

The lexicon is fully visible in `src/nlp/keywords.py` so every hit can be inspected.

---

## Signal Logic (Research Defaults)

- Compute weekly mean escalation score
- Flag **elevated risk** when:
  - Score is high **and** rising, or
  - Sustained hostile / war-cry levels appear
- Join with oil realized volatility and test whether elevated windows precede higher forward volatility

All thresholds are configurable.

---

## Ethical & Practical Constraints

- Public data only
- Religious speech is sensitive — treat outputs as a *narrative / geopolitical tone* indicator, not a moral judgment
- Expect high noise and regime dependence
- Always require additional confirmation (physical flows, official statements, market structure) before any real-world decision
- This code is for research and education. It is not production trading software.

---

## Extending the System

- Swap the lexicon scorer for a fine-tuned Arabic model (AraBERT, CAMeL, etc.)
- Add country-specific models or divergence features (Iran vs Saudi tone)
- Incorporate real OVX, tanker war-risk premiums, or AIS disruption flags
- Run proper walk-forward and event-study analysis on longer histories

---

## License

MIT – research and educational use.

**Disclaimer:** Past co-movement does not guarantee future predictive power. Use at your own risk.
