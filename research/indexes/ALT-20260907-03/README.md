# ALT-20260907-03 — PortWatch Hormuz index receipt

## 사전 정의

| 항목 | 값 |
| --- | --- |
| 후보 ID / 카드 | ALT-20260907-03 / `research/candidates/ALT-20260907-03.md` |
| 버전 / 작성 | v0 2026-09-07 / 오태환(에이전트 보조) |
| 가설 | Hormuz `n_total` 활동 이상 → WTI 단기 RV |
| 산식 | 20일 rolling z-score of daily `n_total` |
| 단위·빈도·지역 | vessels z; daily; Strait of Hormuz |
| 결측 | 미관측일을 0으로 채우지 않음; z 워밍업 min_periods=10 |
| available_at | observation_date + 9 calendar days → next CL session (보수; FAQ 미확정) |
| 타깃 | next 5 trading-day WTI RV; ret1 보조; lag curve k=-5..5; placebo = +180d calendar shift |
| 판정 기준 | IS·OOS 동부호·실무 크기 + placebo 약함 → KEEP 검토; 아니면 PARK/KILL |

## 실행 manifest — 20260907T064559Z

| 역할 | 경로 | SHA-256 | 기간/행 |
| --- | --- | --- | --- |
| raw | `research/gathering/raw/ALT-20260907-03/20260907T064559Z/hormuz_chokepoint6_daily.csv` | manifest.json | 2019-01-01..2026-08-30 / 2799 |
| processed | `research/data/processed/ALT-20260907-03/20260907T064559Z/` | (gitignore) | panel + pw_z20 |
| plots | `series_20260907T064559Z.png`, `scatter_is_20260907T064559Z.png` | — | — |
| results JSON | `research/reports/2026-09-07-joint-hunt-portwatch-hyoas.json` | — | — |
| script | `research/notebooks/ALT-20260907-03/run_portwatch_hyoas_hunt.py` | — | — |

### 재현 명령

```bash
cd research && .venv/bin/python notebooks/ALT-20260907-03/run_portwatch_hyoas_hunt.py
```

### 결과 요약 (repo empirical only)

| test | IS | OOS |
| --- | ---: | ---: |
| z20 vs RV5 | r=+0.088 n=1245 | r=-0.008 n=670 |
| z20 vs ret1 | r=-0.016 n=1245 | r=+0.026 n=674 |
| placebo +180d vs RV5 | r=-0.043 n=1121 | r=-0.016 n=670 |

**Decision:** PARK — observable series yes; stable WTI RV link no.

### Robustness / scenarios

1. **Lag contract:** If true publish lag ≪ 9d, IS corr might rise but as-of safety worsens — do not retune lag on OOS.
2. **Coverage null:** No 2015–2018 PortWatch → cannot claim full IS window; n starts 2019.
