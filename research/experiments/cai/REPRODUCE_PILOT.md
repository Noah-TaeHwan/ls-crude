# 파일럿 재현 안내 (교통 / 교통+DMR, 2026-09-11 배치 F)

성찬님 실행용. 프로젝트 상대경로만 사용합니다. 참조 결과는 공유 브랜치
`research/experiments/cai/reference/`에 있습니다.

## 0. 코드·환경

- 정본 코드: `research/src/ls_crude/experiment` (배치 F 정렬 수정 포함).
  두 파일럿 run의 code fingerprint: `79aff9062f62` (provenance에 기록).
- 설치: `cd research && python3 -m venv .venv-share && .venv-share/bin/pip install -r requirements-exp.txt && .venv-share/bin/pip install -e . --no-deps`

## 1. 파일럿 실행 명령

```bash
cd research
.venv-share/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/pilot_retro_traffic.config.json
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/pilot_retro_traffic.config.json --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli run --config experiments/cai/pilot_retro_traffic_dmr.config.json --base-dir data/processed/091-cai-exp-sc
.venv-share/bin/python -m ls_crude.experiment.cli compare \
  --left  experiments/cai/reference/pilot_20260911T130235Z \
  --right data/processed/091-cai-exp-sc/<your_traffic_run_id>
```

## 2. 필요한 입력 CSV (이 묶음에 미포함 — 재배포 조건 미확인)

현재 FHWA 정책 페이지(403)와 EPA 재사용 문구 자동 확인이 실패해 **CSV를 Git·메일·Preview에
올리지 않았습니다**. 아래 공식 원출처에서 직접 받아 같은 필터로 생성하세요(경로 B).
원출처가 개정되면 해시가 달라질 수 있으며, 그 경우 억지로 맞추지 말고 빈티지 차이를 보고합니다.

### A. traffic_avc040_daily.csv (필요 컬럼: `date,value`)

1. FHWA TMAS 월별 zip: `https://www.fhwa.dot.gov/policyinformation/tables/tmasdata/<YYYY>/<mon>_<YYYY>_ccs_data.zip`
   (mon=jan..dec; 이 파일럿은 2015–2018 48개월 + 2020-03 + 2023 12개월 사용)
2. 각 zip에서 `OK_*` 추출 후 `research/notebooks/091-tmas/parse_volume.py --station AVC040` 실행.
3. 일별 합: 날짜별로 방향(3,7) `day_total_veh` 합 → `value = total (해당 날짜 hours_missing==0일 때만, 아니면 공백)`.
   없는 날짜·월은 채우지 않습니다.
4. 기대 해시(우리 빈티지): `98d5761ddd9eae80f81abe2f27933fe9b4d600a92672ad4cec2dbb4920ff6ab6`

### B. dmr_ok0026701_001_mgd.csv (필요 컬럼: `date,value,available_at`)

1. EPA ECHO REST:
   `https://echodata.epa.gov/echo/eff_rest_services.get_effluent_chart?p_id=OK0026701&start_date=01/01/2015&output=JSON`
2. 필터: outfall `001`, parameter flow, unit `MGD`, basis `DAILY MX`, 수치값만.
   `date`=관측(모니터링 기간 종료일), `value`=수치, `available_at`=ValueReceivedDate(접수일).
3. 다른 단위(gal/d)·기준(MO AVG)·시설은 합치지 않습니다.
4. 기대 해시(우리 빈티지): `251aa9e6e60a2d7c16c9330776c6662117156230a48cbe004a9640907ead61be`

## 3. compare가 비교하는 것

- spec_hash(config·입력 SHA 포함), price_sha, target, eval 창, mode.
- 설정별 상태와 **metrics 동등성**(accuracy/log_loss/brier 등 원수치).
- 가중치·계수는 export summary에 저장되어 있으니 필요 시 육안·스크립트로 대조합니다.
- 고정 라이브러리(pandas 3.0.5/sklearn 1.9.0/scipy 1.18.1)·동일 seed에서는 exact equality를
  기대합니다. 불일치는 숨기지 않고 그대로 보고합니다(허용오차로 검사를 약화하지 않음).

## 4. 참조 결과 위치 (공유 브랜치)

- `research/experiments/cai/reference/pilot_20260911T130235Z/export/summary.json` (교통 단독)
- `research/experiments/cai/reference/pilot_20260911T130219Z/export/summary.json` (교통+DMR)
- 계수·가중치·전처리 전체는 각 run의 `internal/provenance.json`·`export/summary.json`에 있음.
