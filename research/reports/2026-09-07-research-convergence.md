# 병렬 연구 통합·보관본 복구 — 2026-09-07

PR #56·#57의 원장 38개 후보와 PR #58의 추가 검증 기록을 보존하고, 미발행 포지셔닝·관심도 탐색 8개를 39–46으로 편입했다. 원장과 불일치했던 카드 2개는 47–48로 분리했다. 원장은 48행이며 KEEP 4 / PARK 34 / KILL 10이다. 같은 제공자의 다른 구성·실행 이력도 포함하므로 48개의 독립적 발견을 뜻하지 않는다. KEEP은 후속 연구 배정이며 알파 인증이 아니다.

## 복구 출처와 번호

복구 출처는 `stash@{0}`의 원본 SHA `44fff2e595c62c25d185363be6bf1e984b94632b`와 별도 보관 폴더 `positioning-attention-wip`이다. stash에는 README·원장·출처 표 3파일이 있고 untracked 부모는 없다. 보관 폴더에는 카드·실행기·원본·영수증 103파일이 있었다. 아래 이름을 대조해 같은 연구의 이어진 판본임을 확인했다.

| stash 당시 | 보관 폴더 | 통합 ID | 내용 |
| --- | --- | --- | --- |
| 09 | 18 | [39](../candidates/ALT-20260907-39.md) | COT WTI 순포지셔닝 |
| 10 | 19 | [40](../candidates/ALT-20260907-40.md) | 에너지 문서 관심도 |
| 11 | 20 | [41](../candidates/ALT-20260907-41.md) | 북미 리그 수 |
| 12 | 21 | [42](../candidates/ALT-20260907-42.md) | BTS 화물 TSI |
| 13 | 22 | [43](../candidates/ALT-20260907-43.md) | 석유 철도 적재 |
| 14 | 23 | [44](../candidates/ALT-20260907-44.md) | 싱가포르 벙커 판매 |
| 15 | 24 | [45](../candidates/ALT-20260907-45.md) | 인구가중 냉난방도일 |
| 16 | 25 | [46](../candidates/ALT-20260907-46.md) | EIA-930 전력수요 |

보관본 카드의 최신 필드를 원장에 넣었다. 39·40은 COLLECTED/RUN/E2, 41–46은 BLOCKED/NOT_RUN/E1이며 전부 PARK다. 기존 18–29는 다른 작업이므로 덮어쓰지 않았다. 이전 노트의 짧은 번호 09–16과 전체 16행이라는 문구는 해당 실행 시점의 기록이다. 링크는 통합 경로로 바꿨다.

추가로 기존 37·38의 원장에는 야간광·BDRY가 있었지만 카드에는 COT·소매 휘발유가 들어 있었다. 원장의 37·38 요약을 상세 카드에 연결하고, 다른 연구인 COT·소매 휘발유 카드와 `/tmp/hippocamp-untracked-quarantine`의 대응 실행기·그림·원본을 [47](../candidates/ALT-20260907-47.md)·[48](../candidates/ALT-20260907-48.md)로 보존했다. 두 카드의 기존 KILL은 그대로이며 새 실증 판정이 아니다. 격리본 전체 36파일도 별도 tar와 hash 대조로 보존했다.

39·40의 월별 processed CSV는 기본 체크아웃의 이전 09·10 폴더에 남아 있었다. 과거 실행 receipt의 전체 SHA-256과 일치함을 확인하고 새 경로에도 복사했다.

## 원본과 재현 경계

- 원본·CSV·JSON 계획/영수증·그림은 보관본 바이트를 유지했다. JSON 안의 이전 candidate_id, cwd, command, 경로와 SHA는 당시 실행 메타데이터다. 위 대응표로 현재 경로를 찾는다.
- 현재 `.py`와 Markdown의 전체 후보 ID·경로만 이동에 맞게 바꿨다. 따라서 과거 receipt의 code_sha256은 현재 코드의 hash가 아니다. 원래 코드는 검증한 보관본에 남는다.
- 39 실행기의 무조건 참인 assert와 파일 부재를 cutoff 검증으로 세던 self-check를 실제 산식·합성 2024년 입력 거부 검사로 바꿨다. 실제 OOS 자료나 새 연구 결과를 만들지 않았다.
- 원본과 큰 processed 파일은 계속 gitignored다. 로컬 보관본은 `/Users/noah/.local/share/ls-crude-closeout/20260907-0745/`이며 Git bundle 및 파일별 SHA-256 manifest로 복원 가능성을 확인했다. 비밀정보나 원문을 Vault에 복제하지 않는다.
- PR #58의 ALT-10–13 `run_is_frozen.py`와 실행 결과는 역사적 연구 기록으로 보존했다. 현재 기본 체크아웃에는 해당 run의 원본 파일이 없고 README만 남아 있어, 당시 `--check` 성공을 이번 closeout의 재현 성공으로 재사용하지 않는다. 새 원본을 받으면 해당 receipt의 입력 hash부터 대조한다. CI와 일반 회귀 테스트 통과는 이 네 연구 실행의 재현을 보증하지 않는다.
- ALT-13 frozen 실행기의 일별 관측행을 `5행=1주`로 이동한 표는 거래일 집계와 다를 수 있다. lag의 달력 해석과 실제 공개 빈티지는 미검증이며 그대로 PARK다.
- 통합 구조 검사에서 ALT-31의 result_path가 디렉터리임을 확인했다. 실험 000은 구성 명세이고 구체적 WTI 검정 영수증은 미확인이므로 RUN/E2를 NOT_RUN/E1으로 정정했다. 비교군 KEEP과 기존 SEEN 표시는 유지했다.

## Git 이력 보존

PR #58은 `79527460394e9ab31f0bfb5d8ef566322fcd6975`의 CI와 연구 테스트 35개를 확인한 뒤 `5af83d849452571c4587fc784dc29ad6985ea7c3`으로 머지했다.

로컬 petrel의 별도 커밋 `379940525bd41739974447a02dc12d00d7837269`는 43개 변경 경로 중 40개가 main과 바이트 일치했다. 나머지 원장 09–17 전 필드와 출처 추가 행도 main에 있었으며 README의 개수·이전 번호 안내는 통합 현황으로 대체돼 있었다. 현재 내용을 유지한 이력 병합으로 원본 커밋의 조상 관계를 보존했다. 원본 커밋은 전체 Git bundle에도 있다.

## 다시 실행할 검사

```bash
cd research && .venv/bin/python -m pytest -q -p no:cacheprovider
# 저장소 루트에서 docs/recording-standard.md의 PYCHECK
research/.venv/bin/python research/notebooks/ALT-20260907-39/hunt.py check
research/.venv/bin/python research/notebooks/ALT-20260907-40/hunt.py check
cd app && npm run typecheck && npm run build
node --test tests/defcon-sample.test.mjs tests/deployment-cwd.test.mjs
```

역사 연구 수치의 재판정, 실제 공개 시점 패널 구축, 사람의 후보 선정은 별도 후속 연구다. 이번 통합은 연구 산출물과 작업 이력의 보존·접근성 회복이다.
