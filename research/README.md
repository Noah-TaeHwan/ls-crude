# research

WTI 선물 기준모형과 대안 데이터 확장모형을 만드는 Python 워크스페이스입니다.

## 레이아웃

```text
research/
  requirements.txt
  data/                 # 원천·중간 데이터 (Git 제외)
  notebooks/            # 탐색용 노트북
  src/ls_crude/
    data/               # 수집·전처리
    features/           # Feature Engineering, 대안지표
    models/             # 규칙 기반, Random Forest 등
    backtest/           # Walk-forward, 성과 지표
```

## 역할

- **오태환**: `data/`, `features/` — OHLCV·기본 지표·대안 데이터 수집과 피처
- **손성찬**: `models/`, `backtest/` — 진입·청산, ML, Walk-forward, Sharpe/MDD/적중률

인터페이스는 날짜 인덱스의 피처 테이블(`features`)과 포지션 시계열(`positions`: long / flat / short)을 기준으로 맞춥니다.

## 설치

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 실험 기록

노트북이나 한 번짜리 스크립트 결과는 `docs/experiments/`에 가설, 데이터 출처, look-ahead 여부, 지표를 남겨 주세요.
