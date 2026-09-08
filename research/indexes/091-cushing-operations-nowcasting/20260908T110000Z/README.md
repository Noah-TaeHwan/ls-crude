# 091 CFAM — frozen in-sample result

Run UTC: 2026-09-08T01:35:32.390059+00:00
Input: 2015-01–2023-12 public Suomi-NPP monthly radiance. City-core minus four fixed rural controls; month-of-year anomalies are normalized within the rp2/ops processing family.
Availability: month end +45 calendar days. Target: only subsequent 28-day official EIA Cushing stock movement.
This is a coarse city-activity nowcast, not hotel occupancy and not a WTI directional test.

| test | n | Pearson r | p-value | Spearman r |
| --- | ---: | ---: | ---: | ---: |
| next_28d_inventory_change_kbbl | 96 | +0.053 | 0.607 | +0.096 |
| next_28d_abs_weekly_change_kbbl | 96 | +0.068 | 0.508 | +0.150 |

## Fixed interpretation

No WTI claim is licensed by this calculation. The 2024+ period remains unopened until the sensor-bridge and any target-selection policy are reviewed.
