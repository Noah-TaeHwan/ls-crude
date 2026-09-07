# ALT-20260907-20 — HY OAS / CODC residual receipt

## 사전 정의

| 항목 | 값 |
| --- | --- |
| 후보 ID / 카드 | ALT-20260907-20 / `research/candidates/ALT-20260907-20.md` |
| 버전 / 작성 | v0 2026-09-07 |
| 가설 | HY credit stress residual vs WTI co-moves with future WTI RV |
| 산식 A | Δ daily `BAMLH0A0HYM2` |
| 산식 B | residual = OAS − (a + b log CL Close); a,b fit **IS only** |
| available_at | obs + 1 calendar day → next CL session |
| 타깃 | next 5d WTI RV |

## 실행 manifest — 20260907T064559Z

| 역할 | 경로 |
| --- | --- |
| raw | `research/gathering/raw/ALT-20260907-20/20260907T064559Z/BAMLH0A0HYM2.csv` |
| processed | `research/data/processed/ALT-20260907-20/20260907T064559Z/` |
| plots | shared with ALT-03: `../ALT-20260907-04/20260907T064559Z/series_20260907T064559Z.png`, `../ALT-20260907-04/20260907T064559Z/scatter_is_20260907T064559Z.png` |
| results | `research/reports/2026-09-07-joint-hunt-portwatch-hyoas.json` |
| script | `research/notebooks/ALT-20260907-04/run_portwatch_hyoas_hunt.py` |

### 가정 수치 (IS fit)

- `codc_beta_is` ≈ 1.838
- `codc_alpha_is` ≈ -4.105

### 결과 요약

| index | IS r (RV5) | OOS r (RV5) |
| --- | ---: | ---: |
| Δ OAS | +0.107 (n=63) | -0.009 (n=543) |
| CODC residual | +0.390 (n=64) | **-0.297 (n=527)** |

**Decision:** KILL — OOS sign flip on residual; not a WTI RV candidate.

### Robustness notes

1. Small IS n for daily series after alignment — treat IS |r| with caution; OOS flip is decisive.
2. Residual uses contemporaneous CL in the fit equation then lags availability by 1d; still market-on-market, not pizza-class activity.
