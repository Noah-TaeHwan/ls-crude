"""
Ornstein-Uhlenbeck Hidden Markov Model (OU-HMM)

A regime-switching mean-reverting process for cointegration spreads.
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional, Tuple
from .ou_process import OUProcess, OUParams


@dataclass
class RegimeParams:
    mu: float
    theta: float
    sigma: float

    def to_ou(self) -> OUProcess:
        return OUProcess(mu=self.mu, theta=self.theta, sigma=self.sigma)


class OUHMM:
    """
    Ornstein-Uhlenbeck process driven by a hidden Markov chain.
    
    Each regime has its own (mu, theta, sigma).
    Transition matrix is estimated via EM / Baum-Welch style updates.
    """

    def __init__(self, n_regimes: int = 3, dt: float = 1.0, max_iter: int = 50, tol: float = 1e-5):
        self.n_regimes = n_regimes
        self.dt = dt
        self.max_iter = max_iter
        self.tol = tol

        # Parameters to be estimated
        self.regimes: List[RegimeParams] = []
        self.trans_mat: np.ndarray = np.ones((n_regimes, n_regimes)) / n_regimes
        self.pi: np.ndarray = np.ones(n_regimes) / n_regimes  # initial distribution

        # Filtering results
        self.filtered_probs: Optional[np.ndarray] = None  # (T, K)
        self.smoothed_probs: Optional[np.ndarray] = None
        self.most_likely_regime: Optional[np.ndarray] = None

    def _init_params(self, path: np.ndarray):
        """Simple quantile-based initialization (no external clustering dependency)."""
        window = min(40, max(20, len(path) // 8))
        vols = pd_rolling_std(path, window)
        valid = ~np.isnan(vols)
        vol_valid = vols[valid]
        path_valid = path[valid]

        if len(vol_valid) < self.n_regimes * 10:
            self.regimes = [
                RegimeParams(mu=0.0, theta=0.10, sigma=0.015),
                RegimeParams(mu=0.02, theta=0.05, sigma=0.025),
                RegimeParams(mu=-0.015, theta=0.18, sigma=0.012),
            ][:self.n_regimes]
        else:
            quantiles = np.quantile(vol_valid, np.linspace(0, 1, self.n_regimes + 1))
            self.regimes = []
            for k in range(self.n_regimes):
                mask = (vol_valid >= quantiles[k]) & (vol_valid < quantiles[k + 1] + 1e-12)
                if mask.sum() < 15:
                    self.regimes.append(RegimeParams(mu=0.0, theta=0.1, sigma=0.02))
                    continue
                local = path_valid[mask]
                try:
                    ou = OUProcess.fit_mle(local, dt=self.dt)
                    self.regimes.append(RegimeParams(
                        mu=float(ou.params.mu),
                        theta=max(float(ou.params.theta), 0.01),
                        sigma=max(float(ou.params.sigma), 0.005)
                    ))
                except Exception:
                    self.regimes.append(RegimeParams(mu=0.0, theta=0.1, sigma=0.02))

        # Persistent transition matrix
        self.trans_mat = np.eye(self.n_regimes) * 0.88 + (1 - 0.88) / self.n_regimes
        self.pi = np.ones(self.n_regimes) / self.n_regimes

    def _emission_logprob(self, s_prev: float, s_curr: float) -> np.ndarray:
        """Log probability of observing s_curr given s_prev under each regime."""
        logp = np.zeros(self.n_regimes)
        for k, reg in enumerate(self.regimes):
            ou = reg.to_ou()
            mean = ou.conditional_mean(s_prev, steps=1)
            var = ou.conditional_var(steps=1)
            var = max(var, 1e-10)
            logp[k] = -0.5 * np.log(2 * np.pi * var) - 0.5 * (s_curr - mean)**2 / var
        return logp

    def filter(self, path: np.ndarray) -> np.ndarray:
        """
        Forward filtering: compute P(regime_t | observations up to t)
        Returns array of shape (T, K)
        """
        T = len(path)
        K = self.n_regimes
        alpha = np.zeros((T, K))
        c = np.zeros(T)  # scaling factors for numerical stability

        # t = 0
        log_emit = self._emission_logprob(path[0], path[0])  # weak
        log_alpha = np.log(self.pi + 1e-12) + log_emit
        log_alpha -= np.max(log_alpha)
        alpha[0] = np.exp(log_alpha)
        c[0] = alpha[0].sum()
        alpha[0] /= c[0]

        for t in range(1, T):
            log_emit = self._emission_logprob(path[t-1], path[t])
            log_trans = np.log(self.trans_mat + 1e-12)
            log_alpha = np.log(alpha[t-1] + 1e-12) @ log_trans.T + log_emit
            log_alpha -= np.max(log_alpha)
            alpha[t] = np.exp(log_alpha)
            c[t] = alpha[t].sum()
            alpha[t] /= c[t] + 1e-12

        self.filtered_probs = alpha
        self.most_likely_regime = np.argmax(alpha, axis=1)
        return alpha

    def fit(self, path: np.ndarray, verbose: bool = False) -> "OUHMM":
        """
        Fit OU-HMM via a simplified EM procedure.
        (Full Baum-Welch would be more accurate but this is robust and fast.)
        """
        path = np.asarray(path, dtype=float)
        path = path[~np.isnan(path)]

        self._init_params(path)
        prev_ll = -np.inf

        for it in range(self.max_iter):
            # E-step: filtering
            alpha = self.filter(path)

            # M-step: update regime parameters using hard assignment (simplified)
            hard = np.argmax(alpha, axis=1)
            for k in range(self.n_regimes):
                idx = np.where(hard == k)[0]
                if len(idx) < 20:
                    continue
                # Use consecutive pairs belonging to this regime
                segments = []
                for i in idx:
                    if i > 0 and hard[i-1] == k:
                        segments.append((path[i-1], path[i]))
                if len(segments) < 10:
                    continue
                segs = np.array(segments)
                local_path = np.concatenate([[segs[0, 0]], segs[:, 1]])
                try:
                    ou = OUProcess.fit_mle(local_path, dt=self.dt)
                    self.regimes[k] = RegimeParams(
                        mu=ou.params.mu,
                        theta=max(ou.params.theta, 0.005),
                        sigma=max(ou.params.sigma, 0.003)
                    )
                except Exception:
                    pass

            # Update transition matrix (hard counts)
            counts = np.zeros((self.n_regimes, self.n_regimes))
            for t in range(1, len(hard)):
                counts[hard[t-1], hard[t]] += 1
            row_sum = counts.sum(axis=1, keepdims=True)
            row_sum[row_sum == 0] = 1
            self.trans_mat = counts / row_sum
            # Add small persistence prior
            self.trans_mat = 0.9 * self.trans_mat + 0.1 * np.eye(self.n_regimes)
            self.trans_mat /= self.trans_mat.sum(axis=1, keepdims=True)

            if verbose and it % 5 == 0:
                print(f"Iter {it}: regimes = {[(round(r.mu,3), round(r.theta,3), round(r.sigma,3)) for r in self.regimes]}")

        # Final filter
        self.filter(path)
        return self

    def predict_next(self, s_t: float, regime_probs: Optional[np.ndarray] = None) -> Tuple[float, float]:
        """
        Mixture predictive mean and variance for next step.
        """
        if regime_probs is None:
            regime_probs = self.filtered_probs[-1] if self.filtered_probs is not None else self.pi

        means = []
        vars_ = []
        for k, reg in enumerate(self.regimes):
            ou = reg.to_ou()
            means.append(ou.conditional_mean(s_t))
            vars_.append(ou.conditional_var())

        means = np.array(means)
        vars_ = np.array(vars_)
        mix_mean = np.dot(regime_probs, means)
        # Law of total variance
        mix_var = np.dot(regime_probs, vars_ + means**2) - mix_mean**2
        return mix_mean, max(mix_var, 1e-10)

    def summary(self) -> str:
        lines = [f"OU-HMM with {self.n_regimes} regimes", "-" * 40]
        for k, r in enumerate(self.regimes):
            hl = np.log(2) / r.theta if r.theta > 0 else np.inf
            lines.append(f"Regime {k}: μ={r.mu:.4f}  θ={r.theta:.4f}  σ={r.sigma:.4f}  half-life={hl:.1f}d")
        lines.append("Transition matrix:")
        lines.append(str(np.round(self.trans_mat, 3)))
        return "\n".join(lines)


def pd_rolling_mean(x, w):
    out = np.full_like(x, np.nan, dtype=float)
    for i in range(w-1, len(x)):
        out[i] = np.mean(x[i-w+1:i+1])
    return out


def pd_rolling_std(x, w):
    out = np.full_like(x, np.nan, dtype=float)
    for i in range(w-1, len(x)):
        out[i] = np.std(x[i-w+1:i+1], ddof=1)
    return out
