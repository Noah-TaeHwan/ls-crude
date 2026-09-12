# COMMANDS — REP-01 (20260911T042017Z)

cwd는 별도 표시 없는 한 `/Users/noah/orca/ls-crude`.
세션 창 2026-09-11 12:40–12:4x KST. 개별 시각은 스탬프된 명령만 표기.
민감정보 없음. 재현 제한 없음.

## R0. 읽기 (Read 도구)

- Read `docs/cai/execution/cards/REP-01.md` (52행 전체)
- Read `docs/cai/execution/catalog.json` (418행 전체)
- Read `AGENTS.md` limit 30 (1–30행)
- Read `docs/cai/execution/CORE_RULES.md` (13행 전체)
- Read `README.md` offset 160 (160–176행, 끝부분)

## R1. run_id·위치·원격HEAD

```
date -u +%Y%m%dT%H%M%SZ; git rev-parse HEAD; git branch --show-current; git ls-remote origin HEAD; echo "---STATUS---"; git status --short | head -12
```
- exit 0. 출력: `20260911T042017Z` / `b981ceb` / `main` /
  `cecf1cf HEAD` / untracked 목록(ZIP·압축해제본·OPS_01_PROMPT·docs/cai/·plan·raw).

## R2. 대상 존재·원장 탐색

```
for f in docs/cai/README.md docs/cai/WEBSITE_PLAN.md docs/cai/DECISIONS_AND_HISTORY.md docs/cai/tasks.json docs/cai/TASKS.md docs/cai/PRD.md; do if [ -e "$f" ]; then echo "EXISTS: $f"; else echo "absent: $f"; fi; done; echo "---repo-wide tasks.json search---"; find . -name "tasks.json" -not -path "./node_modules/*" -not -path "./app/node_modules/*" -not -path "./research/.venv/*" -not -path "./.git/*" 2>/dev/null | head -10; echo DONE
```
- exit 0. 출력: 6개 전부 `absent`. 전역 탐색 무결과 후 `DONE`.

## R3. 루트 원격 비교

```
gh api "repos/Noah-TaeHwan/ls-crude/contents/README.md?ref=cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef" --jq '.content | @base64d' > /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/README-remote.md && gh api "repos/Noah-TaeHwan/ls-crude/contents/AGENTS.md?ref=cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef" --jq '.content | @base64d' > /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/AGENTS-remote.md && echo FETCHED; diff -q README.md /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/README-remote.md && echo "README_SAME" || echo "README_DIFFERENT"; diff -q AGENTS.md /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/AGENTS-remote.md && echo "AGENTS_SAME" || echo "AGENTS_DIFFERENT"
```
- exit 0. 출력: `FETCHED` / `README_DIFFERENT` / `AGENTS_DIFFERENT`.

```
echo "=====README diffstat====="; diff README.md /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/README-remote.md | head -40; echo "=====AGENTS diff====="; diff AGENTS.md /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/AGENTS-remote.md | head -30
```
- exit 0. 출력: README는 끝 빈 줄 1개 차이(`176a177 > (blank)`),
  AGENTS는 끝 빈 줄 1개 차이(`51a52 > (blank)`).
- 판단: 내용 실질 동일이나 지시문 조건(내용이 같을 것) 미충족 → 루트 미수정,
  ROOT_LINKS_PROPOSAL.md로 분기.

## R4. 쓰기 (Write/Edit 도구)

- Write `docs/cai/tasks.json` (14 units, REP-01 DOING으로 생성)
- Write `docs/cai/README.md`, `docs/cai/WEBSITE_PLAN.md`,
  `docs/cai/DECISIONS_AND_HISTORY.md`
- Write `runs/REP-01/20260911T042017Z/ROOT_LINKS_PROPOSAL.md`
- Edit `docs/cai/tasks.json`: REP-01 DOING→REVIEW로 올렸다가 검증 전이라
  DOING으로 되돌림 (성실 순서 오류 정정, 아래 R5 후 최종 REVIEW로 확정)
- Write `docs/cai/TASKS.md` (최종 카운트 REVIEW 4 기준)
- Edit `docs/cai/tasks.json`: REP-01 DOING→REVIEW 확정
  (정확 old/new 문자열은 RESULT §1 참조. 양 edit 모두 exit 기록 없음 —
  도구 호출이며 shell 종료 코드 없음)

## R5. 검증 스크립트 (전문)

`/var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/rep01-validate.py` (Write 도구로 작성):

```python
"""REP-01 validation: ledger vs catalog vs TASKS.md vs links. Read-only."""
import json
import re
import sys
from pathlib import Path

ROOT = Path("/Users/noah/orca/ls-crude")
fails = []


def check(name, cond, detail=""):
    print(("PASS" if cond else "FAIL"), name, detail)
    if not cond:
        fails.append(name)


tasks = json.loads((ROOT / "docs/cai/tasks.json").read_text())
catalog = json.loads((ROOT / "docs/cai/execution/catalog.json").read_text())

units = tasks["units"]
ids = [u["id"] for u in units]
cat_ids = [u["id"] for u in catalog["units"]]
cat_parent = {u["id"]: u["parent_id"] for u in catalog["units"]}

check("count-14", len(units) == 14, f"n={len(units)}")
check("no-dup-ids", len(set(ids)) == len(ids))
check("ids-match-catalog", set(ids) == set(cat_ids),
      f"only-in-tasks={set(ids) - set(cat_ids)} only-in-catalog={set(cat_ids) - set(ids)}")
check("parent-match-catalog",
      all(u["parent_id"] == cat_parent[u["id"]] for u in units))
check("depends-valid",
      all(d in set(ids) for u in units for d in u["depends_on"]))
allowed = {"TODO", "READY", "DOING", "REVIEW", "DONE", "BLOCKED"}
check("status-values", all(u["status"] in allowed for u in units))
required = ["id", "parent_id", "title", "status", "depends_on",
            "required_approvals", "owner", "owner_confirmed",
            "evidence", "review_note", "blockers", "next_action"]
check("fields-present",
      all(all(k in u for k in required) for u in units))
check("no-done", all(u["status"] != "DONE" for u in units))
check("owner-unconfirmed", all(u["owner_confirmed"] is False for u in units))

from collections import Counter
c = Counter(u["status"] for u in units)
print("counts:", dict(c), "total:", len(units))
check("counts-sum", sum(c.values()) == len(units))

tasks_md = (ROOT / "docs/cai/TASKS.md").read_text()
m = re.search(r"<!-- counts: total=(\d+) REVIEW=(\d+) DONE=(\d+) DOING=(\d+) TODO=(\d+) BLOCKED=(\d+) -->",
              tasks_md)
check("counts-comment-present", m is not None)
if m:
    t, r, dn, dg, td, b = (int(m.group(i)) for i in range(1, 7))
    check("counts-match-json",
          t == len(units) and r == c.get("REVIEW", 0) and dn == c.get("DONE", 0)
          and dg == c.get("DOING", 0) and td == c.get("TODO", 0)
          and b == c.get("BLOCKED", 0),
          f"md=({t},{r},{dn},{dg},{td},{b}) json={dict(c)}")

link_re = re.compile(r"\[[^\]]*\]\(([^)#\s]+)(?:#[^)\s]*)?\)")
checked, missing = 0, []
for rel in ["docs/cai/README.md", "docs/cai/WEBSITE_PLAN.md",
            "docs/cai/DECISIONS_AND_HISTORY.md", "docs/cai/TASKS.md"]:
    text = (ROOT / rel).read_text()
    for target in link_re.findall(text):
        if target.startswith("http"):
            continue
        checked += 1
        if not (ROOT / rel).parent.joinpath(target).resolve().exists():
            missing.append(f"{rel} -> {target}")
check("links-resolve", not missing, f"checked={checked} missing={missing}")

print("RESULT:", "ALL_PASS" if not fails else f"FAILURES={fails}")
sys.exit(1 if fails else 0)
```

```
S=$(date -u +%Y%m%dT%H%M%SZ); python3 /var/folders/90/2jn_59ss3s52rlbpn02bxnxr0000gn/T/rep01-validate.py; X=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E EXIT=$X"
```
- 출력: 13개 PASS + `counts: {'REVIEW': 4, 'TODO': 10} total: 14` +
  `RESULT: ALL_PASS`. `START=20260911T042226Z END=20260911T042226Z EXIT=0`.

## R6. 킷 유지·작업 전후 대조

```
S=$(date -u +%Y%m%dT%H%M%SZ); python3 docs/cai/execution/make_packet.py --check; X=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E EXIT=$X"
```
- 출력: `PASS: 14 units; ...` +
  `START=20260911T042232Z END=20260911T042232Z EXIT=0`.

```
command -v zip && echo ZIP_OK || echo ZIP_MISSING; git status --short | grep -v "^??"; echo "TRACKED_DONE"; git status --short -- docs/cai/README.md docs/cai/WEBSITE_PLAN.md docs/cai/DECISIONS_AND_HISTORY.md docs/cai/tasks.json docs/cai/TASKS.md docs/cai/execution/runs/REP-01/
```
- exit 0. 출력: `/usr/bin/zip` + `ZIP_OK` / tracked 변경 없음 /
  신규 6 경로 untracked 확인.

## R8. 전달 ZIP 생성·검증 (HANDOFF.zip)

```
S=$(date -u +%Y%m%dT%H%M%SZ); zip -q -r docs/cai/execution/runs/REP-01/20260911T042017Z/HANDOFF.zip docs/cai/README.md docs/cai/WEBSITE_PLAN.md docs/cai/DECISIONS_AND_HISTORY.md docs/cai/tasks.json docs/cai/TASKS.md docs/cai/execution/runs/REP-01/20260911T042017Z/RESULT.md docs/cai/execution/runs/REP-01/20260911T042017Z/COMMANDS.md docs/cai/execution/runs/REP-01/20260911T042017Z/ROOT_LINKS_PROPOSAL.md; X=$?; E=$(date -u +%Y%m%dT%H%M%SZ); echo "START=$S END=$E EXIT=$X"; echo "---VERIFY---"; unzip -l docs/cai/execution/runs/REP-01/20260911T042017Z/HANDOFF.zip
```
- 출력: `START=20260911T042323Z END=20260911T042323Z EXIT=0`.
  `unzip -l` 8 files (위 문서 5 + run 기록 3), 총 27,254 bytes.
- 포함: 이번 생성 문서 5 + run 기록 3. 제외 확인: 원자료·.env·인증정보·
  node_modules·기존 연구 결과 없음(포함 목록에 없음).
- 외부 업로드·배포 없음. 로컬 전달용.
- 생성 2회(내용 동일 구조, 2회째가 최종): 1회차
  `START=20260911T042323Z END=20260911T042323Z EXIT=0`,
  2회차 `START=20260911T042339Z END=20260911T042339Z EXIT=0`
  (2회째 직전 본 C8 섹션 추가됨).
  최종 검증은 아래 R9의 `unzip -l` 파일 목록으로 한다(바이트수는
  스냅샷 시점 표기라 목록과 함께 읽는다).

## R9. 최종 고정·검증 (이후 run 파일 수정 없음)
