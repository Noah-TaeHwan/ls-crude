---
name: running-sample-splits
description: Use when splitting LS CRUDE research into in-sample and out-sample, running walk-forward, or deciding whether a date may be used for model selection.
---

# Running Sample Splits

```text
in-sample  2015-01-01 .. 2023-12-31
out-sample 2024-01-01 .. last Yahoo date
```

```python
from ls_crude.data.splits import add_sample_split, split_frames
labeled = add_sample_split(prices)
in_sample, out_sample = split_frames(labeled)
```

Walk-forward, feature selection, RSI thresholds, Slice weights, and ML hyperparameters stay inside in-sample.

Open out-sample once after the candidate is frozen. Compare return, Sharpe, MDD, and hit rate against the RSI-only baseline.

If a notebook plot includes 2024-2026 while tuning, stop and cut the sample back.
