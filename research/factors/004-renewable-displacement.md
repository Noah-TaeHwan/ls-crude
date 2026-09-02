# 004 — Renewable Displacement Index (재생에너지 대체)

**상태**: ⏸️ **HOLD** — 월간 공개 자료의 발표시점·개정 이력과 독립적 메커니즘 검증이 필요
**신호**: ↕ 중기 수요·대체 레짐 후보; WTI 방향은 미정
**Oil Pizza 가중치**: `0.0`

## 가설

재생에너지(태양광, 풍력, 수소) 신호 ↑ → 석유 수요 ↓ → 유가 ↓

## 신호 구성 (3가지)

### A. 재생에너지 뉴스 빈도

사용자가 제공한 Investing.com CSV가 있을 때만 "renewable", "solar", "wind", "EV", "hydrogen" 키워드를 탐색한다. 사이트를 직접 스크래핑하지 않는다.

```python
renewable_keywords = [
    'renewable', 'solar', 'photovoltaic', 'pv', 'wind',
    'hydroelectric', 'hydrogen', 'fuel cell', 'ev charging', 'electric vehicle'
]

renewable_news_daily = investing_headlines.apply(
    lambda row: sum(k in row['text'].lower() for k in renewable_keywords)
)
renewable_news_z = zscore(renewable_news_daily, window=20)
```

### B. IEA 발전량 데이터

IEA에서 월간 발전량 리포트 다운로드

```
IEA URL: https://www.iea.org/data-and-statistics/
데이터: 월간 재생에너지 발전 (%)
형식: CSV

renewable_pct_of_total = [
    2026-01: 35%,
    2026-02: 36%,
    ...
]

# 일간 데이터로 interpolate
renewable_capacity_z = zscore(interpolate_daily(renewable_pct), window=30)
```

### C. 청정에너지 회사 주가

에너지 전환 관련 회사들의 상대 강도

```python
import yfinance as yf

clean_energy_tickers = [
    'ICLN',   # iShares Global Clean Energy ETF
    'QCLN',   # Invesco NASDAQ Clean Energy
    'RNRW',   # Invesco Global Clean Energy
]

def get_clean_energy_signal():
    prices = yf.download(clean_energy_tickers, start='2015-01-01')

    # 상대 강도 (대비 S&P 500)
    sp500 = yf.download('SPY', start='2015-01-01')
    relative_strength = (prices / sp500) / (prices.shift(20) / sp500.shift(20))
    clean_energy_z = zscore(relative_strength.mean(axis=1), window=20)

    return clean_energy_z
```

## 신호 결합

```python
renewable_index = (
    0.4 * renewable_news_z +        # 뉴스 인기도
    0.3 * renewable_capacity_z +    # 물리적 생산량
    0.3 * clean_energy_stock_z      # 투자자 심리
)

# 음의 신호로 결합 (유가와 역방향)
oil_pizza_component = -1.5 * renewable_index
```

## 데이터 수집 계획

| 데이터 | 소스 | 빈도 | 비용 | 시작 |
|--------|------|------|------|------|
| 뉴스 | 사용자 제공 Investing.com CSV | 일간 | CSV 이용 조건 확인 필요 | 제공 시 |
| IEA 발전량 | IEA.org | 월간 | ✅ 무료 | 2주 |
| 청정에너지 주가 | yfinance | 일간 | ✅ 무료 | 즉시 |
| RenewableNow | rnw.org | 실시간 | 💰 $300/월 | 나중에 |

## 신호 예시

```
2026년 8월:
- 태양광 뉴스 문서: 47개 (월평균 35개 대비 +34%) → renewable_news_z = +1.2
- 재생에너지 비율: 37% (예측 35% 대비 +2%) → renewable_capacity_z = +0.8
- 청정에너지 주 매수초과 → clean_energy_stock_z = +1.1

renewable_index = 0.4*1.2 + 0.3*0.8 + 0.3*1.1 = +1.01
oil_pizza_contribution = -1.5 * 1.01 = -1.51 (음의 신호 → 유가 약세)
```

## 검증 기준 (Pass/Fail)

- [ ] Investing.com CSV에서 renewable 키워드 추출 가능?
- [ ] IEA 데이터를 월간 → 일간 interpolation 가능?
- [ ] 발표시점 기준의 월간 자료가 충분한 역사 구간을 갖는가?
- [ ] 각 구성요소가 사전 지정한 타깃과 독립적 관계를 보이는가?
- [ ] 3개 신호의 상관성 너무 높지 않은가? (r < 0.7)

## 구현 로직

```python
# research/src/ls_crude/features/renewable_displacement.py

import pandas as pd
import yfinance as yf
from scipy import stats

def get_renewable_news_signal(news_df, window=20):
    """사용자가 제공한 Investing.com CSV에서만 재생에너지 신호를 계산한다."""
    keywords = ['renewable', 'solar', 'wind', 'ev', 'hydrogen']
    daily_count = news_df.groupby('date').apply(
        lambda x: sum(any(k in row.lower() for k in keywords) for row in x)
    )
    return zscore(daily_count, window)

def get_renewable_capacity_signal(iea_csv_path, window=30):
    """IEA 발전량 데이터"""
    iea_data = pd.read_csv(iea_csv_path)
    renewable_pct = iea_data['renewable_percent_of_total']
    daily_interpolated = renewable_pct.interpolate()
    return zscore(daily_interpolated, window)

def get_clean_energy_stock_signal(tickers, window=20):
    """청정에너지 주가 상대 강도"""
    prices = yf.download(tickers, start='2015-01-01')
    sp500 = yf.download('SPY', start='2015-01-01')['Adj Close']
    relative = (prices / sp500) / (prices.shift(20) / sp500.shift(20))
    return zscore(relative.mean(axis=1), window)

def get_renewable_displacement_index(news_df, iea_csv, start_date='2015-01-01'):
    """최종 재생에너지 대체 지수"""
    news_z = get_renewable_news_signal(news_df)
    capacity_z = get_renewable_capacity_signal(iea_csv)
    stock_z = get_clean_energy_stock_signal(['ICLN', 'QCLN'], window=20)

    # 3개 신호 결합
    renewable_index = 0.4*news_z + 0.3*capacity_z + 0.3*stock_z

    return -1.5 * renewable_index  # 음의 신호
```

## 다음 단계

### 이번주
- [ ] Investing.com CSV 재분석 (renewable 키워드)
- [ ] IEA 데이터 수집 시작

### 다음주
- [ ] 뉴스 신호 생성
- [ ] yfinance로 청정에너지 주가 다운로드
- [ ] 유가와의 상관성 검증

---

**우선순위**: 🟢 높음 (데이터 접근성 좋음, 즉시 가능)
