# LS CRUDE — 무료 데이터 수집·검증 장부

## 공통 규칙

- 타깃은 사용자가 제공한 Yahoo `CL=F` 일봉이다.
- IS는 2015-01-01~2023-12-31, OOS는 사양 동결 뒤 2024-01-01 이후 한 번만 쓴다.
- 원본 응답·API 다운로드는 gitignored `research/gathering/raw/YYYY-MM-DD-<factor>/`에만 저장한다. 카드 폴더에는 `README.md`·`COLLECTION.md`·`sources.csv`와 결과 요약만 남긴다.
- `불가`는 실패를 숨긴 것이 아니라 개인정보·보안·라이선스·역사 부족 때문에 적법한 테스트 패널을 만들 수 없었다는 기록이다.

## 001–037 수집 상태

| # | 무료 후보 데이터 | 현재 상태 | IS/OOS 변동성 결과 또는 다음 막힘 | 원본·기록 위치 |
| ---: | --- | --- | --- | --- |
| 001 | Talabat 파트너 API | 불가 | 도시권 익명 주문 장기 집계가 공개되지 않음 | [소스](../data/factor-free-source-catalog.csv) |
| 002 | 거래소 OI | 보류 | 최근·단일 거래소뿐, 고래·MENA 귀속 불가 | 소스 카탈로그 |
| 003 | 공개 Trump 게시물 | 수집·검증 | IS `0.000`, OOS `+0.164`; 재현 통과 아님 | `gathering/raw/2026-09-03-trump-temper-probe/` |
| 004 | IEA EV API | 수집·검증 | IS `+0.157`, n=7; OOS n=2 | `gathering/raw/2026-09-03-ev-displacement-probe/` |
| 005 | SEC EDGAR | 보류 | 재무 공시가 독립 물리수요 신호가 아님 | 소스 카탈로그 |
| 006 | EIA WPSR | 보류 | 더 빠른 대체재지만 기존 물류 가설을 검증하는 고유 신호가 아님 | 소스 카탈로그 |
| 007 | UNHCR | 보류 | 강제이주는 부유층·이민법률 수요 프록시가 아님 | 소스 카탈로그 |
| 007 | Immigration NZ R1 residence decisions (Iran, 전체 유형) | 수집·설명적 기각 | 2016–2023 동년 WTI RV와 `r=-0.389`, n=8. 현재 2026 빈티지·전체 거주비자라 예측 시계열/고액자산가 이탈 프록시가 아님; OOS n=2 | `gathering/raw/2026-09-04-iran-nz-residence-probe/` |
| 007C | Queen City Law 공개 News & Views 게시물 | 수집·기각 | 전체/투자·이민 제목 월간 게시물→21일 WTI·RBOB RV. 최선 OOS는 WTI `r=-0.315, p=0.084, n=31`; IS 투자·이민 제목 n=9. 고객수요가 아닌 마케팅·정책 해설이라 알파 아님 | `gathering/raw/2026-09-04-public-desk-buzz-probe/` |
| 008 | Hyperliquid API | 보류 | 2023 이후, 역사 부족·MENA 귀속 불가 | 소스 카탈로그 |
| 009 | USD/IRR 공개 아카이브 | 수집·검증 | IS `-0.003`, OOS `-0.002` | `gathering/raw/2026-09-03-iran-fx-stress-probe/` |
| 010 | EIA 재고 | 수집·검증 | IS `-0.187`; OOS 유효 n=1 | `gathering/raw/2026-09-03-petroleum-buffer-probe/` |
| 011 | BLS Oil & Gas Extraction 고용 | 수집·검증 | IS `-0.223`, OOS `-0.047`; 원안 4성분이 아닌 단일 고용 프록시 | `gathering/raw/2026-09-03-public-series-completion-probe/` |
| 012 | CFTC COT | 보류 | 별도 pairs 전략; 계약 가격·비용 패널 미구축 | 소스 카탈로그 |
| 013 | OPEC 발표 | 보류 | 사건 라벨은 가능, 선행 텍스트 신호 아님 | 소스 카탈로그 |
| 014 | USGS 지진 | 부분 후보 | 사건 통제 가능; 파이프라인/제주 운영 신호는 아님 | 소스 카탈로그 |
| 015 | FHWA 전국 VMT | 수집·검증 | IS `+0.197`, OOS `-0.192`; 전체 VMT이며 원안 차종 미측정 | `gathering/raw/2026-09-03-public-series-completion-probe/` |
| 016 | NASA POWER | 수집·검증 | IS `-0.066`; 운영 차질 패널 없음 | `gathering/raw/2026-09-03-gulf-ac-panic-probe/` |
| 017 | IMF PortWatch | 보류 | 2019 이후·집계 해상 활동만, AIS 원시 사용 금지 | `gathering/raw/2026-09-02-portwatch/` |
| 018 | NASA FIRMS | 보류 | 열 이상은 가능; 가동률·공개시점 패널 미구축 | 소스 카탈로그 |
| 019 | 없음 | 불가 | 특정 건물·승하차 데이터는 개인정보 경계 밖 | 카드 019 |
| 020 | NASA POWER | 수집·검증 | IS `-0.066`; OOS 사양 미동결 | `gathering/raw/2026-09-03-gulf-ac-panic-probe/` |
| 021 | KAMIS | 보류 | API 키·연속 역사·빈티지 확인 전 | 카드 021 |
| 022 / 022B | Opinet·FRED / EIA·BLS·FRED CFSP 공개 대시보드 입력 | 수집·검증 / 구현 명세 등록 | 022 WTI RV: IS `-0.087`, OOS `-0.348`. 022B CFSP는 50L 비용·시간당 임금·심리의 미국 체감 대시보드이며 WTI 알파 미검정; EIA v2 경로·실제 BLS 임금·오류 정직성이 구현 전제 | `gathering/raw/2026-09-03-korea-us-fuel-spread-probe/`; [CFSP 노트](../gathering/notes/2026-09-04-cfsp-dashboard-intake.md) |
| 023 | 없음 | 불가 | 개별·실시간 AIS는 보안 경계 밖 | 카드 023 |
| 024 | 공항·도로공사 집계 | 보류 | 공개시점 포함 장기 surprise 패널 미구축 | 카드 024 |
| 025 | KNOC 월간 통계 | 보류 | true crack spread가 아닌 월간 프록시만 가능 | 카드 025 |
| 026 | 없음 | 불가 | 개인·은행 고객 FX 흐름 금지 | 카드 026 |
| 027 | 인천공항 공식 환승여객 집계 | 수집·검증·구성요소 반증 | 기본 IS `-0.332`, OOS `+0.530`; 5개 운영 구성요소도 반전/소멸 | `gathering/raw/2026-09-03-incheon-transit-surge-probe/`, `2026-09-03-rescue-diagnostics-027-042/` |
| 028 | 없음 | 불가 | 원안의 포항 S-Oil 정유소 전제가 성립하지 않음 | 카드 028 |
| 029 | 관세청 면세 집계 | 보류 | 외국인 매출이 관광·차량·디젤 소비를 식별하지 않음 | 카드 029 |
| 030 | 관세청 HS 무역통계 | 후보 | HS·국가 바스켓·공개시점 동결 후 IS 시험 가능 | 카드 030 |
| 031 | 없음 | 불가 | 주문·물류·플랫폼 판매 데이터 부적격 | 카드 031 |
| 032 | 황사 경보·KMA 기상 | 후보 | 경보 역사·운영차질 패널을 확보한 뒤 반증 가능 | 카드 032 |
| 033 | 없음 | 불가 | 이발소 고객·예약·결제 추적 없이 익명 도시권 장기 집계가 없음 | 카드 033 |
| 034 | 없음 | 불가 | 개인 외모·스타일·사진 데이터는 수집하지 않음 | 카드 034 |
| 035 | 없음 | 불가 | 식당 고객·예약·결제 추적 없이 익명 도시권 장기 집계가 없음 | 카드 035 |
| 036 | 공식 모집 집계 | 보류 | 저빈도·노동시장/예산 혼합, 공개시점 장기 패널 미확보 | 카드 036 |
| 037 | 공식 발표 | 보류 | 사건 태그만 가능, 기지 주변 감시·운영 추론은 제외 | 카드 037 |

## 후속 등록

| # | 무료 후보 데이터 | 현재 상태 | IS/OOS 변동성 결과 또는 다음 막힘 | 원본·기록 위치 |
| ---: | --- | --- | --- | --- |
| 044 | U.S. Census Data Center construction | 수집·검증 | IS `-0.181`, OOS `-0.041`; AI 구독은 미측정 | `gathering/raw/2026-09-03-ai-burn-rate-probe/` |
| 045 | SEC Starbucks Company Facts | 수집·검증 | IS `+0.512`, OOS `-0.511`; 전체 매출 프록시가 부호 반전 | `gathering/raw/2026-09-03-iced-americano-heat-index/` |
| 045 | 서울시 상권분석 커피·음료 업종 | 부분 후보 | 무료 발급키로 전체 행 집계 가능하나 2021년 이후만 제공·공개 sample 키는 5행 제한 | [045 카드](../factors/045-iced-americano-heat-index/README.md) |
| 047 | SEC Company Facts: Canada Goose·Columbia | 수집·표본 미달 | 연간 공통 YoY는 IS 3·OOS 0. Canada Goose의 구조화 분기 6-K 매출이 일관되지 않아 `r` 미보고 | `gathering/raw/2026-09-03-premium-value-outdoor-spread/` |
| 049 | GDELT 2.1 GKG / Event-Mentions | 접근성 보류 | DOC API의 2015 TimelineVolRaw 질의가 `Invalid query start date`; Event 일별 ZIP은 접근되나 키워드/제목 코퍼스가 아님. IS/OOS 미실행 | [049 카드](../factors/049-geopolitical-news-attention-shock/README.md) |
| 049 | Guardian Content API (headline only) | 수집·기각 | 단일 매체·사전 고정 4개 검색식. crisis IS/OOS RV 상관 `-0.009/+0.054`; 나머지 IS 사건일 0·0·1. Guardian 개발자 키·약관 범위에서만 재실행 | `gathering/raw/2026-09-04-guardian-keyword-probe/` |
| 049W | Wikimedia Pageviews 초크포인트 6문서 | 수집·기각 | WTI RV5 주 신호 IS/OOS `+0.023/+0.422` (n=2,096/667). OOS 지정학 레짐만 강하고 IS 0 근처 | [검정](../gathering/notes/2026-09-07-wikipedia-factor-validation.md) |
| 039·041·044 | Yahoo `RB=F`·`HO=F`·`NG=F` | 수집·타깃 재정렬 | 039→RBOB `+0.039/+0.058`; 041→RBOB `-0.190/-0.157` 재현 후보, 난방유 OOS 약화; 044→Henry Hub `+0.007/+0.051` | [에너지 체인 검정표](2026-09-04-energy-chain-target-matrix.md) |
| 049 | Guardian Content API (최초 보도·24h 후속보도) | 수집·기각 | 사전 고정 30일 고요→최초 기사→24시간 후속보도. IS seed 6일은 가속도 값이 변하지 않아 `r` 미계산·사건 RV5 0.60배; OOS seed 8일 `r=+0.199`은 선택 근거 불가 | `gathering/raw/2026-09-04-guardian-acceleration-probe/` |
| 051 | NASA FIRMS Archive + Guardian Content API | 접근성 감사·HOLD | FIRMS 역사 자료에는 탐지시각은 있으나 당시 NRT/RT 공개시각의 빈티지가 없다. Guardian 최초 게시시각과 결합하면 look-ahead를 막을 수 없어 IS/OOS 미실행 | [051 카드](../factors/051-public-confirmation-lag-index/README.md) |
| 052 | Google Trends 공개 UI | 수집 대기·HOLD | V3 명세는 7일 지연·IS 전용 PCA를 갖추었으나, 2014년 이후 다섯 키워드 통합 CSV와 역사 빈티지가 없다. 합성·PyTrends 재수집으로 숫자를 만들지 않음 | [052 카드](../factors/052-search-desperation-index/README.md) |
| 052W | Wikimedia Pageviews 생활불안 7문서 | 수집·검증·WATCH | `z_mean` → WTI RV20 IS/OOS `+0.135/+0.323`, RBOB `+0.191/+0.435` (월 101/32). breadth는 약함; 독립 복제 전 가중치 0 | [검정](../gathering/notes/2026-09-07-wikipedia-factor-validation.md) |
| 053 | 자발적 비식별 고객 문의 주간 집계 | 수집 대기·HOLD | 원문 통화·녹취·콜 ID·스니펫은 부적격. k≥10 전체/연료비 관련/불만 분류의 주간 합계, 제공시각, 요금·광고·정전 통제 없이는 검정하지 않음 | [053 카드](../factors/053-voice-of-customer-fuel-frustration/README.md) |
| 054 | Wikimedia UAP 일별 페이지뷰 + Yahoo 62개 자산 바스켓 | 수집·Meme Discovery | IS(2015-07~2023-12)에서 최고 5일 RV 상관은 BTC·GME `+0.081`. 다중 탐색으로 선택된 발견값이며 OOS는 미개봉 — 알파·유의성 주장 안 함 | [054 카드](../factors/054-uap-attention-shock/README.md); [기록](../gathering/notes/2026-09-04-uap-meme-discovery.md) |
| 055 | SEC EDGAR submissions/filing HTML + Yahoo 에너지 주식·XLE | 구현 명세 등록·HOLD | 전체 코퍼스 TF-IDF는 미래 IDF 누출. 확장 CECF stress test는 sector별 5개 미만 fixture로 `target_weight` 오류; forward window는 개선됐으나 T+1 한 달 지연·leakage 검사·CV·out-of-core 상태 단절은 남음. 실제 접수시각·동종 10-Q/10-K·walk-forward MD&A 추출과 수정 엔진 뒤 IS/OOS 실행 | [055 카드](../factors/055-filing-delta-drift/README.md); [기록](../gathering/notes/2026-09-04-filing-delta-drift-intake.md) |
| 056 | RMCI·DTDI·FEVI·HIC 제안 입력 | 소스 미확인·HOLD | 시설 보수·장비 telematics·조선 backlog·EPC capex의 공개·무료·장기·as-of 안전 입력을 확인하지 못함. 난수 테스트·임의 가중치 결과는 미보고 | [056 카드](../factors/056-heavy-industrial-maritime-infrastructure/README.md); [기록](../gathering/notes/2026-09-04-himi-factor-intake.md) |
| 057 | US HIMI Public Proxy: FRED `IPG333S` + EIA `WPULEUS3` | 수집·검증·HOLD | 동일가중 2성분 이벤트 합성은 IS `-0.177` (n=107), OOS `+0.465` (n=31)로 반전. v20 일별 진단도 RV21 IS/OOS `-0.099/+0.280`, OOS R² `-0.046`로 반전·기준선 열위; 일별 반복 표본이라 정식 결과 미대체. Machinery IP 단독 OOS `+0.712`은 IS `-0.178`과 반전·작은 표본이라 채택 금지. 원래 4성분/글로벌 HIMI가 아님 | [057 카드](../factors/057-global-heavy-industrial-maritime-infrastructure/README.md); [공개 프록시 기록](../gathering/notes/2026-09-04-himi-public-proxy-test.md); [v20 실행](../gathering/notes/2026-09-04-us-himi-public-proxy-v20-test.md); [v13 감사](../gathering/notes/2026-09-04-us-himi-public-proxy-v13-audit.md) |
| 058 | Guardian 원유 헤드라인 제목 메타데이터 | 수집·검증·HOLD | 제목 반복×최근 5신호일 기사량: IS `+0.111` (n=1,342), OOS `+0.466` (n=453). 기사량 조건부 부분상관 `+0.091/+0.061`으로 반복성 독립 효과 소멸 | [058 카드](../factors/058-headline-boredom-index/README.md); [기록](../gathering/notes/2026-09-04-headline-boredom-index-test.md) |
| 059 | ISM Manufacturing 구성요소 + Census/FRED inventory-to-sales 후보 | 소스 검증·HOLD | ISM은 다음 달 첫 영업일 10:00 ET, Census MTIS는 약 6주 지연. 제공 v22의 `inv_lag=15`·일별 forward-fill을 수정하기 전 수집·IS/OOS 실행 금지 | [059 카드](../factors/059-himi-iivf/README.md); [등록 노트](../gathering/notes/2026-09-04-himi-iivf-intake.md) |
| 060 | FRED HY OAS `BAMLH0A0HYM2` + 제공 WTI `CL=F` | 공식 수집 실패·HOLD | 2026-09-04 FRED CSV 직접 수집 2회가 전송 연결 재설정으로 실패. 제공 CODC v25의 공적분/정상성·WTI forward-fill·겹친 RV 문제도 남는다. 원시 응답 확보 뒤 IS/OOS 실행 | [060 카드](../factors/060-credit-oil-dynamic-cointegration/README.md); [수집 로그](../gathering/notes/2026-09-04-codc-collection-attempt.md) |
| 061 | 041 EIA 정유 가동률 + 060 HY OAS–WTI 괴리 | 조합 사전등록·HOLD | 평균이 아닌 저가동률 AND 절대 CODC 극단 게이트. 060 원시 응답을 얻은 뒤 MPC(주)/RBOB(보조) 5일 비중첩 RV 검정 | [061 카드](../factors/061-refinery-credit-stress-gate/README.md); [등록 노트](../gathering/notes/2026-09-04-rcsg-intake.md) |
| 062 | 059 산업 재고속도 + 060 HY OAS–WTI 괴리 | 조합 사전등록·HOLD | 두 월간 극단의 동시 게이트. 059 Census 공개시점·060 원시 응답 뒤 RBOB(주)/XLE(보조) 21일 비중첩 RV 검정 | [062 카드](../factors/062-industrial-credit-inventory-regime/README.md); [등록 노트](../gathering/notes/2026-09-04-icisr-intake.md) |
| 063 | Wikimedia 6개 음모론 문서 pageviews + Yahoo BTC-USD·GLD | 수집·IS/OOS 검정·MEME ONLY | BTC RV IS/OOS `+0.016/+0.193`이나 OOS 극단 사건 5개, IS 무관계. GLD RV `+0.161/-0.026` 반전. 가격 방향도 불안정 | [063 카드](../factors/063-conspiracy-attention-index/README.md); [검정 노트](../gathering/notes/2026-09-07-conspiracy-attention-test.md) |
| 046 | Chicago CTA 일별 탑승 합계 | 수집·검증 | IS `-0.267`, OOS `+0.005`; 도시 이동 리듬 관계 소멸 | `gathering/raw/2026-09-03-urban-taxi-tempo-probe/` |
| 042A | MTA Wall Street 역군 월별 탑승량 | 수집·검증(설명적)·구성요소 반증 | 기본 IS `+0.044`, OOS `-0.350`; 4개 구성요소도 반전/소멸. 4도시 AFHP 패널은 미구축 | `gathering/raw/2026-09-03-wall-street-district-pulse-probe/`, `2026-09-03-rescue-diagnostics-027-042/` |
| 047 | Google Trends trade-down 관심도 바스켓 | 보류 | Temu 역사 부족. 공개 UI에는 안정적 연구 API·빈티지 계약이 없어 관심도를 판매로 바꾸지 않음 | [047 카드](../factors/047-conscience-compression-index/README.md) |
| 048 | YouTube 공개 에피소드 메타데이터 | MEME / monitor only | 2020년대 시작·주간 사후 논평·썸네일 변경 가능성. 공개 문화 주석만 허용 | [048 카드](../factors/048-all-in-tie-day-index/README.md) |
| 064 | Yelp 현재 사업장/제한 리뷰·OSM 지도 이력 | 수집·기각 | 과거 예약·도착·심야 좌석은 없음. 지도 편집을 식당 수요로 대체하지 않음 | [064 카드](../factors/064-oilman-steakhouse-index/README.md); [감사](../gathering/notes/2026-09-07-pizza-style-five-factor-audit.md) |
| 065 | 현재 카페 지도·기업공시 | 수집·기각 | 심야·에너지 트레이딩 지구 소비 패널 없음. 045 Starbucks 매출 프록시는 다른 측정값이고 부호 반전 | [065 카드](../factors/065-war-room-coffee-index/README.md) |
| 066 | BTS T-100 월간 공항 시장 | 수집·기각 | 1990년부터지만 승객은 비행·객실 승무원을 제외. offshore 교대·헬기·호텔을 대체하지 않음 | [066 카드](../factors/066-crew-change-rush-index/README.md) |
| 067 | 현재 사업장 정보·검색 UI | 수집·분석 제외 | 이발 예약/고객·개인 스타일 장기 패널 없음. 사진·개인 외모 데이터 수집 금지 | [067 카드](../factors/067-oilman-haircut-index/README.md) |
| 068 | World Bank Light Every Night·NASA Black Marble | 소스 수집·HOLD | VIIRS-DNB 2012–2020 공개 COG/STAC, NASA 2012+ 일별/월별 원시 확인. 현 환경의 소형 표본 다운로드는 TLS 인증 실패; 500m 광도는 사무실 야근 미식별, 2024+ OOS도 불충족 | [068 카드](../factors/068-energy-corridor-midnight-lights/README.md); [감사](../gathering/notes/2026-09-07-pizza-style-five-factor-audit.md) |
| 069 | 소상공인365 상권분석 | 수집·기각 | 행정동 업종 매출·배달 건수 화면은 있으나 울산 산단·심야·운영 압력 장기 패널 없음 | [069 카드](../factors/069-ulsan-late-delivery-index/README.md); [감사](../gathering/notes/2026-09-07-korea-pizza-five-factor-audit.md) |
| 070 | 한국도로공사 휴게소 월별 판매 Top 5·톨게이트 차종별 통행량·국가교통DB 휴게소 진출입 조사·오피넷 경유 | 수집·HOLD / 정확 사양 미검정 | `라면 절대 판매수량 하락 AND 대형 화물차 휴게소 유입 하락 → 한국 경유`로 사양을 고정. 공개 Top 5는 순위·상품명만, 톨게이트는 휴게소 유입이 아니며 휴게소 화물차 진출입은 단발성 조사다. 수량+연속 월별 유입 패널이 없어 IS/OOS 미실행 | [070 카드](../factors/070-highway-ramyeon-index/README.md) |
| 071 | 렌터카 표준데이터 | 수집·기각 | 업체·보유차량·요금·영업시간만 제공. 실제 대여·주유·만땅 반납 미측정 | [071 카드](../factors/071-jeju-full-tank-return-index/README.md) |
| 072 | 산업단지공단 국가산단 산업동향 | 수집·기각 | 분기 업체·업종 고용은 도시락·숙박·정비 인력의 생활 흔적이 아님 | [072 카드](../factors/072-yeosu-turnaround-lunchbox-index/README.md) |
| 073 | 인천공항 항공사별 노선별 월간 운송실적 | 수집·HOLD | 운항·여객·직화물·환적화물은 제공. 면세 리스톡·새벽 활동·항공유는 별도 미측정; 장기 파일·공개일 후 재검토 | [073 카드](../factors/073-incheon-dawn-restock-index/README.md) |

## 다음 실행 순서

1. 030의 HS·국가 바스켓과 공표일을 IS 안에서 고정한다.
2. 024·025·032의 공공 집계 장기 다운로드와 실제 공표시점을 확보한다. 027은 첫 직접 검증을 완료했으나 과거 빈티지 복원이 남아 있다.
3. 각 패널은 사양 동결 후에만 OOS를 한 번 실행하고, 결과를 [공유 매트릭스](2026-09-03-factor-validation-share.md)에 갱신한다.

현재 양쪽 구간에서 `|r| ≥ 0.10`으로 재현된 팩터는 없다. 이 장부는 그 결론을 뒤집기 위한 데이터 수집 목록이지, 없는 알파를 숫자로 채우는 문서가 아니다.

001–048의 수집 가능성·명시적 미수집 사유·이번 보완 시험은 [전 팩터 무료 데이터 완결 감사](2026-09-03-full-free-data-completeness-audit.md)에 기록한다.
