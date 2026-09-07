# 활동 proxy 월별 탐색 실행기

USDA Mississippi Locks 27 곡물량(`01`)과 TSA checkpoint(`03`)에 같은 사전 계획을 적용한다. 현재 실제 분석 완료는 **01만**이고 03 역사 페이지는 HTTP 403으로 차단됐다. 앱이나 최신 WTI build를 실행하지 않는다.

저장소 루트, 기존 `research/.venv` 환경에서:

```bash
research/.venv/bin/python research/notebooks/ALT-20260907-01/hunt.py check
research/.venv/bin/python research/notebooks/ALT-20260907-01/hunt.py collect --candidate 01
research/.venv/bin/python research/notebooks/ALT-20260907-01/hunt.py analyze --candidate 01 --raw research/gathering/raw/ALT-20260907-01/20260907T062017Z
python3 research/notebooks/ALT-20260907-01/finance-audit.py --raw research/gathering/raw/ALT-20260907-01/20260907T062017Z --output research/data/processed/ALT-20260907-01/20260907T062017Z/finance-audit
```

새 수집은 새 UTC 폴더를 만들며 기존 원문을 덮어쓰지 않는다. `collect`가 출력한 경로를 `analyze --raw`에 넣는다. `analyze`는 입력 manifest/hash와 동결 계획을 확인한 뒤 같은 입력의 파생물을 재생성한다. 새 수집의 과거 개정값은 이전 빈티지와 같다고 보장하지 않는다. 이미 저장한 원본이 없는 팀원은 먼저 공식 API 재취득을 해야 하므로 **같은 빈티지의 팀 재현은 미검증**이다.

TSA를 재시도할 때는 `collect --candidate 03`을 사용한다. 첫 실패 연도에서 중단하며 차단을 우회하지 않는다. TSA 분석기는 역사 5개 연도와 단일 날짜·인원 열이 확보돼야 동작한다. 이 경로는 실제 TSA 데이터로 분석·검증되지 않았다. 추가 헤더 위장·프록시·제3자 미러를 쓰지 않는다.

- [01 동결 계획](../../indexes/ALT-20260907-01/plan-v1.json), [결과와 한계](../../indexes/ALT-20260907-01/README.md)
- [03 동결 계획](../../indexes/ALT-20260907-03/plan-v1.json), [차단 영수증](../../indexes/ALT-20260907-03/README.md)
- USDA 원문: `research/gathering/raw/ALT-20260907-01/20260907T062017Z/`
- 월별 파생물: `research/data/processed/ALT-20260907-01/20260907T062017Z/monthly.csv`
- 원문·대형 파생물은 gitignored; 재현 hash/작은 표/SVG만 indexes에 남긴다.

`check`의 값은 **SYNTHETIC TEST ONLY**다. 실제 연구 통계에는 포함되지 않는다. 검사 범위는 미래 타깃 정렬·split purge·음수 중간 가격·placebo 경계·지연 신호 경계·2024+ 거부다. 별도 거래소 캘린더가 없으므로 Yahoo가 반환하지 않은 거래일의 누락 여부는 미검증이다.

Finance 검사는 운영 분석 코드를 import하지 않고 표준 라이브러리로 원자료부터 108개 월·18개 검정행을 재구성한다. [검토 영수증](../../indexes/ALT-20260907-01/20260907T062017Z/independent-finance-review.json). `collect`는 Yahoo 실패도 manifest에 기록한 뒤 실패 종료하며 다른 가격·합성값을 대신 쓰지 않는다.
