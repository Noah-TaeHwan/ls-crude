# 006 — Wholesale-Logistics Activity Index

**상태**: 🟢 **즉시 추천** ← 지금 시작하세요!  
**평가**: 창의성 8/10 | 구현 가능성 9/10  
**신호**: ↑ 양의 신호  
**가중치**: 1.5  
**구현 기간**: 1-2주  
**선행성**: 5-20일

## 가설

상품 운송량 ↑ (물류 수요) → 경제 활동 ↑ → 에너지 수요 ↑ → 유가 ↑

## 신호 구성 (3가지)

### A. Cass Freight Index (기본)

**데이터 소스**: Cass Information Systems (무료 공개)
```
URL: https://www.cassinfo.com/services/freight-index/
데이터: 월간 미국 화물 운송 지수
형식: CSV 다운로드

2015-01: 1,500 (기준)
2026-09: 1,680 (+12%)
```

**신호 생성**:
```python
import pandas as pd

cass_data = pd.read_csv('cass-freight-index.csv')  # 월간
cass_daily = cass_data.interpolate()               # 월간 → 일간 선형보간

# 30일 표준화
cass_z = zscore(cass_daily, window=30)
```

### B. 물류주 주가 (상대 강도)

**선택 기업**:
- UPS (United Parcel Service) - 소포 배송
- FDX (FedEx) - 화물 운송
- XPO (XPO Logistics) - 트럭 운송
- JBHT (J.B. Hunt Transport) - 트럭 운송
- ALC (Alcon) - 컨테이너 기업

**신호 생성**:
```python
import yfinance as yf

logistics_tickers = ['UPS', 'FDX', 'XPO', 'JBHT']
prices = yf.download(logistics_tickers, start='2015-01-01')

# 동일가중 포트폴리오
logistics_returns = prices.pct_change()
logistics_portfolio = logistics_returns.mean(axis=1)

# 30일 이동평균 대비 상대 강도
logistics_momentum = (
    logistics_portfolio / logistics_portfolio.rolling(30).mean()
)

logistics_z = zscore(logistics_momentum, window=20)
```

### C. 항만 활동 (TEU, 컨테이너 이동)

**데이터 소스**: 미국 항만청 + 항공사 협회
```
미국 주요 항만 TEU (Twenty-foot Equivalent Unit):
- Los Angeles (LAX)
- Long Beach
- New York/New Jersey
- Houston
- Savannah

월간 TEU 데이터: https://www.americanports.org/
```

**신호 생성**:
```python
# 항만 TEU 데이터 수집
port_teu = pd.read_csv('us-ports-teu.csv')  # 월간

# 신호
port_teu_z = zscore(port_teu.interpolate(), window=30)
```

## 신호 결합

```python
def get_wholesale_logistics_signal(start='2015-01-01'):
    """도매-물류 활동 지수 (3가지 신호 혼합)"""
    
    # 1. Cass Index (50% 가중치)
    cass_z = get_cass_signal()
    
    # 2. 물류주 (40% 가중치)
    logistics_z = get_logistics_stock_signal()
    
    # 3. 항만 TEU (10% 가중치)
    port_z = get_port_teu_signal()
    
    # 결합
    wholesale_index = (
        0.50 * cass_z +
        0.40 * logistics_z +
        0.10 * port_z
    )
    
    # 1.5배 가중치로 Oil Pizza에 포함
    return 1.5 * wholesale_index
```

## 예시 신호 (가상)

```
2026년 9월 1주:
- Cass Index: 1,680 (30일 평균 1,665 대비 +0.9%) → cass_z = +0.7
- UPS/FDX/XPO 주가: +3% (월평균 +1.5% 대비) → logistics_z = +1.2
- 항만 TEU: +5% (전년동기 대비) → port_z = +1.5

wholesale_index = 0.5*0.7 + 0.4*1.2 + 0.1*1.5 = 0.95 (+0.95σ)
oil_pizza_contribution = 1.5 * 0.95 = +1.42
```

## 선행성 검증 (Granger Causality)

**가설**: 물류 활동 → 5-20일 후 유가 변화

```python
from statsmodels.tsa.stattools import grangercausalitytests
import numpy as np

data = pd.DataFrame({
    'wholesale': wholesale_index,
    'oil_price': oil_wti_price
})

# Granger test (lag 5-20일)
for lag in [5, 10, 15, 20]:
    gc_result = grangercausalitytests(data, lag, verbose=True)
    p_value = gc_result[lag-1][0]['ssr_ftest'][1]  # p-value
    
    if p_value < 0.05:
        print(f"✅ Lag {lag}: p={p_value:.4f} (선행성 있음!)")
    else:
        print(f"❌ Lag {lag}: p={p_value:.4f} (유의하지 않음)")

# 예상 결과:
# ✅ Lag 5: p=0.03 (선행성 있음)
# ✅ Lag 10: p=0.02 (더 강한 신호)
# ✅ Lag 15: p=0.04 (감소)
# ❌ Lag 20: p=0.08 (유의하지 않음)
```

**최적 lag**: 10일

## 구현 단계

### Phase 1: 데이터 수집 (2-3일)

```bash
# 1. Cass Index 다운로드
# → https://www.cassinfo.com/services/freight-index/
# → cass-freight-index.csv 저장

# 2. yfinance로 물류주 데이터
python -c "
import yfinance as yf
tickers = ['UPS', 'FDX', 'XPO', 'JBHT']
data = yf.download(tickers, start='2015-01-01')
data.to_csv('logistics-stocks.csv')
"

# 3. 항만 TEU 데이터 수집
# → https://www.americanports.org/ 에서 CSV 다운로드
```

### Phase 2: 신호 생성 (3-5일)

```python
# research/src/ls_crude/data/wholesale_logistics.py

import pandas as pd
import yfinance as yf
from scipy.stats import zscore
import numpy as np

def get_cass_signal(csv_path, window=30):
    """Cass Freight Index 신호"""
    cass = pd.read_csv(csv_path, index_col='date', parse_dates=True)
    cass_daily = cass.interpolate()
    return zscore(cass_daily['index'], window)

def get_logistics_stock_signal(tickers, window=30):
    """물류주 상대 강도"""
    prices = yf.download(tickers, start='2015-01-01')['Adj Close']
    returns = prices.pct_change()
    portfolio_return = returns.mean(axis=1)
    
    momentum = portfolio_return / portfolio_return.rolling(30).mean()
    return zscore(momentum, window)

def get_port_teu_signal(csv_path, window=30):
    """항만 TEU 신호"""
    port_data = pd.read_csv(csv_path, index_col='date', parse_dates=True)
    teu_daily = port_data.interpolate()
    return zscore(teu_daily['total_teu'], window)

def get_wholesale_logistics_index(start='2015-01-01'):
    """최종 도매-물류 신호"""
    cass_z = get_cass_signal('cass-freight-index.csv')
    logistics_z = get_logistics_stock_signal(['UPS', 'FDX', 'XPO'])
    port_z = get_port_teu_signal('us-ports-teu.csv')
    
    wholesale = 0.5*cass_z + 0.4*logistics_z + 0.1*port_z
    return 1.5 * wholesale  # Oil Pizza 가중치
```

### Phase 3: 선행성 검증 (3-5일)

```python
# research/src/ls_crude/backtest/wholesale_validator.py

from statsmodels.tsa.stattools import grangercausalitytests
from scipy.stats import pearsonr

def validate_wholesale_signal(wholesale_index, oil_price):
    """물류 신호의 선행성 검증"""
    
    # 1. Granger Causality
    for lag in range(5, 21, 5):
        gc_result = grangercausalitytests(
            np.column_stack([wholesale_index, oil_price]),
            lag
        )
        p_val = gc_result[lag-1][0]['ssr_ftest'][1]
        print(f"Lag {lag}: p={p_val:.4f}")
    
    # 2. 상관성 (즉시)
    corr, p_corr = pearsonr(wholesale_index, oil_price)
    print(f"Immediate correlation: r={corr:.3f}, p={p_corr:.4f}")
    
    # 3. lag 상관성
    for lag in [5, 10, 15, 20]:
        corr_lag, p_lag = pearsonr(wholesale_index[:-lag], oil_price[lag:])
        print(f"Lag {lag} correlation: r={corr_lag:.3f}, p={p_lag:.4f}")
```

## 검증 Pass/Fail 기준

| 기준 | 목표 | 결과 |
|------|------|------|
| **Granger p-value** | < 0.05 (최소 한 lag) | ✅ 기대 |
| **최적 lag** | 5-20일 | ✅ 기대 |
| **상관성** (즉시) | r > 0.2 | ✅ 기대 |
| **상관성** (lag 10) | r > 0.3 | ✅ 기대 |
| **Oil Slice와 상관성** | r < 0.6 (독립적) | ✅ 기대 |

**PASS 기준**: Granger p < 0.05 AND lag 5-20 상관성 r > 0.25

## 데이터 가용성

| 데이터 | 출처 | 시작년도 | 빈도 | 비용 |
|--------|------|---------|------|------|
| Cass Index | cassinfo.com | 2005 | 월간 | ✅ 무료 |
| UPS/FDX 주가 | yfinance | 1990s | 일간 | ✅ 무료 |
| 항만 TEU | americanports.org | 2010 | 월간 | ✅ 무료 |

**결론**: 모든 데이터 2015년 이후 사용 가능 ✅

## 다음 단계

### 지금 (오늘)
- [ ] Cass Index 데이터 다운로드
- [ ] yfinance에서 물류주 받기

### 내일
- [ ] 신호 생성 코드 작성
- [ ] 기본 상관성 계산

### 이번주
- [ ] Granger Causality 테스트
- [ ] 최적 lag 결정
- [ ] Oil Pizza에 결합

---

**상태**: 🚀 **지금 시작하세요!** (가장 빠른 승리)
