# research

두 층입니다.

1. **공개 신호** — Yahoo `CL=F` + RSI + Investing.com 태그 + Oil Slice 초안
2. **조사** — 크립토의 뭐 × 뉴스의 무슨. 확정 후보는 아직 없음

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
pytest
python -m ls_crude.build
```

| 할 일 | 위치 |
| --- | --- |
| 조사 메모 | [`notebooks/pizza-hunt.md`](notebooks/pizza-hunt.md) |
| 실험 한 장 | [`docs/experiments/`](../docs/experiments/README.md) |
| 후보 파일 | [`data/pizza/`](data/pizza/README.md) |
| 시드 뉴스 | [`data/event_calendar.csv`](data/event_calendar.csv) |

인샘플 2015-01-01~2023-12-31, 아웃샘플 2024-01-01~. 설계 정본은 `docs/research-design.md`.
