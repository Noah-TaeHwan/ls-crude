# 지수 정의/실행 영수증 — ALT-20260907-48 (FRED GASREGW 소매 휘발유 sanity/placebo)

## 사전 정의

| 항목 | 값 |
| --- | --- |
| 후보 ID / 카드 경로 | ALT-20260907-48 / research/candidates/ALT-20260907-48.md |
| 버전 / 작성자 / 검토자 | v1 / AI joint-team (worker-2) / 오태환·손성찬 재현 대기 |
| 구성하려는 활동·WTI 연결 가설 | 사전 기대: 동시간대 강한 동행(기계적 전가), 선행은 없음. 선행처럼 보여도 공유 충격의 동시성으로 해석 |
| 원천 필드 → 산식 / 가중치 | `wow = GASREGW.pct_change()` (주간). 가중치 없음 |
| 원천/지수 단위·빈도·지역·고정 바스켓 | USD/gal / 주간(월요일 관측) / 미국 전국 평균 단일 계열 |
| 집계·분모·기준기간·정규화·워밍업 | 집계 없음. 워밍업 1주 |
| 결측/실제 0/이상치·개정 처리 | 결측 없음(IS 구간). FRED 개정 가능성은 미복원 — 한계로 기록 |
| observed_at / available_at / timezone | 월요일 관측 → 다음 거래일부터 forward 창. 보수적 1TD 시프트 |
| 선택/검증 기간·OOS 노출·동결시각 | IS 2015–2023. 원본 파일에 2024+행 포함 → oos_exposure=SEEN(파일 수준). 2024+ 통계 미계산 |
| WTI 타깃·lag·event/placebo·전체 검정군 | 동시간대 prior-5TD + 다음 5TD 단순수익률. placebo 52주 시프트 |
| KEEP/KILL/PARK 사전 판단 기준 | 사전 기준 미동결(탐색). 사후 판정: 동행 강하고 선행이 placebo 수준이면 lead 가설 종료(KILL), placebo 역할로 보존 |

## 실행 manifest (20260907T070038Z)

| 역할 | 저장소 상대 경로 / 재취득 방법 | SHA-256 | 기간 / 행 수 | 시각·빈티지·권한 |
| --- | --- | --- | --- | --- |
| 원본 입력(GASREGW) | research/gathering/raw/ALT-20260907-48/20260907T064937Z/GASREGW.csv | `7886faf7…` | 파일 609행(2015-01-05~2026-08-31), 사용 467주(IS) | 수집 2026-09-07 UTC. FRED 공개(원천 EIA) |
| 원본 입력(WTI) | research/gathering/raw/WTI-CLF-IS/20260907T064937Z/CLF_daily_2015-2023.csv | `89c3a04c…` | 2262일 | Yahoo CL=F, 2024+ 미포함 |
| 코드 | research/notebooks/ALT-20260907-48/run_gasregw.py | — | — | venv pandas/matplotlib |
| 정제·지수 출력 | research/data/processed/ALT-20260907-48/20260907T070038Z/gasregw_wti_weekly_is.csv + stats.json | — | 467주 | gitignored |
| 그림 | research/indexes/ALT-20260907-48/20260907T070038Z/figures/gasregw_wti_is.png | — | — | 동행/선행 산점도 병치 |

| 실행 항목 | 값 |
| --- | --- |
| run ID / 실행시각 / 실행자 | 20260907T070038Z / 2026-09-07 07:00 UTC / AI joint-team (worker-2) |
| 작업 디렉터리 / 정확한 명령 | 저장소 루트 / `research/.venv/bin/python research/notebooks/ALT-20260907-48/run_gasregw.py` |
| 반환 코드 / 오류·재시도 | 0. 열 이름 오타 1회 수정 후 성공 |
| 품질·커버리지 | 467주. 결측 0(스크립트 dropna 후) |
| 검정 전체 | 동행 +0.200, 선행 +0.026, placebo −0.047, ex2020 −0.019 |
| 주장할 수 있는 것 / 없는 것 | 기계적 동행만 확인, 선행 근거 없음(사전 기대와 일치). 인과·OOS·수익 주장 불가 |
| 동료 재현 | 미검증 — 오태환/손성찬이 위 명령·입력으로 재실행 대기 |
| 판정 반영 | KILL (lead 가설 종료, placebo 역할 보존). 카드 research/candidates/ALT-20260907-48.md |
