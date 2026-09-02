---
name: building-slice-index
description: Use when building Oil Slice, combining Hormuz and US inflation news intensity, or adding the alternative-data candidate to the crude baseline.
---

# Building Slice Index

Oil Slice is the alternative-data candidate already in the repo. It is not a price.

```text
slice_score = 2 * hormuz_count + 1 * inflation_count
slice_z     = 20-day rolling z-score
```

```python
from ls_crude.features.slice_index import oil_slice
slice_frame = oil_slice(news)
```

Hormuz is weighted higher because a chokepoint headline is closer to a supply shock. Fed/CPI headlines are demand and dollar.

Baseline model: Yahoo price + RSI only.
Extended model: baseline + Slice.

Do not retune Slice weights on out-sample dates.

Oil Slice is the public-signal draft (`docs/experiments/000-…`). New candidates follow `research/INTAKE.md`; do not promote a web dump straight into this formula.
