# 연구 OS setup — 검토와 검증 기록

검토일: **2026-09-07 KST**. 기준 HEAD: `5958306e8c4af943165f2a77a4ad422b8dc1975c`. 작업 브랜치: `docs/research-os`. 먼저 초기 setup 검증을 기록하고, 마지막 절에 이후 요청된 브랜치 통합 전 전체 회귀 확인과 장부 복구를 추가했다. 후보 수집·지수 구축·외부 접근 재감사·앱 배포·발표 완료의 증거가 아니다.

## 목표별 인수 확인

| 요구 | 구현과 직접 확인 표면 |
| --- | --- |
| 목적·비목표·피자 패턴의 의미 | [README](../README.md), [방법론](research-methodology.md): 실물 활동 → 맥락 → WTI 가설, 피자 복제·양의 결과 의무 없음 |
| 후보 추가·기각·차단·재개 | [기록 규약](recording-standard.md), [후보 카드](../research/candidates/_TEMPLATE.md): 상태/판정 분리, 동일 경로·변경 이력, 담당·다음 날짜 |
| 모든 후보 필수 항목 | 가설·활동/맥락·출처·접근/ToS/윤리·가용성·raw/차단·단위/빈도/지역/집계·검정/결과·판정·다음 행동 포함 |
| 빈 상태 준비 | [원장](../research/candidates/ledger.csv) 13열, 실후보 0행·예시 0행. 기존 factors/노트 보존 |
| 원본과 파생물 분리 | [INTAKE](../research/INTAKE.md), [indexes 양식](../research/indexes/_TEMPLATE.md): raw 불변, processed 분리, 입력/출력 hash·명령·환경·인계 |
| WTI 검정·누수·증거 | [검정 규약](testing-protocol.md): IS 내부 시간 분할, OOS 노출, available_at, 미래 타깃·lag 정의, 전체 검정·placebo·최소 표/그림 |
| PM 범위·일정·위험·담당·의존성 | [일별 계획](project-plan.md): 09-07~09-15 모든 날짜, 09-13 근거 동결, 09-14 리허설, 09-15 08:30 준비·09:00 발표. 역할 수락은 미확인으로 표시 |
| 지수 없이 시연 | README의 기존 064 기각 → 070 보류 → 감사 노트 → 재개 조건 동선. 원문 판정·링크를 읽어 확인했으며 외부 자료를 재취득하지 않음 |

PM(Senior Project Manager), Research(Research Synthesist), Specialized(Workflow Architect)가 범위/초안/통합 검토를 분담했다. 메인 에이전트가 문서·실행 출력·변경 범위를 직접 재확인했다. 이는 AI 공동 검토이며 Noah·성찬이 일정이나 연구 결과를 수락/재현했다는 뜻이 아니다.

수정 후 Specialized가 지적 항목과 이 영수증을 다시 읽고 **setup 목표 PASS, 추가 결함 없음**으로 보고했다. PM도 일별 담당·의존성·마감·미수락 상태를 읽어 요구사항 충족을 확인했다. 메인 에이전트의 최종 파일·원장·링크 확인을 함께 완료했다.

## 리뷰에서 고친 항목

| 발견 | 수정·재확인 |
| --- | --- |
| 기존 입구가 crypto×news와 옛 후보 수로 안내 | 신규 원장으로 연결, 기존 pizza-hunt·설계 색인은 역사 문서로 표시. 기존 결과 내용은 유지 |
| 존재하지 않는 rejected/blocked 폴더 안내 | 원장의 상태 필터로 통일. 카드 복제/이동 없음 |
| gathering의 신규 raw 날짜 폴더 규칙 불일치 | 후보 ID/UTC 수집시각 경로로 통일, 기존 폴더는 보존 |
| 구성 전 출력 해시 요구 | 출력 예정 경로는 사전 기록, hash는 실제 구성 후 기록 |
| 기각한 검정까지 NOT_RUN으로 읽히는 안내 | 실행 후 KILL은 RUN·실제 N·결과를 보존. 미실행만 NOT_RUN |
| OOS 기본 표기 불일치 | 후보 양식의 기본값을 UNKNOWN으로 통일 |
| 압축된 날짜도 받아들이는 원장 검사 | YYYY-MM-DD 정규식과 실제 날짜 유효성을 함께 검사 |

## 실행 증거

Python 3.13.15. 모두 로컬에서 실행했고 원본 수집기·앱 빌드·스냅샷 생성기는 실행하지 않았다.

### 원장·상태 조회

[기록 규약](recording-standard.md)의 PYCHECK 및 PYVIEW 코드 블록을 그대로 실행했다.

```text
PASS: 원장 구조 0행 (연구 성과 검증 아님)
신규 OS 후보: 0 (기존 factors 이력 제외)
판정: {}
기각 []
차단 []
탐색 중 []
```

CSV 요약 13열, 카드에 대응하는 요약 필드 12개와 record_path 형식을 확인했다. 카드의 전체 연구 필드는 수동 검토했다. 이 검사는 약관·원본 진위·상관계수·증거 단계의 사실성을 자동 인증하지 않는다.

### 잘못된 기록을 거부하는지 확인

같은 PYCHECK 코드를 임시 디렉터리의 **EXAMPLES ONLY 메타데이터**에 실행했다. 실제 원장·후보 카드·시계열을 생성하거나 변경하지 않았다.

| 검사 입력 | 기대 | 관찰 |
| --- | --- | --- |
| 헤더만 있는 원장 | 허용 | PASS |
| 형식이 맞는 예시 카드·원장 | 허용 | PASS |
| decision=PASS | 거부 | PASS |
| 같은 후보 ID 두 행 | 거부 | PASS |
| 연결 카드 없음 | 거부 | PASS |
| RUN인데 결과 파일 없음 | 거부 | PASS |
| 카드/CSV 판정 불일치 | 거부 | PASS |
| next_review_date=20260908 | 거부 | PASS |
| owner 빈 칸 | 거부 | PASS |

재현할 때는 기록 규약의 PYCHECK를 임시 작업 폴더에서 실행하고, 위 입력을 한 번에 하나씩 바꾼다. 정상/빈 입력은 exit 0, 7개 잘못된 입력은 모두 nonzero였다. 검사 코드가 문서에 남아 있으므로 별도 패키지·검사 프레임워크는 추가하지 않았다.

### 기존 시간 분할·시점 정렬 회귀

저장소 루트에서 실행:

```bash
cd research
.venv/bin/python -m pytest tests/test_splits.py tests/test_wiki_pageviews_asof.py
```

```text
collected 9 items
tests/test_splits.py ..
tests/test_wiki_pageviews_asof.py .......
9 passed in 1.35s
```

범위는 기존 IS/OOS 경계와 위키 신호의 이전 날짜·다음 세션 정렬이다. 신규 후보의 검정 성공이나 as-of 적격성을 뜻하지 않는다.

### 저장 경계·링크·변경 범위

- `git check-ignore --no-index --stdin`으로 신규 raw CSV·processed CSV가 제외되고 raw README·index 명세는 추적 가능한 경로임을 확인했다. 예시 경로만 검사했으며 파일은 생성하지 않았다.
- 핵심 운영 문서 전체와 기존 문서에서 추가/수정한 링크의 로컬 대상·명시된 heading anchor **157개**를 검사해 통과했다. 역사 문서의 옛 본문이나 외부 URL 접근 가능성까지 검증한 것은 아니다.
- `git diff --check` 통과. 변경은 연구 문서·양식과 헤더만 있는 CSV에 한정했다. 앱·연구 소스·기존 테스트·팩터·원본·DB 변경 없음.
- 앱/타입 빌드·브라우저·배포 검증은 이 docs-only 변경에 해당하지 않는다. 공개 웹의 상태 또는 신규 CSV의 웹 자동 반영을 주장하지 않는다.

## 아직 하지 않은 일

신규 후보 선정, 외부 데이터/약관 재감사, 지수 생성, WTI 검정, 사람 팀원의 재현·역할 수락, 발표 자료와 리허설은 이후 실제 작업으로 남는다. 새 원장 0행은 탐색 성과가 아니다. 다음 결정과 담당·마감은 [PM 계획](project-plan.md#완료-판정과-남은-결정)에 명시했다.

## 브랜치 통합 전 전체 회귀 확인 — 2026-09-07

사용자가 커밋·푸시·PR·머지·main 동기화를 요청한 뒤 finishing-a-development-branch 절차로 전체 테스트를 실행했다. 초기 setup의 제한된 검증과 구분한다.

첫 실행에서 연구 테스트 35개와 앱 타입체크·빌드는 통과했지만 앱 테스트 2개가 장부 구성 오류로 실패했다. 기준 HEAD와 작업 파일을 바이트 비교해 동일한 기존 문제임을 확인했다: research/factors/README.md의 검정표는 75행, 카드 표는 81행이며 076~081의 검정표 연결이 없었다.

앱의 부분 장부 거부 규칙을 유지하고, 기존 076~081 카드의 판정·미검정 상태를 검정표에 6행 추가했다. 076은 기존 타깃별 검정표를 참조하고, 077~081은 수치 없이 HOLD로 연결했다. 새 검정·성과 수치는 생성하지 않았으며 기존 카드와 연구 코드는 변경하지 않았다.

| 실행 | 관찰 결과 |
| --- | --- |
| research: `.venv/bin/python -m pytest` | **35 passed**. 다른 작업에서 남은 pytest 임시폴더 정리 권한 경고 15건; 테스트 실패 없음. 해당 폴더는 변경하지 않음 |
| app: `npm run typecheck` | 통과 |
| app: `npm run build` | 복구 후 client/SSR 빌드 통과 |
| app: `node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs` | 복구 후 **4 passed, 0 failed**. 장부 파서와 로컬 서버 경로 확인 |
| 기록 규약 PYCHECK의 예시 입력 검사 | 정상 2개 허용, 잘못된 입력 7개 거부; 신규 원장은 계속 0행 |

최종 변경 범위에는 위 연구 문서의 6행 복구가 포함된다. 앱·Python 구현·테스트·개별 팩터 카드·가격 자료·DB는 변경하지 않았다. GitHub CI·PR 머지·원격 main 동기화는 각각 실제 서버 상태로 확인하며, 이 로컬 검증만으로 원격 완료를 주장하지 않는다.

## Closeout 중 후속 082 재발 — 2026-09-07

동시 연구 커밋 `31041b9`가 082 카드를 추가하고 검정표를 빠뜨려 카드 82/검정표 81행이 됐다. [실패 CI](https://github.com/Noah-TaeHwan/ls-crude/actions/runs/34086147288)를 확인하고 [PR #52](https://github.com/Noah-TaeHwan/ls-crude/pull/52)에서 기존 HOLD/untested를 한 행 연결했다. 앱 재빌드·테스트 4개와 [main CI](https://github.com/Noah-TaeHwan/ls-crude/actions/runs/34086976201)가 통과했다. 새 수치나 파서 완화는 없다. 최종 감사는 최초 성공 SHA에 머물지 않고 live remote의 후속 변경도 대조해야 한다.
