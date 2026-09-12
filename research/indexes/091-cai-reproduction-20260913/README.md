# 091 CAI — 2019 보강 고정 실험 재현 영수증

- 실행일: 2026-09-13 KST. 신규 UTC run ID: `20260912T233055Z`.
- 목적: 기존 2019 보강 회고 실험 `20260912T013423Z`를 같은 입력·코드·환경에서 재현. 새 모델 선택·튜닝·OOS 실행 없음.
- 재현 안내 정본: [REPRODUCE_2019.md](../../experiments/cai/REPRODUCE_2019.md).
- 원자료 source manifest: [traffic_sources.csv](../../experiments/cai/reference/2019plus_20260912T013423Z/traffic_sources.csv)(로컬 ZIP 73개, ZIP→VOL member SHA), [dmr_sources.json](../../experiments/cai/reference/2019plus_20260912T013423Z/dmr_sources.json)(기존 DMR JSON 18개 + 보조 IS 가격 CSV).
- 코드·설정·가격/교통/DMR 입력 SHA: [manifest.json](manifest.json).
- 결과: [verification.json](verification.json). 두 재생성 입력 byte-identical, 6종 학습 753/평가 245, 모델·계수·지표·가중치·내부 예측 SHA exact equality. 기존 파일럿(학습 507행)과 평가 날짜·정답도 동일.
- 공개 참조: [summary.json](../../experiments/cai/reference/2019plus_20260912T013423Z/export/summary.json), [내부 예측 검증용 SHA](../../experiments/cai/reference/2019plus_20260912T013423Z/verification.json). 행별 예측·정답은 공개하지 않음.
- 로컬 전체 출력: `research/data/processed/091-cai-reproduction-20260913/full-chain/`. 기존 파일 덮어쓰기 없음. `commands.log`·`commands.json`에 전체 80개 도구 호출 인수/결과를 보존하며 개인 절대경로가 있어 공개하지 않음.
- 다운로드 0건. 입력 원파일에는 2024+ 행이 있지만 모델·평가 출력은 2015–2023 IS로 제한. 2024+ 성과 계산·탐색 없음.
- 성찬님 독립 재현과 외부 원출처 재취득은 미검증. 재배포 권한 미확인인 입력은 공유하지 않음.

```bash
# 저장소 루트. 이미 실행된 경로는 재사용 불가하므로 다음에는 새 --out을 지정한다.
research/.venv/bin/python research/scripts/reproduce_cai_2019.py \
  --out research/data/processed/091-cai-reproduction-20260913/full-chain
research/.venv/bin/python research/scripts/reproduce_cai_2019.py \
  --self-check research/data/processed/091-cai-reproduction-20260913/full-chain/runs/20260912T233055Z
```

두 번째 명령은 정상 결과 통과 후 status·metrics·weights를 메모리에서 각각 손상시켜 검사기가 실패를 잡는지 확인한다. 원본 run은 수정하지 않는다. 기존 CLI `compare`의 MATCH는 입력·실험 식별자의 일치만 뜻하며, 이 영수증은 그보다 넓은 수치·내부 배열 검사를 별도로 실행했다.
