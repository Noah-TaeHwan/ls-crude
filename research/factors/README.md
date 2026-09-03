# 🛢️ LS CRUDE — Factor Research Map

**대상 가격**: Yahoo Finance WTI 연속선물 `CL=F`
**현재 상태**: 아래 001–022는 연구 인벤토리다. 검증을 마친 실거래 알파 목록이 아니다.
**선정 규칙**: 후보 선택·가중치 조정은 `2015-01-01`~`2023-12-31` 인샘플에서만 한다. 기준을 동결한 뒤에만 2024년 이후 아웃샘플을 한 번 연다.

## 정리 원칙 — 2026-09-03

- 동일한 관측값·가설·출력을 공유하면 한 팩터다. 같은 신호를 두 번 가중하지 않는다.
- 이전 012A는 010에, 이전 013·014는 시장중립 페어 전략 하나에, 이전 015·016은 공개 담화 후보 하나에, 이전 019·020은 사막 운영 스트레스 하나에 병합했다.
- 이전 번호의 원안·코드 설명은 [`archive/`](archive/)에 보존한다. 삭제나 성과 은폐가 아니다.
- `0.1%`는 **독립적·재현 가능한 관계**를 뜻한다. 흥미로운 원시 차이·합성 데모·UI 서사는 통과가 아니다.

상세 수집 규칙은 [`research/INTAKE.md`](../INTAKE.md), 출처·지연·라이선스는 [`sources/REGISTRY.md`](../gathering/sources/REGISTRY.md)에 기록한다.

2026-09-03 제공 `CL=F` 파일을 기준으로 한 인샘플·아웃샘플 적격성 감사는 [이 노트](../gathering/notes/2026-09-03-factor-is-oos-audit.md)에 있다. 22개 중 양쪽 구간에서 재현된 0.1% 관계는 없다. 2026-09-03부터 이 인벤토리의 공통 가격 타깃은 방향 수익률이 아니라 **신호 공개 뒤 다음 5거래일 WTI 실현변동성**이며, 결과는 [변동성 매트릭스](../reports/2026-09-03-factor-validation-share.md)에 기록한다. 월간 022는 빈도에 맞춰 다음 21거래일을 쓴다.

저장된 003·004·009·010 신호를 제공 파일의 `in/out` 열로 다시 실행한 결과는 [재실행 노트](../gathering/notes/2026-09-03-saved-signal-is-oos-rerun.md)에 있다. 009는 OOS에서 부호가 반전했고, 나머지는 표본·원시 데이터 한계로 통과하지 못했다.

## 현재 인벤토리와 검증 기록

| # | 카드 | 역할 | 현재 검증 결론 | Oil Pizza |
| --- | --- | --- | --- | ---: |
| 001 | [MENA Civilian Delivery](001-pentagon-ubereats.md) | 수요 후보 | 원 Pentagon 가설은 **WITHDRAWN**. 민간 익명 집계가 없어 0.1% 검증 불가 | 0.0 |
| 002 | [Global Crypto Liquidity Stress](002-whale-index.md) | 변동성 후보 | 고래·국가 귀속 불가. 적법한 장기 집계 시계열 전에는 검증 불가 | 0.0 |
| 003 | [Trump Temper & Oil Policy](003-truth-social.md) | 공개 텍스트 후보 | 5일 변동성: IS `r=0.000`, OOS `r=+0.164`; IS 부재·플랫폼 단절로 통과 아님 | 0.0 |
| 004 | [Transport Electrification](004-renewable-displacement.md) | 중기 수요 후보 | 다음 연도 변동성 IS `r=+0.157`, n=7; OOS n=2라 알파 근거 아님 | 0.0 |
| 005 | [Financial Demand](005-financial-demand.md) | 기업 재무 아이디어 | **SKIP** — 물리 수요 경로·고유성이 없음 | 0.0 |
| 006 | [Wholesale Logistics](006-wholesale-logistics.md) | 실물 수요 아이디어 | **SKIP** — EIA 주간 자료보다 느리고 고유 알파 없음 | 0.0 |
| 007 | [MENA Elite Mobility](007-doomsday-bunker-index.md) | 지정학 리스크 후보 | 비식별 복수기관 집계가 없어 검증 불가 | 0.0 |
| 008 | [Hyperliquid Capital Flow](008-hyperliquid-capital-flow.md) | 설명적 모니터 | **monitor only** — 귀속 불가·역사 부족·고유성 없음 | 0.0 |
| 009 | [Iran FX Stress](009-iran-middleeast-premium.md) | 현지 스트레스 후보 | 5일 변동성 IS `r=-0.003`, OOS `r=-0.002`; 관계 없음 | 0.0 |
| 010 | [Official Petroleum Buffer & Public Supply Policy](010-official-petroleum-buffer.md) | 변동성 후보 | 5일 변동성 IS `r=-0.187`; 가설 방향을 지지하지 못함 | 0.0 |
| 011 | [Energy Workforce Momentum](011-energy-workforce-momentum.md) | 중기 공급 후보 | 핵심 구성요소의 공개·재현 시계열 부족 | 0.0 |
| 012 | [Energy Futures Pairs StatArb](012-energy-futures-pairs-statarb.md) | 시장중립 전략 | 계약별 허가 데이터·비용·워크포워드가 없어 재현 성과 없음 | — |
| 013 | [Public Institutional Message Timing](013-public-institutional-message-timing.md) | 변동성 후보 | 설교·공개담화는 느린 뉴스 재반영일 가능성이 높음. **0.1% 알파 미확인** | 0.0 |
| 014 | [Pipeline Noise](014-pipeline-noise-signal.md) | 물리 리스크 후보 | 공개 관측소가 파이프라인 상태를 식별한다는 근거 없음 | 0.0 |
| 015 | [Luxury ICE Road Appetite](015-luxury-ice-road-appetite.md) | 밈·소비 관측 | 측정 불가 또는 느린·중복 프록시. **거래 알파 아님** | 0.0 |
| 016 | [Desert Operational Stress](016-desert-operational-stress.md) | 밈·기상 운영 후보 | 기상은 예보되고 운영 차질은 후행 확인. **독립 알파 미확인** | 0.0 |
| 017 | [Maritime Supply Activity](017-maritime-supply-activity.md) | 해상 물류·변동성 후보 | 물리 경로는 있으나 선박별 AIS 추적은 금지, 집계형 장기 데이터도 미확인 | 0.0 |
| 018 | [Refinery Thermal & Flare](018-refinery-thermal-flare.md) | 정유 운영·변동성 후보 | 공개 열 이상은 실제 관측 가능. 단, 가동률·WTI 알파는 아직 미검증 | 0.0 |
| 019 | [Robotaxi Night Traffic](019-robotaxi-night-traffic-archive.md) | 아이디어 보존 | **REJECTED** — 개인정보·데이터 적격성·인과 문제 | 0.0 |
| 020 | [Gulf AC Panic](020-gulf-ac-panic.md) | 밈·전력 운영 후보 | 5일 변동성 IS `r=-0.066`; 전력·정전 일별 공개 시계열도 없음 | 0.0 |
| 021 | [Kimchi Heat Index](021-kimchi-heat-index/README.md) | 한국 식탁 물가·기후 밈 모니터 | **IDEA ARCHIVED / HOLD** — 유가 타깃으로 미검증. KAMIS 수집 명세만 등록 | 0.0 |
| 022 | [Korea–US Fuel Transmission Spread](022-korea-us-fuel-transmission-spread/README.md) | 한국 소비자 연료 전가·환율 대시보드 | 21일 변동성 IS `r=-0.087`, n=95. 원유 알파가 아닌 dashboard candidate | 0.0 |

모든 `0.0`은 실제 백테스트·거래 가중치다. `HOLD`는 아직 필요 데이터·공개시점·정의가 갖춰지지 않았다는 뜻이고, `SKIP`은 현재 설계에서 고유 알파가 없다는 뜻이다.

## 세 개의 장부

```text
Directional / demand-supply candidates (001, 003–006, 009, 011, 015)
    → 각 후보가 독립적으로 통과한 뒤에만 결합을 논의

Risk / volatility candidates (002, 007–010, 013–014, 016–018, 020)
    → 가격 방향 가중치가 아니라 위험 노출을 조절하는 후보

Household / CPI meme monitors (021, 022)
    → 한국 식품·연료 체감가격과 전가 설명용. WTI 방향·변동성 가중치에 넣지 않음

Market-neutral strategy (012)
    → Oil Pizza와 별도 장부·별도 비용·별도 검증
```

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
- [019 Robotaxi Night Traffic](019-robotaxi-night-traffic-archive.md): 데이터 수집·백테스트에는 쓰지 않는 보존 아이디어다.

압축 원본 패키지는 번호와 무관하게 그대로 보존한다. 합성 데이터 데모의 상관·적중률은 실증 결과가 아니다.
