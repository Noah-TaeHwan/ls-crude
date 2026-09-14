# ORCHESTRATOR STATE

## 2026-09-14 제출 마무리 현황

- 대시보드에 공개 지수·입력 준비2·추가 제출검토3·보고서 정정 대기를 구분했다. 계산값·산식·기존 모델 결과는 변경하지 않았다.
- 현재 정본: [진행·남은 작업·최종 제출 조건](CLOSEOUT.md), [성찬님 짧은 보고서 피드백](MESSAGE_SEONGCHAN.md). 보고서 수정본 수신·최종 대조·제출은 완료로 표시하지 않는다.
- 이번 작업은 웹·문서 정리이며 새 수집·학습·최종 OOS·메시지 발송은 하지 않았다.

## 실험용 CAI v0.1 — 결과물 연결

- 사용자 승인(2026-09-13 ㄱㄱ): 기존 교통·DMR와 고정 산식으로 실험용 지수를 대시보드에 표시.
- 산출: 2023-12-29 43.1, 입력53.0/33.1 각50%, 전체2262일 중1003유효·1259결측. 현재값·WTI확률 아님.
- 정본: research/indexes/cai-v0.1/README.md, definition.json, manifest.json; 공개 app/app/data/cai-public-view.json.
- 계산은 기존 정규화·정렬 재사용이며 새 수집·라벨·모델학습·OOS 실행 없음. 기존 일별 모델·성찬 제출 검토 상태 유지.


2026-09-11 기준 오케스트레이터 재개용 짧은 상태. 정본은 `tasks.json`, 작업 방법은
`execution/catalog.json`, 제품 요구는 `WEBSITE_PLAN.md`, 구현 인터페이스는
`execution/contracts/PUBLIC_VIEW.md`. 진행 상태를 이 파일에 복제하지 않는다.

## 현재 — 후보 준비에서 CAI 결과물로 이어지는 UX 보완

- 주 흐름: 106자료→33후보→준비된입력→조합/학습→CAI 대시보드. 2번자체목록,4번준비/제안,5번실제사용입력,6번결과물 CTA를 분리한다.
- 긴 실험·검증은 아래접기 #past. 기존 #experiments 링크 유지. 공통프로그램과 디스코드문안은 TEAM_START_HERE/MESSAGE_SEONGCHAN이 정본.
- work.processing은 ready/in_progress/pending/review/excluded. 준비2와후속제안4는 다르며,실험사용2는기존run근거에서읽는다.
- 검증근거: execution/runs/TEAM-01/20260913/flow-followup.md. 현재공식지수값은준비중이며임의생성하지않는다.

## 현재 — 공동 작업 패키지와 6단계 카드 (2026-09-13)

- 공동 작업 진입점: [TEAM_START_HERE](TEAM_START_HERE.md) → [33개 작업표](CANDIDATE_WORKLIST.md) → [프롬프트](TEAM_PROMPTS.md). 발송 초안은 [MESSAGE_SEONGCHAN](MESSAGE_SEONGCHAN.md), 미발송.
- UI는 6개 독립 카드·큰 번호·목적·현재 결과·다음 행동으로 구분. 원래 anchor/hash/Back 유지.
- 담당 제안은 태환 SPP, 성찬 공항/숙박세/판매·사용세. 수락·착수 미확인으로 예정이며 완료는 기존 TMAS/DMR 2개뿐이다.
- `cai_team.py check/package`: 기존 engine 유지, 같은 5일/seed7/분할/6모델 규약과 입력·저장 결과를 검사하고 제출4파일 생성. 학습/패키징 환경 구분. 검사 통과는 권리·측정타당성·독립 재현/PIT 승인 아님.
- 웹308/연구57·typecheck/build·Ego1440/390·키보드·Back PASS. 실제2019 run 읽기 검증·패키징, 새 수집/학습/OOS/발신 없음. 사용자용5173 서버 유지.

## 현재 — 연구 기준·대표 재현·설명 연결 (2026-09-13)

- 재개 입구: [연구 브리프](RESEARCH_BRIEF.md) → [2019 보강 재현](../../research/experiments/cai/REPRODUCE_2019.md) → 작업 원장 REP-02.
- 대표 기존 run `20260912T013423Z`; 이번 같은 환경 재현 `20260912T233055Z`. 입력2종·모델6종 전체 결과·내부 예측 exact match, 학습753/평가245. 원출처 재취득·성찬님 독립 재현은 미실행.
- 원래 기획의 2021년 학습 종료와 실제 고정 config의 2020년 종료 차이를 표시했다. 이전 기획 일정만으로 최종 OOS를 실행하지 않는다.
- DATA-01은 성분 채택·대표성·공개 적격성만 REVIEW. 완료된 TMAS 보강·DMR 문서 조사를 다음 행동에서 제거했다. OPS-01은 읽기 진단 DONE이며 CI 결제 복구와 별개다. UI-06 현재 지수·미래 확률은 TODO 유지.
- 개발서버: `/Users/noah/orca/ls-crude/app`, http://127.0.0.1:5173/ — 사용자 확인용 **유지 대상**. 새 원본/모델 실험·메시지 발송 없음.
- 오프라인 요약은 `python3 research/scripts/build_cai_research_brief.py`로 공개 요약·고정 config에서 재생성하고 `--check`로 대조한다.
- 아래 “현재” 절들은 제목의 날짜·배치 당시 역사다. 최신 next_action으로 재실행하지 않는다.

## 현재 — 배치 P/Q: 2019 보강 실험 + 로컬 현황 화면 (2026-09-12)

- **2019 보강(로컬)**: TMAS AVC040 2019 12개월 335,158,128B → 누적 1,670,449,699B(2GiB). 2019 결측 7일
  (01-31, 03-10, 04-08~11, 07-30), 결측 hour 0. v2 입력 sha `c9522c23…`(기존 `98d5761d…` 보존).
- **실험**: `pilot_retro_traffic_dmr_2019.config.json`, run `20260912T013423Z` — 6/6 done,
  train 507→753, **eval 245 동일**. market 대비 CAI Δll: equal +0.002401(이전 +0.005668),
  learned +0.004177(이전 +0.013792) — **이득 없음 유지**(격차 축소, 인과 해석 아님).
- **로컬 현황 화면**: 연구 기록 상단 `#local-status`(full) + 홈 compact, **5초 폴링(읽기 전용)**,
  dev 전용·프로덕션 404 가드. 작업·다운로드·run·입력·성찬님(미확인)·차단·결과·화면 반영 표시.
  `2019년 학습 자료 보강 전후` 블록도 연구 기록에 반영. 테스트 158/158·typecheck/build 0·ego 검수.
- 근거: `research/scripts/build_local_status.py`, `local-status-current.json`, manifest·run_state·inputs만 읽음.
  % 미표시(분모 없음), 화면 확인 시각과 작업 활동 시각 분리. push·배포 없음, 5173 유지.
- 성찬님 검토 요청 초안: `MESSAGE_SEONGCHAN.md`에 추가(미발송). 원장 24(DONE 19/REVIEW 2/TODO 3).

## 현재 — 운영 전환 확인 (2026-09-12)

- main 병합(PR #194/#195)이 Vercel Git 연동으로 **Production에 자동 배포**됨.
  최신 Production `ls-crude-kogdx4hnb…`(main@1167173 기준)를 소유자 세션으로 검수:
  홈 요약·`/research#experiments`(753·232·C 미학습·독립 재현 대기)·`/history`·모바일·콘솔 0·노출 0.
  QA-02·REL-01을 v0 범위로 DONE 처리, UI-06(현재 CAI/예측 연결)은 TODO 유지.
- 원장 24(DONE 21/REVIEW 2/TODO 1). 5173 프리뷰는 종료됨(정리 완료).

## 현재 — 배치 M: 직접 실행·화면 연결·발표 v0 마감 정리 (2026-09-12)

- **실행**: 사용자 터미널에서 `pilot_retro_traffic_dmr` 1회(`--no-cache`). 사용자 선행 run
  `20260911T150106Z` + 이번 run `20260911T150404Z` — 동일 spec `905f1174`, code `79aff9062f62`,
  6모델 전부 done(train 507, eval 245, elapsed 0.24~0.27s). blocked/failed 없음.
- **화면 연결**: `scripts/build_cai_display_summary.py --out <path>` → `app/app/data/cai-experiment-summary.json`
  갱신 → 5173 반영(홈 요약·`/research#experiments`, 콘솔 0·누출 0). 생성기 재실행 결과는 app 요약과
  내용 동일(타임스탬프 제외) — 새 run은 생성기 소스 목록에 추가하기 전까지 표시에 자동 포함되지 않음.
- **TODO 정리**: UI-06=회고 연결 완료·현재 지수/예측은 승인 대기, QA-02=v0 QA 완료·전체 QA는 UI-06/릴리스 승인 대기,
  REL-01=Preview 완료·운영 전환은 CI 결제 해소+승인 대기. 원장 24(변동 없음), DONE 수 조작 없음.
- 5173 유지(PID 28156). 학습·다운로드 실행 중 아님(서버만 상시). 웹 요약 파일은 로컬 수정(미커밋) 상태.
- **결정(2026-09-12, 로컬 우선 확정)**: GitHub 유료 플랜·Actions 초과분 결제·결제수단·예산 변경 없음.
  승인된 개발·실험·테스트·화면 확인은 로컬에서 계속. “10월 1일까지 전체 대기”가 아니며, 무료 할당량이
  초기화되거나 CI가 정상화돼도 **자동 배포하지 않음**.
- **원격 CI 상태**: 현재 실행 차단(결제/한도) — 확인 범위: 9월 Actions Linux 2,342/2,000분 초과,
  job step 0 즉시 실패. **로컬 검사 PASS(테스트 148/148·tsc·build)와 원격 CI 미실행은 별도 기록.**
  실패 재실행·예산 진단 반복 없음. 예약 워크플로 중지·주기 변경도 자동 실행하지 않음.
- **운영 전환**: 사용자 재승인 대기 — 이전의 “CI 해소 시 추가 승인 없이 병합·운영 전환” 지시는
  이번 로컬 우선 결정으로 **보류**(무료 할당량 초기화·CI 정상화 시에도 자동 진행 금지).
- **기존 연구·제품 작업**: 승인 범위 안에서 계속 가능(재현·검수·로컬 화면/문서). 새 push·PR 병합·
  배포·권한 변경은 별도 요청 전 실행하지 않음. 기존 공유본(cai-exp 311f8ba)과 Vercel Preview는 보존.

## 현재 — 배치 L: 입력 생성 도구 공유·재생성 확인 (2026-09-11)

- `share/cai-exp-0.1.0 @ 311f8ba`: 파일럿 입력 생성 도구 7종 공유(TMAS download/parse_volume/
  parse_stations/monthly_quality/build_window_index, DMR dmr_series_build, scripts/build_pilot_inputs)
  + `REPRODUCE_SENS.md`에 도구 경로·전체 체인 명령·생성 확인 수준 연결. 개인 절대경로 제거.
- **로컬 재생성 확인(수준 1)**: 기존 로컬 원자료만으로 두 CSV 재생성 → 기존 입력과 byte-identical
  (traffic `98d5761d…` 61개월 패널, dmr `251aa9e6…`). 외부 원출처 신규 취득(수준 2)·성찬님 독립
  재현(수준 3)은 **미실행**. 재배포·분석 문구는 여전히 미확인.
- 원자료·입력 CSV·내부 예측 CSV는 미포함. 실험·웹·수치 변경 없음, 5173 유지.
- 원장 24(DONE 19/REVIEW 2/TODO 3).

## 현재 — 배치 K: 전달 안내 문서 정정 (2026-09-11)

- `REPRODUCE_SENS.md`를 최신 원격 상태로 정정해 `share/cai-exp-0.1.0 @ d4574cb`(문서 전용 커밋,
  코드 커밋 `55ab480`·실행 코드 fingerprint `79aff9062f62`와 구분)에 반영·원격 확인.
  - 삭제한 낡은 표현: "아직 push 안 함", "미공유 로컬 변경", "민감도 참조는 로컬에만 있음".
  - 민감도 참조 대응(파일명 순서 아님): `sens_20260911T132949Z`=A_62(validity 62, market ll 0.697094),
    `sens_20260911T132951Z`=B_31(31, 0.696162) — 로컬 provenance validity로 검증.
  - compare 왼쪽 경로는 위 실제 경로, 오른쪽은 `data/processed/091-cai-exp-sc/<run_id>`(실행 후 ls/status로 확인).
  - 입력 CSV 미포함·TMAS 파서 스크립트 미공유(다음 동기화 후보)·기대 해시·접수일≠공개일 유지.
- Preview 공식 Share: Vercel 문서의 "Sharing a Preview Deployment"(Toolbar/dashboard Share) 안내 확인.
  현재 계정(개인 팀)에서 개별 초대 가용성은 대시보드 확인 필요 — 초대·보호 변경·결제 미실행.
- 실험·웹·수치 변경 없음, 전체 테스트/재배포 없음. 5173 유지. 원장 24(DONE 19/REVIEW 2/TODO 3).

## 현재 — 배치 J: 최신 연구·웹 공유 마감 (2026-09-11)

- **연구 공유**: `share/cai-exp-0.1.0 @ 55ab480` — sens_dmr62/31/0 config, 진단 스크립트,
  최신 테스트, REPRODUCE_SENS.md, 민감도 참조 요약 2건 push·원격 tree 확인. 입력 CSV는
  재배포 미확인으로 미포함(공식 원출처 취득 안내만).
- **웹 공유**: `work/ui-05-s2a @ fcc2370` push, PR #194(draft) 갱신. Vercel Preview
  `ls-crude-e1z8j8eon…`(Ready, alias `ls-crude-git-work-ui-05-s2a…`).
- **원격 내용 검수 통과**(소유자 세션): 홈 회고 요약 카드, `/research#experiments`
  (905/507·공통 232·C 미학습·SELF_CHECK·독립 재현 대기), `/history` 렌더, 390 overflow 0,
  콘솔 오류 0, 절대경로/원자료 노출 0. 운영 도메인 전환은 미실행(REL-01).
- 성찬님 전달 메시지 초안: `docs/cai/execution/runs/EXP-04/20260911T133500Z_DISPLAY/MESSAGE_SEONGCHAN.md`
  (미발송). 남은 접근 조건: Preview 개별 공유(팀/보호 설정, 승인 필요), 입력 CSV 재배포 문구 확인.
- 5173 유지. 원장 24(DONE 19/REVIEW 2/TODO 3). 독립 재현·공식 CAI 채택·운영 전환은 별도.

## 현재 — 배치 I: 성찬님 주말 결과 인수 + 회고 결과 대시보드 연결 (2026-09-11)

- **인수**: `SEONGCHAN_CAI_WEEKEND_RESULT.txt`(9b9e7307…)·`seongchan_cai_weekend_engine.py`(2862eb09…)
  해시 일치, 미실행 보존. 대조 기록 `DATA-01 M2/incoming-seongchan-weekend-intake.md`.
  문서는 본인 ZIP에 공통 자산이 없어 56.28/50.53%를 미재현이라 명시(한 것: as-of/PIT·측정 의미·
  적격성·5거래일 중첩·82/18%는 합성 가중치라는 경고).
- **엔진 차이(A–E)**: 중앙값 대체 결측, 전체입력 validate, 바깥 학습구간 표준화+내부 80/20,
  라벨 경계 검사 없음, CAI=z 가중합(0–100 아님) → **별도 방법 비교**(재현 아님). 아이디어만 후속 보존.
- **대시보드**: 실제 run에서 생성한 `app/app/data/cai-experiment-summary.json`(c30c2a2c…) 서버 로더 →
  홈 compact 카드 + `/research#experiments` 전체(교통/교통+DMR 분리, 민감도 A/B/common 232/C skipped,
  SELF_CHECK·독립 재현 대기). 테스트 148/148, build 0, ego 검수(링크·anchor·390/1280·콘솔 0).
- **재현 기준**: `REPRODUCE_SENS.md` 로컬 완성(대상 구분·정확한 파일명·compare 범위). sens config·
  최신 테스트·요약은 미공유, share는 `c9fbba3` 유지(이번 push 없음). 입력 CSV 미공유(재배포 미확인).
- 5173 유지. 원장 24(DONE 19/REVIEW 2/TODO 3).

## 현재 — 배치 H: DMR 재사용 기간 민감도 (2026-09-11)

- 정책 A(62일)/B(31일)/C(당일) 비교, 바꾼 것은 DMR `validity_days`뿐(입력·타깃·분할·seed 고정).
  run 폴더 `docs/cai/execution/runs/EXP-04/20260911T132918Z_SENS/`(PREREGISTRATION·mapping·진단),
  모델 run `research/data/processed/091-cai-exp-sens/{132949Z(A),132951Z(B)}`.
- 진단: A train 507/val 245, B 476/232, **C 24/12 → 사전 기준 미달 SKIPPED**(학습 안 함).
- 결과: A는 배치 F 수치 재현. B는 정확도 ↑(0.547)지만 주 지표 log loss·Brier 소폭 악화.
  공통 232일에서 DMR 값 완전 동일(값 변화 0) → 차이는 학습 표본(507→476)에서 발생,
  CAI 추가는 두 정책 모두 악화(+0.0055~0.0149), 가중치 DMR 집중 유지.
- 결론: **유지 기간을 줄여도 개선을 확인하지 못했다.** 최종 OOS·게시 없음. 테스트 20/20.
- 다음: 잔여 812MB 교통 확대 여부(별도 승인) 또는 현 상태 발표 준비. 5173 유지.

## 현재 — 배치 G: 파일럿 마감·재현 패키지 (2026-09-11)

- 두 파일럿(교통 `20260911T130235Z`, 교통+DMR `20260911T130219Z`)을 **확정 참조 run**으로
  고정: code `79aff9062f62`, spec `7208a9315bc8`/`905f1174e52b`, 입력 sha `98d5761d`/`251aa9e6`.
- **사전등록 시각 정정**: config의 22:05 KST 선언은 오기(mtime 22:00:59/22:02:19/22:02:35),
  traffic config는 첫 결과 확인 후 match_components 1건 수정 → **회고 탐색(사전등록 시각 미확인)**.
- 표현 정정: 파일럿 실행/공식 채택·독립 재현 별도, [0,1]=경계값, 원인 미확정,
  DAILY MX 정의, DMR 원관측 train 47/val 37 → 행 1,000/753(모델 507/245), 교통 1,326/363(905/245).
- 재현 패키지: share `c9fbba3`(REPRODUCE_PILOT.md + 참조 결과 2건), tarball `202a2cff…`.
  데이터 CSV는 FHWA/EPA 재배포 문구 미확인으로 미포함 → 경로 B(원출처 직접 취득·동일 필터).
- Preview: 개인 프로젝트(팀 1개) — SSO 유지, 외부 개별 초대는 플랜 확인 필요(미실행).
- 5173 유지. 원장 24(DONE 19/REVIEW 2/TODO 3). 다음 실험 후보: DMR 반복 사용 정책 ablation.

## 현재 — 배치 F: 시점 정렬 수정·첫 실측 회고 파일럿 (2026-09-11)

- **정렬 버그 수정**(외부 리뷰 지적): `shift(행)` → `align_availability()` 달력 가용일.
  가용일 열 우선(CONFIRMED_RECEIVED_DATE), 가정은 ASSUMED_LAG_DAYS, 회고 관측일은
  RECORDED_OBSERVATION_DATE. validity_days 제한 내 재사용만, 역방향/무제한 채움 없음.
  테스트 19/19(신규 7). 정본은 관리 원본 `research/src/ls_crude/experiment`.
- **비교 확장**: market+CAI(equal/learned) 추가, 계수·절편·scaler·train_rows 저장,
  match_components로 학습·평가 행 일치.
- **DATA-05**: TMAS 2015-2018 47파일 964.5MB → 누적 1,335,344,550B(2GiB 62.2%).
  AVC040 45/48개월(2016-09/10/11 0건), 결측 hour 0.
- **EXP-04 파일럿**(회고, eval 2023 n=245):
  - 교통 단독(train 905): baseline .4735/.6937, market .5102/.6970, cai_equal .4735/.6939,
    market_cai_equal .5102/.6970 → CAI 추가 이득 없음.
  - 교통+DMR(train 507): market .5184/.6971, cai_learned weights **[0,1]** ll .7110,
    market_cai_learned [0,1] .7109 → 학습 가중치 DMR 붕괴·악화(반증 사례).
  - 최종 OOS 미실행, 외부 게시 없음.
- 성찬님 재현: share 브랜치 코드 갱신(정렬 수정·파일럿 config 포함), 입력 CSV는 DMR
  재배포 조건 미확인으로 보류 — 데이터 접근 결정 필요.
- 5173 유지(PID 28156). 원장 24(DONE 19/REVIEW 2/TODO 3).

## 현재 — 배치 E 후속: 성찬님 수락 반영 (2026-09-11)

- 성찬님 **역할 수락**(2026-09-11, 사용자 전달): 태환=TMAS 확대·동일가중 기준지수·
  대시보드·배포 / 성찬=측정 정의·공개시점·학습 가중·반증·해석. 같은 shared config로
  양쪽 실행 후 compare 재현부터. 발표는 현재 증거상 시나리오 3(분석 진전 시 갱신).
- 참조 shared run 2건을 share 브랜치 `reference/`에 추가 → `share/cai-exp-0.1.0 @ 7c867a3`,
  tarball 재생성 `afbbfb35…` (delivery_verify.json 갱신).
- 태환 승인 대기 2건: ① as-of 규칙(available_at 없으면 PIT 입력 제외 — PIT 자격 규칙이며
  학습 기간 부족을 해소하지 않음) ② Preview 공유 방식(SSO — 플랜/초대 필요 여부).
- 성찬님 메시지 사실관계는 기록과 일치(56.28/0.6872 vs 50.53/0.6894, 748행 비독립,
  RETROSPECTIVE, CAI blocked, 누출검사=온라인 일치, 도서관 CONTROL_ONLY).

## 현재 — 배치 E: 후보 2종·기술통계·전달 묶음 (2026-09-11)

- **DATA-04 DONE**: DMR(실측 규제 로그, 18 permit) 계열별 행수 회계 — South STP MGD가
  최우선(train 34/val 25, 라벨 유효 후), 3자(DMR·TMAS·WTI) 공통은 2023뿐. SPP는 약관
  (상업·게재 서면 허가) + `portal.spp.org` TCP 타임아웃으로 **0바이트·우회 없음**.
  run `docs/cai/execution/runs/DATA-04/`, index `research/indexes/091-candidates/20260911T102736Z/`.
- **EXP-03 DONE**: 교통 기술통계/차트(앱 미연결) + 행수 회계 train **43행**·val **245행**
  → 교통 단일 성분 **기간 부족**(baseline·market 반복 없음). 정정 A–D 문서화
  (as-of=ASSUMED, 대표성≠WTI 상관, 기간 부족, 시나리오 3은 현재 증거 상태).
  전달 묶음: `share/cai-exp-0.1.0 @ 647c976`, 타르볼 `research/dist/cai-exp-0.1.0.tar.gz`
  (`89eec4a3…`), 클린 venv 검증 validate·12 tests·demo 4설정. run
  `docs/cai/execution/runs/EXP-03/20260911T104028Z/`.
- 웹 PR #194·a5a3a93·Preview Ready 유지(재배포 없음). Preview는 Vercel Authentication
  보호(302) — 내용 검수는 소유자 세션 필요, 보호 해제·초대는 미실행.
- 다음 결정 3: ① TMAS 2015-2020 확대(잔여 한도 내) ② Preview 공유 방식(개별 공유 가능성
  플랜 확인 필요) ③ DMR South STP 가용일 규칙 확정.

## 현재 — 배치 D: 주말 준비·TMAS 확대·Preview 배포 (2026-09-11)

- **DATA-03 DONE**: AVC040 2023 12개월 + 2020-03 프로브. 12/12개월 존재, 결측 hour 0,
  방향 3·7·차로 1, 이중계산 0. 2020-03은 fixed-width(페이지 설명과 불일치, 파일 기준).
  2020↔2023 좌표 일치. 누적 370.8MB(2GiB 17.3%). 공개시각 unknown 유지 → 모델 입력 금지.
  raw `research/gathering/raw/091-tmas/20260911T082500Z/`, receipt
  `research/indexes/091-tmas/20260911T082500Z/`, run `runs/DATA-03/`.
- **EXP-02 DONE**: RETROSPECTIVE/PIT 모드 계약 + `compare` 도구(테스트 12/12).
  주말 묶음 config 3종, 제안문·명령서(미발송). 태환 측 5설정 실행(shared .5628/.6872,
  market .5053/.6894, CAI blocked), 재실행 캐시 hit. 장기 실행 없음. run
  `research/data/processed/091-cai-exp-tw/…`, `runs/EXP-02/20260911T085023Z/`.
- **REL-02 DONE**: 커밋 `a5a3a93`(28파일) push, draft PR #194, Vercel Preview 29s Ready
  (`dpl_6L3rJvtGsWWKCkGxX7wfu89C1Lg1`, root=app). Preview는 SSO 보호(302) — 내용 검수는
  소유자 세션 필요. 운영 전환은 REL-01 별도.
- **수신물**: CUSHING_LIBRARY_ACTIVITY_CONTROL_V2_ROBUST_bundle.zip(해시 일치, 통제용,
  입력 pin 없음). 인수 기록은 DATA-01 M2 run.
- 원격 main `cecf1cf` 불변(main 자체는 미변경), CI는 결제/한도로 4s 실패(기존).
- 다음: 성찬님 수락 시 `COMMANDS.md` 실행 → compare 재현성 검사. TMAS 해제 작업 3
  (as-of 규칙 승인·대표성 상관·2016 메타). 운영 배포는 Preview 확인 후 별도 승인.

## 현재 — 배치 C: 두 메뉴·TMAS·실험 프로그램 (2026-09-11)

- **UI-07 DONE**: 메뉴 2개(대시보드·연구 기록). 대시보드 3값 집중·빈 상태 compact·
  `CAI란?` 기본 접힘. `/research`=`#current`+`#past` 통합, `/history` 직접 진입 유지,
  `?candidate=` 단일 308→`/history#ledger`. 테스트 146/146, typecheck/build 0,
  ego 검수(콘솔 0, 390/1280 overflow 0, 스크린샷 /tmp). run `runs/UI-07/20260911T082000Z/`.
- **DATA-02 DONE**: TMAS 40km 내 AVC040(9.16km, Payne) 선택, 2016-03·2023-03 파싱
  (결측 0·중복 0·단위 vehicles/hour). 공개시각 unknown → 모델 입력 금지 유지.
  raw `research/gathering/raw/091-tmas/20260911T075705Z/`, receipt
  `research/indexes/091-tmas/20260911T075705Z/`, run `runs/DATA-02/`.
- **EXP-01 DONE**: 프로그램 `research/src/ls_crude/experiment/`(validate/demo/run/status),
  테스트 10/10. 실제 IS 748행: baseline acc .5628/ll .6872, market acc .5053/ll .6894
  (기준선 열위), CAI 2종 blocked(적격 컴포넌트 없음). OOS 잠금. run
  `research/data/processed/091-cai-exp/20260911T081503Z/`, `runs/EXP-01/`.
- 원격 main `cecf1cf` 불변, PR 0, 커밋·push 없음. 5173 유지(PID 28156).
- 다음: 주말 배치 후보 = TMAS AVC040 2023 12개월 패널 확대(그 관측소·IS·2GB 한도),
  컴포넌트 적격성(이용 조건·공개시각) 확인 시 CAI 모델 해제. 최종 OOS·게시 불가.

## M2 — 첫 CAI 데이터 구성·실행안 결정 (2026-09-11)

- 결과: **NEED_SCOPE_DECISION**. run `docs/cai/execution/runs/DATA-01/20260911T075500Z_M2/`
  (RESULT.md, candidate-manifest.draft.json, quality-check.py·out).
- 판정: LAUE(Payne 월 고용) 확인·조건부(월간 139개월·결측 1) / STAX 4개월 부적격 /
  QCEWQ 노동 중복·분기 / KUSH 관심 / DMR 규제 로그. 합성 후보 없음 → GO 아님.
- 추천(기본안): 첫 release를 "Payne County 고용 활동 기준선 v0(월간·단일지표)"로 범위 축소.
  물리 활동 유지 시 대안: STAX 전방 수집 + DMR 집계 규칙.
- 검수: 독립 read-only 검토 PASS_WITH_NOTES(사실오류 5건 반영, 명세 2건 보강).
- 원격: origin/main `cecf1cf`(=기준), 열린 PR 0, 성찬님 커밋은 이미 포함. 새 통합 대상 없음.
- 다음: 사용자 결정(범위·명칭·주기) + 성찬님 검토 요청(문안 준비됨, 발송 안 함).
  UI-06은 IDX-01 실측 run·권리·게시 승인 부족으로 착수 불가 유지.
- **수신물(2026-09-11)**: 성찬님 `~/Downloads/cai-webapp` + `cai-webapp-all-in-one.zip`
  (SHA-256 `68d0175a…`, 236 files — 디렉터리와 바이트 동일). 감사 결과 실측 시계열은 없음
  (자기 테스트·합성 중심). 외부 리뷰 지적 재확인(echo 상수·eiaWeekly 상한 부재·ADS-B 라벨·
  explainWeights·oneShotWti). **추천 갱신: NEED_TARGETED_DATA** — 첫 실제 작업 = FHWA TMAS
  쿠싱 인근 연속교통 획득·파싱 run(2015–2025, 공식 URL) + 무다운로드 CHAI↔DMR 입력 감사.
  상세: M2 run의 `incoming-seongchan-cai-webapp-zip-audit.md`. 원본 미수정·미실행·미복사.

## 현재 — M1 달성 + 로컬 사전검수 완료

- workspace: `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a` (branch `work/ui-05-s2a`)
- 기준 코드: `cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef` (원격 main=기준. 동기화 안 함)
- UI-05 7카드(S1a·S1b·S2a·S2b·S2c·S3a·S3b) 전부 DONE. 마지막 배치: S1b→S2c→S3a→S3b.
- 로컬 사전검수(2026-09-11): 5173 프리뷰에서 전 경로·메뉴·구주소·hash·뒤로가기·키보드·390/1280·
  콘솔 오류 0 확인. 독립 리뷰(Code Reviewer, 읽기 전용) REVISION(P1 anchor·P2 3건) → 최소 수정 →
  영향 테스트 28/28·typecheck/build exit 0 → 5173 재검증 통과. QA-02의 `local_precheck`에 기록.
- 로컬 화면: `/`=CAI 계기판·방향·WTI(실조회), `/research`=현재 CAI+후보+방법,
  `/history`=사례+결정 타임라인+보관 기록. 구주소·anchor·뒤로가기 보존(URL_COMPAT).
- 전체 테스트 141/141, typecheck/build exit 0. 브라우저 검수는 ego(build 서버 cwd=app).
- 다음 행동: UI-06은 자료·게시 승인 대기(선행조건 미충족). QA-02는 UI-06 또는 명시적
  빈 상태 release 승인 + S3b 완료 필요. REL-01은 QA-02·OPS-01 전제 + 배포 승인.
- 승인 경계: 로컬 UI-05 구현·통합은 사용자 위임(2026-09-11)으로 승인.
  커밋·push·PR·배포·브랜치/워크트리 변경·결제·권한 변경·신규 연구(수집·학습·OOS)는 미승인.
- 원격 차단(로컬과 분리): CI 결제/한도로 job 미시작, Vercel 일부 BLOCKED(원인 미확인).
- 팀: 손성찬 역할·연구 방향·공개 승인 미확인(임의 대체 금지).

## 개발 프리뷰 서버 (사용자 확인용 — 유지 대상)

- preview_url: http://127.0.0.1:5173/ (127.0.0.1 바인딩만, 외부 공개 없음)
- workspace: `/Users/noah/orca/ls-crude-worktrees/ui-05-s2a` · branch `work/ui-05-s2a` ·
  code base `cecf1cfe…` + 미커밋 M1 변경(테스트 서버 아님, 실제 dev 서버)
- 명령: `cd app && npm run dev -- --host 127.0.0.1 --strictPort` (dev 스크립트에 `--port 5173` 포함)
- 실행 세션: Orca 터미널 `term_5f974c41-9078-46d9-ab0a-da49d392a7a7` (tab `3f1d7cf3…`, 제목 "LS CRUDE preview 5173")
- 프로세스: npm 런처 아래 react-router dev, listener PID `28156` (2026-09-11 15:39:38 KST 기동)
- 로그: `orca terminal read --terminal term_5f974c41-9078-46d9-ab0a-da49d392a7a7 --json` 의 tail
- 마지막 정상 확인: 2026-09-11 15:49 KST (`/`·`/history` 200, CAI 렌더, 콘솔 오류 0)
- 데이터: WTI는 실제 Yahoo 조회(101.09 USD), 테스트 fixture 미주입(NODE_OPTIONS 미설정).
  CAI·예측은 승인된 실제 run이 없어 —/산출 대기/예측 미실행.
- 운영 규칙: 이 서버 1개는 사용자 확인용으로 유지(배치 종료 정리 예외). 다른 TaskSpace·테스트
  서버·사용자 탭은 정리 대상이며 이 서버와 무관.
- 안전한 종료: `orca terminal close --terminal term_5f974c41-9078-46d9-ab0a-da49d392a7a7`
  (또는 그 터미널에서 Ctrl+C). 재시작: 위 workspace/app에서 같은 명령 실행 후
  `http://127.0.0.1:5173/` 확인.

## 도구 상태 (2026-09-11 정리)

- ego browser: 에이전트 TaskSpace 0개(사용 후 finish({keep: []})로 회수).
- Orca: ls-crude main worktree 터미널 1(이 오케스트레이터 세션), ui-05-s2a worktree 0.
- opencode 워커 모델(ls-crude 한정): `opencode-go/deepseek-v4.1-flash` + `variant: max`를
  `.opencode/opencode.json`(관리 루트·ui-05-s2a worktree)에 지정. 전역 기본(muse-spark)은 불변.
  적용은 opencode 재시작 후.

## 최근 run

- `runs/UI-05.S1b/20260911T064500Z/` — URL_COMPAT 표·hash replace·redirect 루프 방지.
- `runs/UI-05.S2c/20260911T070000Z/` — 홈 CAI 전환·세 메뉴.
- `runs/UI-05.S3a/20260911T071500Z/` — 현재 CAI 연구·검증 분리.
- `runs/UI-05.S3b/20260911T073000Z/` — 원장·결정 이력 history 연결(M1 완료).
- `runs/UI-05.S2b/20260911T055200Z/`, `S2a/..._R2/`, `S1a/20260911T060500Z/` 이전 배치.

## 코드 지도

- `app/app/lib/cai-view.ts`(S2a, 동결) + `.server.ts`(빈 리더), `cai-legacy-routing.ts`(S1b)
- `app/app/components/cai/{cai-gauge,cai-forecast,cai-about,cai-research,history-ledger}.tsx`
- `app/app/routes/{home,research,history}.tsx` + `routes.ts`
- 테스트 15개 파일(.github/workflows/ci.yml Test 목록)
