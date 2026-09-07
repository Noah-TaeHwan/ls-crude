# 피자 인덱스형 신규 5개 — 무료 자료 수집·검정 적합성 감사

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-07 |
| 상태 | 064–067 기각/보존, 068 보류 |
| 가격 타깃 | Yahoo `CL=F` 미래 변동성 후보; 실제 신호가 확보된 경우에만 실행 |

## 결론

다섯 아이디어는 모두 ‘공식 발표 전 인간·운영 흔적’이라는 피자 인덱스의 형태를 갖지만, **형태와 검정 가능성은 다르다.** 064–067은 공개·장기·집계형 수요 데이터가 없었다. 068만 공개 위성 원시가 존재하지만, 현 수집 범위가 2020년까지이고 500m 광도는 사무실 야근을 식별하지 못한다. 따라서 가격·변동성 상관계수는 5개 모두 **미보고**다.

| # | 후보 | 확보한 공개 자료 | 원 가설 측정? | 2015–23 IS | 2024+ OOS | 가격 테스트 |
| ---: | --- | --- | --- | --- | --- | --- |
| 064 | Oilman Steakhouse | Yelp 현재 사업장/제한 리뷰, OSM 지도 이력 | 아니오 | 아니오 | 아니오 | 미실행 |
| 065 | War-Room Coffee | 현재 지도·카페 기업공시 | 아니오 | 아니오 | 아니오 | 미실행 |
| 066 | Crew-Change Rush | BTS T-100 월간 항공 시장 | 아니오 — 승객은 승무원·교대 인원이 아님 | 아니오 | 아니오 | 미실행 |
| 067 | Oilman Haircut | 현재 영업정보·검색 UI | 아니오 | 아니오 | 아니오 | 미실행 |
| 068 | Midnight Lights | World Bank VIIRS-DNB 2012–2020; NASA Black Marble 2012+ | 부분 — 지역 광도만 측정 | 설계 전 | 불충족 | 미실행 |

## 수집된 출처

- World Bank Light Every Night: 공개 ODbL, 2012–2020 VIIRS-DNB COG/STAC. <https://registry.opendata.aws/wb-light-every-night/>  
- NASA/NOAA VIIRS Black Marble: VNP46A2 일별·VNP46A3 월별, 15 arc-second와 품질 플래그. <https://registry.opendata.aws/nasa-suomi-npp/>  
- BTS T-100: 1990년 이후 월간 시장별 승객·화물·우편. 승객 정의상 비행·객실 승무원은 제외. <https://www.transtats.bts.gov/TableInfo.asp?QO_fu146_anzr=Nv4+Pn44vr45&V0s1_b0yB=D&gnoyr_VQ=FMF>  
- Yelp API: 현재 사업장·제한 리뷰 접근이며, 장기 보관/분석에 제약이 있다. <https://docs.developer.yelp.com/docs/faqs>  
- OpenStreetMap full history: 지도 객체의 편집 이력이지 실제 방문·예약이 아니다. <https://wiki.openstreetmap.org/wiki/Planet_History>

## 재개 우선순위

068을 먼저 살린다. 사전 고정한 세 도시의 폴리곤·비에너지 대조군·기상/휴일 통제 및 2024+ 재현 가능한 야간광을 확보하지 못하면 최종 기각한다. 064–067은 익명·권역 집계의 장기 데이터 제휴 없이는 되살리지 않는다.
