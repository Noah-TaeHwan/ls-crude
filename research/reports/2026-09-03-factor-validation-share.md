# LS CRUDE — 팩터 × 미래 WTI 변동성 상관관계 공유표

WTI 이외의 직접 에너지 타깃 검정은 이 표에 섞지 않으며, [에너지 체인 타깃 재정렬 검정표](2026-09-04-energy-chain-target-matrix.md)에 별도 기록한다.

## 공통 기준

- 가격: 사용자가 제공한 `clf-daily-2015-2026.csv`의 Yahoo `CL=F` 일봉
- 인샘플: 2015-01-02~2023-12-29 (2,262 거래일)
- 아웃샘플: 2024-01-02~2026-09-02 (672 거래일)
- 기본 타깃: 신호 공개 뒤 **다음 5거래일 실현변동성** `sqrt(Σ 다음 5개 일간 수익률²)`이다. 신호 당일 가격은 쓰지 않는다.
- 연간 004는 입력 빈도에 맞춰 다음 완전연도 실현변동성을 쓴다. 012·019·021은 타깃 자체가 부적합하거나 분석 대상이 아니다.
- `r`은 신호와 위 타깃의 Pearson 상관계수다. `0`에 가까울수록 선형 관계가 거의 없다는 뜻이다.
- `n`은 유효 관측 수이며, n이 매우 작으면 r을 계산하거나 해석하지 않는다.

## 상관 매트릭스

값은 `신호 ↔ 미래 WTI 변동성 타깃`의 Pearson 상관계수 `r`이다. `—`는 신호가 없거나 표본이 너무 작아 계산하지 않은 칸이다.

| # | 팩터 | 인샘플 r | 아웃샘플 r | IS n | OOS n | 매트릭스 판정 |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 001 | MENA Civilian Delivery | ⬜ `—` | ⬜ `—` | — | — | 익명 도시권 주문 시계열 미확보 |
| 002 | Global Crypto Liquidity Stress | ⬜ `—` | ⬜ `—` | — | — | 적법한 장기 글로벌 집계 시계열 미확보 |
| 003 | Trump Temper | 🟨 `+0.000` | 🟨 `+0.164` | 2,250 일 | 667 일 | OOS만 양수; IS 0·Truth만 사용·플랫폼 단절로 통과 불가 |
| 004 | EV Displacement | 🟨 `+0.157` | ⬜ `—` | 7 년 | 2 년 | 연간 표본이 너무 작고 OOS 계산 불가 |
| 005 | Financial Demand | ⬜ `—` | ⬜ `—` | — | — | 독립 물리 수요 신호 없음; SKIP |
| 006 | Wholesale Logistics | ⬜ `—` | ⬜ `—` | — | — | 발표 지연을 맞춘 장기 시계열 미확보; SKIP |
| 007 | MENA Elite Mobility | 🟨 `-0.389` (동년 설명적, n=8) | ⬜ `—` (n=2) | 이란 국적 전체 NZ 거주비자 승인 | — | 현재 빈티지·전체 거주비자 집계. 007C 공개 게시물 스크린도 최선 OOS `r=-0.315, p=0.084, n=31`로 비유의. 고액자산가/투자이민/사전 공개시각을 측정하지 않아 원 가설 미지지 |
| 008 | Hyperliquid Capital Flow | ⬜ `—` | ⬜ `—` | — | — | 2023 이후·귀속 불가; monitor only |
| 009 | Iran FX Stress | 🟨 `-0.003` | 🟨 `-0.002` | 4,078 FX일 | 971 FX일 | 양쪽 모두 0 근처 |
| 010 | Petroleum Buffer | 🟨 `-0.187` | ⬜ `—` | 416 주 | 1 주 | IS 부호가 가설 반대; OOS 원시 관측 부족 |
| 011 | Energy Workforce Momentum | 🟨 `-0.223` | 🟨 `-0.047` | 108 월 | 31 월 | BLS NAICS 211 고용 모멘텀 프록시. 원안 4성분은 미측정, IS 반대·OOS 소멸 |
| 012 | Energy Futures Pairs StatArb | ⬜ `—` | ⬜ `—` | — | — | 계약별 가격·비용 데이터 없음; 별도 전략 |
| 013 | Public Institutional Message Timing | ⬜ `—` | ⬜ `—` | — | — | 사전 라벨된 장기 메시지 시계열 없음 |
| 014 | Pipeline Noise | ⬜ `—` | ⬜ `—` | — | — | 파이프라인 상태를 식별하는 공개 신호 없음 |
| 015 | Luxury ICE Road Appetite | 🟨 `+0.197` | 🟨 `-0.192` | 108 월 | 31 월 | FHWA 전체 VMT 프록시. 원안 차종 미측정, OOS 부호 반전 |
| 016 | Desert Operational Stress | ⬜ `—` | ⬜ `—` | — | — | 운영 차질의 장기 집계 시계열 없음 |
| 017 | Maritime Supply Activity | ⬜ `—` | ⬜ `—` | — | — | 적법한 집계형 공급선 장기 시계열 없음 |
| 018 | Refinery Thermal & Flare | ⬜ `—` | ⬜ `—` | — | — | 공개 열 이상 원시 패널·공개시점 검증 전 |
| 019 | Robotaxi Night Traffic | ⬜ `—` | ⬜ `—` | — | — | 개인정보·데이터 적격성상 분석 제외 |
| 020 | Gulf AC Panic | 🟨 `-0.066` | ⬜ `—` | 2,257 일 | — | IS부터 관계 없음; OOS 수집·사양동결 전 |
| 021 | Kimchi Heat Index | ⬜ `—` | ⬜ `—` | — | — | KAMIS 수집 명세만 등록. 한국 식탁 물가·기후 모니터이며 WTI 타깃 미검증 |
| 022 | Korea Gas Pain Index | 🟨 `-0.087` | 🟨 `-0.348` | 95 월말 | 31 월말 | 월간 스프레드 z-score → 다음 21거래일 RV. OOS도 음수라 WTI 알파 아님 |
| 023 | Jeju Strait Watch | ⬜ `—` | ⬜ `—` | — | — | AIS 보안·선박별 추적 경계 및 017 중복으로 분석 제외 |
| 024 | Chuseok Effect | ⬜ `—` | ⬜ `—` | — | — | 달력 자체는 알려진 계절성; 공개 집계 서프라이즈 시계열 미수집 |
| 025 | Korean Refinery Margin Watch | ⬜ `—` | ⬜ `—` | — | — | 공개 마진 프록시의 정의·공개시점·장기 시계열 미확보 |
| 026 | Retail FX Surge Index | ⬜ `—` | ⬜ `—` | — | — | 개인·은행 고객 FX 데이터 경계로 분석 제외 |
| 027 | Incheon Transit Surge | 🟨 `-0.332` | 🟨 `+0.530` | 72 월 | 31 월 | 구성요소·블록 bootstrap도 반전/소멸. 최고 IS 절대이상치 `+0.370`은 사후구간 `-0.562`로 반전 |
| 028 | Pohang Refinery Idle Watch | ⬜ `—` | ⬜ `—` | — | — | 원안의 S-Oil 포항 정유소 전제가 사실과 달라 분석 제외 |
| 029 | Duty-Free Diesel Dash | ⬜ `—` | ⬜ `—` | — | — | 면세 매출로 중국 관광·물류연료를 귀속할 수 없어 027 하위 가설로 보존 |
| 030 | Instant Noodle Panic Index | ⬜ `—` | ⬜ `—` | — | — | HS·국가 바스켓·공개시점 미동결; 공개 월간 무역통계로만 향후 반증 가능 |
| 031 | Live Commerce Burn Rate | ⬜ `—` | ⬜ `—` | — | — | 스트림·주문·물류 데이터 부적격; 027 하위 가설로 보존 |
| 032 | Korea Weather & Transport Disruption | ⬜ `—` | ⬜ `—` | — | — | 황사·제주 기상 공개 경로는 있으나 운영차질 장기 시계열·WTI 경로 미검증 |
| 033 | Base-Area Barbershop Activity | ⬜ `—` | ⬜ `—` | — | — | 익명·집계 도시권 장기 서비스 수요 시계열 미확보 |
| 034 | Base-Area Buzz-Cut Mix | ⬜ `—` | ⬜ `—` | — | — | 개인 외모·스타일 데이터 경계로 분석 제외 |
| 035 | Base-Area Fine-Dining Activity | ⬜ `—` | ⬜ `—` | — | — | 익명·집계 도시권 장기 서비스 수요 시계열 미확보 |
| 036 | Public Military Recruiting Context | ⬜ `—` | ⬜ `—` | — | — | 공식 모집 통계의 장기 공개시점 패널 미확보; 저빈도 혼합 경로 |
| 037 | USFK Public Context | ⬜ `—` | ⬜ `—` | — | — | 공식 발표는 사건 태그이며 사전 라벨 장기 패널 미확보 |
| 038 | Cushing Draw Surprise | 🟨 `-0.142` | 🟨 `-0.074` | 417 주 | 137 주 | 공개 EIA 재고변화; 양쪽 모두 가설 반대 |
| 039 | U.S. Gasoline Demand Surprise | 🟨 `-0.005` | 🟨 `-0.009` | 415 주 | 137 주 | 공개 EIA product-supplied 프록시; 양쪽 모두 0 근처 |
| 040 | SPR Injection Watch | 🟨 `+0.051` | 🟨 `-0.455` | 417 주 | 137 주 | 공개 EIA SPR 변화; IS/OOS 부호 반전 |
| 041 | Refinery Utilization Proxy | 🟨 `-0.206` | 🟨 `-0.011` | 418 주 | 137 주 | 공개 EIA 전국 가동률; 특정 coker는 아님, OOS 관계 소멸 |
| 042 | Asia Financial Hub Pulse | 🟨 `+0.044` | 🟨 `-0.350` | 46 월 | 31 월 | 042A 구성요소 4개도 반전/소멸. 4도시 패널 미구축 |
| 043 | Overtime Latte Index | ⬜ `—` | ⬜ `—` | — | — | 에너지음료 소비를 단독 분리한 무료 장기 판매 패널이 없음; 무역·검색을 소비로 대체하지 않음 |
| 044 | AI Burn Rate Index | 🟨 `-0.181` | 🟨 `-0.041` | 83 월 | 29 월 | Census Data center 건설 모멘텀. IS 가설 반대, OOS 관계 소멸; AI 구독 레그 미측정 |
| 045 | Iced Americano Heat Index | 🟨 `+0.512` | 🟨 `-0.511` | 22 분기 | 12 분기 | Starbucks 최초 SEC 분기매출 YoY 프록시. 아이스 아메리카노 직접 측정 아님; OOS 부호 반전 |
| 046 | Urban Mobility Tempo | 🟨 `-0.267` | 🟨 `+0.005` | 3,287 일 | 912 일 | Chicago CTA 익명 일별 탑승량 동일요일 서프라이즈. IS 반대, OOS 소멸 |
| 047 | Premium–Value Outdoor Spread | ⬜ `—` | ⬜ `—` | 3 년 | 0 년 | Canada Goose−Columbia 연간 YoY는 무료 구조화 공통 표본이 IS 3·OOS 0. 상관계수 미보고 |
| 048 | All-In Tie Day Index | ⬜ `—` | ⬜ `—` | — | — | 공개 에피소드 복장·거시 문맥의 문화적 주석. 2020년대 시작·주간 빈도·사후 논평 한계 |
| 049 | Geopolitical News Attention Shock / 049W | 🟨 `+0.023` | 🟨 `+0.422` | 2,096 일 | 667 일 | 049W Wiki 초크포인트 `z_mean` → WTI RV5. OOS만 강하고 IS 0 근처라 기각; Guardian 결과도 미지지 |
| 051 | Public Confirmation Lag Index | ⬜ `—` | ⬜ `—` | — | — | FIRMS 역사 아카이브는 탐지시각만 제공하고 당시 NRT/RT 공개시각 빈티지를 보존하지 않음. Guardian 게시시각과 안전하게 결합 불가 — IS/OOS 미실행 |
| 052 | Search Desperation / 052W Household Panic Wiki | 🟨 `+0.135` | 🟨 `+0.323` | 101 월 | 32 월 | 7개 Wiki 생활불안 문서 `z_mean` → WTI RV20. RBOB도 `+0.191/+0.435`; 현재 표본에서만 WATCH, OOS 32개월·독립 복제 전 가중치 0 |
| 054 | UAP Attention Shock | ⬜ 별도표 | ⬜ 미개봉 | 3,037 일/자산 | — | WTI 공통 타깃이 아닌 62개 자산 Meme Discovery 스캔. 아래 별도표의 최고 IS `r=+0.081`은 다중 탐색 선택값이며 알파 아님 |
| 057 | US HIMI Public Proxy | 🟨 `-0.177` | 🟨 `+0.465` | 107 월 | 31 월 | 미국 FRED Machinery IP + EIA refinery utilization 동일가중 공개 프록시. 부호 반전이며 원안 RMCI·DTDI·FEVI·HIC는 미측정 |
| 058 | Headline Boredom Index | 🟨 `+0.111` | 🟨 `+0.466` | 1,342 일 | 453 일 | Guardian 제목 반복×최근 보도량. 기사량 통제 부분상관은 `+0.091/+0.061`로 독립 효과 소멸 |
| 059 | HIMI-IIVF | ⬜ `—` | ⬜ `—` | — | — | ISM 주문−납기 + inverse inventory/sales 월간 후보. ISM 실제 발표일·Census 약 6주 공개지연을 반영한 이벤트 패널 수집 전 |
| 060 | CODC Credit–Oil Dynamic Cointegration | ⬜ `—` | ⬜ `—` | — | — | HY OAS–WTI 괴리 후보. 2026-09-04 FRED 공식 CSV 수집 2회가 연결 재설정으로 실패; 수준 OLS 공적분·point-in-time 거래일·비중첩 RV 검정 전 |
| 061 | Refinery–Credit Stress Gate | ⬜ `—` | ⬜ `—` | — | — | 5분 quick test 미실행: 060 HY OAS 공식 FRED CSV 연결 재설정 2회, DBnomics 미러 `404`. 041 저가동률 AND 060 괴리 게이트 계산 불가 |
| 062 | Industrial Credit–Inventory Stress Regime | ⬜ `—` | ⬜ `—` | — | — | 5분 quick test 미실행: 059 실제 공개시점 패널 및 060 HY OAS가 모두 부재. 월간 동시 극단 게이트 계산 불가 |
| 063 | Conspiracy Attention Index | ⬜ 별도표 | ⬜ 별도표 | BTC 3,046 / GLD 2,098 일 | BTC 974 / GLD 667 일 | WTI 공통 타깃이 아닌 6개 Wikimedia 음모론 문서 관심도 × BTC·GLD 별도 검정. BTC OOS RV 발견값은 IS 미재현, GLD는 OOS 소멸 |
| 064 | Oilman Steakhouse Index | ⬜ `—` | ⬜ `—` | — | — | 공개 장기 예약·도착 집계가 없어 원 가설을 측정하지 못함 |
| 065 | War-Room Coffee Index | ⬜ `—` | ⬜ `—` | — | — | 심야·트레이딩 지구 커피 수요의 공개 장기 패널 없음 |
| 066 | Crew-Change Rush Index | ⬜ `—` | ⬜ `—` | — | — | BTS T-100은 승객·화물·우편이며 offshore crew change를 식별하지 않음 |
| 067 | Oilman Haircut Index | ⬜ `—` | ⬜ `—` | — | — | 개인 스타일·이발 수요를 수집하지 않아 검정 제외 |
| 068 | Energy Corridor Midnight Lights | ⬜ `—` | ⬜ `—` | — | — | 2012–2020 공개 야간광은 확인했으나 사무실 야근 미식별·2024+ OOS 불충족 |
| 069 | Ulsan Late Delivery Index | ⬜ `—` | ⬜ `—` | — | — | 공개 상권 정보는 심야·울산 산단권역 배달을 측정하지 않음 |
| 070 | Highway Ramyeon Index | ⬜ `—` | ⬜ `—` | — | — | 사양: 라면 절대 판매수량 하락 × 대형 화물차 휴게소 유입 하락 → 한국 경유. 무료자료는 Top 5 순위·톨게이트 통행량뿐이라 수량·휴게소 유입을 측정 못함; 미검정 |
| 071 | Jeju Full-Tank Return Index | ⬜ `—` | ⬜ `—` | — | — | 렌터카 보유대수는 대여·연료·반납 행동이 아님 |
| 072 | Yeosu Turnaround Lunchbox Index | ⬜ `—` | ⬜ `—` | — | — | 산단 구조 통계는 도시락·숙박·정비 인력을 측정하지 않음 |
| 073 | Incheon Dawn Restock Index | ⬜ `—` | ⬜ `—` | — | — | 월간 항공화물은 공개되나 면세 리스톡·새벽 활동을 측정하지 않음 |
| 077 | Korea Pump Pass-Through & Station Freeze | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 등록. Opinet 지역 일평균 가격 후보는 확인했지만 역사·개별 주유소·실제 공표시점 패널 미수집; WTI/변동성 검정 전 |
| 078 | Korea Freight & Port Fuel Pulse | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 등록. 도로공사 차종별 통행·해수부 항만 집계 후보는 확인했지만 정의·장기 공개일 패널 미수집 |
| 079 | Korea Naphtha Export Thermometer | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 등록. 관세청 월간 HS 무역 후보; HS 바스켓·공표일·개정 이력 미고정 |
| 080 | Korea Fuel-Switch Dispatch Alert | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 등록. KPX 연료별 발전량 공개 후보는 있으나 연속 역사·연료분류·공표일 미감사 |
| 081 | Korea LPG Substitution Pulse | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 등록. 상대가격 후보만 있고 실제 차량 연료대체·소비 장기 패널 미확보 |
| 082 | Korea Kitchen Oil Stress / Palm–WTI Cointegration | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 등록. 팜유–WTI Engle–Granger·잔차 평균회귀 후보; 한국 소매 식용유·USD/KRW·원료 역사/공개일 패널 및 IS/OOS 미검정 |
| 083 | Iced Americano Pass-Through | ⬜ `—` | ⬜ `—` | — | — | 2026-09-07 적격성 검정. 커피(외식) CPI→USD/KRW·한국 3년물·식품/급식 상대수익률 3사양은 공식 월별 원표·최초 공표일 패널 부재로 미검정 |
| 084 | Trailhead Tailgate Index | ⬜ 별도표 | ⬜ 별도표 | RBOB 108 월 | RBOB 23 월 | WTI 공통 타깃이 아닌 NPS 14개 드라이브형 공원 방문 YoY z-score × 다음 21거래일 RBOB 검정. 수익률 `-0.127/+0.186` 부호 반전, RV `-0.037/-0.282`은 IS 부재·작은 OOS로 기각 |

**범례**: 🟩 `|r| ≥ 0.10`이며 IS·OOS 모두 같은 방향으로 재현 / 🟨 계산됐지만 `|r| < 0.10` 또는 재현 실패 / ⬜ 계산 불가. 현재 🟩은 **0개**다.

## 054 별도 Meme Discovery 상관 매트릭스 — UAP 관심도 × 자산 변동성

054는 WTI를 타깃으로 하지 않았다. 영문 위키백과 `Unidentified_flying_object` 일별 페이지뷰의 90일 z-score와 **각 자산 다음 5거래일 실현변동성**을 비교한 별도 탐색이다. 신호는 당일 최종 조회수를 알 수 없다고 보고 다음 달력일부터 사용했다. 기간은 2015-07-01~2023-12-22이며, OOS는 아직 열지 않았다.

| 054 순위 | 자산 | IS n | UAP 관심도 → 다음 5일 실현변동성 r | UAP 관심도 → 다음 5일 수익률 r | 판정 |
| ---: | --- | ---: | ---: | ---: | --- |
| 1= | BTC-USD | 3,037 | 🟨 `+0.081` | `-0.032` | GME와 동률 최고. 62개 중 최대값을 사후 선택했으므로 밈 발견값일 뿐 |
| 1= | GME | 3,037 | 🟨 `+0.081` | `+0.012` | BTC와 동률 최고. 방향성 없음 |
| 2 | ETH-USD | 3,037 | 🟨 `+0.073` | `-0.023` | 약한 탐색값 |
| 3 | RIOT | 3,037 | 🟨 `+0.061` | `-0.004` | 약한 탐색값 |
| 4 | UNG | 3,037 | 🟨 `+0.060` | `+0.015` | 천연가스 ETF이나 방향·OOS 근거 없음 |
| 5 | URA | 3,037 | 🟨 `-0.052` | `-0.002` | 약한 탐색값 |
| 6= | ACHR | 3,037 | 🟨 `+0.051` | `+0.063` | 약한 탐색값 |
| 6= | USO | 3,037 | 🟨 `+0.051` | `-0.035` | 원유 ETF에도 유의한 관계 없음 |
| 7 | AMC | 3,037 | 🟨 `+0.046` | `+0.067` | 약한 탐색값 |
| 8 | ARM | 3,037 | 🟨 `+0.045` | `-0.068` | 약한 탐색값 |

**054 결론**: 기계적으로 `0.01` 이상인 값은 다수지만, 최고 `r=+0.081`은 0.10 기준에 못 미치며 62개 동시 탐색의 선택편향을 갖는다. 따라서 **검증된 상관·거래 신호·OOS 통과가 아니다**. 콘텐츠용 밈 문구만 “When UFO attention spikes, Bitcoin and GME get weird.”로 보존한다.

## 063 별도 Meme Monitor 매트릭스 — 음모론 관심도 × Bitcoin·금

063은 6개 영문 Wikipedia 문서의 90일 z-score 평균을 사용한 사전 고정 관심도 바스켓이다. 일별 조회수는 다음 달력일부터 사용하고, 같은 시장일 중복은 제거했다. 극단 사건은 `z≥2` 최초 진입 뒤 5거래일 간격만 남겼다.

| 자산·타깃 | IS r | OOS r | IS / OOS 극단 사건 | 판정 |
| --- | ---: | ---: | --- | --- |
| BTC-USD 다음 5일 RV | `+0.016`, n=3,046 | `+0.193`, n=974 | 18 / 5 | OOS 후반 발견값이나 IS 0 근처·사건 5개. **MEME ONLY** |
| BTC-USD 다음 5일 수익률 | `+0.009` | `+0.049` | 18 / 5 | 방향성 없음 |
| GLD 다음 5일 RV | `+0.161`, n=2,098 | `-0.026`, n=667 | 16 / 5 | OOS 소멸·부호 반전 |
| GLD 다음 5일 수익률 | `+0.044` | `+0.110` | 16 / 5 | 방향성 없음 |

**063 결론**: “음모론 관심이 올라가면 Bitcoin이 이상해질 수 있다”는 콘텐츠용 경보는 가능하지만, 투자 알파·금 안전자산 신호·가격 방향 예측은 아니다. 상세 방법과 사건 permutation은 [063 검정 노트](../gathering/notes/2026-09-07-conspiracy-attention-test.md)에 기록했다.

## 계산된 행만의 세부 상관관계 및 재현성 표

| 팩터 | 신호 → 타깃 | 인샘플 | 아웃샘플 | 팀 공유용 판정 |
| --- | --- | --- | --- | --- |
| 003 Trump Temper | 고정 엄격 Truth 이벤트 여부 → 다음 5일 실현변동성 | r=**+0.000**, n=2,250; 이벤트 n=27, 사건−전체 **+0.005%p** | r=**+0.164**, n=667; 이벤트 n=117, 사건−전체 **+1.091%p** | OOS만으로 규칙을 고르면 안 된다. IS 0·Truth 단독·플랫폼 단절 때문에 통과 아님. |
| 004 EV Displacement | IEA 연간 석유대체량 → 다음 완전연도 실현변동성 | r=**+0.157**, n=7 | n=2 → r 계산 불가 | 연간 표본이 너무 작고 빈티지 미확인. |
| 009 Iran FX Stress | 일간 USD/IRR 변화율 → 다음 5일 실현변동성 | r=**-0.003**, n=4,078; 절하 >=2% 사건 차이 **-0.323%p** | r=**-0.002**, n=971; 사건 차이 **+0.681%p** | 연속 상관은 양쪽 모두 0 근처. 사건 차이도 부호 반전. |
| 010 Petroleum Buffer | EIA 총 완충재고 tightness z-score → 다음 5일 실현변동성 | r=**-0.187**, n=416; tight−전체 **-0.552%p** | n=1 → r 계산 불가 | IS가 ‘낮은 완충→높은 변동성’과 반대. |
| 011 Energy Workforce Momentum | BLS NAICS 211 고용 전월변화 z-score → 다음 21일 실현변동성 | r=**-0.223**, n=108 | r=**-0.047**, n=31 | 미국 고용 단일 프록시. 원안 채용·장비·비자·내부이동 지수는 아님. |
| 015 Luxury ICE Road Appetite | FHWA 전체 VMT 전월변화 z-score → 다음 21일 실현변동성 | r=**+0.197**, n=108 | r=**-0.192**, n=31 | 전체 주행거리일 뿐 원안 차종·연식·화물은 미측정. OOS 부호 반전. |
| 020 Gulf AC Panic | 걸프 4개 도시 계절조정 고온 이상 → 다음 5일 실현변동성 | r=**-0.066**, n=2,257; 상위 5%−전체 **+0.172%p** | OOS 미실행 | 연속 관계가 반대이며 하위 5%에서 더 높은 변동성. |
| 022 Korea Gas Pain Index | 12개월 Korea–US 소매 휘발유 스프레드 z-score → 다음 21일 실현변동성 | r=**-0.087**, n=95; z≥+1 월−전체 **+0.233%p**, n=17 | r=**-0.348**, n=31 | OOS도 음수. 환율 전가 대시보드로는 유효하나 변동성 선행성은 미입증. |
| 027 Incheon Transit Surge | 공식 환승여객 YoY 변화 36개월 z-score → 다음 21거래일 RV | r=**-0.332**, n=72 | r=**+0.530**, n=31 | OOS만 보면 강해 보이지만 IS와 부호가 반전했다. 중국 국적·환승 추정이 아닌 공식 환승여객 집계만 사용했다. |
| 027 추가 반증 | 환승여객 절대 이상치·항공편·화물·편당 승객 → 다음 21거래일 RV | 최고 IS: 절대 이상치 r=**+0.370**, bootstrap 95% `+0.078..+0.575`; 항공편 r=**-0.439** | 절대 이상치 **-0.562**, 항공편 **-0.057** | 5개 구성요소의 사후 탐색. 최고 IS 사양도 반전, 항공편은 소멸. 새 OOS 검증이 아니다. |
| 038 Cushing Draw Surprise | Cushing 주간 재고변화 z-score의 음수 → 다음 5일 실현변동성 | r=**-0.142**, n=417 | r=**-0.074**, n=137 | 가설 반대. 컨센서스 surprise가 아닌 공개 재고변화 프록시다. |
| 039 U.S. Gasoline Demand Surprise | finished gasoline product supplied의 자체 4주 평균 대비 z-score → 다음 5일 실현변동성 | r=**-0.005**, n=415 | r=**-0.009**, n=137 | 양쪽 0 근처. 단순 수요 변동은 변동성 알파가 아니다. |
| 040 SPR Injection Watch | SPR 주간 순증가 z-score → 다음 5일 실현변동성 | r=**+0.051**, n=417 | r=**-0.455**, n=137 | OOS 절대값은 커도 IS와 부호 반전: 통과 아님. |
| 041 Refinery Utilization Proxy | 전국 정유 설비 가동률 z-score → 다음 5일 실현변동성 | r=**-0.206**, n=418 | r=**-0.011**, n=137 | 특정 Gulf coker 원안의 프록시일 뿐이며 OOS에서 소멸. |
| 074 Refinery Multi-Block Composite | 041 운영 + EIA 휘발유 순수출 + CFTC RBOB 포지션 + RBOB–WTI 크랙 → 다음 5일 MPC RV | r=**-0.006**, n=416 | r=**+0.197**, n=139; HAC p=`.2190` | 동가중 4블록 결합의 IS가 0. OOS 상관만으로는 채택 불가이며 상위 20% 사건 검정도 p=`.2294`. |
| 075 Academic Liquidity Calendar | 여름·연말 달력 더미 → 다음 5일 RV | WTI 여름/연말 HAC q=`.1775/.1775`, n=2,262 | WTI 여름/연말 q=`.8147/.1647`, n=668 | 학사 일정이 아니라 일반 계절성의 반증. RBOB 연말 OOS q=`.0462`는 IS q=`.1775`로 재현 실패. |
| 076 Hidden Hydrocarbon Exposure Screen | 11개 소비기업 섹터중립 잔차·RV20 → 다음 5일 WTI/RBOB/MPC RV | HHE RV20→RBOB HAC p/q=`.0212/.1272`, n=2,173 | `p/q=.6578/.7894`, n=627 | WTI는 양 구간 미통과. 단순 RV 상관은 변동성 군집이며 타깃 RV 통제 뒤·OOS에서 소멸. |
| 042A Wall Street District Pulse | 공식 MTA 역군 월별 탑승 YoY 36개월 z-score → 다음 21거래일 RV | r=**+0.044**, n=46 | r=**-0.350**, n=31 | 4도시 AFHP가 아닌 단일도시 설명적 시험. 과거 release vintage가 없어 관측월 말+45일 보수적 지연을 사용했고, 부호 반전으로 기각. |
| 042A 추가 반증 | 역군 출입·환승·환승비중 구성요소 → 다음 21거래일 RV | -0.123~+0.044, n=46 | +0.029~+0.350, n=31 | 4개 구성요소 중 IS·사후구간 모두 통과한 것은 0개. 단일도시 프로브를 살릴 근거 없음. |
| 044 AI Burn Rate Index | Census data-center 건설지출 전월변화 z-score → 다음 21일 실현변동성 | r=**-0.181**, n=83 | r=**-0.041**, n=29 | 물리 buildout만 측정. 구독률이 아니며, IS 반대·OOS 관계 소멸. |
| 045 Iced Americano Heat Index | Starbucks 최초 SEC 분기매출 YoY → 다음 21일 실현변동성 | r=**+0.512**, n=22 | r=**-0.511**, n=12 | 대표 카페 체인 전체 매출 프록시일 뿐. 부호 반전이라 채택 불가. |
| 046 Urban Mobility Tempo | CTA 일별 총 탑승 동일요일 z-score → 다음 5일 실현변동성 | r=**-0.267**, n=3,287 | r=**+0.005**, n=912 | 택시·버스·플랫폼·도보 마찰 원안의 익명 집계판. OOS 소멸. |
| 054 UAP Attention Shock | `Unidentified_flying_object` 페이지뷰 z90 → 62개 자산의 다음 5일 RV | 최고 BTC·GME r=**+0.081**, 각 n=3,037 | **미개봉** | WTI 표와 다른 비-WTI 광역 스캔. 최고값 사후 선택·0.10 미만으로 밈 기록만 허용. |
| 057 US HIMI Public Proxy | FRED Machinery IP·EIA 정유가동률의 직전값 z-score 동일가중 → 다음 21거래일 RV | r=**-0.177**, n=107 | r=**+0.465**, n=31 | v7 수정 규칙으로 실제 원천 재실행해도 동일. v13은 FRED 월간 z만 native-frequency로 개선했고 EIA 일별 복제가 남음. 부호 반전으로 기각; 원래 글로벌 4성분 HIMI도 아님. |
| 057 v20 일별 진단 | native-frequency EIA·FRED z를 일별 정렬 → 5/21/63일 RV | 21일 r=**-0.099**, HAC t=-1.493, n=2,240 | 21일 r=**+0.280**, HAC t=+4.295, n=651; OOS R²=-0.046 | 부호 반전·음수 OOS R². 일별 2,240행은 factor 상태 559개를 반복하고, HAC lag 7은 RV21 겹침에 불충분. 정식 결과 아님. |
| 058 Headline Boredom Index | Guardian 원유 제목 반복비율×최근 5신호일 기사량 → 다음 5거래일 RV | r=**+0.111**, n=1,342 | r=**+0.466**, n=453 | 기사량 통제 뒤 `+0.091/+0.061`. 반복성 자체가 아니라 보도량·긴장 레짐에 얽힌 결과라 독립 팩터로 기각. |

## 데이터 준비 상태

| 상태 | 팩터 | 의미 |
| --- | --- | --- |
| 원시 신호 저장·재실행 가능 | 003, 004, 009–011, 015, 022, 027, 038–041, 044–046 | `gathering/raw/`에 원본·스크립트 보관. 원본 덤프는 GitHub에 재배포하지 않음. 027은 2026-09-03 공식 인천공항 환승여객으로 실제 IS/OOS 실행했다. |
| 부분 저장 | 020 | 공식 NASA 재질의로 IS만 재계산했다. 원시 기온 응답은 미보관. |
| 무료 소스만 등록 | 001–002, 005–008, 012–014, 016–018, 021, 024–025, 030, 032, 036–037, 042–043 | 무료 접근 경로는 있으나, 가격과 짝지을 적법한 장기 신호 시계열이 아직 없음. 021은 WTI 검증이 아니라 한국 식품가격 모니터용으로만 보류한다. |
| 원시 신호 저장·IS/OOS 재실행 가능 | 022 | Opinet·FRED의 공식 집계 원본과 계산 패널은 gitignored 경로에 보관. 현재 빈티지 한계는 남지만, 고정 산식으로 OOS를 한 번 실행했다. |
| 원시 신호 저장·Meme Discovery만 실행 | 054 | Wikimedia UAP 페이지뷰·Yahoo 62개 자산 패널·순위·코드는 gitignored `gathering/raw/2026-09-04-uap-meme-discovery/`에 보관. OOS는 의도적으로 미개봉. |
| 원시 신호 저장·IS/OOS 재실행 가능 | 057 | FRED Machinery IP·EIA 정유 가동률 원시 응답과 보수적 공개시점 패널은 gitignored `gathering/raw/2026-09-04-himi-public-proxy/`에 보관. 원안 4성분 데이터는 미확보. |
| 원시 신호 저장·IS/OOS 재실행 가능 | 058 | Guardian 제목 메타데이터 3,559개·계산 패널·재현 스크립트는 gitignored `gathering/raw/2026-09-04-headline-boredom-probe/`에 보관. 현재 아카이브의 역사 빈티지는 미복원. |
| 분석 제외·하위 보존 | 019, 023, 026, 028–029, 031 | 개인정보·AIS 보안·데이터 적격성·원안 전제 오류 또는 기존 팩터와의 중복. |

## 결론

현재 검증 가능한 어느 팩터도 인샘플과 아웃샘플에서 안정된 **미래 WTI 변동성** 상관을 보이지 않았다. 다음 단계는 가중치 결합이 아니라, 부족한 신호 시계열의 역사·공개시점·라이선스를 먼저 확보하는 일이다.
