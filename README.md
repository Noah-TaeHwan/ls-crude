# LS CRUDE

**WTI와 연결될 수 있는 뜻밖의 실물 활동을 찾고, 무엇을 시도했으며 왜 남기거나 버렸는지 기록합니다.**

East Camp AI Quant 4기 미니프로젝트 · 오태환(Noah) × 손성찬. 펜타곤 피자 인덱스는 **활동 → 민감한 맥락 → 시장과의 가능한 관계**를 생각하는 참고 패턴입니다. 피자 주문을 복제하거나 특정 데이터·양의 상관을 찾아내는 것이 완료 조건은 아닙니다.

현재는 **대안 데이터 지수를 계속 탐색 중**입니다. 2026-09-07 공동 탐색에서 [신규 원장](research/candidates/ledger.csv)에 8개 가설/자료 조합을 기록했습니다. 곡물 바지선 1개는 실제 지수·WTI 기술 검정을 재현했고, 6개는 접근·허가·시점/구성 조건으로 PARK, Google 피자 인기시간대 방식 1개는 KILL입니다. 전체 판정은 **KEEP 0 / PARK 7 / KILL 1**이며, 새로 검증된 예측 지수는 없습니다. [기존 팩터 이력](research/factors/README.md)의 재검토·인접 후보는 카드에 연결했고 기존 통과 수에 합산하지 않습니다.

| 항목 | 기준 |
| --- | --- |
| 발표 마감 | **2026-09-15 09:00 KST** · 08:30 준비 완료 |
| 통과 기준 | 실제 근거로 탐색 과정과 한계를 일관되게 발표할 수 있음 |
| 가격 | Yahoo Finance WTI 연속선물 CL=F |
| 연구 뉴스 | Investing.com CSV 정본. 사이트 스크래핑 금지 |
| 역할·일정 | [PM 계획](docs/project-plan.md): Noah 데이터·기록·데모, 성찬 검정·반증, 상호 검토 **제안** |
| 기존 웹 | [LS CRUDE](https://ls-crude.vercel.app) · 시장 관측/기존 연구 장부. 이번 패스에서 배포 상태를 검증하지 않음 |

## Current research status — 2026-09-07

| 지금 보여줄 것 | 근거 / 다음 행동 |
| --- | --- |
| **01 Locks 27 곡물 바지선 — PARK** | [실제 지수·그림·18개 검정](research/indexes/ALT-20260907-01/README.md). 다음 달 WTI 수익률과 학습 `r=0.169, n=52`, 내부 검증 `r=-0.066, n=35` (repo empirical only). 공개 빈티지 미복원, 안정된 방향 관계 미확인. 손성찬: 과거 발행본 대조. |
| **04 PortWatch / 07 GPR — PARK** | [04](research/candidates/ALT-20260907-04.md)는 2019–2023 기간 메타데이터, [07](research/candidates/ALT-20260907-07.md)은 공개 파일·빈티지 경로 확인. 실제 과거 공개값 패널과 검정은 미실행. 오태환: 권리/빈티지 조인 확인. |
| **02 LA항 / 03 TSA — PARK** | 역사 URL 직접 취득은 각각 403. 공식 페이지 열람·현재 페이지 접근과 구분한다. [02](research/candidates/ALT-20260907-02.md) 손성찬 / [03](research/candidates/ALT-20260907-03.md) 오태환: 허용 수동 취득 확인. |
| **05 Nightfire / 06 Black Marble — PARK** | [05](research/candidates/ALT-20260907-05.md)는 현 라이선스 승인 미확인. [06](research/candidates/ALT-20260907-06.md)은 파일 HEAD 접근 성공, AOI·QA·빈티지 조인 미구축. 인증 차단으로 오기하지 않음. |
| **08 피자 인기시간대 — KILL** | [방문 상대값과 주문량의 측정 불일치, 검토한 API의 역사 경로 부재](research/candidates/ALT-20260907-08.md). 피자 주문·기관 활동을 추정하는 현재 방식 종료. |

[문헌 메모와 주석 후보표](research/gathering/notes/2026-09-07-activity-proxy-literature.md) · [8개 점수·접근 기록·3분 데모·목표 검토](research/gathering/notes/2026-09-07-activity-proxy-hunt.md). 점수는 조사 우선순위에 대한 판단이며 성과 수치가 아닙니다. 담당/09-08 행동은 제안이며 사람의 수락·재현 검토는 미실행입니다.

실제 입력을 가진 팀원은 아래로 재현합니다. 원본이 없으면 [수집·환경 안내](research/notebooks/ALT-20260907-01/README.md)를 먼저 따릅니다.

```bash
research/.venv/bin/python research/notebooks/ALT-20260907-01/hunt.py check
research/.venv/bin/python research/notebooks/ALT-20260907-01/hunt.py analyze --candidate 01 --raw research/gathering/raw/ALT-20260907-01/20260907T062017Z
```

## Current research status (2026-09-07 공동 탐색 — still hunting)

우승 지수 없음. 9후보를 [신규 원장](research/candidates/ledger.csv)에 등록했고 4건은 IS(2015~2023 · 2024+ 미열람)로 1회씩 실행했다. 전부 PARK이며 KEEP은 없다. 상세는 [피자급 신호 메모](research/gathering/notes/2026-09-07-pizza-class-alt-data-memo.md).

| 후보 | 결과 | 판정 |
| --- | --- | --- |
| 10 WTI COT 머니매니저 | n=441 · r=-0.10 · placebo -0.15 · 후반기 소멸 | PARK |
| 11 미국 디젤 수요 | n=468 · r=-0.18 · 예측 lag 소멸 · 역방향 선행 | PARK |
| 12 BTS 화물 TSI | n=106 · r=+0.02 · 파이프라인 혼입 한계 | PARK |
| 13 호르무즈 유조선 통과 | n=231 부분구간 · r=-0.03 · 코로나 창 의존 | PARK |
| 09 가스 재고 · 14 NOAA 도일 · 15 ADS-B · 16 FIRMS · 17 헤드라인 | 파일명 404 · 월간 404 · 이력 미확인 · MAP_KEY · Guardian 키 | PARK |

다음 사람 판단: 16·17 키 주체와 09 파일명 수동 확인. 다음 문서 확인: 14 월간 경로와 15 이력 조건. 동료 교차 검토는 09-12 예정이며 그 전까지 E3는 탐색적 기록이다.

독립 2차 검증(동일 원시, 별도 스크립트 `run_is_frozen.py`, `--check` 재현 확인)은 [지수 폴더의 results.md·plot_*.png](research/indexes/ALT-20260907-11/run-20260907-01/results.md)에 병존하며, 수치 대조·11번 판정 조정·가정/시나리오는 [Finance 대조 노트](research/gathering/notes/2026-09-07-finance-reconciliation.md)에 있다. 피자급 신호의 문헌 근거는 [두 번째 메모](research/gathering/notes/2026-09-07-pizza-class-oil-memo.md)에도 정리했다. 3분 데모: 질문(활동→맥락→WTI) → 원장 17행(실행 5·차단 11·KILL 1) → 한 사례(11 디젤: 두 독립 실행이 같은 부호·규모, lag 소멸로 PARK) → 다음 조건(키 2건·파일명 1건·문서 2건, 담당·09-12).

## 범위와 비목표

찾는 것은 물류·운영·소비 등 해석 가능한 활동 대리변수와 그 자료에 접근할 수 있는지에 대한 근거입니다. 자료가 적격하면 지수 형태로 구성해 WTI의 수익률 또는 변동성과 상관·시차·사건·placebo를 검정합니다. 관계가 없거나 자료를 얻지 못해도 그 기록은 발표 재료입니다.

차트 미화, 피자 지수 복제, 수익 보장, 상관의 인과 해석, 새 ML·실거래·앱 기능은 이번 범위 밖입니다. Apps-in-Toss·Substack·Comento·Toss 실거래 서사는 넣지 않습니다. 합성 시계열이나 데모 수치를 실증으로 쓰지 않습니다.

## 팀원이 시작하는 순서

1. [방법론](docs/research-methodology.md)으로 활동·맥락·WTI 가설과 반증 조건을 정합니다. [기존 팩터](research/factors/README.md)를 먼저 확인해 같은 가설을 새 발견으로 세지 않습니다.
2. [후보 양식](research/candidates/_TEMPLATE.md)을 복사하고 [기록 규약](docs/recording-standard.md)에 따라 모든 칸을 채웁니다. 아직 모르는 값은 미확인, 결과는 미실행으로 씁니다. 실제 아이디어가 없으면 원장을 비워 둡니다.
3. 후보 원장에 카드 요약 1행을 추가합니다. 새 후보는 PARK / NOT_STARTED / NOT_RUN에서 시작하고, 다음 행동·담당·재검토일을 지정합니다. 출처를 찾으면 [출처 표](research/gathering/sources/REGISTRY.md)에 중복 없이 등록합니다.
4. [수집 규칙](research/INTAKE.md)에 따라 허용된 자료만 수집합니다. raw 원본을 덮어쓰지 않고 수집시각·SHA-256·재취득 방법을 남깁니다. 지수 정의와 실행 영수증은 [indexes](research/indexes/README.md)에 둡니다.
5. [검정 규약](docs/testing-protocol.md)으로 사전 계획 → 허용된 시간 구간 검정 → 동료 재현 → KEEP/KILL/PARK를 기록합니다. 실패·미실행도 기록하고 조용히 삭제하지 않습니다.

실제 후보가 생겼을 때만 아래를 실행합니다. YYYYMMDD는 KST 등록일, NN은 그날 사용하지 않은 두 자리 번호로 바꿉니다.

~~~bash
cp research/candidates/_TEMPLATE.md research/candidates/ALT-YYYYMMDD-NN.md
~~~

후보를 기각하려면 같은 카드와 CSV의 decision을 KILL로 바꾸고 이유·근거·다음 행동을 남깁니다. 접근이 막히면 collection_status=BLOCKED, decision=PARK와 차단 해소 조건을 기록합니다. 단순 조사 대기는 NOT_STARTED/PARK입니다. KEEP은 후속 연구 자원 배정이며 알파 인증이 아닙니다.

## 기록·실행 위치

~~~text
docs/                            방법론·검정·기록 규약·발표 계획
research/candidates/             새 원장과 상태가 바뀌어도 이동하지 않는 후보 카드
research/factors/                기존 번호별 연구 이력
research/gathering/raw/          받은 그대로, 후보 ID/수집시각별 새 폴더 (덤프 gitignored)
research/gathering/notes/        조사 요약, 접근 실패, 검토 기록
research/gathering/sources/      출처·허용 범위·발표 지연
research/indexes/                지수 정의·manifest·실행 영수증 (이번에는 양식만)
research/data/processed/         재생성 가능한 정제·지수 출력 (gitignored)
research/notebooks/              후보별 재현 스크립트/노트북, 기존 탐색 문서
docs/experiments/                검토 뒤 승격된 실험만
~~~

KILL 및 BLOCKED는 [원장 상태 조회](docs/recording-standard.md)로 보여줍니다. 별도 rejected/blocked 폴더에 카드를 복제하거나 이동하지 않습니다. 기존 팀원 랩·시드·팩터를 새 원장으로 자동 이관하지 않습니다.

## 연구 환경과 확인

원장·문서는 Python 표준 라이브러리와 편집기만으로 열 수 있습니다. 먼저 [오프라인 원장 검사](docs/recording-standard.md#원장-구조-검사)를 실행합니다. 연구 코드를 실행할 때의 환경은 다음과 같습니다(저장소 루트 기준).

~~~bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
python -m pytest tests/test_splits.py tests/test_wiki_pageviews_asof.py
~~~

이 검사는 기존 시간 분할·시점 정렬 코드의 회귀 검사입니다. 개별 후보 검정이나 데이터 유효성을 증명하지 않습니다. 후보 실행은 카드에 기록한 정확한 명령과 입력으로 수행합니다. python -m ls_crude.build 및 market_snapshot은 네트워크 수집과 앱 산출물 변경을 포함하므로 setup 확인 명령으로 실행하지 않습니다.

인샘플 선택은 2015-01-01~2023-12-31, 2024-01-01 이후는 규칙 동결 후 단 한 번의 미열람 평가에만 씁니다. 기존 기록에 이미 2024+ 결과가 있으므로 새 양식이나 재동결이 미열람 구간을 만들어주지 않습니다. [OOS 노출 처리](docs/testing-protocol.md)를 먼저 읽습니다.

## 지수를 못 찾았을 때도 데모하는 방법

README → [탐색 노트의 3분 데모](research/gathering/notes/2026-09-07-activity-proxy-hunt.md#3분-데모) → 01의 실제 그림/검정 → 08의 기각 → 03·05의 차단 → 다음 행동 순서로 설명합니다. 원본 없는 환경에서도 Git의 작은 표·SVG·문헌·차단 영수증으로 오늘의 결과와 재현 한계를 보여줄 수 있습니다. [064 식당](research/factors/064-oilman-steakhouse-index/README.md)·[070 라면](research/factors/070-highway-ramyeon-index/README.md)은 기존 실패 이력으로 연결하며 이번 새 검정으로 세지 않습니다.

09-15에 “done enough”는 **목적 → 실제 탐색 사례 → 접근/측정 실패 또는 재현 가능한 검정 → 판정 → 한계와 다음 조건**이 이어지고, 두 팀원 중 다른 사람이 근거 경로를 따라 설명할 수 있는 상태입니다. 양의 관계·새 지수·매매 성과는 필수가 아닙니다. 09-13 근거 동결, 09-14 오프라인 자료·리허설은 [일별 계획](docs/project-plan.md)에 있습니다.

## 기존 앱과 에이전트 입구

앱은 선택적 보조 데모입니다. 이번 신규 CSV는 앱 장부에 자동 반영되지 않습니다.

~~~bash
cd app
npm ci
npm run dev -- --port 5173
~~~

환경변수 없는 읽기 전용 스냅샷을 기본으로 사용합니다. Supabase CRUD 설정은 [앱 안내](app/README.md)에 있습니다. 기존 파이프라인 설명은 [research-design](docs/research-design.md), [로컬 분석](docs/local-backtest.md), [Oil Slice](docs/slice-index.md)를 참고합니다.

에이전트는 [AGENTS.md](AGENTS.md)와 관련 collecting-yahoo-crude / tagging-investing-news / gathering-research-intake / building-slice-index / running-sample-splits 스킬을 읽습니다. 이번 활동 proxy 운영 범위와 절차는 위 세 규약 및 INTAKE를 따릅니다. 이전 crypto×news 전용 조건과 모든 후보의 전략 백테스트 요구는 이번 신규 활동 proxy의 등록 조건이 아닙니다.

[연구 OS setup의 과거 검토·검증 근거](docs/research-os-review.md)
