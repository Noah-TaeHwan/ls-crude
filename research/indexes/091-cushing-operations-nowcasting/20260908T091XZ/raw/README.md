# 091-X source receipt

| leg | verified public observation | result |
| --- | --- | --- |
| WTI Cushing | EIA daily `RWTC` spot price, direct public API | pass |
| WTI Houston / MEH | ICE describes the physically delivered Houston-vs-Cushing differential, but the audited public page does not provide a reproducible long historical settlement/spot export | no free long panel |
| WTI Midland | ICE/CME contract documentation establishes the market, but no free, reproducible long historical paired price panel was found in this audit | no free long panel |

`eia-cushing-wti-sample-20260908.json` is a real public API sample. SHA-256: `4be3764052ec754ae96af06685dcb8325c9833bbf4728eca40f6af569645e244`. It deliberately contains **only** the Cushing leg; a spread is never fabricated from a different benchmark.
