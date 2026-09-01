# research

Yahoo 가격 + RSI + Investing.com 뉴스 태그 + Oil Slice.

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
pytest
python -m ls_crude.build
```

인샘플 2015-01-01~2023-12-31, 아웃샘플 2024-01-01~. 설계 정본은 `docs/research-design.md`.
