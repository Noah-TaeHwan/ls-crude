# 수박 원보고서 대사: 독립 검토와 전달 상태

검토 기록 시각: 2026-09-09T00:33:56.570234+00:00. 수행 AI: Main 및 별도 Agency Reality Checker (`/root/review_collection`). 사람 검토 미실행.

## 독립 검토

Reality Checker가 별도 모의 요청·ZIP/XML fixture로 검토했고 Main이 같은 명령을 직접 재실행했다.

| 범위 | 증거 | 상태 |
| --- | --- | --- |
| 첫 실패/403/429 | 요청 1회, 영수증 FAILED, 후속 요청 0 | PASS |
| 일부 성공 후 사용자 중단 | 요청 2회, 첫 파일·SHA 보존, INTERRUPTED, 세 번째 미실행 | PASS |
| 영수증 원자 교체 | 최초 빈 영수증과 매 요청 전 RUNNING, 오류/중단 종료 상태; os.replace 호출 3/5회 | PASS |
| 파일/시트/헤더/필수셀/중복/날짜/단위/빈값 | 음성 자료 거부 | PASS |
| 발견·수정 | 음수 sharedStrings, 교차 행 셀 주소, 공백 차이 중복 키를 수락하던 문제 수정 후 거부 | PASS |
| 기존 정상 원본 회귀 | SHA d223c27bdbcb610887379cb0daac1af50fb5772e2edca7399606723ad430e27b; 33339/518/409, quality 23필드·파생 CSV 해시·연간 CSV 바이트 동일 | PASS |
| 임의 지역·일부 데이터 행 누락 | 스키마만으로 원천 의미·전체 기간 완전성 보장 불가. 신규 자료 승격/검정 금지 | BLOCKED |
| 새로운 원보고서 대사 | 공식 정책 첫 요청 403, 후속 요청 중단 | BLOCKED |

독립 재현 명령: `python3 /tmp/alt36-independent-review.py`, `python3 /tmp/alt36-independent-regression.py`. 이 경로는 세션 로컬이며 공개 재현 계약이 아니다. 지속 가능한 중단·파서 회귀 체크는 `python3 research/notebooks/ALT-20260907-36/collect.py --self-test`이다. 정상 빈티지 재현에는 원본이 필요하다. 기존 원본을 복제·변경하지 않고 main 체크아웃의 보존 파일을 읽었다.

## 하네스와 소유권

Orca Run `run_b6f28129b038`, 조사 Task `task_205143f5290f`, Dispatch `ctx_e233d96413d2`는 입력 수락 `agent_prompt_stalled`로 실패했다. `worker-stop`은 alreadySettled, `worker-release`는 closed_agent_terminal/archive captured, `worker-read`는 terminal exited를 확인했다. 성공으로 세지 않았다. 그 뒤 원천 조사는 Main이 인계했고 독립 검토는 실제 native Reality Checker로 수행했다. 기존 grunt/trout/pacu/사용자 터미널은 보존했다.

GBrain recall 응답 지연으로 중단했으며 건강/최신성은 미검증. Graphify는 기존 Vault scoped query를 읽었고 현재 사실은 저장소 파일과 실행으로 재검증했다.

## 전달 검증

앱 typecheck/build/23 Node tests, 36 연구 tests, ego 로컬 모바일/데스크톱·터치/키보드, CI34296095179, PR89 병합, 운영 READY·footer3f8175d, main3종 SHA 일치를 Main이 확인했다. 상세는 아래 실행 노트에 확정했다. 이 검토 보고서는 데이터/수집기 독립 검토 완료이며 운영 독립 검토 완료 주장이 아니다.

[실행 노트와 최종 단계표](../../research/gathering/notes/2026-09-09-watermelon-source-reconciliation.md) · [실제 403 영수증](../../research/indexes/ALT-20260907-36/20260909T002929Z/README.md).

최종 일관성 검토: 별도 Reality Checker가 영수증 SHA·UTC/KST·후속 미실행·신규0·후보/원장·로컬11링크·PARTIAL 판정 일치를 재검증했다. Main도 동일 표면을 확인했다. 웹/운영은 Main 검수이며 검토자의 운영 검증으로 소급하지 않는다.
