# 091-U v2 — Industrial Job Pulse measurement design

## Why raw job counts are too weak

An eligible role can be a replacement hire, an always-open vacancy, a duplicate listing, or a genuine project mobilisation. A raw count confuses those states. The useful unit is a **deduplicated role lifecycle** observed from a fixed public source universe—not an estimate of applications or future hires.

The frozen include/exclude rules remain unchanged. This design only adds non-overlapping tags to roles that already passed those rules. It is written before the 90-day pilot begins; no historical count is revised.

## Four separate measures

| measure | definition | interpretation boundary |
| --- | --- | --- |
| `new_eligible_roles` | eligible canonical roles first seen in the fixed source universe this week | advertised demand arrival, not a hire |
| `critical_operations_roles` | active roles already included as Terminal Operator, Pipeline Operator, Gauger, Tank Technician, Lease Operator, or Pumper | direct operating-work vacancy, not terminal throughput |
| `project_roles` | active already-eligible roles whose public title/summary explicitly says turnaround, shutdown, outage, TAR, temporary, project, or contract | visible project staffing signal, not project size |
| `stale_eligible_roles` | eligible canonical roles visibly open more than 45 days | possible hiring friction or persistent opening, never added to momentum |

`project_roles` does not expand the inclusion dictionary: a generic project role does not become eligible merely because it is a project role.

## Role lifecycle and dedupe key

The canonical key is `employer | normalized title | exact Cushing worksite`. For every weekly snapshot, mark each key `new`, `continuing`, `returned`, `removed`, `source_unavailable`, or `borderline`. A role shown by multiple public pages remains one canonical role. A role cannot be labelled `removed` unless the same source page was successfully checked; a failed page is `source_unavailable`, never zero.

No applicant count, applicant age, personal information, job-description bulk text, compensation inference, or recruiter profile is retained.

## Source universe before the pilot

The weekly review starts with public, manually readable employer or public listing pages for the four independently identified Cushing roles: Plains, ONEOK, Enterprise Products, and South Bow. A new source can be added only **before** the first scheduled pilot observation, provided it is a public, unauthenticated page and an exact Cushing industrial role is found. After the first observation, the source universe is frozen alongside the user's keyword rules. Platforms are manually viewed; no automated platform collection is used.

## Pilot outputs: dashboard, not alpha

During the 90-day pilot, show four raw weekly series and an availability panel. Do not publish a weighted score. The first valid statement is only descriptive: whether new/project/critical/stale role counts vary independently or are mostly constant.

After the pilot, a monthly **Industrial Hiring State** can be considered only if all of the following are true:

1. at least 12 scheduled observations and 80% source completion;
2. each active role has a stable canonical key and explicit inclusion evidence;
3. no single employer contributes more than 70% of `new_eligible_roles` without being displayed as a concentration warning;
4. a separately measured CFAM operational track has matching dated data.

The first validation target is **not WTI**. Test `new_eligible_roles` and `project_roles` separately against a validated terminal-side D change signal, O with an explicit metric period, or a fixed road-truck panel. A useful result needs a pre-specified forward lag, sign stability across source-complete weeks, and a holdout segment. If no independent operational association appears, 091-U stays a transparent hiring monitor.

## Best eventual combination

The most defensible future alert is an **AND gate**, not a weighted sum:

`terminal activity alert = high D tank-change intensity AND high 091-U project/new-role state`

The first condition says the physical terminal state is changing; the second says the local industrial labour market has fresh, relevant demand. Each must pass independently. S, A, F and O remain confirming context, not substitute inputs for a missing D/U pass.
