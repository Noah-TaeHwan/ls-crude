# 091-E2 — Pipeline Electronic Bulletin Board Flow Constraint Index (PEBB-FCI)

**Status: PARK / E1.** No reproducible, public, dated daily EBB/RSS/API was
verified for Cushing-linked crude capacity and flows for Plains Pipeline, L.P.,
Enbridge Pipelines, or Enterprise Products. The collector therefore creates a
header-only output; absence is never converted to zero capacity or zero stress.

## What this is measuring

The track accepts only a public record that supplies an explicit date, one
frozen target operator, and a Cushing link. It extracts nominal and operational
capacity (KBPD), an explicit constraint flag, and optional scheduled flow. The
published output is:

`date,pipeline_operator,nominal_capacity_kbpd,operational_capacity_kbpd,constraint_flag,flow_constraint_score`

`operational / nominal` is **available-capacity ratio**, not utilization.
Utilization requires a separately disclosed scheduled/actual flow number; where
one exists, the script uses it only to calculate a documented pressure component.

## Source boundary

The standardized posting requirement in [18 CFR 284.13](https://www.law.cornell.edu/cfr/text/18/284.13)
applies to interstate **natural-gas** pipelines. It cannot be substituted for
crude-pipeline operations. [FERC eTariff](https://ferc.gov/ferc-online/etariff)
does publish oil-pipeline tariff filings, but tariffs are not a daily
operational-capacity or flow feed. FERC describes crude-pipeline prorationing as
non-uniform capacity allocation in its [2022 inquiry](https://www.govinfo.gov/content/pkg/FR-2022-02-24/pdf/FR-2022-02-24.pdf).

Enbridge's [customer handbook](https://www.enbridge.com/reports/2026-liquids-pipelines-customer-handbook/the-enbridge-value-proposition)
confirms its liquids network reaches the U.S. midcontinent/Cushing context, but
does not provide a reproducible daily Cushing EBB series. No matching public
daily feed was verified for the other two frozen operators.

## Safe execution

The script performs no default scrape. It accepts either an audited local
JSON/JSONL notice export or an explicitly supplied public RSS/Atom URL:

```powershell
python pebb_fci.py
python pebb_fci.py --input public_notices.json
python pebb_fci.py --rss-url https://operator.example/public-feed.xml
```

Only public, non-authenticated sources may be used. Login portals, customer
dashboards, search snippets, tariffs, and generic natural-gas EBB records are
not valid replacements.

## Reopening condition

Collect a frozen-route archive with publication/effective timestamps and either
90 daily observations or 60 documented service cycles. Then validate capacity
flags against an independent physical Cushing observation before combining with
CFAM. The adjacent [091-E / FPATSI](../fpatsi/README.md) remains the related
apportionment-only screen.
