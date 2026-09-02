# 출처 표

한눈에 보는 등록부입니다. 새 줄은 아래 칸을 채웁니다. 칸이 모자라면 [`_TEMPLATE.md`](_TEMPLATE.md)로 상세 장을 만들고 «상세»에 링크합니다.

라이선스·지연·look-ahead를 모르면 «모름»입니다. 추측하지 않습니다.

| 이름 | 용도 | URL | 라이선스 | 지연 | look-ahead | 인샘플 | 수집 방법 | 상세 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yahoo Finance `CL=F` | WTI 연속 선물 OHLCV | https://finance.yahoo.com/quote/CL=F | Yahoo 이용약관. 원천 parquet는 깃 금지 | 일봉, 세션 마감 후 | `auto_adjust`·계약 롤은 야후 처리. 같은 봉 미래 정보는 쓰지 않음 | 2015-01-01~ 가능 | `yfinance`만. 인베스팅 시세 스크래핑 금지 | 파이프라인 |
| Investing.com 뉴스 CSV | 원유·매크로 헤드라인 정본 | (사람이 보낸 CSV. 사이트 URL을 프로그램이 열지 않음) | 재배포 제한 가능. CSV만 저장 | 기사 시각 = `published_at` | 주말·장후 뉴스는 다음 거래일 | 시드+보낸 행이 커버하는 만큼 | **스크래핑 금지.** CSV 컬럼 `published_at,title,url,source` | 파이프라인 |
| `event_calendar.csv` | Oil Slice 시드 헤드라인 | `research/data/event_calendar.csv` | 팀 시드 | 시드 날짜 | 주말 뉴스는 다음 거래일 (Slice) | 시드 범위 | 손으로 넣은 시드 | 파이프라인 |
| FRED 매크로 | CPI·금리·BEI·달러 숫자 (서사 아님) | https://fred.stlouisfed.org | FRED 공개 | 시리즈별 발표 지연 | 발표일 전에 쓰지 않음 | 시리즈별 | `fredgraph.csv` (빌드에서 실패하면 생략) | 파이프라인 |
| IMF PortWatch (Hormuz `chokepoint6`) | 호르무즈 일별 통과 척수. 조사 중. 후보 표에는 안 넣음 | https://portwatch.imf.org/ | © IMF All Rights Reserved. 인용: Kpler; UNGP; IMF PortWatch. 상업 재배포는 copyright@imf.org. 약관 전문은 이 환경에서 미확인 | 매주 화 09:00 ET. 일 단위 2–9일은 공식 FAQ 없음(팀 채팅) | 있음. 통과일이 아니라 발표 시점으로 시프트 | 공개 API 2019-01-01~. 2015–2018 없음 | 공식 사이트·ArcGIS REST. 인베스팅 스크래핑 없음 | [노트](../notes/2026-09-02-hormuz-portwatch.md) |
| AIS going-dark (고정 해역, 보류) | 보류. 2026 going-dark는 제재 플래그로 쓰지 않음 | 공개 2015 시계열 URL 모름 | 모름 | 모름 | 모름 | 2015부터 공개 시계열 확인 못함. 팀원 iran whale tracker는 AIS가 아님 | 수집 안 함. 인베스팅 스크래핑 없음 | [노트](../notes/2026-09-02-ais-dark-hold.md) |
| US Treasury OFAC (Operation Economic Outcast, 보류) | 보류. 희귀 지정. 일별 walk-forward 피처 아님 | https://home.treasury.gov/news/press-releases/sb0613 | 미국 정부 보도자료(공개). Chainalysis 블로그는 별도 약관 | 부정기 지정 (2026-08-24 패키지) | 있음. 발표 전에 지정 사실을 쓰지 않음 | 문서화된 Obukhov 결제는 2023~. 2015–2023 일별 시계열 아님 | 보도자료만. 인베스팅 스크래핑 없음 | [노트](../notes/2026-09-02-usdt-ofac-hold.md) |
| NZ Active Investor Plus (AIP) | Elite Haven 후보의 고액 투자 거주권 수요. 보류 | https://www.mbie.govt.nz/business-and-employment/economic-growth/going-for-growth/promoting-global-trade-and-investment | 정부 웹 자료. 통계 재사용 조건·다운로드 라이선스는 모름 | 공개 빈도·발표일 모름 | 있음. 발표시점 이후만 사용 | 역사 시계열 확보 전. 인샘플 사용 가능 여부 모름 | 정부 공개 자료만. 인베스팅 스크래핑 없음 | [노트](../notes/2026-09-02-elite-haven-hold.md) |
| NZ overseas residential investment rules | Elite Haven 후보의 규제 교란요인 | https://www.linz.govt.nz/guidance/overseas-investment/apply-consent-variation-or-exemption/application-forms-and-information-sheets/exemptions-need-consent/discretionary-exemptions | 정부 안내 자료. 재사용 조건은 모름 | 규정·예외 변경 시점 | 있음. 시행·공개일 이전에 쓰지 않음 | 정책 더미로만 검토 | 정부 공개 자료만. 인베스팅 스크래핑 없음 | [노트](../notes/2026-09-02-elite-haven-hold.md) |
| IEA Oil Stocks of IEA Countries | Official Petroleum Buffer 후보의 공개 재고 완충여력 | https://www.iea.org/data-and-statistics/data-tools/oil-stocks-of-iea-countries | CC BY 4.0 (도구 표기). 원자료·세부 다운로드 조건은 확인 필요 | 월간. 정확한 발표일·개정 정책은 확인 필요 | 있음. 관측 기준일이 아닌 발표일 이후만 사용 | 역사 시계열·발표일 확인 전 | IEA 공식 도구만. 인베스팅 스크래핑 없음 | [노트](../notes/2026-09-02-official-petroleum-buffer-hold.md) |
| IMF IRFCL / COFER | 중앙은행 준비자산과 석유 비축을 구분하는 범위 확인 | https://data.imf.org/en/Datasets/IRFCL | IMF 데이터 포털. 재사용 조건은 확인 필요 | IRFCL: 국가별 공개 빈도 상이; COFER: 분기 | 있음. 발표일 이후만 사용 | 이 팩터에는 직접 사용 안 함 | IMF 공식 자료만 | [노트](../notes/2026-09-02-official-petroleum-buffer-hold.md) |
| US BLS Oil and Gas Extraction | Energy Workforce 후보의 미국 업종별 고용·임금·근로시간 | https://www.bls.gov/iag/Tgs/iag211.htm | 미국 정부 공개 통계. 세부 재사용 조건 확인 필요 | 월간/분기 시리즈 혼재 | 있음. 발표일 이후만 사용 | 역사 시계열·개정 이력 확인 전 | BLS 공식 자료만. 구인사이트 스크래핑 없음 | [노트](../notes/2026-09-02-energy-workforce-momentum-hold.md) |
| Statistics Canada oil and gas labour | Energy Workforce 후보의 캐나다 업종별 공석·고용 | https://www150.statcan.gc.ca/n1/daily-quotidien/260827/dq260827b-eng.htm | 캐나다 정부 공개 통계. 세부 재사용 조건 확인 필요 | 월간/분기 시리즈 혼재 | 있음. 발표일 이후만 사용 | 역사 시계열·개정 이력 확인 전 | Statistics Canada 공식 자료만. 구인사이트 스크래핑 없음 | [노트](../notes/2026-09-02-energy-workforce-momentum-hold.md) |

조사 노트에 적힌 출처만 추가합니다. 보류도 한 줄로 남깁니다. 없는 출처를 미리 만들지 않습니다.
