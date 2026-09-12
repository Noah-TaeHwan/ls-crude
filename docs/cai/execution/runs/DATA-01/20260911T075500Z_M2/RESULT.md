# 실행 결과 — DATA-01 M2 (첫 CAI 데이터 구성·실행안 결정)

```yaml
unit_id: DATA-01 (후속 run, M2)
run_id: 20260911T075500Z_M2
status: REVIEW
review_mode: SELF_CHECK + read-only 검토자(예정)
base_sha: cecf1cfe5cca8d1fa0cdfd3fa47208de5e316cef
workspace: /Users/noah/orca/ls-crude-worktrees/ui-05-s2a (읽기) + /Users/noah/orca/ls-crude (원격 조회·run 기록)
authorization_evidence:
  - "사용자 승인(M2 배치): 기존 파일 읽기·품질 점검·제한 fetch·구성 명세 초안 작성. 신규 수집·계산·학습·OOS·앱 연결 금지."
changed_files:
  - "docs/cai/execution/runs/DATA-01/20260911T075500Z_M2/RESULT.md (본 파일)"
  - "docs/cai/execution/runs/DATA-01/20260911T075500Z_M2/candidate-manifest.draft.json"
  - "docs/cai/execution/runs/DATA-01/20260911T075500Z_M2/quality-check.py·quality-check.out"
decision: NEED_SCOPE_DECISION
not_run:
  - "신규 시계열 다운로드·QSR 입력·정규화 적합·CAI 계산·학습·상관·OOS — 금지 범위"
  - "BLS 이용 조건 페이지 — HTTP 403 차단으로 미확인 유지(우회 안 함)"
  - "STAX 과거 백필 가능성 — OCR 비용·신뢰 문제로 미실행"
approvals_needed:
  - "범위·명칭·주기 결정(옵션 A 또는 물리 활동 정의 유지)"
  - "성찬님 역할·방향 수락"
  - "공개 전 BLS·OTC 이용·재사용 조건 확인"
```

## 1. 원격 코드·성찬님 작업 확인

- `git fetch origin --prune` 결과: **origin/main = `cecf1cf`** (= 우리 작업 기준 SHA). 새 통합 대상 **없음**.
- 열린 PR: **0건**(`gh pr list --state open`).
- 성찬님(`Liam_Son`) 커밋(`091 applied tracks first with weights`, `CFAM web`, `meme pinch` 등)은
  이미 origin/main에 포함 → 우리 기준에 **통합 완료**. 미통합 원격 브랜치는 prune으로 정리된
  `sungchan/*` 삭제분뿐(행동 불필요).
- 로컬 `main`(`b981ceb`)은 origin/main의 조상으로 뒤처져 있으나 동기화하지 않음(승인 밖).
- 코드 작업공간 미커밋 보존: `work/ui-05-s2a` HEAD `cecf1cf`, 변경 22경로(수정 10·신규 12).
  fetch 외 pull/merge/rebase/checkout/stash 없음. **보존 방법**: 이 워크트리 그대로 유지,
  아무 것도 커밋하지 않으면 untracked 포함 디스크에 남음(백업 필요 시 디렉터리 복사).
- 동료의 **미게시 로컬 작업**은 확인하지 않았음(원격 근거만).

## 2. 후보 판정 (A 파일 / B 로컬 분석 / C 과거 검증 / D 공개)

| 후보 | 역할 | A | B | C | D | 근거 요약 |
|---|---|---|---|---|---|---|
| LAUE (Payne 월 고용) | 활동 대리(노동) | 확인 | 조건부 | 미확인 | 미확인 | 139개월 연속(2015-01..2026-07), 결측 2025-10 null 1개·예비 2026-07. 이용 조건 미확인 |
| STAX (Cushing 판매세) | 지역 소비 | 확인 | **부적격**(4점) | 미확인 | 미확인 | 4개월(2025-08..2026-09)·10개월 공백·PDF OCR |
| QCEWQ (Payne 분기 고용) | 활동 대리(노동) | 확인 | 조건부 | 미확인 | 미확인 | 45분기 연속(2015-Q1..2026-Q1), 결측 0. LAUS와 동일 구성 |
| KUSH (라디오 관심) | **관심** | 확인 | 조건부 | 미확인 | 미확인 | 221개월(2008-02..2026-06), label "not activity" |
| DMR (시설 방류) | **규제 로그** | 확인 | 조건부 | 미확인 | 미확인 | 1722행, null 842, 단위 MGD/gal-d/null 혼합, 통계기준 혼합 |

제외/통제: KCUH 공항 운영(월별 0행), AADT(연간 1점), East Main(원본 JSON·source 기록 있음, receipt 부재·연간),
EMPTIES·rail·tankers(비쿠싱), PENR·SOIZ(연간), USGS·기상(통제), QSR(실측 0행·전방 수집 필요).

**직접 점검 범위**: 로컬 JSON·영수증 읽기, 행수·기간·정렬·중복·결측·단위·통계기준 집계
(`quality-check.py` 실행). 원자료·앱·과거 결과 수정 없음.

## 3. 추천 결론 — **NEED_SCOPE_DECISION**

이유: 첫 기준선에 쓸 수 있는 **월간·연속·장기 로컬 활동 계열은 노동 1계열(LAUE)** 뿐이다.
소비는 4개월, QCEW는 노동 중복(분기), KUSH는 관심, DMR은 규제 로그다. 즉 “쿠싱 활동”이라는
의도와 확보 자료의 측정 대상(카운티 고용)이 어긋난다. GO(합성 CAI)로 갈 근거는 없고,
필요한 것은 범위·명칭·주기 결정이다.

## 4. 사용자 결정 3묶음 (추천 포함)

1. **무엇을 측정할지** — 추천: 첫 release를 “Payne County 고용 활동 기준선 v0(월간,
   단일지표)”로 좁힌다(합성 CAI로 부르지 않음). 위험: 제품명(쿠싱 액티비티 인덱스)과
   범위 불일치가 남음 → UI 문구에 ‘기준선·단일지표’ 명시 필요. 승인 후: 아래 실행 명세 A.
   대안: 물리 활동 정의 유지 → 승인 후 실행 명세 B(전방 수집).
2. **다음 실행 형태** — 추천: 기준선 A(기존 자료, 즉시 가능). 위험: C/D 미확인 상태이므로
   공개 전 이용 조건 확인 필요. 승인 후: 로컬 탐색용 계산 run(IDX-01-baseline-v0).
3. **역할·공개 범위** — KUSH는 관심 표시 유지(점수 제외), DMR 규제 로그 유지(활동 승격은 별도
   가설·승인), QCEW는 분기 검증용, STAX는 보류. 공개 범위는 BLS·OTC 조건 확인 전 미정.

## 5. 성찬님 검토 요청문 (발송하지 않음)

> 성찬님, CAI 첫 기준선 범위만 빠르게 정하면 됩니다. 현재 로컬에 월간으로 연속된 활동 계열은
> Payne County 고용(LAUE, 2015–2026, 결측 1개월)뿐입니다. 소비(판매세)는 4개월, 노동 분기(QCEW)는
> 중복, 관심(KUSH)·규제(DMR)는 역할이 다릅니다. 제안: ① 우선 “Payne County 고용 활동 기준선
> v0(월간·단일지표)”로 좁혀 로컬 탐색 계산을 돌리고, ② 물리 활동을 유지하려면 STAX 전방
> 월간 수집과 DMR 집계 규칙을 다음 작업으로 잡겠습니다. 어느 쪽으로 갈지, 그리고 결과 공개
> 범위(요약/수치)에 대한 의견 주시면 그대로 명세에 반영하겠습니다.

## 6. 다음 실행 명세 (승인 시)

**옵션 A(추천) — IDX-01-baseline-v0 (로컬 탐색용, 앱 미연결)**
- 입력: `payne_laus_employed_monthly.json`(139개월, SHA-256 `a3d78e93…`) 하나. run 시작·종료 시 해시 재검증. 기간 2015-01..2026-07,
  참조 구간 2015-01..2023-12, 변환 = 경험적 percentile 0–100(참조 60개월 이상 요구).
- 결측: 2025-10 null 유지(보간·0 대체 금지). 2026-07 예비치는 값 유지+preliminary 플래그(참조 밖). 2024-01+는 이미 본 구간(SEEN) — 독립 검증 주장 금지.
- 산출물: `baseline_v0.json`(값·백분위·기간), `receipt.json`(입력 해시·규칙), 품질 노트.
- 검증: 행수·기간·결측 재현, 백분위 범위·단조성 검사, 앱/adapter 연결 금지.
- 중단 조건: 입력 해시 불일치, 결측 규칙 위반, 참조 구간 60개월 미만.

**옵션 B(물리 활동 유지 시)** — 전방 패널 동결 run: STAX 월간 전방 수집(4개월→forward),
DMR 단일 시설·단일 단위·단일 통계기준 집계 규칙 확정(다운로드 없음), QSR은 별도 관측 승인.
3개월 내 성분 2개 미달 시 범위 재검토.

## 7. 검수

- SELF_CHECK: 본 run의 수치·판정은 로컬 JSON·영수증 직접 집계(`quality-check.out`)로 확인.
- **독립 read-only 검토자(Code Reviewer 서브에이전트): PASS_WITH_NOTES.** 지적 7건 중 사실·정합
  5건(F1 STAX 결측 시작월, F2 KUSH retrieved, F3 DMR retrieved, F4 KUSH B판정 기준, F7 EastMain 문구)을
  반영했고, 명세 보완 2건(F5 입력 SHA-256 기록·재검증, F6 예비치 규칙)을 manifest에 추가했다.
  검토자가 quality-check.py를 재실행해 byte-identical 재현을 확인했고, 원격 실시간 상태·BLS 403은
  재검증하지 못했다(한계 명시).
- OOS·WTI·모델 성과 열람 없음. 신규 수집·계산·학습 없음.

## 8. 수신물 감사 (성찬님 cai-webapp, 2026-09-11)

- 별도 스택(TanStack Start) 앱 + 연구 스캐폴드. 실측 시계열은 사실상 없고 자기 테스트·합성 중심
  (`spp v4 synthetic_rows 110,880`, alt-proxy 70행 초기 0-채움). 제품 교체가 아니라 연구 입력으로 평가.
- M2 옵션 B의 첫 단계가 구체화됨: **FHWA TMAS Cushing 인근 연속교통(2011–2025 URL manifest 제공)**
  — 획득·파싱은 신규 수집이라 별도 승인 필요.
- 상세: `incoming-seongchan-cai-webapp-audit.md`. 앱 설치·실행·복사·성능 해석 없음.

## 9. 사람에게 보여줄 요약

**결론:** NEED_SCOPE_DECISION — 첫 기준선을 “Payne County 고용 활동 기준선 v0(월간·단일지표)”로
좁히는 안을 추천. 승인 시 즉시 로컬 탐색 계산 가능(옵션 A). 물리 활동 유지 시 전방 수집(옵션 B).
**근거:** LAUE 139개월 연속·결측 1, 나머지 후보는 기간·역할·품질 사유로 기준선 부적격/보류.
**필요 승인:** 범위·명칭·주기 결정 + 성찬님 방향/역할 + 공개 전 이용 조건 확인.

## 10. ZIP 인수 후 추천 갱신 (2026-09-11)

- `cai-webapp-all-in-one.zip`(SHA-256 68d0175a…) 확인: 기존 수신 디렉터리와 바이트 동일(236 files),
  안전 추출 후 미실행. 상세 `incoming-seongchan-cai-webapp-zip-audit.md`.
- 외부 리뷰어 지적 재확인: echo 상수·fallback 진단 경로, eiaWeekly 5년 상한 부재, history 날짜키 부재,
  ADS-B 36회 평균/‘지난달’ 라벨, explainWeights(z평균·WTI 아님), oneShotWti(규칙·CAI 아님).
- **추천 갱신: NEED_TARGETED_DATA** — 첫 실제 데이터 작업 = FHWA TMAS 쿠싱 인근 연속교통
  획득·파싱 run(2015–2025, 공식 fhwa.dot.gov ZIP), 동봉 무다운로드 CHAI↔DMR 입력 계약 감사.
  기존 M2 옵션(A: 고용 기준선)은 대안으로 유지되며, 이 갱신은 manifest `decision_followup`에 기록.
