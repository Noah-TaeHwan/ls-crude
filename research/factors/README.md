# 🛢️ LS CRUDE — Factor Research Map

**대상 가격**: Yahoo Finance WTI 연속선물 `CL=F`
**현재 상태**: 아래 001–049는 연구 인벤토리다. 검증을 마친 실거래 알파 목록이 아니다.
**선정 규칙**: 후보 선택·가중치 조정은 `2015-01-01`~`2023-12-31` 인샘플에서만 한다. 기준을 동결한 뒤에만 2024년 이후 아웃샘플을 한 번 연다.

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

**마지막 계산**: 2026-09-03 · **공통 타깃**: 신호 공개 뒤 다음 5거래일 WTI 실현변동성. 월간 입력(011, 015, 022, 027, 030, 042–045)은 다음 21거래일, 연간 004는 다음 완전연도를 사용한다.

이 표는 각 카드의 검증 헤더와 [상세 검증 로그](../reports/2026-09-03-factor-validation-share.md)를 요약한 **정식 라이브 매트릭스**다. `—`는 0이 아니라 적법한 공개 장기 신호·공개시점·표본이 아직 갖춰지지 않아 계산하지 못했다는 뜻이다. 새 수집·재계산은 카드, 이 표, 상세 로그를 같은 커밋에서 함께 갱신한다.

| # | 팩터 | IS r | OOS r | 상태 |
| ---: | --- | ---: | ---: | --- |
| 001 | MENA Civilian Delivery | — | — | 미검증 — 익명 주문 집계 없음 |
| 002 | Global Crypto Liquidity Stress | — | — | 미검증 — 적법한 장기 집계 없음 |
| 003 | Trump Temper | +0.000 | +0.164 | HOLD — IS 부재 |
| 004 | Transport Electrification | +0.157 | — | HOLD — OOS n=2 |
| 005 | Financial Demand | — | — | SKIP |
| 006 | Wholesale Logistics | — | — | SKIP |
| 007 | MENA Elite Mobility | — | — | 미검증 — 비식별 집계 없음 |
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
| 022 | Korea Gas Pain Index | -0.087 | -0.348 | REJECTED — WTI 알파 아님 |
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
| 049 | Geopolitical News Attention Shock | — | — | HOLD — GDELT 전체 역사 코퍼스·as-of 감사 전 |
| 050 | Anti-USA Geopolitical Tension Index | +0.018 | +0.113 | MEME / MONITOR ONLY — 2024년 이후 스파이크 시 5일 변동성 1.87배 폭증 |

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
| 007 | [MENA Elite Mobility](007-doomsday-bunker-index/README.md) | 지정학 리스크 후보 | 비식별 복수기관 집계가 없어 검증 불가 | 0.0 |
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
| 022 | [Korea Gas Pain Index](022-korea-us-fuel-transmission-spread/README.md) | 한국 소비자 연료 전가·환율 대시보드 | 21일 변동성 IS `r=-0.087`, n=95; OOS `r=-0.348`, n=31. 원유 알파 아님 | 0.0 |
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
| 049 | [Geopolitical News Attention Shock](049-geopolitical-news-attention-shock/README.md) | 지정학 뉴스의 관심도·확산 폭 | **HOLD** — Oil Slice V1 후보. 15개 시드가 아닌 전체 코퍼스·as-of 감사 필요 | 0.0 |
| 050 | [Anti-USA Geopolitical Tension Index](050-anti-usa-tension-index/README.md) | 대미 긴장도·변동성 밈 모니터 | **MEME / MONITOR ONLY** — IS r=+0.018, OOS r=+0.113; 2024년 이후 스파이크 시 5일 변동성 1.87배 폭증 | 0.0 |

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
