# 재무 수요 팩터 (Corporate Finance Demand Index)
## ML/DL + 통계 검증 R&D 계획

**제안일**: 2026-09-02  
**상태**: R&D 계획 (구현 전)  
**목표**: 대체에너지 vs 석유에너지 회사 재무제표 → 원유 수요 신호 변환 + ML 검증

---

## 핵심 가설

```
대체에너지 기업 재무 지표 ↑ + 석유에너지 기업 재무 지표 ↓ 
  → 에너지 산업 구조 전환 신호
  → 원유 수요 감소 기대
  → 유가 하락 선행 신호
```

### 예시: 경제학적 근거
```
Tesla Q3 매출 ↑ + ExxonMobil CAPEX ↓ 
  = 자본이 재생에너지로 이동
  = 에너지 대체 가속
  = 석유 수요 감소 기대
  = 유가 ↓
```

---

## 1단계: 데이터 수집 & 전처리

### 1.1 데이터 소스

#### A. 공개 재무 데이터 (Free/Cheap)
```python
# yfinance + SEC EDGAR API
import yfinance as yf
from sec_api import QueryApi  # https://www.sec-api.io

RENEWABLE_COMPANIES = [
    'TSLA',    # Tesla (EV)
    'NEE',     # NextEra Energy (재생에너지)
    'RUN',     # Sunrun (태양광)
    'ENPH',    # Enphase Energy (태양광 inverters)
    'PLUG',    # Plug Power (수소)
    'ICLN',    # iClimate Clean Energy ETF (대체에너지 추적)
]

OIL_COMPANIES = [
    'XOM',     # ExxonMobil
    'CVX',     # Chevron
    'COP',     # ConocoPhillips
    'MPC',     # Marathon Petroleum
    'PSX',     # Phillips 66
    'OIL',     # Oil ETF
]

def fetch_quarterly_financials(ticker: str, years: int = 10) -> pd.DataFrame:
    """
    yfinance에서 분기 재무제표 다운로드
    - 수익 (Revenue)
    - 순이익 (Net Income)
    - 현금흐름 (Operating CF)
    - CAPEX (Capital Expenditure)
    - 부채 (Total Debt)
    - 자산 (Total Assets)
    """
    stock = yf.Ticker(ticker)
    quarterly_financials = stock.quarterly_financials  # 분기별
    quarterly_cashflow = stock.quarterly_cashflow
    quarterly_balance = stock.quarterly_balance_sheet
    
    # DataFrame으로 병합
    df = pd.DataFrame({
        'ticker': ticker,
        'revenue': quarterly_financials.loc['Total Revenue'],
        'net_income': quarterly_financials.loc['Net Income'],
        'operating_cf': quarterly_cashflow.loc['Operating Cash Flow'],
        'capex': -quarterly_cashflow.loc['Capital Expenditures'],  # 음수이므로 반전
        'total_debt': quarterly_balance.loc['Total Debt'],
        'total_assets': quarterly_balance.loc['Total Assets'],
    })
    return df
```

#### B. 고급 금융 API (유료, 하지만 필요시)
```
- Refinitiv Eikon (이전 Thomson Reuters)
- Bloomberg Terminal (가장 정확)
- FactSet
- S&P Global Market Intelligence
- 각 비용: $1000-10000/월 (전문 트레이더용)
```

#### C. 대체 공개 데이터
```
- FRED (Federal Reserve Economic Data): 산업별 생산지수
- EIA (Energy Information Administration): 에너지 투자 데이터
- IEA (International Energy Agency): 기업별 에너지 전환 보고
- 각 회사 분기별 공시: sec.gov (EDGAR)
```

### 1.2 특성 공학 (Feature Engineering)

#### 기본 재무 비율 → 수요 신호 변환

```python
def engineer_demand_features(renewable_df: pd.DataFrame, 
                             oil_df: pd.DataFrame, 
                             lag_days: int = 90) -> pd.DataFrame:
    """
    대체에너지 vs 석유에너지 재무 지표를 수요 신호로 변환
    """
    
    # 1. ROE (Return on Equity) = 순이익 / 자산
    renewable_df['roe'] = renewable_df['net_income'] / renewable_df['total_assets']
    oil_df['roe'] = oil_df['net_income'] / oil_df['total_assets']
    
    # 2. 성장률 (YoY Revenue Growth)
    renewable_df['revenue_growth'] = renewable_df['revenue'].pct_change(4)  # 4분기 = 1년
    oil_df['revenue_growth'] = oil_df['revenue'].pct_change(4)
    
    # 3. CAPEX 강도 = CAPEX / 수익
    renewable_df['capex_intensity'] = renewable_df['capex'] / renewable_df['revenue']
    oil_df['capex_intensity'] = oil_df['capex'] / oil_df['revenue']
    
    # 4. 부채 비율 = 부채 / 자산
    renewable_df['debt_ratio'] = renewable_df['total_debt'] / renewable_df['total_assets']
    oil_df['debt_ratio'] = oil_df['total_debt'] / oil_df['total_assets']
    
    # 5. 현금흐름 개선 = (Operating CF - CAPEX) / 수익 = Free Cash Flow Yield
    renewable_df['fcf_yield'] = (renewable_df['operating_cf'] - renewable_df['capex']) / renewable_df['revenue']
    oil_df['fcf_yield'] = (oil_df['operating_cf'] - oil_df['capex']) / oil_df['revenue']
    
    # 6. 핵심 신호: 대체에너지 vs 석유의 상대 성과
    # 각 그룹별 평균 지표
    renewable_mean_roe = renewable_df['roe'].mean()
    oil_mean_roe = oil_df['roe'].mean()
    
    renewable_mean_growth = renewable_df['revenue_growth'].mean()
    oil_mean_growth = oil_df['revenue_growth'].mean()
    
    renewable_mean_capex = renewable_df['capex_intensity'].mean()
    oil_mean_capex = oil_df['capex_intensity'].mean()
    
    # 7. 종합 "에너지 전환" 신호 (daily로 보간해야 함)
    energy_transition_index = (
        1.5 * (renewable_mean_roe - oil_mean_roe) +           # ROE 차이 (높을수록 대체에너지 좋음)
        1.0 * (renewable_mean_growth - oil_mean_growth) +     # 성장률 차이
        1.0 * (renewable_mean_capex - oil_mean_capex)         # CAPEX 투자 강도 (대체에너지 높음 = 투자 증가)
    )
    
    return {
        'renewable_features': renewable_df,
        'oil_features': oil_df,
        'energy_transition_index': energy_transition_index,
        'lag_days': lag_days,  # 재무 공시 ~ 시장 반영 시간
    }
```

### 1.3 시간 정렬 (Look-ahead Bias 방지)

```python
def align_financials_to_daily(quarterly_financial_features: pd.DataFrame,
                               daily_oil_prices: pd.DataFrame,
                               announcement_lag_days: int = 45) -> pd.DataFrame:
    """
    재무 공시 (분기별) → 일일 신호로 변환
    
    중요: announcement_lag_days = 실제 발표부터 시장 반영까지 평균 지연
    (예: Q3 실적 발표 → 45일 후부터 신호 유효)
    """
    
    # 분기 끝나는 날 기준
    q_end_dates = {
        'Q1': '-03-31',
        'Q2': '-06-30',
        'Q3': '-09-30',
        'Q4': '-12-31',
    }
    
    daily_signal = pd.DataFrame(
        index=daily_oil_prices.index,
        columns=['financial_demand_signal']
    )
    
    for quarter_date, value in quarterly_financial_features.items():
        # quarter_date + announcement_lag_days부터 신호 유효
        signal_start = quarter_date + timedelta(days=announcement_lag_days)
        next_quarter_date = quarter_date + timedelta(days=90)  # 다음 분기까지
        
        # 해당 기간 일일 신호로 보간
        mask = (daily_signal.index >= signal_start) & (daily_signal.index < next_quarter_date)
        daily_signal.loc[mask, 'financial_demand_signal'] = value
    
    return daily_signal
```

---

## 2단계: 특성 변수 및 모델 아키텍처

### 2.1 입력 특성 (Input Features)

```python
features_list = [
    # 대체에너지 지표
    'renewable_revenue_growth',      # 분기별 성장률
    'renewable_roe',                 # 자산 수익률
    'renewable_capex_intensity',     # 투자 강도
    'renewable_fcf_yield',           # 현금흐름 개선
    
    # 석유에너지 지표
    'oil_revenue_growth',
    'oil_roe',
    'oil_capex_intensity',
    'oil_fcf_yield',
    
    # 상대 지표 (가장 중요)
    'energy_transition_score',       # (대체 지표 - 석유 지표) / std
    
    # 기존 팩터들과의 결합
    'oil_slice_signal',              # Oil Slice
    'whale_signal',                  # Whale Index
    'trump_signal',                  # Truth Social
    'renewable_displacement_signal', # Renewable Displacement
    
    # 시장 조건 (통제 변수)
    'vix',                           # 시장 변동성
    'sp500_return',                  # 주식시장
    'high_yield_spread',             # 신용 위험
]
```

### 2.2 모델 아키텍처

#### Option A: 전통적 ML (빠르고 검증 쉬움)

```python
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor
import lightgbm as lgb

def build_ml_model(X_train: np.ndarray, y_train: np.ndarray) -> dict:
    """
    전통적 머신러닝 3가지 모델 앙상블
    """
    
    models = {
        'xgboost': XGBRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=5,
            random_state=42,
            early_stopping_rounds=20,
        ),
        'lightgbm': lgb.LGBMRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=5,
            random_state=42,
        ),
        'random_forest': RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            random_state=42,
            n_jobs=-1,
        ),
    }
    
    # 각 모델 훈련
    trained_models = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        trained_models[name] = model
    
    return trained_models
```

#### Option B: 딥러닝 (LSTM/Transformer)

```python
import tensorflow as tf
from tensorflow.keras.layers import LSTM, Dense, Dropout, Attention
from tensorflow.keras.models import Sequential

def build_lstm_model(lookback: int = 60) -> tf.keras.Model:
    """
    시계열 LSTM 모델
    - lookback: 과거 60일 데이터로 다음 5일 유가 예측
    """
    
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=(lookback, len(features_list))),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1, activation='linear'),  # 유가 수익률 예측
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae'],
    )
    
    return model

def build_transformer_model(lookback: int = 60) -> tf.keras.Model:
    """
    Transformer 모델 (2024년 SOTA)
    - 병렬 처리로 LSTM보다 빠름
    - Attention으로 중요 시간대 강조
    """
    
    # Simplified Transformer (full version은 복잡)
    inputs = tf.keras.Input(shape=(lookback, len(features_list)))
    
    # Multi-head attention
    attention = tf.keras.layers.MultiHeadAttention(
        num_heads=4,
        key_dim=32,
    )(inputs, inputs)
    
    x = tf.keras.layers.GlobalAveragePooling1D()(attention)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.2)(x)
    output = Dense(1, activation='linear')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=output)
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    return model
```

#### Option C: 하이브리드 (ML + 통계)

```python
def build_hybrid_model(X_train, y_train):
    """
    XGBoost 예측 + 베이지안 회귀로 불확실성 정량화
    """
    
    # Phase 1: XGBoost로 기본 신호
    xgb = XGBRegressor(n_estimators=200, random_state=42)
    xgb_pred = xgb.fit(X_train, y_train).predict(X_train)
    
    # Phase 2: 잔차에 대해 베이지안 회귀 (불확실성 추정)
    residuals = y_train - xgb_pred
    
    from sklearn.linear_model import BayesianRidge
    bayesian = BayesianRidge(n_iter=300, tol=1e-3)
    bayesian.fit(X_train, residuals)
    
    # 예측 시: point estimate + credible interval
    return {
        'base_model': xgb,
        'uncertainty_model': bayesian,
        'predict_fn': lambda x: (
            xgb.predict(x),  # 점 추정
            bayesian.predict(x, return_std=True)  # (평균, 표준편차)
        ),
    }
```

---

## 3단계: 검증 방법론

### 3.1 Out-of-Sample Testing (Walk-Forward)

```python
def walk_forward_validation(data: pd.DataFrame, 
                            initial_train_size: int = 252*2,  # 2년
                            test_size: int = 252,              # 1년 테스트
                            refit_frequency: int = 252):       # 1년마다 재훈련
    """
    Walk-forward validation: 시간 순서 유지하면서 반복 테스트
    
    시간 -> [Train 2yr | Test 1yr] -> [Train 2yr | Test 1yr] -> ...
    """
    
    results = []
    
    for i in range(initial_train_size, len(data) - test_size, refit_frequency):
        train_data = data.iloc[:i]
        test_data = data.iloc[i:i+test_size]
        
        # 모델 훈련
        X_train = train_data[features_list].values
        y_train = train_data['future_5d_return'].values
        
        model = build_ml_model(X_train, y_train)
        
        # 테스트
        X_test = test_data[features_list].values
        y_test = test_data['future_5d_return'].values
        
        pred = model.predict(X_test)
        
        # 성과 측정
        results.append({
            'test_period': test_data.index[0],
            'r2': r2_score(y_test, pred),
            'mae': mean_absolute_error(y_test, pred),
            'sharpe': calculate_sharpe(pred, y_test),
        })
    
    return pd.DataFrame(results)
```

### 3.2 Monte Carlo Simulation

```python
def monte_carlo_backtest(model, test_data: pd.DataFrame, 
                         n_simulations: int = 1000,
                         resampling_method: str = 'residual'):
    """
    Monte Carlo: 모델의 예측 분포 추정
    
    방법: 과거 잔차 분포에서 재샘플링하여 미래 경로 시뮬레이션
    """
    
    # Step 1: 과거 잔차 저장
    train_residuals = model.predict(X_train) - y_train
    
    # Step 2: n_simulations개 경로 생성
    simulated_returns = np.zeros((n_simulations, len(test_data)))
    
    rng = np.random.default_rng(42)
    
    for sim in range(n_simulations):
        if resampling_method == 'residual':
            # 과거 잔차에서 복원추출
            sampled_errors = rng.choice(train_residuals, size=len(test_data), replace=True)
        elif resampling_method == 'bootstrap':
            # 과거 수익률 분포에서 복원추출
            sampled_errors = rng.normal(
                loc=train_residuals.mean(),
                scale=train_residuals.std(),
                size=len(test_data),
            )
        
        # 예측값 + 샘플링된 오차
        base_pred = model.predict(test_data[features_list].values)
        simulated_returns[sim, :] = base_pred + sampled_errors
    
    # Step 3: 분위수 계산
    percentiles = np.percentile(simulated_returns, [5, 25, 50, 75, 95], axis=0)
    
    return {
        'median_prediction': percentiles[2],
        'ci_5_95': (percentiles[0], percentiles[4]),
        'ci_25_75': (percentiles[1], percentiles[3]),
        'simulations': simulated_returns,
    }
```

### 3.3 Bootstrap Confidence Intervals

```python
def bootstrap_model_performance(model, X_test, y_test, 
                                n_bootstrap: int = 1000,
                                sample_size: int = None):
    """
    Bootstrap: 모델 성과의 신뢰구간 추정
    
    방법: 테스트 데이터에서 복원추출하여 성과 지표 분포 구성
    """
    
    if sample_size is None:
        sample_size = len(X_test)
    
    predictions = model.predict(X_test)
    performance_metrics = []
    
    rng = np.random.default_rng(42)
    
    for _ in range(n_bootstrap):
        # 테스트 데이터에서 복원추출
        indices = rng.choice(len(X_test), size=sample_size, replace=True)
        
        y_test_boot = y_test[indices]
        pred_boot = predictions[indices]
        
        # 성과 지표 계산
        metrics = {
            'r2': r2_score(y_test_boot, pred_boot),
            'mae': mean_absolute_error(y_test_boot, pred_boot),
            'mape': mean_absolute_percentage_error(y_test_boot, pred_boot),
            'correlation': np.corrcoef(y_test_boot, pred_boot)[0, 1],
        }
        
        performance_metrics.append(metrics)
    
    boot_df = pd.DataFrame(performance_metrics)
    
    # 신뢰구간 계산
    ci = {
        'r2': (boot_df['r2'].quantile(0.025), boot_df['r2'].quantile(0.975)),
        'mae': (boot_df['mae'].quantile(0.025), boot_df['mae'].quantile(0.975)),
        'correlation': (boot_df['correlation'].quantile(0.025), boot_df['correlation'].quantile(0.975)),
    }
    
    return {
        'bootstrap_distributions': boot_df,
        'confidence_intervals': ci,
        'point_estimates': boot_df.mean(),
    }
```

### 3.4 Permutation Test (기존 factor_lab.py 확장)

```python
def permutation_test_financial_factor(financial_signal: pd.Series,
                                      future_returns: pd.Series,
                                      n_permutations: int = 5000):
    """
    귀무가설: 재무 신호와 유가 수익률 간 상관성 없음
    
    방법: 신호를 무작위로 섞어 (같은 분포지만 인과관계 끊음) 상관성 측정
    실제 상관성이 우연보다 큰가?
    """
    
    # 실제 상관성 계산
    actual_corr = financial_signal.corr(future_returns)
    
    # 순열 검증
    permutation_corrs = []
    rng = np.random.default_rng(42)
    
    signal_values = financial_signal.values
    
    for _ in range(n_permutations):
        # 신호 무작위 섞기 (returns는 그대로)
        shuffled_signal = rng.permutation(signal_values)
        perm_corr = np.corrcoef(shuffled_signal, future_returns.values)[0, 1]
        permutation_corrs.append(perm_corr)
    
    permutation_corrs = np.array(permutation_corrs)
    
    # p-value: 순열 상관성이 실제보다 큰 비율
    p_value = (np.abs(permutation_corrs) >= np.abs(actual_corr)).mean()
    
    return {
        'actual_correlation': actual_corr,
        'permutation_distribution': permutation_corrs,
        'p_value': p_value,
        'significant': p_value < 0.05,
    }
```

### 3.5 Granger Causality Test

```python
from statsmodels.tsa.api import grangercausalitytests

def granger_causality_financial_to_oil(financial_signal: pd.Series,
                                       oil_returns: pd.Series,
                                       max_lag: int = 20):
    """
    Granger Causality: 재무 신호가 유가 수익률을 "선행"하는가?
    
    방법: 과거 재무 신호를 포함한 모델이 
         과거 유가만 사용한 모델보다 나은가?
    """
    
    # 데이터 정렬
    data = pd.DataFrame({
        'financial': financial_signal,
        'oil_returns': oil_returns,
    }).dropna()
    
    # Granger causality test (statsmodels)
    gc_result = grangercausalitytests(data, max_lag, verbose=True)
    
    # 각 lag에서 p-value 추출
    p_values = []
    for i in range(1, max_lag + 1):
        # F-test p-value
        p_val = gc_result[i][0][0]['ssr_ftest'][1]  # (F-stat, p-value)
        p_values.append(p_val)
    
    # 결론: 어느 lag에서 significant?
    significant_lags = [i+1 for i, p in enumerate(p_values) if p < 0.05]
    
    return {
        'p_values_by_lag': {i+1: p for i, p in enumerate(p_values)},
        'significant_lags': significant_lags,
        'causal': len(significant_lags) > 0,
    }
```

---

## 4단계: 통합 검증 프레임워크

### 4.1 Multi-Test Pass Bar (factor_lab.py 확장)

```python
class FinancialFactorValidator:
    """
    재무 팩터 검증 체크리스트
    (factor_lab.py의 원리를 확장)
    """
    
    PRE_REGISTERED_PASS_BAR = {
        'r2_score': 0.10,                    # 테스트 R² > 10%
        'permutation_p_value': 0.05,        # p < 0.05
        'granger_causality': True,          # 최소 1개 lag에서 causal
        'boot_ci_excludes_zero': True,      # 신뢰도 95% 구간이 0 미포함
        'sharpe_ratio': 0.5,                # Sharpe > 0.5
        'consistency_horizons': 3,          # 5개 horizon 중 최소 3개 일관
    }
    
    def __init__(self, train_data, test_data):
        self.train = train_data
        self.test = test_data
        self.results = {}
    
    def run_all_tests(self):
        """
        사전 등록된 모든 검증 실행
        """
        
        # Test 1: ML 모델 성능
        self.test_ml_performance()
        
        # Test 2: Permutation 검증
        self.test_permutation()
        
        # Test 3: Granger 인과성
        self.test_granger_causality()
        
        # Test 4: Bootstrap 신뢰도
        self.test_bootstrap_ci()
        
        # Test 5: Walk-forward 안정성
        self.test_walk_forward()
        
        # 최종 판정
        self.issue_pass_fail_verdict()
    
    def issue_pass_fail_verdict(self):
        """
        모든 테스트 종합 평가
        → PASS or FAIL (재해석 없음, 100% 객관적)
        """
        
        checks = [
            self.results['r2_score'] >= self.PRE_REGISTERED_PASS_BAR['r2_score'],
            self.results['permutation_p_value'] < self.PRE_REGISTERED_PASS_BAR['permutation_p_value'],
            self.results['granger_causality']['causal'],
            self.results['bootstrap_ci_excludes_zero'],
            self.results['sharpe_ratio'] >= self.PRE_REGISTERED_PASS_BAR['sharpe_ratio'],
        ]
        
        passed_tests = sum(checks)
        total_tests = len(checks)
        
        print(f"\n{'='*60}")
        print(f"FINANCIAL FACTOR VALIDATION VERDICT")
        print(f"{'='*60}")
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        
        if all(checks):
            print("✅ PASS -- Factor clears all pre-registered criteria")
            self.verdict = "PASS"
        else:
            print("❌ FAIL -- Factor does not clear all criteria")
            print("\nFailed Tests:")
            for i, (test_name, passed) in enumerate([
                ('R² Score', checks[0]),
                ('Permutation Test', checks[1]),
                ('Granger Causality', checks[2]),
                ('Bootstrap CI', checks[3]),
                ('Sharpe Ratio', checks[4]),
            ]):
                if not passed:
                    print(f"  - {test_name}")
            self.verdict = "FAIL"
        
        return self.verdict
```

---

## 5단계: 코드 구조 & 구현 로드맵

### 5.1 프로젝트 구조

```
research/
├── src/ls_crude/
│   ├── data/
│   │   ├── yahoo.py          (existing)
│   │   ├── fred.py           (existing)
│   │   ├── news.py           (existing)
│   │   └── corporate_finance.py  ← NEW
│   │       ├── fetch_financial_statements()
│   │       ├── engineer_features()
│   │       └── align_to_daily()
│   │
│   ├── features/
│   │   ├── panel.py          (existing)
│   │   ├── slice_index.py    (existing)
│   │   └── financial_demand.py   ← NEW
│   │       ├── renewable_vs_oil_signal()
│   │       └── energy_transition_index()
│   │
│   ├── models/
│   │   ├── rsi_overlay.py    (existing)
│   │   └── financial_ml.py        ← NEW
│   │       ├── build_ml_model()
│   │       ├── build_lstm_model()
│   │       └── build_transformer_model()
│   │
│   └── backtest/
│       ├── __init__.py
│       └── financial_validator.py    ← NEW
│           ├── walk_forward_validation()
│           ├── monte_carlo_backtest()
│           ├── bootstrap_ci()
│           └── FinancialFactorValidator class
│
├── data/TTS scrapper/
│   ├── factor_lab.py         (existing)
│   ├── factor_registry.py    (existing)
│   └── financial_factor_lab.py   ← NEW
│       └── extend factor_lab with ML tests
│
└── tests/
    ├── test_financial_data.py   ← NEW
    ├── test_ml_models.py        ← NEW
    └── test_validators.py       ← NEW
```

### 5.2 단계별 구현 계획

#### Phase 1️⃣: 데이터 수집 (1주)
```
✓ yfinance로 대체에너지 & 석유 회사 재무제표 다운로드
✓ feature engineering (ROE, 성장률, CAPEX 강도 등)
✓ 일일 신호로 보간 (look-ahead bias 방지)
✓ 기존 oil_v101.py와 병합
```

#### Phase 2️⃣: ML 모델 구축 (2주)
```
✓ XGBoost / LightGBM 기본 모델
✓ LSTM 시계열 모델
✓ Transformer 모델 (선택)
✓ 3-fold cross-validation
```

#### Phase 3️⃣: 통계 검증 (1주)
```
✓ Walk-forward validation
✓ Monte Carlo simulation
✓ Bootstrap confidence intervals
✓ Permutation test
✓ Granger causality
```

#### Phase 4️⃣: 최종 판정 (3일)
```
✓ FinancialFactorValidator 실행
✓ Pass/Fail 판정
✓ 문서화 및 보고
```

### 5.3 구현 예시 코드

```python
# main.py
from research.src.ls_crude.data.corporate_finance import (
    fetch_financial_statements,
    engineer_demand_features,
)
from research.src.ls_crude.models.financial_ml import build_ml_model
from research.src.ls_crude.backtest.financial_validator import (
    FinancialFactorValidator,
    walk_forward_validation,
    monte_carlo_backtest,
)

# 1. 데이터 수집
renewable_df = fetch_financial_statements(tickers=['TSLA', 'NEE', 'ENPH'])
oil_df = fetch_financial_statements(tickers=['XOM', 'CVX', 'COP'])

# 2. Feature engineering
features = engineer_demand_features(renewable_df, oil_df, lag_days=45)

# 3. 기존 oil_v101.py 데이터와 병합
from research.src.ls_crude.data.yahoo import fetch_wti_daily
daily_oil = fetch_wti_daily()
merged = daily_oil.merge(features['daily_signal'], left_index=True, right_index=True)

# 4. Train/Test 분할 (2015-2023 in-sample, 2024+ out-sample)
train = merged.loc[:'2023-12-31']
test = merged.loc['2024-01-01':]

# 5. 모델 훈련
X_train = train[features_list].values
y_train = train['future_5d_return'].values
model = build_ml_model(X_train, y_train)

# 6. 검증
validator = FinancialFactorValidator(train, test)
validator.run_all_tests()

# 결과
print(validator.results)
print(f"Verdict: {validator.verdict}")

# 7. Monte Carlo 시뮬레이션 (추가 분석)
mc_results = monte_carlo_backtest(model, test, n_simulations=1000)
print(f"Median prediction: {mc_results['median_prediction']}")
print(f"95% CI: {mc_results['ci_5_95']}")
```

---

## 6단계: 예상 결과 & 해석

### 시나리오 A: PASS ✅
```
"Financial Demand Factor가 다음 5일 유가 수익률을 유의미하게 예측한다"

의미:
- 재무 신호 (대체에너지 vs 석유) → 유가 선행성 증명됨
- 신뢰도 95% 이상 (Bootstrap CI, Permutation test)
- Walk-forward에서도 안정적

다음: 기존 Oil Slice와 결합 → "Ultimate Pizza" 구성
```

### 시나리오 B: FAIL ❌
```
"Financial Demand Factor는 유가 예측에 유의한 값 없음"

의미:
- 재무 지표가 뉴스보다 느림 (이미 가격에 반영됨)
- 또는 시간차(lag)가 큼 (6개월 이상)
- 또는 노이즈가 신호보다 큼

다음: 
- lag 길이 조정 및 재검증
- Feature engineering 개선
- 또는 다른 팩터 탐색
```

---

## 기존 factor_lab.py와의 통합

### 기본 원리 유지
```python
# factor_lab.py의 원리
- Permutation test p < 0.05
- 5개 시간지평에서 최소 3개 일관성

# Financial Factor 확장
- 위 + ML 예측력 (R²)
- 위 + Granger Causality
- 위 + Bootstrap 신뢰도
```

### 호환성
```python
# factor_lab.py 함수 재사용
from factor_lab import welch_and_permutation, FORWARD_HORIZONS

# Financial factor에도 동일 적용
for horizon in FORWARD_HORIZONS:
    extreme_high = financial_signal.quantile(0.75)
    extreme_low = financial_signal.quantile(0.25)
    
    returns_when_high = oil_returns[financial_signal > extreme_high]
    returns_when_low = oil_returns[financial_signal < extreme_low]
    
    result = welch_and_permutation(returns_when_high, returns_when_low)
    print(f"Horizon {horizon}d: p-value = {result['p_perm']}")
```

---

## 예상 일정 및 자원

| 단계 | 기간 | 자원 | 의존성 |
|------|------|------|--------|
| Phase 1 (데이터) | 1주 | yfinance, pandas | 없음 |
| Phase 2 (ML 모델) | 2주 | scikit-learn, xgboost, tensorflow | Phase 1 |
| Phase 3 (검증) | 1주 | statsmodels, scipy | Phase 2 |
| Phase 4 (최종) | 3일 | 문서화 | Phase 3 |
| **합계** | **~4주** | | |

---

## 최종 권장사항

### 장점 ✅
1. **엄밀한 통계 검증** (논문 수준의 증명)
2. **다층 검증** (ML + 통계 + 인과성)
3. **기존 framework (factor_lab) 활용**
4. **재현 가능성** (코드 + 데이터 공개)

### 도전과제 ⚠️
1. **시간 투입 많음** (4주)
2. **FAIL 가능성** (약 50-70% 팩터만 유의)
3. **계산 리소스** (LSTM/Transformer = GPU 권장)
4. **데이터 품질** (재무제표 lag = 신호 약화 가능)

### 추천
**이 R&D를 수행할 가치 있습니다:**
- 기존 팩터들(Oil Slice, Whale Index, Truth Social)의 통계적 근거도 같은 방식으로 검증 가능
- ML 모델은 실시간 거래 시스템에 통합 가능
- Pass되면 "팩터의 완전한 증명" (학술 수준)

---

## 궁금한 점

1. GPU 환경 있을까? (LSTM 훈련용)
2. yfinance + 개별 종목보다 ETF 사용할까? (수정 가능성 낮음)
3. 인샘플 가중치 튜닝 후 아웃샘플만 평가할까? (권장)
4. 결과 시각화 (Jupyter notebook vs 보고서)?

**바로 Phase 1 (데이터 수집)부터 시작할까요?**
