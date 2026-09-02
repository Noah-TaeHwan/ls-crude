# 도매-물류 활동 지수 (Wholesale-Logistics Activity Index)

**제안일**: 2026-09-02  
**상태**: 아이디어 평가 단계  
**신호 방향**: ↑ **양의 신호** (경기 → 에너지 수요)

---

## 핵심 가설

```
도매업의 운송 + 보관 활동도 ↑
  → (1) 디젤/벙커유 수요 ↑ (트럭, 선박)
  → (2) 창고 냉난방/전력 수요 ↑ (에너지)
  → (3) 경기 선행 신호 (경기 ↑ → 도매업 ↑ → 유가 ↑)
  → 원유가 상승 선행
```

### 경제학적 근거

```
순환 구조:
  Demand ↑ (수요 증가)
    ↓
  소비자 주문 증가 (B2C)
    ↓
  도매업/유통사 이동 물량 ↑
    ↓
  트럭/배 운송량 ↑ (디젤 수요)
  창고 보관 시간 증가 (냉각/난방)
    ↓
  에너지 수요 ↑
    ↓
  유가 ↑
```

### 시간 프리미엄

```
Timeline:
Day 0:   수요 증가 신호 (뉴스, 주가 등)
Day 1-5: 도매업 주문 폭증
Day 5-15: 트럭/배 운송 물량 급증
Day 15-30: 유가 시장이 반응
Day 30-90: 공급 조정 (OPEC 감산 등)

→ 도매 활동도는 5-15일 선행 (유가보다 먼저 움직임)
```

---

## 팩터 설계

### 버전 1: 운송 물류 지수 (가장 직결)

```python
# Cass Freight Index (가장 널리 사용되는 운송 지수)
# - 트럭, 철도, 해운, 항공의 종합 운송 비용 추적
# - 월간 발표 (역사: 1990년부터)

TRANSPORT_INDICES = [
    'cass_freight_index',          # 트럭 + 철도 + 해운
    'joc_index',                   # 컨테이너 운송 (Jon of China)
    'clarkson_shipping_index',     # 해운 거래율
]

# Daily로 보간하는 방법: 부분 주간 발표 이용
weekly_cass = fetch_cass_freight_index()
daily_transport = interpolate_linear(weekly_cass)

transport_z = zscore(daily_transport, window=20)
transport_signal = transport_z  # 양의 신호 (↑ = 유가 ↑)
```

### 버전 2: 도매업 회사 실적 추적

```python
# 도매-물류 관련 상장사
WHOLESALE_LOGISTICS_TICKERS = [
    'XPO',      # XPO Logistics (3PL, 트럭 운송)
    'JBT',      # J.B. Hunt Transport Services
    'UPS',      # United Parcel Service (소포 + 화물)
    'FDX',      # FedEx (항공 화물)
    'ODFL',     # Old Dominion Freight Line
    'AZO',      # AutoZone (자동차 부품 도매)
    'TDY',      # Teledyne Technologies (산업 도매)
    'URW',      # Urstadt Biddle Properties (물류 부동산)
]

def wholesale_activity_index(tickers: List[str]) -> pd.Series:
    """
    도매-물류 회사들의 주가 움직임 → 운송 활동도 지표
    """
    
    # 각 회사의 주가 정상화 (2015-01-01 = 100 기준)
    prices = {}
    for ticker in tickers:
        price = yf.download(ticker, start='2015-01-01', progress=False)['Close']
        prices[ticker] = price / price.iloc[0] * 100
    
    # 동등 가중 지수
    index = pd.concat(prices.values(), axis=1).mean(axis=1)
    
    # 변화율 (월간 성장률)
    index_growth = index.pct_change(21)  # 거래일 21 = 1개월
    
    # Z-score
    signal = zscore(index_growth, window=20)
    
    return signal
```

### 버전 3: 항만/공항 물동량 (가장 선행)

```python
# 글로벌 항만 물동량 (컨테이너 기준)
# - Shanghai Port (세계 최대)
# - Singapore Port (환적 중심)
# - Rotterdam Port (유럽)
# - LA Port (미국)
# - Busan Port (한국)

PORT_AUTHORITIES = {
    'shanghai': 'https://www.chinaports.org/...',  # 공개 API/데이터
    'singapore': 'https://www.portsofsingapore.com',
    'rotterdam': 'https://www.portofrotterdam.com',
    'la': 'https://www.polb.com',
}

def fetch_global_port_throughput() -> pd.DataFrame:
    """
    주요 항만의 월간 TEU (Twenty-foot Equivalent Unit) 데이터
    """
    
    # 각 항만 데이터 수집 (웹 스크래핑 또는 API)
    throughput = pd.DataFrame({
        'shanghai_teu': fetch_shanghai_teu(),
        'singapore_teu': fetch_singapore_teu(),
        'rotterdam_teu': fetch_rotterdam_teu(),
    })
    
    # 글로벌 컨테이너 지수 (동등 가중)
    global_teu = throughput.mean(axis=1)
    
    # 전년동기대비 성장률 (YoY)
    teu_growth = global_teu.pct_change(12)  # 12개월 = 1년
    
    return teu_growth

# 신호화
teu_z = zscore(fetch_global_port_throughput(), window=20)
```

### 버전 4: 창고 이용률 (보관 활동)

```python
# 산업용 부동산 창고 이용률
# - CBRE Industrial Real Estate Index
# - CoStar's Cornerstone platform
# - 분기별 발표

def warehouse_occupancy_index() -> pd.Series:
    """
    미국 산업용 부동산 (창고) 이용률
    - 높을수록 도매업 보관 활동 많음
    - 높을수록 냉난방 에너지 수요 증가
    """
    
    occupancy = fetch_cbre_occupancy()  # 분기별
    
    # YoY 변화율 (늘어나는가 줄어드는가?)
    occupancy_change = occupancy.pct_change(4)
    
    # Daily로 보간
    occupancy_daily = occupancy.interpolate(method='linear')
    
    return zscore(occupancy_daily, window=20)
```

### 버전 5: 종합 지수 (권장)

```python
def wholesale_logistics_composite_index(
    weight_transport=0.40,
    weight_shipping=0.30,
    weight_warehouse=0.20,
    weight_company_stock=0.10,
) -> pd.Series:
    """
    도매-물류 종합 지수
    
    가중치:
    - 트럭 운송 (40%): 직접적 디젤 수요
    - 해운 지수 (30%): 국제 운송
    - 창고 이용률 (20%): 냉난방 에너지
    - 도매 회사 주가 (10%): 경제 심리
    """
    
    transport_signal = zscore(cass_freight_index, 20)
    shipping_signal = zscore(joc_shipping_index, 20)
    warehouse_signal = zscore(occupancy_rate, 20)
    company_signal = zscore(wholesale_stock_index, 20)
    
    composite = (
        weight_transport * transport_signal +
        weight_shipping * shipping_signal +
        weight_warehouse * warehouse_signal +
        weight_company_stock * company_signal
    )
    
    return zscore(composite, window=20)
```

---

## 주요 체크항목

| 항목 | 현황 | 평가 |
|------|------|------|
| **신호의 무슨?** | 도매-물류 활동도 | ✅ Novel & 명확 |
| **데이터 출처** | Cass, Port data, CBRE | ✅ 공개 & 선진국 데이터 |
| **메커니즘** | 경기 → 도매 ↑ → 운송 ↑ → 유가 ↑ | ✅ 명확한 경제학 |
| **신호 방향** | ↑ (양의 신호) | ✅ Oil Slice와 일치 |
| **신호 신선도** | 월간 (약 30일 lag) | ⚠️ 중간 (뉴스보다 느림) |
| **선행성** | 유가보다 5-30일 선행 | ✅ 괜찮은 선행성 |
| **인샘플** | 2015-01-01 ~ 2023-12-31 | ✅ 가능 |
| **아웃샘플** | 2024-01-01 ~ | ✅ 실시간 추적 |

---

## 실행 가능성 분석

### ✅ 장점

1. **데이터 수집 매우 쉬움**
   - Cass Freight Index: 공개 + 유료 정보 회사들이 정리
   - 항만 데이터: 각국 항만청이 공개
   - CBRE 데이터: 부동산 데이터베이스
   - 주가: yfinance에서 바로 다운로드

2. **메커니즘이 직관적**
   - 도매 물량 ↑ = 트럭 연료 ↑
   - 저장 기간 늘어남 = 냉난방 에너지 ↑
   - 경기 선행 신호 (공식적으로 인정됨)

3. **신호의 신선도**
   - 월간 발표 (뉴스보다는 느리지만 정규적)
   - 주간 부분 업데이트도 가능 (Cass 트럭 부문)
   - 거의 실시간 (주가 데이터)

4. **기존 팩터와의 보완**
   ```
   - Oil Slice: 뉴스 기반 (호르무즈, CPI)
   - Truth Social: 정치 신호 (발언)
   - Whale Index: 정보우월 주체 (고래)
   + Wholesale Activity: 경기 활동 신호 ← 새로운 각도!
   
   = 뉴스 + 정치 + 정보우월 + 경기활동 (4가지 신호원)
   ```

5. **계절성 통제 가능**
   - 도매 활동은 계절성 강함 (명절, 여름/겨울)
   - 데이터 자체가 계절 조정됨 (Seasonally Adjusted)
   - 또는 YoY 변화율로 정규화

### ⚠️ 핵심 도전과제

#### 1. 글로벌 vs 미국 (데이터 세분화)
```
Problem:
- Cass Freight Index = 미국만
- 유가 = 글로벌 시장
- 미국 도매 활동 ≠ 글로벌 유가

해결:
- 글로벌 항만 물동량 추가 (주요 국가 항만)
- IATA 항공 화물 지수 추가
- OECD 경기 선행지수 결합
```

#### 2. 시간차 (Lag) 정확성
```
Question:
도매 물량이 정확히 언제 유가에 영향?

시나리오 A: 즉시 (같은 달)
  → 시장이 매우 빠르게 반응

시나리오 B: 1-2개월 lag
  → 실제 운송량 증가가 에너지 가격 상승으로 변환

검증 필요: Granger Causality로 최적 lag 측정
```

#### 3. 선행성 vs 동행성 불명확
```
Correlation ≠ Causation

가능성 1: 도매 활동이 유가를 선행 (우리 가설)
가능성 2: 유가가 먼저 오르고 → 도매 활동 증가 (역인과)
가능성 3: 공통 인수 (경기 사이클)가 둘 다 움직임

→ Factor Lab의 Granger Causality + Permutation test 필수
```

#### 4. 장기 추세 vs 단기 노이즈
```
도매 물량은 매우 변동성 큼 (계절성, 경기 변화)
→ 20일 rolling zscore만으로는 노이즈 많음
→ 60일 윈도우 또는 저주파 필터 필요
```

---

## 데이터 수집 전략

### Strategy A: 종합 접근 (권장)

```python
# 1. Cass Freight Index (미국 운송)
cass = fetch_cass_freight_index()  # 월간, 무료/유료

# 2. 글로벌 항만 TEU (국제 운송)
ports = pd.DataFrame({
    'shanghai': fetch_shanghai_port_teu(),
    'singapore': fetch_singapore_port_teu(),
    'rotterdam': fetch_rotterdam_port_teu(),
    'la': fetch_la_port_teu(),
})
global_port = ports.mean(axis=1)

# 3. IATA 항공 화물 지수
iata_air = fetch_iata_air_cargo_index()

# 4. CBRE 창고 이용률
cbre = fetch_cbre_warehouse_occupancy()

# 5. 도매-물류 회사 주가
logistics_stocks = yf.download(
    ['XPO', 'JBT', 'UPS', 'FDX', 'ODFL'],
    start='2015-01-01'
)['Close']

# 6. 결합
composite = (
    0.40 * zscore(cass, 20) +
    0.25 * zscore(global_port, 20) +
    0.15 * zscore(iata_air, 20) +
    0.10 * zscore(cbre, 20) +
    0.10 * zscore(logistics_stocks.mean(axis=1), 20)
)
```

### Strategy B: 빠른 프로토타입 (2주)

```python
# 가장 접근 쉬운 것부터

# 1. Cass Freight (무료 버전은 월간만, 유료는 주간)
# https://www.cassinfo.com/freight-index

# 2. 도매-물류 주가 (yfinance에서 바로)
tickers = ['XPO', 'JBT', 'UPS', 'FDX']
prices = yf.download(tickers, start='2015-01-01')['Close']
index = prices.mean(axis=1)

# 3. 간단한 신호
composite = zscore(index.pct_change(21), 20)  # 월간 성장률

# → 이것만으로도 검증 시작 가능
```

---

## 기존 팩터와의 결합

### 개선된 Oil Pizza (Version 2)

```python
oil_pizza_v2 = (
    2.0 * oil_slice +                    # 뉴스: 호르무즈+CPI
    1.5 * whale_signal +                 # 크립토: 고래 포지셔닝
    1.0 * trump_posts +                  # 정치: 트럼프 발언
    1.5 * wholesale_logistics +          # 경기: 도매-물류 활동 ← NEW
    -1.5 * renewable_displacement +      # 에너지: 재생에너지
    -1.0 * financial_demand_ml           # 재무: ML 예측
)

pizza_z = zscore(oil_pizza_v2, 20)
```

**신호원 다각화:**
```
뉴스 (Oil Slice)
경기 (Wholesale Logistics)      ← 추가!
정치 (Truth Social)
정보우월 (Whale Index)
에너지 (Renewable)
재무 (ML)

= 6가지 각도에서 유가 분석
```

---

## 최종 평가

| 측면 | 점수 | 의견 |
|------|------|------|
| **창의성** | 7/10 | 물류 지수는 유명하지만, 유가와의 명시적 연계는 새로움 |
| **메커니즘** | 9/10 | 매우 명확한 경제학 근거 |
| **데이터 가용성** | 8/10 | Cass, 항만 데이터, 주가 모두 공개 |
| **실행성** | 9/10 | 기술적으로 쉬움, 바로 시작 가능 |
| **신호 신선도** | 6/10 | 월간 (뉴스보다 느림, 하지만 정규적) |
| **경쟁력** | 8/10 | 물류-에너지 연계는 학계/산업에서 인정됨 |
| **선행성** | 7/10 | 5-30일 선행 (검증 필요) |

---

## 추천: 즉시 구현 단계

### Phase 1️⃣: 빠른 프로토타입 (1주)
```python
# Cass Freight Index + 물류 주가 (UPS, FedEx)
# → 2015-2023 역사 데이터
# → Oil Slice와 상관성 테스트
# → Granger causality로 선행성 검증
```

### Phase 2️⃣: 글로벌 데이터 추가 (2주)
```python
# 주요 항만 TEU + IATA 항공 화물
# → 미국 편향 제거
# → 글로벌 신호로 강화
```

### Phase 3️⃣: 최적 가중치 & Factor Lab 검증 (1주)
```python
# Walk-forward validation
# Permutation test
# 5개 시간지평 검증
# → PASS/FAIL 판정
```

---

## 다음 스텝: 우선순위

### 🔴 P1: Cass + 물류주 신호 구축 (지금, 3일)
```
- yfinance로 물류 회사 주가 다운로드 (XPO, UPS, FDX)
- 월간 수익률 계산
- Oil Slice와 병렬 시각화
- 눈으로 상관성 확인
```

### 🟡 P2: Granger Causality 검증 (1주)
```
- statsmodels로 Granger test 실행
- 최적 lag 결정 (0, 5, 10, 20, 30일)
- p-value < 0.05인 lag 찾기
```

### 🟢 P3: Factor Lab 통합 (2주)
```
- factor_lab.py 확장
- Permutation test 실행
- 5개 시간지평 검증
- PASS/FAIL 선언
```

---

## 최종 권장사항

**이 팩터는 지금 바로 시작할 가치 있습니다:**

1. ✅ **데이터 수집이 매우 쉬움** (1주 안에 완료)
2. ✅ **메커니즘이 명확** (도매 물량 = 에너지 수요)
3. ✅ **기존 팩터와 보완** (뉴스 + 경기 활동 혼합)
4. ✅ **선행성이 있을 가능성** (5-30일)
5. ✅ **검증이 단순** (Factor Lab 프레임 그대로 사용)

---

## 지금까지의 팩터 종합 (최신)

| # | 팩터 | 신호 | 상태 | 
|---|------|------|------|
| 1 | Oil Slice (기본) | ↑ | ✅ 구현됨 |
| 2 | Truth Social | ↑ | ✅ 구현됨 |
| 3 | Whale Index | ↑ | 📋 평가 |
| 4 | Renewable Displacement | ↓ | 📋 평가 |
| 5 | Financial Demand (ML) | ↓ | 🔬 R&D |
| 6 | Wholesale-Logistics | ↑ | 🟢 즉시 추천! |

**최종 Ultimate Oil Pizza (Version 3)**
```python
oil_pizza = (
    2.0 * oil_slice +                    # 뉴스
    1.5 * wholesale_logistics +          # 경기 ← NEW
    1.5 * whale_signal +                 # 정보우월
    1.0 * trump_posts +                  # 정치
    -1.5 * renewable_displacement +      # 에너지 대체
    -1.0 * financial_demand_ml           # 재무 ML
)

pizza_z = zscore(oil_pizza, 20)
```

---

**바로 Phase 1 (Cass + 물류주 신호 구축)부터 시작해볼까요?**
