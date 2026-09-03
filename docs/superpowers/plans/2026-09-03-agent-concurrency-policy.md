# AI 에이전트 동시 실행 정책 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LS CRUDE와 사용자 전역 AI 도구에 파동 10명, Run 전체 50명, 깊이 3의 공통 운영 계약과 도구별 공식 네이티브 상한을 적용한다.

**Architecture:** 숫자형 설정을 공식 지원하는 Codex, Claude Code, Hermes만 네이티브 설정을 바꾼다. 나머지 도구는 실제로 읽는 글로벌 지침에 같은 admission 규칙을 넣고, Orca의 Run 상태를 전체 총량의 정본으로 사용한다.

**Tech Stack:** Markdown agent instructions, TOML, JSON, YAML, Orca CLI, Codex CLI, Claude Code, Hermes Agent

**Spec:** `docs/superpowers/specs/2026-09-03-agent-concurrency-policy-design.md`

## Global Constraints

- 초기 파동은 최대 10명이다.
- coordinator를 제외한 한 Orca Run의 동시 활성 워커는 최대 50명이다.
- 기본 자식은 `leaf`이며, 명시된 `orchestrator`만 깊이 3 안에서 재위임한다.
- 같은 체크아웃에 쓰는 워커는 동시에 최대 2명이며 서로 다른 파일을 소유한다.
- 실제 생성 수는 `min(독립 READY 작업 수, 도구별 네이티브 상한, 10, 50 - 현재 Run 활성 워커 수)`다.
- 숫자형 설정을 공식 지원하지 않는 도구에 비공식 키를 추가하지 않는다.
- Orca의 `nestedWorkerMaxDepth=3`은 UI 설정을 유지하며 JSON을 직접 수정하지 않는다.

---

### Task 1: 공통 admission 규칙 배포

**Files:**
- Modify: `AGENTS.md`
- Modify: `/Users/noah/.codex/AGENTS.md`
- Modify: `/Users/noah/.claude/CLAUDE.md`
- Modify: `/Users/noah/.cursor/rules/agency-delegation.mdc`
- Modify: `/Users/noah/.grok/AGENTS.md`
- Modify: `/Users/noah/.hermes/AGENTS.md`
- Modify: `/Users/noah/.opencode/instructions/INSTRUCTIONS.md`
- Modify: `/Users/noah/.gemini/GEMINI.md`

**Interfaces:**
- Consumes: 각 도구가 시작할 때 읽는 저장소 또는 사용자 전역 지침 표면
- Produces: 모든 도구가 해석할 수 있는 동일한 자연어 admission 계약

- [ ] **Step 1: 변경 전 정책을 확인한다**

Run:

```bash
rg -n "기본 2개|파동 상한|활성 워커" \
  AGENTS.md \
  /Users/noah/.codex/AGENTS.md \
  /Users/noah/.claude/CLAUDE.md \
  /Users/noah/.cursor/rules/agency-delegation.mdc \
  /Users/noah/.grok/AGENTS.md \
  /Users/noah/.hermes/AGENTS.md \
  /Users/noah/.opencode/instructions/INSTRUCTIONS.md \
  /Users/noah/.gemini/GEMINI.md
```

Expected: 기존 다섯 표면에는 “기본 2개 이하”가 있고, 나머지 표면에는 공통 계약이 없다.

- [ ] **Step 2: 모든 지침 표면에 같은 규칙을 적용한다**

기존 2명 문구를 바꾸거나, 해당 절이 없으면 다음 내용을 추가한다.

```markdown
## 서브에이전트 동시 실행

- 한 부모의 초기 위임 파동은 최대 10명이다. 상한을 채우지 말고 서로 독립적인 `READY` 작업만 실행한다.
- 한 Orca Run의 동시 활성 워커는 coordinator를 제외하고 최대 50명이다.
- 실제 생성 수는 `min(독립 READY 작업 수, 도구별 네이티브 상한, 10, 50 - 현재 Run 활성 워커 수)`다.
- 기본 자식은 `leaf`다. 작업 명세가 `orchestrator` 역할과 재위임 범위를 명시한 경우에만 깊이 3 안에서 자식 워커를 만든다.
- 같은 체크아웃에 쓰는 워커는 동시에 최대 2명으로 제한하고 서로 다른 파일을 소유하게 한다.
- 중복 작업, 반복 rate limit, 동일 작업의 연속 실패가 확인되면 새 파동을 멈춘다. 완료된 워커는 검토 후 즉시 해제한다.
```

- [ ] **Step 3: 정책 값의 일치를 검사한다**

Run:

```bash
for file in \
  AGENTS.md \
  /Users/noah/.codex/AGENTS.md \
  /Users/noah/.claude/CLAUDE.md \
  /Users/noah/.cursor/rules/agency-delegation.mdc \
  /Users/noah/.grok/AGENTS.md \
  /Users/noah/.hermes/AGENTS.md \
  /Users/noah/.opencode/instructions/INSTRUCTIONS.md \
  /Users/noah/.gemini/GEMINI.md; do
  rg -q "초기 위임 파동은 최대 10명" "$file"
  rg -q "최대 50명" "$file"
  rg -q "깊이 3" "$file"
  rg -q "최대 2명" "$file"
done
```

Expected: exit 0.

- [ ] **Step 4: 저장소 변경을 검토한다**

Run:

```bash
git diff --check
git diff -- AGENTS.md
```

Expected: whitespace 오류 없음. 저장소 diff에는 동시 실행 정책만 포함된다.

### Task 2: 네이티브 런타임 상한 적용

**Files:**
- Modify: `/Users/noah/.codex/config.toml`
- Modify: `/Users/noah/.claude/settings.json`
- Modify: `/Users/noah/.hermes/config.yaml`
- Verify only: `/Users/noah/Library/Application Support/orca/profiles/local-default/orca-data.json`

**Interfaces:**
- Consumes: 각 CLI의 공식 사용자 전역 설정 schema
- Produces: Codex subagent 6명, Claude subagent 10명·깊이 3, Hermes 자식 10명·깊이 3

- [ ] **Step 1: 변경 전 baseline과 키 중복 여부를 캡처한다 (최초 실행 시 1회)**

Run:

```bash
rg -n "^\[agents\]|max_concurrent_threads_per_session" /Users/noah/.codex/config.toml || true
jq '{concurrency: .env.CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS, depth: .env.CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH}' /Users/noah/.claude/settings.json
hermes config get delegation.max_concurrent_children
hermes config get delegation.max_spawn_depth
```

Expected on the initial pre-change run (captured baseline): Codex의
`agents.max_concurrent_threads_per_session` override와 Claude의 두 env
override는 부재하고, Hermes는 `delegation.max_concurrent_children = 3`,
`delegation.max_spawn_depth = 1`이다. 이 baseline은 변경 전 상태의 기록이며,
재실행 시 기대값으로 사용하지 않는다. 재실행에서는 현재 적용값인 Codex 6,
Claude 10/3, Hermes 10/3을 Step 6 readback으로 검증하고, baseline의 부재·3/1을
요구하지 않는다.

- [ ] **Step 2: Codex 공식 설정을 추가한다**

`/Users/noah/.codex/config.toml`에 다음 table을 한 번만 추가한다.

```toml
[agents]
max_concurrent_threads_per_session = 6
```

- [ ] **Step 3: Claude Code 공식 환경 설정을 추가한다**

`/Users/noah/.claude/settings.json`의 기존 `env` 객체에 다음 두 항목을 추가하고 다른 항목은 보존한다.

```json
"CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "10",
"CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "3"
```

- [ ] **Step 4: Hermes 공식 delegation 설정을 추가한다**

`/Users/noah/.hermes/config.yaml`의 기존 `delegation` 절에 다음 항목을 추가한다.

```yaml
max_concurrent_children: 10
max_spawn_depth: 3
```

- [ ] **Step 5: 설정 파일을 엄격하게 파싱한다**

Run:

```bash
python3 -c 'import tomllib; tomllib.load(open("/Users/noah/.codex/config.toml", "rb"))'
jq empty /Users/noah/.claude/settings.json
hermes config check
codex --strict-config doctor --json
```

Expected: 모든 명령 exit 0. Codex doctor는 `config.load.status=ok`, `config loaded`, `config.toml parse=ok`을 확인하며, 설정과 무관한 경고는 별도로 기록한다.

- [ ] **Step 6: 적용값을 다시 읽는다**

Run:

```bash
python3 -c 'import tomllib; c=tomllib.load(open("/Users/noah/.codex/config.toml", "rb")); assert c["agents"]["max_concurrent_threads_per_session"] == 6'
jq -e '.env.CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS == "10" and .env.CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH == "3"' /Users/noah/.claude/settings.json
test "$(hermes config get delegation.max_concurrent_children)" = 10
test "$(hermes config get delegation.max_spawn_depth)" = 3
jq -e '.settings.nestedWorkerMaxDepth == 3' '/Users/noah/Library/Application Support/orca/profiles/local-default/orca-data.json'
```

Expected: exit 0. Orca 파일은 변경하지 않는다.

### Task 3: 독립 검증과 저장소 전달

**Files:**
- Modify: `docs/superpowers/plans/2026-09-03-agent-concurrency-policy.md`
- Verify: all files from Tasks 1 and 2

**Interfaces:**
- Consumes: 적용된 정책과 파서·CLI readback
- Produces: Evidence Collector/Reality Checker 판정, 저장소 커밋, PR

- [ ] **Step 1: Evidence Collector와 Reality Checker에게 읽기 전용 검증을 맡긴다**

검증 범위:

```text
공식 설정 키와 실제 readback을 대조한다.
각 지침 표면의 10/50/3/2 계약이 같은지 확인한다.
Orca JSON이 UI 값 3을 유지하며 직접 수정되지 않았는지 확인한다.
지원하지 않는 도구에 비공식 숫자 키가 추가되지 않았는지 확인한다.
저장소 diff가 AGENTS.md와 Superpowers 문서에만 한정되는지 확인한다.
```

Expected: Critical/Important finding 0건. 발견 시 해당 Task로 돌아가 수정 후 재검증한다.

- [ ] **Step 2: 저장소 변경을 최종 검토한다**

Run:

```bash
git diff --check
git status --short --branch
git diff -- AGENTS.md docs/superpowers
```

Expected: 글로벌 파일은 Git diff에 나타나지 않는다. 저장소에는 AGENTS.md, 설계서, 구현 계획만 포함된다.

- [ ] **Step 3: 구현 변경을 커밋한다**

Run:

```bash
git add AGENTS.md docs/superpowers/plans/2026-09-03-agent-concurrency-policy.md
git diff --cached --check
git commit -m "chore: 에이전트 병렬 실행 정책을 확장한다"
```

Expected: 피처 브랜치에 구현 커밋 1개가 추가된다.

- [ ] **Step 4: 브랜치를 push하고 PR을 만든다**

Run:

```bash
git push -u origin chore/agent-concurrency-policy
gh pr create --base main --head chore/agent-concurrency-policy \
  --title "chore: 에이전트 병렬 실행 정책 확장" \
  --body "공식 설정 표면에 도구별 상한을 적용하고, 공통 10/50/3 admission 계약을 저장소와 글로벌 지침에 맞춥니다. 글로벌 설정은 Git 밖이며 로컬에서 별도로 검증했습니다."
```

Expected: PR URL이 반환된다. PR 본문은 공식 근거, 로컬 검증, 글로벌 설정은 Git 밖이라는 경계를 설명한다.

- [ ] **Step 5: CI와 PR 상태를 확인하고 병합한다**

Run:

```bash
gh pr checks chore/agent-concurrency-policy --watch
gh pr merge chore/agent-concurrency-policy --squash --delete-branch
```

Expected: 필수 checks 성공 후 main에 squash merge된다.

- [ ] **Step 6: 로컬 main을 동기화한다**

Run:

```bash
git switch main
git pull --ff-only origin main
git status --short --branch
```

Expected: `main...origin/main`, dirty 파일 없음.
