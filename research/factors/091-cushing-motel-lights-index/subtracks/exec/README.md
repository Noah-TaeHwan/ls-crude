# 091-EXEC — Cushing Operator Executive Visibility

**Layer:** communication. Not physical activity.  
**Status:** KEEP / FORWARD_ONLY / E1  
**Not a new factor.** Lives under 091.

Question: does operator communication leave a trace *before* Cushing operations move?

```text
CFAM = Physical Observation + Operator Communication
```

Do not add this layer to the busy meter. Do not mix into 091-S / U / Y / V. A joint “regime change” label is allowed only after both layers have independent panels and move together.

Preferred later path, not a score today:

```text
Executive Surprise → Permit / Job activity → Heavy truck activity
```

That is how 091 would leave “is the field busy?” and become “what prints before the field changes?”

## Split IDs (do not collapse)

| ID | Object | Definition |
| --- | --- | --- |
| **091-EXEC** | visibility | raw public appearances, tagged scheduled vs not |
| **091-EXL** | language | Cushing / storage / capacity / throughput / tightness flags on the same rows |
| **091-EXE** | calendar surprise | excess vs the firm’s own booked calendar |

091-EXE is **not** “showed up unscheduled.” It is excess over what the calendar already promised:

```text
EXE_t = ActualAppearances_30d − ExpectedScheduledAppearances_30d
```

Earnings calls and AGMs sit in Expected. They do not inflate the shock.

## Gates before any composite

`VisibilityShock` and `LanguageShift` stay separate columns.

`ExecPressure_t = VisibilityShock_t × LanguageShift_t` is **not** computed at 30 days. 30 days is too short even for a baseline, and it breaks the 091 90-day / measurement-validity rule.

Minimum: **60 forward days of rows**. Preferred before any product: **90 forward days**, same bar as 091-S.

z-windows, if used later, are estimated only on that completed forward panel.

## Basket

Plains first. Then Enbridge, ONEOK. No celebrity CEOs who do not operate Cushing midstream.

## Information weight (pre-registered)

| event_type | weight class |
| --- | --- |
| scheduled earnings call / AGM | baseline — belongs in Expected, not in EXE |
| industry conference keynote | medium |
| unscheduled CNBC / Bloomberg hit | high |
| special investor update | high |
| Cushing-specific press release | very high |

## Row schema

```
date
company
executive
event_type
scheduled_or_unscheduled
external_or_company_event
cushing_mentioned
storage_mentioned
capacity_mentioned
throughput_mentioned
tightness_mentioned
maintenance_mentioned
expansion_mentioned
source
```

Public IR, official transcripts, official press rooms, Congress.gov witness lists only. No personal accounts, face ID, or flight tracking.

## Target order (frozen)

1. `EXEC → truck / permit / job / lodging`
2. `EXEC → EIA Cushing stocks`
3. `EXEC → WTI` — last, and only if (1) survives. Do not rescue a dead physical link with CL.

Kill / PARK if communication shocks do not precede an independent physical series.

## Read of two futures

- Plains unscheduled hits rise → Cushing/capacity/throughput language rises → permits/jobs/trucks rise in 2–6 weeks: then EXEC is a candidate lead of field change.
- CEO visibility rises → physical lanes flat: then it was PR. KILL or PARK. Do not keep it as a busy input.

## Next

One Plains IR month tagged to the schema. No z-score, no ExecPressure, no WTI column.
