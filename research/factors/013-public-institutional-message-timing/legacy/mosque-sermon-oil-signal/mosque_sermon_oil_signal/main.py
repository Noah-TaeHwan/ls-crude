#!/usr/bin/env python3
"""
Mosque Sermon Sentiment → Oil Volatility Signal
Research prototype demo
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).parent))

from src.data.loader import load_demo_data
from src.nlp.scorer import score_sermon
from src.signals.generator import (
    aggregate_weekly_scores,
    generate_risk_signal,
    join_with_oil,
)
from src.utils.metrics import correlation_summary, signal_hit_rate


def main():
    print("=" * 65)
    print("Mosque Sermon Sentiment → Oil Volatility Signal")
    print("Research Prototype (Public Data / Synthetic Demo)")
    print("=" * 65)

    # 1. Load data
    print("\n[1] Loading sample sermons and synthetic oil series...")
    sermons, oil = load_demo_data()
    print(f"    Sermons: {len(sermons)} excerpts")
    print(f"    Oil series: {oil.index[0].date()} → {oil.index[-1].date()}")

    # 2. Score each sermon
    print("\n[2] Scoring sermons for escalation level...")
    scores = []
    for _, row in sermons.iterrows():
        result = score_sermon(row["text"])
        scores.append({
            "date": row["date"],
            "country": row["country"],
            "score": result["score"],
            "level": result["level"],
            "tense_hits": result["tense_hits"],
            "hostile_hits": result["hostile_hits"],
            "warcry_hits": result["warcry_hits"],
        })
        print(f"    {row['date'].date()} | {row['country']:12} | "
              f"score={result['score']:.2f} ({result['level']})")

    score_df = pd.DataFrame(scores)

    # 3. Weekly aggregation + signal
    print("\n[3] Building weekly escalation series and risk signal...")
    weekly = aggregate_weekly_scores(score_df)
    signal = generate_risk_signal(weekly, score_threshold=0.50, change_threshold=0.15)
    print(signal[["score", "n_sermons", "signal"]].to_string())

    # 4. Join with oil
    combined = join_with_oil(signal, oil)

    # 5. Simple evaluation
    print("\n[4] Correlation & signal diagnostics")
    print("-" * 50)
    corr = correlation_summary(combined)
    for k, v in corr.items():
        print(f"    {k}: {v}")

    hits = signal_hit_rate(combined, forward_days=10)
    print("\n    Forward volatility when signal is ON vs OFF:")
    for k, v in hits.items():
        print(f"    {k}: {v}")

    # 6. Plots
    out_dir = Path("output")
    out_dir.mkdir(exist_ok=True)

    fig, axes = plt.subplots(3, 1, figsize=(12, 9), sharex=True)

    # Oil price
    axes[0].plot(combined.index, combined["brent"], color="steelblue", lw=1.2)
    axes[0].set_ylabel("Brent (synthetic)")
    axes[0].set_title("Synthetic Brent Price")
    axes[0].grid(True, alpha=0.3)

    # Realized vol + signal
    axes[1].plot(combined.index, combined["realized_vol_20d"], color="darkorange", lw=1.1, label="20d Realized Vol")
    axes[1].fill_between(combined.index, 0, combined["realized_vol_20d"].max() * 1.05,
                         where=combined["signal"] == 1, color="red", alpha=0.15, label="Elevated Risk Signal")
    axes[1].set_ylabel("Realized Vol")
    axes[1].legend(loc="upper right")
    axes[1].grid(True, alpha=0.3)

    # Sermon score
    axes[2].plot(combined.index, combined["score"], color="purple", lw=1.3, label="Weekly Escalation Score")
    axes[2].axhline(0.5, color="gray", ls="--", alpha=0.7)
    axes[2].set_ylabel("Escalation Score")
    axes[2].set_xlabel("Date")
    axes[2].legend(loc="upper right")
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plot_path = out_dir / "sermon_score_vs_oil.png"
    plt.savefig(plot_path, dpi=150, bbox_inches="tight")
    print(f"\n[5] Saved plot → {plot_path}")
    plt.close()

    # Save tables
    score_df.to_csv(out_dir / "sermon_scores.csv", index=False)
    signal.to_csv(out_dir / "weekly_signal.csv")
    print(f"    Saved sermon scores → {out_dir / 'sermon_scores.csv'}")
    print(f"    Saved weekly signal → {out_dir / 'weekly_signal.csv'}")

    print("\n" + "=" * 65)
    print("Demo complete.")
    print("This is a research prototype using synthetic / public-style data.")
    print("Real-world application requires careful data collection, validation,")
    print("and ethical / legal review.")
    print("=" * 65)


if __name__ == "__main__":
    main()
