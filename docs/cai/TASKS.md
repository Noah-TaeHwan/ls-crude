# 작업표 (파생 뷰)

정본은 [tasks.json](tasks.json)이다. 본 문서는 사람이 읽는 파생 표이며,
JSON과 별도로 상태를 관리하지 않는다. READY·DOING·BLOCKED는 별도 집계한다.

<!-- counts: total=14 REVIEW=2 DONE=9 DOING=0 TODO=3 BLOCKED=0 READY=0 -->

- 총 작업 14 · 결과 제출 11 (DATA-01·OPS-01 REVIEW, 나머지 DONE)
- REVIEW 2 · DONE 9 · DOING 0 · BLOCKED 0 · 예정(TODO) 3 (UI-06·QA-02·REL-01) — M1(UI-05) 달성
- 로컬 M1 사전검수(2026-09-11): 5173 프리뷰 + 독립 리뷰 REVISION 1건(P1)·P2 3건 수정 후 재검증. QA-02의 local_precheck에 기록(상태는 TODO 유지)

| 작업 ID | 상태 | 남은 조건 | 증거 | 다음 행동 |
|---|---|---|---|---|
| BOOT-01 | DONE | 목적 범위 완료(설치 재현 기록 부채는 유지) | runs/BOOT-01/20260911T025319Z/RESULT.md | 완료 |
| DATA-01 | REVIEW | TOP3 보류 확정(자동 재개 안 함) | runs/DATA-01/20260911T030713Z/RESULT.md, R1 | 후속 UI 카드 진행 중 |
| OPS-01 | REVIEW | 원인 해소(대시보드) | runs/OPS-01/20260911T033847Z/RESULT.md·COMMANDS.md | REL-01 조건 재확인 |
| REP-01 | DONE | 없음(문서 세팅 완료) | runs/REP-01/20260911T042017Z/RESULT.md | UI-05 후속 진행 |
| UI-05.S1a | DONE | 검토 완료(SELF_CHECK) | runs/UI-05.S1a/20260911T060500Z/RESULT.md | 완료 |
| UI-05.S1b | DONE | 검토 완료(SELF_CHECK, URL_COMPAT) | runs/UI-05.S1b/20260911T064500Z/RESULT.md | 완료 |
| UI-05.S2a | DONE | 검토 완료(PASS) | runs/UI-05.S2a/20260911T043814Z/RESULT.md, R1, R2 | 완료 |
| UI-05.S2b | DONE | 검토 완료(SELF_CHECK, 통합은 S2c) | runs/UI-05.S2b/20260911T055200Z/RESULT.md | 완료 |
| UI-05.S2c | DONE | 검토 완료(SELF_CHECK) | runs/UI-05.S2c/20260911T070000Z/RESULT.md | 완료 |
| UI-05.S3a | DONE | 검토 완료(SELF_CHECK) | runs/UI-05.S3a/20260911T071500Z/RESULT.md | 완료 |
| UI-05.S3b | DONE | 검토 완료(SELF_CHECK) | runs/UI-05.S3b/20260911T073000Z/RESULT.md | 완료(M1 달성) |
| UI-06 | TODO | IDX-01 실측 지수 run·원자료 권리·게시 승인 (해제 조건은 원장 review_note) | — | 팀 승인·산출물 확보 후 |
| QA-02 | TODO | 로컬 M1 사전검수 완료(local_precheck). 최종 QA는 UI-06/빈 상태 release 승인 필요 | — | 승인 후 최종 검수 |
| REL-01 | TODO | QA-02·OPS-01 조건 + 배포 승인 | — | 전제 해소 후 승인 요청 |

공통 차단: 팀 연구·공개 승인 미확인, 원격 CI 결제/한도·Vercel BLOCKED(근본 미확인),
로컬·원격 HEAD 상이(동기화 미승인). 담당 수락은 추정하지 않음(전원 미확인).
로컬 구현 차단 조건과 원격 검수·배포 차단 조건은 구분한다.
UI-05 로컬 구현·통합은 사용자 위임(2026-09-11)으로 승인됨.
