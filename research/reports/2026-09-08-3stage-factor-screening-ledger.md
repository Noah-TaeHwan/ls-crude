# 2026-09-08 — 3단계 관측 데이터 적격성 전수 감사 장부 (3-Stage Factor Screening Ledger)

**감사 기준 출처**:
1. [연구 방향 메모 (research-direction-2026-09-08.md)](https://share.onorca.dev/a/tsV3nMqt0cqb)
2. [쿠싱 관측판 협업 워크플로우 (cushing-observation-workflow-2026-09-08.md)](https://share.onorca.dev/a/MYb5EhvTU0Qj)
3. [아이디어에서 인디케이터까지 (idea-to-indicator-workflow-2026-09-08.md)](https://share.onorca.dev/a/Hv6Ig7ucHg38)

---

## 🏛️ 3단계 통과 기준 (The 3-Stage Screening Protocol)

각 팩터는 반드시 아래 3개 관문을 순서대로 통과해야만 '관측 가능한 실물 인디케이터'로 인정된다:

```text
[1단계: 아이디어]
  어떤 장소·시설·구역의 어떤 물리적/행동적 변화를 알고 싶은지 명확한 가설을 기술했는가?
        ↓ 통과
[2단계: 데이터 탐색]
  해당 장소/현상의 시계열 데이터를 날짜별로 실제로 무료/공개적으로 취득 가능한지 확인했는가?
  (개인정보 침해, 무허가 스크래핑, 유료 API, 특정 건물 출입기록 등 부적격 데이터 배제)
        ↓ 통과
[3단계: 샘플 확보]
  실제 데이터의 원본 샘플과 함께 출처 URL, 관측시각(observed_at), 공개시각(published_at),
  수집시각(retrieved_at), 단위/범위를 실제로 확보 및 보존했는가?
        ↓
[최종 판정: 3단계 완결 (PASSED)]
```

---

## 📊 001~050 팩터 3단계 적격성 전수 감사 매트릭스

| # | 팩터 명칭 | 1. 아이디어 (가설) | 2. 데이터 탐색 (공개성) | 3. 샘플 확보 (시계열) | 최종 판정 | 상세 사유 및 상태 |
|---:|---|:---:|:---:|:---:|:---:|---|
| **001** | MENA / Pentagon Delivery | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 민간 배달앱(Talabat/UberEats) API 폐쇄 및 개인정보로 수집 불가 |
| **002** | Global Crypto Liquidity Stress | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 온체인 고래 식별 및 국가/지역 귀속 불가 |
| **003** | Trump Truth Social | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | CNN/Trump's Truth 공개 아카이브 JSON 실시간 수집 및 코드 구현 |
| **004** | Transport Electrification | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | IEA Global EV Data API 연간 시계열 확보 (저빈도) |
| **005** | Financial Demand ML | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | SEC 재무제표의 원유 물리 수요 고유성 미확인 (SKIP) |
| **006** | Wholesale Logistics | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | EIA 주간 통계 대비 후행, 가격 시차 맞춘 시계열 미확보 (SKIP) |
| **007** | MENA Elite Mobility | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 복수 이민 로펌의 비식별 집계 제휴 부재 (HOLD) |
| **008** | Hyperliquid Capital Flow | ✅ PASS | ✅ PASS | ❌ FAIL | ❌ **FAILED** | Info API 접근 가능하나 2024년 이전 역사 부재 및 중동 자금 특정 불가 |
| **009** | Iran FX Stress (Nobitex) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | SamadiPour Rial 아카이브 및 Nobitex 공개 Ticker 확보 |
| **010** | Official Petroleum Buffer | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | IEA 공개 석유 재고 시계열 확보 |
| **011** | Energy Workforce Momentum | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | US BLS CES1021100001 (NAICS 211) 공개 고용 시계열 확보 |
| **012** | Energy Futures Pairs StatArb | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 틱/초단위 연속선물 데이터 유료, 슬리피지·거래비용 장기 패널 부재 |
| **013** | Institutional Message Timing | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 공식 설교/담화의 체계적 블라인드 장기 라벨 미확보 |
| **014** | Pipeline Noise Signal | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | USGS 지진계로 원유 파이프라인 누출/가동 식별 불가 |
| **015** | Luxury ICE Road Appetite | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | FHWA TMAS 전국 차량 VMT 공개 통계 확보 (OOS 부호 반전) |
| **016** | Desert Operational Stress | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | NASA POWER 기상 외에 실제 사막 운영 차질 장기 집계 부재 |
| **017** | Maritime Supply Activity | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 개별 선박 AIS 수집 금지, 허용된 장기 집계 패널 미확인 |
| **018** | Refinery Thermal & Flare | ✅ PASS | ✅ PASS | ❌ FAIL | ❌ **FAILED** | NASA FIRMS 공개되나 개별 정유소별 장기 패널 미구축 |
| **019** | Robotaxi Night Traffic | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 특정 빌딩 로보택시 승하차는 개인정보 침해 (REJECTED) |
| **020** | Gulf AC Panic | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | NASA POWER Daily 걸프 도시권 일별 기온 확보 |
| **021** | Kimchi Heat Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | KAMIS 농산물 공개 API 및 `sources.csv` 수집 명세 보존 |
| **022** | Korea Gas Pain Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Opinet 전국 주유소 B027 휘발유 가격 시계열 확보 |
| **023** | Jeju Strait Watch | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 제주 해협 선박 AIS 보안/수집 경계 (REJECTED) |
| **024** | Chuseok Effect | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 인천공항/도로공사 공공데이터 `sources.csv` 확보 |
| **025** | Korean Refinery Margin Watch | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | KNOC 페트로넷 월간 정유 수급 통계 확보 |
| **026** | Retail FX Surge Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 은행/개인 고객 FX 환전 데이터 접근 불가 (REJECTED) |
| **027** | Incheon Transit Surge | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 인천공항공사 환승객 집계 통계 `sources.csv` 확보 |
| **028** | Pohang Refinery Idle Watch | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | S-Oil 포항 정유소 전제가 사실과 다름 (REJECTED) |
| **029** | Duty-Free Diesel Dash | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 면세점 데이터로 디젤/관광 연료 귀속 불가 (ARCHIVED) |
| **030** | Instant Noodle Panic Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 관세청 무역통계 라면 수출 실적 `sources.csv` 확보 |
| **031** | Live Commerce Burn Rate | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 라이브커머스 스트림 주문/물류 비공개 (ARCHIVED) |
| **032** | Korea Weather Disruption | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 기상청 황사/기상 공공데이터 확보 |
| **033** | Base-Area Barbershop | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 기지 주변 미용실 익명 결제 집계 부재 (ARCHIVED) |
| **034** | Base-Area Buzz-Cut | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 개인 외모/헤어스타일 데이터 수집 불가 (ARCHIVED) |
| **035** | Base-Area Fine-Dining | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 기지 주변 식당 예약/결제 집계 부재 (ARCHIVED) |
| **036** | Military Recruiting Context | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 모병 공식 보고서의 장기 공개시점 패널 미확보 (HOLD) |
| **037** | USFK Public Context | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 주한미군 공식 발표 사건 태그 (013 하위 / ARCHIVED) |
| **038** | Cushing Draw Surprise | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA `W_EPC0_SAX_YCUOK_MBBL` 주간 쿠싱 재고 시계열 확보 |
| **039** | US Gasoline Demand Surprise | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA `WGFUPUS2` 주간 휘발유 완제품 공급량 시계열 확보 |
| **040** | SPR Injection Watch | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA `WCSSTUS1` 주간 전략비축유 재고 시계열 확보 |
| **041** | Refinery Utilization Proxy | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA `WPULEUS3` 주간 미 정유소 가동률 시계열 확보 |
| **042** | Asia Financial Hub Pulse | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 홍콩·싱가포르·도쿄·서울 4도시 동질 패널 미구축 (HOLD) |
| **043** | Overtime Latte Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 에너지음료 소비의 무료 분리 장기 패널 부재 (HOLD) |
| **044** | AI Burn Rate Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | US Census C30 데이터센터 건설비 지출 시계열 확보 |
| **045** | Iced Americano Heat Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | SEC XBRL 스타벅스 분기 매출 시계열 확보 |
| **046** | Urban Mobility Tempo | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Chicago Open Data CTA 대중교통 일별 승차량 확보 |
| **047** | Premium Outdoor Spread | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | Canada Goose 대 Columbia 무료 공시 YoY가 IS 3개뿐 (HOLD) |
| **048** | All-In Tie Day Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 유튜브 공식 썸네일 블라인드 시계열 미구축 (MEME ONLY) |
| **049** | Geopolitical News Attention | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 위키미디어 호르무즈 해협 일별 조회수 3,712일 시계열 확보 |
| **050** | Anti-USA Tension Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 위키미디어 8대 엔티티(미 5함대/CENTCOM 등) 3,712일 시계열 확보 |

---

## 📈 감사 통계 요약 (Summary Statistics)

```text
전체 검토 팩터: 50개
  ├─ 🟢 3단계 전수 통과 (PASSED): 20개 (40.0%)
  │    └─ EIA 실물 수급 (038, 039, 040, 041)
  │    └─ 위키미디어 / 소셜 대안 데이터 (003, 009, 049, 050)
  │    └─ 거시 / 공공 통계 (004, 010, 011, 015, 020, 021, 022, 024, 025, 027, 030, 032, 044, 045, 046)
  │
  └─ ❌ 3단계 미통과 (FAILED / FILTERED OUT): 30개 (60.0%)
       └─ 데이터 비공개 / 개인정보 / 유료 API (001, 002, 007, 012, 019, 023, 026, 031, 033, 034, 035)
       └─ 고유성 부족 / 사후 설명 / 패널 미구축 (005, 006, 008, 013, 014, 016, 017, 018, 028, 029, 036, 037, 042, 043, 047, 048)
```

---

## 💡 쿠싱 관측판(Cushing Desk) 구축을 위한 통과 팩터 조합 가이드

3단계를 완벽하게 통과한 팩터들 중 **쿠싱 현지의 물리적 분주도와 직접 연결되는 핵심 6대 관측선**을 선정하여 대시보드에 배치한다:

1. **쿠싱 저장 탱크 순인출 속도**: [038 Cushing Draw](038-cushing-draw-surprise/README.md)
2. **미 정유사 가동률 (원유 흡입력)**: [041 Refinery Utilization](041-refinery-utilization-proxy/README.md)
3. **완제품 휘발유 수요 견인력**: [039 US Gasoline Demand](039-us-gasoline-demand-surprise/README.md)
4. **전략비축유 정부 이송 부하**: [040 SPR Injection Watch](040-spr-injection-watch/README.md)
5. **WTI 선물 실물 인도 결제량**: WTI Trading Volume Z-Score
6. **지정학적 해상 초크포인트 긴장도**: [049 News Attention](049-geopolitical-news-attention-shock/README.md) / [050 Anti-USA Index](050-anti-usa-tension-index/README.md)

---

**작성일**: 2026-09-08  
**보고서 위치**: `research/reports/2026-09-08-3stage-factor-screening-ledger.md`
