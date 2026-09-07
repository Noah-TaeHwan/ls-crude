# COT WTI 순포지셔닝 탐색 실행기

> 2026-09-07 통합: 보관본 18–25를 39–46으로 이관했습니다. 이전 실행 영수증·그림·본문의 짧은 번호는 당시 기록입니다. [번호·해시 대응표](../../reports/2026-09-07-research-convergence.md)를 참조하세요.

CFTC Disaggregated 연별 zip의 상품코드 067651 주간 Managed Money 순포지션을 월별 마지막 화요일로 묶고 YoY 차분해 WTI와 비교한다. 현재 실제 분석 완료는 **09만**이다. 앱이나 최신 WTI build를 실행하지 않는다.

저장소 루트, 기존 `research/.venv` 환경에서:

```bash
research/.venv/bin/python research/notebooks/ALT-20260907-39/hunt.py check
research/.venv/bin/python research/notebooks/ALT-20260907-39/hunt.py collect
research/.venv/bin/python research/notebooks/ALT-20260907-39/hunt.py analyze --raw research/gathering/raw/ALT-20260907-39/20260907T065704Z
```

새 수집은 새 UTC 폴더를 만들며 기존 원문을 덮어쓰지 않는다. `collect`가 출력한 경로를 `analyze --raw`에 넣는다. `analyze`는 입력 manifest/hash와 동결 계획을 확인한 뒤 같은 입력의 파생물을 재생성한다. 새 수집의 과거 개정값은 이전 빈티지와 같다고 보장하지 않는다. 이미 저장한 원본이 없는 팀원은 먼저 공식 아카이브 재취득을 해야 하므로 **같은 빈티지의 팀 재현은 미검증**이다.

- [09 동결 계획](../../indexes/ALT-20260907-39/plan-v1.json), [결과와 한계](../../indexes/ALT-20260907-39/README.md)
- CFTC 원문: `research/gathering/raw/ALT-20260907-39/20260907T065704Z/`
- 월별 파생물: `research/data/processed/ALT-20260907-39/20260907T065704Z/monthly.csv`
- 원문·대형 파생물은 gitignored; 재현 hash·작은 표·SVG만 indexes에 남긴다.

`check`의 값은 **SYNTHETIC TEST ONLY**다. 실제 연구 통계에는 포함되지 않는다. 검사 범위는 월별 마지막 화요일 선택·비양수 가격 제외·2024+ 거부다. 별도 거래소 캘린더가 없으므로 Yahoo가 반환하지 않은 거래일의 누락 여부는 미검증이다.

Finance 검사는 운영 분석 코드를 import하지 않고 표준 라이브러리로 월별 표부터 주 검정 n/r를 재구성한다. [검토 영수증](../../indexes/ALT-20260907-39/20260907T065704Z/independent-finance-review.json). 수집은 무명 UA 403을 식별용 연구 UA로 재요청해 해결했고 방법은 manifest에 기록했다. 브라우저 사칭·프록시·미러를 쓰지 않는다. `collect`는 Yahoo 실패도 manifest에 기록한 뒤 실패 종료하며 다른 가격·합성값을 대신 쓰지 않는다.
