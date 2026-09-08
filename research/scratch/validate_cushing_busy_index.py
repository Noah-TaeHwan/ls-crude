"""Empirical Validation & Comparison of Linear Regression, Machine Learning, and Deep Learning for Cushing Busy Index.
"""

from __future__ import annotations

import sys
sys.path.insert(0, "research/src")

import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, r2_score

from ls_crude.features.cushing_busy_index import (
    CushingBusyModelEnsemble,
    engineer_cushing_features,
)


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, fut_vol: np.ndarray) -> dict[str, float]:
    r2 = r2_score(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    corr_true = np.corrcoef(y_true, y_pred)[0, 1] if np.std(y_pred) > 0 else 0.0
    corr_vol = np.corrcoef(y_pred, fut_vol)[0, 1] if np.std(y_pred) > 0 else 0.0
    return {
        "R2": r2,
        "RMSE": rmse,
        "Corr_Target": corr_true,
        "Corr_Fut_Vol5d": corr_vol,
    }


def main():
    print("=" * 80)
    print(" [CUSHING BUSY INDEX] Linear Regression vs ML vs DL Empirical Audit")
    print("=" * 80)

    # 1. Feature Engineering
    print("\n[Step 1] Engineering Physical & Microstructure Features...")
    df = engineer_cushing_features("research/data/clf-daily-2015-2026.csv")
    print(f"Total valid trading days: {len(df)}")
    
    train_df = df[df["sample"] == "in"].copy()
    test_df = df[df["sample"] == "out"].copy()
    print(f"  * In-Sample  (Train: 2016-2023): N = {len(train_df)}")
    print(f"  * Out-Sample (Test:  2024-2026): N = {len(test_df)}")

    # 2. Fit Models
    print("\n[Step 2] Fitting Linear (Ridge), ML (Gradient Boosting), and DL (Deep MLP)...")
    ensemble = CushingBusyModelEnsemble()
    ensemble.fit(train_df, target_col="cushing_busy_true")

    # Predict on IS and OOS
    train_preds = ensemble.predict(train_df)
    test_preds = ensemble.predict(test_df)

    # 3. Model Performance Comparison Table
    print("\n" + "=" * 80)
    print(" [PERFORMANCE MATRIX] In-Sample (2016-2023) vs Out-of-Sample (2024-2026)")
    print("=" * 80)
    print(f"{'Model Architecture':<22} | {'IS R2':<8} | {'OOS R2':<8} | {'OOS RMSE':<9} | {'OOS Target r':<13} | {'OOS FutVol r':<13}")
    print("-" * 80)

    models = [
        ("1. Linear (Ridge)", "pred_linear"),
        ("2. Machine Learning (GBM)", "pred_ml"),
        ("3. Deep Learning (MLP)", "pred_dl"),
        ("4. Hybrid Ensemble", "pred_ensemble"),
    ]

    results_table = []
    for m_label, m_key in models:
        is_metrics = evaluate_predictions(
            train_df["cushing_busy_true"].values,
            train_preds[m_key],
            train_df["target_fut_vol_5d"].values,
        )
        oos_metrics = evaluate_predictions(
            test_df["cushing_busy_true"].values,
            test_preds[m_key],
            test_df["target_fut_vol_5d"].values,
        )
        results_table.append((m_label, is_metrics, oos_metrics))
        print(
            f"{m_label:<22} | {is_metrics['R2']:+0.4f}  | {oos_metrics['R2']:+0.4f}  | {oos_metrics['RMSE']:<9.2f} | {oos_metrics['Corr_Target']:+0.4f}        | {oos_metrics['Corr_Fut_Vol5d']:+0.4f}"
        )

    # 4. Feature Importance Comparison
    print("\n" + "=" * 80)
    print(" [FEATURE IMPORTANCE] Linear vs ML Feature Contribution Ranking")
    print("=" * 80)
    
    linear_coefs = np.abs(ensemble.model_linear.coef_)
    linear_rank = np.argsort(-linear_coefs)
    
    ml_importances = ensemble.model_ml.feature_importances_
    ml_rank = np.argsort(-ml_importances)

    print(f"{'Rank':<5} | {'Linear Model Top Factors':<35} | {'ML (Gradient Boosting) Top Factors':<35}")
    print("-" * 80)
    for r in range(len(ensemble.FEATURE_COLS)):
        lin_feat = f"{ensemble.FEATURE_COLS[linear_rank[r]]} ({linear_coefs[linear_rank[r]]:.3f})"
        ml_feat = f"{ensemble.FEATURE_COLS[ml_rank[r]]} ({ml_importances[ml_rank[r]]:.1%})"
        print(f"#{r+1:<4} | {lin_feat:<35} | {ml_feat:<35}")

    # 5. Regime Analysis: High Busy (>70) vs Low Busy (<40)
    print("\n" + "=" * 80)
    print(" [REGIME CLASSIFICATION] Cushing Congestion Level vs Future Market Reaction")
    print("=" * 80)
    
    test_df["cushing_busy_score"] = test_preds["pred_ensemble"]
    high_busy = test_df[test_df["cushing_busy_score"] >= 65]
    normal_busy = test_df[(test_df["cushing_busy_score"] >= 45) & (test_df["cushing_busy_score"] < 65)]
    low_busy = test_df[test_df["cushing_busy_score"] < 45]

    print(f"OOS Total Days (2024-2026): N = {len(test_df)}")
    print(f"  * High Congestion Regime (Busy Score >= 65):  N = {len(high_busy):<3} ({len(high_busy)/len(test_df):.1%})")
    print(f"     - Future 5-day Realized Volatility: {high_busy['target_fut_vol_5d'].mean():.2%}")
    print(f"     - Future 5-day Avg Return:          {high_busy['target_fut_ret_5d'].mean():+.2%}")
    print(f"     - Up Rate:                          {(high_busy['target_fut_ret_5d'] > 0).mean():.1%}")
    
    print(f"  * Normal Operating Regime (45 <= Score < 65): N = {len(normal_busy):<3} ({len(normal_busy)/len(test_df):.1%})")
    print(f"     - Future 5-day Realized Volatility: {normal_busy['target_fut_vol_5d'].mean():.2%}")
    print(f"     - Future 5-day Avg Return:          {normal_busy['target_fut_ret_5d'].mean():+.2%}")
    
    print(f"  * Low Activity / Slack Regime (Score < 45):    N = {len(low_busy):<3} ({len(low_busy)/len(test_df):.1%})")
    print(f"     - Future 5-day Realized Volatility: {low_busy['target_fut_vol_5d'].mean():.2%}")
    print(f"     - Future 5-day Avg Return:          {low_busy['target_fut_ret_5d'].mean():+.2%}")

if __name__ == "__main__":
    main()
