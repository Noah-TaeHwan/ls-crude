"""Render the source-checked 091-O airport sample without modelling it."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091OZ" / "figures"


def main() -> None:
    # Report date is the available-at date. Metric periods are not separately stated.
    rows = [
        ("2023-05-15", 3600, 3200, 11, 36, 31),
        ("2023-06-20", 4800, 4700, 7, 38, 31),
        ("2023-07-17", 4400, 4500, 6, 41, 31),
        ("2023-09-18", 5300, 3600, 4, 48, 31),
    ]
    frame = pd.DataFrame(
        rows,
        columns=["report_date", "jet_a_gallons", "avgas_gallons", "ramp_stays_and_rentals", "survival_flight_operations", "based_aircraft"],
    )
    if len(frame) != 4 or frame["report_date"].duplicated().any():
        raise ValueError("091-O expects the fixed four-report source sample")

    OUT.mkdir(parents=True, exist_ok=True)
    frame.to_csv(OUT.parent / "091o_airport_sample.csv", index=False)
    labels = pd.to_datetime(frame["report_date"]).dt.strftime("%b %d")
    x = range(len(frame))
    fig, (ax_fuel, ax_ops) = plt.subplots(2, 1, figsize=(10, 7.2), constrained_layout=True)
    fig.suptitle("091-O — Cushing Municipal Airport: actual monthly-report sample", fontsize=14, fontweight="bold")

    width = 0.36
    ax_fuel.bar([i - width / 2 for i in x], frame["jet_a_gallons"], width, label="Jet-A", color="#1d4f91")
    ax_fuel.bar([i + width / 2 for i in x], frame["avgas_gallons"], width, label="AvGas", color="#57a773")
    ax_fuel.set_ylabel("reported gallons")
    ax_fuel.set_xticks(list(x), labels)
    ax_fuel.legend(frameon=False, ncol=2)
    ax_fuel.grid(axis="y", alpha=0.2)
    ax_fuel.set_title("Fuel sales — report date is availability date, not an inferred activity month", loc="left", fontsize=10)

    ax_ops.plot(list(x), frame["ramp_stays_and_rentals"], marker="o", linewidth=2.2, color="#d26a28", label="Ramp stays / rentals")
    ax_ops.plot(list(x), frame["survival_flight_operations"], marker="o", linewidth=2.2, color="#6b4c9a", label="Survival Flight support")
    ax_ops.set_ylabel("reported count")
    ax_ops.set_xticks(list(x), labels)
    ax_ops.legend(frameon=False, ncol=2)
    ax_ops.grid(axis="y", alpha=0.2)
    ax_ops.set_title("Operations — based aircraft was unchanged at 31 in all four reports", loc="left", fontsize=10)
    fig.text(0.01, 0.005, "Observation only: n=4, one irregular gap; no association, score, or oil inference is calculated.", fontsize=8.5)
    fig.savefig(OUT / "091o-airport-activity-sample.svg", format="svg", bbox_inches="tight")
    fig.savefig(OUT / "091o-airport-activity-sample.png", dpi=180, bbox_inches="tight")


if __name__ == "__main__":
    main()
