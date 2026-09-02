# 014 — OU-HMM Regime-Switching Oil Pairs Trading

**상태**: 📋 **평가 및 R&D 설계 완료**  
**스타일**: 체제 전환형 통계적 차익거래 (Regime-Switching Statistical Arbitrage)  
**유니버스**: WTI (CL), Brent (LCO), Dubai Crude, Shanghai Crude (INE SC)  
**가중치**: 1.5 (레짐별 적응형 마켓 뉴트럴 오버레이)  
**참조 연구**: Zanatta, T. (2025). *Statistical Arbitrage: Crude Oil Futures Market Pairs Trading*. University of Padua / Fanelli, Fontana, & Rotondi (2023).

---

## 🎯 경제적 & 수학적 가설

1. **에너지 시장의 체제 전환(Regime-Switching) 특성**:
   - 원유 스프레드는 항상 일정한 속도로 평균 회귀하지 않음. 지정학적 위기나 강한 트렌드장에서는 **스프레드가 장기 이탈(Trending Regime)**하고, 횡보장에서는 **빠른 평균 회귀(Mean-Reverting Regime)**를 보임.
   - 단일 OU 모델은 체제 변화 시 대규모 드로다운(MDD)을 초래하므로, **은닉 마르코프 모델(HMM)**을 결합하여 현재 시장 레짐($S_t \in \{1, 2, \dots, K\}$)을 실시간 필터링함.

2. **OU-HMM 결합 모델**:
   각 레짐 $k$에 대해 서로 다른 평균 회귀 속도($\theta_k$), 장기 평균($\mu_k$), 변동성($\sigma_k$)을 부여:
   $$dX_t = \theta(S_t) \big(\mu(S_t) - X_t\big)dt + \sigma(S_t) dW_t$$
   - **Regime 1 (빠른 회귀)**: 높은 $\theta$, 낮은 $\sigma$ $\rightarrow$ 적극적 차익거래 포지션 확대
   - **Regime 2 (중립/전환)**: 중간 $\theta$, 보통 $\sigma$ $\rightarrow$ 표준 밴드 거래
   - **Regime 3 (발산/쇼크)**: 낮은 $\theta$, 높은 $\sigma$ $\rightarrow$ 포지션 축소 또는 즉시 손절(Risk-Off)

---

## 💡 4가지 진보된 트레이딩 전략 (Trading Strategies)

| 전략 | 메커니즘 | 특징 |
|---|---|---|
| **Plain Vanilla** | 레짐별 조건부 임계값 $\pm Z(S_t)$ 기반 진입/청산 | 기본형 |
| **Realized Increment** | 과거 실현된 스프레드 증분 기반 모멘텀/회귀 결합 | 실현 변동성 제어 |
| **Prediction Interval** | OU-HMM 미래 1-step 예측 신뢰구간 이탈 시 역추세 진입 | **최저 MDD (0.4%) 달성** |
| **Probability Interval** | 특정 레짐에 머무를 사후 확률 $P(S_t = k \mid \mathcal{F}_t)$ 기반 필터링 | 휩소(Whipsaw) 방지 |

---

## 📈 실증 분석 성과 (Zanatta 2025 실증 결과)

*강세 트렌드 구간 (2023년 10월 ~ 2025년 3월 백테스트 비교)*:

| 전략 | 총 수익률 | 최대 낙폭 (Max DD) | 샤프 지수 (Sharpe) | 특성 |
|---|---|---|---|---|
| **Buy & Hold (단방향)** | 16.3% | 19.4% | 1.54 | 높은 방향성 위험 노출 |
| **Realized Increment** | 2.2% | 1.2% | 1.12 | 극도로 안정적 알파 |
| **Probability Interval** | 1.4% | 0.8% | 0.90 | 초저위험 방어형 |
| **Prediction Interval** | 0.9% | **0.4%** | 0.69 | **테일 리스크 완벽 차단** |

> *핵심 인사이트: OU-HMM 페어 트레이딩은 강세장에서는 드로다운을 19.4%에서 0.4%로 낮추는 강력한 위험 분산 도구(Tail-Risk Hedge)로 작용하며, 횡보장에서는 지속적인 비상관 알파를 생성함.*

---

## 🚀 파이프라인 구현 계획

- [ ] Johansen 공적분 기반 WTI-Brent-Dubai 스프레드 벡터 생성기
- [ ] EM 알고리즘 기반 온라인 3-Regime OU-HMM 필터 (`ou_hmm.py`)
- [ ] Walk-forward 롤링 윈도우 검증 및 슬리피지/수수료 모델링

---

**작성일**: 2026-09-02  
**위치**: `research/factors/014-ou-hmm-oil-pairs.md` (원본 아카이브: `014-ou_hmm_oil_pairs.zip`)
