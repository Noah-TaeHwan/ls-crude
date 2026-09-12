"""TMAS AVC040 descriptive statistics + dev-period row-count accounting (EXP-03).

Observation reporting only: no CAI score, no model, no zero-filling.
Charts and tables go to research/indexes/091-cai-exp/<UTC>/.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

REPO = Path("/Users/noah/orca/ls-crude")
T1 = REPO / "research/indexes/091-tmas/20260911T075705Z"
T3 = REPO / "research/indexes/091-tmas/20260911T082500Z"
WTI = REPO / "research/data/clf-daily-2015-2026.csv"
RUN = REPO / "research/indexes/091-cai-exp" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
RUN.mkdir(parents=True, exist_ok=True)

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

daily_frames = [pd.read_csv(T1 / "avc040_mar2016_daily.csv"), pd.read_csv(T3 / "avc040_mar2020_daily.csv")]
hourly_frames = [pd.read_csv(T3 / f"avc040_{m}2023_hourly.csv") for m in MONTHS]
hourly_frames.append(pd.read_csv(T3 / "avc040_mar2020_hourly.csv"))
daily_frames += [pd.read_csv(T3 / f"avc040_{m}2023_daily.csv") for m in MONTHS]

daily = pd.concat(daily_frames, ignore_index=True)
hourly = pd.concat(hourly_frames, ignore_index=True)
daily["date"] = pd.to_datetime(daily["date"])
hourly["date"] = pd.to_datetime(hourly["date"])

wti = pd.read_csv(WTI, parse_dates=["date"])
wti = wti[wti["date"] <= "2023-12-31"].sort_values("date")
wti_days = pd.DatetimeIndex(wti["date"])

# One lane per direction in every file; total = sum of directions (lanes never double-counted).
lane_check = daily.groupby(["station_id", "date", "direction"])["lane"].nunique()
assert (lane_check == 1).all(), "lane multiplicity detected"

totals = daily.groupby(["date", "direction"])["day_total_veh"].sum().unstack("direction").sort_index()
totals.columns = [str(column) for column in totals.columns]
totals["total"] = totals.sum(axis=1)
present = pd.DatetimeIndex(totals.index)


def _counts(period_start: str, period_end: str, train: bool) -> dict:
    mask = (present >= period_start) & (present <= period_end)
    rows = present[mask]
    overlap = rows.intersection(wti_days)
    # lag 1 trading day: value available on the next trading day after observation
    lag1 = 0
    for date in overlap:
        pos = wti_days.searchsorted(date)
        if pos + 1 < len(wti_days) and wti_days[pos + 1] <= pd.Timestamp(period_end):
            lag1 += 1
    # label validity: t+5 trading days must exist inside the IS frame
    last_pos = len(wti_days) - 1
    label_valid = sum(1 for date in overlap if wti_days.searchsorted(date) + 5 <= last_pos)
    if train:
        last_train = wti_days.searchsorted(pd.Timestamp("2020-12-31"), side="right") - 1
        label_valid = sum(1 for date in overlap if wti_days.searchsorted(date) + 5 <= last_train)
    return {
        "calendar_days_present": int(len(rows)),
        "wti_trading_days_overlap": int(len(overlap)),
        "after_lag1_asof": int(lag1),
        "after_5day_label_validity": int(label_valid),
    }


row_counts = {
    "traffic_source": "FHWA TMAS AVC040 (station total, directions 3+7, lane 1 each)",
    "asof_note": "lag 1 trading day is an ASSUMED conservative rule; publication timing is unconfirmed (not POINT_IN_TIME_VERIFIED)",
    "periods": {
        "train_le_2020": _counts("2015-01-01", "2020-12-31", True),
        "val_2021_2023": _counts("2021-01-01", "2023-12-31", False),
        "dev_config_reference": {"train_rows": 1483, "val_rows": 748},
    },
}
(RUN / "row_counts.json").write_text(json.dumps(row_counts, ensure_ascii=False, indent=2), encoding="utf-8")

# Missing calendar dates in covered months: reported, never filled.
covered = {
    "2016-03": ("2016-03-01", "2016-03-31"),
    "2020-03": ("2020-03-01", "2020-03-31"),
    **{f"2023-{i:02d}": (f"2023-{i:02d}-01", (pd.Timestamp(f"2023-{i:02d}-01") + pd.offsets.MonthEnd(0)).date().isoformat()) for i in range(1, 13)},
}
missing = {}
for label, (start, end) in covered.items():
    span = pd.date_range(start, end, freq="D")
    absent = [d.date().isoformat() for d in span if d not in present]
    missing[label] = absent
(RUN / "missing_dates.json").write_text(json.dumps(missing, ensure_ascii=False, indent=2), encoding="utf-8")

# Charts (2023 only for profiles; observation data, no fill).
y2023 = totals[totals.index.year == 2023]
hour2023 = hourly[(hourly["date"].dt.year == 2023) & (hourly["station_id"] == "AVC040")]
fig, ax = plt.subplots(figsize=(11, 4))
ax.plot(y2023.index, y2023["3"], label="direction 3", linewidth=1)
ax.plot(y2023.index, y2023["7"], label="direction 7", linewidth=1)
ax.set_title("AVC040 daily vehicles by direction, 2023 (gaps are missing dates, not zeros)")
ax.set_ylabel("vehicles/day (filed)")
ax.legend()
fig.tight_layout()
fig.savefig(RUN / "avc040_2023_daily_by_direction.png", dpi=110)
plt.close(fig)

profile = hour2023.groupby(["hour", "direction"])["volume_veh"].mean().unstack("direction")
profile.columns = [str(column) for column in profile.columns]
for column in ("3", "7"):
    if column not in profile.columns:
        profile[column] = float("nan")
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(profile.index, profile["3"], marker="o", markersize=3, label="direction 3")
ax.plot(profile.index, profile["7"], marker="o", markersize=3, label="direction 7")
ax.set_title("AVC040 mean hourly volume by direction, 2023")
ax.set_xlabel("hour of day")
ax.set_ylabel("vehicles/hour (filed)")
ax.legend()
fig.tight_layout()
fig.savefig(RUN / "avc040_2023_hour_profile.png", dpi=110)
plt.close(fig)

weekday = y2023.groupby(y2023.index.dayofweek)["total"].mean()
fig, ax = plt.subplots(figsize=(7, 4))
ax.bar(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], weekday.reindex(range(7)).values)
ax.set_title("AVC040 mean daily total by weekday, 2023")
ax.set_ylabel("vehicles/day (filed)")
fig.tight_layout()
fig.savefig(RUN / "avc040_2023_weekday_profile.png", dpi=110)
plt.close(fig)

summary = {
    "run": RUN.name,
    "station": "AVC040",
    "present_days_total": int(len(present)),
    "present_days_2023": int((present.year == 2023).sum()),
    "row_counts": row_counts["periods"],
    "missing_dates": {k: len(v) for k, v in missing.items() if v},
    "charts": [p.name for p in sorted(RUN.glob("*.png"))],
    "data_source": "research/indexes/091-tmas/{20260911T075705Z,20260911T082500Z}",
    "note": "Observation-only artifacts; no CAI score, no WTI test, not wired to the app.",
}
(RUN / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))
