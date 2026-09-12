# 실행 결과 양식

아래 필드는 실제 실행 뒤 채운다. null은 미확인, NOT_RUN은 미실행이다. 예시/예상 결과를 실행값으로 쓰지 않는다.

```yaml
unit_id: null
parent_task_id: null
status: REVIEW   # REVIEW / REVISION / BLOCKED
review_mode: SELF_CHECK
base_sha: null
branch: null
head_sha: null   # commit하지 않았다면 base와 같을 수 있음; 완료 증거가 아님
working_tree_diff_evidence: null
pre_existing_changes: []
authorization_evidence: []
changed_files: []
acceptance:
  # 각 카드 AC-ID마다 status, evidence, missing_reason 기록
  # status: PASS / FAIL / NOT_RUN
commands:
  # command, cwd, exit_code, summary, evidence_path, classification
  # classification: PASS / ASSERTION_FAIL / ENVIRONMENT_BLOCKED / PRE_EXISTING / NOT_RUN
not_run: []
blockers: []
next_unit: null
```

## 사람에게 보여줄 요약

**작업·상태:** 실제 단위 ID / REVIEW·REVISION·BLOCKED.  
**변경:** 소유 파일과 핵심 변화.  
**수용 조건:** 조건별 PASS/FAIL/NOT_RUN과 실제 근거.  
**검사:** 실제 명령·cwd·exit와 근거.  
**남은 것:** 차단 이유·필요 입력/승인.  
**다음:** 단위 하나 또는 필요한 결정 하나.

로그·스크린샷·diff가 없으면 링크를 만들지 않는다. 로그를 공개용 문서에 넣기 전 토큰·개인정보·서명 URL을 제거한다. 범위 밖 사전 변경은 삭제하지 말고 별도로 열거한다.
