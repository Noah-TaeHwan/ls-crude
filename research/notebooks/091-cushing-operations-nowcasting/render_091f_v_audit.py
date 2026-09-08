"""Render a descriptive audit for 091-F tax split and 091-V permits.

The three monthly tax ratios are explicitly not treated as a residual or
project-material signal; Cushing's municipal permit register is not public.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091FVZ"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "figures").mkdir(exist_ok=True)
    frame = pd.DataFrame(
        {
            "tax_month": ["2023-05", "2023-06", "2023-07"],
            "sales_tax_usd": [556914.55, 553851.71, 510833.95],
            "use_tax_usd": [64104.31, 106137.08, 129448.38],
        }
    )
    frame["use_to_sales_ratio"] = frame["use_tax_usd"] / frame["sales_tax_usd"]
    frame.to_csv(OUT / "091f_three_month_tax_split.csv", index=False)

    fig, (ax, gate) = plt.subplots(2, 1, figsize=(10, 7.4), constrained_layout=True, height_ratios=[1.25, 1])
    ax.plot(frame["tax_month"], frame["use_to_sales_ratio"] * 100, color="#4f936d", marker="o", linewidth=2.5)
    for x, y in zip(frame["tax_month"], frame["use_to_sales_ratio"] * 100):
        ax.annotate(f"{y:.1f}%", (x, y), textcoords="offset points", xytext=(0, 8), ha="center", fontsize=10)
    ax.set_ylim(0, max(frame["use_to_sales_ratio"] * 100) * 1.35)
    ax.set_ylabel("use tax / sales tax")
    ax.set_title("091-F — exact public tax split: three common tax months", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=.25)
    ax.text(0, -.26, "Descriptive only: the ratio rises 11.5% → 19.2% → 25.3%, but n=3 cannot establish a residual, seasonality, materials inflow, or Cushing activity relationship.", transform=ax.transAxes, fontsize=8.6)

    rows = ["Municipal building-permit count", "County building-permit count", "State DEQ industrial permit record"]
    state = ["not public", "not found", "one actual public record"]
    colors = ["#d65858", "#d65858", "#e6a93b"]
    for y, (label, text, color) in enumerate(zip(rows, state, colors)):
        gate.barh(y, 1, color=color, height=.58)
        gate.text(.5, y, text, color="white", ha="center", va="center", fontweight="bold")
    gate.set_yticks(range(len(rows)), rows)
    gate.set_xlim(0, 1)
    gate.set_xticks([])
    gate.invert_yaxis()
    gate.set_title("091-V — data-access audit, not a permit-volume model", loc="left", fontweight="bold")
    gate.text(0, 1.12, "DEQ provides a dated facility review, but it is an environmental-permit workflow—not a building/construction count.", transform=gate.transAxes, fontsize=8.6)
    for spine in gate.spines.values():
        spine.set_visible(False)

    svg = OUT / "figures" / "091f-v-tax-and-permit-audit.svg"
    fig.savefig(svg, format="svg", bbox_inches="tight")
    fig.savefig(OUT / "figures" / "091f-v-tax-and-permit-audit.png", dpi=180, bbox_inches="tight")
    svg.write_text("\n".join(line.rstrip() for line in svg.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
