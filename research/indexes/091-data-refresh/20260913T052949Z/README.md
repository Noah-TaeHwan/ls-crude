# DMR 2023 재수집·감사 영수증

[결과와 한계](../../../gathering/notes/2026-09-13-cai-data-refresh.md) · [분석](audit.json) · [접근 결과](sources.json)

원자료: `research/gathering/raw/091-dmr-refresh/20260913T052949Z/`. 정제 CSV와 전체 감사: `research/data/processed/091-dmr-refresh/20260913T052949Z/`. 각 원문은 별도 수집 빈티지로 보존하며 Git에 포함하지 않습니다.

기존 원자료를 확보한 뒤 저장소 루트에서 실행합니다. `--out`은 존재하지 않는 새 폴더여야 합니다.

```sh
python3 research/scripts/audit_dmr_refresh.py --raw research/gathering/raw/091-dmr-refresh/20260913T052949Z/dmr_OK0026701_2023.json --baseline research/data/processed/091-cai-exp-pilot/inputs/dmr_ok0026701_001_mgd.csv --out /tmp/cai-dmr-refresh-recheck
pytest -q research/tests/test_dmr_refresh.py research/tests/test_cai_worklist.py
python3 research/scripts/build_cai_team_worklist.py --check
python3 research/scripts/sync_candidate_ledger.py --check
```

다운로드가 필요하면 sources.json의 공식 고정 2023 URL을 1회 요청하여 새 raw 폴더에 저장하고 JSON/시설/기간을 검증합니다. 재취득된 파일의 SHA가 바뀌면 기존 빈티지를 교체하지 말고 새 영수증을 만듭니다. 이번 조회는 438,839바이트였으며 자동 반복 수집은 구현하지 않았습니다.

생성 파일: 계열 분리 `dmr_series_rows.csv`, 기존 생성기로 만든 `dmr_daily_max_2023.csv`, 별도 `dmr_monthly_mean_2023.csv`, 수치·시점·해시 대조 `audit.json`. `available_at`은 기존 입력과의 규격 일치를 위한 접수일이며 당시 공개일의 증거가 아닙니다. 새 학습 또는 운영 지수 생성은 실행하지 않습니다.

검증: 웹 310 tests, typecheck/build, Python 감사·작업표 2 tests, 후보 원장 73개 정합성 검사 PASS. Ego14에서 2·10·25번 실제 상태와 준비 입력 2개·미수락 제안 3개 표시를 확인했습니다. 원본·정제·독립 재실행 파일 해시를 메인이 대조했습니다.
