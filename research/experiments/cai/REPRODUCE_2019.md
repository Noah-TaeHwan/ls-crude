# 대표 재현 — 2019년 보강 교통+DMR 회고 실험

현재 대표 사례는 **2019년 교통 학습자료를 보강한 완료 실험**입니다. 가장 최근에 완료한 입력 보강 사례를 설명 대상으로 삼았으며, 성과가 좋은 모델을 골라 대표로 정한 것이 아닙니다. 기존 파일럿·DMR 유효기간 민감도는 [REPRODUCE_SENS.md](REPRODUCE_SENS.md)에 역사 비교로 남깁니다.

## 기준과 경계

- 설정 정본: [pilot_retro_traffic_dmr_2019.config.json](pilot_retro_traffic_dmr_2019.config.json). 경로·SHA·날짜·seed·모델을 변경하지 않습니다.
- 참조 실행: `20260912T013423Z`, [공개 요약](reference/2019plus_20260912T013423Z/export/summary.json).
- 코드 fingerprint: `79aff9062f62025bd58dbecd6979ca1745dd16d253293f6af86660452a12a67a`.
- spec hash: `5a3d717f679f25247c398b981e974e7cc6d0028374308ff9902c93c241189dd1`.
- 학습 ≤2020년, 검증 설정 2021–2023년, 실제 공통 평가 **2023-01-03~2023-12-21, 245행**. 원래 파일럿 507행에서 보강 후 753행으로 학습 표본이 늘었습니다.
- **2023년 결과를 본 뒤 설계한 후속 회고 실험**입니다. 새로운 독립 검증·최종 OOS·현재 CAI 게시가 아닙니다. 2024+ 타깃·모델·성과 계산과 탐색은 하지 않습니다.
- 가격·DMR 원파일에는 2024+ 행도 포함되어 있습니다. 전체 파일은 기존 pin 검증과 입력 재생성을 위해 읽지만 모델 loader가 2015–2023년으로 제한합니다. 따라서 이 절차는 ‘원파일의 2024+ 바이트를 전혀 읽지 않음’을 주장하지 않습니다.
- 교통량은 전체 차량수이며 원유 차량수로 확인된 값이 아닙니다. DMR은 하수처리장 신고 유량이며 원유 처리량이 아닙니다. 접수일(ValueReceivedDate)은 외부 공개일의 증거가 아닙니다.

## 1. 허용된 최종 입력을 확보한 동료의 수치 재현

CSV는 Git에 포함하지 않습니다. FHWA/EPA 재배포 조건이 미확인인 동안 파일을 Git·메일·Preview로 옮기지 않습니다. 승인된 접근 경로로 다음 빈티지를 확보한 뒤에만 실행합니다. 원출처가 개정되면 빈티지 차이로 중단하며 SHA·config를 결과에 맞춰 바꾸지 않습니다.

| 고정 입력 경로(저장소 루트 기준) | SHA-256 |
| --- | --- |
| `research/data/clf-daily-2015-2026.csv` | `ea70f9340b17081a037fa3f4cd0ed12810a67cea781e5779127eb651afd56171` |
| `research/data/processed/091-cai-exp-pilot/inputs/traffic_avc040_daily_2019plus.csv` | `c9522c2335b128cff711d3fced52832db9f92e2abc56694ea5f0a57d9c756302` |
| `research/data/processed/091-cai-exp-pilot/inputs/dmr_ok0026701_001_mgd.csv` | `251aa9e6e60a2d7c16c9330776c6662117156230a48cbe004a9640907ead61be` |

환경 설치는 [DELIVERY.md](../../DELIVERY.md)를 따릅니다. 참조 환경은 Python **3.13.15**, numpy **2.5.2**, pandas **3.0.5**, scikit-learn **1.9.0**, scipy **1.18.1**입니다. OS 차이는 보고하되 라이브러리와 결과의 exact equality 요구는 완화하지 않습니다.

아래 명령은 저장소 루트에서 실행합니다. 예시 `.venv-share`가 없다면 `research/.venv` 등 실제 설치된 동일 버전 환경 경로를 사용합니다. Windows에서는 Python 실행 파일만 `research\.venv-share\Scripts\python.exe`로 바꿉니다.

```bash
research/.venv-share/bin/python -m ls_crude.experiment.cli validate \
  --config research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json
research/.venv-share/bin/python -m ls_crude.experiment.cli run \
  --config research/experiments/cai/pilot_retro_traffic_dmr_2019.config.json \
  --base-dir research/data/processed/091-cai-reproduction-peer --no-cache
# 출력된 run_id를 아래 <run_id>에 그대로 대입한다.
research/.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left research/experiments/cai/reference/2019plus_20260912T013423Z \
  --right research/data/processed/091-cai-reproduction-peer/<run_id>
research/.venv-share/bin/python research/scripts/reproduce_cai_2019.py \
  --self-check research/data/processed/091-cai-reproduction-peer/<run_id>
```

**최종 성공 판정은 마지막 self-check까지 통과했을 때만**입니다. 기존 `compare`의 `MATCH`는 spec·가격 SHA·target·공통 평가 창·mode의 일치만 합산합니다. `configs[].metrics_match`를 별도로 표시하지만 status/metrics 불일치를 종료코드에 포함하지 않습니다. 새 helper는 모델 전체 목록·상태·표본수·metrics·weights·coefficients·component SHA·코드 fingerprint·라이브러리 버전과 내부 예측 파일의 SHA를 별도로 검사합니다. `--no-cache`는 내부 예측 CSV가 생략되는 cache hit를 방지합니다.

## 2. 기존 로컬 원자료에서 입력까지 재생성

새 도구를 만들지 않고 기존 도구를 연결한 [reproduce_cai_2019.py](../../scripts/reproduce_cai_2019.py)를 사용합니다. 다운로드를 하지 않으며 기존 입력·원본·참조 run을 덮어쓰지 않습니다. `--out`은 존재하지 않는 새 디렉터리여야 합니다.

```bash
research/.venv/bin/python research/scripts/reproduce_cai_2019.py \
  --out research/data/processed/091-cai-reproduction-20260913/full-chain
```

위 출력 경로는 이번 실행에서 이미 생성됐습니다. 다시 실행할 때에는 `full-chain-02` 등 새 경로를 사용합니다.

| 단계 | 기존 도구 / 근거 |
| --- | --- |
| 로컬 73 ZIP → OK VOL | [traffic_sources.csv](reference/2019plus_20260912T013423Z/traffic_sources.csv)의 ZIP 경로·SHA·member·VOL SHA. 2015–2019년 60개월 + 2020-03 + 2023년 12개월 |
| VOL → AVC040 방향·차선별 일 자료 | `research/notebooks/091-tmas/parse_volume.py` |
| 일 자료 → 73개월 패널 | `research/notebooks/091-tmas/build_window_index.py daily --extra-years 2019`. 세 입력 디렉터리에 모두 새 monthly 경로를 사용 |
| 패널 → 교통 입력 | `research/scripts/build_pilot_inputs.py traffic`. 날짜별 방향 합, hours_missing이 있으면 공백 |
| 로컬 ECHO JSON → DMR 시리즈 | `research/notebooks/091-candidates/dmr_series_build.py`. [dmr_sources.json](reference/2019plus_20260912T013423Z/dmr_sources.json)에 기존 18개 JSON과 IS 가격 보조 입력의 경로·SHA 기록 |
| 시리즈 → DMR 입력 | `research/scripts/build_pilot_inputs.py dmr`. OK0026701/001/MGD/DAILY MX/수치 행, 접수일 유지 |
| 재생성 입력 → 원본 대조 | 두 CSV의 byte equality와 config SHA를 확인. 원본 config의 입력 경로를 바꾸지 않음 |
| 고정 run → 참조 대조 | no-cache 실행, 전체 요약·내부 예측 SHA·날짜/정답 SHA exact equality |

ZIP 원출처 URL은 traffic manifest에 있습니다. DMR 접근·필터 근거는 [파일럿 안내](REPRODUCE_PILOT.md)를 참고합니다. 직접 취득 가능하다는 사실은 저장·재배포 허가를 대신하지 않습니다. 최종 입력만 있는 동료는 1절을 사용하며, 2절의 원자료 재생성까지 완료했다고 주장하지 않습니다.

## 3. 이번 실행에서 확인한 결과

2026-09-13 KST에 같은 로컬 환경으로 실행한 신규 run은 **`20260912T233055Z`**입니다. [검증 영수증](../../indexes/091-cai-reproduction-20260913/verification.json)과 [코드·config·입력 해시](../../indexes/091-cai-reproduction-20260913/manifest.json)를 남겼습니다.

- 로컬 ZIP 73개와 DMR JSON 18개에서 최종 CSV 2개를 새 경로로 재생성했고 원본과 byte-identical입니다. 새 다운로드 0건.
- 모델 6종 모두 완료, 학습 753행·평가 245행. 상태·metrics·weights·coefficients 전체 exact equality.
- 내부 예측 CSV 6개 byte SHA와 날짜·정답 SHA가 원본 run과 일치합니다. 원래 507행 파일럿과의 평가 날짜·정답도 6종 모두 동일합니다.
- 검증 helper의 음성 검사도 실행했습니다. 정상 결과는 통과하고 status·metrics·weights를 의도적으로 바꾼 요약은 거부합니다.
- **성찬님 독립 재현은 아직 미검증**입니다. 이 결과는 같은 환경의 재실행 증거입니다. 플랫폼이 다른 환경의 차이는 별도로 기록해야 합니다.

| 모델 | Accuracy | Log loss ↓ | Brier ↓ | 가중치(교통, DMR) |
| --- | ---: | ---: | ---: | --- |
| 학습 상승률 상수 | 0.526531 | 0.691740 | 0.249297 | 해당 없음 |
| 시장정보 | 0.497959 | 0.694204 | 0.250563 | 해당 없음 |
| CAI 동일가중 | 0.526531 | 0.694097 | 0.250452 | 0.5, 0.5 |
| CAI 학습가중 | 0.489796 | 0.696436 | 0.251638 | 약 0, 1 |
| 시장정보 + CAI 동일가중 | 0.489796 | 0.696606 | 0.251726 | 0.5, 0.5 |
| 시장정보 + CAI 학습가중 | 0.477551 | 0.698382 | 0.252606 | 약 0, 1 |

원수치는 공개 summary가 정본입니다. 동일 평가일에서 **시장정보에 CAI를 추가한 두 조합은 시장정보 단독보다 주지표 log loss가 높았습니다**. 원래 파일럿 대비 격차의 변화는 학습자료·표본이 달라진 후속 회고 결과이며, 보강의 인과 효과로 해석하지 않습니다.

## 4. 인계와 공개 범위

공개: config, 재현 도구, source URL·해시 manifest, 집계 summary, 내부 예측의 해시, 검증 영수증. 비공개/미추적: 원자료, 입력 CSV, 행별 예측·정답, 전체 내부 provenance, 새 processed 디렉터리와 로그. 공개 summary에는 모델 계수·가중치가 있지만 **행별 예측 배열은 없습니다**.

성찬님 확인 요청 묶음은 이 문서 → 고정 config → 공개 summary → 검증 영수증 순서입니다. 동료는 코드 commit, 환경 버전, 입력 hash, 신규 run_id, helper 통과/실패, 빈티지·플랫폼 차이를 회신하면 됩니다. 파일을 확보하지 못했다면 그 입력 이름과 SHA에서 멈춥니다. 모델 선택·새 데이터 취득·OOS 개방·대외 발신은 이 재현 절차에 포함되지 않습니다.
