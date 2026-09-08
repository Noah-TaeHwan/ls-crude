# Joint hunt: 재현 가능한 주별 robustness

기존 ALT-20260907-01 실제 로컬 원본을 사용하는 **후속 탐색**이다. 기존 월별 결과를 대체하거나 새로운 후보로 세지 않는다. [실행 전 계획](plan.md), [실행 코드](run.py), [결과](../../indexes/joint-hunt-20260908/README.md).

저장소 루트의 기존 설치 환경에서:

```sh
research/.venv/bin/python research/notebooks/joint-hunt-20260908/run.py
```

명령은 manifest의 세 입력 SHA256과 schema/중복/날짜/비양수/질량대사/검정 분모대사를 검사한 후 실제 통계와 SVG를 새 timestamp 폴더에 남긴다. 이것이 runnable check이기도 하다. 네트워크·최신 가격·OOS는 읽지 않는다. 파일 없음/변조는 `BLOCKED` 및 exit 2이며 합성 데이터 대체는 없다. 기존 설치 pandas/numpy/matplotlib만 사용한다.

입력은 `research/gathering/raw/ALT-20260907-01/20260907T062017Z/`의 manifest/metadata/activity/wti이다. 원문·가격·개별 주 파생물은 gitignored, 공개 파일에는 경로/hash/집계통계만 남긴다. [기존 수집/권리 경계](../ALT-20260907-01/README.md), [USDA 공식 안내](https://www.ams.usda.gov/services/transportation-analysis/gtr-datasets). 동일 cache를 가진 사람의 재현만 가능하며 다른 환경의 재취득/동일빈티지는 미검증이다.

실제 실행 exit 0: `20260908T044354588864Z`. Python 3.13.15, pandas 3.0.5, numpy 2.5.2, matplotlib 3.11.1. 정확한 환경/hash와 14검정 결과는 영수증에 있다. source cell quality score는 해당 주 유효 곡물셀 수/4; 완전성 점수이며 사실 정확성 확률은 아니다.

독립 Finance 재계산: `python3 research/notebooks/joint-hunt-20260908/finance-audit.py`. 고정 실행 470주/14검정/2,566 pair 및 SHA를 stdlib로 검증하며 운영 모듈을 import하지 않는다. 실제 exit 0 확인.
