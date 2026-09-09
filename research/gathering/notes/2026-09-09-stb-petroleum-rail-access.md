# 성찬 리서치 후속 — STB 석유 철도 적재 확보

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-09 / Noah의 AI |
| 후보 ID / 카드 | [ALT-20260907-43](../../candidates/ALT-20260907-43.md) |
| 상태 | 실제 주간 수집·관측 E2 / KEEP / 가격 관계 NOT_RUN |
| 연결 출처 | [REGISTRY](../sources/REGISTRY.md)의 STB EP 724 Rail Service Data. AAR 행은 라이선스 차단 이력 |

## 왜 이 하나인가

성찬 기존 후보 세 갈래를 좁혔다. 이미 웹에 있는 수박(ALT-36)·제주(ALT-20)는 이번 전진 대상으로 다시 쓰지 않았다.

| 후보 | 이번 확인 | 선택 |
| --- | --- | --- |
| 43 AAR/STB 석유 철도 | 재개 조건이 주간 파일 경로·유종 정의. STB 통합표 GET 200으로 해소. 같은 403 반복이 아님 | 이번 실행 |
| 02 LA항 빈 컨테이너 | curl 403. 조건 변화 없이 재시도 금지 | 반복하지 않음 |
| 29 ERCOT | gridinfo 403. 동일 | 반복하지 않음 |

표시 원천은 AAR이 아니라 STB다. AAR 주간 PDF는 HEAD 200이지만 RTI/표 재생산·공개 웹 업로드가 라이선스로 막혀 숫자를 올리지 않는다.

## 활동과 원유 가설

성찬 원안은 철도 석유·석유제품 차종 적재가 원유 물류와 닿을 수 있다는 가설이다. STB가 정의한 것은 **Weekly Carloads By 22 Commodity Categories / Petroleum Products**다. 원유 unit train dwell·held 지표와 다른 행이다. EIA U.S. Crude Oil by Rail(월간 천 배럴)은 다른 측정이라 차트에 섞지 않았다. 적재량을 생산량·연료 소비량으로 치환하지 않는다.

## 확보와 한계

[실제 원본 영수증·표·그림·코드·재현](../../indexes/ALT-20260907-43/20260909T003038Z/README.md)을 정본으로 연결한다. 모든 수치는 **repo empirical only**다.

- STB 랜딩 GET 200. 통합 xlsx GET 200, 7,658,204 bytes, SHA-256 `0e103085f77052e9f03b03dcd9184a2e9db7b5e459d0a2f8d85814813b206d6f`. Last-Modified 2026-09-03 12:44:26 GMT.
- 권리: policies-and-notices GET 200. privacy-policy URL은 HTTP 404라 영수증에 실패로 남기고 403/429가 아니어서 수집을 중단하지 않았다.
- 시트 1개 Sheet1. 주간 열 493개, 헤더 2017-03-29~2026-09-02, 수요일, 간격 +7. 파일명 through 2026-09-02와 마지막 시리얼 일치.
- 미국 4사 originated 합: BNSF 2,381,801 · UP 1,434,967 · CSX 665,175 · NS 440,741 · 합 4,922,684. 영값 0, 소수 0.
- Total = Originated + Received 비교 가능 셀 불일치 0값 / 0주. 불일치 값 수와 주 수를 구별해 둘 다 0.
- CP·KCS originated 결측 67주(끝 2025-05-07). CPKC 앞 424주 비움, 2025-05-14부터 69주. 겹침 없음, 424+69=493. 산업 합계를 만들지 않은 이유.
- 공백 문자열 `' '`를 결측으로 보존한다. 파서가 처음에는 정수 검사에서 실패했고, 0으로 바꾸지 않도록 고쳤다.
- 계획 I_m 로그 전년비는 NOT_CONSTRUCTED. 주간 원단위만 그렸다.
- 입력 2024+ 140주도 읽어 SEEN이다. 미열람 OOS로 소급하지 않는다.

옛 [access-receipt.json](../../indexes/ALT-20260907-43/access-receipt.json)의 `candidate_id`는 ALT-20260907-22다. 덮어쓰지 않고 2026-09-07 AAR 랜딩 이력으로 연결한다. 같은 날 raw README도 22로 적혀 있다.

## 판정과 다음 행동

**KEEP, collection_status=COLLECTED, E1→E2.** 재개 조건이었던 주간 파일 경로와 유종 정의를 확인한 것이 이번 진전이다. KEEP은 효과 인증이 아니다.

**손성찬(사람 배정 제안), 09-15:** 각 주의 최초 공표일과 개정 여부를 복원한다. Noah는 STB 수집기와 미국 4사 관측표를 유지한다. AAR 숫자는 사이트에 올리지 않는다. 이 대조가 풀리기 전에는 새 회귀·시차 탐색을 하지 않는다.

## 검토와 완료

구현 AI가 표준 라이브러리 zip/XML 파서로 음성 검사(다른 시트·유종 누락·중복·날짜+1·소수·BNSF 공백·수식·비료 lookalike·공백 결측)와 403/429/중단 영수증을 실행했다. 실파일 SHA 재생·493주·미국 4사 합·연도 표 합은 일치했다.

독립 Reality Checker가 원본 SHA·재생 바이트 불변·원장 68/7/50/11을 재실행해 PASS로 적었다. 메인이 같은 해시와 `127.0.0.1:4173` ego-browser를 직접 확인했다. 홈·연구 `?sample=petroleum-rail`, 잘못된 sample→수박, 수박 USDA 403 aside, 제주·도일 전환, 390/320px, WTI 7기간. 운영 URL과 git/PR은 이 시각에 미실행이다. [검토 보고서](../../../docs/reviews/2026-09-09-stb-petroleum-rail-closeout.md).

**이번 한 후보 수집·로컬 관측 표시: 진행. 운영 배포·최종 지수/예측 검증: 미완료.** 사람 팀원의 동일 빈티지 인계·재현은 미검증이다.
