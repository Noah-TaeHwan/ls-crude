"""Render the one-time eligibility audit; this is not a hiring time series."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091UZ"


def main() -> None:
    frame = pd.read_csv(OUT / "091u_public_snapshot_2026-09-08.csv")
    counts = frame.groupby("employer", sort=False).size()
    fig, ax = plt.subplots(figsize=(9.5, 4.8), constrained_layout=True)
    bars = ax.bar(counts.index, counts.values, color="#38598b", width=.58)
    ax.bar_label(bars, labels=["1 eligible role"] * len(bars), padding=3, fontsize=10)
    ax.set_ylim(0, 1.45)
    ax.set_ylabel("unique eligible public postings")
    ax.set_title("091-U — one-time Cushing industrial-job eligibility audit", loc="left", fontweight="bold")
    ax.grid(axis="y", alpha=.2)
    ax.set_axisbelow(True)
    ax.text(.01, -.22, "Snapshot only: four distinct high-confidence roles passed frozen rules. This is not a historical count, trend, hiring estimate, or activity test.", transform=ax.transAxes, fontsize=8.8)
    png = OUT / "figures" / "091u-public-eligibility-snapshot.png"
    svg = OUT / "figures" / "091u-public-eligibility-snapshot.svg"
    png.parent.mkdir(exist_ok=True)
    fig.savefig(png, dpi=180, bbox_inches="tight")
    fig.savefig(svg, format="svg", bbox_inches="tight")
    svg.write_text("\n".join(line.rstrip() for line in svg.read_text(encoding="utf-8").splitlines()) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
