# LS CRUDE

**WTI와 연결될 수 있는 뜻밖의 실물 활동을 찾고, 무엇을 시도했으며 왜 남기거나 버렸는지 기록합니다.**

East Camp AI Quant 4기 미니프로젝트 · 오태환(Noah) × 손성찬. 펜타곤 피자 인덱스는 **활동 → 민감한 맥락 → 시장과의 가능한 관계**를 생각하는 참고 패턴입니다. 피자 주문을 복제하거나 특정 데이터·양의 상관을 찾아내는 것이 완료 조건은 아닙니다.

현재는 **대안 데이터 지수를 계속 탐색 중**입니다. 2026-09-08 로컬 [원장](research/candidates/ledger.csv)은 **68행(KEEP 6 / PARK 51 / KILL 11)**입니다(repo empirical only). 앞선 공동 헌트는 기존8개 ID 재검토였습니다. 리뷰 후 KGLS 시정 관측 경로1개와 실제 샘플·그림을 추가했습니다. 기상 조건이며 물류 활동량·유가 예측 신호가 아닙니다. KEEP은 후속 연구 배정이고 검증된 예측 지수는 없습니다. [이번 기록](research/gathering/notes/2026-09-08-joint-hunt.md) · [기존 팩터 이력](research/factors/README.md).

| 항목 | 기준 |
| --- | --- |
| 발표 마감 | **2026-09-15 09:00 KST** · 08:30 준비 완료 |
| 통과 기준 | 실제 근거로 탐색 과정과 한계를 일관되게 발표할 수 있음 |
| 가격 | Yahoo Finance WTI 연속선물 CL=F |
| 연구 뉴스 | Investing.com CSV 정본. 사이트 스크래핑 금지 |
| 역할·일정 | [PM 계획](docs/project-plan.md): Noah 데이터·기록·데모, 성찬 검정·반증, 상호 검토 **제안** |
| 기존 웹 | [LS CRUDE](https://ls-crude.vercel.app) · 시장 관측/기존 연구 장부. 이번 패스에서 배포 상태를 검증하지 않음 |

## Current research status — 2026-09-08

**수박 원보고서 대사 후속(2026-09-09):** USDA 정책 첫 요청 403으로 후속 수집을 중단했습니다. 신규 관측은 없으며 기존 과거 표본을 유지합니다. 수집 영수증 사전 기록과 파서 세 가지 오류 수정을 검증했습니다. [실행·차단·전달 상태](research/gathering/notes/2026-09-09-watermelon-source-reconciliation.md). 전체 수집·대사 목표는 PARTIAL입니다.

**CPC 도일 감독 검토:** 난방/냉방·가중 구간 파서를 강화하고, 108개월의 월합계와 자체/제공 전년차를 구분하는 과거 연구 사례를 추가했습니다. 192개 비교값 중 20개(14개월)가 다르며 원인은 미확인입니다(repo empirical only). [검토·전달 상태](docs/reviews/2026-09-08-degree-days-closeout.md) · [표시 데이터 v2](research/indexes/web-observations/v2/README.md) · [다음 AI에게 줄 전달 프롬프트](docs/ai-research-delivery-prompt.md). WTI 검정은 NOT_RUN, 최종 우승 지수 없음.

**반응형 그래프:** 수박·제주·미국 냉난방도일 선택, 실제 관측의 터치/키보드 탐색, 원단위 표와 WTI 가격 눈금을 제공합니다. 고정 연구 사례와 갱신 관측은 구분합니다. [구현·검수 기록](docs/research-workflow-dashboard-plan.md).

**성찬080 후속:** 잘못된 원안 링크를 교정하고 [제주 LNG·유류 336일 관측](research/indexes/ALT-20260908-20/20260908T073402Z/README.md)을 확보했습니다. 16,128시간 값·시간/일/월 합계 대사와 원단위·조건부비중 그림을 기록했습니다. 2024-03-31까지의 과거 보조표본이며 전국 지수·원유량·WTI 검증은 아닙니다. [탐색 과정·다음 행동](research/gathering/notes/2026-09-08-kpx-fuel-access.md).

웹 시각화 구현: 현재 관측 아래와 연구 페이지에 수박·제주 반응형 그래프, 원단위 표, 제약과 다음 확인을 연결했습니다. [홈 연구 샘플](https://ls-crude.vercel.app/#research-sample) · [제주 사례](https://ls-crude.vercel.app/research?sample=jeju#research-sample). PR #80의 Vercel 한도 오류는 당시 기록이며, PR #82의 첫 프리뷰는 정상 배포됐습니다. 운영 반영 여부는 해당 PR과 배포 후 검증으로 구분합니다. 관측 자료를 먼저 시각화하고, 정의·공개시점이 확인된 적격 자료만 WTI와 비교합니다. [현재 방향 점검](docs/research-direction-2026-09-08.md#11-실제-수집과-웹-표시-후-방향-점검--2026-09-08-후속).

**성찬 목록 후속 1개:** [085 수박·냉장트럭 → ALT36](research/indexes/ALT-20260907-36/20260908T065043Z/README.md)의 공개 주간 XLSX를 실제 수집했습니다. 수박 단독 518행·409개 날짜의 관측 그림과 분모 대사를 확보해 E1→E2로 진전했습니다. 최신 수박 날짜는 2025-10-14이며 실시간 자료가 아닙니다. 소수값 정의·공개시점 미확인으로 PARK, WTI·HO 검정 NOT_RUN을 유지합니다. [이번 선택 이유·검토·다음 행동](research/gathering/notes/2026-09-08-watermelon-weekly-access.md).

웹 관측2개: [갤버스턴 시정](https://ls-crude.vercel.app/observations/visibility)과 [싱가포르 월별 탱커 입항](https://ls-crude.vercel.app/observations/tankers). 홈의 단일 WTI 일봉 아래에 두 카드를 표시한다. 열린 화면5분 확인, 시정10분/월간6시간 캐시이며 각 자료의 관측시각·기준 월을 구분한다. 연구 원본의 장기 자동수집은 아니다.

**수집 가능성 후속:** [기존26 싱가포르 탱커 월간 입항](research/indexes/ALT-20260907-26/20260908T055411Z/README.md)은 dataset ID 차단을 해소하고12개월 원단위표본·그림·공식총계대사를 확보했습니다. 관측 후보 KEEP이며 WTI관계는NOT_RUN입니다. [기존16의USCG후속](research/indexes/ALT-20260908-16/20260908T055451Z/README.md)은 운영문서2개까지확보했지만 실제안개폐쇄/재개시각은미확인입니다. [이번결과·다음행동](research/gathering/notes/2026-09-08-collectible-source-followup.md). 다음은26의월간관측카드표시범위·공표/개정안내를정리하고,16은확정사건시각이있는공식경로가확보될때만기상과대조합니다.

[리뷰 후 작업 결과·검증](research/gathering/notes/2026-09-08-observation-first-followup.md) · [시정 원자료 설명·그림](research/indexes/ALT-20260908-16/20260908T050739Z/README.md). 최신 관측 표시와 WTI 관계 검정의 완료를 분리하며, 앞선 학술 메모는 **PARTIAL**입니다.

[공동 헌트: 점수·접근·차단·3분 데모·검토](research/gathering/notes/2026-09-08-joint-hunt.md) · [문헌 메모와 주석 후보표](research/gathering/notes/2026-09-08-joint-academic-memo.md).

| 이번 우선순위 / 상태 | 근거와 다음 행동(09-09, 사람 배정 제안) |
| --- | --- |
| **01 Locks27 — PARK** | [주간 변형·실제 계산·그림](research/indexes/joint-hunt-20260908/README.md). 기존 월간 결과와 별도 탐색. 손성찬: 당시 공개 빈티지 대사. |
| **07 GPR / 02 LA항 — PARK** | [07](research/candidates/ALT-20260907-07.md)은 빈티지 패널 연결 대기. [02](research/candidates/ALT-20260907-02.md)는 2개월 수출 TEU 대사만 확보, 장기 패널·공표일·권리 미확인. Noah: 빈티지 연결 / 성찬: 허용 취득. |
| **06 Black Marble — PARK** | [v2 QA 조건](research/candidates/ALT-20260907-06.md)을 명확히 함. Noah: 산업/대조 AOI·QA0·실제 관측 분모 고정. 모텔 투숙객 지수 아님. |
| **04 PortWatch — PARK, E2** | [기존 계산 결함](research/gathering/notes/2026-09-08-joint-hunt.md#04-기존-검정-증거-하향)으로 E3 하향. 이전 숫자의 관계 근거 재사용 중지. Noah: 원 거래일축·가격창·타깃 경계 수정 계획. |
| **03 TSA / 05 Nightfire — PARK** | 역사 접근·짧은 표본 / 이용 승인 차단 유지. [03](research/candidates/ALT-20260907-03.md) Noah / [05](research/candidates/ALT-20260907-05.md) 성찬. |
| **08 인기시간대 — KILL** | [방문 상대값과 역사 주문량의 불일치](research/candidates/ALT-20260907-08.md). 현 방식 종료 유지. |

재현: `research/.venv/bin/python research/notebooks/joint-hunt-20260908/run.py`. 입력·명령·가정은 [실행 안내](research/notebooks/joint-hunt-20260908/README.md)를 따른다. 원본 없는 팀원의 동일 빈티지 재현은 미검증이다. 이번 변경은 연구 기록이며 앱·배포 검증이 아니다.

아래는 **2026-09-07 당시 이력**이다. 전체 현재 수와 혼합하지 않는다. 특히 04의 과거 관계 수치는 위 재검토 판정이 우선한다.

### 피자급 09–17

우승 지수 없음. 9후보 중 4건은 IS(2015~2023 · 2024+ 미열람)로 1회씩 실행했고 전부 PARK다. 상세는 [피자급 신호 메모](research/gathering/notes/2026-09-07-pizza-class-alt-data-memo.md).

| 후보 | 결과 | 판정 |
| --- | --- | --- |
| 10 WTI COT 머니매니저 | n=441 · r=-0.10 · placebo -0.15 · 후반기 소멸 | PARK |
| 11 미국 디젤 수요 | n=468 · r=-0.18 · 예측 lag 소멸 · 역방향 선행 | PARK |
| 12 BTS 화물 TSI | n=106 · r=+0.02 · 파이프라인 혼입 한계 | PARK |
| 13 호르무즈 유조선 통과 | n=231 부분구간 · r=-0.03 · 코로나 창 의존 | PARK |
| 09 가스 재고 · 14 NOAA 도일 · 15 ADS-B · 16 FIRMS · 17 헤드라인 | 파일명 404 · 월간 404 · 이력 미확인 · MAP_KEY · Guardian 키 | PARK |

다음 사람 판단: 16·17 키 주체와 09 파일명 수동 확인. 13은 18의 다른 산식(서프라이즈)이며 전체 IS 주장을 하지 않는다.

### 피자급 공개 시계열 18–29

우승 피자 지수는 없다. 작업 중 ID 01–12는 활동 proxy 01–08·09–17과 겹치지 않게 18–29로 옮겼다. 18은 [04 호르무즈 탱커 PARK/BLOCKED](research/candidates/ALT-20260907-04.md)의 수집·검정 후속이다.

| 판정 | ID | 한 줄 |
| --- | --- | --- |
| KEEP | [18 PortWatch 호르무즈 유조선](research/candidates/ALT-20260907-18.md) | 집계 AIS 주간 척수 구성됨. IS f1은 약함. 알파 아님 |
| KEEP | [21 싱가포르 벙커](research/candidates/ALT-20260907-21.md) | Open Data 월간 톤. 공표일 미복원 |
| PARK | 19 리그 · 20 CFTC · 22 OpenSky · 24 화물TSI · 26 탱커입항 · 29 ERCOT | 공식/차단. 피자 본선 아님 |
| KILL | 23 커싱 위키 · 25 제트유 공급 · 27 구글 모빌리티 · 28 선박별 AIS | 이상치/공식중복/종료/금지 |

차단: OpenSky 역사 403(연구기관 신청=손성찬/Noah), 탱커 데이터셋 ID 미확보(손성찬), ERCOT 페이지 403(손성찬).  
숫자·그림: [IS 표](research/indexes/HUNT-20260907-is-stats.csv), [강건성](research/indexes/HUNT-20260907-robustness.csv), [학술 메모](research/gathering/notes/2026-09-07-pizza-index-class-oil-memo.md).  
원장 검사 `PASS`는 메타데이터 구조일 뿐 알파 증거가 아니다.

```bash
research/.venv/bin/python research/notebooks/hunt-20260907/build_and_test.py
```

독립 2차 검증(동일 원시, 별도 스크립트 `run_is_frozen.py`, `--check` 재현 확인)은 [지수 폴더의 results.md·plot_*.png](research/indexes/ALT-20260907-11/run-20260907-01/results.md)에 병존하며, 수치 대조·11번 판정 조정·가정/시나리오는 [Finance 대조 노트](research/gathering/notes/2026-09-07-finance-reconciliation.md)에 있다. 피자급 신호의 문헌 근거는 [두 번째 메모](research/gathering/notes/2026-09-07-pizza-class-oil-memo.md)에도 정리했다. 3분 데모: 질문(활동→맥락→WTI) → 원장 17행(실행 5·차단 11·KILL 1) → 한 사례(11 디젤: 두 독립 실행이 같은 부호·규모, lag 소멸로 PARK) → 다음 조건(키 2건·파일명 1건·문서 2건, 담당·09-12).

## 범위와 비목표

찾는 것은 물류·운영·소비 등 해석 가능한 활동 대리변수와 그 자료에 접근할 수 있는지에 대한 근거입니다. 자료가 적격하면 지수 형태로 구성해 WTI의 수익률 또는 변동성과 상관·시차·사건·placebo를 검정합니다. 관계가 없거나 자료를 얻지 못해도 그 기록은 발표 재료입니다.

차트 미화, 피자 지수 복제, 수익 보장, 상관의 인과 해석, 새 ML·실거래·앱 기능은 이번 범위 밖입니다. Apps-in-Toss·Substack·Comento·Toss 실거래 서사는 넣지 않습니다. 합성 시계열이나 데모 수치를 실증으로 쓰지 않습니다.

## 팀원이 시작하는 순서

AI에게 **아이디어 선정 → 실제 데이터 접근·샘플 확인 → GitHub PR 기록**을 맡기려면 [복사해서 쓰는 AI 연구 접수 프롬프트](docs/ai-research-intake-workflow.md)를 사용합니다. 이번 단계는 자료의 접근성과 측정 적합성까지이며, 조합·가격 검정·웹 구현은 별도 작업입니다. [연구 방향](docs/research-direction-2026-09-08.md) → [쿠싱 관측판·역할](docs/cushing-observation-workflow-2026-09-08.md) → [아이디어에서 인디케이터까지](docs/idea-to-indicator-workflow-2026-09-08.md)에 대화의 흐름과 제안을 정리했습니다.

1. [방법론](docs/research-methodology.md)으로 활동·맥락·WTI 가설과 반증 조건을 정합니다. [기존 팩터](research/factors/README.md)를 먼저 확인해 같은 가설을 새 발견으로 세지 않습니다.
2. [후보 양식](research/candidates/_TEMPLATE.md)을 복사하고 [기록 규약](docs/recording-standard.md)의 초기12필드·활동·출처·접근/재개 조건을 작성합니다. 상세 구성·검정은 단계 진입 때 채웁니다. 새 아이디어가 없으면 기존 원장을 유지합니다.
3. `python3 research/scripts/sync_candidate_ledger.py --write`로 카드에서 원장을 생성하고 `--check`로 대조합니다. 새 후보는 PARK / NOT_STARTED / NOT_RUN에서 시작하고, 다음 행동·담당·재검토일을 지정합니다. 출처를 찾으면 [출처 표](research/gathering/sources/REGISTRY.md)에 중복 없이 등록합니다.
4. [수집 규칙](research/INTAKE.md)에 따라 허용된 자료만 수집합니다. raw 원본을 덮어쓰지 않고 수집시각·SHA-256·재취득 방법을 남깁니다. 지수 정의와 실행 영수증은 [indexes](research/indexes/README.md)에 둡니다.
5. 실제 샘플은 날짜·단위·결측과 개별 관측 그림으로 먼저 보여줄 수 있습니다. 관계 검정 적격 후보만 [검정 규약](docs/testing-protocol.md)으로 사전 계획 → 허용 구간 검정 → 동료 재현 → KEEP/KILL/PARK를 기록합니다. 실패·미실행도 기록하고 조용히 삭제하지 않습니다.

실제 후보가 생겼을 때만 아래를 실행합니다. YYYYMMDD는 KST 등록일, NN은 그날 사용하지 않은 두 자리 번호로 바꿉니다.

~~~bash
cp research/candidates/_TEMPLATE.md research/candidates/ALT-YYYYMMDD-NN.md
~~~

후보를 기각하려면 같은 카드의 decision을 KILL로 바꾸고 CSV를 재생성한 뒤 이유·근거·다음 행동을 남깁니다. 접근이 막히면 collection_status=BLOCKED, decision=PARK와 차단 해소 조건을 기록합니다. 단순 조사 대기는 NOT_STARTED/PARK입니다. KEEP은 후속 연구 자원 배정이며 알파 인증이 아닙니다.

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

README → [활동 proxy 3분 데모](research/gathering/notes/2026-09-07-activity-proxy-hunt.md#3분-데모) → 01의 실제 그림/검정 → 08의 기각 → 03·05의 차단 → 피자급 18·21 KEEP과 23 기각 → 다음 행동 순서로 설명합니다. 원본 없는 환경에서도 Git의 작은 표·SVG·문헌·차단 영수증으로 오늘의 결과와 재현 한계를 보여줄 수 있습니다. [064 식당](research/factors/064-oilman-steakhouse-index/README.md)·[070 라면](research/factors/070-highway-ramyeon-index/README.md)은 기존 실패 이력으로 연결하며 이번 새 검정으로 세지 않습니다.

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
