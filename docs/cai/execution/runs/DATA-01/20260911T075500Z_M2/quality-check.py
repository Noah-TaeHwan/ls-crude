"""DATA-01 M2 후보 품질 점검(읽기 전용). 원자료를 수정하지 않는다."""
import json, sys, os

BASE = "/Users/noah/orca/ls-crude-worktrees/ui-05-s2a/research/indexes/091-cushing-operations-nowcasting"
SERIES = {
  "LAUE": ("20260910T091LAUEZ/payne_laus_employed_monthly.json", "period", "employed"),
  "QCEWQ": ("20260909T091QCEWQZ/payne_qcew_quarterly.json", None, "totalCovered"),
  "STAX": ("20260910T091STAXZ/cushing_city_sales_tax_monthly.json", "period", "sales_tax_usd"),
  "KUSH": ("20260910T091KUSHZ/kush_operational_attention_monthly.json", "month", "articleCount"),
  "DMR": ("20260910T091DMRZ/cushing_echo_dmr_flow.json", "monitoringPeriodEnd", "value"),
}

ok = True
for name, (rel, date_key, value_key) in SERIES.items():
    path = os.path.join(BASE, rel)
    d = json.load(open(path))
    rows = d.get("rows") or []
    print(f"[{name}] file={rel}")
    print(f"  rows={len(rows)} declared={d.get('rowCount') or d.get('monthCount') or d.get('points')}")
    if date_key:
        dates = sorted(str(r.get(date_key)) for r in rows if r.get(date_key))
        if dates:
            print(f"  range={dates[0]}..{dates[-1]} sorted_ok={dates == sorted(dates)} unique={len(set(dates))}")
            # 결측 월 점검(LAUE/STAX/KUSH)
            if name in ("LAUE", "KUSH", "STAX"):
                months = [d0[:7] for d0 in dates]
                fs = sorted(set(months))
                gaps = []
                y, m = int(fs[0][:4]), int(fs[0][5:7])
                ey, em = int(fs[-1][:4]), int(fs[-1][5:7])
                while (y, m) <= (ey, em):
                    key = f"{y:04d}-{m:02d}"
                    if key not in fs: gaps.append(key)
                    m += 1
                    if m == 13: y, m = y + 1, 1
                print(f"  month_gaps={gaps}")
    vals = [r.get(value_key) for r in rows]
    print(f"  value_nulls={sum(1 for v in vals if v in (None, ''))}")
    if name == "QCEWQ":
        qs = [f"{r.get('year')}-Q{r.get('qtr')}" for r in rows if r.get("year") and r.get("qtr")]
        print(f"  quarters={qs[0]}..{qs[-1]} count={len(qs)}")
    if name == "DMR":
        vals = [r.get(value_key) for r in rows]
        units = {}
        bases = {}
        for r in rows:
            units[r.get("unit")] = units.get(r.get("unit"), 0) + 1
            bases[r.get("statisticalBase")] = bases.get(r.get("statisticalBase"), 0) + 1
        print(f"  nulls={sum(1 for v in vals if v in (None, ''))} units={units}")
        print(f"  statisticalBases={bases} permits={len(set(r.get('permitId') for r in rows))}")
    print()
print("QUALITY_CHECK_DONE")
