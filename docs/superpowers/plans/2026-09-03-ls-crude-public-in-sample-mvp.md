# LS CRUDE Public In-Sample MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing LS CRUDE dashboard buildable and safe to show as a public, read-only, in-sample-only demo.

**Architecture:** Keep the existing React Router dashboard and Python research pipeline. Fix the route boundary in place, then make the existing snapshot writer exclude all out-sample rows and news before regenerating the checked-in fallback snapshot from local seed data.

**Tech Stack:** React Router 8, TypeScript 5.9, Python 3.11+, pandas, pytest.

**Spec:** `docs/research-design.md`

## Global Constraints

- Prices remain Yahoo Finance `CL=F`; Investing.com news remains CSV-only and is never scraped.
- Candidate selection and public fallback data stop at `2023-12-31`; out-sample starts `2024-01-01` and remains unopened for selection.
- No web backtest engine, Sharpe, MDD, hit-rate, candidate promotion, gauge movement, new dependency, or Supabase auth subsystem.
- Preserve all pre-existing dirty files. Each worker owns only the files named in its task.
- No commit, push, deployment, or outreach before the later human gates.

---

### Task 1: Restore the React Router production build

**Files:**
- Modify: `app/app/routes/backtest.tsx`
- Test: production build command

**Interfaces:**
- Consumes: `readClfPriceSeedMeta(): Promise<ClfPriceSeedMeta>` from `app/app/lib/price-seed.server.ts`.
- Produces: the existing `/backtest` loader data; the component displays `loaderData.seed.relativePath` without importing a client-visible value from a `.server` module.

- [ ] **Step 1: Reproduce the route-boundary failure**

Run: `cd app && npm run build`

Expected: FAIL with `Server-only module referenced by client` for `~/lib/price-seed.server` imported by `app/routes/backtest.tsx`.

- [ ] **Step 2: Apply the minimum boundary fix**

Change the import to:

```ts
import { readClfPriceSeedMeta } from "~/lib/price-seed.server";
```

Change the displayed path to data already returned by the loader:

```tsx
{seed.relativePath}. 인샘플 {seed.inSampleStart}–{seed.inSampleEnd}.
```

- [ ] **Step 3: Verify the route**

Run: `cd app && npm run typecheck && npm run build`

Expected: both commands exit `0`.

- [ ] **Step 4: Hold for review**

Do not commit. Report the exact diff and command output to the coordinator.

### Task 2: Enforce an in-sample-only public snapshot

**Files:**
- Modify: `research/src/ls_crude/build.py`
- Create: `research/tests/test_build_snapshot.py`
- Regenerate: `app/public/baseline-snapshot.json`

**Interfaces:**
- Consumes: `_write_snapshot(panel: pd.DataFrame, news: pd.DataFrame) -> None` and `IN_SAMPLE_END` from `ls_crude.config`.
- Produces: `baseline-snapshot.json` whose `rows` all have `sample == "in"`, whose row dates are at most `2023-12-31`, and whose news dates are at most `2023-12-31`.

- [ ] **Step 1: Write the failing regression test**

Create `research/tests/test_build_snapshot.py` with:

```python
import json

import pandas as pd

from ls_crude import build


def test_public_snapshot_excludes_out_sample(tmp_path, monkeypatch) -> None:
    snapshot = tmp_path / "baseline-snapshot.json"
    monkeypatch.setattr(build, "SNAPSHOT_PATH", snapshot)
    panel = pd.DataFrame(
        {"Close": [70.0, 80.0], "sample": ["in", "out"]},
        index=pd.to_datetime(["2023-12-29", "2024-01-02"]),
    ).rename_axis("date")
    news = pd.DataFrame(
        {
            "published_at": pd.to_datetime(["2023-12-15", "2024-04-13"]),
            "title": ["in", "out"],
            "url": [None, None],
            "source": ["investing.com", "investing.com"],
            "tags": [["hormuz"], ["hormuz"]],
        }
    )

    build._write_snapshot(panel, news)

    payload = json.loads(snapshot.read_text())
    assert [row["sample"] for row in payload["rows"]] == ["in"]
    assert [row["date"] for row in payload["rows"]] == ["2023-12-29"]
    assert [item["title"] for item in payload["news"]] == ["in"]
```

- [ ] **Step 2: Verify the test fails**

Run: `cd research && .venv/bin/pytest tests/test_build_snapshot.py -q`

Expected: FAIL because the current writer includes the 2024 panel row and news item.

- [ ] **Step 3: Filter at the shared snapshot writer**

Import `IN_SAMPLE_END`, then replace the unfiltered tails with:

```python
cutoff = pd.Timestamp(IN_SAMPLE_END)
public_panel = panel.loc[(panel.index <= cutoff) & panel["sample"].eq("in")]
tail = public_panel.tail(180).reset_index()
public_news = news.loc[pd.to_datetime(news["published_at"]) <= cutoff]
news_tail = public_news.tail(40).copy()
```

- [ ] **Step 4: Verify focused and full research tests**

Run: `cd research && .venv/bin/pytest tests/test_build_snapshot.py -q`

Expected: PASS.

Run: `cd research && .venv/bin/pytest -q`

Expected: all tests PASS.

- [ ] **Step 5: Regenerate only the public fallback from local seed data**

Run from `research/` without Yahoo, FRED, or Investing.com network calls:

```bash
PYTHONPATH=src .venv/bin/python - <<'PY'
import pandas as pd
from ls_crude.build import EVENT_CALENDAR, _write_snapshot
from ls_crude.data.news import load_news_csv
from ls_crude.features.panel import build_daily_panel
from ls_crude.models.rsi_overlay import rsi_position

prices = pd.read_csv("data/clf-daily-2015-2026.csv", parse_dates=["date"]).set_index("date")
news = load_news_csv(EVENT_CALENDAR)
panel = build_daily_panel(prices.drop(columns=["sample"]), news, None)
panel["rsi_position"] = rsi_position(panel["rsi_14"])
_write_snapshot(panel, news)
PY
```

- [ ] **Step 6: Verify the generated holdout boundary**

Run:

```bash
jq '{rows:(.rows|length), samples:(.rows|map(.sample)|unique), max_row:(.rows|map(.date)|max), max_news:(.news|map(.published_at)|max)}' app/public/baseline-snapshot.json
```

Expected: `samples` is `["in"]`, `max_row <= "2023-12-31"`, and `max_news <= "2023-12-31"`.

- [ ] **Step 7: Hold for review**

Do not commit. Report the exact diff and command output to the coordinator.

### Task 3: Independent QA, security check, and Gate 2 package

**Files:**
- Review only: all Task 1 and Task 2 files
- Review only: `research/notebooks/pizza-hunt.md`

**Interfaces:**
- Consumes: Task 1 and Task 2 diffs.
- Produces: evidence-plane verdicts and a proposed Gate 2 commit set; it changes no files.

- [ ] **Step 1: Verify static and test evidence**

Run: `cd research && .venv/bin/pytest -q`

Run: `cd app && npm run typecheck && npm run build`

Expected: every command exits `0`.

- [ ] **Step 2: Verify local browser behavior using the existing Orca tab**

Check `/` and `/backtest` at `http://localhost:5173`, wait for `networkidle`, capture snapshots, and read the console.

Expected: both routes render, console has no error/warn messages, `/` shows an in-sample date no later than `2023-12-31`, and `/backtest` remains a guide rather than an engine.

- [ ] **Step 3: Verify the public read-only boundary**

Run a POST against `/backtest` and verify it returns the existing refusal. Confirm no Supabase environment file or secret is added to the diff. Treat production Supabase behavior and production E2E as `NOT_PROVEN` until a deployment target is approved.

- [ ] **Step 4: Reconcile the historical receipt without rewriting it**

Record in the review result that `research/notebooks/pizza-hunt.md` keeps its candidate table empty while separately recording rejected/non-candidate axes. Do not rewrite the completed `run_78913bd6a4a4` receipt and do not delete the rejection evidence.

- [ ] **Step 5: Prepare Gate 2**

Propose these logical commit groups without creating them:

```text
fix: 백테스트 라우트의 서버 경계를 복구
fix: 공개 스냅샷을 인샘플로 제한
```

List exact files for each group and wait for explicit commit approval.
