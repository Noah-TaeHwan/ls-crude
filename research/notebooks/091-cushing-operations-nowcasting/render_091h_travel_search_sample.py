"""Render the literal public Google Trends sample used by CFAM 091-H.

This is a coverage and measurement-validity visualisation, not a price or
inventory backtest.  The source CSV is intentionally kept in gathering/raw
and excluded from git; its receipt records retrieval time and SHA-256.
"""

from __future__ import annotations

import csv
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import MaxNLocator


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "gathering/raw/ALT-20260908-08/20260908T032746Z/google-trends-how-to-get-to-cushing-us-all-2004-present.csv"
OUTPUT = ROOT / "indexes/091-cushing-operations-nowcasting/20260908T091HGZ/figures/091h-cushing-travel-search-sample.svg"


def main() -> None:
    months: list[str] = []
    values: list[float] = []
    with SOURCE.open(encoding="utf-8-sig", newline="") as handle:
        rows = csv.reader(handle)
        next(rows)  # Google Trends category metadata
        next(rows)  # column labels
        for row in rows:
            if not row or len(row) < 2 or not row[0][:4].isdigit():
                continue
            if 2015 <= int(row[0][:4]) <= 2023:
                months.append(row[0])
                values.append(float(row[1]))

    dates = [__import__("datetime").datetime.strptime(month, "%Y-%m") for month in months]
    zeros = sum(value == 0 for value in values)

    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(11, 4.4), constrained_layout=True)
    ax.plot(dates, values, color="#9b1c31", linewidth=1.7, label="Google Trends relative interest")
    ax.scatter([date for date, value in zip(dates, values) if value == 0], [0] * zeros, color="#5c6470", s=12, label="reported zero")
    ax.set_title('091-H feasibility sample: US query "how to get to cushing"')
    ax.set_ylabel("relative interest (0–100; query-specific normalization)")
    ax.set_xlabel("month")
    ax.set_ylim(-3, 105)
    ax.yaxis.set_major_locator(MaxNLocator(6))
    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    ax.legend(loc="upper left", frameon=True)
    ax.text(
        0.01,
        0.03,
        f"2015–2023: {len(values)} months; {zeros} zero months.  This is search interest, not visits or field activity.",
        transform=ax.transAxes,
        fontsize=9,
        color="#30343b",
    )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUTPUT, format="svg", metadata={"Date": "2026-09-08"})
    # Matplotlib emits whitespace-only SVG path continuation lines.  Normalise
    # them so the checked-in research artifact passes repository whitespace
    # validation without changing the rendered figure.
    OUTPUT.write_text(
        "\n".join(line.rstrip() for line in OUTPUT.read_text(encoding="utf-8").splitlines()) + "\n",
        encoding="utf-8",
    )
    plt.close(fig)


if __name__ == "__main__":
    main()
