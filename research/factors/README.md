# 🛢️ LS CRUDE 팩터 시스템 (Factor System)

**최종 목표**: Ultimate Oil Pizza (검증 통과한 6가지 신호원 결합)
**상태**: 설계 완료 (2026-09-02)  
**위치**: `research/factors/`

---

## 📋 팩터 목록

### ✅ 기존 구현 (2개)

#### 1️⃣ Oil Slice (호르무즈+CPI)
- **파일**: `research/src/ls_crude/features/slice_index.py`
- **신호**: ↑ 양의 신호 (가격 ↑)
- **데이터**: Investing.com CSV (뉴스 헤드라인)
- **가중치**: 2.0
- **상태**: ✅ 구현됨

#### 2️⃣ Truth Social Factor (트럼프)
- **파일**: `research/data/TTS scrapper/trump_truth_factor.py`
- **신호**: ↑ 양의 신호
- **데이터**: CNN JSON 아카이브 (실시간 5분 업데이트)
- **가중치**: 1.0
- **상태**: ✅ 구현됨
- **주의**: 아카이브 깊이 확인 필요 (2018+만 가능할 수 있음)

---

### 🟢 즉시 추천 (1개)

#### 6️⃣ Wholesale-Logistics Activity Index
- **파일**: `006-wholesale-logistics.md`
- **신호**: ↑ 양의 신호 (경기 → 유가 ↑)
- **데이터**: Cass Freight Index + 물류주 (UPS, FedEx, XPO)
- **가중치**: 1.5
- **구현 기간**: 1주
- **선행성**: 5-20일
- **상태**: 📋 즉시 구현 준비됨
- **이유**: 높은 신호 품질, 공개 데이터, 즉시 가능

---

### 📋 평가 중 (6개)

#### 2️⃣ Whale Network Index (고래 포지셔닝)
- **파일**: `002-whale-index.md`
- **신호**: ↑ 양의 신호
- **데이터**: CoinEx + Glassnode + CryptoQuant
- **가중치**: 1.5
- **구현 기간**: 2주
- **선행성**: 거의 실시간
- **상태**: 📋 평가 중
- **주의**: Nobitex 데이터 수집 어려움 (OFAC)

#### 4️⃣ Renewable Displacement Index (재생에너지 대체)
- **파일**: `004-renewable-displacement.md`
- **신호**: ↓ 음의 신호 (재생에너지 ↑ → 유가 ↓)
- **데이터**: IEA 발전량 + Investing.com 뉴스 + RenewableNow
- **가중치**: -1.5
- **구현 기간**: 2주
- **선행성**: 월간 (lag 3-6개월)
- **상태**: 📋 평가 중
- **특징**: Oil Pizza 균형잡기 (반대 신호)

#### 5️⃣ Financial Demand Index (기업 재무 ML)
- **파일**: `005-financial-demand.md`
- **신호**: ↓ 음의 신호 (대체에너지 실적 ↑ → 유가 ↓)
- **데이터**: SEC EDGAR + yfinance (재무제표)
- **가중치**: -1.0
- **구현 기간**: 4주 (R&D)
- **선행성**: 분기별 (lag 45일)
- **상태**: 🔬 R&D 계획 완료
- **모델**: XGBoost + LSTM
- **검증**: Monte Carlo + Bootstrap + Granger

#### 7️⃣ Doomsday Bunker & UHNWI Safe-Haven Flight Index (엘리트 이민 & 벙커 지수)
- **파일**: `007-doomsday-bunker-index.md`
- **신호**: ↑ 양의 신호 (Henley & Partners 이민 지수 급증 → 글로벌 대형 위기 선행 → 유가 ↑)
- **데이터**: Henley & Partners Private Wealth Migration Index + 건축 허가 데이터
- **가중치**: 1.5
- **구현 기간**: 2주
- **선행성**: 3개월~1년 (중장기 테일 리스크)
- **상태**: 📋 R&D 및 평가 중

#### 8️⃣ Hyperliquid Capital Flow Index (중동 자금 이탈 & 지정학)
- **파일**: `008-hyperliquid-capital-flow.md`
- **신호**: ↑ 양의 신호 (Hyperliquid USDC 입금 급증 → 중동 지정학 위기 선행 → 유가 ↑)
- **데이터**: Hyperliquid Info API + Arbitrum Bridge Deposit Events
- **가중치**: 2.0
- **구현 기간**: 1-2주
- **선행성**: 1-5일 (지정학 뉴스 선행)
- **상태**: 📋 R&D 및 평가 중

#### 9️⃣ Iran & Middle East Crypto Premium Index (이란/중동 현지 프리미엄)
- **파일**: `009-iran-middleeast-premium.md`
- **신호**: ↑ 양의 신호 (Nobitex 이란 테더 프리미엄 급증 → 중동 지정학 위기 반영 → 유가 ↑)
- **데이터**: Nobitex Ticker API + 암시장/공식 환율 데이터
- **가중치**: 1.5
- **구현 기간**: 1-2주
- **선행성**: 1-3일 (실시간 현지 위험 반영)
- **상태**: 📋 R&D 및 평가 중

---

### 💡 아이디어만 (1개)

#### 1️⃣ Pentagon Uber Eats Index
- **파일**: `001-pentagon-ubereats.md`
- **신호**: ↑ (미군 활동 ↑ → 연료 소비 ↑)
- **상태**: 💡 아이디어 (데이터 접근 불가)
- **결론**: 실현 불가능 (공개 API 없음)

---

### ⏸️ 보류 후보 (2개)

#### 🔟 Official Petroleum Buffer Disclosure Index
- **파일**: `010-official-petroleum-buffer.md`
- **신호**: ↕ WTI 방향성 미정; 공급충격 취약성·향후 변동성 후보
- **데이터**: IEA 회원국 공개 석유 재고·공식 방출 발표
- **가중치**: 0.0 (검증 전에는 Oil Pizza에 미포함)
- **상태**: ⏸️ HOLD
- **주의**: 중앙은행 준비자산이 아니라 정부·전략비축 자료. 방출 발표는 예측 신호가 아닌 정책 대응 더미.

#### 1️⃣1️⃣ Energy Workforce Momentum Index
- **파일**: `011-energy-workforce-momentum.md`
- **신호**: ↕ WTI 방향성 미정; 공급 램프업·공급 제약의 중기 레짐 후보
- **데이터**: 공개·허가된 업종별 고용, 장비대여 공시, 공식 허가 통계
- **가중치**: 0.0 (검증 전에는 Oil Pizza에 미포함)
- **상태**: ⏸️ HOLD
- **주의**: LinkedIn/구인사이트 스크래핑과 기업 내부 이동 데이터는 사용하지 않음.

## 🎯 Ultimate Oil Pizza Formula

```python
oil_pizza = (
    2.0 * oil_slice +                    # ✅ 뉴스
    1.5 * whale_index +                  # 📋 크립토
    1.0 * truth_social_factor +          # ✅ 정치
    1.5 * wholesale_logistics +          # 🟢 경기 (즉시!)
    1.5 * doomsday_bunker_index +        # 📋 엘리트 이민/테일리스크 (R&D)
    2.0 * hyperliquid_capital_flow +     # 📋 지정학/PerpDEX (R&D)
    1.5 * iran_crypto_premium +          # 📋 중동 현지 프리미엄 (R&D)
    -1.5 * renewable_displacement +      # 📋 에너지
    -1.0 * financial_demand_ml           # 🔬 재무 (R&D)
)

pizza_z = zscore(oil_pizza, 20)  # 20일 이동 평균 기준 표준화
```

---

## 📊 팩터 비교표

| # | 팩터 | 신호 | 데이터 | 신선도 | 선행성 | 구현 | 가중치 |
|---|------|------|--------|--------|--------|------|--------|
| 1 | Oil Slice | ↑ | 뉴스 | 1-3일 | ✅ | ✅ | 2.0 |
| 2 | Whale Index | ↑ | 크립토 | 실시간 | ✅ | 📋 | 1.5 |
| 3 | Truth Social | ↑ | 정치 | 5분 | ✅ | ✅ | 1.0 |
| 4 | Wholesale-Logistics | ↑ | 경기 | 월간 | ✅ | 🟢 | 1.5 |
| 5 | Doomsday Bunker | ↑ | Henley & Partners 이민 지수 | 월간/분기 | ✅ | 📋 | 1.5 |
| 6 | Hyperliquid Flow | ↑ | PerpDEX/온체인 | 실시간 | ✅ | 📋 | 2.0 |
| 7 | Iran Premium | ↑ | 이란 거래소(Nobitex) | 실시간 | ✅ | 📋 | 1.5 |
| 8 | Renewable | ↓ | 에너지 | 월간 | ⚠️ | 📋 | -1.5 |
| 9 | Financial ML | ↓ | 재무 | 분기 | ❓ | 🔬 | -1.0 |
| 10 | Official Petroleum Buffer | ↕ | IEA 공개 석유 재고 | 월간 | ❓ | ⏸️ HOLD | 0.0 |
| 11 | Energy Workforce Momentum | ↕ | 업종별 고용·허가 | 월간/분기 | ❓ | ⏸️ HOLD | 0.0 |

---

## 🚀 구현 순서 (Phase별)

### Phase 1️⃣ (1-2주) - 빠른 승리

- [x] 001-Pentagon (결론: SKIP)
- [x] 002-Whale (평가: 데이터 검증 필요)
- [x] 003-Truth Social (상태: ✅ 이미 구현)
- [x] 004-Renewable (평가: 데이터 계획)
- [x] 005-Financial (평가: R&D 계획)
- [ ] **006-Wholesale-Logistics** (지금 시작! 🟢)
- [ ] **007-Doomsday-Bunker** (Henley & Partners 이민 지수 파이프라인)
- [ ] **008-Hyperliquid-Flow** (R&D 및 파이프라인 설계)
- [ ] **009-Iran-Premium** (Nobitex Ticker 데이터 수집 및 프리미엄 테스트)
- [x] 010-Official Petroleum Buffer (HOLD: 재고 발표일·개정 이력 확인 필요)
- [x] 011-Energy Workforce Momentum (HOLD: 공개 시계열·라이선스 확인 필요)

### Phase 2️⃣ (2-4주) - 신호 검증

- [ ] Wholesale-Logistics Granger 테스트 (선행성 5-20일)
- [ ] Whale Index 데이터 수집 & 상관성 (r > 0.3?)
- [ ] Oil Pulse UI 프로토타입 (React)

### Phase 3️⃣ (4-8주) - 고도화

- [ ] Financial Demand ML (XGBoost/LSTM)
- [ ] Renewable Displacement (IEA 데이터)
- [ ] Oil Pulse 실시간 데이터 연동

### Phase 4️⃣ (8-12주) - 최종 검증

- [ ] Factor Lab 전체 테스트 (6가지 팩터)
- [ ] Walk-forward validation (2015-2023)
- [ ] Out-sample (2024+) 검증

---

## 📁 파일 구조

```
research/
├── factors/                                    # 팩터 시스템
│   ├── README.md                              # 이 파일
│   ├── 001-pentagon-ubereats.md               # 💡 아이디어
│   ├── 002-whale-index.md                     # 📋 평가
│   ├── 003-truth-social.md                    # ✅ 구현
│   ├── 004-renewable-displacement.md          # 📋 평가
│   ├── 005-financial-demand.md                # 🔬 R&D
│   ├── 006-wholesale-logistics.md             # 🟢 즉시
│   ├── 007-doomsday-bunker-index.md           # 📋 엘리트 이민/벙커
│   ├── 008-hyperliquid-capital-flow.md        # 📋 지정학/PerpDEX
│   ├── 009-iran-middleeast-premium.md         # 📋 이란/중동 프리미엄
│   ├── 010-official-petroleum-buffer.md       # ⏸️ 비축 완충여력
│   └── 011-energy-workforce-momentum.md       # ⏸️ 노동 모멘텀
│
├── src/ls_crude/
│   ├── features/
│   │   ├── slice_index.py                     # ✅ Oil Slice
│   │   └── ... (새 팩터들 추가)
│   └── models/
│       ├── rsi_overlay.py
│       └── ... (ML 모델들)
│
└── data/TTS scrapper/
    ├── trump_truth_factor.py                  # ✅ Truth Social
    └── factor_lab.py                          # 검증 프레임워크
```

---

## 🔗 관련 파일

- **UI 설계**: `research/VISUALIZATION.md` (Oil Pulse)
- **전체 색인**: `research/INDEX.md`
- **기존 Oil Slice**: `research/src/ls_crude/features/slice_index.py`
- **Truth Social**: `research/data/TTS scrapper/trump_truth_factor.py`
- **검증 프레임워크**: `research/data/TTS scrapper/factor_lab.py`

---

## ✅ 다음 단계

### 이번 주
1. **Wholesale-Logistics 데이터 수집** (Cass Index + 물류주)
2. **Oil Slice와의 상관성 확인**
3. **Granger Causality 테스트** (선행성)
4. **Oil Pulse UI 프로토타입** (정적 데이터)

### 다음 주
5. Whale Index 데이터 검증
6. Financial Demand R&D 시작
7. Oil Pulse 인터랙션 구현

---

**작성**: 2026-09-02  
**상태**: 설계 완료, 구현 준비 중  
**담당**: LS CRUDE 팀
