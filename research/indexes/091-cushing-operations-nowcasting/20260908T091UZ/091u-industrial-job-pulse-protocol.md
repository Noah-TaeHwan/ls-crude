# 091-U — Cushing Industrial Job Pulse: frozen 90-day protocol

## Question

Can public job postings with a clear direct connection to Cushing crude-terminal,
pipeline, midstream, tank-farm, industrial-maintenance, or heavy-logistics work
serve as a **forward-only industrial hiring pulse** for CFAM?

This measures advertised eligible roles—not hires, headcount, payroll,
throughput, contractor mobilisation, or oil prices.

## Frozen inclusion rules

Count one unique posting only when its title or a short public role summary has
both an exact Cushing work location and a direct industrial connection.

| class | include terms |
| --- | --- |
| primary | Terminal, Pipeline, Midstream, Crude, Tank Farm, Storage Terminal, Turnaround, Shutdown, Outage, TAR |
| skilled trade | Welder, Pipefitter, Boilermaker, Millwright, Ironworker |
| transport / field | CDL plus crude/oil/tank/vacuum/hotshot; Lease Operator; Pumper; Gauger; Tank Technician; Terminal Operator |
| secondary, only with industrial context | Maintenance Technician/Mechanic; Safety/HSE/Confined Space/Scaffolding; Superintendent/Foreman/Planner |

Secondary titles count only when the public role text explicitly supplies a
pipeline, terminal, industrial, oilfield, or turnaround context.

## Frozen exclusions and borderlines

Always exclude government, retail, restaurant, hotel, school, medical, church,
pure office, insurance/real-estate/banking/non-industrial sales, and agriculture
roles. Exclude vague `Maintenance Technician – Cushing`, generic local CDL,
general construction laborer, and postings outside Cushing unless regular
Cushing presence is explicitly required. Deduplicate the same employer/title
role across sources. A post older than 45 days remains countable but gets a
`stale=true` flag. Borderline roles are logged separately and never added
retrospectively during the pilot.

## Sources and collection boundary

Use only pages that can be manually read without authentication: an employer's
public career page or a public search-result/listing page. Do **not** automate
Indeed, LinkedIn, Google Jobs, or any other platform; do not create accounts,
evade limits, gather applicant information, or infer applications. At each
weekly fixed-time check, record only the aggregate listing fields in the
template: source, employer, title, Cushing location proof, inclusion reason,
posting-age label, stale flag, and a canonical dedupe key.

## Fixed observation schedule and decision

- **Cadence:** once weekly, Thursday 01:00 Korea Standard Time, for 90 days.
  Record the corresponding America/Chicago timestamp on every row; the fixed
  KST slot avoids an ambiguous scheduler shift at the U.S. daylight-saving boundary.
- **Main number:** count of unique included active public postings.
- **Review number:** separate count of borderline roles; never add it to main.
- **Missing source:** write `source_unavailable`; never treat as zero listings.
- **Minimum result:** at least 12 scheduled snapshots, 80% source completion,
  and a stable dedupe rule before describing a time pattern.
- **Validation first:** compare the resulting monthly pulse only with a
  separately valid Cushing operational series (D terminal-state change, O
  airport series with a stated period, or fixed-road truck count). It is not
  tested against WTI/EIA first.

No include/exclude keyword, geographic rule, source universe, cadence, or
dedupe method changes before the 90-day end review.

## v2 role-lifecycle fields

For an included role, also record (without changing its inclusion decision)
`lifecycle_status` (`new`, `continuing`, `returned`, `removed`, or
`source_unavailable`), `critical_operations_role`, and `project_role`.
Definitions, boundaries and the post-pilot validation gate are fixed in
[091-U v2 measurement design](091u-v2-measurement-design.md). `stale` remains
a separate transparency flag and is never added to the momentum count.
