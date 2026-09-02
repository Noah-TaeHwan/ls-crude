# 재생에너지 대체 가속도 지수 (Renewable Energy Displacement Index)

**제안일**: 2026-09-02  
**상태**: 아이디어 평가 단계  
**신호 방향**: ⬇️ **음의 신호** (기존 신호들과 역방향)

---

## 핵심 가설

```
재생에너지 뉴스/투자/발전량 ↑ 
  →  석유 수요 감소 기대
  → 원유가 하락 선행 신호
```

### 왜 이 신호가 필요한가?

기존 "Oil Slice" 계열 신호들:
- ✅ 호르무즈 헤드라인 → 유가 ↑
- ✅ CPI/정책 → 유가 ↑
- ✅ 트럼프 발언 → 유가 ↑
- ✅ 고래 포지셔닝 → 유가 ↑

**문제점**: 모두 **상승 신호만** 추적
- 시간이 지나면서 재생에너지 가속도가 점점 유가에 영향
- 2015년: 재생에너지 무시 가능
- 2020년: 테슬라, ESG 붐
- 2024년: 재생에너지가 이제 주요 변수

**해결책**: **음의 신호** 추가 → 균형잡힌 팩터

---

## 팩터 설계

### 버전 1: 뉴스 카운팅 (기본)

```python
# 재생에너지 관련 뉴스 키워드
RENEWABLE_KEYWORDS = [
    "solar", "wind", "renewable", "green energy", "clean energy",
    "EV", "electric vehicle", "tesla", "battery", "energy storage",
    "phase out fossil fuels", "coal plant closure", "net zero",
    "IRENA", "IEA", "solar capacity", "wind capacity",
    "energy transition", "decarbonization",
]

# 일일 뉴스 카운팅 (Investing.com CSV 또는 기타)
daily_renewable_news_count = count_headlines_with_keywords(
    keywords=RENEWABLE_KEYWORDS,
    sources=['CNN', 'Reuters', 'Bloomberg'],
)

# Z-score 정규화 (호르무즈와 동일)
renewable_z = zscore(daily_renewable_news_count, window=20)

# 신호는 NEGATIVE (역방향)
renewable_signal = -1 * renewable_z  # 재생에너지 뉴스 많음 → 음수
```

### 버전 2: 투자 추적 (향상)

```python
# 글로벌 재생에너지 투자액 (주단위 또는 월단위)
renewable_capex_weekly = get_global_renewable_capex()
# 출처: IEA, BloombergNEF, BNEF, IRENA

# 전년동기대비 성장률
renewable_capex_yoy_growth = pct_change(renewable_capex_weekly, periods=52)

renewable_investment_z = zscore(renewable_capex_yoy_growth, window=20)
renewable_signal = -1 * renewable_investment_z  # 투자 증가 → 음수
```

### 버전 3: 실제 발전량 추적 (가장 직결)

```python
# 글로벌 태양광/풍력 발전량 (GWh/day)
global_solar_generation = get_daily_solar_output()  # IEA PVPS
global_wind_generation = get_daily_wind_output()    # IEA Wind

# 시간 경과에 따른 용량 증가 추세
renewable_capacity_growth = (
    global_solar_generation_yoy_change + 
    global_wind_generation_yoy_change
)

# 일일 전력 믹스에서 재생에너지 비중
renewable_mix_pct = (
    (global_solar_generation + global_wind_generation) / 
    global_total_generation
)

# 비중이 높을수록 → 석유 수요 감소
renewable_signal = -1 * zscore(renewable_mix_pct, window=20)
```

### 버전 4: 종합 신호 (권장)

```python
renewable_index = (
    1.0 * zscore(renewable_news_count, 20) +
    0.8 * zscore(renewable_capex, 20) +
    1.2 * zscore(renewable_capacity_growth, 20)
)

renewable_signal = -1 * renewable_index  # 음의 신호
```

---

## 주요 체크항목

| 항목 | 현황 | 평가 |
|------|------|------|
| **뉴스의 무슨?** | 재생에너지 가속도 | ✅ Novel & 필요 |
| **크립토의 뭐?** | (없음, 에너지 신호만) | ✅ Oil Slice 보완 |
| **데이터 출처** | IEA, EIA, Investing.com | ✅ 공개 데이터 |
| **메커니즘** | 에너지 대체 → 수요 감소 → 유가 ↓ | ✅ 명확한 경제학 |
| **신호 방향** | ⬇️ 음수 (기존과 반대) | ✅ 균형 향상 |
| **인샘플** | 2015-01-01 ~ 2023-12-31 | ✅ 가능 (IEA 데이터) |
| **아웃샘플** | 2024-01-01 ~ | ✅ 실시간 추적 가능 |

---

## 실행 가능성 분석

### ✅ 장점

1. **데이터 수집 용이**
   - IEA (국제에너지기구): 월간 발전량 리포트 (공개)
   - BloombergNEF: 재생에너지 투자 추적 (유료지만 유명)
   - 각국 전력 그리드 운영자: 실시간 발전량 공개
   - Investing.com: 재생에너지 뉴스 (이미 사용 중)

2. **신호의 경제학적 근거**
   - **직결성**: 재생에너지 증가 = 석유 대체 효과 (명확)
   - **시간 프리미엄**: 재생에너지 뉴스 → 시장은 3~6개월 후 영향 예상
   - **거시 트렌드**: ESG, 탄소중립, 기후 정책 = 정부 정책 뒷받침

3. **기존 신호들과의 보완**
   ```
   기존 (상승 신호):
   - 호르무즈 긴장 (Oil Slice)
   - 고래 포지셔닝 (Whale Index)
   - 트럼프 발언 (Truth Social)
   
   새 신호 (하강 신호):
   + 재생에너지 가속 (Renewable Displacement)
   
   = 양방향 팩터 (long/short balance)
   ```

4. **신호 신선도**
   - IEA 리포트: 월간 (느림)
   - 뉴스: 거의 실시간
   - 발전량: 일일 (가장 빠름)

### ⚠️ 핵심 도전과제

#### 1. 시간차 (Lag) 불명확
```
Question: 재생에너지 뉴스가 언제 유가에 영향?

가정1: 즉시 (같은 날 또는 다음날)
  → 시장이 기대에 빠르게 반응

가정2: 천천히 (3~6개월)
  → 실제 발전량 증가가 전력망에 통합되는 시간
  → 팩터의 신호 시차 구성 필요

검증 필요: Granger causality로 최적 lag 측정
```

#### 2. 노이즈 vs 신호
```
- 단기 재생에너지 뉴스 = 노이즈 (쉽게 변함)
- 장기 트렌드 = 신호 (점진적 에너지 대체)
- → 롤링 윈도우 크기를 크게 설정해야 함 (20일 → 60일?)
```

#### 3. 선진국 편향
```
재생에너지 뉴스/투자는 선진국 중심
- 미국, EU, 중국: 대부분의 재생에너지 뉴스
- 중동: 거의 없음

문제: 유가는 글로벌 시장 (중동도 포함)
→ 선진국 재생에너지 ≠ 글로벌 유가 직결 아닐 수도
```

#### 4. 정책 변동성
```
- 정부 정책이 바뀌면 재생에너지 투자도 급변
- 예: 트럼프 파이프라인 정책 vs 바이든 인플레이션 감축법
- → 신호가 정책 주기(4년)를 따를 수 있음
```

---

## 데이터 수집 전략

### Option A: IEA 공개 리포트 (추천)
```
IEA Monthly Report on Renewable Energy
- 월간 태양광/풍력 발전량
- 글로벌 용량 추가
- 역사: 2010년부터

https://www.iea.org/reports
- "Renewables" 섹션에서 다운로드
- 수동 또는 웹 스크래핑
```

### Option B: BloombergNEF API
```
재생에너지 투자 추적 (유료)
- 일일 또는 주간 업데이트
- 국가/지역별 세분화
- 비용: $500-2000/월
```

### Option C: 뉴스 기반 (Investing.com 활용)
```
기존 Investing.com CSV 데이터에서
- "renewable", "solar", "wind", "EV", "ESG" 키워드 추가
- 기존 호르무즈 카운팅과 동일 파이프라인
- 비용: 0 (이미 사용 중)
```

### Option D: 전력망 데이터 (우회)
```
각국 그리드 운영자 공개 데이터
- US: EIA, CAISO (캘리포니아)
- EU: ENTSO-E
- 중국: CEC (China Electricity Council)
- 실시간 발전량, 대수롭지 않지만 집계 필요
```

---

## 기존 Oil Slice와의 결합

### 원래 Oil Slice
```python
oil_slice = 2 * hormuz_count + 1 * inflation_count
```

### 개선된 Oil Slice + Renewable Displacement
```python
oil_pizza = (
    2 * hormuz_count +                    # 호르무즈 긴장 (↑)
    1 * inflation_count +                  # CPI/정책 (↑)
    1.5 * whale_directional_signal +       # 고래 포지셔닝 (↑)
    1 * trump_oil_post_count +             # 트럼프 발언 (↑)
    -1.5 * renewable_capacity_growth       # 재생에너지 (↓)
)

pizza_z = zscore(oil_pizza, window=20)
```

**이 결합의 의미**:
```
호르무즈 긴장 + 정책 인플레 + 고래 포지셔닝 + 정치 신호
  vs
재생에너지 가속도

= "부엌이 바빠졌는가" 의 순 신호
```

---

## 시간대별 데이터 가용성

| 기간 | 가능한 데이터 | 신뢰도 |
|------|--------------|--------|
| 2015-2018 | IEA 월간 리포트 | ✅ 가능 |
| 2018-2023 | IEA + 뉴스 | ✅ 최고 |
| 2024-현재 | 뉴스 + 실시간 발전량 | ✅ 최고 |

---

## 최종 평가

| 측면 | 점수 | 의견 |
|------|------|------|
| **창의성** | 9/10 | 역신호로 균형을 맞추는 새로운 각도 |
| **메커니즘** | 8/10 | 명확한 경제학 근거 (에너지 대체) |
| **데이터 가용성** | 8/10 | IEA/뉴스 데이터 충분 |
| **실행성** | 8/10 | 기술적으로 가능, Investing.com 활용 용이 |
| **신호 강도** | 6/10 | 선진국 편향, 시간차 검증 필요 |
| **경쟁력** | 9/10 | 기존 연구에 거의 없는 각도 (음의 신호 추가) |

---

## 추천: 즉시 구현 가능

### Phase 1️⃣: 뉴스 기반 빠른 프로토타입 (1주)
```python
# Investing.com 기존 데이터에서 키워드 추가
renewable_keywords = [
    "renewable", "solar", "wind", "EV", "electric vehicle",
    "tesla", "green energy", "clean energy", "net zero"
]

# 호르무즈와 동일한 파이프라인
daily_renewable_count = count_headlines(renewable_keywords)
renewable_z = zscore(daily_renewable_count, window=20)
renewable_signal = -1 * renewable_z

# Oil Slice와 즉시 결합
improved_oil_pizza = (
    2 * hormuz_z +
    1 * inflation_z +
    -1 * renewable_z  # 추가!
)
```

### Phase 2️⃣: IEA 발전량 데이터 추가 (2주)
```python
# IEA 월간 리포트에서 용량 성장 데이터 추출
renewable_capacity_growth = extract_from_iea_reports()
renewable_capex = extract_investment_data()

# 뉴스 + 실제 데이터 혼합
renewable_composite = (
    0.7 * zscore(daily_renewable_count, 20) +
    0.3 * zscore(renewable_capacity_growth, 60)  # 긴 윈도우
)

renewable_signal = -1 * renewable_composite
```

### Phase 3️⃣: 최적 가중치 튜닝 (1개월)
```python
# 인샘플 2015-2023에서 최적 가중치 찾기
# (음수 가중치도 가능 → long/short balance 최적화)

oil_pizza = (
    w1 * hormuz_z +
    w2 * inflation_z +
    w3 * whale_z +
    w4 * trump_z +
    w5 * renewable_z  # w5 < 0 (음수)
)

# Sharpe ratio 최대화하는 w1~w5 찾기
```

---

## 다음 스텝: 우선순위

### 🔴 P1: 기존 Investing.com 데이터 활용
```
지금 바로 가능:
- "renewable", "solar", "wind" 키워드를 호르무즈와 동일하게 카운팅
- Oil Slice와 결합해서 상관성 테스트
- 아웃샘플부터 추적
```

### 🟡 P2: IEA 월간 리포트 추가
```
2주 내:
- IEA 역사 데이터 수동 수집 (2015-2023)
- 월간을 일일로 interpolate
- Investing.com 뉴스와 결합
```

### 🟢 P3: 최적 시간차 찾기
```
1개월 내:
- Granger causality: 재생에너지 → 유가 몇 일 선행?
- 최적 lag 결정 (0, 5, 30, 60일?)
```

---

## 최종 권장사항

**이 팩터는 지금 바로 구현할 가치가 있습니다.**

이유:
1. ✅ **기존 신호들의 여집합** (상승 vs 하강 균형)
2. ✅ **메커니즘 명확** (에너지 대체 = 직결)
3. ✅ **데이터 이미 있음** (Investing.com 뉴스 활용)
4. ✅ **신선한 각도** (기존 연구에 거의 없음)
5. ✅ **장기 구조적 트렌드** (2015~2024 점진적 가속)

---

## 궁금한 점

1. Investing.com CSV에 재생에너지 헤드라인이 충분한가?
2. IEA 데이터를 자동화해서 가져올 수 있을까? (API vs 수동)
3. 다른 음의 신호도 필요? (예: OPEC 감산 발표 실패?)

**지금 바로 Investing.com 데이터에서 "renewable" 카운팅을 시작해볼까요?**
