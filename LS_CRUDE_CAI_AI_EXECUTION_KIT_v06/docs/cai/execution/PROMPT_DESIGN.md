# 메타프롬프트 설계 메모

## 목표

작업 AI가 제품·코드·연구 맥락을 추측해야 하는 부분을 줄인다. 상위 기획은 보존하고, 실행 단위의 입력·출력·파일·테스트·중단 기준을 명시한다. 실제 모델의 추론 능력을 프롬프트만으로 다른 모델 수준으로 바꾸었다고 주장하지 않는다.

## 적용한 구조

| 실패 원인 | 패키지의 대응 |
|---|---|
| 전체 기획서를 읽고 임의 재설계 | PROJECT_BRIEF + 기획 절 발췌 + 한 작업 카드 |
| 태스크·허용 파일이 모호 | catalog parent/dependency/write_allowlist + 카드 수용 조건 |
| 앞 태스크와 타입 이름이 다름 | PUBLIC_VIEW/URL_COMPAT 공통 계약 |
| 없는 자료를 목업으로 채움 | NO_DATA 계약·반례·권한 있는 실제 run 게이트 |
| 실행 안 했는데 완료 주장 | RESULT의 실제 cwd/명령/exit + REVIEWER 분리 |
| 대화가 길어져 현재 상태 유실 | 결과·차단·다음 작업의 인계 템플릿 |
| 도구를 많이 쓸수록 좋다고 오해 | 실제 기능 확인·단일 실행자·필요한 도구만 사용 |
| 무한 재시도 | 같은 원인/접근 반복 중단·국소 에스컬레이션 |

메타프롬프트는 META_PROMPT_BUILDER다. 이미 있는 요구에는 사람이 검토한 카드를 재사용한다. 모델이 매번 모든 계획을 다시 만드는 것을 피하고, 단순한 원문 발췌는 make_packet.py가 결정적으로 처리한다.

## 참고한 원칙과 확인 범위

OpenAI와 Anthropic 공식 프롬프트 가이드는 명시적인 지시·구조·예시를 제시한다. OpenAI 평가 가이드는 작업에 맞는 평가와 경계 사례 검사를 권고한다. 이 패키지는 그 원칙을 CAI의 파일·권한·결측·URL 사례에 적용한 설계다. 제공자 문서의 특정 모델 성능을 다른 모델에 그대로 보장하지 않는다.

- OpenAI, Prompt engineering: https://developers.openai.com/api/docs/guides/prompt-engineering
- Anthropic, Prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- OpenAI, Evaluation best practices: https://developers.openai.com/api/docs/guides/evaluation-best-practices

참고 확인일: 2026-09-11. 모델별 결과는 EVALUATION에 따라 별도로 측정한다. 이번에 실행한 자동 검사는 패키지 구조와 생성 도구뿐이다.

## 명세와 실행의 경계

기획서 v0.5는 동봉 원문과 같은 SHA-256이다. 현재 레포·운영·팀 합의는 이번에 다시 감사하지 않았다. 예전 CI failure/Vercel blocked가 지금도 같다고 가정하지 않는다. 다음 AI의 BOOT가 확인한다.

PUBLIC_VIEW는 구현을 위한 구체화다. 실제 기존 계약과 충돌하면 검토 후 수정하며, 통계·연구·수집 정책을 이 문서로 교체하지 않는다. 참고 v4 HTML의 숫자/스크립트를 운영 기본값으로 복제하지 않는다.
