# CAI 실험 프로그램 (dev IS)

`research/src/ls_crude/experiment/` — 재현 가능한 CAI 실험 러너. 실제 관측과
합성 검증을 분리하고, 최종 OOS(2024+)는 프로그램이 읽지 않는다.

## 실행

```bash
cd research

# 1) 스펙·입력 해시 검증 (기록된 계획을 실행 전에 확인)
.venv/bin/python -m ls_crude.experiment.cli validate --config experiments/cai/dev_is.config.json

# 2) 합성 fixture 엔드투엔드 (기능·누출 방지 확인, 실증 아님)
.venv/bin/python -m ls_crude.experiment.cli demo

# 3) 실제 개발용 IS 실행 (config의 기간·타깃·모델 고정)
.venv/bin/python -m ls_crude.experiment.cli run --config experiments/cai/dev_is.config.json

# 4) 상태 확인
.venv/bin/python -m ls_crude.experiment.cli status --run-dir <run_dir>

# 테스트
.venv/bin/python -m pytest tests/test_experiments.py -q
```

## 규칙

- **사전 등록**: `dev_is.config.json`에 기간·타깃(다음 5거래일 상승 2분류)·
  비교 모델·선택 기준을 결과 확인 전에 고정한다. 결과를 본 뒤 이 파일을 바꾸지 않는다.
- **분리**: 학습/내부검증은 시간순, 라벨 창이 검증 경계를 넘는 학습 행은 제외.
  전처리 통계는 학습 구간에서만 적합한다.
- **누출 방지**: 시장 피처는 과거 종가만 사용(온라인 일치 검사 기록), 컴포넌트는
  공개 지연(availability_lag_days) 적용 후 사용, 결측은 채우지 않고 행 제거·집계.
- **가중치**: CAI 구성 가중치는 `w>=0, sum(w)=1` 심플렉스. 단일 성분이면 학습을
  강제하지 않고 `[1.0]`으로 기록(합성 CAI로 발표 금지). 회귀계수와 구성 가중치를
  혼동하지 않는다.
- **게이트**: 분석 이용 조건·공개시각 근거가 없는 입력은 여기에 pin할 수 없다.
  현재 컴포넌트 목록은 비어 있으므로 CAI 모델은 `blocked`로 남는 것이 정상이다.
- **한도**: 설정 ≤12, 동시 작업 ≤2, 첫 실행 ≤2h, 동일 설정 자동 재시도 금지.
  모든 설정 상태(대기/진행/완료/실패/차단)는 `internal/run_state.json`에 남는다.
- **산출 분리**: `export/summary.json`은 공개용 집계·출처 해시만,
  `internal/`에만 예측 CSV·provenance가 있다.

## 버전 연결

각 실행은 코드 해시·입력 SHA-256·컴포넌트 순서·전처리 규칙·학습/검증 기간·
라이브러리 버전·평가 방식을 `internal/provenance.json`에 함께 저장한다.
가중치·계수만 따로 저장하지 않는다.
