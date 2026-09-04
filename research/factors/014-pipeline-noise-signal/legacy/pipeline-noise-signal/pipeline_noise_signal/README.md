# Pipeline Noise Signal  
**Acoustic Early-Warning Research System for Oil Pipeline Stress**

> Research prototype that monitors low-frequency acoustic / seismic energy near major crude oil pipelines and tests whether anomalous spikes carry early information about supply disruption risk.

**Status:** Research / Educational prototype  
**Not** a live trading system. Not financial advice.

---

## Concept

Major oil pipelines (Keystone, Dakota Access, Druzhba, ESPO, etc.) experience continuous mechanical stress.  
Metal fatigue, corrosion, and micro-fractures emit low-frequency acoustic energy (roughly 1–20 Hz range) that can be recorded by nearby seismic and infrasound stations operated by public networks (USGS, IRIS, EMSC, national geological surveys).

The hypothesis:  
Sustained or sudden rises in acoustic energy along critical pipeline corridors may precede operational restrictions, leaks, or shutdowns — events that can tighten physical crude balances and elevate oil volatility.

This system provides a clean research framework to:
1. Ingest (or simulate) station-level energy metrics near pipeline routes
2. Detect anomalous spikes relative to local baselines
3. Aggregate into corridor-level risk flags
4. Test lead-lag relationships with oil prices and realized volatility

---

## Project Structure

```
pipeline_noise_signal/
├── README.md
├── requirements.txt
├── main.py
├── config/settings.yaml
├── src/
│   ├── data/
│   │   ├── loader.py          # Sample + real-data loaders
│   │   └── oil_data.py
│   ├── signals/
│   │   └── engine.py          # Anomaly detection + risk flags
│   ├── eval/
│   │   └── diagnostics.py
│   └── utils/
├── data/
│   ├── samples/               # Demo acoustic series
│   └── raw/                   # Place real station extracts here
└── output/
```

---

## Quick Start

```bash
pip install -r requirements.txt
python main.py
```

The demo:
- Generates realistic synthetic acoustic-energy series for several major pipeline corridors
- Injects controlled anomaly spikes
- Detects those spikes with baseline + threshold rules
- Aligns flags with a synthetic oil series containing matching volatility regimes
- Outputs diagnostics, CSVs, and plots

---

## Real Data Path

Public networks that can be used for research:

| Network / Source              | Coverage relevance                  | Notes                          |
|-------------------------------|-------------------------------------|--------------------------------|
| USGS Seismic                  | Keystone, Dakota Access corridors   | Open waveform & catalog data   |
| IRIS (Incorporated Research Institutions for Seismology) | Global infrasound + seismic arrays | Excellent research access      |
| EMSC                          | Druzhba and European corridors      | Event and station data         |
| National geological surveys   | Country-specific pipelines          | Varies by jurisdiction         |

**Recommended workflow:**
1. Identify stations within ~50–150 km of critical pipeline segments
2. Extract continuous or high-rate energy metrics in the 1–20 Hz band (or proxy metrics such as RMS in selected bands)
3. Compute rolling baselines and anomaly scores
4. Feed cleaned daily/hourly series into this pipeline

Always respect data licenses and usage terms of each network.

---

## Signal Logic (Research Defaults)

- Maintain a rolling baseline of acoustic energy per corridor / station cluster
- Flag an **anomaly** when energy exceeds baseline by a configurable percentage (default 30%) over a short window (e.g. 48 h)
- Escalate to **high risk** when multiple corridors or multiple nodes spike together
- Primary research mapping:
  - Single-corridor spike → elevated crude / volatility attention
  - Multi-corridor or cascading spikes → stronger volatility regime flag

All thresholds live in `config/settings.yaml`.

---

## Important Limitations

- Seismic and infrasound records contain earthquakes, industrial noise, weather, and cultural noise
- Pipeline acoustic emissions are weak relative to many other sources
- Spatial resolution and station density vary dramatically by region
- Operators have far denser internal monitoring; public data is a coarse external proxy
- False positives are expected and must be filtered aggressively

This system is designed for research exploration of the *hypothesis*, not for automated trading.

---

## Ethical & Practical Notes

- Uses only publicly available scientific data
- No intrusion into private operator systems or SCADA
- Results should be treated as experimental early-warning research
- Always combine with physical flow data, official notices, and market structure before any decision

---

## License

MIT – research and educational use.

**Disclaimer:** This is an experimental framework. Anomalous acoustic energy does not equal confirmed pipeline failure. Past co-movement does not guarantee future predictive power.
