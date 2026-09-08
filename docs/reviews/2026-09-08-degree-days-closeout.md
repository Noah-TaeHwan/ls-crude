# pacu 감독 검토 — CPC 도일

## 범위와 담당

원래 pacu OpenCode 작업자를 재사용했다. 감독자는 원본·계산·코드·웹·Git을 직접 확인한다. 연구 결과는 repo empirical only이며 WTI 관계 검정은 NOT_RUN이다.

- Orca Run: `run_f62843798616`
- 1차 작업: `task_d41ddc5d1203` / `ctx_248e97b092d8`
- 추가 교정: `task_bfe235b04111` / `ctx_7c20ef6b7663`
- 마지막 교정: `task_76dda5708693` / `ctx_12d5977c2bf2`
- 원래 작업자: `term_ff09b95d-2b2f-4e97-9438-e9b74585172a` (사용자 터미널 보존)
- 작업자 소유: CPC 파서·수집 영수증·v2 산출물·관련 연구 기록.
- 감독자 소유: 기존 웹 사례 연결·표시 데이터·테스트·최종 검토·프롬프트·Git 전달.

## 확인한 문제와 교정 기준

1. 난방 자료를 냉방으로 받아들이고, 인구가중 구간의 미국 행이 없으면 다음 가중 구간으로 넘어갔다. 종류·구간·정확한 지역 토큰·중복·월 표기를 거부하는 음성 검사를 요구했다.
2. 자체 전년차 산술은 맞지만 제공기관 전년차와 192개 비교값 중 20개가 달랐다. 발생월은 14개월이다. 두 값을 함께 보존하고 원인은 미확인으로 남긴다.
3. 첫 실패와 중간 중단에 수집 영수증이 남지 않을 수 있었다. 요청 전 초기화·요청별 원자적 기록·중단/403/429 이후 중지를 요구했다.
4. 1차 완료 보고에도 “20개월”과 중단 처리 문제가 남았다. 2차에는 이전 성공 영수증은 남지만 중단 요청 자체가 누락됐고 SVG 각주가 길었다. 완료를 승인하지 않고 같은 작업자에게 구체적 교정을 다시 맡겼다.
5. 기존 PR의 검토 완료 주장과 카드의 미실행 상태가 달랐다. 최종 검증 뒤 정본을 맞추며 사람 검토와 AI 검토를 구분한다.
6. API·최초 빈티지 부재는 고정 과거 사례를 표시하지 못할 보편적 이유가 아니다. 기존 수박·제주 사례 옆에 월자료와 자체/제공 전년차를 연결한다.

## 산출물

- [v2 연구 산출물](../../research/indexes/ALT-20260907-45/20260908T120546Z/v2/README.md)
- [표시 데이터 v2](../../research/indexes/web-observations/v2/README.md)
- [갱신된 전달 프롬프트](../ai-research-delivery-prompt.md)

## 검증 상태

로컬 검증 PASS. CI·Git 병합·운영 배포는 PR의 마지막 상태와 아래 전달 영수증을 별도로 확인한다.

- 원본216파일·1,648,944bytes: SHA/용량 전수 일치. 기존 CSV/quality/SVG 불변.
- 별도 원문 파싱 대사: 월합계108×2, 자체 전년차96×2, 제공기관 전년차108×2 전수 일치. 불일치20값/14개월 재확인.
- `collect.py --self-test`, v1 재현, v2 두 번 재현: PASS. 중단1/3행, 403 첫요청/429 세번째요청 뒤 중지 포함. 모의 수집만, 새 네트워크 수집 없음.
- `export_observation_charts.py --write/--check`: PASS. 수박·제주 JSON은 v1과 바이트 동일.
- 후보 원장 self-test/write/check: PASS, 68행(KEEP6/PARK51/KILL11).
- app typecheck/build 및 Node tests: 23/23 PASS. 연구 pytest:36/36 PASS (공용 pytest 임시폴더 정리 권한 경고35개; 테스트 실패 없음, 무관한 폴더는 건드리지 않음).
- Ego 320/390/768/1440px: 가로 넘침 없음, 월별/전년차 축과 범례 표시. Home키 첫해 자체차 결측, ArrowRight13회로2016-02 자체-223/제공-255 차이 안내 확인.
- [화면·DOM·대사 증거](../design-evidence/degree-days-closeout/). 실제 iOS/VoiceOver 검수는 미실행.

작업자 인계: 세 번째 dispatch는 제공자 rate_limit_exceeded가5회 반복됐다. Escape 입력 후 재시도 종료 화면을 확인하고 dispatch를 abandoned로 fence했다(터미널은 보존). 감독자가 파일 소유권을 인계받아 남은 중단 요청 기록·검사·SVG각주를 마쳤다. 이를 작업자 성공으로 기록하지 않는다.


## 전달 영수증 — 2026-09-08 13:45 UTC

- [PR #85](https://github.com/Noah-TaeHwan/ls-crude/pull/85) MERGED, merge `fcffb2c877eaed0a91b451c7b97896352fc93d31`. 연구·앱 CI 및 Vercel 프리뷰 PASS.
- local main / origin/main / 실제 remote main을 위 SHA로 대조했다. root/main 및 pacu 체크아웃은 clean이며 사용자 pacu 터미널/워크트리를 보존했다.
- Production `dpl_3APQ9fMZ1h2qGPnV2c7hV9DhHbKv`, target production, Ready. 배포 SHA는 위 merge SHA이며 `ls-crude.vercel.app` alias를 확인했다.
- Ego로 운영 `/research?sample=degree-days`에서2016-02 자체-223/제공-255·차이 안내·월 그래프2개·가로넘침 없음 확인. 로컬5173도 같은 SHA와 값이다.
- 로컬 서버는 root/main에서 재시작해 유지하고 테스트용5187은 종료했다.
- 운영 footer가 빌드용 임시 Git 브랜치 `master`를 표시한 것을 발견했다. 후속 수정은 Vercel 배포 메타데이터의 SHA/브랜치를 먼저 사용한다. 실제 데이터나 병합 상태에는 영향이 없었다.

이 영수증은 위 시점의 증거다. 후속 커밋의 CI/배포는 해당 PR의 최신 상태를 확인한다. 감독·자료 교정·웹 사례·프롬프트 전달 목표는 충족했고, 제공자/자체 차이의 원인과 최초 공개 빈티지 복원은 후속 연구다. WTI 관계는 여전히 NOT_RUN이다.

배포 메타데이터 우선순위 재현(피처 브랜치에서 실행해도 main 표시):

```bash
cd app
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
process.env.VERCEL_GIT_COMMIT_REF='main';
process.env.VERCEL_GIT_COMMIT_SHA='fcffb2c877eaed0a91b451c7b97896352fc93d31';
const {default:config}=await import('./vite.config.ts');
assert.equal(config.define.__LS_BUILD_BRANCH__,JSON.stringify('main'));
assert.equal(config.define.__LS_BUILD_SHA__,JSON.stringify('fcffb2c'));
JS
```

위 검사·타입 검사·빌드·Node23개 검사를 직접 통과했다. 배포 메타데이터 없는 로컬은 기존 Git 경로를 사용한다.
