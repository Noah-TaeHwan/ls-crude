# 2026-09-07 공동 헌트 재현

```bash
cd research
.venv/bin/python notebooks/hunt-20260907/collect_candidates.py
.venv/bin/python notebooks/hunt-20260907/build_and_test.py
```

정본 검정은 `build_and_test.py`(단순수익률 f1, 화요일 이후 첫 거래일). `analyze_wti_checks.py`는 주간 로그수익률 보조 산식이다. 숫자를 섞어 하나의 r로 발표하지 않는다.

`python -m ls_crude.build`는 쓰지 않는다. 아웃샘플로 고르지 않는다.
원본은 `research/gathering/raw/ALT-20260907-18`…`29`/`20260907T063658Z/` (gitignored).
표·그림은 `research/indexes/`. Baker Hughes xlsb 재현에는 로컬 `pyxlsb`가 필요하다. CI pytest는 이 스크립트를 돌리지 않는다.
