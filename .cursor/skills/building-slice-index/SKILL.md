---
name: building-slice-index
description: Use when building the Oil Slice pizza-index analog, combining Hormuz and US inflation news intensity, or adding the alternative-data spoon to the crude baseline.
---

# Building Slice Index

Oil Slice is the one alternative spoon. It is not a price.

```text
slice_score = 2 * hormuz_count + 1 * inflation_count
slice_z     = 20-day rolling z-score
```

```python
from ls_crude.features.slice_index import oil_slice
slice_frame = oil_slice(news)
```

Hormuz is weighted higher because a chokepoint headline is the pizza-oven analog. Fed/CPI headlines are the lunch-crowd analog (demand and dollar).

Baseline model: Yahoo price + RSI only.
Extended model: baseline + Slice.

Do not retune Slice weights on out-sample dates.
