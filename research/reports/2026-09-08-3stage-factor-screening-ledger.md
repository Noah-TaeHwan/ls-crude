# 📋 3단계 팩터 선별 및 스크리닝 원장 (001–091 전수 조사)

> **기준 문서 (Orca 3대 워크플로우)**
> 1. [research-direction-2026-09-08.md](https://share.onorca.dev/a/tsV3nMqt0cqb)
> 2. [cushing-observation-workflow-2026-09-08.md](https://share.onorca.dev/a/MYb5EhvTU0Qj)
> 3. [idea-to-indicator-workflow-2026-09-08.md](https://share.onorca.dev/a/Hv6Ig7ucHg38)

---

## 🔍 3단계 심사 기준 (Screening Criteria)

| 단계 | 심사 항목 | 정의 및 통과 요건 |
| :---: | :--- | :--- |
| **1단계** | **아이디어 (Idea)** | 어떤 모텔·구역·시설·파이프라인의 **어떤 물리적/정량적 변화**를 포착하고자 하는지 명확히 정의되었는가? |
| **2단계** | **데이터 탐색 (Discovery)** | 해당 장소/현상의 밝기, 통행량, 가동률, 검색량 등을 **날짜별 시계열로 무료/공개 경로(Free API/Web)**에서 확보 가능한가? |
| **3단계** | **샘플 확보 (Sample Audit)** | 실제 데이터의 일부와 **출처(Source), 관측시각(Observed Time), 수집/공개시각(Collected/Published Time)**이 완결적으로 보존되어 있는가? |

> **판정 규칙**: 1~3단계를 **모두 통과(PASS)**한 팩터만 실증 분석 및 쿠싱 결합 모델(CBI/Desk)의 후보군으로 승격하며, 하나라도 미달(FAIL) 시 **탈락(FAILED)**으로 분류한다.

---

## 📊 001–091 팩터 전수 심사 결과표

| 번호 | 팩터 명칭 (Factor Name) | 1. 아이디어 | 2. 데이터 탐색 | 3. 샘플 확보 | 최종 판정 | 상세 사유 및 비고 |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **001** | MENA Civilian Delivery | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 국방부/민간 배달 주문 익명 집계 데이터 없음 (WITHDRAWN) |
| **002** | Global Crypto Liquidity Stress | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 국가/고래 귀속 불가, 적법한 무료 장기 온체인 집계 시계열 부재 |
| **003** | Trump Temper & Oil Policy | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Truth Social/트윗 공개 텍스트 수집 및 타임스탬프 확보 (단, IS 부재) |
| **004** | Transport Electrification | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | IEA/EIA 전기차 보급 공개 연간 데이터 확보 |
| **005** | Financial Demand | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 물리 수요 경로 부재, EIA 주간 대비 고유성 없음 (SKIP) |
| **006** | Wholesale Logistics | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | EIA 물류 자료 대비 지연 및 고유 알파 없음 (SKIP) |
| **007** | MENA Elite Mobility | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 사설 항공 추적/지하 벙커 개인정보 이슈, 비식별 장기 집계 부재 |
| **008** | Hyperliquid Capital Flow | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 거래소 귀속 불가 및 역사 부족 (MONITOR ONLY) |
| **009** | Iran FX Stress | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Bonbast 이란 리알화 암시장 환율 일별 시계열 및 타임스탬프 확보 |
| **010** | Petroleum Buffer | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA 상업재고/SPR 공식 주간 시계열 확보 |
| **011** | Energy Workforce Momentum | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | BLS 석유/가스 추출 고용 통계 월간 시계열 확보 |
| **012** | Energy Futures Pairs StatArb | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 틱/주문부 허가 데이터 미확보 및 체결 비용 미반영 (별도 전략) |
| **013** | Institutional Message Timing | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 설교/공개 담화의 조기 선행 알파 미확인 (뉴스 후행) |
| **014** | Pipeline Noise | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 공개 기상/지진 관측소로 파이프라인 물리 상태 식별 불가 |
| **015** | Luxury ICE Road Appetite | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | FHWA 월간 차량 주행거리(VMT) 공공 통계 확보 |
| **016** | Desert Operational Stress | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 기상 예보 대비 사막 현장 운영 차질 독립 시계열 부재 |
| **017** | Maritime Supply Activity | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 개별 선박 AIS 추적 금지 및 무료 집계형 장기 데이터 부재 |
| **018** | Refinery Thermal & Flare | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | VIIRS 열화상 이상 관측 가능하나 정유소 단위 가동률 패널 미구축 (HOLD) |
| **019** | Robotaxi Night Traffic | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 로보택시 야간 운행 데이터 비공개 및 개인정보 경계 (REJECTED) |
| **020** | Gulf AC Panic | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 중동 전력/기온 공개 일별 시계열 확보 |
| **021** | Kimchi Heat Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | KAMIS 배추/무/고춧가루 공공 가격 시계열 확보 |
| **022** | Korea Gas Pain Index / CFSP | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 오피넷(Opinet) 전국 주유소 일평균 가격 및 소비자 체감 시계열 확보 |
| **023** | Jeju Strait Watch | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 선박 AIS 사설 데이터 경계 및 017 중복 (REJECTED) |
| **024** | Chuseok Effect | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 음력 명절 캘린더 및 한국도로공사 명절 통행량 공개 데이터 확보 |
| **025** | Korean Refinery Margin Watch | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 페트로넷(Petronet) 및 관세청 정유제품 수출입 마진 시계열 확보 |
| **026** | Retail FX Surge Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 은행/환전소 개인 리테일 FX 흐름 비공개 (REJECTED) |
| **027** | Incheon Transit Surge | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 인천공항공사 월간 국제선 여객/화물 공공 데이터 확보 |
| **028** | Pohang Refinery Idle Watch | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 포항 정유소 부존재 (가설 오류, REJECTED) |
| **029** | Duty-Free Diesel Dash | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 027 하위 가설, 면세점 디젤 물류 귀속 불가 (ARCHIVED) |
| **030** | Instant Noodle Panic Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 관세청 라면(HS 1902.30) 월간 수출액/수량 공공 통계 확보 |
| **031** | Live Commerce Burn Rate | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 027 하위 가설, 쇼핑몰 스트림/주문 데이터 부적격 (ARCHIVED) |
| **032** | Korea Weather Disruption | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 기상청 황사/강풍/제주기상 일별 공공 관측 데이터 확보 |
| **033** | Base-Area Barbershop | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 미군기지 주변 바버샵 익명 장기 매출 패널 없음 (ARCHIVED) |
| **034** | Base-Area Buzz-Cut | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 개인 외모/이발 데이터 수집 불가 (ARCHIVED) |
| **035** | Base-Area Fine-Dining | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 기지 주변 식당 익명 장기 매출 데이터 부재 (ARCHIVED) |
| **036** | Public Military Recruiting | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 미군 모병 통계의 저빈도 및 지연 공표 (HOLD) |
| **037** | USFK Public Context | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 공식 보도자료 텍스트 후행성 (ARCHIVED) |
| **038** | Cushing Draw Surprise | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA 주간 쿠싱 원유 재고(WCESTUS1) 공식 시계열 완결 확보 |
| **039** | US Gasoline Demand Surprise | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA 주간 완제품 공급량(WGFUPUS2) 공식 시계열 확보 |
| **040** | SPR Injection Watch | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA 주간 SPR 재고(WCSSTUS1) 공식 시계열 확보 |
| **041** | Refinery Utilization Proxy | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA 주간 정유소 가동률(WPULEUS3) 공식 시계열 확보 |
| **042** | Asia Financial Hub Pulse | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 4개 도시(서울/도쿄/싱가포르/홍콩) 동질 장기 패널 미구축 (REJECTED) |
| **043** | Overtime Latte Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 에너지음료/야근 커피 소비 분리 장기 패널 부재 (HOLD) |
| **044** | AI Burn Rate Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | US Census 데이터센터 민간 건설 지출 월간 시계열 확보 |
| **045** | Iced Americano Heat Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 한국은행/소비자동향 커피소비 및 스타벅스 실적 프록시 확보 |
| **046** | Urban Mobility Tempo | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Chicago Open Data CTA 대중교통 일별 승차량 확보 |
| **047** | Premium Outdoor Spread | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | Canada Goose 대 Columbia 무료 공시 YoY가 IS 3개뿐 (HOLD) |
| **048** | All-In Tie Day Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 유튜브 공식 썸네일 블라인드 시계열 미구축 (MEME ONLY) |
| **049** | Geopolitical News Attention | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 위키미디어 호르무즈 해협 일별 조회수 3,712일 시계열 확보 |
| **050** | Anti-USA Tension Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 위키미디어 8대 안보 엔티티 3,712일 시계열 확보 |
| **051** | Public Confirmation Lag | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | FIRMS 과거 아카이브에 당시 공개시각(RT vintage) 부재로 as-of 검정 불가 |
| **052** | Search Desperation Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Wikimedia REST API 생활비 검색어 일별/월별 시계열 및 WTI RV20 표본 보존 |
| **053** | VoC Fuel Frustration | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 개인 음성 통화는 사생활 보호 대상이며 비식별 주간 집계 무료 API 부재 |
| **054** | UAP Attention Shock | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Wikipedia UAP 바스켓 일별/월별 시계열 및 62개 자산 스캔 표본 보존 |
| **055** | Filing Delta Drift | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | SEC 10-K/10-Q MD&A 텍스트의 walk-forward 정렬 패널 미구축 |
| **056** | Heavy Industrial Maritime Infra | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 원안 4대 지표(RMCI, DTDI, FEVI, HIC)의 무료 직접 API 미확보 |
| **057** | US HIMI Public Proxy | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | FRED 기계/정유 산업생산(IP) 2015-2026 월간 시계열 및 IS/OOS 표본 보존 |
| **058** | Headline Boredom Index (HBI) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | The Guardian Content API 일별 뉴스 헤드라인 UTC 시계열 및 표본 보존 |
| **059** | HIMI-IIVF (ISM Inventory) | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | Census 6주 지연에 대한 실제 공표일 빈티지 패널 미구축 |
| **060** | CODC (Credit-Oil Cointegration)| ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | FRED HY OAS 공식 CSV 수집 실패 및 공적분 검정 패널 미완결 |
| **061** | Refinery-Credit Stress Gate | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 060 미구축으로 인한 결합 게이트 패널 미확보 |
| **062** | Industrial Credit-Inventory | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 059, 060 미실측으로 인한 결합 레짐 패널 미확보 |
| **063** | Conspiracy Attention Index | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | Wikipedia 음모론 바스켓 일별 시계열 및 암호화폐/금 실증 표본 보존 |
| **064** | Oilman Steakhouse Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | Yelp/OpenTable은 과거 시계열 API가 없으며 현황 발췌만 제공 |
| **065** | War-Room Coffee Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 도시권 익명 시간대별 카페 결제 공개 API 부재 |
| **066** | Crew-Change Rush Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | BTS 일반 항공 여객은 시추선 교대근무자를 분리하지 못함 |
| **067** | Oilman Haircut Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 개인 사생활/개별 바버샵 이용량 데이터 미공개 |
| **068** | Energy Corridor Midnight Lights | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | VIIRS 야간광은 있으나 특정 사무실 야근 식별 및 2024+ OOS 불가 |
| **069** | Ulsan Late Delivery Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 배달앱 사설 데이터 비공개, 공공상권정보는 심야 배달 미제공 |
| **070** | Highway Ramyeon Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 휴게소 화물차 실시간 진입량 및 라면 판매수량 무료 장기 시계열 부재 |
| **071** | Jeju Full-Tank Return Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 공공 렌터카 표준데이터는 단순 보유대수 목록이며 주유/반납 데이터 아님 |
| **072** | Yeosu Turnaround Lunchbox | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 정기보수 기간 도시락/숙박 일별 공개 시계열 부재 |
| **073** | Incheon Dawn Restock Index | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 인천공항공사 통계는 총 화물량이며 면세점 리스톡 미식별 |
| **074** | Refinery Multi-Block Composite | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | EIA, CFTC, Yahoo Finance 일별/주간 복합 시계열 및 MPC 표본 보존 |
| **075** | Academic Liquidity Calendar | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 공개 학사/금융 달력 일별 시계열 및 WTI/RBOB/HO 전수 백테스트 표본 보존 |
| **076** | Hidden Hydrocarbon Exposure | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | SEC 10-K 기업 바스켓 및 Yahoo Finance 일별 시계열 표본 보존 |
| **077** | Korea Pump Pass-Through | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 오피넷 실시간은 있으나 장기 개별 주유소 공표시점 패널 미구축 |
| **078** | Korea Freight & Port Fuel | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 고속도로 차종 정의 및 2015-2026 연속 공개일 패널 미확보 |
| **079** | Korea Naphtha Export | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 관세청 HS 코드 바스켓 및 공표 빈티지 시점 미고정 |
| **080** | Korea Fuel-Switch Dispatch | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | KPX 연료별 발전량의 연속 장기 공개일 패널 미감사 |
| **081** | Korea LPG Substitution Pulse | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | LPG vs 휘발유/경유 상대가격 대비 실제 일별 연료전환 장기 패널 부재 |
| **082** | Korea Kitchen Oil Stress | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | KAMIS/소비자원 식용유 장기 소매가격 공표일 패널 미확보 |
| **083** | Iced Americano Pass-Through | ✅ PASS | ❌ FAIL | ❌ FAIL | ❌ **FAILED** | 외식 CPI 최초 공표일 패널 부재로 자산 사양 미검정 |
| **084** | Trailhead Tailgate Index (TTI) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | National Park Service (NPS) 월간 방문객 시계열 및 RBOB 표본 보존 |
| **085** | Watermelon Reefer Squeeze (WRSI)| ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | USDA Specialty Crops 분기 물량 시계열 및 HO=F 표본 보존 |
| **086** | Harvest Combine Diesel Pulse | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | USDA NASS 주간 수확 진도 시계열 및 HO 변동성 표본 보존 |
| **087** | Chicken Wing Cold-Chain (CWCI) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | USDA AMS 주간 가금류 도계/냉동재고 시계열 및 HO 표본 보존 |
| **088** | Borderline Diesel Index (BDI) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | BTS TransBorder 월간 국경 트럭 통과량 시계열 및 HO 표본 보존 |
| **089** | Friday Escape Velocity (FEV) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | BTS T-100 월간 국내선 항공 승객 시계열 및 HO/RBOB 표본 보존 |
| **090** | Great Lakes Ice Constraint (GLICI)| ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | NOAA Great Lakes 일별 결빙 면적 시계열 및 HO 변동성 표본 보존 |
| **091** | Cushing Motel Lights (CMLI) | ✅ PASS | ✅ PASS | ✅ PASS | 🟢 **PASSED** | 쿠싱 숙박세 14개월 및 CFAM 공개 위성 야간광 96개월 시계열 표본 보존 |

---

## 📈 감사 통계 요약 (Summary Statistics)

`	ext
전체 검토 팩터: 91개 (001–091 전수 조사)
  ├─ 🟢 3단계 전수 통과 (PASSED): 36개 (39.6%)
  │    ├─ 001–050 구간 통과 (20개): 003, 004, 009, 010, 011, 015, 020, 021, 022, 024, 025, 027, 030, 032, 038, 039, 040, 041, 044, 045, 046, 049, 050
  │    └─ 051–091 구간 통과 (16개): 052, 054, 057, 058, 063, 074, 075, 076, 084, 085, 086, 087, 088, 089, 090, 091
  │
  └─ ❌ 3단계 미통과 (FAILED / FILTERED OUT): 55개 (60.4%)
       ├─ 데이터 비공개 / 개인정보 / 사설 유료 API (001, 002, 007, 012, 019, 023, 026, 031, 033, 034, 035, 053, 064, 065, 067, 069)
       └─ 시점 안전 패널 부재 / 고유성 부족 / 사후 설명 (005, 006, 008, 013, 014, 016, 017, 018, 028, 029, 036, 037, 042, 043, 047, 048, 051, 055, 056, 059, 060, 061, 062, 066, 068, 070, 071, 072, 073, 077, 078, 079, 080, 081, 082, 083)
`

---

## 💡 쿠싱 관측판(Cushing Desk) 구축을 위한 통과 팩터 조합 가이드

3단계를 완벽하게 통과한 팩터들 중 **쿠싱 현지의 물리적 분주도와 직접 연결되는 핵심 6대 관측선**을 선정하여 대시보드에 배치한다:

1. **쿠싱 저장 탱크 순인출 속도**: [038 Cushing Draw](038-cushing-draw-surprise/README.md)
2. **미 정유사 가동률 (원유 흡입력)**: [041 Refinery Utilization](041-refinery-utilization-proxy/README.md)
3. **완제품 휘발유 수요 견인력**: [039 US Gasoline Demand](039-us-gasoline-demand-surprise/README.md)
4. **전략비축유 정부 이송 부하**: [040 SPR Injection Watch](040-spr-injection-watch/README.md)
5. **쿠싱 위성 야간광 및 숙박세**: [091 Cushing Motel Lights Index](091-cushing-motel-lights-index/README.md)
6. **지정학적 안보/초크포인트 긴장도**: [049 News Attention](049-geopolitical-news-attention-shock/README.md) / [050 Anti-USA Index](050-anti-usa-tension-index/README.md)

---

**작성일**: 2026-09-08  
**보고서 위치**: 
esearch/reports/2026-09-08-3stage-factor-screening-ledger.md
