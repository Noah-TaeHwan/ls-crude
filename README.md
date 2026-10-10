# LS CRUDE

WTI 원유 선물과 이어질 수 있는 실물 활동 데이터를 찾아 기록하고, 쿠싱 활동 지수(Cushing Activity Index, CAI v0.1)를 만들어 예측에 보탬이 되는지 검정한 2인 팀 연구입니다.

[CAI 대시보드](https://ls-crude.vercel.app/) · [연구 기록 화면](https://ls-crude.vercel.app/research) · [연구 브리프](docs/cai/RESEARCH_BRIEF.md) · [산식·자료·재현](research/indexes/cai-v0.1/README.md) · [종료 기록](docs/cai/CLOSEOUT.md)

## 요약

| 구분 | 내용 |
| --- | --- |
| 질문 | 쿠싱(미국 오클라호마) 인근의 실물 활동 흔적을 결합하면 다음 5거래일 WTI 상승 여부에 정보를 더할 수 있을까? |
| 데이터 | 물류·운영·소비 활동 후보를 카드로 기록했습니다. CAI 입력은 쿠싱 인근 도로의 일별 전체 차량 통행량(TMAS AVC040)과 South STP 월별 신고 방류유량(DMR) 2개입니다. 가격은 Yahoo Finance WTI 연속선물(CL=F)을 씁니다. |
| 방법 | 후보마다 가설·출처·접근 조건을 남기고 KEEP·PARK·KILL로 판정했습니다. CAI는 두 자료의 표준화 점수를 50:50으로 결합한 과거 자료 지수입니다. 예측 실험은 2015~2020년 학습(753행), 2023년 평가(245행)의 고정 시간 분할로 기준선 1개와 로지스틱 모델 5개를 비교했습니다. |
| 결과 | 후보 73건을 KEEP 7 · PARK 54 · KILL 12로 기록했습니다. CAI v0.1은 2023-12-29 기준 43.1/100입니다. 시장정보에 CAI를 더한 두 비교 모두 확률오차(log loss)가 줄지 않았습니다. 예측 개선은 없었고, 이 결과를 그대로 공개합니다. |

- 진행 순서: 1 아이디어 → 2 쿠싱 후보 → 3 수집 → 4 전처리 → 5 지수·학습·평가 → 6 결과·대시보드. CAI는 자료 폴더 106개에서 쿠싱 후보·보조자료 33개를 고르고, 준비된 입력 2개로 만들었습니다.
- 연구 원장 73건과 CAI 작업표 33개는 단위가 달라 합산하지 않습니다.
- CAI의 50은 두 자료가 기준 평균 수준일 때의 값입니다. 43.1은 과거 자료로 계산한 상대 점수이며, 가동률이나 유가 상승 확률과는 다른 값입니다.
- KEEP은 후속 연구 대상 배정입니다. 2024년 이후 구간은 최종 검증용으로 잠가 두었습니다.

## 팀과 역할

오태환(Noah) × 손성찬 · 2026-09-01~09-14

| 담당 | 맡은 일 |
| --- | --- |
| 오태환(Noah) | 데이터 수집·피처(`research/src/ls_crude/data/`, `research/src/ls_crude/features/`), 대시보드(`app/`), 기록·데모 |
| 손성찬 | 모델·백테스트(`research/src/ls_crude/models/`, `research/src/ls_crude/backtest/`), 검정·반증, 숙박세·사용세·공항 자료와 월별 실험 |

역할 배정 제안은 [PM 계획](docs/project-plan.md)에 있습니다(Noah 데이터·기록·데모, 성찬 검정·반증, 상호 검토). 두 사람은 2026-09-11에 역할을 수락했습니다. 코드 담당 범위는 [CODEOWNERS](.github/CODEOWNERS)에 있습니다.

## 실행 방법

명령은 저장소 루트 기준입니다.

1. 후보 원장 검사(Python 표준 라이브러리만 사용)

~~~bash
python3 research/scripts/sync_candidate_ledger.py --check
~~~

2. 연구 환경과 회귀 검사

~~~bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
python -m pytest tests/test_splits.py tests/test_wiki_pageviews_asof.py
~~~

3. CAI v0.1 재현. 해시가 일치하는 입력 파일이 필요하며, 입력 확보는 [공동 작업 안내](docs/cai/TEAM_START_HERE.md)를 따릅니다.

~~~bash
research/.venv/bin/python research/scripts/build_cai_v01.py --check
research/.venv/bin/python -m pytest research/tests/test_cai_v01.py -q
~~~

4. 대시보드 앱(선택). 환경변수 없이 읽기 전용 스냅샷으로 실행합니다. Supabase 설정은 [앱 안내](app/README.md)에 있습니다.

~~~bash
cd app
npm ci
npm run dev -- --port 5173
~~~

- `python -m ls_crude.build`와 `market_snapshot`은 네트워크 수집과 앱 산출물 변경을 포함하므로 점검 명령으로 쓰지 않습니다.
- 인샘플 선택은 2015-01-01~2023-12-31에서만 합니다. 2024-01-01 이후 구간은 규칙을 동결한 뒤 한 번만 씁니다([검정 규약](docs/testing-protocol.md)).

## 연구 기록

- [종료 기록·산출물·인계 상태](docs/cai/CLOSEOUT.md) · [연구 브리프와 모델 비교표](docs/cai/RESEARCH_BRIEF.md) · [CAI v0.1 산식·자료·재현](research/indexes/cai-v0.1/README.md)
- [후보 원장](research/candidates/ledger.csv) · [쿠싱 후보 33개 작업표](docs/cai/CANDIDATE_WORKLIST.md) · [기존 팩터 연구 이력](research/factors/README.md)
- [연구 방법론](docs/research-methodology.md) · [검정 규약](docs/testing-protocol.md) · [기록 규약](docs/recording-standard.md) · [수집 규칙](research/INTAKE.md)
- [공동 작업 안내 보관본](docs/cai/TEAM_START_HERE.md) · [단계별 AI 프롬프트](docs/cai/TEAM_PROMPTS.md) · [입력/제출 프로그램](research/scripts/cai_team.py) · 에이전트 입구 [AGENTS.md](AGENTS.md)
- [진행 기록 보관본(2026-09-07~09-10)](docs/history/2026-09-readme-log.md): 후보별 판단·담당·다음 행동을 날짜순으로 남겼습니다.
