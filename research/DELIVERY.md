# CAI 실험 프로그램 전달 안내 (cai-exp/0.1.0)

성찬님 실행용 묶음입니다. 프로젝트 상대경로만 사용하며, 이 컴퓨터의 절대경로·가상환경·
인증정보는 포함하지 않습니다.

## 받는 방법 (택1)

1. 기존 private 저장소의 `share/cai-exp-0.1.0` 브랜치:
   `git fetch origin share/cai-exp-0.1.0 && git checkout -b share/cai-exp-0.1.0 origin/share/cai-exp-0.1.0`
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
- 교통·DMR 등 추가 성분은 아직 config에 pin되어 있지 않습니다(적격성 게이트).

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
  `weekend_seongchan`=학습가중치·비교 묶음(현재 CAI는 컴포넌트 부재로 blocked가 정상).
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
.venv-share/bin/python -m pytest tests/test_experiments.py -q   # 12 passed
```
