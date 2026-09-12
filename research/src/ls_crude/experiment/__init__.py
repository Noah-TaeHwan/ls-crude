"""CAI experiment program (spec, data, models, runner, CLI).

Single entry point: ``python -m ls_crude.experiment.cli`` (validate/demo/run/status).
Reuses the existing research environment (pandas/sklearn/scipy) and IS/OS rules
from ``ls_crude.config``. The final out-of-sample period is never used here.
"""

from __future__ import annotations

PROGRAM_VERSION = "cai-exp/0.1.0"

__all__ = ["PROGRAM_VERSION"]
