"""Render the actual-overlap audit for the two pre-registered CFAM mixes.

It does not fit a factor model: the A/F overlap is three rows, S has no
forward observations, and airport reports do not state metric periods.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091COMBOZ"
FIG = OUT / "figures"


def clean_svg(fig: plt.Figure, name: str) -> None:
    path = FIG / name
    fig.savefig(path, format="svg", bbox_inches="tight")
    path.write_text("\n".join(line.rstrip() for line in path.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    FIG.mkdir(parents=True, exist_ok=True)
    # Exact tax-month values from the official September 2023 City Manager Report.
    tax = pd.DataFrame(
        {
            "tax_month": pd.to_datetime(["2023-05-01", "2023-06-01", "2023-07-01"]),
            "hotel_motel_tax_usd": [7460.20, 7433.66, 6088.32],
            "sales_tax_usd": [556914.55, 553851.71, 510833.95],
            "use_tax_usd": [64104.31, 106137.08, 129448.38],
        }
    )
    airport = pd.to_datetime(["2023-05-15", "2023-06-20", "2023-07-17", "2023-09-18"])
    tax.to_csv(OUT / "091a_f_exact_three_month_overlap.csv", index=False)

    fig, axes = plt.subplots(3, 1, figsize=(11, 11.4), constrained_layout=True, height_ratios=[1.2, 1.4, 1.65])
    fig.suptitle("CFAM 091 — attempted combinations: actual overlap and readiness", fontsize=15, fontweight="bold")

    ax = axes[0]
    x0, x1 = pd.Timestamp("2023-04-20"), pd.Timestamp("2023-10-01")
    for y in [0, 1, 2]:
        ax.hlines(y, x0, x1, color="#d7dde8", linewidth=4)
    ax.scatter(tax["tax_month"], [2] * len(tax), s=90, color="#38598b", label="A/F aligned tax month (n=3)", zorder=3)
    ax.scatter(airport, [1] * len(airport), s=90, marker="D", color="#d4772a", label="O report date (n=4)", zorder=3)
    ax.text(pd.Timestamp("2023-06-15"), 0, "S: 0 forward-observation rows", va="center", ha="center", color="#8a3030", fontsize=10)
    ax.set_yticks([0, 1, 2], ["091-S live labels", "091-O airport reports", "091-A/F tax months"])
    ax.set_xlim(x0, x1)
    ax.xaxis.set_major_locator(mdates.MonthLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b\n%Y"))
    ax.grid(axis="x", alpha=.2)
    ax.legend(loc="upper left", ncol=2, frameon=False, fontsize=8.5)
    ax.set_title("Shared-time check — dates are not a valid matched panel", loc="left", fontsize=11, fontweight="bold")
    ax.text(0, -0.32, "Airport reports lack stated activity periods, so their dates cannot be paired with tax months.", transform=ax.transAxes, fontsize=8.6)

    ax = axes[1]
    ax.plot(tax["tax_month"], tax["hotel_motel_tax_usd"], marker="o", color="#244f85", linewidth=2.2, label="Hotel/Motel tax")
    ax.set_ylabel("hotel/motel tax (USD)", color="#244f85")
    ax.tick_params(axis="y", labelcolor="#244f85")
    ax.set_xticks(tax["tax_month"], [date.strftime("%b %Y") for date in tax["tax_month"]])
    ax.grid(axis="y", alpha=.2)
    right = ax.twinx()
    right.plot(tax["tax_month"], tax["sales_tax_usd"], marker="s", color="#c66a27", linewidth=2.2, label="Sales tax")
    right.plot(tax["tax_month"], tax["use_tax_usd"], marker="^", color="#4f936d", linewidth=2.2, label="Use tax")
    right.set_ylabel("sales / use tax (USD)")
    h1, l1 = ax.get_legend_handles_labels()
    h2, l2 = right.get_legend_handles_labels()
    ax.legend(h1 + h2, l1 + l2, loc="upper left", frameon=False, ncol=3, fontsize=8.5)
    ax.set_title("A × F — the only exact common-month sample has n=3", loc="left", fontsize=11, fontweight="bold")
    ax.text(0, -0.29, "No residual, correlation, ranking or regression: month-of-year control and a 60-month history are absent.", transform=ax.transAxes, fontsize=8.6)

    ax = axes[2]
    rows = ["S × O", "A residualised by F", "D × validated city support"]
    stages = ["actual inputs", "shared valid timing", "minimum panel", "result"]
    matrix = [[0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]]
    palette = {0: "#d65858", 1: "#e6a93b"}
    for y, row in enumerate(matrix):
        for x, value in enumerate(row):
            ax.scatter(x, y, s=1500, marker="s", color=palette[value], edgecolor="white", linewidth=2)
            ax.text(x, y, "partial" if value else "no", ha="center", va="center", fontsize=9, color="white", fontweight="bold")
    ax.set_xticks(range(len(stages)), stages)
    ax.set_yticks(range(len(rows)), rows)
    ax.invert_yaxis()
    ax.set_xlim(-.55, len(stages)-.45)
    ax.set_ylim(len(rows)-.45, -.55)
    ax.set_title("Combination gate result — no fitted combination is permitted", loc="left", fontsize=11, fontweight="bold")
    ax.text(0, 1.12, "orange = a partial source sample exists; red = requirement has not been met", transform=ax.transAxes, fontsize=8.6)
    for spine in ax.spines.values():
        spine.set_visible(False)

    clean_svg(fig, "091-combination-readiness-audit.svg")
    fig.savefig(FIG / "091-combination-readiness-audit.png", dpi=180, bbox_inches="tight")


if __name__ == "__main__":
    main()
