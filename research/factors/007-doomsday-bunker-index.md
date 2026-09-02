# 007 — Doomsday Bunker & UHNWI Safe-Haven Flight Index (엘리트 이민 & 벙커 지수)

**상태**: 📋 **평가 및 R&D 설계 중**  
**평가**: 창의성 10/10 | 구현 가능성 8.5/10  
**가중치**: 1.5 (중장기 테일 리스크 및 억만장자 정보 우위 신호)

---

## 🎯 가설 (Core Thesis)

1. **상위 0.001% 엘리트의 정보 우위 (Information Asymmetry)**:
   - 초고액 자산가(UHNWI, 억만장자) 및 글로벌 엘리트는 최고급 정치/지정학 컨설팅 네트워크를 통해 글로벌 대형 악재(전면전, 핵 리스크, EMP, 글로벌 공급망 붕괴)를 일반 시장보다 **3개월~1년 이상 먼저 감지**.

2. **안전 자산 피난처(Safe-Haven Flight) 및 벙커 구축**:
   - 지정학적 미사일 타깃에서 벗어난 뉴질랜드, 하와이, 피지, 스위스 등으로의 이민/시민권 신청 급증 및 지하 벙커/자급자족 영지 매입 활동.

3. **유가 및 매크로 연동성 (Oil Price Correlation)**:
   - 단순 지역 분쟁이 아닌 **글로벌 전면전/대형 지정학 충격(Tail Risk)**의 최선행 지표.
   - **Henley & Partners 투자 이민 지수 급증 → 글로벌 대형 위기 조짐 → 중장기 유가(WTI/Brent) 급등(↑) 및 옵션 프리미엄 상승 선행 신호**.

---

## 📊 핵심 데이터 소스

### 1️⃣ Henley & Partners Investment Migration Index (최우선 소스) ✅
- **데이터**: Henley & Partners Private Wealth Migration Dashboard & Quarterly Reports
- **지표**:
  - 뉴질랜드, 미주/하와이, 피지 등 주요 안전 피난처 대상 **투자 이민(Golden Visa / Citizenship by Investment) 신청 건수 변동률**.
  - UHNWI(자산 $30M+) 계층의 2차 시민권/거주권 문의 수치 (High-net-worth Inflow Index).
- **장점**: 관료적 행정 지연이 심한 정부 토지 매입 승인(OIO)보다 **엘리트의 실시간 구매 의도 및 행동 심리를 훨씬 빠르고 정확하게 반영**.

### 2️⃣ 럭셔리 벙커 및 건축 트렌드 (보조 소스)
- **지표**: Rising S Company, Survival Condo 등 억만장자 벙커 시공 문의 트렌드 및 하와이/뉴질랜드 대규모 주거/지하 구조물 건축 허가(Permit) 공개 데이터 스크래핑.

---

## 💡 신호 생성 로직 (Signal Logic)

```python
# 1. Henley & Partners 투자 이민 지수 분기/월간 변동률
henley_safehaven_index = fetch_henley_migration_index(countries=['NZ', 'US-HI', 'FJ', 'CH'])
henley_z = zscore(henley_safehaven_index, window=4_quarters)

# 2. 벙커/자급자족 부동산 검색 및 허가 트렌드 지수
bunker_permit_trend = fetch_bunker_permit_scrapes()

# 3. 최종 Doomsday Flight Score (중장기 3~12개월 선행)
doomsday_flight_score = (0.7 * henley_z) + (0.3 * bunker_permit_trend)
```

---

## 🔬 선행성 검증 및 한계점

- **선행 타깃**: WTI / Brent 원유 선물 및 Call Option Implied Volatility (3개월~1년 선행)
- **한계 및 노이즈 관리**:
  - 단순 세금 절세(Tax Haven) 목적의 이동과 구별하기 위해 **단기 급증 비율(Spike Ratio)**을 추출하여 지정학적 위기 신호로 정문화.

---

## 🚀 구현 계획 (Phase 1)

- [ ] Henley & Partners Private Wealth Migration 리포트/대시보드 데이터 수집기 작성 (`research/src/ls_crude/data/henley_collector.py`)
- [ ] 과거 10년간 대형 지정학적 위기(2014, 2022, 2024~) 전후 이민 지수 변동성 백테스팅
- [ ] Oil Pizza 팩터 라인업에 `doomsday_bunker_index` 통합

---

**작성일**: 2026-09-02  
**제안**: LS CRUDE 팀 (Doomsday Bunker & UHNWI Safe-Haven Flight Factor)
