"""Render the CFAM evidence gates; it is a status board, never a factor score."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "indexes" / "091-cushing-operations-nowcasting" / "20260908T091OZ" / "figures"


def main() -> None:
    # 2 = pass, 1 = partial/short sample, 0 = fail or blocked.
    tracks = [
        ("A lodging + trucks", [1, 1, 0, 1, 0]),
        ("B nightlights", [2, 1, 2, 2, 0]),
        ("C context bridge", [2, 0, 2, 2, 0]),
        ("D tank shadows", [1, 0, 0, 0, 0]),
        ("E pipeline notices", [1, 1, 0, 0, 0]),
        ("F sales/use tax", [1, 1, 0, 0, 0]),
        ("G police aggregates", [1, 0, 0, 1, 0]),
        ("H travel search", [2, 0, 2, 1, 0]),
        ("I aggregate mobility", [2, 0, 0, 0, 0]),
        ("J proximity activity", [1, 0, 0, 0, 0]),
        ("K telecom mobility", [0, 0, 0, 0, 0]),
        ("L policy pathway", [1, 0, 0, 0, 0]),
        ("M municipal jobs", [1, 0, 0, 0, 0]),
        ("N city data map", [2, 0, 0, 0, 0]),
        ("O airport reports", [2, 1, 0, 2, 0]),
    ]
    labels = ["actual\npublic sample", "measures\nintended state", "60+ month\npanel", "individual\nvisualization", "association /\ncombination"]
    values = np.array([row[1] for row in tracks])
    colors = np.array(["#d9d9d9", "#f6c85f", "#5aa469"])[values]
    fig, ax = plt.subplots(figsize=(10.6, 8.7))
    fig.subplots_adjust(left=0.25, right=0.985, top=0.84, bottom=0.12)
    for y in range(values.shape[0]):
        for x in range(values.shape[1]):
            ax.add_patch(plt.Rectangle((x, y), 1, 1, facecolor=colors[y, x], edgecolor="white", linewidth=1.4))
    ax.set_xlim(0, len(labels))
    ax.set_ylim(len(tracks), 0)
    ax.set_xticks(np.arange(len(labels)) + 0.5, labels)
    ax.set_yticks(np.arange(len(tracks)) + 0.5, [row[0] for row in tracks])
    ax.tick_params(top=True, bottom=False, labeltop=True, labelbottom=False, length=0)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.set_title("091 CFAM — workflow gateboard (not a composite factor score)", loc="left", pad=38, fontsize=14, fontweight="bold")
    fig.text(0.01, 0.025, "Green = passed at that stage; amber = partial / short sample; grey = unavailable, failed or deliberately not run.\nA series cannot advance by compensating for a grey column with another track.", fontsize=8.5)
    OUT.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT / "091-workflow-gateboard.svg", format="svg", bbox_inches="tight")
    fig.savefig(OUT / "091-workflow-gateboard.png", dpi=180, bbox_inches="tight")


if __name__ == "__main__":
    main()
