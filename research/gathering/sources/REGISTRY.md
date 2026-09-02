# 출처 표

한눈에 보는 등록부입니다. 새 줄은 아래 칸을 채웁니다. 칸이 모자라면 [`_TEMPLATE.md`](_TEMPLATE.md)로 상세 장을 만들고 «상세»에 링크합니다.

라이선스·지연·look-ahead를 모르면 «모름»입니다. 추측하지 않습니다.

| 이름 | 용도 | URL | 라이선스 | 지연 | look-ahead | 인샘플 | 수집 방법 | 상세 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yahoo Finance `CL=F` | WTI 연속 선물 OHLCV | https://finance.yahoo.com/quote/CL=F | Yahoo 이용약관. 원천 parquet는 깃 금지 | 일봉, 세션 마감 후 | `auto_adjust`·계약 롤은 야후 처리. 같은 봉 미래 정보는 쓰지 않음 | 2015-01-01~ 가능 | `yfinance`만. 인베스팅 시세 스크래핑 금지 | 파이프라인 |
| Investing.com 뉴스 CSV | 원유·매크로 헤드라인 정본 | (사람이 보낸 CSV. 사이트 URL을 프로그램이 열지 않음) | 재배포 제한 가능. CSV만 저장 | 기사 시각 = `published_at` | 주말·장후 뉴스는 다음 거래일 | 시드+보낸 행이 커버하는 만큼 | **스크래핑 금지.** CSV 컬럼 `published_at,title,url,source` | 파이프라인 |
| `event_calendar.csv` | Oil Slice 시드 헤드라인 | `research/data/event_calendar.csv` | 팀 시드 | 시드 날짜 | 주말 뉴스는 다음 거래일 (Slice) | 시드 범위 | 손으로 넣은 시드 | 파이프라인 |
| FRED 매크로 | CPI·금리·BEI·달러 숫자 (서사 아님) | https://fred.stlouisfed.org | FRED 공개 | 시리즈별 발표 지연 | 발표일 전에 쓰지 않음 | 시리즈별 | `fredgraph.csv` (빌드에서 실패하면 생략) | 파이프라인 |

대안 후보(크립토·기타)는 조사 노트에서 살아남은 뒤에만 줄을 추가합니다. 없는 출처를 미리 만들지 않습니다.
