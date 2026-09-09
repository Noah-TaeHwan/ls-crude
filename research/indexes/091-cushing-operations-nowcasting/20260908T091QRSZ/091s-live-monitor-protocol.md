# 091-S — CFAM Live Footfall Panel protocol

**Status:** `FORWARD_ONLY / E1` — strongest currently accessible live *city-footfall* candidate, not yet a validated Cushing oil-hub or trading factor.

## Fixed venue basket

Wendy’s, Taco Bell, Sonic Drive-In, Golden Chick, Pizza Hut, and Boomarang Diner in Cushing, Oklahoma. The basket is frozen before forward collection; no venue is added or removed because it looks busy.

## What to collect

At fixed Central Time windows — 07:30, 12:30, and 18:30 — record the fields in [`091s_live_observation_template.csv`](091s_live_observation_template.csv) only:

- whether Google Maps displays a Popular-times feature;
- the visible **live** relative label if shown (`quieter than usual`, `usual`, `busier than usual`, or `not shown`);
- open/closed, delivery shown/not shown, and drive-through shown/not shown.

The record is a manual observation of a public UI. Do not collect reviews, customer identities, phone/device data, transaction details, staff names, photos, or location traces. Do not infer numeric visitor counts from a bar chart.

## Submitted five-minute monitor — safe implementation boundary

The submitted monitor concept has been retained as a **forward-only recording
workflow** in two places:

- single-row CLI: [`manual_busy_label_recorder.py`](../../../notebooks/091-cushing-operations-nowcasting/manual_busy_label_recorder.py)
- basket pass / optional 5-minute prompt loop: [`busyness_monitor.py`](../../../factors/091-cushing-motel-lights-index/subtracks/qsr_live/busyness_monitor.py)

The original code's `mock_busyness()` produced time-of-day synthetic values and
did not call its declared Maps API key; those values must not enter 091-S.
`--mock` may print a demo table. It writes no CSV row.

The recorder therefore requires a human to enter only a visible public relative
label. It makes no Maps request, does not automate/scrape the UI, and never
stores customer, device, transaction, review, or location-trace data. A valid
five-minute cadence is optional operational monitoring, not five-minute
footfall data or a backtest.

Example after a human reads the public venue page:

```text
python research/notebooks/091-cushing-operations-nowcasting/manual_busy_label_recorder.py --venue "Wendy's" --maps-url "https://maps.app.goo.gl/g8bMaDQDnoMc9roT8" --label usual --open yes --delivery shown --drive-through shown
```

Its generated CSV is ignored as a forward observation file. It becomes a
research input only after the frozen 90-day completeness and measurement-
validity gate below.

## First measurement-validity test

Do not create a 0–100 score or test WTI/EIA. After 90 calendar days with at least 80% complete scheduled observations:

1. plot each venue separately and inspect venue closures/interface changes;
2. calculate only the daily share of available venues labelled `busier than usual` or `usual`;
3. compare it **first** against a separately obtained, aggregate Cushing activity reference with a matching period (for example airport activity, hotel tax only at monthly cadence, or a fixed road counter);
4. report missingness and normal weekday/hour patterns before any combination.

If the label is not displayed often enough, the UI layout changes, or an independent activity reference cannot be obtained, retain this as a live dashboard only. It is not evidence that restaurant traffic predicts inventory, WTI, or worker bonuses.
