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

## Out of this dash

National CFSP, UMCSENT, US average gasoline, nightlights, WTI, mock 0–100
Maps scores, Genscape/Kpler stubs, ocean tankers, hotel-tax pilots that
failed their own tests.

## Rule

The program **does not emit a busy score**. It lists each lane’s last
dated observation and whether the 90-day / source gate is open. Two
independent validated activity series would be required before a
composite is even discussed.
