# 최신 재현 기준 (로컬 공유 후보 — 아직 push 안 함)

정본 실행기: `ls_crude.experiment.cli` (교체 없음). 코드 fingerprint `79aff9062f62`
(정본 `research/src/ls_crude/experiment`, 공유 브랜치 `share/cai-exp-0.1.0 @ c9fbba3`의 코드와 동일).
**미공유 로컬 변경**: `sens_dmr{62,31,0}.config.json`, 진단 스크립트, 최신 테스트, 표시용 요약.

## 재현 대상 구분

| 대상 | config (research/experiments/cai/) | 목적 | 참조 결과 |
|---|---|---|---|
| 기준모델·환경 확인 | `weekend_shared.config.json` | 기준선·시장모델 환경 검증 | `reference/tw_shared_20260911T085005Z` |
| 실제 두 성분 파일럿 | `pilot_retro_traffic.config.json`, `pilot_retro_traffic_dmr.config.json` | 교통 / 교통+DMR 회고 | `reference/pilot_20260911T130235Z`, `…130219Z` |
| 최신 민감도 | `sens_dmr62.config.json`, `sens_dmr31.config.json` | DMR 재사용 62/31일 | 로컬 run `research/data/processed/091-cai-exp-sens/{20260911T132949Z,20260911T132951Z}` (공유 보류) |
| 당일 정책 | `sens_dmr0.config.json` | 표본 미달 진단(학습 안 함) | 로컬 진단 `docs/cai/execution/runs/EXP-04/20260911T132918Z_SENS/sample_diagnostics.json` |

## 명령 (정확한 파일명)

```bash
cd research
.venv-share/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/sens_dmr62.config.json
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/sens_dmr62.config.json --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/sens_dmr31.config.json --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left  <reference_run_dir> --right data/processed/091-cai-exp-sc/<your_run_id>
```

## compare 범위

- 비교함: spec_hash(config·입력 SHA 포함), price_sha, target, eval 창, mode, 설정별 상태·metrics 원수치.
- 비교 안 함(수동 검토): 가중치·계수·예측 배열. export summary에 저장되어 있어 육안/스크립트 대조.
- 고정 라이브러리(pandas 3.0.5·sklearn 1.9.0·scipy 1.18.1)에서 exact equality 기대. 불일치는 은폐 없이 보고.

## 입력 (스키마·규칙·취득)

- `traffic_avc040_daily.csv`: `date,value` / FHWA TMAS 월별 zip → OK_*.VOL → `parse_volume.py --station AVC040` → 일별 합(시간 결측 0인 날만). 기대 sha `98d5761d…`.
- `dmr_ok0026701_001_mgd.csv`: `date,value,available_at` / EPA ECHO `eff_rest_services.get_effluent_chart?p_id=OK0026701` → outfall 001·unit MGD·DAILY MX·수치만, `available_at`=ValueReceivedDate. 기대 sha `251aa9e6…`.
- 날짜 규칙: 관측일 → 가용일(접수일 우선) → 의사결정일, `validity_days` 제한 내 재사용, 역방향/무제한 채움 없음.
- **미완료**: 원자료 재배포 문구 미확인 → CSV 미공유. 공식 원출처 직접 취득(경로 B)만 안내. 접수일≠공개일.

## 참조 결과 위치(공유 브랜치, c9fbba3 시점)

`experiments/cai/reference/` — `tw_shared_*`(2), `pilot_*/export/summary.json`(2). 민감도 참조는 로컬에만 있음.
