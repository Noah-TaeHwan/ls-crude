# 091-USGSGW — 지하수 원시 수집 (2026-09-09)

- 원천: USGS Waterservices NWIS daily values, keyless HTTPS.
- DV 파일: `https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=360339096450201&parameterCd=72019&statCd=00003&startDT=1900-01-01&endDT=2026-09-09`
  (`nwis_dv_360339096450201_72019_raw.rdb`는 바이트 그대로 응답, 481행,
  2017-06-29..2018-10-22, 결측일 없음).
- 지점 메타: `https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=360339096450201&siteOutput=expanded`
  (`nwis_site_360339096450201_raw.rdb`) → `360339096450201`
  `18N-05E-03 DDA 1 Cimarron3`, GW, 36.06092778, -96.750675,
  state 40, county 119 (Payne), HUC 11050003, 수심 25 ft, 충적층.
- DV 보유 목록: `https://waterservices.usgs.gov/nwis/site/?format=rdb&countyCd=40119&siteType=GW&hasDataTypeCd=dv&siteOutput=basic`
  (`nwis_site_payne_gw_dv_list_raw.rdb`) → Payne GW 중 DV 보유 7곳.
- 수집: 2026-09-09T21:14Z.
- 지점 선택: Cushing 지명 우물 없음(지점명은 전부 PLSS, `CUSHING`은 도엽명에만
  등장). DV 보유 7곳 중 Cushing 중심(35.9842,-96.7670) 최근접은
  `360339096450201` Cimarron3 (8.7 km). 더 가까운 우물은 DV 시계열 없음.
- 구 `gwlevels` API는 2025년 가을 폐지(301) — 후속 field-measurements API는
  본 런의 선호 경로가 아니므로 쓰지 않음. DV 일평균만 동결.
- 파싱: 탭 구분 RDB, `datetime` + 첫 `72019_00003` 값 열 + 한정자 열;
  `#` 주석·폭 행 제외. 승인코드는 제출 그대로(`A`, `A:[4]` 2건).
- 활동량·바쁨 아님, WTI와 결합 금지. 수문 교란변수만.
