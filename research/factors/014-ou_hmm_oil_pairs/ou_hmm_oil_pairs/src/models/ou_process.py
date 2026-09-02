"""
Ornstein-Uhlenbeck process utilities.
"""

import numpy as np
from dataclasses import dataclass
from typing import Tuple


@dataclass
class OUParams:
    mu: float          # long-run mean
    theta: float       # reversion speed
    sigma: float       # volatility

    def half_life(self) -> float:
        """Half-life of mean reversion in days."""
        if self.theta <= 0:
            return np.inf
        return np.log(2) / self.theta


class OUProcess:
    """
    Discrete-time Ornstein-Uhlenbeck process.
    
    S_{t+1} = S_t + theta * (mu - S_t) * dt + sigma * sqrt(dt) * eps
    """

    def __init__(self, mu: float = 0.0, theta: float = 0.1, sigma: float = 0.02, dt: float = 1.0):
        self.params = OUParams(mu=mu, theta=theta, sigma=sigma)
        self.dt = dt

    def simulate(self, n: int, s0: float = 0.0, seed: int = None) -> np.ndarray:
        rng = np.random.default_rng(seed)
        s = np.zeros(n)
        s[0] = s0
        for t in range(1, n):
            ds = self.params.theta * (self.params.mu - s[t-1]) * self.dt
            ds += self.params.sigma * np.sqrt(self.dt) * rng.normal()
            s[t] = s[t-1] + ds
        return s

    def conditional_mean(self, s_t: float, steps: int = 1) -> float:
        """E[S_{t+steps} | S_t]"""
        mu, theta = self.params.mu, self.params.theta
        return mu + (s_t - mu) * np.exp(-theta * steps * self.dt)

    def conditional_var(self, steps: int = 1) -> float:
        """Var[S_{t+steps} | S_t]"""
        theta, sigma = self.params.theta, self.params.sigma
        if theta <= 1e-8:
            return sigma**2 * steps * self.dt
        return (sigma**2 / (2 * theta)) * (1 - np.exp(-2 * theta * steps * self.dt))

    def log_likelihood(self, path: np.ndarray) -> float:
        """Exact Gaussian log-likelihood for discrete OU."""
        mu, theta, sigma = self.params.mu, self.params.theta, self.params.sigma
        dt = self.dt
        n = len(path) - 1
        if n <= 0:
            return 0.0

        a = np.exp(-theta * dt)
        var = (sigma**2 / (2 * theta)) * (1 - a**2) if theta > 1e-8 else sigma**2 * dt

        residuals = path[1:] - (mu * (1 - a) + a * path[:-1])
        ll = -0.5 * n * np.log(2 * np.pi * var) - 0.5 * np.sum(residuals**2) / var
        return ll

    @staticmethod
    def fit_mle(path: np.ndarray, dt: float = 1.0) -> "OUProcess":
        """
        Simple MLE for OU parameters via AR(1) representation.
        """
        x = path[:-1]
        y = path[1:]
        n = len(x)

        # AR(1): y = a + b * x + eps
        b = np.cov(x, y, ddof=1)[0, 1] / np.var(x, ddof=1)
        a = np.mean(y) - b * np.mean(x)
        resid = y - (a + b * x)
        var_eps = np.var(resid, ddof=1)

        # Map to OU
        theta = -np.log(max(b, 1e-6)) / dt
        mu = a / (1 - b) if abs(1 - b) > 1e-6 else np.mean(path)
        sigma = np.sqrt(var_eps * 2 * theta / (1 - b**2)) if theta > 1e-8 else np.sqrt(var_eps / dt)

        return OUProcess(mu=mu, theta=max(theta, 1e-4), sigma=max(sigma, 1e-6), dt=dt)
