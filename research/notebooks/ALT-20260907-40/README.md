# 에너지 문서 관심도 탐색 실행기

> 2026-09-07 통합: 보관본 18–25를 39–46으로 이관했습니다. 이전 실행 영수증·그림·본문의 짧은 번호는 당시 기록입니다. [번호·해시 대응표](../../reports/2026-09-07-research-convergence.md)를 참조하세요.

Wikimedia OPEC·Petroleum·Shale_gas 일별 조회수 합계의 월평균을 YoY 로그 변화로 바꿔 WTI와 비교한다. 현재 실제 분석 완료는 **10만**이다. 앱이나 최신 WTI build를 실행하지 않는다.

저장소 루트, 기존 `research/.venv` 환경에서:

```bash
research/.venv/bin/python research/notebooks/ALT-20260907-40/hunt.py check
research/.venv/bin/python research/notebooks/ALT-20260907-40/hunt.py collect
research/.venv/bin/python research/notebooks/ALT-20260907-40/hunt.py analyze --raw research/gathering/raw/ALT-20260907-40/20260907T065722Z
```

새 수집은 새 UTC 폴더를 만들며 기존 원문을 덮어쓰지 않는다. `collect`가 출력한 경로를 `analyze --raw`에 넣는다. `analyze`는 입력 manifest/hash와 동결 계획을 확인한 뒤 같은 입력의 파생물을 재생성한다. 새 수집의 과거 조회수는 이전 빈티지와 같다고 보장하지 않는다. 이미 저장한 원본이 없는 팀원은 먼저 공식 API 재취득을 해야 하므로 **같은 빈티지의 팀 재현은 미검증**이다.

- [10 동결 계획](../../indexes/ALT-20260907-40/plan-v1.json), [결과와 한계](../../indexes/ALT-20260907-40/README.md)
- 위키 원문: `research/gathering/raw/ALT-20260907-40/20260907T065722Z/`
- 월별 파생물: `research/data/processed/ALT-20260907-40/20260907T065722Z/monthly.csv`
- 원문·대형 파생물은 gitignored; 재현 hash·작은 표·SVG만 indexes에 남긴다.

`check`의 값은 **SYNTHETIC TEST ONLY**다. 실제 연구 통계에는 포함되지 않는다. 검사 범위는 월평균 집계·비양수 가격 제외다. 별도 거래소 캘린더가 없으므로 Yahoo가 반환하지 않은 거래일의 누락 여부는 미검증이다.

Finance 검사는 운영 분석 코드를 import하지 않고 표준 라이브러리로 월별 표부터 주 검정 n/r를 재구성한다. [검토 영수증](../../indexes/ALT-20260907-40/20260907T065722Z/independent-finance-review.json). `collect`는 Yahoo 실패도 manifest에 기록한 뒤 실패 종료하며 다른 가격·합성값을 대신 쓰지 않는다.
