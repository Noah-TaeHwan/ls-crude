# 석유 철도 관측 — 독립 검토와 로컬 화면

검토 기록 시각: 2026-09-09T01:44:08.945771+00:00. 수행: 구현 메인, 독립 Reality Checker(`generalPurpose`, 이 하네스에 `reality-checker` enum 없음). 사람 검토 미실행.

이 보고서는 원본→계산→표/그림→로컬 화면까지다. git/PR/운영 배포는 별도 단계이며 여기서 완료로 쓰지 않는다. WTI 검정은 NOT_RUN이다.

## 독립 검토 — 원본·파서·원장

검토자가 파일을 수정하지 않고 명령을 재실행했다. 메인이 SHA와 동일 명령을 다시 확인했다.

| 범위 | 증거 | 상태 |
| --- | --- | --- |
| 원본 xlsx | SHA-256 `0e103085f77052e9f03b03dcd9184a2e9db7b5e459d0a2f8d85814813b206d6f`, 7,658,204 bytes. receipts `candidate_id` ALT-20260907-43 | PASS |
| 파서 self-test | `python3 research/notebooks/ALT-20260907-43/collect.py --self-test` | PASS |
| 재생 | `--run 20260909T003038Z`. CSV/quality/SVG 바이트 불변. 신규 `execution-20260909T013220843881Z.json`만 추가 | PASS |
| 표시 정의 | Petroleum Products originated, 미국 4사, 493주, 합 4,922,684. 불일치 0값/0주 | PASS |
| 마지막 주 2026-09-02 | BNSF 5712, UP 3351, CSX 1504, NS 883 | PASS |
| 연도 표 | 2017=40주, 2026=35주. 연도 4사 합 = quality 합 | PASS |
| 원장 | 68행, KEEP 7 / PARK 50 / KILL 11. 43은 COLLECTED/NOT_RUN/E2/KEEP | PASS |
| 로컬 Markdown 링크 | 카드·노트·index README·v2 README | PASS |
| WTI | quality·카드·UI 모두 NOT_RUN | NOT_RUN |
| 운영 URL | 이 검토 시점 `ls-crude.vercel.app?sample=petroleum-rail`은 수박 폴백·SVG 404 | NOT_RUN |

옛 `research/indexes/ALT-20260907-43/access-receipt.json`의 `candidate_id`는 ALT-20260907-22다. 덮어쓰지 않았다.

## 메인 재검증 — 로컬 프로덕션 화면

사용자 `localhost:5173`은 `/Users/noah/orca/ls-crude` main 워크트리라서 이 브랜치가 아니다. 죽이지 않았다. 이 체크아웃의 `app/build`를 `127.0.0.1:4173`에만 올렸다. 브라우저 자동화는 ego-browser task space 94만 사용했다.

| 범위 | 증거 | 상태 |
| --- | --- | --- |
| 연구 `?sample=petroleum-rail` | 제목, plot id `petroleum-rail-plot`, 스탬프 과거 연구 샘플, 마지막 주 5,712/3,351/1,504/883 | PASS |
| 슬라이더·화살표 | 첫 주 2017-03-29 BNSF 5,965. ArrowRight 두 번 2017-04-12 5,307. JSON과 일치 | PASS |
| 연도 표 | details 펼침 후 2017 40주·2026 35주, CSV와 동일 | PASS |
| 잘못된 sample | `not-a-case` → 수박 + USDA 403 aside | PASS |
| 사례 전환 | 수박·제주·도일·철도 왕복. 수박 403 aside 유지 | PASS |
| 홈 | WTI 7기간, 홈에서 철도 샘플 전환, 가로 넘침 없음 | PASS |
| 390·320px | overflowX false, plot·readout 유지 | PASS |
| 운영 배포 | 이 단계에서 미실행 | NOT_RUN |

검수 후 4173 서버는 종료했다. 5173은 보존했다.

## PR #92 재병합 후 화면 (ego task 96)

PR #92가 상단 단독 관측 카드를 없애고 홈을 소개 → WTI 일봉 → 통합 자료 탐색으로 바꿨다. 충돌은 그 레이아웃을 유지한 채 석유 철도를 고정 사례로 붙였다. 사용자 5173은 보존했고, 이 체크아웃만 `127.0.0.1:4173`에서 다시 검수했다.

| 범위 | 증거 | 상태 |
| --- | --- | --- |
| 홈 사례 버튼 | 수박·제주·도일·LA항·석유 철도·시정·탱커. 기본은 수박. FIELD NOTES 없음 | PASS |
| 철도 전환 | `?sample=petroleum-rail`, 마지막 주 2026-09-02 BNSF 5,712 · UP 3,351 · CSX 1,504 · NS 883 | PASS |
| 첫 주 탐색 | native range 0 → 2017-03-29 BNSF 5,965 · UP 2,108 · CSX 1,172 · NS 924 | PASS |
| empties·시정·탱커 | 각각 plot/관측 id, 철도 plot 없음. unknown sample → 수박+USDA aside | PASS |
| 390·320px | overflowX false, 철도 plot 유지, WTI 7기간 | PASS |
| Yahoo 일봉 | 같은 뉴욕 날짜 완료봉+장중봉이 전체를 버리던 함정. 후속 시각으로 교체. User-Agent `ls-crude-observations/1.0` | PASS |

검수 후 4173은 종료했다. 5173은 보존했다.

## 남은 제약

- 주별 최초 공표일·개정 패널 없음 → `asof_safe=NOT_PROVEN`, WTI 부적격
- 2024+ 140주 SEEN. 미열람 OOS로 소급 금지
- Petroleum Products 차종 ≠ 원유 배럴. 미국 4사 ≠ 산업 합계. AAR RTI 표시 금지
- KEEP은 효과 인증이 아님. 사람 배정은 제안
- Git 병합·운영 SHA·운영 화면은 이 절 작성 시점에 미실행. 아래 전달 영수증이 채워지면 갱신한다.

## PR #95·#96 재병합

PR #95는 고정·갱신 자료를 홈 `/?sample=`로 모으고 `/research?sample=`을 308로 보낸다. PR #96은 EIA 쿠싱 주간 재고 수집·그림이며 자료 탐색 버튼을 추가하지 않는다. 석유 철도는 홈 고정 사례로 유지하고 SAMPLE_LINKS만 `/?sample=petroleum-rail#research-sample`로 맞춘다. `/Users/noah/orca/ls-crude`는 `fix/wti-session-tail`에 미커밋 WTI 파일이 있어 이 작업이 그 워크트리를 바꾸거나 강제 동기화하지 않는다.
