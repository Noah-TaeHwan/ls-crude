# Mosque Sermon Sentiment → Oil Volatility Signal

**Research Prototype**  
*Using publicly available Friday sermon transcripts from Gulf states as a soft geopolitical early-warning indicator for oil market volatility.*

> ⚠️ **Important Disclaimer**  
> This is an **experimental research framework**, not a live trading system.  
> It uses only publicly archived / transcribed content.  
> Real-time monitoring of religious speech raises serious ethical, legal, and platform-policy issues.  
> Do **not** deploy this for automated trading without extensive legal review, robust validation, and human oversight.  
> Past correlations do not guarantee future predictive power.

---

## Concept

Friday sermons (*khutbah*) in Saudi Arabia, Iran, UAE and other Gulf states are often carefully calibrated.  
A sudden shift in tone — especially spikes in anti-Western, anti-Israel, or “oil as weapon” rhetoric — has historically preceded:

- Heightened risk of tanker attacks or shipping disruptions in the Strait of Hormuz / Red Sea  
- Political use of oil production policy  
- Elevated war-risk insurance premiums and oil volatility (OVX)

The idea is to treat the *aggregate* public tone of major sermons as a cultural early-warning signal and test whether it has any predictive content for oil market risk.

---

## Project Structure

```
mosque_sermon_oil_signal/
├── README.md
├── requirements.txt
├── main.py                     # Full demo pipeline
├── src/
│   ├── data/
│   │   └── loader.py           # Load sample sermons + oil data
│   ├── nlp/
│   │   ├── keywords.py         # Escalation keyword lexicon (Arabic + English)
│   │   └── scorer.py           # Simple escalation score + optional transformer
│   ├── signals/
│   │   └── generator.py        # Turn scores into trading / volatility signals
│   └── utils/
│       └── metrics.py
├── data/
│   └── samples/                # Example public-style transcripts (synthetic for demo)
└── output/
```

---

## How It Works

### 1. Data Sources (Public Only)
- Official mosque YouTube channels / government religious portals (when transcripts exist)
- Al Jazeera, BBC Arabic, and other public broadcasters’ archives
- Academic collections of translated sermons
- **Never** private mosque recordings or non-public material

### 2. Escalation Scoring
We use a transparent, lexicon + simple rules approach (easy to audit):

| Level     | Description                          | Example signals                     |
|-----------|--------------------------------------|-------------------------------------|
| Calm      | Routine religious content            | Standard Friday themes              |
| Tense     | Criticism of policies / sanctions    | “Unjust sanctions”, “resistance”    |
| Hostile   | Strong anti-Western / anti-Israel    | “Crusaders”, “Zionist entity”       |
| War-cry   | Explicit calls related to conflict   | “Jihad”, “oil as weapon”, etc.      |

Arabic keyword lists are included (transliterated + Arabic script).  
You can later swap in CAMeL Tools, AraBERT, or other Arabic transformers.

### 3. Signal Logic (Demo)
- Compute weekly average escalation score across tracked sermons
- If score crosses a high threshold **and** the change is sharp → flag elevated oil-vol regime
- Compare against Brent returns, realized volatility, and (if available) OVX / war-risk proxies

---

## Quick Start

```bash
pip install -r requirements.txt
python main.py
```

This will:
1. Load sample sermon texts (synthetic but realistic style)
2. Score each sermon for escalation level
3. Aggregate weekly scores
4. Correlate with synthetic oil price / volatility series
5. Generate a simple “elevated risk” signal series
6. Save plots and a summary table to `./output/`

---

## Extending to Real Data

1. Collect publicly available transcripts or auto-generated YouTube captions (respect robots.txt and ToS).
2. Clean and normalize Arabic text (diacritics, dialect variation).
3. Replace the simple lexicon scorer with a fine-tuned Arabic classifier if desired.
4. Join with:
   - Brent / WTI continuous futures
   - OVX (oil volatility index)
   - Kpler / tanker tracking disruption metrics
   - Lloyd’s war risk premium data (where publicly obtainable)
5. Run rigorous walk-forward tests and multiple-hypothesis controls.

---

## Ethical & Practical Notes

- **Public data only.** Do not scrape private or restricted content.
- Sermons are religious speech. Treating them purely as market signals can be seen as reductive or inflammatory — handle with care in any publication.
- Predictive power is likely low and regime-dependent. Most of the time the signal will be noise.
- False positives can be costly. Always require confirmation from other geopolitical / physical indicators.
- This prototype deliberately uses transparent rules so researchers can inspect and critique every step.

---

## References & Inspiration

- Academic literature on religious rhetoric and conflict escalation
- Existing work on news sentiment and commodity volatility
- Public archives of Gulf religious discourse
- CAMeL Lab Arabic NLP tools (https://camel-lab.com)

---

## License

MIT – for research and educational purposes.

**This is not investment advice.**  
Use at your own risk. Validate thoroughly before any real-world application.
