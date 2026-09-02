# 005 — Financial Demand Index (기업 재무 ML)

**상태**: 🔬 **R&D 계획 완료**  
**평가**: 창의성 7/10 | 구현 가능성 5/10  
**신호**: ↓ 음의 신호  
**가중치**: -1.0  
**구현 기간**: 4주 (R&D 포함)  
**모델**: XGBoost + LSTM

## 가설

대체에너지 기업 (Tesla, NextEra Energy) 실적 ↑ → 유가 ↓  
기존 석유 기업 (Exxon, Chevron) 실적 ↓ → 유가 ↓

## 신호 구성

```python
# 각 회사별 "실적 강도" 점수 (기업 건강도)
financial_strength = (
    ROE (자기자본수익률) +         # 높을수록 강함
    Earnings_Growth_YoY +          # 성장률
    FCF / Market_Cap -             # 자유현금흐름 효율
    Debt / Equity                  # 부채 비율
)

# 대체에너지 vs 석유
signal = (
    1.0 * mean(clean_energy_strength) -    # ICLN, RNRW, TAN 포함 회사들
    1.0 * mean(oil_company_strength)       # XLE, CVX, XOM 포함 회사들
)
```

## 데이터 수집

### 기업 재무제표 (SEC EDGAR)

```python
import yfinance as yf
from sec_api import QueryApi

# yfinance로 기본 정보
def get_company_financials(ticker):
    stock = yf.Ticker(ticker)
    info = stock.info
    return {
        'ROE': info.get('returnOnEquity'),
        'earnings_growth': info.get('earningsGrowth'),
        'fcf': info.get('freeCashflow'),
        'debt_equity': info.get('debtToEquity'),
        'market_cap': info.get('marketCap'),
    }

# SEC EDGAR로 분기 실적
def get_quarterly_earnings(ticker):
    # https://www.sec.gov/cgi-bin/browse-edgar
    # 10-Q (분기), 10-K (연간)
    pass
```

### 선택 기업 리스트

**대체에너지** (음의 신호 강화):
- ICLN: iShares Global Clean Energy (포트폴리오)
- RNRW: Invesco Global Clean Energy (포트폴리오)
- TAN: Invesco Solar (포트폴리오)
- TSLA: Tesla (전기차)
- NEE: NextEra Energy (태양광/풍력)
- RUN: Sunrun (태양광 설치)

**석유/화석연료** (음의 신호 약화):
- XLE: Energy Select ETF (포트폴리오)
- CVX: Chevron (메이저)
- XOM: Exxon Mobil (메이저)
- COP: ConocoPhillips
- MPC: Marathon Petroleum

## 3가지 모델

### Model 1: XGBoost (기본)

```python
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler

# Features: ROE, EPS growth, FCF/market_cap, Debt/Equity, P/E ratio
X = financial_data[['roe', 'earnings_growth', 'fcf_ratio', 'debt_equity', 'pe_ratio']]
y = oil_price_change_3m  # 3개월 후 유가 변화

# 5년씩 window로 훈련
for year in range(2017, 2024):
    X_train = X[(X.index.year >= year-5) & (X.index.year < year)]
    y_train = y[(y.index.year >= year-5) & (y.index.year < year)]
    
    model = XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    # 다음 해 예측
    X_test = X[X.index.year == year]
    y_pred = model.predict(X_test)
    y_actual = y[y.index.year == year]
    
    rmse = np.sqrt(mean_squared_error(y_actual, y_pred))
    r2 = r2_score(y_actual, y_pred)
```

### Model 2: LSTM (RNN)

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# 60일 시계열 → 다음 30일 예측
def create_lstm_sequences(data, lookback=60, forecast=30):
    X, y = [], []
    for i in range(len(data) - lookback - forecast):
        X.append(data[i:i+lookback])
        y.append(data[i+lookback:i+lookback+forecast].mean())
    return np.array(X), np.array(y)

model = Sequential([
    LSTM(128, activation='relu', input_shape=(60, 5)),
    Dropout(0.2),
    LSTM(64, activation='relu'),
    Dropout(0.2),
    Dense(30, activation='relu'),
    Dense(1)
])

model.compile(optimizer='adam', loss='mse')
model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.2)
```

### Model 3: Transformer (최신)

```python
import tensorflow_addons as tfa
from transformer_model import TransformerBlock

# Self-attention 기반 시계열 모델
# 긴 기간의 의존성 학습 가능 (60일 window)
```

## 검증 방법론

### 1. Walk-Forward Validation

```python
# 2015년부터 2023년까지 5년씩 rolling window
for year in range(2015, 2024):
    train_period = (year-5, year)      # 5년 훈련
    test_period = (year, year+1)       # 1년 테스트
    
    model.fit(data[train_period])
    predictions = model.predict(data[test_period])
    errors.append(calculate_error(predictions, actual))
```

### 2. Monte Carlo 시뮬레이션

```python
# 실제 데이터 + 노이즈 1000회 시뮬레이션
for _ in range(1000):
    noise = np.random.normal(0, std_dev, size=len(data))
    simulated_data = data + noise
    model_result = model.predict(simulated_data)
    results.append(model_result)

# 신뢰 구간 계산
ci_lower = np.percentile(results, 5)
ci_upper = np.percentile(results, 95)
```

### 3. Bootstrap Resampling

```python
# 데이터 재표집 1000회
for _ in range(1000):
    sample_idx = np.random.choice(len(data), len(data), replace=True)
    bootstrap_data = data[sample_idx]
    
    model_result = model.fit_predict(bootstrap_data)
    results.append(model_result)

# 모델 안정성 평가
std_of_results = np.std(results, axis=0)
```

### 4. Granger Causality

```python
from statsmodels.tsa.stattools import grangercausalitytests

# 기업 재무 → 유가 변화
granger_result = grangercausalitytests(
    data[['financial_strength', 'oil_price']],
    maxlag=45  # 45일 lag (공시 후 시장 반응)
)

# p-value < 0.05 → 선행성 있음
```

## 4단계 R&D 계획

### Stage 1: 데이터 수집 & 전처리 (1주)
- [ ] SEC EDGAR에서 분기 실적 다운로드
- [ ] yfinance에서 주가/재무 지표 수집
- [ ] 결측치 처리 & 정규화

### Stage 2: 특성 공학 (Feature Engineering) (1주)
- [ ] ROE, EPS growth, FCF ratio 계산
- [ ] 대체에너지 vs 석유 회사 그룹화
- [ ] 시계열 lag 변수 생성 (5일, 10일, 30일)

### Stage 3: 모델 훈련 & 평가 (1주)
- [ ] XGBoost 모델 훈련 (2015-2023)
- [ ] LSTM 모델 구축 (60일 → 30일 예측)
- [ ] Walk-forward validation

### Stage 4: 통계 검증 (1주)
- [ ] Monte Carlo 시뮬레이션
- [ ] Bootstrap 신뢰도 평가
- [ ] Granger causality 테스트
- [ ] 최종 PASS/FAIL 판정

## 파일 구조

```python
research/src/ls_crude/
├── data/
│   └── corporate_finance.py         # SEC/yfinance 데이터 수집
├── features/
│   └── financial_demand.py          # 특성 계산
└── models/
    ├── financial_xgboost.py         # XGBoost 모델
    ├── financial_lstm.py            # LSTM 모델
    └── financial_transformer.py     # Transformer 모델

research/src/ls_crude/backtest/
└── financial_validator.py           # Walk-forward + 통계 검증
```

## 성공 기준

| 기준 | 목표 | 의미 |
|------|------|------|
| **R² score** | > 0.3 | 모델이 유가 변화의 30%+ 설명 |
| **RMSE** | < $5/barrel | 평균 오차 $5 이하 |
| **Granger p-value** | < 0.05 | 선행성 통계 유의 |
| **Monte Carlo CI 폭** | < $3 | 예측 신뢰도 높음 |
| **Bootstrap 안정성** | 상관성 > 0.7 | 모델이 안정적임 |

---

**우선순위**: 🟡 중간 (4주 소요, 좋은 신호이면 큰 기여 가능)
