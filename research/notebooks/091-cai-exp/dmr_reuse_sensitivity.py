"""DMR 재사용 기간 민감도 진단 (배치 H).

정책 A/B/C(62/31/0일)별로 사용 표본·원관측 수·재사용 횟수·경과일 분포·
만료/결측 제외 행수·클래스 균형을 계산하고 날짜별 사용 원관측 매핑을 저장한다.
학습은 하지 않는다(진단 전용).
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from ls_crude.experiment.data import align_availability, build_market_features, build_target, horizon_safe_train_mask, split_masks
from ls_crude.experiment.spec import InputSpec

PRICE = "data/clf-daily-2015-2026.csv"
TRAFFIC = "data/processed/091-cai-exp-pilot/inputs/traffic_avc040_daily.csv"
DMR = "data/processed/091-cai-exp-pilot/inputs/dmr_ok0026701_001_mgd.csv"
POLICIES = (("A_62", 62), ("B_31", 31), ("C_0", 0))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    price = pd.read_csv(PRICE, parse_dates=["date"])
    price = price[price["date"] <= "2023-12-31"].sort_values("date")
    close = price.set_index("date")["Close"]
    dates = pd.DatetimeIndex(close.index)
    target = build_target(close, 5, pd.Series(False, index=dates))
    market = build_market_features(close, ("rsi14", "ret_5d"))
    train_mask = horizon_safe_train_mask(dates, "2020-12-31", 5)
    val_mask = split_masks(dates, "2021-01-01", "2023-12-31")

    traffic = pd.read_csv(TRAFFIC, parse_dates=["date"])
    traffic_obs = traffic.set_index("date")[["value"]]
    traffic_spec = InputSpec(kind="component", path=TRAFFIC, sha256="0" * 64,
                             date_column="date", value_column="value")
    traffic_aligned, _ = align_availability(traffic_obs, dates, traffic_spec, "RETROSPECTIVE_RESEARCH")

    dmr = pd.read_csv(DMR, parse_dates=["date", "available_at"])
    dmr_obs = dmr.set_index("date")[["value", "available_at"]].sort_index()

    report: dict[str, dict] = {}
    for name, validity in POLICIES:
        spec = InputSpec(kind="component", path=DMR, sha256="0" * 64, date_column="date",
                         value_column="value", available_at_column="available_at", validity_days=validity)
        aligned, record = align_availability(dmr_obs, dates, spec, "RETROSPECTIVE_RESEARCH")

        latest_available = dmr_obs["available_at"].sort_values()
        mapping_rows = []
        for date in dates[aligned.notna()]:
            candidates = latest_available[(latest_available <= date) & (date - latest_available <= pd.Timedelta(days=validity))] if validity > 0 else latest_available[latest_available == date]
            if len(candidates) == 0:
                continue
            source = candidates.index[-1]
            elapsed = (date - dmr_obs.loc[source, "available_at"]).days
            mapping_rows.append({
                "date": date.date().isoformat(),
                "used_value": float(aligned.loc[date]),
                "source_observation_date": source.date().isoformat(),
                "source_available_at": dmr_obs.loc[source, "available_at"].date().isoformat(),
                "elapsed_days": int(elapsed),
                "in_train": bool(train_mask.loc[date]),
                "in_val": bool(val_mask.loc[date]),
            })
        mapping = pd.DataFrame(mapping_rows)
        mapping.to_csv(out / f"mapping_{name}.csv", index=False)

        # model-level mask: dmr valid & traffic valid & market valid & target valid
        model_rows = aligned.notna() & traffic_aligned.notna() & market.notna().all(axis=1) & target.notna()
        train_rows = model_rows & train_mask
        val_rows = model_rows & val_mask

        all_obs = dmr_obs
        used_train = mapping.loc[mapping["in_train"], "source_available_at"].nunique() if not mapping.empty else 0
        used_val = mapping.loc[mapping["in_val"], "source_available_at"].nunique() if not mapping.empty else 0
        reuse = {}
        for label, frame in (("train", mapping[mapping["in_train"]]), ("val", mapping[mapping["in_val"]])):
            if not frame.empty:
                counts = frame.groupby("source_available_at")["date"].count()
                reuse[label] = {"observations": int(len(counts)), "row_uses": int(len(frame)),
                                "max_uses_per_obs": int(counts.max()), "median_uses": float(counts.median())}
            else:
                reuse[label] = {"observations": 0, "row_uses": 0, "max_uses_per_obs": 0, "median_uses": 0.0}

        train_dates = dates[train_rows]
        val_dates = dates[val_rows]
        classes = {
            "train_up_rate": float(target.loc[train_rows].mean()) if len(train_dates) else None,
            "train_classes": sorted(target.loc[train_rows].unique().tolist()) if len(train_dates) else [],
            "val_classes": sorted(target.loc[val_rows].unique().tolist()) if len(val_dates) else [],
        }
        elapsed_stats = {}
        if not mapping.empty:
            elapsed_stats = {
                "min": int(mapping["elapsed_days"].min()),
                "median": float(mapping["elapsed_days"].median()),
                "p90": float(mapping["elapsed_days"].quantile(0.9)),
                "max": int(mapping["elapsed_days"].max()),
            }
        report[name] = {
            "validity_days": validity,
            "availability_day_included": True,
            "last_allowed_day_included": True if validity > 0 else False,
            "weekend_behavior": "availability date must fall on a decision (WTI trading) date; no shift",
            "source_is_receipt_date_not_publication": True,
            "component_rows_with_value": int(aligned.notna().sum()),
            "aligned_mapping_rows": int(len(mapping)),
            "model_train_rows": int(len(train_dates)),
            "model_val_rows": int(len(val_dates)),
            "model_train_span": [train_dates.min().date().isoformat(), train_dates.max().date().isoformat()] if len(train_dates) else None,
            "model_val_span": [val_dates.min().date().isoformat(), val_dates.max().date().isoformat()] if len(val_dates) else None,
            "distinct_dmr_observations_used": {"train": int(used_train), "val": int(used_val)},
            "reuse": reuse,
            "elapsed_days": elapsed_stats,
            "diagnostic_train_dates_present": sorted(set(mapping.loc[mapping["in_train"], "source_available_at"]))[:50] if not mapping.empty else [],
            "classes": classes,
            "criteria": {"min_train_rows": 100, "min_val_rows": 50,
                         "both_classes_train": len(classes["train_classes"]) == 2,
                         "both_classes_val": len(classes["val_classes"]) == 2},
            "record": record,
        }

    (out / "sample_diagnostics.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    for name, info in report.items():
        print(f'{name}: train={info["model_train_rows"]} val={info["model_val_rows"]} '
              f'obs(train/val)={info["distinct_dmr_observations_used"]["train"]}/{info["distinct_dmr_observations_used"]["val"]} '
              f'classes train={info["classes"]["train_classes"]} val={info["classes"]["val_classes"]} '
              f'elapsed med/max={info["elapsed_days"].get("median")}/{info["elapsed_days"].get("max")}')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
