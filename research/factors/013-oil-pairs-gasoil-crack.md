# 013 — Oil Futures Pairs Trading & Gasoil Crack Spreads

**상태**: 📋 **평가 및 통계적 차익거래(StatArb) 검증**  
**스타일**: 통계적 차익거래 (Statistical Arbitrage / Pairs Trading)  
**유니버스**: ICE Gasoil (GO) vs ICE Brent (LCO) / NYMEX WTI (CL) / Heating Oil (HO)  
**가중치**: 1.5 (방향성 위험과 직교하는 마켓 뉴트럴 스프레드 팩터)  
**빈도 / 호라이즌**: 일간 (Daily) / 반감기 15~30일 (Half-life)  
**참조 논문**: Granger, J. (2023). *Pairs Trading Strategy Design and Backtest*. SSRN-4601806.

---

## 🎯 경제적 배경 (Economic Rationale)

1. **정제 마진(Refining Margins)과 크랙 스프레드**:
   - 제품유(Gasoil, Heating Oil, Gasoline)와 원유(Brent, WTI) 간의 가격 차이(Crack Spread)는 정유사의 정제 마진을 직접 반영함.
   - 정유소 정기 보수(Turnaround), 계절적 난방유/드라이빙 시즌 수요 충격, 원유 품질(API/황 함유량) 변화, 지정학적 공급 충격으로 스프레드가 일시적으로 펀더멘털에서 이탈함.

2. **평균 회귀(Mean-Reversion) 메커니즘**:
   - 실물 시장 참여자(정유사, 트레이딩 하우스)의 차익거래로 인해 스프레드는 강한 정상성(Stationarity)과 평균 회귀 성질을 보임.
   - 특히 **Gasoil(GO)** 관련 페어는 에너지 선물 시장에서 가장 짧은 반감기(Half-life)와 높은 위험조정수익률(Sharpe Ratio)을 제공함.

---

## 📊 페어 후보군 및 반감기 (Candidate Spreads)

| 스프레드 | 구성 | 평균 반감기 (일) | 특성 및 권장도 |
|---|---|---|---|
| **LCOGO6** | ICE Brent vs ICE Gasoil (6M) | **~15.6일** | 최단 반감기, 가장 강한 GO 크랙 |
| **LCOGO1** | ICE Brent vs ICE Gasoil (1M) | **~17.1일** | 프런트먼스 높은 유동성 |
| **LCOGO3** | ICE Brent vs ICE Gasoil (3M) | **~18.0일** | 유동성과 회귀 속도의 최적 밸런스 (권장 ✅) |
| **HO4GO3** | NYMEX Heating Oil vs ICE Gasoil | **~14.2일** | 지역간(Locational) 차익거래 스프레드 |
| **CLRB1** | NYMEX WTI vs RBOB Gasoline | **~29.5일** | 가솔린 크랙 (보조 지표) |

---

## 💡 스프레드 추정 및 신호 생성 로직

### 1️⃣ 3단계 공적분 및 헤지비율 추정
1. **Engle-Granger 2단계 기법**: 로그 가격 시계열 $\ln(P_1) = \alpha + \beta \ln(P_2) + \epsilon_t$
2. **Johansen VECM**: 다변량 공적분 벡터 추정 (Rank = 1 검정)
3. **Kalman Filter**: 시변 헤지비율(Time-Varying $\beta_t$) 동적 추적

### 2️⃣ Ornstein-Uhlenbeck (OU) 프로세스 피팅
잔차 $\epsilon_t$에 대해 OU 프로세스를 적용하여 평균 회귀 속도($\theta$) 및 반감기($\tau_{1/2} = \frac{\ln 2}{\theta}$)를 산출:
$$d\epsilon_t = \theta (\mu - \epsilon_t)dt + \sigma dW_t$$

### 3️⃣ 트레이딩 룰
```python
# 스프레드 잔차 Z-score 계산
spread_z = (residual - rolling_mean) / rolling_std

# 진입/청산 룰
if spread_z > Z_entry:
    # 스프레드 고평가 -> Gasoil 숏 / Brent 롱
    enter_short_spread()
elif spread_z < -Z_entry:
    # 스프레드 저평가 -> Gasoil 롱 / Brent 숏
    enter_long_spread()
elif abs(spread_z) < Z_exit:
    # 평균 회귀 시 청산
    close_all_positions()
```

---

## 📈 백테스트 성과 스냅샷 (SSRN-4601806 기반)

| 스프레드 페어 | 연평균 수익률 | 샤프 지수 (Sharpe) | 최대 낙폭 (MDD) |
|---|---|---|---|
| **LCOGO1** | 6.7% | 0.80 | -12.4% |
| **LCOGO3** | 5.6% | **0.82** | **-8.9%** |
| **LCOGO6** | 5.3% | **0.86** | **-7.4%** |
| **HO4GO3** (Locational) | 7.1% | **1.12** | **-4.5%** |

> *참고: 롤링 3년 인샘플 / 4개월 아웃샘플 Walk-forward 기준 실전 샤프는 0.4~0.7 수준이며, 슬리피지와 거래비용을 모델링해야 함.*

---

## ⚠️ 리스크 관리 및 제약 조건

1. **롤오버(Roll-over) 비용 및 컨탱고/백워데이션**: 원월물 롤오버 시 스프레드 갭 발생 보정.
2. **하드 손절매 (Hard Stop-Loss)**: 구조적 수급 붕괴 시 1.5~2.0$\sigma$ 이탈 시 강제 청산.
3. **Oil Pizza 결합 방식**: 방향성 WTI 베팅과 결합 시, 포트폴리오의 **전체 변동성을 낮추는 시장 중립적 알파(Market-Neutral Overlay)**로 작동.

---

## 🚀 구현 로드맵

- [ ] Yahoo Finance / ICE 데이터 로더 구축 (`research/src/ls_crude/data/gasoil_loader.py`)
- [ ] Engle-Granger & OU 파라미터 자동 피팅 모듈
- [ ] Backtest 시뮬레이션 및 슬리피지(1~2틱) 포함 검증

---

**작성일**: 2026-09-02  
**위치**: `research/factors/013-oil-pairs-gasoil-crack.md` (원본 아카이브: `013-factor_oil_pairs_go_crack.zip`)
