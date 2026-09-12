# 주말 공동 실험 — 정확한 실행 명령 (각자 복사)

작업 위치: **관리 폴더** `/Users/noah/orca/ls-crude/research` (코드 worktree 아님)
사용 CLI: `cai-exp/0.1.0` — 옵션은 아래가 전부입니다(없는 옵션 안내 아님).

```bash
cd /Users/noah/orca/ls-crude/research
.venv/bin/python -m ls_crude.experiment.cli --help   # 확인용
```

## 1) 사전 확인 (양쪽 동일)

```bash
cd /Users/noah/orca/ls-crude/research
.venv/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/weekend_shared.config.json
.venv/bin/python -m ls_crude.experiment.cli demo      # 합성 엔드투엔드(실증 아님)
```

## 2) 태환 측 (이미 실행 완료 — 재실행 시 캐시 재사용)

```bash
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/weekend_shared.config.json   --base-dir data/processed/091-cai-exp-tw
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/weekend_taehwan.config.json  --base-dir data/processed/091-cai-exp-tw
```

## 3) 성찬 측 (수락 후)

```bash
cd /Users/noah/orca/ls-crude/research
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/weekend_shared.config.json    --base-dir data/processed/091-cai-exp-sc
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/weekend_seongchan.config.json --base-dir data/processed/091-cai-exp-sc
```

## 4) 재현성 병합 검사 (양쪽 run 디렉터리를 지정)

```bash
.venv/bin/python -m ls_crude.experiment.cli compare \
  --left  data/processed/091-cai-exp-tw/<shared_run_id> \
  --right data/processed/091-cai-exp-sc/<shared_run_id>
# MATCH 여야 함. MISMATCH면 spec/입력/타깃/평가 날짜가 다르므로 그 run은 비교에서 제외.
```

## 5) 상태·재개·중단

```bash
.venv/bin/python -m ls_crude.experiment.cli status --run-dir <run_dir>   # 설정별 상태
# 중단: 실행 터미널에서 Ctrl+C (또는 프로세스 종료)
# 재개: 같은 config로 --resume <run_dir> 붙여 실행 (완료 설정은 skip)
# 한도: --max-seconds N, 캐시 끄기: --no-cache, 실패 1회 재시도: --retry-failed
```

## 공동 한도 (두 사람 합계)

- 설정(모델 실행) 최대 12개: shared 2 + tw 3 + sc 3 = 8 (여유 4).
- 모델 동시 실행 최대 2개, 첫 배치 최대 2시간. 같은 입력·설정은 캐시로 재사용.
- 결과 경로는 owner별로 분리(`091-cai-exp-tw/`, `091-cai-exp-sc/`). 공통 원장·코드·
  raw 파일을 서로 수정하지 않습니다.
