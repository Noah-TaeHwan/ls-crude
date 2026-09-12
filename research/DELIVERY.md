# CAI 실험 프로그램 전달 안내 (cai-exp/0.1.0)

성찬님 실행용 묶음입니다. 프로젝트 상대경로만 사용하며, 이 컴퓨터의 절대경로·가상환경·
인증정보는 포함하지 않습니다.

## 받는 방법 (택1)

1. 기존 private 저장소의 현재 `main`을 사용합니다. 예전 `share/cai-exp-0.1.0`은 main에 통합된 뒤 삭제됐습니다.
   최신 작업 순서·분담은 `app/public/cai-team-workflow.md`를 먼저 읽어 주세요.
2. 전달 tarball(같은 내용): `research/dist/cai-exp-0.1.0.tar.gz`

## 설치 (프로젝트 루트 기준)

```bash
cd research
python3 -m venv .venv-share           # 성찬님 환경의 별도 가상환경
.venv-share/bin/pip install -r requirements-exp.txt
.venv-share/bin/pip install -e . --no-deps
```

## 입력

- 가격: `research/data/clf-daily-2015-2026.csv` (저장소 포함, SHA-256
  `ea70f9340b17081a037fa3f4cd0ed12810a67cea781e5779127eb651afd56171`, Yahoo CL=F,
  config가 이 해시를 pin). 실험은 2023-12-31 이하만 읽습니다.
- 교통·DMR은 `pilot_retro_traffic_dmr.config.json`에 입력 경로와 해시가 고정되어 있습니다. 입력 CSV는 재배포 조건 미확인으로 공유본에 포함하지 않았습니다. 생성 체인은 `experiments/cai/REPRODUCE_SENS.md`를 참고하세요.

## 실행 (단일 CLI)

```bash
cd research
.venv-share/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/weekend_shared.config.json
.venv-share/bin/python -m ls_crude.experiment.cli demo      # 합성 엔드투엔드(실증 아님)
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/weekend_shared.config.json    --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/weekend_seongchan.config.json --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli status --run-dir <run_dir>
```

- config 역할: `weekend_shared`=양쪽 공통 재현(2설정), `weekend_taehwan`=태환 묶음,
  `weekend_seongchan`=학습가중치·비교 묶음(이 오래된 기준 설정에서는 CAI 컴포넌트 부재로 blocked가 정상이며, 실제 교통·DMR 파일럿 설정과 구분).
- 출력: `data/processed/<owner>/<run_id>/{export,internal}`. export=집계, internal=예측 CSV.
- 캐시: `<base-dir>/cache` — 입력/config/코드가 같을 때만 재사용.

## 재현성 비교 (`compare`)

```bash
.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left  data/processed/091-cai-exp-tw/<shared_run_id> \
  --right data/processed/091-cai-exp-sc/<shared_run_id>
# MATCH 여야 함. run_id는 status 출력이나 ls로 확인.
```

## 연구 모드·한도

- `RETROSPECTIVE_RESEARCH`(기본): 관측일 정렬 회고 탐색, 실시간 예측 인증 아님.
- `POINT_IN_TIME_FORECAST`: 모든 입력에 `availability_basis` 필요(검증 단계에서 강제).
- 공동 한도: 설정 ≤12(현재 계획 8), 동시 모델 ≤2, 첫 배치 ≤2h. 최종 OOS는 프로그램이
  읽지 않습니다(잠금).

## 테스트

```bash
.venv-share/bin/python -m pytest tests/test_experiments.py -q   # 결과의 실제 통과 수를 확인
```

## 참조 run (재현 대조용, 집계만 포함)

공유 브랜치의 `research/experiments/cai/reference/` 안에 태환 측 shared run 2건의
`export/summary.json`(집계·해시만, 예측 CSV 없음)이 있습니다. 성찬님 실행 후:

```bash
cd research
.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left  experiments/cai/reference/tw_shared_20260911T085005Z \
  --right data/processed/091-cai-exp-sc/<your_run_id>
# MATCH 여야 합니다. (spec_hash 1e89aa740a69e9c6…, price_sha ea70f934…)
```

## 갱신 (2026-09-11 배치 F)

- `align_availability()`: 가용일 정렬을 행 shift → **달력 가용일**로 수정(가용일 열 우선,
  `validity_days` 제한 내 재사용, 역방향/무제한 채움 없음). 상태 라벨:
  CONFIRMED_RECEIVED_DATE / ASSUMED_LAG_DAYS / RECORDED_OBSERVATION_DATE.
- 시장+CAI 모델(`market_cai_equal_logit`, `market_cai_learned_logit`) 추가,
  계수·절편·전처리 통계·train_rows 저장.
- 파일럿 config 2종: `pilot_retro_traffic`, `pilot_retro_traffic_dmr` (입력 CSV는
  재배포 조건 미확인으로 이 묶음에 미포함 — 데이터 접근 결정 후 별도 공유).
