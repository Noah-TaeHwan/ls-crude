# CAI AI 실행 패키지 v0.6

기획서 v0.5를 바꾸지 않고, AI가 한 작업씩 구현·검증하도록 만든 실행 계층입니다.

**처음 할 일:** ZIP을 작업 AI에게 첨부하고 [첫 실행 프롬프트](BOOTSTRAP_PROMPT.md)를 붙여 넣으세요. 기본 실행은 문서 설치와 BOOT-01 점검까지이며 앱 수정·배포는 하지 않습니다. BOOT-01 결과를 확인한 뒤 [다음 작업 프롬프트](docs/cai/execution/CONTINUE_PROMPT.md)로 한 작업을 승인합니다.

레포 사용자는 이 ZIP의 `docs/cai/execution/`을 같은 경로에 복사합니다. 기존 경로가 있으면 먼저 비교하며 무조건 덮어쓰지 않습니다. 루트 README·AGENTS·기존 tasks.json은 자동 대체하지 않습니다. ZIP 밖 파일 접근/실행은 설치 동작이 아닙니다.

| 입구 | 용도 |
|---|---|
| [START_HERE](docs/cai/execution/START_HERE.md) | 사람과 AI의 실행 안내 |
| [기획서 원본](docs/cai/execution/SPEC_REFERENCE_v05.md) | 왜/무엇을 만드는가; v0.5 원문 보존 |
| [실행 프롬프트](docs/cai/execution/EXECUTOR_PROMPT.md) | 선택된 작업 하나를 구현 |
| [메타프롬프트](docs/cai/execution/META_PROMPT_BUILDER.md) | 이후 새 요구를 작은 작업 명세로 변환 |
| [작업 지도](docs/cai/execution/TASK_MAP.md) | 기존 task ID와 실행 단위 대응 |
| [검수 프롬프트](docs/cai/execution/REVIEWER_PROMPT.md) | 구현 주장 대신 diff·실제 결과로 판정 |

`make_packet.py`는 작업 명세와 해당 기획서 절을 합쳐 표준출력으로 내보내는 로컬 도구입니다. API 호출, 모델 실행, 앱 수정, Git 변경, 배포, 작업 원장 수정은 하지 않습니다. 생성한 패킷에도 최신 코드·권한·검증 결과는 포함되지 않으며 실행 AI가 확인해야 합니다.

이 패키지의 자동 검사는 파일·작업 의존성·패킷 생성기 검사입니다. 실제 보급형 모델의 성공률, 앱 테스트, CI, 배포, 머신러닝 성능을 검증한 결과가 아닙니다.
