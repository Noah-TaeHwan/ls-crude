# OSHA IMIS 원시 수집 노트 (2026-09-10, keyless)

**쓴 표면:** OSHA Establishment Search (IMIS ORDS, 로그인 없음) —
`https://www.osha.gov/ords/imis/establishment.search`
(`establishment.html` 폼에서 파라미터 확인: `State`, `sitezip`, `p_case`,
`p_violations_exist`, 시작/종료 월일년).

**질의:** `State=OK`, `sitezip=74023` (Cushing 우편번호), `Office=all`,
`p_case=all`, `p_violations_exist=both`, 정렬 날짜 내림차순.
서버가 한 번에 약 10년까지만 주므로 7개 창으로 나눔 (경계가 맞물리게, 겹침 없음):

| 파일 | 창 |
| --- | --- |
| `establishment_zip74023_1972-1976.html` | 1972-01-01..1976-09-07 (35건) |
| `establishment_zip74023_1976-1986.html` | 1976-09-08..1986-09-08 (28건) |
| `establishment_zip74023_1986-1996.html` | 1986-09-09..1996-09-08 (36건) |
| `establishment_zip74023_1996-2006.html` | 1996-09-09..2006-09-08 (28건) |
| `establishment_zip74023_2006-2016.html` | 2006-09-09..2016-09-08 (12건) |
| `establishment_zip74023_2016-2026_p1.html` + `_p2.html` | 2016-09-09..2026-09-09 (23건, 20+3) |

합계 162건, activity id 기준 중복 제거 후 162건(창 간 중복 0).
관측 범위 1973-04-25..2026-08-14. 질의 하한 1972-01-01(폼 최소 시작년).

**실패한 경로:** `inspectionNr.html`은 CloudFront 403, `enforcedata.dol.gov`는
`data.dol.gov` Drupal으로 리다이렉트(JS 필요). ORDS 검색이 정본.

**지리 검증:** 상세 페이지 3건 표본(`1342680.015`, `1760056.015`, `1911485.015`)의
Site Address가 모두 `Cushing, OK 74023` (mailing은 달라도 site가 기준).
지리 라벨은 정직하게 `site ZIP 74023`으로 둔다.

**벌금:** 목록에는 violations 수만 공개되고 벌금은 상세 페이지에만 있어
162건 상세를 긁지 않았으므로 freeze하지 않는다.
