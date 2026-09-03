# 로컬 분석 준비 · 백테스트 인계

이 사이트(`/`)는 유가 옆 공개 신호를 보여 줍니다. 웹과 저장소에는 실행 가능한 백테스트 진입점이 아직 없습니다.

Cursor에서 환경과 입력 규칙을 확인한 뒤 실제 백테스트 구현 담당자에게 인계합니다. 화면 안내는 `/backtest`.

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

3. `pytest` 가 통과한 상태로 인계한다. 성과 숫자를 지어 내지 않는다.
4. 가격은 `research/data/clf-daily-2015-2026.csv` (Yahoo `CL=F`). Investing.com에서 가격을 긁지 않는다.
5. 후보 시계열은 `date,value` CSV. 날짜는 `YYYY-MM-DD`. Sharpe 칸은 넣지 않는다.
6. 인샘플 `2015-01-01`~`2023-12-31`에서만 고른다. 아웃샘플 `2024-01-01`~ 는 후보를 잠근 뒤 한 번만 연다.

신호는 그날 알고, 손익은 다음날 CL. 같은 날 종가를 신호에 넣지 않는다.

후보 표는 [`research/notebooks/pizza-hunt.md`](../research/notebooks/pizza-hunt.md). 실후보가 없으면 표를 비운다.
