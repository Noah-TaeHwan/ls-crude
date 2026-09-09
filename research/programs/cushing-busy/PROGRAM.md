# Cushing Busy Board

**Question:** Is the Cushing *field* busy right now?  
**Not the question:** Where is WTI going? How full are the tanks? How stressed is the US household?

091 stays the research ledger. This folder is the **one program** that
filters that ledger into a single board.

```text
research/programs/cushing-busy/   board definition + CLI
app/app/routes/cushing-busy.tsx   same board on the desk
```

## In this dash

| Lane | Source | Why it is here |
| --- | --- | --- |
| Activity, forward only | **091-S restaurant strip** (Wendy's, Taco Bell, Sonic, Golden Chick, Pizza Hut, Boomarang), 091-U jobs, 091-Y pump, 091-Z news, 091-V permits | Local traces. S is the restaurant-busy lane. None is validated as “busy”. |
| Physical context | 091-EIA Cushing stocks | Tells you how full the tanks are. Explicitly **not** activity. |
| Communication (not on the busy meter) | 091-EXEC / EXL / EXE | Operator intent. Plains first. 90-day forward rows before any ExecPressure. Never mixed into readiness or busy. |

## Out of this dash

National CFSP, UMCSENT, US average gasoline, nightlights, WTI, mock 0–100
Maps scores, Genscape/Kpler stubs, ocean tankers, hotel-tax pilots that
failed their own tests.

## Score rule

There is **no busy score today**. `verdict = INSUFFICIENT`.

A composite is allowed only after all of these hold:

1. 091-S has 90 calendar days of scheduled slots at ≥80% complete
   (quieter / usual / busier / not shown only).
2. One other *Cushing* operating series — fixed-road trucks or airport
   monthly Jet-A — passes measurement validity against an independent
   local count.
3. Weights are written down before the first combination. At most three
   series. No fill-ins with WTI, national CFSP, nightlights, or mock 0–100.

Until then the desk shows the lanes side by side and refuses a number.
