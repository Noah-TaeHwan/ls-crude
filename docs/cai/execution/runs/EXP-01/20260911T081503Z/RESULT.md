# 실행 결과 — EXP-01 (CAI 실험 프로그램 + 개발 IS 제한 실행)

```yaml
unit_id: EXP-01
status: DONE
executed_at_kst: "2026-09-11 17:10 .. 17:15"
program_version: cai-exp/0.1.0
real_run_dir: research/data/processed/091-cai-exp/20260911T081503Z
demo_run_dir: research/data/processed/091-cai-exp-demo/20260911T081349Z
config: research/experiments/cai/dev_is.config.json (사전 등록, 결과 확인 전 작성)
final_oos: 잠금·미실행 (프로그램이 2024+ 를 읽지 않음)
```

## 1. 프로그램 (research/src/ls_crude/experiment/)

| 모듈 | 기능 |
| --- | --- |
| `spec.py` | 설정 JSON 스키마 검증, 입력 SHA-256 pin, IS 경계 강제 |
| `data.py` | 가격 로드(IS만), 다음 5거래일 상승 타깃, RSI14·ret_5d(인과), 컴포넌트 지연·결측 처리, 학습/검증 마스크, 라벨 창 경계 제외, 온라인 누출 검사 |
| `models.py` | 기준선(학습 구간 상승률), 시장 전용 로지스틱, 동일가중 CAI, 제약 학습 CAI(w≥0, Σw=1), 단일 성분 학습 비강제 |
| `runner.py` | 설정 ≤12·순차 실행, 상태(pending/running/done/failed/blocked), 캐시 dedup, resume, 한도(2h) 체크포인트, provenance, export/internal 분리 |
| `cli.py` | 단일 명령: validate / demo / run / status |
| `fixtures.py` | 결정적 합성 fixture(누출 없는 인과 성분), 데모·테스트 전용 |

실행 명령(단일):
```bash
cd research
.venv/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/dev_is.config.json
.venv/bin/python -m ls_crude.experiment.cli demo          # 합성 엔드투엔드
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/dev_is.config.json
```
테스트: `.venv/bin/python -m pytest tests/test_experiments.py -q` → **10 passed**
(경계 누출, 결측 비채움, 가중치 심플렉스, 단일 성분 비강제, CAI 차단, export 분리,
캐시·resume, 온라인 누출 검사, 음수 정산 제외 포함)

## 2. 실제 IS 실행 결과 (사전 등록 config, WTI CL=F 실제 종가)

- 검증 구간: 2021-01-04..2023-12-21, 공통 평가 748행
- 학습 1,483행 / 라벨 창 경계 제외 5행 / 무효 종가 1행(2020-04-20 -37.63)
  → 그 창 라벨 6행 제거, 채움 없음
- 누출 검사: 온라인 일치 ok (max_abs_diff 0.0), OOS 날짜 0

| 모델 | 상태 | accuracy | log_loss | 비고 |
| --- | --- | --- | --- | --- |
| baseline_up_rate | done | 0.5628 | 0.6872 | 학습 구간 상승률 상수 |
| market_only_logit | done | 0.5053 | 0.6894 | RSI14·ret_5d, 기준선 대비 **열위** |
| cai_equal_logit | blocked | — | — | 적격 컴포넌트 없음 |
| cai_learned_logit | blocked | — | — | 적격 컴포넌트 없음 |

해석: 이 개발 구간에서 기존 시장 정보 기반 모델은 단순 기준선을 이기지 못했다.
수치는 모델 선택 근거가 아니며 최종 OOS는 열지 않았다.

## 3. Gate (CAI 모델 차단 사유)

- LAUE(Payne 고용): BLS 약관 페이지 403(재확인 실패), 공개시각 규칙 미확정 → 입력 부적격.
- TMAS: 2016-03·2023-03 두 달 표본만, 공개·가용 시각 unknown → 모델 입력 금지.
- 따라서 `components: []`로 실행, CAI 모델은 `blocked`로 정직하게 남김.

## 4. 재개·중단

- `run --resume <run_dir>` 로 상태 보존 재개, 캐시 hit는 재계산 생략.
- 실패 설정은 자동 재시도하지 않음(명시 `--retry-failed` 시 1회 한정).
- 이번 실행은 배치 프로세스로 완료(장기 실행 프로세스 아님).
