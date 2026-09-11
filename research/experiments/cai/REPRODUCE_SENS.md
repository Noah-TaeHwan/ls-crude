# 최신 재현 기준 — `share/cai-exp-0.1.0 @ 55ab480`

성찬님 실행용. 프로젝트 상대경로만 사용합니다. 이 문서는 **공유 저장소에 포함**되어 있으며,
`55ab480`의 코드 버전(실행 코드 fingerprint `79aff9062f62`)과 이 문서 자체의 갱신 커밋은 구분됩니다.
과거 `c9fbba3`은 파일럿·weekend 참조가 공유된 시점의 코드 기준으로 보존합니다(최신 안내의 기준 아님).

## 공유본에 포함된 것 (원격 확인 완료)

| 구분 | 경로 |
|---|---|
| 실험 프로그램·테스트 | `research/src/ls_crude/experiment/`, `research/tests/test_experiments.py` |
| 기준모델·환경 확인 config | `research/experiments/cai/weekend_shared.config.json` 외 |
| 파일럿 config | `research/experiments/cai/pilot_retro_traffic.config.json`, `pilot_retro_traffic_dmr.config.json` |
| 민감도 config | `research/experiments/cai/sens_dmr62.config.json`, `sens_dmr31.config.json`, `sens_dmr0.config.json` |
| 진단 코드 | `research/notebooks/091-cai-exp/dmr_reuse_sensitivity.py` |
| 참조 결과 | `research/experiments/cai/reference/tw_shared_*`(2), `reference/pilot_20260911T130235Z|130219Z`, `reference/sens_20260911T132949Z|132951Z` |
| 설치·의존성 | `research/DELIVERY.md`, `research/requirements-exp.txt` |

## 민감도 참조 ↔ 정책 대응 (파일명 순서가 아니라 산출물로 검증)

로컬 run provenance의 `spec.components[].validity_days`로 확인했습니다.

| 참조 경로 | 정책 | validity_days | spec_hash | market log_loss |
|---|---|---:|---|---:|
| `reference/sens_20260911T132949Z` | **A_62** | 62 | 21f31e30… | 0.697094 |
| `reference/sens_20260911T132951Z` | **B_31** | 31 | 30e2ad9f… | 0.696162 |

`reference/`의 각 폴더에는 `export/summary.json`만 들어 있으므로, 대응은 위 표(로컬 provenance 근거)를 따릅니다.
설정 파일 자체의 `components[].validity_days`로도 같은 값을 확인할 수 있습니다.

## 실행 명령 (실제 파일명)

```bash
cd research
.venv-share/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/sens_dmr62.config.json
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/sens_dmr62.config.json --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/sens_dmr31.config.json --base-dir data/processed/091-cai-exp-sc

# 오른쪽 run 경로 찾기: 실행 후 ls data/processed/091-cai-exp-sc/ (UTC run_id 폴더)
#   또는 실행 출력의 run_dir / `status --run-dir <run_dir>` 사용. spec_hash로 어느 config인지 대조 가능.
.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left  experiments/cai/reference/sens_20260911T132949Z \
  --right data/processed/091-cai-exp-sc/<sens_dmr62 실행의 run_id>
.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left  experiments/cai/reference/sens_20260911T132951Z \
  --right data/processed/091-cai-exp-sc/<sens_dmr31 실행의 run_id>
```

## compare 범위

- 비교함: spec_hash(config·입력 SHA 포함), price_sha, target, eval 창, mode, 설정별 상태·metrics 원수치.
- 수동 확인: 가중치·계수·예측 배열(각 run의 `export/summary.json`에 저장되어 있음).
- 고정 라이브러리(pandas 3.0.5·sklearn 1.9.0·scipy 1.18.1)에서 exact equality를 기대하며,
  불일치는 은폐 없이 보고합니다.

## 입력 (미포함 — 남은 조건)

입력 CSV 2종은 **공유본에 포함되지 않았습니다**(FHWA/EPA 재배포 문구 미확인). 취득 경로와 스키마·해시:

- `traffic_avc040_daily.csv` (`date,value`): FHWA TMAS 월별 zip →
  `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/<YYYY>/<mon>_<YYYY>_ccs_data.zip` →
  `OK_*` 추출 → AVC040 파싱 → 일별 합(시간 결측 0인 날만). 기대 sha `98d5761d…`.
  ※ TMAS 다운로더·파서 스크립트(`notebooks/091-tmas/`)는 **아직 공유본에 없습니다**(다음 동기화 후보).
  수동 절차로도 재현 가능하도록 위 규칙을 명시합니다.
- `dmr_ok0026701_001_mgd.csv` (`date,value,available_at`): EPA ECHO
  `eff_rest_services.get_effluent_chart?p_id=OK0026701` → outfall 001·unit MGD·basis DAILY MX·수치만,
  `available_at`=ValueReceivedDate. 기대 sha `251aa9e6…`.
- 날짜 규칙: 관측일 → 가용일(접수일 우선) → 의사결정일, `validity_days` 제한 내 재사용,
  역방향·무제한 채움 없음. **접수일≠외부 공개일.**

입력 확보 전에는 **코드·설정·방법 검토**가 가능하고, 확보 후에 **수치 재현(run/compare)**이 가능합니다.
원출처가 개정되어 해시가 달라지면 억지로 맞추지 말고 빈티지 차이로 보고해 주세요.
