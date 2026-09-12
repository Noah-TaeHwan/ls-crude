# COMMANDS — OPS-01 (20260911T033847Z)

실행한 전체 명령을 생략 없이 기록한다. cwd는 별도 표시 없는 한
`/Users/noah/orca/ls-crude`. 시각은 개별 스탬프 없이 세션 창
2026-09-11 12:38–12:45 KST(run_id 기준 시작, 아래 최종 date 종료)로 기록한다.
민감정보(토큰·쿠키·시크릿·서명 URL)는 출력에 없었음. 재현 제한 없음.

## C0. 지시문·사전 읽기 (Read 도구, shell 아님)

- Read `/Users/noah/orca/ls-crude/OPS_01_PROMPT.md` (116행 전체)
- Glob `**/OPS_01_PROMPT.md` in repo → `/Users/noah/orca/ls-crude/OPS_01_PROMPT.md`
- Read `AGENTS.md`, `CORE_RULES.md`, `cards/OPS-01.md`,
  `.github/workflows/ci.yml`,
  `app/app/components/desk-chrome.tsx` (footer 76–91행),
  `SPEC_REFERENCE_v05.md` 31–72행(§02)·258–282행(§12),
  BOOT-01 RESULT 요약부, DATA-01 R1 요약·미확인부,
  ego-browser `SKILL.md` (466행 전체)

## C1. 프롬프트 파일 대조

```
git status --short -- OPS_01_PROMPT.md; git check-ignore OPS_01_PROMPT.md && echo IGNORED || echo "not-ignored"; diff -q /Users/noah/orca/ls-crude/OPS_01_PROMPT.md /Users/noah/Downloads/OPS_01_PROMPT.md && echo SAME || echo DIFFERENT
```
- exit 0. 출력: `?? OPS_01_PROMPT.md` / `not-ignored` / `SAME`.
- 판단: 레포 본은 untracked(수정 안 함). Downloads 본과 동일.

## C2. 위치·버전 (Step 1)

```
pwd; git rev-parse --show-toplevel; git remote -v | head -2; git branch --show-current; git rev-parse HEAD; echo "---STATUS(TRACKED)---"; git status --short | grep -v "^??" | head -5; echo "TRACKED_DONE"; echo "---REMOTE-MAIN---"; git ls-remote origin HEAD; git ls-remote origin main
```
- exit 0. 출력: cwd=toplevel=`/Users/noah/orca/ls-crude`,
  origin=`https://github.com/Noah-TaeHwan/ls-crude`,
  branch=`main`, local HEAD=`b981ceb`,
  tracked 변경 없음(TRACKED_DONE),
  remote HEAD=main=`cecf1cf`.

## C3. GitHub CI (Step 2)

```
gh run list --branch main --limit 5
```
- exit 0. 출력(5행 모두 `completed failure`, 3–4s):
  `34551671564 091 applied tracks first with weights`,
  `34550400192 CFAM web run.bat`, `34550118161 CFAM meme web board`,
  `34549596771 091-Z meme pinch`, `34549446706 091-X 091-Y meme 0.01`.

```
gh run view 34551671564 2>&1 | head -20
```
- exit 0. 출력: jobs `app 2s` / `research 3s` 모두 X.
  ANNOTATIONS 2건 동일 문구:
  "The job was not started because recent account payments have failed
  or your spending limit needs to be increased."
- 판단: job 미시작 → 코드 검증 미실행. 코드 테스트 실패 아님.

```
gh api repos/Noah-TaeHwan/ls-crude/commits/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/check-runs --jq '.check_runs[] | {name: .name, status: .status, conclusion: .conclusion}'; echo "---statuses---"; gh api repos/Noah-TaeHwan/ls-crude/commits/cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef/statuses --jq '.[] | {context: .context, state: .state, description: .description}'
```
- exit 0. 출력: check-runs `research/completed/failure`,
  `app/completed/failure`. statuses 2건:
  `Vercel/failure/"Deployment was blocked"`,
  `Vercel/failure/"Git author Liam-Son must have access to the project
  on Vercel to create deployments."`
- 판단: CI 원인과 Vercel 원인은 별개로 기록. `--log-failed`는 미실행
  (annotation으로 원인 확정 가능했음).

## C4. Vercel CLI 읽기 (Step 3)

```
vercel --help 2>&1 | head -50
```
- exit 0. 읽기 전용 후보 확인: `ls`, `inspect`, `alias list`.

```
vercel ls --help 2>&1 | head -30; echo "===ALIAS-HELP==="; vercel alias --help 2>&1 | head -25
```
- exit 0. `ls [app]`, `alias list`, `-S/--scope` 확인. 추측 명령 사용 없음.

```
vercel ls ls-crude -S noah-tae-hwan-s-projects 2>&1 | head -25
```
- exit 0. 출력: 최근 배포 20여 건, Status 열은 `UNKNOWN` 표시,
  Username=`noahtaehwan-8909`. 상태 단정 불가 → JSON으로 재조회.

```
vercel ls ls-crude -S noah-tae-hwan-s-projects -F json 2>/dev/null | python3 -c "<ds[:12] 순회>" 2>&1 | head -20
```
- exit 1. 출력: `KeyError: slice(...)` — JSON이 배열이 아니라
  dict(`deployments` 키)였음. 내 파싱 실수. 상태 단정 없음.

```
vercel alias list -S noah-tae-hwan-s-projects 2>&1 | head -15
```
- exit 0. 출력: sungchan 브랜치 preview alias 다수(091a–091z·meme·cfam·etf·qsr 등).

```
vercel ls ls-crude -S noah-tae-hwan-s-projects -F json 2>/dev/null | python3 -c "<deployments 순회: created|state|target|githubCommitSha|url|creator>"
```
- exit 0. 출력(20건 전부): `state=BLOCKED`.
  production 타깃 포함: `cecf1cf`(현 HEAD), `c9ce302`, `4615d0c`,
  `73ea274`, `a4529ae`, `d8c6c27`, `0d0f5e2`, `c35a933…`.
  creator username 전부 `noahtaehwan-8909`.
- 판단: 최근 20건 전역 BLOCKED 확인. 근본 원인(20건 공통)은 미확인.

```
vercel alias list -S noah-tae-hwan-s-projects 2>&1 | grep -E "^  ls-crude\.vercel\.app|vercel\.app +[0-9]" | head -30
```
- exit 0. 출력: 브랜치 alias 행들(패턴이 age 열까지 매칭됨 — 그대로 기록).

```
vercel inspect https://ls-crude-gitpi6mtr-noah-tae-hwan-s-projects.vercel.app 2>&1 | head -40
```
- exit 0. 출력: id `dpl_7NruhSrvCtd3gZYXvg2dFSQUweHp`, target production,
  status `UNKNOWN`(CLI 표시), created `Fri Sep 11 2026 10:41:27 KST`,
  Aliases: `ls-crude-noah-tae-hwan-s-projects.vercel.app`,
  `ls-crude-git-main-...` (production 도메인 없음), Builds `. [0ms]`.
- 판단: 현 HEAD 배포는 빌드 0ms(미빌드). production 도메인 미연결.

```
vercel ls ls-crude -S noah-tae-hwan-s-projects -F json -s READY 2>/dev/null | python3 -c "<READY 순회>"
```
- exit 0. 출력: READY 20건. 최상단 production:
  `ls-crude-mjuogtw9n-...`, SHA `e89e215…`, author `Noah TaeHwan Oh`,
  createdAt `1789024756176`.
- 판단: 마지막 정상 production = e89e215.

```
vercel alias list -S noah-tae-hwan-s-projects 2>&1 | grep -E "^  ls-crude\.vercel\.app|vercel\.app +[0-9]" | head -10; echo "---exact-prod---"; vercel alias list -S noah-tae-hwan-s-projects 2>&1 | grep "ls-crude\.vercel\.app" | head -5
```
- exit 1(마지막 grep 무매치). 출력: 브랜치 alias 행 + `---exact-prod---` 뒤 공백.
  판단: alias 목록 페이지 내 production 도메인 미표시 → inspect로 직접 확인.

```
vercel inspect ls-crude.vercel.app 2>&1 | head -25
```
- exit 0. 출력: `ls-crude-mjuogtw9n-...`로 해소. id
  `dpl_DLmUxTBBQV3tjQEbDkXKS15b7ihK`, target production, status Ready,
  created `Thu Sep 10 2026 16:19:16 KST`,
  Aliases에 `https://ls-crude.vercel.app` 포함.
- 판단: **운영 = mjuogtw9n = e89e215** (JSON meta + alias + 아래 footer 3면 일치).

```
vercel inspect ls-crude.vercel.app 2>&1 | grep -iA3 -E "meta|git|sha|commit" | head -20
```
- exit 0. 출력: Aliases/Builds 행만, meta 섹션 없음. SHA는 JSON meta(e89e215)로 확정.

## C5. 운영 화면 footer (Step 4)

```
curl -s -o /tmp/ls-home.html -w "http=%{http_code} bytes=%{size_download}\n" "https://ls-crude.vercel.app/?cb=ops01"; grep -o 'build [a-f0-9]* · [a-z]*' /tmp/ls-home.html | head -2; echo "---ego---"; command -v ego-browser >/dev/null 2>&1 && echo "ego-browser: present" || echo "ego-browser: absent"
```
- exit 0. 출력: `http=200 bytes=688472`. build 패턴 무매치(React 주석 노드 때문 — 아래에서 해소). `ego-browser: present`.
- 판단: HTTP 200만으로 장애 여부 단정 안 함. ego 존재 확인 → ego로 footer 대조 진행.

ego-browser heredoc (전문):
```
ego-browser nodejs <<'EOF'
const task = await taskSpace("ops-01 footer check");
const page = task.page("p1");
await page.goto("https://ls-crude.vercel.app/");
await page.waitForLoadState();
const footer = await page.evaluate(() => {
  const el = document.querySelector(".desk-build");
  return el ? el.textContent.replace(/\s+/g, " ").trim() : null;
});
console.log(JSON.stringify({ url: await page.url(), title: await page.title(), footer }));
await task.finish({ keep: [] });
EOF
```
- exit 0. 출력:
  `{"url":"https://ls-crude.vercel.app/","title":"LS CRUDE — 공개 신호를 찾는 연구 데스크","footer":"build e89e215 · main"}`.
- 판단: JS 렌더 확인. 운영 footer = e89e215. 브라우저 추가 조작 없음.

```
grep -o -E "build [a-f0-9]{7}" /tmp/ls-home.html | head -3; echo "---any sha---"; grep -o -E "e89e215|cecf1cf|b981ceb" /tmp/ls-home.html | sort | uniq -c; echo "---footer context---"; grep -o -E ".{0,40}desk-build.{0,120}" /tmp/ls-home.html | head -3
```
- exit 0. 출력: `1 e89e215` +
  `<p class="desk-build">build <!-- -->e89e215<!-- --> · <!-- -->main</p>`.
- 판단: curl 본문과 ego 렌더 일치. 운영 = e89e215 확정.

## C6. 계보·종료 시각

```
git merge-base --is-ancestor e89e215ff0811296ffc5e1dd2ebfed56044d5f08 cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef && echo "e89e215-ANCESTOR-OF-cecf1cf" || echo "ANCESTRY_UNVERIFIED"; git merge-base --is-ancestor b981cebe52e52a327ae7d34ad7844f5630b443e4 cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef && echo "b981ceb-ANCESTOR-OF-cecf1cf" || echo "ANCESTRY_UNVERIFIED"; date -u +%Y%m%dT%H%M%SZ
```
- exit 0. 출력: `e89e215-ANCESTOR-OF-cecf1cf`,
  `b981ceb-ANCESTOR-OF-cecf1cf`, `20260911T034203Z`.
- 판단: 운영(e89e215)과 로컬(b981ceb) 모두 원격(cecf1cf)의 조상.
  "뒤처짐" 확정. 네트워크 동기화 없음.
