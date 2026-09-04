# 001–020 — 무료 데이터 소스 지도

아래는 **무료 또는 공개 접근 가능한 후보**다. `사용 가능`은 유가 알파가 있다는 뜻이 아니라, 적어도 적법하게 재현 가능한 입력을 만들 수 있다는 뜻이다.

| # | 무료 후보 | 역사·빈도 | 실제 측정 대상 | 판정 |
| --- | --- | --- | --- | --- |
| 001 | [Talabat Partner API](https://developer.talabat.com/api-specifications) | 인증 파트너, 주문 조회 최대 최근 60일 표기 | 자기 매장의 주문·상태 | **무료 공개 데이터 아님**; 제휴 계약 필요 |
| 002 | [Binance Futures OI API](https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest-Statistics) | 무료, 최근 30일 제한 표기 | 특정 거래소의 BTC OI | 장기 글로벌 유동성 지수로 부적합 |
| 003 | [Trump's Truth archive](https://www.trumpstruth.org/faq), [NARA Trump WH archive](https://www.archives.gov/presidential-records/research/archived-white-house-websites) | 게시물/공문, 시점별 | 공개 텍스트 | **사용 가능**; 사전 블라인드 라벨 필요 |
| 004 | [IEA Global EV API](https://api.iea.org/evs/?region=World) | 연간, 2010~ | EV 판매·보유·석유대체 | **사용 가능**, 단 저빈도·빈티지 문제 |
| 005 | [SEC EDGAR API](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | 분기/연간 | 기업 공시 | 무료지만 원안의 물리 경로가 약함 |
| 006 | [EIA WPSR/API](https://www.eia.gov/petroleum/supply/weekly/) | 주간 | 재고·제품공급·정제투입 | **사용 가능**, Cass 대체재로 더 적합 |
| 007 | [UNHCR Refugee Data API](https://www.unhcr.org/refugee-statistics/insights/explainers/forcibly-displaced-api.html) | 주로 월/연, 국가 단위 | 강제이주·망명 | 고액자산가·법률비용의 대리값이 아님 |
| 008 | [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) | 2023년 이후, 공개 | 거래소 OI·펀딩·체결 | 역사·귀속 부족. monitor only |
| 009 | [SamadiPour IRR archive](https://github.com/SamadiPour/rial-exchange-rates-archive) | 2015~ 일별 표기 | 자유시장 USD/IRR | **탐색 가능**, 당시 빈티지 불명 |
| 010 | [EIA Open Data](https://www.eia.gov/opendata/) | 주간 | 상업/SPR 재고·제품공급 | **사용 가능**, 발표 시점 정렬 필수 |
| 011 | [BLS CES](https://www.bls.gov/ces/data/), [BLS NAICS 211](https://www.bls.gov/iag/Tgs/iag211.htm) | 월간 | 미국 석유·가스 고용 | 일부만 충족; 비자·렌탈·내부승진 없음 |
| 012 | [CFTC COT](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) | 주간 | 포지셔닝 | 페어 거래의 계약별 가격·비용을 대체 못함 |
| 013 | [OPEC releases](https://www.opec.org/pr-detail/604-16-june-2026.html), 정부 보도자료 | 비정기 | 공개 기관 메시지 | 사용 가능하지만 일반 뉴스와 중복 |
| 014 | [USGS earthquake catalog](https://earthquake.usgs.gov/fdsnws/event/1/) | 실시간/역사 | 지진 사건 | 파이프라인 상태는 측정하지 않음 |
| 015 | [FHWA TMAS](https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/) | 월별·관측소별 역사 | 차량 클래스 교통량 | **사용 가능**, 브랜드·연식·유조차 화물은 알 수 없음 |
| 016 | [NASA POWER](https://power.larc.nasa.gov/docs/services/api/temporal/daily/), [NOAA dust products](https://www.ospo.noaa.gov/Products/land/hms.html) | 일별/근실시간 | 기온·에어로졸/연무 | 기상은 가능, 운영 차질은 별도 |
| 017 | [IMF PortWatch](https://portwatch.imf.org/) | 공개 대시보드·주간 공개 표기 | 집계 해상 활동 | 사용 조건·역사·발표 지연 확인 전 HOLD |
| 018 | [NASA FIRMS VIIRS](https://firms.modaps.eosdis.nasa.gov/) | 2012~·약 3시간 표기 | 열 이상/화점 | **사용 가능**, 가동률로 단정 금지 |
| 019 | 없음 | 해당 없음 | 특정 건물 승하차 추정 | 개인정보·적격성 문제로 수집 금지 |
| 020 | [NASA POWER](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) | 1981~ 일별 표기 | 격자형 기온 | **사용 가능**, 전력부하·정전은 없음 |

## 우선순위

무료로 지금 바로 원시 시계열을 만들 수 있는 것은 **004, 006/010, 011의 미국 레그, 015의 차량 클래스, 016의 기상, 018의 열 이상, 020의 기온**이다. 그러나 006·010·020은 이미 첫 탐색이 약하거나 가설과 반대였고, 004·011·015·016·018은 별도 사양 동결과 인샘플 검증이 필요하다.

001·002·007·008·009·017은 공개 접근이 일부 있더라도, 원래 주장한 신호(도시권 전체 배달량, 글로벌 고래/중동 귀속, 부자 이민수요, 장기 자금흐름, 당시 FX 빈티지, 공급선 활동)를 직접 측정하지 못한다. 이들을 무료 데이터라고 과장하지 않는다.

## 안전·컴플라이언스 경계

- 개별 고객·차량·건물·선박의 위치/행동 또는 보안 민감 시설의 실시간 운영을 수집하지 않는다.
- 제재 대상 거래소·국가귀속 추정 데이터는 사용하지 않는다.
- 발표일·API 역사 변경·개정 이력이 확인되기 전에는 과거 데이터를 실시간 신호처럼 사용하지 않는다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | 해당 없음 — 소스 지도이며 WTI 상관을 계산하지 않음 |
| 뉴스 출처 | 해당 없음 (Investing.com 스크래핑 아님) |
| 라이선스 | 행마다 다름. 제휴 API(001)는 무료 공개 아님 |
| 발표 지연 | 소스별(연간·주간·월간·비정기). 017은 확인 전 HOLD |
| look-ahead | 있음 가능 — 발표일·빈티지 없이 과거 자료를 실시간처럼 쓰면 look-ahead. 계산하지 않음 |
| 본 기간 | 시계열 미생성. 인샘플 선택 구간만 해당 |
| 아웃샘플을 봤나 | 아니오 |
| 성과 숫자 | 없음 (지어 내지 않음) |
