# 성찬085 수박 원보고서 대사 후속

기록 시각 2026-09-09T00:33:56.570234+00:00. 기존 후보 ALT-20260907-36 하나의 후속이며 신규 후보 등록 없음.

## 후보 선택과 실행 범위

| 기존 후보 | 활동·시장 가설 | 원천·중복·다음 관문 | 선택 |
| --- | --- | --- | --- |
| 085/ALT36 수박 | 출하지 냉장차 가용성 → 디젤 물류 맥락; WTI 관계 미검정 | USDA WeeklyTruckAvailabilitybyOriginandCommodity.xlsx 이미 수집. 소수값/Date를 원보고서와 대사 | 이번 후속 |
| 080/ALT20 제주 | 두 연료 발전량 → 연료전환 맥락 | data.go.kr 15069334 기존 336일 확보. 세부 유류 구성·후속 동일 정의가 관문 | 기존 성과 중복 제외 |
| 090 오대호 | 결빙 → 물류 제약 맥락 | NOAA GLERL 이미 검정 이력. 실제 항로/물류 제약 근거가 관문 | 조건 변화 없어 재검정 제외 |

수박 PARK의 관계 검정을 재개한 것이 아니다. 정본에 명시된 원보고서 정의 확인을 시도했다. 과거 표본을 새 수집으로 세지 않는다. 최종 지수·양의 상관·WTI/HO 검정·복합지수·유료 변경은 범위 밖.

## 실제 접근 결과

[UTC run 영수증](../../indexes/ALT-20260907-36/20260909T002929Z/README.md): USDA 정책 URL 첫 GET 403, 뒤 datasets 요청 미실행. 신규 원본0, 신규 관측0. 공식 정책의 현행 예외를 이번에 재확인하지 못했다. 예전 수박 파생 표시를 유지하며 새 원문 재배포 없음. 권리 허가를 gitignore로 대체하지 않았다.

제목·지역·단위·기간·컬럼을 새 원보고서에서 확인하는 단계는 **BLOCKED**. 기존 관측일·파일 수정일·수집일 구분은 유지. 소수값 산식과 최초 공개일은 미확인이다. 정상 접근 회복 또는 제공기관이 허용한 경로가 확인될 때만 다시 시도한다.

## 발견한 함정과 수정

수집 영수증이 finally에서만 기록되던 문제를 요청 전 초기화·원자 갱신으로 수정했다. 요청별 시작/완료/HTTP/파일 SHA를 남기며 첫 실패·중단에서 뒤 요청을 실행하지 않는다. 원본을 덮어쓰지 않는다.

독립 검토가 발견한 음수 sharedStrings 참조·교차 행 셀 주소·공백 차이 중복 키를 거부하도록 수정했다. [검토 정본](../../../docs/reviews/2026-09-09-watermelon-source-reconciliation.md). 임의 지역·일부 행 누락의 의미상 완전성은 미검증이며 파서의 스키마 PASS와 구분한다.

기존 원본 회귀는 전체33339행/수박518행/409날짜, quality23필드, 두 CSV 해시, 연간 CSV 바이트 모두 동일했다. 이는 새 원천 대사 성공이 아니다. 원본은 main 체크아웃 보존 파일을 읽었으며 기존 파일 변경 없음.

## 웹 표시 결정

고정/오래된 수박 자료는 기존 과거 연구 사례를 유지한다. 같은 화면에 이번 원보고서 대사 차단과 재개 조건·영수증 링크를 추가한다. WTI 단일 일봉과 기존7기간은 변경하지 않는다. 신규 관측 카드·빈 차트·가짜 수치는 만들지 않는다.

## 완료 단계표

| 단계 | 산출물·증거 | 검토자 | 상태 |
| --- | --- | --- | --- |
| 현재 범위·기존 후보 비교 | 이 노트, clean huchen 4b84358 기준 | Main | PASS |
| 수집 안전성·음성검사 | collect.py --self-test, 독립 mock 직접 재실행 | Reality Checker + Main | PASS |
| 새 원본 확보·원보고서 대사 | 첫 HTTP403, 신규0 | Main | BLOCKED |
| 기존 정상 출력 회귀 | 원본 SHA·23필드·CSV 해시 동일 | Reality Checker + Main | PASS |
| 의미상 전체 지역/기간 적격성 | 외부 앵커 미확보 | Reality Checker + Main | BLOCKED |
| WTI/HO 검정 | 이번 미실행, 기존 노출 보존 | Main | NOT_RUN |
| 웹 구현·로컬 화면 | ego 390px 안내·키보드 날짜변경·넘침 없음; 앱 typecheck/build·23 tests | Main | PASS |
| CI·PR·병합·main 동기화 | [PR89](https://github.com/Noah-TaeHwan/ls-crude/pull/89), CI34296095179, main 3f8175d 세 SHA 일치 | Main | PASS |
| 운영배포·실제 화면 | dpl_12rgwcJEAofVCKDeDQdxjmbqBLHe READY/production, ego footer3f8175d·차단 안내 | Main | PASS |

전체 목표 **PARTIAL**: 신규 데이터 수집·대사·개별 그림 진전은 접근 차단으로 달성하지 못했다. 안전성 수정과 실패 전달은 별도 완료 증거로 평가한다. 다음 행동 하나: 정상 공식 접근 또는 허용 원보고서 경로 확인 후 같은 후보의 새 UTC run으로 대사를 재개한다.

## 로컬 검증 결과

- `npm ci`, `npm run typecheck`, `npm run build` PASS. CI와 같은 6개 Node 파일 23 tests PASS.
- 연구 환경의 `python -m pytest`: 36 passed, 35 warnings. 경고는 다른 pytest 임시 디렉터리의 정리 권한 문제로 타인 임시 파일을 변경하지 않았다.
- 원장 self-test/check: 68카드 PASS. `export_observation_charts.py --check`: 기존3개 표시 데이터·원본 해시·전행·집계 PASS.
- 첫 운영 서버 테스트는 baseline 장부 scores92/cards93 불일치로 실패했다. 빠진093행을 기존 카드 HOLD/미실행 근거로 연결한 후 동일 테스트3개와 전체23개 PASS. 검증 규칙 완화 없음,093의 새로운 연구 성과 없음.
- ego 모바일 390×844: 날짜 입력49→24, 2024-07-16의 0/1·0.0% readout 확인, 가로 넘침 false. `/tmp/huchen-mobile-snapshot.txt`, `/tmp/huchen-mobile.png`를 Main 직접 읽었다. 기본 캡처의 빈 이미지 문제는 같은 ego heredoc 내 `Page.captureScreenshot`으로 실제 렌더링 캡처를 확인했다.
- `graphify update .`: 5469 nodes/6870 edges 갱신, SQL 파서 미설치 경고. 그래프 정본 의미검토 완료를 뜻하지 않는다.
- 새 Markdown 로컬 링크 실파일 해석 PASS. 두 번의 명령 cwd 오류는 올바른 app/루트 경로에서 재실행했으며 성공으로 세지 않았다.

## 동시 작업 통합

PR #89 검토 중 main에 PR #88의093행 복원과 PR #87 도일 영수증 정정이 먼저 병합되었다. origin/main을 정상 merge하고093행은 main 정본 그대로 보존해 중복 수정을 제거했다. PR #89의 최종 diff는093행을 새로 추가하지 않는다.

## 병합·운영 전달 증거

- [PR #89 MERGED](https://github.com/Noah-TaeHwan/ls-crude/pull/89), merge `3f8175de3e0ecc0f7456deb54f3d16d52477f608`, 2026-09-09T00:43:08Z. [CI 연구·앱 SUCCESS](https://github.com/Noah-TaeHwan/ls-crude/actions/runs/34296095179).
- `/Users/noah/orca/ls-crude` main의 clean 상태를 확인하고 `git merge --ff-only origin/main` 실행. local main/origin/main/`git ls-remote origin refs/heads/main` 모두 위 merge SHA 일치.
- [Vercel 운영 배포](https://vercel.com/noah-tae-hwan-s-projects/ls-crude/12rgwcJEAofVCKDeDQdxjmbqBLHe): `dpl_12rgwcJEAofVCKDeDQdxjmbqBLHe`, READY, production. GitHub의 해당 commit 상태 URL과 `vercel inspect https://ls-crude.vercel.app --json` ID 일치.
- [실제 수박 화면](https://ls-crude.vercel.app/research?sample=watermelon#research-sample): ego snapshot과 렌더링 캡처에서 build `3f8175d`, 원보고서 대사 차단, 신규 관측 없음, 다음 조건을 Main이 직접 확인. `/tmp/huchen-production-snapshot.txt`, `/tmp/huchen-production.png`. 운영 가로 넘침 false.
- 로컬 실제 터치 날짜40→2025-08-12,1/3·33.3%·소수2개, 키보드 날짜49→24의 readout 확인. 1280×900 데스크톱 캡처도 직접 확인. 빈 자료 거부는 앱 단위검사, 실제 오래된 표본 표시는 ego 확인. VoiceOver 독립 검사는 NOT_RUN.
- 이 완료표를 반영하는 후속 문서 PR은 제품 코드를 바꾸지 않는다. 후속 문서 커밋의 CI·병합·동기화·최종 배포 상태는 해당 PR의 최종 closeout 영수증을 따른다.

**완료 판정: PARTIAL.** 수집기 안전성/기존 표본 회귀/차단 이유의 웹 전달과 제품 배포는 PASS. 신규 원본·소수값 의미 대사·새 개별 그림은 확보하지 못했다. WTI/HO 검정은 NOT_RUN. 다른 후보를 새 성과로 끼워 넣지 않았다.
