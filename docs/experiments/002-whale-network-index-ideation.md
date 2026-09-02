# 고래 네트워크 지수 (Whale Network Index)
## CoinEx · Nobitex 고래 움직임 추적

**제안일**: 2026-09-02  
**상태**: 아이디어 평가 단계

---

## 핵심 가설

### 기본 신호
```
고래 이동 (>$1M 거래) ↑ at CoinEx/Nobitex 
  ↓
(1) 에너지 자산 포지셔닝 신호 (헤지펀드/기관)
(2) 중동 제재/정치 긴장 신호 (Nobitex = 이란)
  ↓
원유가 상승 선행 신호
```

### 크립토와 유가의 연결고리

| 링크 | 설명 | 신뢰도 |
|------|------|--------|
| **유동성 추적** | 고래 = 정보 우월 주체(헤지펀드, 국가펀드) | ✅ 높음 |
| **제재 우회** | Nobitex = 이란 금융 통로 → 이란 산유 거래 | ⚠️ 중간 (추측) |
| **에너지 펀드** | BTC ↔ 유가 쌍거래 포지션 (거시 헤지) | ⚠️ 중간 |
| **정보 선행성** | 고래 움직임이 뉴스보다 빠름 | ✅ 높음 |

---

## 팩터 설계

### 1️⃣ 기본 버전 (고래 이동량)

```python
whale_transfers = {
    'coinex': get_large_transfers(exchange='CoinEx', threshold=1_000_000),
    'nobitex': get_large_transfers(exchange='Nobitex', threshold=1_000_000),
}

whale_index = (
    whale_transfers['coinex'].volume_sum + 
    whale_transfers['nobitex'].volume_sum
)

whale_z = rolling_zscore(whale_index, window=20)
```

### 2️⃣ 향상된 버전 (방향성 + 위험도)

```python
# 고래 OUT 이동 = 이익 실현 또는 위험 회피
whale_outflow = calculate_net_outflow(
    exchange=['CoinEx', 'Nobitex'],
    threshold=1_000_000
)

# 특정 에너지 자산 추적 (있다면)
# - BTC, ETH (대규모 거래소 기반)
# - 유가 연동 토큰 (synthetic commodities)

whale_signal = (
    2 * whale_outflow['direction'] +  # OUT: -1, IN: +1
    1 * whale_outflow['volume_zscore']
)
```

### 3️⃣ 지정학적 버전 (이란 신호 강화)

```python
# Nobitex 고래 활동 = 이란 금융 시스템 활동도
# 이란 제재/핵협상 상황과 상관

nobitex_whale_ratio = (
    nobitex_volume / (coinex_volume + nobitex_volume)
)

# Nobitex 비중 ↑ → 이란 제재/정치 긴장 가능성?
geopolitical_z = rolling_zscore(nobitex_whale_ratio, window=20)
```

---

## 주요 체크항목

| 항목 | 현황 | 평가 |
|------|------|------|
| **크립토의 뭐?** | 고래 이동량 (on-chain 신호) | ✅ Novel |
| **뉴스의 무슨?** | (없음, 순수 암호화폐) | ✅ Oil Slice 상이 |
| **데이터 출처** | Glassnode, Nansen, on-chain APIs | ✅ 공개 가능 |
| **메커니즘** | 정보우월 주체의 포지셔닝 | ⚠️ 간접적 |
| **인샘플** | 2018-01-01 ~ 2023-12-31 | ❓ CoinEx/Nobitex 역사 |
| **아웃샘플** | 2024-01-01 ~ | ✅ 실시간 추적 가능 |

---

## 실행 가능성 분석

### ✅ 장점

1. **데이터 수집 용이**
   - Glassnode, Nansen, CryptoQuant 유료 API
   - 또는 blockchain.com, etherscan.io 공개 데이터
   - 고래 임계값 자체 정의 가능

2. **신선도 (신호 선행성)**
   - On-chain 거래는 거의 실시간 (뉴스보다 빠름)
   - 높은 주파수 신호 → 단기 거래 가능

3. **크립토-유가 연결고리**
   - 거시 헤지펀드: BTC 매수 = 인플레이션 헷지 = 에너지 동반 상승
   - 이란 제재 우회: Nobitex = 석유 거래 자금 이동
   - 에너지 자산 파생상품 추적 (BTC-oil swap)

4. **Nobitex의 지정학적 신호**
   - 이란 거래소의 고래 활동 = 제재 강도, 핵협상 진전, 유가 전망
   - 정보 우월 가능성 높음

### ⚠️ 핵심 도전과제

#### 1. 메커니즘 검증 (가장 중요)
```
Question: 왜 CoinEx/Nobitex 고래가 원유가를 선행하는가?
- "고래 = 정보 우월" → 맞나? 아니면 그냥 변동성?
- Nobitex가 정말 이란 자금인가? (제3국 자금일 수도)
- BTC와 유가의 correlation이 시간마다 다름 (꼭 양수만은 아님)
```

**검증 방법:**
- 2018-2023 인샘플에서 cross-correlation 측정
- Granger causality 테스트 (고래 → 유가)
- 통제: 일반 거래량, BTC 가격, VIX와 비교

#### 2. 데이터 가용성 (역사)
- **CoinEx**: 2018년 설립, 데이터 접근 가능?
- **Nobitex**: 2015년경 시작, 규제 때문에 공개 정보 거의 없음
- **Glassnode/Nansen**: 2018년부터 추적 (2015-2017 공백)

#### 3. 노이즈 vs 신호
- 고래가 항상 정보 우월인가? (때론 손실 보는 고래도 있음)
- 거래소별 고래 정의가 다름
- 단순 이동 vs 의도적 포지셔닝 구분 필요

#### 4. 제재 규제 리스크
- Nobitex 데이터 수집 자체가 제재법 위반? (OFAC)
- 미국 기관 투자자용 인덱스에 포함 불가능할 수도

---

## 데이터 수집 전략

### Option A: 상업용 데이터 서비스 (추천)
```
Glassnode / CryptoQuant / Nansen
- 장점: 정제된 고래 신호, 역사 데이터 2018년부터
- 단점: 비싼 구독료 ($500-5000/월)
- 선택: "Whale Transactions" 지표
```

### Option B: 공개 API + 자체 처리
```python
# On-chain 거래 추적
from web3 import Web3
import requests

# CoinEx warm wallet 추적 (알려진 주소)
# Nobitex 콜드 월렛 추적 (어려움, 정보 부족)

# Etherscan/Blockchain API로 대규모 이동 감지
# 임계값: > 1M USD
```

### Option C: 우회 신호 (Proxy)
```python
# 직접적인 Nobitex 데이터 대신:
# - 이란 P2P 암호화폐 프리미엄 (LocalBitcoins, Paxful)
# - 이란 경제 제재 인덱스와 상관
# - SWIFT 제외 국가의 대체 거래 패턴
```

---

## 팩터 구성: 3가지 버전

### Version 1: Pure Whale Volume (기본)
```
whale_z = zscore(whale_inflow + outflow, 20d)
실행 난이도: ⭐⭐ (데이터만 확보되면 쉬움)
신호 강도: ⭐⭐ (노이즈 많음)
```

### Version 2: Directional Whale (향상)
```
whale_signal = (2 * net_direction + 1 * volume_zscore)
z = zscore(whale_signal, 20d)
실행 난이도: ⭐⭐⭐ (거래 방향 판단 필요)
신호 강도: ⭐⭐⭐ (메커니즘 더 명확)
```

### Version 3: Geopolitical Whale (지정학)
```
nobitex_premium = nobitex_share / (coinex_share + 1e-6)
geopolitical_z = zscore(nobitex_premium, 20d)
combined = (1.5 * whale_z + 1 * geopolitical_z)  # Oil Slice와 결합
실행 난이도: ⭐⭐⭐⭐ (Nobitex 데이터 접근 어려움)
신호 강도: ⭐⭐⭐⭐⭐ (제재/정치 신호 포함)
```

---

## Oil Slice와의 결합 가능성

### 개선된 "Oil Slice Pizza"

```python
oil_pizza = (
    2 * hormuz_news_count +           # 뉴스: 호르무즈
    1 * inflation_news_count +         # 뉴스: CPI/정책
    1.5 * whale_directional_signal +   # 크립토: 고래 포지셔닝
    1 * geopolitical_whale_z          # 크립토: Nobitex 이란 신호
)

pizza_z = zscore(oil_pizza, 20d)
```

**이 결합식의 장점:**
- 뉴스 (호르무즈, 정책) + 크립토 (고래, 제재) 혼합
- 정보우월 주체 2개 층 (뉴스 기자 + 고래 트레이더)
- "부엌이 바빠졌는가" 다각 확인

---

## 최종 평가

| 평가 | 점수 | 의견 |
|------|------|------|
| 창의성 | 8/10 | 암호화폐 × 유가 괜찮은 각도 |
| 메커니즘 | 5/10 | 직관적이지만 증명 필요 |
| 데이터 가용성 | 7/10 | 상업 API는 있지만, Nobitex 제한적 |
| 실행성 | 6/10 | 기술은 가능, 규제 리스크 있음 |
| 경쟁력 | 7/10 | 온체인 고래 신호는 유명, 하지만 유가 연계는 novel |

---

## 다음 스텝

### 추천 경로

1. **즉시**: Version 1 (Pure Whale Volume) 구현
   - Glassnode 또는 공개 API로 CoinEx 고래 추적
   - 2018-2023 역사 데이터 수집
   - Oil Slice와 상관 테스트

2. **2주 후**: Granger Causality 검증
   - 고래 신호 → 유가 선행성 측정
   - 통제 변수 (BTC 가격, 거래량) 추가
   - 유의성 판정

3. **발견 시**: Version 2/3로 고도화
   - 방향성 신호 추가
   - (가능하면) Nobitex 데이터 통합

### 리스크 체크
- ⚠️ Nobitex는 제재 대상국 거래소 → 접근/공개에 주의
- ⚠️ 고래 신호 자체가 뉴스 선행인지, 뉴스를 쫓아가는 건지 검증 필요
- ⚠️ 인샘플 2018-2023에 CoinEx/Nobitex가 진짜 고래 활동했나?

---

## 추천: 이 팩터를 시험해볼까?

**장점:**
- 완전히 새로운 신호 (Oil Slice에 없음)
- 데이터 수집 기술적으로 가능
- 크립토-유가 연계는 거시 트레이더들 사이에서 관심 주제

**단점:**
- 메커니즘 증명이 쉽지 않음
- Nobitex 데이터 접근 어려움 (규제 + 폐쇄성)
- 인샘플 역사 데이터 부족 가능성

**의견:** Version 1 (순수 고래 이동량)부터 시작하는 게 낫겠습니다. Nobitex는 나중에 "보너스 신호"로만 추가.

---

**궁금한 점:**
1. 고래 신호를 어떤 임계값으로 정의할까? ($1M? $5M? 변동적?)
2. Glassnode/CryptoQuant 유료 API 사용 가능?
3. Nobitex는 우선순위에서 빼고 CoinEx만 집중할까?
