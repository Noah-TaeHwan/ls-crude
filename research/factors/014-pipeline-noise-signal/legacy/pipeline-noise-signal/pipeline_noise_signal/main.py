#!/usr/bin/env python3
"""
Pipeline Noise Signal – Acoustic early-warning research demo
"""

import sys
from pathlib import Path
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

from src.data.loader import load_demo_acoustic
from src.data.oil_data import generate_demo_oil
from src.signals.engine import run_detection, align_with_oil
from src.eval.diagnostics import correlation_report, signal_forward_stats


def main():
    print("=" * 66)
    print("Pipeline Noise Signal – Acoustic Early Warning Research")
    print("=" * 66)

    out_dir = ROOT / "output"
    out_dir.mkdir(exist_ok=True)

    # 1. Load acoustic + oil
    print("\n[1] Generating demo acoustic energy series for major corridors...")
    energy = load_demo_acoustic()
    oil = generate_demo_oil()
    print(f"    Corridors : {list(energy.columns)}")
    print(f"    Period    : {energy.index[0].date()} → {energy.index[-1].date()}")

    # 2. Detection
    print("\n[2] Running anomaly detection (baseline + 30% spike rule)...")
    baseline, spikes, risk = run_detection(
        energy,
        baseline_window=21,
        threshold_pct=0.30,
        multi_min=2,
    )
    print(f"    Days with ≥1 corridor spiking : {(risk['signal']==1).sum()}")
    print(f"    Days with multi-corridor risk : {(risk['high_risk']==1).sum()}")

    risk.to_csv(out_dir / "risk_flags.csv")
    spikes.to_csv(out_dir / "spike_matrix.csv")

    # 3. Align & diagnostics
    print("\n[3] Diagnostics vs oil volatility")
    print("-" * 50)
    combined = align_with_oil(risk, oil)

    corr = correlation_report(combined)
    for k, v in corr.items():
        print(f"    {k}: {v}")

    stats = signal_forward_stats(combined, forward_days=10)
    print("\n    Forward vol statistics:")
    for k, v in stats.items():
        print(f"    {k}: {v}")

    # 4. Plots
    fig, axes = plt.subplots(4, 1, figsize=(12, 11), sharex=True)

    # Acoustic energy
    for col in energy.columns:
        axes[0].plot(energy.index, energy[col], lw=1.0, label=col, alpha=0.85)
    axes[0].set_ylabel("Acoustic Energy Proxy")
    axes[0].set_title("Corridor Acoustic Energy (demo)")
    axes[0].legend(loc="upper right", fontsize=7, ncol=2)
    axes[0].grid(True, alpha=0.3)

    # Risk score
    axes[1].plot(risk.index, risk["risk_score"], color="darkred", lw=1.2)
    axes[1].set_ylabel("Risk Score")
    axes[1].grid(True, alpha=0.3)

    # Oil price
    axes[2].plot(combined.index, combined["brent"], color="steelblue", lw=1.2)
    axes[2].set_ylabel("Brent (demo)")
    axes[2].grid(True, alpha=0.3)

    # Realized vol + flags
    axes[3].plot(combined.index, combined["realized_vol_20d"],
                 color="darkorange", lw=1.1, label="20d Realized Vol")
    ymax = combined["realized_vol_20d"].max() * 1.1
    axes[3].fill_between(combined.index, 0, ymax,
                         where=combined["signal"] == 1,
                         color="crimson", alpha=0.15, label="Signal ON")
    axes[3].fill_between(combined.index, 0, ymax,
                         where=combined["high_risk"] == 1,
                         color="black", alpha=0.12, label="High Risk (multi)")
    axes[3].set_ylabel("Realized Vol")
    axes[3].legend(loc="upper right", fontsize=8)
    axes[3].grid(True, alpha=0.3)

    plt.tight_layout()
    plot_path = out_dir / "pipeline_noise_overview.png"
    plt.savefig(plot_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n[4] Saved plot → {plot_path}")

    print("\n" + "=" * 66)
    print("Demo complete. Outputs in ./output/")
    print("Replace synthetic series with real IRIS/USGS/EMSC extracts")
    print("for serious research. This is an experimental framework only.")
    print("=" * 66)


if __name__ == "__main__":
    main()
