#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
091-candidates TASK A — EPA ECHO DMR (Cushing city) per-series build + dev-window usability.

Inputs (read-only, local):
  - research/gathering/raw/091-cushing-dmr/dmr_*.json   (18 permit JSONs, ECHO effluent REST)
  - research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv (WTI trading days)
  - research/indexes/091-tmas/20260911T082500Z/avc040_*_daily.csv (AVC040 2023 daily dates)

Rules (documented, never violated):
  - Parameter 50050 (Flow) only for series. NEVER sum across facilities, outfalls, units,
    or statistical bases. No unit conversion (MGD and gal/d stay as filed; null unit is its own class).
  - Missing stays missing; NODI 'C' no-discharge rows are observations with null value, never 0.
  - Series key = (permit, outfall, unit_class, basis). Outfall is kept separate so no outfall
    value is ever merged or summed.
  - Dev windows: train <= 2020-12-31 (from 2015-01-01), val 2021-01-01..2023-12-31.
  - 7-day lookback boundary: date >= window_start + 7 calendar days.
  - 5-trading-day label boundary: the 5th WTI trading day strictly after the date <= window_end.

Outputs: written to the run directory given as argv[1]:
  dmr_facilities.csv/.json, dmr_parameters.csv, dmr_series_rows.csv,
  dmr_series_summary.csv, dmr_series_window_counts.csv, dmr_tmas2023_common.csv,
  dmr_quality.json, manifest.json
"""

import csv
import glob
import hashlib
import json
import os
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DMR_GLOB = os.path.join(REPO, "research", "gathering", "raw", "091-cushing-dmr", "dmr_*.json")
WTI_CSV = os.path.join(REPO, "research", "gathering", "raw", "WTI-CLF-IS",
                       "20260907T064937Z", "CLF_daily_2015-2023.csv")
TMAS_GLOB = os.path.join(REPO, "research", "indexes", "091-tmas",
                         "20260911T082500Z", "avc040_*_daily.csv")

TRAIN_START = date(2015, 1, 1)
TRAIN_END = date(2020, 12, 31)
VAL_START = date(2021, 1, 1)
VAL_END = date(2023, 12, 31)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def iso_date(dd_mon_yy):
    """ECHO '31-MAY-26' -> '2026-05-31'. Returns None on unparseable/None."""
    if not dd_mon_yy:
        return None
    try:
        return datetime.strptime(dd_mon_yy, "%d-%b-%y").date().isoformat()
    except ValueError:
        return None


def load_wti_trading_days():
    days = set()
    with open(WTI_CSV, newline="") as fh:
        for row in csv.DictReader(fh):
            days.add(date.fromisoformat(row["date"]))
    return days


def load_tmas_2023_dates():
    days = set()
    for fp in sorted(glob.glob(TMAS_GLOB)):
        with open(fp, newline="") as fh:
            for row in csv.DictReader(fh):
                d = date.fromisoformat(row["date"])
                if d.year == 2023:
                    days.add(d)
    return days


def fifth_trading_day_after(d, trading_days_sorted):
    """5th WTI trading day strictly after date d, or None."""
    import bisect
    i = bisect.bisect_right(trading_days_sorted, d)
    if i + 4 < len(trading_days_sorted):
        return trading_days_sorted[i + 4]
    return None


def month_gaps(dates_iso):
    """distinct months present vs inclusive span; max consecutive missing months."""
    months = sorted({(int(s[:4]), int(s[5:7])) for s in dates_iso})
    if not months:
        return 0, 0, 0, 0
    span = (months[-1][0] - months[0][0]) * 12 + (months[-1][1] - months[0][1]) + 1
    present = len(months)
    missing = span - present
    # max consecutive missing months
    by_val = {y * 12 + m: True for y, m in months}
    start, end = months[0][0] * 12 + months[0][1], months[-1][0] * 12 + months[-1][1]
    max_run = run = 0
    for v in range(start, end + 1):
        if by_val.get(v):
            run = 0
        else:
            run += 1
            max_run = max(max_run, run)
    return present, span, missing, max_run


def main(outdir):
    os.makedirs(outdir, exist_ok=True)

    wti_days = load_wti_trading_days()
    wti_sorted = sorted(wti_days)
    tmas_2023 = load_tmas_2023_dates()

    # ---------- parse every DMR JSON ----------
    facilities = {}           # permit -> header dict
    all_params = []           # every parameter row across all permits
    flow_rows = []            # parameter 50050 rows
    raw_files = sorted(glob.glob(DMR_GLOB))

    for fp in raw_files:
        with open(fp) as fh:
            doc = json.load(fh)
        res = doc.get("Results", {})
        permit = res.get("SourceId")
        facilities[permit] = {
            "permit_id": permit,
            "facility_name": res.get("CWPName"),
            "city": res.get("CWPCity"),
            "state": res.get("CWPState"),
            "zip": res.get("CWPZip"),
            "permit_status": res.get("CWPPermitStatusDesc"),
            "permit_type": res.get("CWPPermitTypeDesc"),
            "major_minor": res.get("CWPMajorMinorStatusFlag"),
            "start_date": res.get("StartDate"),
            "end_date": res.get("EndDate"),
            "raw_file": os.path.relpath(fp, REPO),
        }
        for pf in res.get("PermFeatures", []):
            for p in pf.get("Parameters", []):
                for row in p.get("DischargeMonitoringReports", []):
                    all_params.append({
                        "permit_id": permit,
                        "outfall": pf.get("PermFeatureNmbr"),
                        "outfall_type": pf.get("PermFeatureTypeDesc"),
                        "parameter_code": p.get("ParameterCode"),
                        "parameter_desc": p.get("ParameterDesc"),
                        "monitoring_location": p.get("MonitoringLocationDesc"),
                        "value_type": row.get("ValueTypeCode"),
                        "value_type_desc": row.get("ValueTypeDesc"),
                        "statistical_base": row.get("StatisticalBaseDesc"),
                        "unit": row.get("DMRUnitDesc") if row.get("DMRUnitDesc") is not None else "",
                        "date": iso_date(row.get("MonitoringPeriodEndDate")),
                        "value_raw": row.get("DMRValueNmbr"),
                        "nodi": row.get("NODICode"),
                    })
                    if p.get("ParameterCode") == "50050":
                        vraw = row.get("DMRValueNmbr")
                        try:
                            vnum = float(vraw)
                        except (TypeError, ValueError):
                            vnum = None
                        unit = row.get("DMRUnitDesc")
                        flow_rows.append({
                            "permit_id": permit,
                            "facility_name": res.get("CWPName"),
                            "outfall": pf.get("PermFeatureNmbr"),
                            "unit": unit if unit is not None else "",
                            "unit_class": unit if unit is not None else "null",
                            "basis": row.get("StatisticalBaseDesc"),
                            "value_type": row.get("ValueTypeCode"),
                            "value_raw": vraw if vraw is not None else "",
                            "value_num": vnum,
                            "qualifier": row.get("DMRValueQualifierCode"),
                            "nodi_code": row.get("NODICode"),
                            "nodi_desc": row.get("NODIDesc"),
                            "version": row.get("VersionNmbr"),
                            "received_date": iso_date(row.get("ValueReceivedDate")),
                            "date": iso_date(row.get("MonitoringPeriodEndDate")),
                        })

    # ---------- series tables ----------
    series = defaultdict(list)
    for r in flow_rows:
        series[(r["permit_id"], r["outfall"], r["unit_class"], r["basis"])].append(r)

    # facility table (flow row counts + outfall list)
    fac_out = defaultdict(set)
    for r in flow_rows:
        fac_out[r["permit_id"]].add(r["outfall"])
    fac_rows = []
    for permit, f in facilities.items():
        frows = [r for r in flow_rows if r["permit_id"] == permit]
        fac_rows.append({
            **f,
            "flow_rows": len(frows),
            "flow_numeric": sum(1 for r in frows if r["value_num"] is not None),
            "flow_outfalls": ";".join(sorted(fac_out.get(permit, []))),
            "flow_units": ";".join(sorted({r["unit_class"] for r in frows})),
            "flow_bases": ";".join(sorted({r["basis"] for r in frows if r["basis"]})),
            "flow_first_date": min((r["date"] for r in frows if r["date"]), default=""),
            "flow_last_date": max((r["date"] for r in frows if r["date"]), default=""),
        })
    fac_rows.sort(key=lambda x: (x["flow_rows"] == 0, x["permit_id"]))

    # parameter inventory (all parameters, aggregated)
    param_counts = Counter((r["permit_id"], r["outfall"], r["parameter_code"],
                            r["parameter_desc"], r["monitoring_location"], r["unit"]) for r in all_params)
    param_rows = [{"permit_id": k[0], "outfall": k[1], "parameter_code": k[2],
                   "parameter_desc": k[3], "monitoring_location": k[4], "unit": k[5],
                   "rows": v} for k, v in sorted(param_counts.items())]

    # per-series rows (long) — stable order
    flow_rows.sort(key=lambda r: (r["permit_id"], r["outfall"], r["unit_class"], r["basis"], r["date"]))
    series_row_fields = ["permit_id", "facility_name", "outfall", "unit", "unit_class", "basis",
                         "value_type", "date", "value_raw", "value_num", "qualifier",
                         "nodi_code", "nodi_desc", "version", "received_date"]
    with open(os.path.join(outdir, "dmr_series_rows.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=series_row_fields)
        w.writeheader()
        for r in flow_rows:
            w.writerow({k: ("" if r[k] is None else r[k]) for k in series_row_fields})

    # ---------- per-series summary + dev-window counts ----------
    def funnel(dates_iso, window_start, window_end):
        """four-stage count; dates_iso = sorted distinct series observation dates."""
        ds = [date.fromisoformat(s) for s in dates_iso if window_start <= date.fromisoformat(s) <= window_end]
        present = len(ds)
        on_wti = [d for d in ds if d in wti_days]
        after_lb = [d for d in on_wti if d >= window_start + timedelta(days=7)]
        after_lbl = [d for d in after_lb
                     if (lambda d5: d5 is not None and d5 <= window_end)(fifth_trading_day_after(d, wti_sorted))]
        return present, len(on_wti), len(after_lb), len(after_lbl)

    summary_rows = []
    window_rows = []
    tmas_common_rows = []
    for key in sorted(series.keys()):
        permit, outfall, unit_class, basis = key
        rows = series[key]
        dates = sorted({r["date"] for r in rows if r["date"]})
        num_dates = sorted({r["date"] for r in rows if r["value_num"] is not None})
        null_dates = [d for d in dates if d not in set(num_dates)]
        months_present, months_span, months_missing, max_run = month_gaps(dates)
        wti_overlap = [d for d in dates if date.fromisoformat(d) in wti_days]
        dates_2023 = [d for d in dates if d.startswith("2023")]
        tmas_overlap = [d for d in dates_2023 if date.fromisoformat(d) in tmas_2023]
        for d in tmas_overlap:
            r = next(x for x in rows if x["date"] == d)
            tmas_common_rows.append({
                "permit_id": permit, "outfall": outfall, "unit_class": unit_class, "basis": basis,
                "date": d, "value_raw": r["value_raw"] or "", "nodi_code": r["nodi_code"] or "",
            })
        fac = facilities[permit]
        summary_rows.append({
            "permit_id": permit,
            "facility_name": fac["facility_name"],
            "outfall": outfall,
            "unit": unit_class,
            "basis": basis,
            "first_date": dates[0] if dates else "",
            "last_date": dates[-1] if dates else "",
            "n_obs_dates": len(dates),
            "n_numeric_dates": len(num_dates),
            "n_null_nodi_C": len(null_dates),
            "n_duplicate_dates": len(rows) - len(dates),
            "span_days": (date.fromisoformat(dates[-1]) - date.fromisoformat(dates[0])).days if len(dates) > 1 else 0,
            "months_present": months_present,
            "months_span": months_span,
            "months_missing": months_missing,
            "max_consecutive_missing_months": max_run,
            "n_wti_trading_overlap_2015_2023": len(wti_overlap),
            "n_dates_2023": len(dates_2023),
            "n_tmas2023_common_dates": len(tmas_overlap),
            "versions": ";".join(sorted({str(r["version"]) for r in rows})),
            "received_first": min((r["received_date"] for r in rows if r["received_date"]), default=""),
            "received_last": max((r["received_date"] for r in rows if r["received_date"]), default=""),
        })
        # numeric-only funnel uses numeric dates; full funnel uses all observation dates
        for win, ws, we in (("train", TRAIN_START, TRAIN_END), ("val", VAL_START, VAL_END)):
            p, w_, lb, lbl = funnel(dates, ws, we)
            np_, nw, nlb, nlbl = funnel(num_dates, ws, we)
            window_rows.append({
                "permit_id": permit, "outfall": outfall, "unit": unit_class, "basis": basis, "window": win,
                "present": p, "on_wti_days": w_, "after_7d_lookback": lb, "after_5td_label": lbl,
                "numeric_present": np_, "numeric_on_wti_days": nw,
                "numeric_after_7d_lookback": nlb, "numeric_after_5td_label": nlbl,
            })

    with open(os.path.join(outdir, "dmr_series_summary.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(summary_rows[0].keys()))
        w.writeheader(); w.writerows(summary_rows)
    with open(os.path.join(outdir, "dmr_series_window_counts.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(window_rows[0].keys()))
        w.writeheader(); w.writerows(window_rows)
    with open(os.path.join(outdir, "dmr_facilities.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(fac_rows[0].keys()))
        w.writeheader(); w.writerows(fac_rows)
    with open(os.path.join(outdir, "dmr_parameters.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(param_rows[0].keys()))
        w.writeheader(); w.writerows(param_rows)
    with open(os.path.join(outdir, "dmr_tmas2023_common.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["permit_id", "outfall", "unit_class", "basis", "date",
                                           "value_raw", "nodi_code"])
        w.writeheader(); w.writerows(tmas_common_rows)

    # facilities json (flow + no-flow), full list
    with open(os.path.join(outdir, "dmr_facilities.json"), "w") as fh:
        json.dump({"facilities": fac_rows}, fh, indent=1, ensure_ascii=False)

    # ---------- quality json ----------
    frozen_csv = os.path.join(REPO, "research", "indexes", "091-cushing-operations-nowcasting",
                              "20260910T091DMRZ", "cushing_echo_dmr_flow.csv")
    frozen_check = {"path": os.path.relpath(frozen_csv, REPO), "exists": os.path.exists(frozen_csv)}
    if frozen_check["exists"]:
        with open(frozen_csv, newline="") as fh:
            frozen = {(r["permit_id"], r["outfall"], r["monitoring_period_end"], r["value_type"])
                      for r in csv.DictReader(fh)}
        raw_keys = {(r["permit_id"], r["outfall"], r["date"], r["value_type"]) for r in flow_rows}
        frozen_check.update({
            "frozen_rows": len(frozen), "raw_rows": len(raw_keys),
            "frozen_only": len(frozen - raw_keys), "raw_only": len(raw_keys - frozen),
            "identical_key_sets": frozen == raw_keys,
            "sha256": sha256(frozen_csv),
        })

    quality = {
        "run": os.path.basename(os.path.abspath(outdir)),
        "generated_utc": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "raw_files": [os.path.relpath(p, REPO) for p in raw_files],
        "raw_file_count": len(raw_files),
        "permits_total": len(facilities),
        "permits_with_flow": sorted(fac_out.keys()),
        "permits_with_flow_count": len(fac_out),
        "permits_without_flow": sorted(set(facilities) - set(fac_out)),
        "flow_rows_total": len(flow_rows),
        "flow_rows_numeric": sum(1 for r in flow_rows if r["value_num"] is not None),
        "flow_rows_null": sum(1 for r in flow_rows if r["value_num"] is None),
        "null_rows_nodi_C": sum(1 for r in flow_rows if r["value_num"] is None and r["nodi_code"] == "C"),
        "null_rows_other_nodi": sum(1 for r in flow_rows if r["value_num"] is None and r["nodi_code"] != "C"),
        "units": dict(Counter(r["unit_class"] for r in flow_rows)),
        "bases": dict(Counter(r["basis"] for r in flow_rows)),
        "unit_x_basis": {f"{u}|{b}": c for (u, b), c in sorted(
            Counter((r["unit_class"], r["basis"]) for r in flow_rows).items())},
        "numeric_rows_with_null_unit": sum(1 for r in flow_rows
                                           if r["value_num"] is not None and r["unit_class"] == "null"),
        "duplicate_series_dates": sum(len(rows) - len({r["date"] for r in rows}) for rows in series.values()),
        "series_count": len(series),
        "series_keys": ["|".join(k) for k in sorted(series)],
        "series_outfall_multi": sorted({f"{k[0]}|{k[2]}|{k[3]}" for k in series
                                        if len({r["outfall"] for r in series[k]}) > 1}),
        "wti_file": os.path.relpath(WTI_CSV, REPO),
        "wti_trading_days": len(wti_days),
        "wti_first": wti_sorted[0].isoformat(),
        "wti_last": wti_sorted[-1].isoformat(),
        "tmas_2023_daily_dates": len(tmas_2023),
        "tmas_file_glob": os.path.relpath(TMAS_GLOB, REPO),
        "frozen_reconciliation": frozen_check,
        "dev_windows": {
            "train": [TRAIN_START.isoformat(), TRAIN_END.isoformat()],
            "val": [VAL_START.isoformat(), VAL_END.isoformat()],
            "lookback_rule": "date >= window_start + 7 calendar days",
            "label_rule": "5th WTI trading day strictly after date <= window_end",
        },
        "all_parameters_rows": len(all_params),
        "all_parameters_distinct": len(param_counts),
    }
    with open(os.path.join(outdir, "dmr_quality.json"), "w") as fh:
        json.dump(quality, fh, indent=1, ensure_ascii=False, sort_keys=False)

    # ---------- manifest (input -> script -> output hashes) ----------
    out_names = ["dmr_facilities.csv", "dmr_facilities.json", "dmr_parameters.csv",
                 "dmr_series_rows.csv", "dmr_series_summary.csv", "dmr_series_window_counts.csv",
                 "dmr_tmas2023_common.csv", "dmr_quality.json"]
    manifest = {
        "script": os.path.relpath(os.path.abspath(__file__), REPO),
        "script_sha256": sha256(os.path.abspath(__file__)),
        "inputs": [
            {"path": os.path.relpath(p, REPO), "sha256": sha256(p)} for p in raw_files
        ] + [
            {"path": os.path.relpath(WTI_CSV, REPO), "sha256": sha256(WTI_CSV)},
        ] + [
            {"path": os.path.relpath(p, REPO), "sha256": sha256(p)} for p in sorted(glob.glob(TMAS_GLOB))
        ],
        "outputs": [
            {"path": n, "sha256": sha256(os.path.join(outdir, n))} for n in out_names
        ],
    }
    with open(os.path.join(outdir, "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=1, ensure_ascii=False)
    print(json.dumps({"ok": True, "outdir": outdir, "series": len(series),
                      "flow_rows": len(flow_rows), "frozen_match": frozen_check.get("identical_key_sets")},
                     ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
