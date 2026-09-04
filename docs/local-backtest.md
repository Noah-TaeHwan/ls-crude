# 로컬 연구 환경과 백테스트 입력 규칙

웹에서는 백테스트를 실행하지 않습니다. 이 문서는 `research/`에서 분석 환경을 만들고 가격·후보 데이터와 검증 구간을 같은 기준으로 맞추기 위한 로컬 안내서입니다. 공개 결과는 `/research`에서 확인합니다.

## 순서

1. 이 저장소를 Cursor로 연다. `research/` 와 `app/` 이 보이면 맞다.
2. 연구 폴더에서 가상환경을 켠다.

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

Windows면 `source` 대신 `.venv\Scripts\activate`.

3. `pytest`로 현재 연구 테스트를 확인합니다. 검증하지 않은 성과 수치는 적지 않습니다.
4. 가격은 `research/data/clf-daily-2015-2026.csv` (Yahoo `CL=F`). Investing.com에서 가격을 긁지 않는다.
5. 후보 시계열은 `date,value` CSV. 날짜는 `YYYY-MM-DD`. Sharpe 칸은 넣지 않는다.
6. 인샘플 `2015-01-01`~`2023-12-31`에서 후보와 규칙을 정합니다. 아웃샘플 `2024-01-01`~는 규칙을 잠근 뒤 한 번만 확인합니다. 이미 확인한 구간은 다시 튜닝에 쓰지 않습니다.

신호는 공개된 뒤에만 사용할 수 있습니다. 같은 날 종가를 신호에 넣지 않습니다.

후보 표는 [`research/notebooks/pizza-hunt.md`](../research/notebooks/pizza-hunt.md)에 있습니다. 실제 후보가 없으면 표를 비웁니다.

## 손성찬 인계 (2026-09-04)

대안 데이터 Oil Pizza 가중치는 전부 `0.0`이다. 공개 장부는 후보 52 · 통과 0.
기준모형은 `research/src/ls_crude/models`와 `backtest`에서 정통 입력(Yahoo `CL=F` 가격, RSI, 실현변동성)만 사용한다.
웹에 Sharpe·MDD·적중률을 넣지 않는다. 인샘플에서 규칙을 잠그고 아웃샘플은 한 번만 연다.
이슈 #2(규칙+RF 기준모형), #4(walk-forward)가 이 작업이다.
