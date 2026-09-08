# ALT-20260907-45 v2 — 공급자 전년차 대사 패널

- 정본: [v1 관측 영수증](../README.md). v2는 같은 원본 216개·같은 파싱으로 공급자 전년차 열을 파싱해 자체 차분과 대사한 것으로, v1 CSV·quality·SVG 바이트는 변경하지 않았다.
- 원본: `research/gathering/raw/ALT-20260907-45/20260908T120546Z/` (gitignored, 216 파일·SHA 전수 대조).
- 코드: `research/notebooks/ALT-20260907-45/collect.py` SHA-256 `b9961fb2ca83b0992dbf1a7bf57260f718651f3043d2c8b899d7b7ffd0ca1425`.
- 코드 변경 공개: 리뷰 전 초안 코드 `830ddf6448e265899a14464039184331620bd34c01b080f28214d8343fa207d1`에서 파서 강화(제목행 종류 검증·구간 경계 내 유일 US행·엄격 월토큰·매 시도 영수증·중단 로직)와 실행 영수증 분리로 변경됐다. CSV 내용은 동일하다(SHA-256 `4e95f4f5525616c5913738d969848749a03c8236a18d4c2cc51825fa4bb11880` 불변).
- 실행: `python3 research/notebooks/ALT-20260907-45/collect.py --self-test` 후 `--v2 --run 20260908T120546Z` (재수집 없음, 재실행冪等). 실행시각·명령·Python·코드 해시는 [execution-20260908T133517649819Z.json](execution-20260908T133517649819Z.json)에만 기록하고 quality.json에는 넣지 않는다.
- 출력: `research/data/processed/ALT-20260907-45/20260908T120546Z/v2/degree-days.csv` (gitignored).

## 계약

열: month,hdd,cdd,hdd_yoy,cdd_yoy,provider_hdd_yoy,provider_cdd_yoy. hdd·cdd는 POPULATION 구간 내 유일 US행 MONTH TOTAL(°F·day, 65°F 기준, CONUS). hdd_yoy·cdd_yoy는 원시 합계의 자체 전년차이며 첫 12개월은 빈칸. provider_*는 본문 MON DEV FROM L YR 열값 그대로이며 누락은 빈칸, 원인은 미확인이라 보정하지 않았다.

## 대사 (repo empirical only)

- 108개월·원시 합계 hdd 36,249·cdd 12,720. v1 CSV의 108 월값·192 자체차분과 전수 동일.
- 자체 vs 공급자 불일치는 20개 비교값에 걸쳐 14개월(2016-02~2021-02 범위, 대다수 2016년). 예: 2016-02 HDD 자체 -223 vs 공급자 -255. 전체 표는 [quality.json](quality.json)의 mismatches.
- 불일치 원인은 미확인이다. 추측으로 코드를 고치지 않았으며 공급자 값을 어느 쪽의 정답으로도 쓰지 않는다.

## 한계

- 월별 최초 공표일·개정 이력 미복원, 현재 빈티지로 as-of-safe가 아님. WTI 검정 NOT_RUN.
- 도일은 연료 소비량이 아니다. 표시용 사본을 만들 때는 이 파일의 output_sha256 맵과 재현 경로를 함께 남긴다.

## 감독자 최종 인계

작업자 제공자 rate_limit_exceeded 5회 반복으로 해당 실행을 중단하고 감독자가 남은 중단 요청 기록·음성 검사·SVG 각주 줄바꿈을 마쳤다. 직전 초안은 `/tmp/pacu-cpc-v2-review2/`에 보존했다. 첫 요청 중단1행·두 성공 뒤 중단3행 영수증을 확인했다. v1 재현 및 v2 두 번 재현 통과. [검토 기록](../../../../../docs/reviews/2026-09-08-degree-days-closeout.md).
