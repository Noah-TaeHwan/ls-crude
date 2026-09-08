# ALT-20260908-01 — raw receipt — 20260908T022411Z

## 수집 범위

공개 Wikimedia Pageviews REST API의 작은 접근·단위 확인 샘플이다. 이는 장기 052W 산식 전체나 쿠싱 운영 활동을 뜻하지 않는다. 원본 JSON은 이 폴더에만 보관되고 Git에는 이 영수증만 추적된다.

| 파일 | URL | SHA-256 | 크기 | 행/기간 |
| --- | --- | --- | ---: | --- |
| `wikimedia_recession_20230901_20230907.json` | `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Recession/daily/20230901/20230907` | `be96f5c389294246951cf0816276485f8e538dc32257f482e963aec42b7b8068` | 1,026 bytes | `items` 7개, 2023-09-01~07 UTC |
| `wikimedia_cushing_oklahoma_20230901_20230907.json` | `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Cushing,_Oklahoma/daily/20230901/20230907` | `063a687caf0cc0936a50b0977778bb35ac524061bb8e78e8cc4328d2e7c2f138` | 1,075 bytes | `items` 7개, 2023-09-01~07 UTC |

## 시점·절차

- 수집시각: 2026-09-08 02:24~02:25 UTC (11:24~11:25 KST)
- 관측시각: 응답의 일별 UTC `timestamp`; 실제 쿠싱 시설 활동 시각이 아니다.
- 공개시각: 현재 API 응답만 확인했다. 역사 당시의 완결·수정 빈티지는 복원하지 않았다.
- 실제 명령: `curl.exe --fail --silent --show-error --user-agent "ls-crude-research/1.0 (research@example.invalid)" --output <파일명> <위 URL>`
- 해시: Windows `Get-FileHash -Algorithm SHA256`으로 수집 직후 계산했다.

## 접근·권한·재취득

- 제공자: Wikimedia Pageviews REST API. 집계된 페이지뷰만 다루며 개인·계정·위치·결제 정보를 요청하지 않았다.
- 약관/문서: https://foundation.wikimedia.org/wiki/Terms_of_Use/en ; https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews (2026-09-08 KST 확인).
- 재취득: 동일 URL을 동일한 식별 User-Agent로 한 번 GET한다. 접근이 실패하면 제공자 제한을 우회하거나 반복 요청하지 않는다.
- GitHub 전달: JSON 원문은 `research/gathering/raw/**` 규칙상 gitignored이다. 이 README의 URL·해시·크기·범위만 커밋한다.
