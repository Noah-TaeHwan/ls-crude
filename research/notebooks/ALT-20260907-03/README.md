# ALT-20260907-03 / 04 shared hunt notebook folder

Runnable probe (PortWatch Hormuz + FRED HY OAS vs WTI RV):

```bash
cd /Users/noah/orca/workspaces/ls-crude/hippocamp
research/.venv/bin/python research/notebooks/ALT-20260907-03/run_portwatch_hyoas_hunt.py
```

First-time env (if needed):

```bash
cd research && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

Outputs land under `gathering/raw/ALT-20260907-0{3,4}/`, `data/processed/...`, `indexes/ALT-20260907-0{3,4}/`, and `reports/2026-09-07-joint-hunt-portwatch-hyoas.json`.
