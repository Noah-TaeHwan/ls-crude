# AI 에이전트 동시 실행 정책 설계

## 목적

LS CRUDE와 사용자 전역 AI 도구에서 병렬 작업의 여유를 늘리되, 중복 작업·파일 충돌·사용량 급증을 막는다. 공통 운영 상한은 초기 파동 10명, 한 Orca Run의 동시 활성 워커 50명, 중첩 깊이 3으로 둔다.

상한은 목표 인원이 아니다. coordinator는 실제로 독립적인 `READY` 작업만 실행한다.

## 공통 운영 계약

실제 생성 수는 다음 값 가운데 가장 작은 수다.

```text
min(
  독립적인 READY 작업 수,
  도구별 네이티브 상한,
  파동 상한 10,
  50 - 현재 Run의 활성 워커 수
)
```

- `파동`은 한 부모가 한 번에 시작하는 독립 작업 묶음이다.
- `활성 워커`는 coordinator를 제외하고 아직 완료·실패·해제되지 않은 워커다.
- 기본 자식은 `leaf`다. 작업 명세가 `orchestrator` 역할과 재위임 범위를 명시한 경우에만 자식 워커를 만든다.
- 중첩 깊이는 3이다. 새 Run을 만들어 깊이 제한을 우회하지 않는다.
- 같은 체크아웃에 쓰는 워커는 동시에 2명 이하로 제한하고, 서로 다른 파일을 소유한다.
- 조사·읽기·독립 검증은 독립성이 확인되면 넓게 병렬화한다.
- 중복 작업, 반복 rate limit, 동일 작업의 연속 실패가 확인되면 새 파동을 멈춘다.
- 완료된 워커는 결과를 확인한 뒤 즉시 해제해 슬롯을 돌려준다.

Run 전체 50명 제한은 현재 Orca의 네이티브 하드캡이 아니다. coordinator가 `task-list`, `worker-list`, Dispatch 상태로 집행하는 운영 상한이다. 별도 스케줄러나 훅은 과잉 생성이 실제로 발생하기 전까지 만들지 않는다.

## 확인된 현재 상태

| 표면 | 현재 상태 | 공식·정본 근거 |
| --- | --- | --- |
| Orca 1.4.196 | `nestedWorkerMaxDepth=3` | 기본값은 1이며 Settings → Orchestration에서만 변경한다. 숫자형 동시 실행 상한은 없다. |
| Codex CLI 0.153.0 | multi-agent 활성, 명시적 동시 실행값 없음, 현재 세션 총 4 threads | `[agents].max_concurrent_threads_per_session`은 생성된 subagent 수를 제한한다. V2 기본은 root 포함 4 threads이며 8 이상에서 사용량 경고를 낸다. `max_depth`는 V2에서 무시된다. |
| Claude Code 2.1.258 | concurrency·depth override 없음 | 동시 subagent 기본값은 20, 중첩 깊이 기본값은 3이다. 중간 규모 dynamic workflow는 15명 미만을 목표로 한다. |
| Hermes Agent 0.20.0 | 동시 자식 3, 깊이 1 | `delegation.max_concurrent_children`과 `delegation.max_spawn_depth`를 지원한다. 10을 초과하면 비용 경고를 낸다. |
| Cursor Agent 2026.09.02 | 숫자형 로컬 concurrency 설정 없음 | 병렬 subagent와 고정 중첩 한계를 지원한다. top-level과 직계 자식만 새 subagent를 시작할 수 있다. |
| Grok Build 1.0.13 | subagent 기본 활성, 숫자형 concurrency 설정 없음 | `[subagents].enabled`, 역할, 모델 override를 지원한다. 로컬 정본 문서에는 숫자형 상한이 없다. |
| OpenCode 1.18.23 | subagent 정의 사용, 숫자형 concurrency 설정 없음 | 글로벌 instructions 파일을 설정에서 명시적으로 불러온다. |
| Gemini CLI 0.1.11 | Agency-Agents 확장 설치, 숫자형 concurrency 설정 없음 | 현재 설치본의 settings schema에는 subagent concurrency 항목이 없다. |

## 도구별 적용값

### Orca

- 사용자가 UI에서 지정한 중첩 깊이 3을 유지한다.
- 설정 JSON을 직접 수정하지 않는다. Orca 소스가 이 값을 renderer 전용으로 제한하기 때문이다.
- 파동 10명과 Run 총량 50명은 공통 운영 계약으로 집행한다.

### Codex

`~/.codex/config.toml`의 공식 `[agents]` 설정에 다음 값을 둔다.

```toml
[agents]
max_concurrent_threads_per_session = 6
```

이 값은 subagent 6명과 root 1명, 총 7 threads를 허용한다. 공식 사용량 경고선 8 아래에 둔다. V2가 무시하는 `max_depth`는 추가하지 않는다. 현재 열린 세션에는 소급되지 않으므로 새 세션부터 확인한다.

### Claude Code

`~/.claude/settings.json`의 공식 `env` 표면에 다음 값을 둔다.

```json
{
  "CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "10",
  "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "3"
}
```

네이티브 상한은 10명으로 고정한다. 공통 운영 계약이 실제 파동 크기와 Run 총량을 더 좁게 통제한다. 실험 기능인 Agent Teams는 이번 작업에서 켜지 않는다.

### Hermes Agent

`~/.hermes/config.yaml`의 공식 `delegation` 표면에 다음 값을 둔다.

```yaml
delegation:
  max_concurrent_children: 10
  max_spawn_depth: 3
```

Hermes의 값은 부모별 상한이다. 따라서 Run 총량 50명과 `leaf` 기본값은 글로벌 지침으로 함께 적용한다.

### Cursor, Grok Build, OpenCode, Gemini CLI

현재 설치본과 공식 문서에서 공통으로 쓸 수 있는 숫자형 concurrency 키를 확인하지 못했다. 지원되지 않는 키는 만들지 않는다. 각 도구가 실제로 읽는 글로벌 지침 표면에 공통 운영 계약을 넣는다.

- Cursor: `~/.cursor/rules/agency-delegation.mdc`
- Grok Build: `~/.grok/AGENTS.md`
- OpenCode: `~/.opencode/instructions/INSTRUCTIONS.md`
- Gemini CLI: `~/.gemini/GEMINI.md`

Grok의 `[subagents].enabled` 기본값은 유지한다. 별도의 로컬 `Grok Bot` 실행 파일이나 독립 concurrency 설정 표면은 확인되지 않았으므로 검증되지 않은 설정을 추가하지 않는다.

## 저장소와 글로벌 지침

다음 파일의 기존 “기본 2개 이하” 문구를 바꾸거나, 해당 문구가 없으면 공통 운영 계약을 추가한다.

- 저장소: `AGENTS.md`
- Codex: `~/.codex/AGENTS.md`
- Claude Code: `~/.claude/CLAUDE.md`
- Cursor: `~/.cursor/rules/agency-delegation.mdc`
- Grok Build: `~/.grok/AGENTS.md`
- Hermes Agent: `~/.hermes/AGENTS.md`
- OpenCode: `~/.opencode/instructions/INSTRUCTIONS.md`
- Gemini CLI: `~/.gemini/GEMINI.md`

Agency-Agents, ECC, Ponytail, Superpowers는 실행 런타임이 아니라 역할·절차 계층이다. 별도 숫자 설정을 만들지 않고 이 계약을 따른다.

## 검증

변경 뒤 다음 증거를 남긴다.

1. 모든 JSON·TOML·YAML 파일을 파서로 읽는다.
2. Codex 설정에서 subagent 6명 상한이 해석되는지 새 프로세스에서 확인한다.
3. Claude settings의 두 환경변수를 정확히 다시 읽는다.
4. `hermes config get delegation.max_concurrent_children`과 `max_spawn_depth`가 각각 10과 3을 반환하는지 확인한다.
5. Orca UI 설정의 저장값이 3인지 다시 읽는다.
6. 각 글로벌 지침과 저장소 지침이 같은 파동·총량·깊이·쓰기 제한을 갖는지 비교한다.
7. LS CRUDE 작업트리가 설정 문서 변경 외에 깨끗한지 확인한다.

실제 워커 50명을 검증 목적으로 생성하지 않는다. 설정 검증에 많은 사용량을 쓰는 것은 안전장치의 목적과 어긋난다.

## 롤백

- Codex의 `[agents].max_concurrent_threads_per_session`을 제거하면 선택된 backend 기본값으로 돌아간다.
- Claude의 두 환경변수를 제거하면 기본값 20과 3으로 돌아간다.
- Hermes 값을 제거하면 기본값 3과 1로 돌아간다.
- 공통 지침은 이전 “기본 2개 이하” 정책으로 되돌릴 수 있다.
- Orca 깊이는 UI에서만 되돌린다.

## 제외 범위

- 새로운 중앙 스케줄러나 동시성 훅
- 요금·토큰의 자동 결제 한도
- 공급자 rate limit 우회
- Claude Agent Teams 자동 활성화
- 숫자 설정을 제공하지 않는 도구에 비공식 키 추가

## 공식 근거

- [Orca 중첩 깊이 기본값과 검증](https://github.com/stablyai/orca/blob/main/src/shared/nested-worker-depth.ts)
- [Orca 설정 UI](https://github.com/stablyai/orca/blob/main/src/renderer/src/components/settings/OrchestrationPane.tsx)
- [Codex V2 동시 실행 기본값과 설정 해석](https://github.com/openai/codex/blob/main/codex-rs/core/src/config/mod.rs)
- [Codex `[agents]` 설정 계약](https://github.com/openai/codex/blob/main/codex-rs/config/src/config_toml.rs)
- [Claude Code 변경 기록](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code 병렬 실행 안내](https://code.claude.com/docs/en/agents)
- [Claude Code Agent Teams 안내](https://code.claude.com/docs/en/agent-teams)
- [Hermes delegation 구현](https://github.com/NousResearch/hermes-agent/blob/main/tools/delegate_tool.py)
- [Hermes delegation 안내](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/delegation.md)
- [Cursor subagent 안내](https://cursor.com/docs/subagents)
- [OpenCode agent 안내](https://opencode.ai/docs/agents)
- Grok Build: 설치본 정본 `/Users/noah/.grok/README.md`의 `Subagents` 절
