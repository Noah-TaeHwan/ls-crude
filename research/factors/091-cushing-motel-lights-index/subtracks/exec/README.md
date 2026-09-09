# 091-EXEC — Cushing Operator Executive Visibility

**Layer:** communication. Not physical activity.  
**Status:** FORWARD_ONLY / E1  
**Not a new factor.** Lives under 091.

Question: does abnormal public exposure or language from Cushing-connected operators show up *before* field operations move?

```text
091 = Physical Activity + Operator Communication
```

Do not add VisibilityShock to the busy board. Do not multiply into 091-S/U/Y/V. Promote to “operational regime change” only if a physical lane and this layer move together *after* both have independent panels.

## Split IDs (do not collapse)

| ID | Object | First record |
| --- | --- | --- |
| **091-EXEC** | unscheduled external visibility | event rows |
| **091-EXL** | language on Cushing / storage / capacity / throughput / tightness | token flags on the same rows |
| **091-EXE** | event surprise vs the firm’s own calendar | scheduled_or_unscheduled |

Later, and only later:

`ExecPressure_t = VisibilityShock_t × LanguageShift_t`

`VisibilityShock_t = z(unscheduled external hits in trailing 30d)`  
`LanguageShift_t = z(Cushing-ops token rate)`

## Basket

Start with Plains. Then Enbridge, ONEOK. No celebrity CEOs outside midstream names that actually touch Cushing.

## Information weight (pre-registered)

| event_type | weight class |
| --- | --- |
| scheduled earnings call | baseline / low |
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

Public IR pages, official transcripts, official press rooms, Congress.gov witness lists only. No personal accounts, face ID, or flight tracking.

## Tests (not WTI)

```
ExecShock_t → TruckActivity_{t+1:t+30}
ExecShock_t → PermitActivity_{t+1:t+90}
ExecShock_t → CushingStocks_{t+1:t+8w}
```

Kill if communication shocks do not precede an independent physical series. Do not rescue with CL.

## Next

One Plains IR / transcript month, tagged with the schema. No z-score until 30 days of unscheduled rows exist.
