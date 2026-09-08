# 🛢️ LS CRUDE — Oil & Energy Chain Factor Research Map

**주 대상 가격**: Yahoo Finance WTI 연속선물 `CL=F`. WTI 매트릭스와 별도로, 전달경로가 직접적인 정제품·가스 선물만 [에너지 체인 검정표](../reports/2026-09-04-energy-chain-target-matrix.md)에 분리 기록한다.
**현재 상태**: 아래 001–091은 연구 인벤토리다. 검증을 마친 실거래 알파 목록이 아니다.
**선정 규칙**: 후보 선택·가중치 조정은 `2015-01-01`~`2023-12-31` 인샘플에서만 한다. 기준을 동결한 뒤에만 2024년 이후 아웃샘플을 한 번 연다.

## Current research status (2026-09-07)

**Still hunting.** 원장 ALT-01…29(activity-proxy·pizza-class·#56)에 joint-hunt PortWatch=ALT-04 실증과 ALT-30…38을 합쳤다. 팩터 보드 통과 수는 여전히 **0**.

| 축 | 상태 |
| --- | --- |
| Top live threads | `ALT-02` Household Panic Wiki (WATCH, weight 0); `ALT-01` Oil Slice 공개 초안; `ALT-03` PortWatch Hormuz **데이터 경로 확보**이나 WTI RV5 IS≈+0.09 / OOS≈0 → PARK |
| Died this run | 시설 배달 AOI·원시 AIS(`06`/`07`); HY OAS–WTI 잔차 OOS 부호 반전(`04` KILL) |
| Human blockers | 손성찬: USDA 키(`08`), Baker Hughes Excel(`05`), IMF 재배포; 오태환: tanker/event 창, 야간광 폴리곤 |
| Evidence pack | [joint hunt status](../reports/2026-09-07-joint-hunt-status.md) · [academic memo](../gathering/notes/2026-09-07-academic-pizza-index-oil-memo.md) · [PortWatch/HY JSON](../reports/2026-09-07-joint-hunt-portwatch-hyoas.json) |

신규 ALT 원장과 아래 기존 팩터 장부는 별도다. 팩터 추가 시 아래 스코어보드와 카드 표에 같은 ID를 함께 등록하고 앱의 장부 검사를 통과시킨다.

## 정리 원칙 — 2026-09-03

- 동일한 관측값·가설·출력을 공유하면 한 팩터다. 같은 신호를 두 번 가중하지 않는다.
- 이전 012A는 010에, 이전 013·014는 시장중립 페어 전략 하나에, 이전 015·016은 공개 담화 후보 하나에, 이전 019·020은 사막 운영 스트레스 하나에 병합했다.
- 이전 번호의 원안·코드 설명은 [`archive/`](archive/)에 보존한다. 삭제나 성과 은폐가 아니다.
- `0.1%`는 **독립적·재현 가능한 관계**를 뜻한다. 흥미로운 원시 차이·합성 데모·UI 서사는 통과가 아니다.

상세 수집 규칙은 [`research/INTAKE.md`](../INTAKE.md), 출처·지연·라이선스는 [`sources/REGISTRY.md`](../gathering/sources/REGISTRY.md)에 기록한다.

2026-09-03 제공 `CL=F` 파일을 기준으로 한 인샘플·아웃샘플 적격성 감사는 [이 노트](../gathering/notes/2026-09-03-factor-is-oos-audit.md)에 있다. 46개 중 양쪽 구간에서 재현된 0.1% 관계는 없다. 2026-09-03부터 이 인벤토리의 공통 가격 타깃은 방향 수익률이 아니라 **신호 공개 뒤 다음 5거래일 WTI 실현변동성**이며, 결과는 [변동성 매트릭스](../reports/2026-09-03-factor-validation-share.md)에 기록한다. 월간 022·027·030·042·043·044·045는 빈도에 맞춰 다음 21거래일을 쓴다.

팩터별 무료 데이터 후보, 실제 원본 보관 위치, 수집 실패 사유와 IS/OOS 실행 상태는 [무료 데이터 수집·검증 장부](../reports/2026-09-03-free-data-acquisition-ledger.md)에 기록한다.

이번 전수 감사의 수집 가능성·미수집 사유·신규 테스트는 [전 팩터 무료 데이터 완결 감사](../reports/2026-09-03-full-free-data-completeness-audit.md)에 고정했다.

서로 다른 전달경로를 묶은 4개 사전 등록 스택의 IS/OOS 반증 결과는 [결합 팩터 검정표](../reports/2026-09-03-combination-stack-test.md)에 있다. 현재 통과한 결합 가중치도 0개다.

저장된 003·004·009·010 신호를 제공 파일의 `in/out` 열로 다시 실행한 결과는 [재실행 노트](../gathering/notes/2026-09-03-saved-signal-is-oos-rerun.md)에 있다. 009는 OOS에서 부호가 반전했고, 나머지는 표본·원시 데이터 한계로 통과하지 못했다. 2026-09-03 재실행에서 022도 OOS `r=-0.348`, n=31로 확인돼 통과하지 못했다.

## 라이브 상관관계 스코어보드

**마지막 WTI 계산**: 2026-09-03 · **직접 에너지 타깃 최신 추가**: 090은 2026-09-07, 091은 2026-09-08 탐색 파일럿이다. 공통 WTI 타깃은 신호 공개 뒤 다음 5거래일 실현변동성이다. 월간 입력(011, 015, 022, 027, 030, 042–045, 088–089, 091)은 다음 21거래일, 연간 004는 다음 완전연도를 사용한다. 090은 겨울 일별 신호 → 다음 5거래일 HO 변동성이다.

이 표는 각 카드의 검증 헤더와 [상세 검증 로그](../reports/2026-09-03-factor-validation-share.md)를 요약한 **정식 라이브 매트릭스**다. `—`는 0이 아니라 적법한 공개 장기 신호·공개시점·표본이 아직 갖춰지지 않아 계산하지 못했다는 뜻이다. 새 수집·재계산은 카드, 이 표, 상세 로그를 같은 커밋에서 함께 갱신한다.

| # | 팩터 | IS r | OOS r | 상태 |
| ---: | --- | ---: | ---: | --- |
| 001 | MENA Civilian Delivery | — | — | 미검증 — 익명 주문 집계 없음 |
| 002 | Global Crypto Liquidity Stress | — | — | 미검증 — 적법한 장기 집계 없음 |
| 003 | Trump Temper | +0.000 | +0.164 | HOLD — IS 부재 |
| 004 | Transport Electrification | +0.157 | — | HOLD — OOS n=2 |
| 005 | Financial Demand | — | — | SKIP |
| 006 | Wholesale Logistics | — | — | SKIP |
| 007 | MENA Elite Mobility | — | 🟨 `-0.315` (007C, p=.084) | 공개 게시물 스크린은 비유의·고객수요 아님; 비식별 집계 없음 |
| 008 | Hyperliquid Capital Flow | — | — | MONITOR ONLY |
| 009 | Iran FX Stress | -0.003 | -0.002 | REJECTED — 관계 없음 |
| 010 | Petroleum Buffer | -0.187 | — | HOLD — OOS 부족 |
| 011 | Energy Workforce Momentum | -0.223 | -0.047 | REJECTED — OOS 소멸 |
| 012 | Energy Futures Pairs StatArb | — | — | 별도 전략 |
| 013 | Public Institutional Message Timing | — | — | 미검증 |
| 014 | Pipeline Noise | — | — | 미검증 |
| 015 | Luxury ICE Road Appetite | +0.197 | -0.192 | REJECTED — 부호 반전 |
| 016 | Desert Operational Stress | — | — | 미검증 |
| 017 | Maritime Supply Activity | — | — | 미검증 |
| 018 | Refinery Thermal & Flare | — | — | HOLD — 원시 패널 미구축 |
| 019 | Robotaxi Night Traffic | — | — | REJECTED — 데이터 경계 |
| 020 | Gulf AC Panic | -0.066 | — | HOLD — OOS 미실행 |
| 021 | Kimchi Heat Index | — | — | HOLD — WTI 미검증 |
| 022 | Korea Gas Pain Index / CFSP | -0.087 | -0.348 | REJECTED — WTI 알파 아님; 소비자 전가 대시보드만 유효 |
| 023 | Jeju Strait Watch | — | — | REJECTED — AIS·중복 |
| 024 | Chuseok Effect | — | — | HOLD |
| 025 | Korean Refinery Margin Watch | — | — | HOLD |
| 026 | Retail FX Surge Index | — | — | REJECTED — 개인 FX 데이터 |
| 027 | Incheon Transit Surge | -0.332 | +0.530 | REJECTED — 구성요소도 반전/소멸 |
| 028 | Pohang Refinery Idle Watch | — | — | REJECTED — 원안 전제 오류 |
| 029 | Duty-Free Diesel Dash | — | — | ARCHIVED — 027 하위 |
| 030 | Instant Noodle Panic Index | — | — | HOLD |
| 031 | Live Commerce Burn Rate | — | — | ARCHIVED — 027 하위 |
| 032 | Korea Weather & Transport | — | — | HOLD |
| 033 | Base-Area Barbershop | — | — | ARCHIVED |
| 034 | Base-Area Buzz-Cut | — | — | ARCHIVED |
| 035 | Base-Area Fine-Dining | — | — | ARCHIVED |
| 036 | Public Military Recruiting | — | — | HOLD |
| 037 | USFK Public Context | — | — | ARCHIVED |
| 038 | Cushing Draw Surprise | -0.142 | -0.074 | REJECTED — 가설 반대 |
| 039 | U.S. Gasoline Demand Surprise | -0.005 | -0.009 | REJECTED — 관계 없음 |
| 040 | SPR Injection Watch | +0.051 | -0.455 | REJECTED — 부호 반전 |
| 041 | Refinery Utilization Proxy | -0.206 | -0.011 | REJECTED — OOS 소멸 |
| 042 | Asia Financial Hub Pulse | +0.044 | -0.350 | REJECTED for 042A — 구성요소도 미통과; 4도시 패널 미구축 |
| 043 | Overtime Latte Index | — | — | HOLD — 소비 패널 없음 |
| 044 | AI Burn Rate Index | -0.181 | -0.041 | REJECTED — OOS 소멸 |
| 045 | Iced Americano Heat Index | +0.512 | -0.511 | REJECTED — 부호 반전 |
| 046 | Urban Mobility Tempo | -0.267 | +0.005 | REJECTED — OOS 소멸 |
| 047 | Premium–Value Outdoor Spread | — | — | HOLD — Canada Goose–Columbia 무료 구조화 공통 공시가 IS 3·OOS 0뿐 |
| 048 | All-In Tie Day Index | — | — | MEME / MONITOR ONLY — 공개 미디어 주석 |
| 049 | Geopolitical News Attention Shock | +0.023 | +0.422 | REJECTED — 049W Wikipedia 초크포인트 관심도는 OOS만 강하고 IS 0 근처 |
| 050 | Anti-USA Geopolitical Tension Index | +0.023 | +0.350 | MEME / MONITOR ONLY — 050W Wikipedia 안보 바스켓도 OOS만 강하고 IS 0 근처 |
| 051 | Public Confirmation Lag Index | — | — | HOLD — FIRMS 역사 아카이브에 당시 공개시각 빈티지가 없어 as-of 검정 불가 |
| 052 | Search Desperation Index | +0.135 | +0.323 | WATCH — 052W Household Panic Wiki의 WTI RV20, 월간 OOS n=32; RBOB도 +0.191/+0.435 |
| 053 | Voice-of-Customer Fuel Frustration | — | — | HOLD — 원문 통화 NLP는 부적격; k≥10 비식별 주간 집계 미확보 |
| 054 | UAP Attention Shock | — | — | MEME DISCOVERY — 62개 자산 IS 스캔 최대 `r=+0.081`; OOS 미개봉·알파 아님 |
| 055 | Filing Delta Drift | — | — | HOLD — walk-forward SEC MD&A 공시 변화·개별 에너지 주식 변동성 후보; 수집·IS/OOS 미실행 |
| 056 | Heavy Industrial & Maritime Infrastructure | — | — | HOLD — 정유 보수·중장비·조선·건설 복합 가설; 적격 무료 입력·공개시점 미확보 |
| 057 | US HIMI Public Proxy | -0.177 | +0.465 | HOLD — 공개 2성분 합성은 IS/OOS 부호 반전; 원래 HIMI 네 성분은 미측정 |
| 058 | Headline Boredom Index | +0.111 | +0.466 | HOLD — 기사량 통제 뒤 IS/OOS `+0.091/+0.061`; 반복성 독립 효과 소멸 |
| 059 | HIMI-IIVF | — | — | HOLD — ISM 주문·납기와 재고/판매 속도 후보; 실제 공개일·장기 패널·IS/OOS 미실행 |
| 060 | CODC Credit–Oil Dynamic Cointegration | — | — | HOLD — FRED HY OAS 공식 CSV 수집이 연결 재설정으로 실패; 공적분·공개시점·비중첩 검정 전 IS/OOS 미실행 |
| 061 | Refinery–Credit Stress Gate | — | — | HOLD — 041 저가동률 AND 060 극단 괴리의 MPC/RBOB 변동성 게이트; 060 원시 패널 미확보 |
| 062 | Industrial Credit–Inventory Stress Regime | — | — | HOLD — 059 산업재고 극단 AND 060 극단 괴리의 월간 RBOB/XLE 변동성 게이트; 두 입력 미실측 |
| 063 | Conspiracy Attention Index | 별도표 | 별도표 | MEME / MONITOR ONLY — Bitcoin OOS 변동성 발견값은 IS 미재현·OOS 사건 5개; 금 관계 소멸 |
| 064 | Oilman Steakhouse Index | — | — | REJECTED — 공개 장기 예약·도착 집계가 없어 원 가설 미측정 |
| 065 | War-Room Coffee Index | — | — | REJECTED — 심야·트레이딩 지구 커피 수요 공개 패널 없음 |
| 066 | Crew-Change Rush Index | — | — | REJECTED — BTS 항공 승객은 offshore crew change가 아님 |
| 067 | Oilman Haircut Index | — | — | ARCHIVED — 개인 스타일·이발 수요는 수집하지 않음 |
| 068 | Energy Corridor Midnight Lights | — | — | HOLD — 2012–2020 공개 야간광은 확인했으나 사무실 야근 식별·2024+ OOS 불가 |
| 069 | Ulsan Late Delivery Index | — | — | REJECTED — 공개 장기 심야 배달·산단 권역 집계 없음 |
| 070 | Highway Ramyeon Index | — | — | HOLD — `라면 절대 판매수량 하락 AND 대형 화물차 휴게소 유입 하락`은 무료 장기 패널 부재로 미검정 |
| 071 | Jeju Full-Tank Return Index | — | — | REJECTED — 렌터카 보유대수는 실제 대여·연료 행동이 아님 |
| 072 | Yeosu Turnaround Lunchbox Index | — | — | REJECTED — 도시락·숙박·정비 인력 장기 집계 없음 |
| 073 | Incheon Dawn Restock Index | — | — | HOLD — 월간 화물은 공개되나 면세 리스톡·새벽 활동 미측정 |
| 074 | Refinery Multi-Block Composite | 별도표 | 별도표 | REJECTED — MPC 변동성 복합 검정은 IS 관계·OOS 통제/사건 검정 미통과; WTI 통과 아님 |
| 075 | Academic Liquidity Calendar | 별도표 | 별도표 | REJECTED AS ALPHA / MONITOR ONLY — WTI 계절성 IS/OOS BH 기준 미통과; 자산·달력창별 검정은 카드 참조 |
| 076 | Hidden Hydrocarbon Exposure Screen | 별도표 | 별도표 | REJECTED AS OIL ALPHA — WTI 미래 변동성 검정 미통과; 타깃·신호별 검정은 카드 참조 |
| 077 | Korea Pump Pass-Through & Station Freeze | — | — | HOLD — 지역가격 역사·개별 주유소 스냅샷·공표시점 미감사; 국내 전가 모니터 후보 |
| 078 | Korea Freight & Port Fuel Pulse | — | — | HOLD — 차종 정의·역사 연속성·첫 공개일 미수집; 교통·항만 집계 후보 |
| 079 | Korea Naphtha Export Thermometer | — | — | HOLD — HS 바스켓·역사·공개일·개정 빈티지 미고정; 월간 무역 후보 |
| 080 | Korea Fuel-Switch Dispatch Alert | — | — | HOLD — 연료별 발전량의 연속 역사·개정·공표시점 미감사; 연료전환 후보 |
| 081 | Korea LPG Substitution Pulse | — | — | HOLD — 실제 차량·연료 판매·운행거리 장기 패널과 공개일 미확보; 상대가격 후보 |
| 082 | Korea Kitchen Oil Stress / Palm–WTI Cointegration | — | — | HOLD — 한국 식용유 장기 소매가격·공개일·개정 이력 미확보; 팜유–WTI 공적분·선행성·OOS 미검정 |
| 083 | Iced Americano Pass-Through | — | — | HOLD — 커피(외식) CPI의 월별 최초 공표일 패널이 없어 세 자산 사양 미검정 |
| 084 | Trailhead Tailgate Index | 별도표 | 별도표 | REJECTED — RBOB 21일 수익률 IS/OOS `-0.127/+0.186` 부호 반전; RV OOS 값도 채택 불가 |
| 085 | Watermelon Reefer Squeeze Index | 별도표 | 별도표 | HOLD — 공개 분기 물량 프록시 HO 수익률 +0.073/+0.465이나 OOS n=7; 주간 shortage 본신호 미검정 |
| 086 | [Harvest Combine Diesel Pulse](086-harvest-combine-diesel-pulse/README.md) | 별도표 | 별도표 | HOLD — USDA 옥수수·대두 수확 진도 surprise → HO RV5는 IS +0.301이나 OOS +0.181, n=13·p=.553으로 재현 실패 |
| 087 | [Chicken Wing Cold-Chain Index](087-chicken-wing-cold-chain-index/README.md) | 별도표 | 별도표 | REJECTED — USDA 주간 도계·냉동 가금 재고 복합 → HO RV5는 IS -0.063, OOS -0.179. 둘 다 유의하지 않음 |
| 088 | [Borderline Diesel Index](088-borderline-diesel-index/README.md) | 별도표 | 별도표 | HOLD — BTS 국경 트럭 YoY → HO RV21은 총량 IS/OOS +0.066/-0.275; 캐나다 OOS -0.384은 IS +0.087과 불일치 |
| 089 | [Friday Escape Velocity](089-friday-escape-velocity/README.md) | 별도표 | 별도표 | HOLD — BTS 월간 항공 복합 → HO RV21은 IS/OOS +0.061/-0.567 부호 반전; Friday 자체는 무료 월간 집계에서 미측정 |
| 090 | [Great Lakes Ice Constraint Index](090-great-lakes-ice-constraint-index/README.md) | 별도표 | 별도표 | HOLD — NOAA 결빙 90일 z → HO RV5는 IS/OOS -0.103/-0.228으로 약한 동일방향이나 비유의; 실제 쇄빙·지연 미측정 |
| 091 | [Cushing Motel Lights Index](091-cushing-motel-lights-index/README.md) | 별도표 | 별도표 | HOLD — 월별 호텔세 14개월 파일럿의 다음 달 WTI RV 상관은 +0.235, p=.440; 신고 지연·OCR 전사·표본 부족으로 알파 아님 |

**현재 통과 수**: 0개. `|r| ≥ 0.10`이면서 IS·OOS 모두 같은 방향인 행만 통과로 인정한다. 따라서 높은 단일 구간 수치(예: 045의 IS `+0.512`, 040의 OOS `-0.455`)도 채택 근거가 아니다.

## 현재 인벤토리와 카드별 검증 기록

| # | 카드 | 역할 | 현재 검증 결론 | Oil Pizza |
| --- | --- | --- | --- | ---: |
| 001 | [MENA Civilian Delivery](001-pentagon-ubereats/README.md) | 수요 후보 | 원 Pentagon 가설은 **WITHDRAWN**. 민간 익명 집계가 없어 0.1% 검증 불가 | 0.0 |
| 002 | [Global Crypto Liquidity Stress](002-whale-index/README.md) | 변동성 후보 | 고래·국가 귀속 불가. 적법한 장기 집계 시계열 전에는 검증 불가 | 0.0 |
| 003 | [Trump Temper & Oil Policy](003-truth-social/README.md) | 공개 텍스트 후보 | 5일 변동성: IS `r=0.000`, OOS `r=+0.164`; IS 부재·플랫폼 단절로 통과 아님 | 0.0 |
| 004 | [Transport Electrification](004-renewable-displacement/README.md) | 중기 수요 후보 | 다음 연도 변동성 IS `r=+0.157`, n=7; OOS n=2라 알파 근거 아님 | 0.0 |
| 005 | [Financial Demand](005-financial-demand/README.md) | 기업 재무 아이디어 | **SKIP** — 물리 수요 경로·고유성이 없음 | 0.0 |
| 006 | [Wholesale Logistics](006-wholesale-logistics/README.md) | 실물 수요 아이디어 | **SKIP** — EIA 주간 자료보다 느리고 고유 알파 없음 | 0.0 |
| 007 | [MENA Elite Mobility](007-doomsday-bunker-index/README.md) | 지정학 리스크 후보 | 007C 공개 게시물은 최선 OOS `r=-0.315, p=.084`이나 고객수요가 아니고 비유의; 비식별 복수기관 집계 없음 | 0.0 |
| 008 | [Hyperliquid Capital Flow](008-hyperliquid-capital-flow/README.md) | 설명적 모니터 | **monitor only** — 귀속 불가·역사 부족·고유성 없음 | 0.0 |
| 009 | [Iran FX Stress](009-iran-middleeast-premium/README.md) | 현지 스트레스 후보 | 5일 변동성 IS `r=-0.003`, OOS `r=-0.002`; 관계 없음 | 0.0 |
| 010 | [Official Petroleum Buffer & Public Supply Policy](010-official-petroleum-buffer/README.md) | 변동성 후보 | 5일 변동성 IS `r=-0.187`; 가설 방향을 지지하지 못함 | 0.0 |
| 011 | [Energy Workforce Momentum](011-energy-workforce-momentum/README.md) | 중기 공급 후보 | BLS 고용 프록시: IS `r=-0.223`, OOS `r=-0.047`; 원안 4성분 미복제 | 0.0 |
| 012 | [Energy Futures Pairs StatArb](012-energy-futures-pairs-statarb/README.md) | 시장중립 전략 | 계약별 허가 데이터·비용·워크포워드가 없어 재현 성과 없음 | — |
| 013 | [Public Institutional Message Timing](013-public-institutional-message-timing/README.md) | 변동성 후보 | 설교·공개담화는 느린 뉴스 재반영일 가능성이 높음. **0.1% 알파 미확인** | 0.0 |
| 014 | [Pipeline Noise](014-pipeline-noise-signal/README.md) | 물리 리스크 후보 | 공개 관측소가 파이프라인 상태를 식별한다는 근거 없음 | 0.0 |
| 015 | [Luxury ICE Road Appetite](015-luxury-ice-road-appetite/README.md) | 밈·소비 관측 | FHWA 전체 VMT: IS `r=+0.197`, OOS `r=-0.192`; 원안 차종 미측정·부호 반전 | 0.0 |
| 016 | [Desert Operational Stress](016-desert-operational-stress/README.md) | 밈·기상 운영 후보 | 기상은 예보되고 운영 차질은 후행 확인. **독립 알파 미확인** | 0.0 |
| 017 | [Maritime Supply Activity](017-maritime-supply-activity/README.md) | 해상 물류·변동성 후보 | 물리 경로는 있으나 선박별 AIS 추적은 금지, 집계형 장기 데이터도 미확인 | 0.0 |
| 018 | [Refinery Thermal & Flare](018-refinery-thermal-flare/README.md) | 정유 운영·변동성 후보 | 공개 열 이상은 실제 관측 가능. 단, 가동률·WTI 알파는 아직 미검증 | 0.0 |
| 019 | [Robotaxi Night Traffic](019-robotaxi-night-traffic-archive/README.md) | 아이디어 보존 | **REJECTED** — 개인정보·데이터 적격성·인과 문제 | 0.0 |
| 020 | [Gulf AC Panic](020-gulf-ac-panic/README.md) | 밈·전력 운영 후보 | 5일 변동성 IS `r=-0.066`; 전력·정전 일별 공개 시계열도 없음 | 0.0 |
| 021 | [Kimchi Heat Index](021-kimchi-heat-index/README.md) | 한국 식탁 물가·기후 밈 모니터 | **IDEA ARCHIVED / HOLD** — 유가 타깃으로 미검증. KAMIS 수집 명세만 등록 | 0.0 |
| 022 | [Korea Gas Pain Index / CFSP](022-korea-us-fuel-transmission-spread/README.md) | 한국·미국 소비자 연료 전가 대시보드 | 21일 변동성 IS `r=-0.087`, n=95; OOS `r=-0.348`, n=31. CFSP는 미국 50L 노동시간·심리 UI이며 원유 알파 아님 | 0.0 |
| 023 | [Jeju Strait Watch](023-jeju-strait-watch/README.md) | 해상 리스크 아이디어 보존 | **REJECTED** — 선박별 AIS·보안 경계 및 017과 중복 | 0.0 |
| 024 | [Chuseok Effect](024-chuseok-effect/README.md) | 국내 이동·수요 계절 맥락 | **HOLD** — 달력 자체는 알려진 계절성. 공개 집계 서프라이즈만 검토 가능 | 0.0 |
| 025 | [Korean Refinery Margin Watch](025-korean-refinery-margin-watch/README.md) | 한국 정유 전가·마진 프록시 | **HOLD** — 공개 월간 프록시의 물리 경로는 있음; 실제 주간 crack 시계열 미확보 | 0.0 |
| 026 | [Retail FX Surge Index](026-retail-fx-surge-index/README.md) | 아이디어 보존 | **REJECTED** — 개인·은행 고객 FX 흐름은 수집·검증 불가 | 0.0 |
| 027 | [Incheon Transit Surge](027-incheon-transit-surge/README.md) | 항공 수요 nowcast 후보 | 5개 운영 구성요소도 반전/소멸. 최고 IS 절대이상치 `+0.370` → 사후구간 `-0.562` | 0.0 |
| 028 | [Pohang Refinery Idle Watch](028-pohang-refinery-idle-watch/README.md) | 아이디어 보존 | **REJECTED** — 원안의 S-Oil 포항 정유소 전제가 사실과 다름; 025로만 맥락 보존 | 0.0 |
| 029 | [Duty-Free Diesel Dash](029-duty-free-diesel-dash/README.md) | 관광·면세 소비 하위 가설 | **ARCHIVED** — 공개 면세 통계로 중국 관광·물류연료 귀속 불가; 027 하위 가설 | 0.0 |
| 030 | [Instant Noodle Panic Index](030-instant-noodle-panic-index/README.md) | K-소비재 수출 밈 모니터 | **HOLD** — 관세청 공개 무역 surprise는 시험 가능; HS·국가 바스켓·공개시점 미동결 | 0.0 |
| 031 | [Live Commerce Burn Rate](031-live-commerce-burn-rate/README.md) | Clicks → Combustion 하위 가설 | **ARCHIVED** — 스트림·주문·물류 데이터 부적격; 027의 월간 집계 맥락만 사용 | 0.0 |
| 032 | [Korea Weather & Transport Disruption](032-korea-weather-transport-disruption/README.md) | 황사·제주 기상·수소 운영 맥락 | **HOLD** — 국내 운영 대시보드. WTI 변동성 선행성 미검증 | 0.0 |
| 033 | [Base-Area Barbershop Activity](033-base-area-barbershop-activity/README.md) | 피자 인덱스형 지역 서비스 아이디어 | **ARCHIVED** — 적격한 익명 도시권 장기 집계 없음 | 0.0 |
| 034 | [Base-Area Buzz-Cut Mix](034-base-area-buzzcut-mix/README.md) | 밈 아이디어 보존 | **ARCHIVED** — 개인 외모·스타일 데이터는 수집하지 않음 | 0.0 |
| 035 | [Base-Area Fine-Dining Activity](035-base-area-fine-dining-activity/README.md) | 피자 인덱스형 지역 서비스 아이디어 | **ARCHIVED** — 적격한 익명 도시권 장기 집계 없음 | 0.0 |
| 036 | [Public Military Recruiting Context](036-public-military-recruiting-context/README.md) | 공개 기관·노동시장 맥락 | **HOLD** — 저빈도·혼합 경로, 장기 공개시점 패널 미확보 | 0.0 |
| 037 | [USFK Public Context](037-usfk-public-context/README.md) | 공식 발표 사건 태그 | **ARCHIVED** — 013의 지역 맥락 변형; 조기 알파 아님 | 0.0 |
| 038 | [Cushing Draw Surprise](038-cushing-draw-surprise/README.md) | 공개 재고·변동성 후보 | IS `r=-0.142`, OOS `r=-0.074`; 가설 반대 | 0.0 |
| 039 | [U.S. Gasoline Demand Surprise](039-us-gasoline-demand-surprise/README.md) | 공개 수요·변동성 후보 | IS `r=-0.005`, OOS `r=-0.009`; 관계 없음 | 0.0 |
| 040 | [SPR Injection Watch](040-spr-injection-watch/README.md) | 공개 정책·변동성 후보 | IS `r=+0.051`, OOS `r=-0.455`; 부호 반전 | 0.0 |
| 041 | [Refinery Utilization Proxy](041-refinery-utilization-proxy/README.md) | 정유 운영·변동성 후보 | IS `r=-0.206`, OOS `r=-0.011`; OOS 미통과 | 0.0 |
| 042 | [Asia Financial Hub Pulse](042-asia-financial-hub-pulse/README.md) | 아시아 금융허브 소비·변동성 후보 | 042A 4개 구성요소도 반전/소멸. 4도시 동질 패널은 여전히 미구축 | 0.0 |
| 043 | [Overtime Latte Index](043-overtime-latte-index/README.md) | 커피/에너지음료 상대 소비·변동성 밈 후보 | 에너지음료 소비의 무료 분리 장기 패널 없음; 소비 대신 무역을 쓰지 않음 | 0.0 |
| 044 | [AI Burn Rate Index](044-ai-burn-rate-index/README.md) | AI 데이터센터 물리 buildout·변동성 후보 | Data center 건설: IS `r=-0.181`, OOS `r=-0.041`; 구독 레그는 미측정 | 0.0 |
| 045 | [Iced Americano Heat Index](045-iced-americano-heat-index/README.md) | 카페 소비·도심 레짐 밈 후보 | Starbucks 매출 프록시: IS `r=+0.512`, OOS `r=-0.511`; 부호 반전, 아이스 아메리카노 직접 측정 아님 | 0.0 |
| 046 | [Urban Mobility Tempo](046-urban-mobility-tempo/README.md) | 도시 이동 리듬 밈 후보 | CTA 탑승량 서프라이즈: IS `r=-0.267`, OOS `r=+0.005`; OOS 소멸 | 0.0 |
| 047 | [Premium–Value Outdoor Spread](047-conscience-compression-index/README.md) | Canada Goose 대 Columbia 아웃도어 소비 레짐 밈 | **HOLD** — 무료 구조화 공시 공통 YoY가 IS 3·OOS 0. WTI 미검증 | 0.0 |
| 048 | [All-In Tie Day Index](048-all-in-tie-day-index/README.md) | 공개 미디어 공식성 밈 주석 | **MEME / MONITOR ONLY** — 공개 에피소드 복장·주제는 선행 알파가 아님 | 0.0 |
| 049 | [Geopolitical News Attention Shock](049-geopolitical-news-attention-shock/README.md) | 지정학 뉴스·초크포인트 관심도 | **REJECTED** — 049W WTI RV5 IS/OOS `+0.023/+0.422`; IS 0 근처라 OOS 지정학 레짐값 채택 금지 | 0.0 |
| 050 | [Anti-USA Geopolitical Tension Index](050-anti-usa-tension-index/README.md) | 대미 긴장·에너지 안보 관심도 모니터 | **MEME / MONITOR ONLY** — 050W WTI RV5 `+0.023/+0.350`. IS 미재현·049W와 핵심 문서 중복 | 0.0 |
| 051 | [Public Confirmation Lag Index](051-public-confirmation-lag-index/README.md) | 위성 이상 공개시각 → 공개 확인시각의 차이 | **HOLD** — 018·049 교차 검증층. 역사 NRT/RT 공개시각 빈티지 없이는 look-ahead 없는 검정 불가 | 0.0 |
| 052 | [Search Desperation Index](052-search-desperation-index/README.md) | 소비자 생활비 검색·정보탐색 스트레스 | **WATCH** — 052W WTI RV20 `+0.135/+0.323`, RBOB `+0.191/+0.435`; OOS 32개월뿐, 가중치 0 유지 | 0.0 |
| 053 | [Voice-of-Customer Fuel Frustration](053-voice-of-customer-fuel-frustration/README.md) | 에너지 비용 불만의 익명 집계 모니터 | **HOLD** — 통화 원문·콜 ID는 금지. k≥10 비식별 주간 집계와 제공시각 없이는 수치 미생성 | 0.0 |
| 054 | [UAP Attention Shock](054-uap-attention-shock/README.md) | UAP 공개 관심도 기반 광역 자산 밈 탐색 | **MEME DISCOVERY** — 62개 IS 스캔의 최대는 BTC·GME `r=+0.081`; OOS 미개봉, 선택편향상 알파 아님 | 0.0 |
| 055 | [Filing Delta Drift](055-filing-delta-drift/README.md) | SEC MD&A 변화·에너지 기업 변동성 후보 | **HOLD** — 전체 코퍼스 TF-IDF는 look-ahead. walk-forward·동종공시·실제 접수시각 정렬을 구현한 뒤에만 IS/OOS 검정 | 0.0 |
| 056 | [Heavy Industrial & Maritime Infrastructure](056-heavy-industrial-maritime-infrastructure/README.md) | 정유 보수·중장비·조선·건설 운영 스트레스 후보 | **HOLD** — 난수 데모는 실증 아님. RMCI·DTDI·FEVI·HIC의 적격 무료 장기 입력과 크랙/기간스프레드 정의를 먼저 고정 | 0.0 |
| 057 | [US HIMI Public Proxy](057-global-heavy-industrial-maritime-infrastructure/README.md) | 미국 공개 중공업·정유 운영 프록시 반증 | IS `r=-0.177`, OOS `r=+0.465` (각 107/31개월)로 부호 반전. Machinery IP OOS `+0.712`은 사후 채택 금지 | 0.0 |
| 058 | [Headline Boredom Index](058-headline-boredom-index/README.md) | 원유 헤드라인 반복성·뉴스 레짐 진단 | HBI 원시 IS/OOS `+0.111/+0.466`이나 기사량 조건부 `+0.091/+0.061`; 049와 분리된 알파 아님 | 0.0 |
| 059 | [HIMI-IIVF](059-himi-iivf/README.md) | ISM 주문 압력·재고 속도 산업 수요 후보 | **HOLD** — `inv_lag=15`은 Census 약 6주 지연과 충돌. 실제 발표일·이벤트 단위 패널 후 검정 | 0.0 |
| 060 | [CODC](060-credit-oil-dynamic-cointegration/README.md) | HY 신용스프레드–WTI rolling 괴리·탄력성 후보 | **HOLD** — 제공 코드는 공적분 검정 없이 수준 OLS·WTI forward-fill을 사용. FRED 공식 CSV 수집도 현재 연결 재설정으로 실패; point-in-time 거래일 패널·비중첩 RV 후 검정 | 0.0 |
| 061 | [Refinery–Credit Stress Gate](061-refinery-credit-stress-gate/README.md) | 041 저가동률 × 060 신용–원유 괴리의 정유 위험 게이트 | **HOLD** — 평균 결합이 아닌 동시 극단 이진 게이트. 041 단독 MPC 결과를 조합 성과로 쓰지 않으며, 060 패널 뒤 검정 | 0.0 |
| 062 | [Industrial Credit–Inventory Stress Regime](062-industrial-credit-inventory-regime/README.md) | 059 산업 재고속도 × 060 신용–원유 괴리의 월간 위험 게이트 | **HOLD** — 059·060 실제 공개시점 패널을 확보한 뒤 월간 비중첩 RBOB/XLE 검정 | 0.0 |
| 063 | [Conspiracy Attention Index](063-conspiracy-attention-index/README.md) | 음모론 관심도 × Bitcoin·금 ‘weirdness’ 모니터 | **MEME / MONITOR ONLY** — BTC RV OOS `+0.193`은 IS `+0.016`과 불일치·사건 5개. 금은 IS/OOS `+0.161/-0.026` 반전 | 0.0 |
| 064 | [Oilman Steakhouse Index](064-oilman-steakhouse-index/README.md) | 에너지 도시 심야 식당 수요 밈 | **REJECTED** — 현재 지도/리뷰는 과거 예약·도착 집계가 아니며 가격 검정 불가 | 0.0 |
| 065 | [War-Room Coffee Index](065-war-room-coffee-index/README.md) | 에너지 트레이딩 지구 심야 커피 밈 | **REJECTED** — 시간대별 익명 소비 장기 패널 없음 | 0.0 |
| 066 | [Crew-Change Rush Index](066-crew-change-rush-index/README.md) | 해상 운영 교대·항공/호텔 밈 | **REJECTED** — 공개 T-100 승객은 교대근무자가 아니므로 프록시 금지 | 0.0 |
| 067 | [Oilman Haircut Index](067-oilman-haircut-index/README.md) | 현장 도시 바버샵 밈 | **ARCHIVED** — 개인 외모·고객 수요는 수집하지 않음 | 0.0 |
| 068 | [Energy Corridor Midnight Lights](068-energy-corridor-midnight-lights/README.md) | 에너지 도시 야간광·운영 스트레스 밈 | **HOLD** — 공개 2012–2020 위성 광도는 있으나 특정 사무실·야근은 미측정, OOS 불충족 | 0.0 |
| 069 | [울산 야식 배달 지수](069-ulsan-late-delivery-index/README.md) | 울산 산단 심야 배달·운영 압력 밈 | **REJECTED** — 공개 상권정보는 심야·산단권역 수요를 측정하지 않음 | 0.0 |
| 070 | [고속도로 화물기사 라면 지수](070-highway-ramyeon-index/README.md) | 라면 절대 판매수량 하락 × 화물차 휴게소 유입 하락 → 국내 경유 수요 압력 완화 후보 | **HOLD** — Top 5 순위는 수량이 아니며, 연속 월별 휴게소 화물차 유입도 공개되지 않아 미검정 | 0.0 |
| 071 | [제주 렌터카 만땅 반납 지수](071-jeju-full-tank-return-index/README.md) | 제주 이동·휘발유 체감 밈 | **REJECTED** — 공개 렌터카 목록은 대여·주유·반납을 측정하지 않음 | 0.0 |
| 072 | [여수 보수철 도시락 지수](072-yeosu-turnaround-lunchbox-index/README.md) | 여수 설비보수·도시락/숙박 밈 | **REJECTED** — 구조 통계는 도시락·숙박·정비 인력을 측정하지 않음 | 0.0 |
| 073 | [인천 새벽 면세 리스톡 지수](073-incheon-dawn-restock-index/README.md) | 인천 화물·항공유 수요 밈 | **HOLD** — 항공화물은 실제 공개되지만 리스톡·새벽 행동과 다름 | 0.0 |
| 074 | [Refinery Multi-Block Composite](074-refinery-multiblock-composite/README.md) | 041 정유 운영 × 휘발유 무역 × RBOB 포지션 × 크랙 | **REJECTED** — 4블록 동가중은 MPC RV5 IS `r=-0.006`, OOS `+0.197`이나 통제·사건 검정 미통과 | 0.0 |
| 075 | [Academic Liquidity Calendar](075-academic-liquidity-calendar/README.md) | 여름·연말 학사/금융 휴식기 달력 맥락 | **REJECTED AS ALPHA** — WTI 계절성은 IS/OOS BH 기준 미통과; RBOB 연말 OOS만 사후 발견값 | 0.0 |
| 076 | [Hidden Hydrocarbon Exposure Screen](076-hidden-hydrocarbon-exposure-screen/README.md) | PET·포장·운송·냉장 노출 소비기업의 섹터중립 바스켓 | **REJECTED AS OIL ALPHA** — HHE RV20의 RBOB IS 발견값은 OOS 소멸; WTI 선행성 없음 | 0.0 |
| 077 | [Korea Pump Pass-Through & Station Freeze](077-korea-pump-pass-through-station-freeze/README.md) | 지역별 주유소 가격 전가·동결·분산 | **HOLD** — Opinet의 공식 지역 일평균은 확인; 개별 주유소 역사·공표시점은 미감사 | 0.0 |
| 078 | [Korea Freight & Port Fuel Pulse](078-korea-freight-port-fuel-pulse/README.md) | 차종별 고속도로 흐름 × 산업항만 처리 | **HOLD** — 공식 집계 후보는 있으나 차종 정의·장기 공개일 패널 미수집 | 0.0 |
| 079 | [Korea Naphtha Export Thermometer](079-korea-naphtha-export-thermometer/README.md) | 나프타·석유화학 무역 수량/단가 괴리 | **HOLD** — 관세청 월간 통계 후보; HS 범위·빈티지·공개일 미고정 | 0.0 |
| 080 | [Korea Fuel-Switch Dispatch Alert](080-korea-fuel-switch-dispatch-alert/README.md) | 전력 연료믹스의 유류 발전 전환 | **HOLD** — KPX 연료별 발전량 후보의 연속 역사·정의·공개일 미감사 | 0.0 |
| 081 | [Korea LPG Substitution Pulse](081-korea-lpg-substitution-pulse/README.md) | LPG–휘발유/경유 상대가격과 차량 연료 대체 | **HOLD** — 가격은 공개 후보이나 실제 연료전환·소비 장기 패널 미확보 | 0.0 |
| 082 | [Korea Kitchen Oil Stress / Palm–WTI Cointegration](082-korea-kitchen-oil-stress/README.md) | 팜·대두·카놀라유·환율과 한국 식용유 가격의 원가 전가 | **HOLD** — 팜유–WTI 공적분은 검정 후보일 뿐, 선행성·시점·OOS 미검정 | 0.0 |
| 083 | [Iced Americano Pass-Through](083-iced-americano-pass-through/README.md) | 커피(외식) CPI → 원화·국채·식품/급식 상대수익률 | **HOLD** — 공식 월별 CPI 원표·최초 공표일 패널 미확보; 세 자산 사양 모두 미검정 | 0.0 |
| 084 | [Trailhead Tailgate Index](084-trailhead-tailgate-index/README.md) | 드라이브형 국립공원 방문 서프라이즈 → RBOB | **REJECTED** — RBOB 수익률 IS/OOS `-0.127/+0.186` 부호 반전; RV OOS `-0.282`는 n=23·IS 0 근처 | 0.0 |
| 085 | [Watermelon Reefer Squeeze Index](085-watermelon-reefer-squeeze-index/README.md) | 수박 출하철 냉장 트럭 부족 → diesel/HO 물류 압력 | **HOLD** — 공개 분기 적재량 프록시는 HO 수익률 `+0.073/+0.465`이나 OOS n=7; 주간 shortage 본신호 미검정 | 0.0 |
| 086 | [Harvest Combine Diesel Pulse](086-harvest-combine-diesel-pulse/README.md) | USDA 수확 진도 surprise → 난방유 변동성 | HOLD — USDA 옥수수·대두 수확 진도 surprise → HO RV5는 IS +0.301이나 OOS +0.181, n=13·p=.553으로 재현 실패 | 0.0 |
| 087 | [Chicken Wing Cold-Chain Index](087-chicken-wing-cold-chain-index/README.md) | USDA 주간 도계·냉동재고 복합 → 난방유 변동성 | REJECTED — USDA 주간 도계·냉동 가금 재고 복합 → HO RV5는 IS -0.063, OOS -0.179. 둘 다 유의하지 않음 | 0.0 |
| 088 | [Borderline Diesel Index](088-borderline-diesel-index/README.md) | BTS 국경 트럭 YoY → 난방유 수익률·변동성 | HOLD — BTS 국경 트럭 YoY → HO RV21은 총량 IS/OOS +0.066/-0.275; 캐나다 OOS -0.384은 IS +0.087과 불일치 | 0.0 |
| 089 | [Friday Escape Velocity](089-friday-escape-velocity/README.md) | BTS 월간 항공수요 → 난방유·RBOB 변동성 | HOLD — BTS 월간 항공 복합 → HO RV21은 IS/OOS +0.061/-0.567 부호 반전; Friday 자체는 무료 월간 집계에서 미측정 | 0.0 |
| 090 | [Great Lakes Ice Constraint Index](090-great-lakes-ice-constraint-index/README.md) | NOAA 결빙 제약 → 난방유 변동성 | HOLD — NOAA 결빙 90일 z → HO RV5는 IS/OOS -0.103/-0.228으로 약한 동일방향이나 비유의; 실제 쇄빙·지연 미측정 | 0.0 |
| 091 | [Cushing Motel Lights Index](091-cushing-motel-lights-index/README.md) | 쿠싱 숙박세 → 지역 운영 맥락 | HOLD — 14개월 탐색 파일럿의 다음 달 WTI RV `r=+0.235`, p=.440. 신고 지연·OCR 전사·표본 부족으로 밈 모니터만 허용 | 0.0 |

모든 `0.0`은 실제 백테스트·거래 가중치다. `HOLD`는 아직 필요 데이터·공개시점·정의가 갖춰지지 않았다는 뜻이고, `SKIP`은 현재 설계에서 고유 알파가 없다는 뜻이다.

새로 제안한 실물 원유 22개 아이디어의 원안별 번호·병합·안전상 분석 제외·무료 데이터 수집 상태는 [실물 22개 장부](../gathering/notes/2026-09-03-physical-oil-22-idea-intake.md)에 보존한다. 22개 중 실제 공개 원시 데이터로 즉시 검증 가능한 3·6·7·22는 038–041로 카드화했다.

## 세 개의 장부

```text
Directional / demand-supply candidates (001, 003–006, 009, 011, 015)
    → 각 후보가 독립적으로 통과한 뒤에만 결합을 논의

Risk / volatility candidates (002, 007–010, 013–014, 016–018, 020)
    → 가격 방향 가중치가 아니라 위험 노출을 조절하는 후보

Household / CPI meme monitors (021, 022)
    → 한국 식품·연료 체감가격과 전가 설명용. WTI 방향·변동성 가중치에 넣지 않음

Korea demand / refining context (024, 025, 027, 029–031)
    → 공개 집계의 실제 공개시점·역사를 확보한 뒤 변동성 반증용 테스트만 허용

Market-neutral strategy (012)
    → Oil Pizza와 별도 장부·별도 비용·별도 검증
```

2026-09-03 한국 미시 이동·관광 아이디어 10개는 [병합 기록](../gathering/notes/2026-09-03-korea-micro-mobility-factor-intake.md)에 원안별로 남겼다.

사용자가 제공한 Human Pulse 30개 원안은 [이 병합·보존 장부](../gathering/notes/2026-09-03-human-pulse-30-idea-intake.md)에 모두 남겼다. 매장·개인·현장 관찰형 서사는 042·043의 밈 맥락으로 보존하되, 실제 분석에는 익명 공식 집계만 사용한다.

## 최소 검증 순서

1. 출처의 라이선스, 지연, 개정 이력, 역사 범위를 등록한다.
2. 관측일이 아닌 **공개 가능 시점** 기준으로 시계열을 만든다.
3. 인샘플에서 사전 지정한 타깃(수익률 또는 미래 실현변동성)을 하나씩 시험한다.
4. 후보·가중치·임계값을 동결한다.
5. 이후 2024년 이후 구간에서 단 한 번의 아웃샘플 검증을 한다.

## 원안 및 패키지 보존

- [`archive/012-cartel-policy-ai-dynamics.md`](archive/012-cartel-policy-ai-dynamics.md): 012A는 010에 병합했다. 공개 OPEC 발표와 AI 처리속도는 독립 거래 팩터가 아니라 각각 사건 통제·연구 인프라로 보존한다.
- [`archive/014-ou-hmm-oil-pairs.md`](archive/014-ou-hmm-oil-pairs.md): 012의 OU-HMM 모델 변형 기록이다.
- [`archive/016-khutbah-signal.md`](archive/016-khutbah-signal.md): 013의 합성 데모 패키지 설명이다.
- [`archive/020-sandstorm-visibility-gulf-operations.md`](archive/020-sandstorm-visibility-gulf-operations.md): 016의 모래폭풍 하위 사례 기록이다.
- [019 Robotaxi Night Traffic](019-robotaxi-night-traffic-archive/README.md): 데이터 수집·백테스트에는 쓰지 않는 보존 아이디어다.

압축 원본 패키지는 번호와 무관하게 그대로 보존한다. 합성 데이터 데모의 상관·적중률은 실증 결과가 아니다.
