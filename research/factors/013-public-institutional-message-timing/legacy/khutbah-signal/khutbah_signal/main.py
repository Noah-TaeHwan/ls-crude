#!/usr/bin/env python3
"""
KhutbahSignal – End-to-end research demo
Gulf sermon escalation tone → oil volatility diagnostics
"""

import sys
from pathlib import Path
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

from src.data.loader import load_sermons
from src.data.oil_data import generate_demo_oil
from src.nlp.scorer import score_text
from src.signals.engine import score_sermons, make_weekly, generate_signal, align_with_oil
from src.eval.diagnostics import correlation_report, signal_forward_vol


def main():
    print("=" * 66)
    print("KhutbahSignal – Gulf Sermon Sentiment → Oil Volatility")
    print("Research prototype (public-style sample data)")
    print("=" * 66)

    out_dir = ROOT / "output"
    out_dir.mkdir(exist_ok=True)

    # ------------------------------------------------------------------
    # 1. Load data
    # ------------------------------------------------------------------
    print("\n[1] Loading sermons and oil series...")
    sermons = load_sermons()          # sample data; pass path for real CSV
    oil = generate_demo_oil()
    print(f"    Sermons loaded : {len(sermons)}")
    print(f"    Oil series     : {oil.index[0].date()} → {oil.index[-1].date()}")

    # ------------------------------------------------------------------
    # 2. Score every sermon
    # ------------------------------------------------------------------
    print("\n[2] Scoring sermons...")
    scored = score_sermons(sermons, score_text)
    for _, r in scored.iterrows():
        print(f"    {r['date'].date()} | {r['country']:12} | "
              f"{r['score']:.2f} ({r['level']})")

    scored.to_csv(out_dir / "sermon_scores.csv", index=False)

    # ------------------------------------------------------------------
    # 3. Weekly aggregation + signal
    # ------------------------------------------------------------------
    print("\n[3] Building weekly escalation series & risk flags...")
    weekly = make_weekly(scored)
    signal = generate_signal(
        weekly,
        score_threshold=0.50,
        change_threshold=0.15,
        sustained_threshold=0.60,
    )
    print(signal[["score", "n_sermons", "signal"]].to_string())
    signal.to_csv(out_dir / "weekly_signal.csv")

    # ------------------------------------------------------------------
    # 4. Align with oil & run diagnostics
    # ------------------------------------------------------------------
    print("\n[4] Diagnostics vs oil volatility")
    print("-" * 50)
    combined = align_with_oil(signal, oil)

    corr = correlation_report(combined)
    for k, v in corr.items():
        print(f"    {k}: {v}")

    hits = signal_forward_vol(combined, forward_days=10)
    print("\n    Forward realized vol (signal ON vs OFF):")
    for k, v in hits.items():
        print(f"    {k}: {v}")

    # ------------------------------------------------------------------
    # 5. Plots
    # ------------------------------------------------------------------
    fig, axes = plt.subplots(3, 1, figsize=(12, 9), sharex=True)

    axes[0].plot(combined.index, combined["brent"], color="steelblue", lw=1.2)
    axes[0].set_ylabel("Brent (demo)")
    axes[0].set_title("Demo Brent Price")
    axes[0].grid(True, alpha=0.3)

    axes[1].plot(combined.index, combined["realized_vol_20d"],
                 color="darkorange", lw=1.1, label="20d Realized Vol")
    ymax = combined["realized_vol_20d"].max() * 1.08
    axes[1].fill_between(combined.index, 0, ymax,
                         where=combined["signal"] == 1,
                         color="crimson", alpha=0.18, label="Elevated Risk Signal")
    axes[1].set_ylabel("Realized Vol")
    axes[1].legend(loc="upper right", fontsize=8)
    axes[1].grid(True, alpha=0.3)

    axes[2].plot(combined.index, combined["score"], color="purple", lw=1.3,
                 label="Weekly Escalation Score")
    axes[2].axhline(0.50, color="gray", ls="--", alpha=0.7)
    axes[2].set_ylabel("Escalation Score")
    axes[2].set_xlabel("Date")
    axes[2].legend(loc="upper right", fontsize=8)
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plot_path = out_dir / "khutbah_signal_overview.png"
    plt.savefig(plot_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n[5] Saved plot → {plot_path}")

    print("\n" + "=" * 66)
    print("Run complete. Outputs written to ./output/")
    print("This is a research prototype using public-style sample data.")
    print("Replace samples with real public transcripts for serious work.")
    print("=" * 66)


if __name__ == "__main__":
    main()
