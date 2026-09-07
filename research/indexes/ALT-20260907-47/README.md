# 지수 정의/실행 영수증 — ALT-20260907-47 (CFTC WTI MM net positioning)

## 사전 정의

| 항목 | 값 |
| --- | --- |
| 후보 ID / 카드 경로 | ALT-20260907-47 / research/candidates/ALT-20260907-47.md |
| 버전 / 작성자 / 검토자 | v1 / AI joint-team (worker-2) / 오태환·손성찬 재현 대기 |
| 구성하려는 활동·WTI 연결 가설 | 화요일 CFTC 포지션의 Managed Money 순매수(net/OI)가 다음 5·20거래일 WTI 수익률을 앞서는가 |
| 원천 필드 → 산식 / 가중치 | `mm_net = M_Money_Long − M_Money_Short`, `mm_net_oi = mm_net / Open_Interest_All`. 가중치 없음(단일 계약) |
| 원천/지수 단위·빈도·지역·고정 바스켓 | 계약수·비율 / 주간(화요일) / NYMEX physical WTI 단일 계약(코드 067651, 2022년 개명 연결) |
| 집계·분모·기준기간·정규화·워밍업 | 분모 OI(동주). 정규화 없음. 워밍업 불필요(원천 집계 그대로) |
| 결측/실제 0/이상치·개정 처리 | 결측 주 없음(2015–2023 주 52×9 확인). 개정 이력 미복원 — 현재 파일 빈티지 그대로 사용, 한계로 기록 |
| observed_at / available_at / timezone | 관측 화요일 → 금요일 공개(CFTC 일정) → 다음 거래일부터 forward 창. America/New_York 공개, America/Chicago 결제 혼재는 일단위로만 정렬 |
| 선택/검증 기간·OOS 노출·동결시각 | IS 2015-01-01~2023-12-31. 2024+ 미수집·미열람(UNSEEN). 동결 없음(사전 등록 없이 실행한 탐색이므로 탐색으로 기록) |
| WTI 타깃·lag·event/placebo·전체 검정군 | 다음 5·20거래일 단순수익률(다음 거래일 시작). placebo 52주 순환 시프트. 사건 검정 없음 |
| KEEP/KILL/PARK 사전 판단 기준 | 사전 기준 미동결(탐색). 사후 판정: lead ≈ 0이고 placebo가 크면 lead 가설 종료(KILL) |

## 실행 manifest (20260907T065926Z)

| 역할 | 저장소 상대 경로 / 재취득 방법 | SHA-256 | 기간 / 행 수 | 시각·빈티지·권한 |
| --- | --- | --- | --- | --- |
| 원본 입력(COT) | research/gathering/raw/ALT-20260907-47/20260907T064937Z/fut_disagg_txt_2015..2023.zip (URL 패턴 재취득) | 통합 `2cf66d5e…` (연도별 hash는 raw README) | 2015–2023 주간 | 수집 2026-09-07 UTC. 현재 빈티지, 개정 미복원. CFTC 공개 |
| 원본 입력(WTI) | research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv | `89c3a04c…` | 2262일 | Yahoo CL=F, 2024+ 미포함 |
| 코드 | research/notebooks/ALT-20260907-47/run_cot.py | 실행 시점 worktree 기준(별도 hash 미기록 — 재실행 시 `git log` 대조) | — | venv pandas/matplotlib |
| 정제·지수 출력 | research/data/processed/ALT-20260907-47/20260907T065926Z/cot_wti_weekly_is.csv + stats.json | — | 462주 | gitignored |
| 그림 | research/indexes/ALT-20260907-47/20260907T065926Z/figures/cot_wti_is.png | — | — | 단위·기간·lag 표기 포함 |

| 실행 항목 | 값 |
| --- | --- |
| run ID / 실행시각 / 실행자 | 20260907T065926Z / 2026-09-07 06:59 UTC / AI joint-team (worker-2) |
| 작업 디렉터리 / 정확한 명령 | 저장소 루트 / `research/.venv/bin/python research/notebooks/ALT-20260907-47/run_cot.py` |
| 반환 코드 / 오류·재시도 | 0. 중간에 계약명 오지정 1회·pandas 3.0 API 1회 수정 후 성공(과정은 addendum 기록) |
| 품질·커버리지 | 462주(2015-01-06~2023-11-21 화요일). 개명 경계(2022) 동일 코드 연결 확인 |
| 검정 전체 | mm_net→fwd5 +0.035, mm_net_oi→fwd5 +0.009, →fwd20 +0.037, 동시간IW 대조 +0.047, placebo +0.093, ex2020 −0.072 |
| 주장할 수 있는 것 / 없는 것 | IS에서 선행 근거 없음(placebo가 신호보다 큼). 문헌(Sanders 외)과 일치. 인과·OOS·수익 주장 불가 |
| 동료 재현 | 미검증 — 오태환/손성찬이 위 명령·입력으로 재실행 대기 |
| 판정 반영 | KILL (lead 가설 종료). 카드 research/candidates/ALT-20260907-47.md |
