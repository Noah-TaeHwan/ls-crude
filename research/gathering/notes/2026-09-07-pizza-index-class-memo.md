# 피자-인덱스-클래스 신호와 원유: 왜 통할 수도 있고 왜 대개 안 되는가

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-07 / Academic division (joint hunt) |
| 후보 ID / 카드 경로 | ALT-20260907-18~29 (research/candidates/) |
| 상태 | 검토 중 |
| 연결 출처 | REGISTRY 신규행: IMF PortWatch, SG data.gov.sg, Wikimedia Pageviews, CFTC COT, FRED TSI, EIA dnav, Baker Hughes |

## 한 줄 결론

피자-인덱스-클래스(기이한 국지 활동 → 관측 → 시계열 → 시장 서사) 신호는 **사건 탐지와 서사 생성에는 쓸모 있으나, WTI 방향·변동성의 반복 가능한 선행 지표라는 근거는 희박**하다. 문헌은 뉴스·관심도 변수가 원유 변동성 예측에 *기여*할 수 있다고 보지만, 효과는 작고·조건부이며·사후 선택에 취약하다. 본 헌트의 IS 검정 7건(RUN)은 전부 null 계열(Pearson 절댓값 0.17 미만, placebo 동급, 2020 의존 변형은 제외 시 소멸)이 나온 것은 이 사전(prior)과 일치한다. repo empirical only. 2-wave 병합 수치의 조정 내역은 [헌트 조정 노트](2026-09-07-hunt-reconciliation.md)에 있다.

## 1. 피자 패턴의 해부: 무엇이 진짜 관측인가

- 패턴의 계보: 냉전 시절 워싱턴 주변 피자 배달 급증 일화(Grenada 1983, Panama 1989, 걸프전 1991의 Domino's 보고)가 원형이며, 2024-04-13 이란의 드론 공격 당시 Papa John's 혼잡, 2025-06-12 이스라엘의 이란 공습 수 시간 전 District Pizza Palace 급증이 소셜 확산 계기가 되었다. 출처: Wikipedia "Pentagon pizza theory" (https://en.wikipedia.org/wiki/Pentagon_pizza_theory), The Telegraph 2025-06-13, USA Today 2025-06-16, Fox News 2025-06-21. 확인일 2026-09-07.
- 관측 방식의 한계: 현대판은 실제 주문량이 아니라 Google Maps "Popular Times / Live Visit"의 **발자국 추정**이다. 같은 비판 출처들은 (a) 적중만 기억하는 확증편향, (b) 위치 반경·비펜타곤 유동인구 혼입, (c) 국방부 공식 부인("timelines do not align", Fox Business 2025-06 보도) 및 의도적 스푸핑 가능성(Hegseth 장관의 "random nights 주문" 발언)을 지적한다. 즉 **관심도(activity of observers)와 피관측 활동(activity observed)이 분리되지 않는다**.
- LS CRUDE 함의: 우리 후보가 피자 패턴을 빌릴 때는 "누구의, 어떤 행동을, 어떤 센서가, 무슨 지연으로 재는가"를 먼저 고정해야 한다. 센서가 관심을 재면(위키 조회수, 구글 트렌드) 사건 *후행* 지표가 되기 쉽고, 센서가 물량을 재면(통과 척수, 리그 수, 재고) *동행~후행* 확인 지표가 되기 쉽다. 선행성을 주장하려면 공개시각 영수증이 필수다.

## 2. 문헌이 말하는 것: 관심도·뉴스는 원유 변동성에 기여하나 작다

- Abdollahi (2023, Energy Economics 122:106711): 주간 Brent 변동성에 뉴스·트위터 감성 지수를 넣은 GARCH-BiLSTM 하이브리드가 오차를 줄이며, **뉴스 감성이 트위터 감성보다 낫다**(정제된 정보원 가중치). 단, 변동성 *예측 보조* 결과이며 방향 알파가 아니다. (https://www.sciencedirect.com/science/article/pii/S0140988323002098)
- Hashami & Maldonado (2025, arXiv:2508.20707): 뉴스만으로(과거 변동성 없이) 원유 변동성 *방향* 분류가 가능함을 보이나, 임베딩 선택·집계 방식에 민감하고 HAR 대비 개선은 조건부다. (https://arxiv.org/abs/2508.20707)
- Google Trends 계열: "oil prices" 검색량이 원유·금·주식 공분산을 설명·예측한다는 다변량 변동성 연구(Energy Economics, S014098832300141X), 원유 변동성에 검색량을 쓴 LASSO 연구(Springer, 2020)가 있으나, 모두 **관심도 = 변동성 국면의 동행자**라는 해석과 경합한다. 인과가 아니다.
- 정책적 경고: Shiller (2017, 2020) 내러티브 전파론이 인용되듯, 바이럴 서사는 가격에 영향을 줄 수 있으나 그 자체로 tradable edge가 되지 않는다. 049W·050W의 본 repo 전례(IS≈0, OOS만 강함)가 사후 서사 선택의 위험을 실증한다. repo empirical only.

## 3. 물량계 신호(shipping/rigs/재고)의 위치

- IMF PortWatch: ~9만 척 AIS 기반 일별 초크포인트 통과·무역 추정, 주간(화 09:00 ET) 갱신, 2019~. 호르무즈는 세계 해상 원유의 약 25%가 통과하는 병목이다. 출처: https://portwatch.imf.org, Data & Methodology 페이지. 확인일 2026-09-07. 단, 분쟁기 GPS 교란·AIS 스푸핑·going-dark로 과소 집계가 공지되어 있다(당일 PortWatch Strait of Hormuz 페이지). **사건 주간의 결측 자체가 신호**일 수 있으나, 결측을 0으로 채우면 안 된다.
- Baker Hughes 리그카운트: 1944년~ 주간 미국·캐나다, 월간 국제 집계. 통상 금요일 정오(CT) 공개. 원유 증산의 선행 지표로 널리 쓰이나, 가격→리그 방향의 역인과가 강해(고유가가 리그를 부름) WTI 선행 알파로는 약하다. 출처: https://rigcount.bakerhughes.com. 확인일 2026-09-07.
- EIA 주간 석유현황(WPSR): 재고·정제·수요의 *반응* 지표. Cushing 서프라이즈(038, IS r=-0.142 OOS -0.074 가설 반대), 휘발유 수요 서프라이즈(039, ≈0) 등 본 repo 전례가 방향 가설을 반복 기각했다. repo empirical only.
- CFTC Disaggregated COT: 화요일 포지션·금요일 공개. 투기 포지션은 가격의 동행~후행 반영이 정설에 가깝고, 본 헌트 IS에서도 WTI MM 순매수 선행 상관은 r=+0.02(n=468, null)였다. repo empirical only.

## 4. 왜 대개 안 되는가: 5가지 실패 모드 (반증 체크리스트)

1. 센서-대상 불일치: 리뷰·목록·업체 수가 실제 행동(대여·주유·교대)이 아님. 본 repo 기각 064/065/066/069/071/072가 전부 이 유형이다.
2. 관심도 함정: 조회수·검색량은 사건 *후*에 뛴다. 위키 호르무즈 급증 124일 중 방향 66/57(기존 노트)은 후보 근거가 아니다.
3. as-of 붕괴: 회고 정렬(D-1 붙이기)은 가용성 증명이 아니다. PortWatch 주간 공개, CFTC 금요일 공개, 월간 파일의 익월 공개를 전부 +1기 시프트로 보수 처리했다.
4. 빈티지 소급: 현재 API의 과거 수정값을 당시 지식으로 쓰기. FRED TSI·EIA·BH 전부 current-vintage 한계를 명시했다.
5. 사후 서사 선택: OOS에서만 강한 관심도(049W/050W 패턴). 본 헌트는 IS만 보고 OOS를 열지 않았다.

## 5. 주석付き 후보 숏리스트 (이번 헌트 10건)

| ID | 후보 | 클래스 | 이번 증거 | 판단 |
| --- | --- | --- | --- | --- |
| 01 | Hormuz tanker transits | 물량/초크포인트 | 주간 IS n≈260, level +0.05·변화 +0.09, placebo 동급 | KEEP: 사건창 1회만. 알파 아님 |
| 02 | US rig activity | 물량/공급선행 | 주간 IS n≈470, 선행 -0.12이나 2020 제외 시 소멸. 역방향 +0.20 | PARK: 통제변수 용도만 |
| 03 | CFTC WTI MM net | 포지셔닝 공개 | 주간 IS n≈370-468, 전부 0.10 미만 | PARK: 헌트 본선 제외 |
| 04 | SG bunker sales | 연료수요 | 월간 IS n=108, -0.04부터 +0.17까지 약함 | KEEP: 공표일 감사만. 알파 아님 |
| 05 | OpenSky ADS-B Hormuz | 물량/항공관측 | 역사 API 거부(403). 라이브 1회는 시계열 아님 | PARK: 신청 결정이 조건 |
| 06 | Wiki Cushing/SPR attention | 관심도 | Pearson +0.20은 2020-04-21 단일일 의존. 윈저·Spearman 0 근처 | KILL: 활동 측정 실패 |
| 07 | US freight TSI | 육상운송 | 월간 IS n=108, -0.12부터 -0.02까지 약함 | PARK: 거시 통제 용도만 |
| 08 | EIA jet product supplied | 연료수요 | 주간 IS n≈470, 0 근처. 039 가족 중복 | KILL: 공식 수요를 피자 대용으로 쓰지 않음 |
| 09 | SG tanker arrivals | 물량/항만 | 월별 tanker ID 미확보, 연간만 존재 | PARK: ID 확인이 조건 |
| 10 | Google mobility | 이동 | 2022-10-15 종료, COVID 국면 한정 | KILL: 시계열 사망 |

## 6. 다음에 통할 만한 것 (우선순위)

1. 사건창 설계: PortWatch 호르무즈를 방향 예측이 아니라 외생 사건(공식 OPEC 발표·실제 통과 급감 주) 전후 WTI 변동성 창으로만 쓴다. 사건 목록 사전고정이 조건.
2. 결합 게이트가 아닌 단일 반증: 061/062식 게이트는 입력 패널이 먼저다. BH 아카이브 1개 확보가 3개 게이트보다 가치 있다.
3. 관심도는 placebo와 세트로만: 새 관심도 후보는 등록 시 placebo 문서(본 헌트: Pizza)를 함께 고정한다.

## 판정과 다음 행동

- KEEP / KILL / PARK 및 이유: 본 메모는 방법론 자문(E1相当). 개별 판정은 각 후보 카드. 메모 자체는 PARK 아님, 자문 완료.
- 다음 행동 / 담당 / 재검토일: 손성찬이 본 메모의 IS 수치 6건을 summary.json과 대조 검토 / 2026-09-13.
- 다른 팀원의 검토 범위·결과: 미검토.
