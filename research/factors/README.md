# 🛢️ LS CRUDE — Factor Research Map

**대상 가격**: Yahoo Finance WTI 연속선물 `CL=F`
**현재 상태**: 001–020은 연구 인벤토리다. 검증을 마친 실거래 알파 목록이 아니다.
**선정 규칙**: 후보 선택·가중치 조정은 `2015-01-01`~`2023-12-31` 인샘플에서만 하고, 동결 후에만 2024년 이후 아웃샘플을 한 번 연다.

## 먼저 읽을 것

- 가격은 Yahoo `CL=F`만 프로그램으로 수집한다.
- Investing.com은 사용자가 제공한 CSV만 사용할 수 있으며 사이트 스크래핑은 금지한다.
- 성과 수치, 선행성, 최적 가중치를 데이터 검증 전에는 주장하지 않는다.
- 개인·고객 비밀·거래소 고객 식별·은행·SCADA·무허가 스크래핑 데이터는 사용하지 않는다.
- 팩터는 **방향성**, **변동성/리스크 게이트**, **시장중립 전략**을 섞어 합산하지 않는다.

상세 수집 규칙은 [`research/INTAKE.md`](../INTAKE.md), 출처·지연·라이선스는 [`sources/REGISTRY.md`](../gathering/sources/REGISTRY.md)에 기록한다.

## 인벤토리

| # | 카드 | 분류 | 현재 판정 | Oil Pizza 가중치 |
| --- | --- | --- | --- | ---: |
| 001 | [Pentagon Uber Eats / MENA Civilian Delivery](001-pentagon-ubereats.md) | 철회 원안 + 민간 수요 보류 가설 | **원안 WITHDRAWN / 001B HOLD** — 기지 추적 없이 익명 도시권 집계만 검토 | 0.0 |
| 002 | [Global Crypto Liquidity Stress](002-whale-index.md) | 변동성 레짐 후보 | **HOLD** — 고래 귀속은 불가, 적법한 집계·역사 데이터 점검 필요 | 0.0 |
| 003 | [Trump Temper & Oil Policy](003-truth-social.md) | 공개 텍스트·변동성 후보 | **HOLD** — 첫 엄격 규칙 탐색은 알파를 입증하지 못함 | 0.0 |
| 004 | [Transport Electrification Displacement](004-renewable-displacement.md) | 중기 수요 후보 | **004B HOLD** — 물리 경로는 있으나 공개일·빈티지 없는 연간 7–8개 탐색은 알파 근거가 아님 | 0.0 |
| 005 | [Financial Demand](005-financial-demand.md) | 중기 수요 후보 | **HOLD** — 모델 복잡도보다 공개시점·표본 설계가 먼저 | 0.0 |
| 006 | [Wholesale Logistics](006-wholesale-logistics.md) | 실물 수요 아이디어 | **SKIP** — 논리는 유효하나, 느린 물류 대리값에 EIA 주간 자료 대비 고유 알파 근거가 없음 | 0.0 |
| 007 | [MENA Elite Mobility](007-doomsday-bunker-index.md) | 지정학 리스크 게이트 | **HOLD** — 복수 기관 비식별 집계 제휴 필요 | 0.0 |
| 008 | [Hyperliquid Capital Flow](008-hyperliquid-capital-flow.md) | 설명적 크립토 레버리지 모니터 | **HOLD / monitor only** — 귀속 불가·2015–2023 역사 부족·광범위 OI/펀딩 대비 고유성 미확인 | 0.0 |
| 009 | [Iran FX Stress & Crypto Premium](009-iran-middleeast-premium.md) | 현지 스트레스 후보 | **009A HOLD / 009B BLOCKED** — FX 탐색 차이는 있으나 빈티지·공통충격 미해결, 암호 레그는 제재 준수상 불가 | 0.0 |
| 010 | [Official Petroleum Buffer](010-official-petroleum-buffer.md) | 변동성 레짐 | **HOLD** — 발표시점·개정 이력 필요 | 0.0 |
| 011 | [Energy Workforce Momentum](011-energy-workforce-momentum.md) | 중기 공급 후보 | **HOLD** — 공개·재현 가능한 구성요소가 부족 | 0.0 |
| 012 | [Cartel Policy & AI Dynamics](012-cartel-policy-ai-dynamics.md) | 정책 후보 묶음 | **HOLD / 분해 필요** — SPR·OPEC 정책·AI는 독립 가설 | 0.0 |
| 013 | [Gasoil Crack](013-oil-pairs-gasoil-crack.md) | 시장중립 StatArb | **별도 전략 연구** — Oil Pizza에 합산 금지 | — |
| 014 | [OU-HMM Pairs](014-ou-hmm-oil-pairs.md) | 시장중립 StatArb | **별도 전략 연구** — 재현 가능한 데이터·비용 검증 필요 | — |
| 015 | [Mosque Sermon](015-mosque-sermon-oil-signal.md) | 지정학 리스크 게이트 | **HOLD** — 공개 코퍼스·번역·라벨 검증 필요 | 0.0 |
| 016 | [Khutbah Signal package](016-khutbah-signal.md) | 015 구현 패키지 | **중복 패키지** — 015의 코드 프로토타입 | — |
| 017 | [Pipeline Noise](017-pipeline-noise-signal.md) | 물리 리스크 게이트 | **HOLD** — 공개 관측소가 파이프라인 이상을 식별하는지 불명 | 0.0 |
| 018 | [Luxury ICE Road Appetite](018-luxury-ice-road-appetite.md) | 밈 아이디어 + 소비·물류 후보 | **IDEA + HOLD** — 원안 보존, 측정 가능한 프록시 조사 중 | 0.0 |
| 019 | [OPEC Camel Index](019-opec-camel-index.md) | 밈 서사 + 사막 운영 스트레스 | **MEME + HOLD** — 낙타는 UI, 기상·운영 변수만 조사 | 0.0 |
| 020 | [Sandstorm Visibility & Gulf Operations](020-sandstorm-visibility-gulf-operations.md) | 밈 서사 + 가시성·운영 리스크 | **MEME + HOLD** — 공개 폭풍·공개 운영 차질만 조사 | 0.0 |

## 체계: 세 개의 버킷

```text
Directional candidates (004–005, 009, 012, 018D–E)
    → 각 후보가 독립적으로 통과한 뒤에만 결합 후보가 됨

Risk / volatility gates (002, 007, 010–011, 015, 017, 019–020)
    → 방향 베팅의 크기를 조절하는 후보. 가격 방향 가중치가 아님

Market-neutral strategies (013–014)
    → 독립된 스프레드 전략. Oil Pizza와 별도 장부·별도 검증
```

현재 Oil Pizza에서 코드로 정의된 공개 신호 초안은 Oil Slice뿐이다. 아래와 같은 고정 가중 합은 **향후 검증 후보를 설명하는 형식일 뿐, 실행 포트폴리오가 아니다.**

```python
# 각 candidate_i는 인샘플 데이터 적격성·발표시점·단변량 검증을 통과한 뒤에만 추가한다.
candidate_score = combine_only_after_freeze(approved_candidates)
risk_gate = combine_only_after_freeze(approved_risk_gates)

# 013·014는 별도 market-neutral book으로 관리한다.
```

## 016·017 패키지 처리

- `016-khutbah_signal.zip`은 015와 같은 가설을 구현한 연구용 패키지다. 합성 데이터 데모의 상관·적중률은 실증 결과가 아니다.
- `017-pipeline_noise_signal.zip`은 공개 지진·인프라사운드 자료를 쓰는 연구용 패키지다. 공개 관측소의 소음 이상이 파이프라인 결함을 뜻하지는 않는다.
- 압축파일은 원본 패키지로 보존하고, 검증 기준은 위의 문서형 카드에서 관리한다.

## 최소 검증 순서

1. 출처의 라이선스, 지연, 개정 이력, 역사 범위를 등록한다.
2. 관측일이 아닌 **공개 가능 시점** 기준으로 시계열을 만든다.
3. 인샘플에서 사전 지정한 타깃(수익률 또는 미래 실현변동성)을 하나씩 시험한다.
4. 후보·가중치·임계값을 동결한다.
5. 이후 2024년 이후 구간에서 단 한 번의 아웃샘플 검증을 한다.

검증 전에는 모든 후보의 가중치를 `0.0`으로 둔다. `HOLD`는 실패가 아니라, 필요한 데이터·정의·시간정렬이 아직 갖춰지지 않았다는 의미다.

## 파일 구조

```text
research/factors/
├── 001–012 … 방향성/레짐 후보 카드
├── 013–014 … 별도 StatArb 전략 카드와 연구 패키지
├── 015 … Khutbah/설교문 지정학 톤 카드
├── 016-khutbah_signal.zip + 016-khutbah-signal.md
├── 017-pipeline_noise_signal.zip + 017-pipeline-noise-signal.md
├── 018-luxury-ice-road-appetite.md
├── 019-opec-camel-index.md
└── 020-sandstorm-visibility-gulf-operations.md
```
