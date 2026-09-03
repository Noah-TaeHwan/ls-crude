# 📋 LS CRUDE Research — 전체 색인

> **상태 주의 — 2026-09-03**: 이 문서는 초기 설계 색인이다. 팩터 번호·판정·가중치의 정본은 [`factors/README.md`](factors/README.md)이며, 현재 001–019으로 정리되어 있다. 아래의 “즉시”, “구현됨”, 이전 번호 표기는 역사적 로드맵일 뿐 현재 검증 결론이 아니다.

**프로젝트**: LS CRUDE — 부엌이 바빠졌는가 (Is the kitchen busy?)  
**목표**: 원유(WTI) 가격 예측 머신러닝 + 대시보드  
**상태**: 설계 완료, 구현 준비 중  
**작성**: 2026-09-02

---

## 📁 폴더 구조

```
research/
├── factors/                          # 팩터 시스템 (핵심)
│   ├── README.md                     # 팩터 요약 & 로드맵
│   ├── 001-pentagon-ubereats.md      # 💡 아이디어 (SKIP)
│   ├── 002-whale-index.md            # 📋 고래 포지셔닝
│   ├── 003-truth-social.md           # ✅ 트럼프 발언 (구현됨)
│   ├── 004-renewable-displacement.md # 📋 재생에너지 대체
│   ├── 005-financial-demand.md       # 🔬 기업 재무 ML (R&D)
│   └── 006-wholesale-logistics.md    # 🟢 물류 활동 (즉시!)
│
├── VISUALIZATION.md                  # 💓 Oil Pulse UI/UX 설계
├── INDEX.md                          # 이 파일
├── README.md                         # 기존 프로젝트 README
│
├── src/ls_crude/                     # Python 코드
│   ├── __init__.py
│   ├── config.py
│   ├── build.py
│   │
│   ├── data/                         # 데이터 수집
│   │   ├── __init__.py
│   │   ├── fred.py                   # FRED (경제지표)
│   │   ├── news.py                   # Investing.com 뉴스
│   │   ├── splits.py                 # 시간 분할 (backtest)
│   │   ├── yahoo.py                  # 주가 (yfinance)
│   │   ├── whale_index.py            # (NEW) 고래 지수
│   │   ├── wholesale_logistics.py    # (NEW) 물류 지수
│   │   └── corporate_finance.py      # (NEW) 기업 재무
│   │
│   ├── features/                     # 신호 생성
│   │   ├── __init__.py
│   │   ├── panel.py                  # 기존
│   │   ├── rsi.py                    # 기존
│   │   ├── slice_index.py            # ✅ Oil Slice
│   │   ├── whale_signal.py           # (NEW) 고래 신호
│   │   ├── renewable_displacement.py # (NEW) 재생에너지
│   │   └── financial_demand.py       # (NEW) 기업 재무
│   │
│   ├── models/                       # 머신러닝
│   │   ├── __init__.py
│   │   ├── rsi_overlay.py            # 기존
│   │   ├── financial_xgboost.py      # (NEW) XGBoost
│   │   ├── financial_lstm.py         # (NEW) LSTM
│   │   └── financial_transformer.py  # (NEW) Transformer
│   │
│   └── backtest/                     # 검증
│       ├── __init__.py
│       ├── whale_validator.py        # (NEW) 고래 검증
│       ├── wholesale_validator.py    # (NEW) 물류 검증
│       └── financial_validator.py    # (NEW) 재무 검증
│
├── data/TTS scrapper/                # Truth Social 팩터 (✅ 구현)
│   ├── trump_truth_factor.py         # ✅ 메인
│   ├── factor_lab.py                 # 검증 프레임워크
│   ├── cot_factor.py
│   ├── gpr_factor.py
│   ├── natgas_factor.py
│   ├── combine_factors.py
│   └── README.md
│
├── data/pizza/                       # Oil Pizza 실험
│   └── README.md
│
├── notebooks/                        # Jupyter 노트북
│   └── pizza-hunt.md                 # 팩터 탐색 기록
│
└── tests/                            # 단위 테스트
    ├── test_news.py
    ├── test_panel.py
    ├── test_rsi.py
    ├── test_slice.py
    ├── test_splits.py
    └── fixtures/
```

---

## 🎯 최종 Oil Pizza 공식

### 6가지 신호원 결합

```python
oil_pizza_score = (
    2.0 * oil_slice +                    # ✅ 뉴스 (호르무즈+CPI)
    1.5 * whale_index +                  # 📋 크립토 (고래 포지셔닝)
    1.0 * truth_social_factor +          # ✅ 정치 (트럼프 발언)
    1.5 * wholesale_logistics +          # 🟢 경기 (물류 운송량)
    -1.5 * renewable_displacement +      # 📋 에너지 (재생 에너지 대체)
    -1.0 * financial_demand_ml           # 🔬 재무 (기업 실적 ML)
)

# 표준화 (20일 이동평균 기준)
oil_pizza_z = zscore(oil_pizza_score, window=20)

# 신호 해석
if oil_pizza_z > 1.5:     signal = "STRONG LONG" 🟢
elif oil_pizza_z > 0.5:   signal = "WEAK LONG" 🟢
elif oil_pizza_z > -0.5:  signal = "NEUTRAL" 🔵
elif oil_pizza_z > -1.5:  signal = "WEAK SHORT" 🟡
else:                     signal = "STRONG SHORT" 🔴
```

### 신호원별 상태

| # | 신호원 | 가중치 | 상태 | 신선도 | 선행성 |
|---|--------|--------|------|--------|--------|
| 1 | Oil Slice (뉴스) | 2.0 | ✅ 구현 | 1-3일 | ✅ |
| 2 | Whale Index (크립토) | 1.5 | 📋 평가 | 실시간 | ✅ |
| 3 | Truth Social (정치) | 1.0 | ✅ 구현 | 5분 | ✅ |
| 4 | **Wholesale-Logistics** (물류) | **1.5** | **🟢 즉시** | **월간** | **✅** |
| 5 | Renewable Displacement (에너지) | -1.5 | 📋 평가 | 월간 | ⚠️ |
| 6 | Financial Demand ML (재무) | -1.0 | 🔬 R&D | 분기 | ❓ |

---

## 📊 팩터 상세

### ✅ 이미 구현됨 (2개)

**→ `factors/README.md` → 003-Truth Social 참고**

```python
# Oil Slice: news_count(호르무즈) + news_count(CPI) → z-score
# Truth Social: trump_posts(oil 키워드) → z-score
```

### 🟢 즉시 추천 (1개) ← 지금 시작!

**→ `factors/006-wholesale-logistics.md` 참고**

```
Cass Freight Index (50%)
+ 물류주 주가 (40%)
+ 항만 TEU (10%)
= 도매-물류 활동 지수

기간: 1-2주
선행성: 5-20일 (Granger test 예상)
기대 신호 품질: 높음 (r > 0.3)
```

### 📋 평가 중 (3개)

**→ `factors/` 폴더의 002, 004, 005 참고**

| 팩터 | 기간 | 데이터 | 중요도 |
|------|------|--------|--------|
| 002-Whale Index | 2주 | CoinEx API | 중간 |
| 004-Renewable | 2주 | IEA + 뉴스 | 중간 |
| 005-Financial ML | 4주 | SEC + yfinance | 높음 |

### 💡 SKIP (1개)

**→ `factors/001-pentagon-ubereats.md` 참고**

데이터 접근 불가능 (UberEats API 없음)

---

## 🎨 시각화: Oil Pulse 💓

**→ `VISUALIZATION.md` 참고**

```
의료 심박동 모니터 형식의 실시간 유가 "맥박" 시각화

- 색상: 신호 방향 (초록=롱, 빨강=숏)
- 파형 위치: 신호 강도
- 박동 속도: 모멘텀
- 기술: React + Visx/D3.js + SVG 애니메이션

구현: 2주 (Phase 1-2 정적 UI)
```

---

## 🚀 구현 로드맵

### Phase 1️⃣: 빠른 승리 (1-2주) ← 지금 시작

```
[ ] Wholesale-Logistics 신호 생성 (006)
    - Cass Index 다운로드
    - 물류주 데이터 수집
    - 3가지 신호 결합
    
[ ] Oil Pulse UI 프로토타입
    - OilPulse.tsx 정적 컴포넌트
    - PulseWaveform SVG 애니메이션
    - 4가지 신호 상태 표시
```

**예상 결과**: 
- Wholesale-Logistics 신호 작동 확인
- Oil Pulse UI 프로토타입 완성

### Phase 2️⃣: 검증 (2-4주)

```
[ ] Granger Causality 테스트 (Wholesale)
    - 선행성 측정 (5-20일 lag)
    - 최적 lag 결정
    
[ ] Whale Index 데이터 수집 & 검증
    - CoinEx API 연동
    - 신호 생성 & 상관성 확인
    
[ ] Oil Pulse 인터랙션
    - 시간 범위 선택 (1D/1W/1M)
    - 속도/민감도 조절
```

**예상 결과**:
- 4개 팩터 검증 완료
- Oil Pulse 인터랙션 가능

### Phase 3️⃣: 고도화 (4-8주)

```
[ ] Financial Demand ML 구축 (4주)
    - 데이터 수집 & 전처리
    - XGBoost/LSTM 훈련
    - Walk-forward validation
    
[ ] Renewable Displacement 데이터
    - IEA 발전량 수집
    - 신호 결합
    
[ ] Oil Pulse 실시간 연동
    - Supabase API 연결
    - WebSocket 업데이트
```

**예상 결과**:
- 6개 팩터 모두 작동
- 실시간 Oil Pizza 신호
- 실시간 Oil Pulse UI

### Phase 4️⃣: 검증 & 배포 (8-12주)

```
[ ] Factor Lab 최종 검증
    - Permutation test (전체 팩터)
    - 5개 시간지평 (1/3/5/10/20일)
    - PASS/FAIL 판정
    
[ ] Walk-forward 백테스트
    - 2015-2023: in-sample
    - 2024+: out-sample
    
[ ] 알림 & 내보내기
    - 신호 변화 알림
    - PNG/SVG/CSV 내보내기
```

**예상 결과**:
- 완전한 MVP 배포
- 실시간 트레이딩 신호
- 시각화 대시보드

---

## 📚 핵심 파일 가이드

### 시작 포인트

| 파일 | 내용 | 다음 |
|------|------|------|
| **factors/README.md** | 팩터 시스템 전체 개요 | 개별 팩터 파일 |
| **factors/006-wholesale-logistics.md** | 🟢 지금 시작할 것 | Phase 1 코딩 |
| **VISUALIZATION.md** | Oil Pulse 설계 | UI 프로토타입 |

### 기존 코드

| 파일 | 기능 | 상태 |
|------|------|------|
| **src/ls_crude/features/slice_index.py** | Oil Slice 신호 | ✅ 구현 |
| **data/TTS scrapper/trump_truth_factor.py** | Truth Social 신호 | ✅ 구현 |
| **data/TTS scrapper/factor_lab.py** | 검증 프레임워크 | ✅ 구현 |

### 새로 만들 파일

| 경로 | 목적 | Phase |
|------|------|-------|
| **src/ls_crude/data/wholesale_logistics.py** | 물류 데이터 수집 | 1 |
| **src/ls_crude/features/renewable_displacement.py** | 재생에너지 신호 | 2 |
| **src/ls_crude/backtest/wholesale_validator.py** | 물류 검증 | 1 |
| **app/components/OilPulse/** | UI 컴포넌트 | 1 |

---

## 💾 주요 데이터 소스

| 데이터 | 출처 | 빈도 | 비용 | 코드 |
|--------|------|------|------|------|
| 유가 (WTI) | Yahoo Finance | 일간 | ✅ | yahoo.py |
| 뉴스 | Investing.com | 일간 | ✅ | news.py |
| Cass Index | cassinfo.com | 월간 | ✅ | (NEW) |
| 물류주 | Yahoo Finance | 일간 | ✅ | (NEW) |
| 항만 TEU | americanports.org | 월간 | ✅ | (NEW) |
| CNN Archive | ix.cnn.io | 5분 | ✅ | trump_truth_factor.py |
| CoinEx | api.coinex.com | 실시간 | ✅ | (NEW) |
| SEC EDGAR | sec.gov | 분기 | ✅ | (NEW) |
| Glassnode | glassnode.com | 실시간 | 💰 | (NEW) |

---

## ✅ 체크리스트

### 이번 주

- [ ] Wholesale-Logistics Phase 1 시작
  - [ ] Cass Index 다운로드
  - [ ] 물류주 yfinance 받기
  - [ ] 기본 신호 생성

- [ ] Oil Pulse 프로토타입 시작
  - [ ] OilPulse.tsx 틀 작성
  - [ ] PulseWaveform SVG 애니메이션

### 다음 주

- [ ] Wholesale-Logistics 검증 (Granger)
- [ ] Oil Pulse 인터랙션
- [ ] Whale Index 데이터 수집

### 다음달

- [ ] Financial Demand ML 시작
- [ ] Renewable Displacement 데이터
- [ ] Oil Pulse 실시간 연동

---

## 📖 학습 자료

### 기술

- **Granger Causality**: [Statsmodels 공식문서](https://www.statsmodels.org/stable/tsa.html)
- **LSTM/Transformer**: [TensorFlow Tutorials](https://www.tensorflow.org/tutorials)
- **Visx/D3.js**: [Visx 공식문서](https://visx-viz.github.io/)

### 도메인 (석유/에너지)

- **IEA**: https://www.iea.org/
- **EIA (US Energy)**: https://www.eia.gov/
- **OPEC**: https://www.opec.org/
- **Cass Freight Index**: https://www.cassinfo.com/

---

## 🤝 팀 정보

**프로젝트명**: LS CRUDE — 부엌이 바빠졌는가  
**목표**: WTI 원유 가격 예측 + 실시간 대시보드  
**기술**: Python (데이터) + React Router (프론트엔드) + Supabase (백엔드)  
**작성일**: 2026-09-02  
**상태**: ✅ 설계 완료, 🚀 구현 시작 준비

---

**다음 단계**: `factors/006-wholesale-logistics.md` 읽고 시작! 🟢
