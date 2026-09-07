# 원본 영수증 — WTI-CLF-IS (Yahoo `CL=F` 일봉, 2015-01-01~2024-01-01, 공유 가격 입력)

- 출처: Yahoo Finance `CL=F`, `research/src/ls_crude/data/yahoo.py`의 `download_ohlcv`
  (`interval="1d", auto_adjust=True`)로 수집. 가격 API는 Yahoo만 사용.
- 수집시각: 2026-09-07 06:51 UTC (2026-09-07 15:51 KST)
- 파일: `CLF_daily_2015-2023.csv` (2262행, 2015-01-02~2023-12-29, 열 Open/High/Low/Close/Volume)
- SHA-256: `89c3a04c994d374131dac431561511a196cc19c4029f5f7a9103ba29d2c85d7f`
- 범위: `end="2024-01-01"`로 2024+를 내려받지 않음. 이 파일을 쓰는 후보(09·10와 worker-2 spot-check 01/04/07)는
  가격 OOS 미열람. 단 10의 GASREGW 파일에 2024+행이 있어 10의 노출은 SEEN으로 별도 기록.
- 재현: `research/.venv/bin/python -c "from ls_crude.data.yahoo import download_ohlcv; ..."` (작업 디렉터리 `research/`, `src` 경로 필요)
  또는 각 후보 스크립트가 이 CSV를 직접 읽음.
- 권한: Yahoo 이용약관. 원본 CSV는 Git에 올리지 않고 재배포하지 않음.
