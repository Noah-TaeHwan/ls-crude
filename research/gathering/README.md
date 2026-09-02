# 수집 (gathering)

조사물을 **한곳으로** 모읍니다. 파이썬 패키지(`src/`)나 대시보드(`app/`)와 섞지 않습니다.

## 왜 이 폴더인가

예전에는 메모·덤프·실험 카드 위치가 여러 곳에 흩어져 다음 에이전트가 어디다 쓸지 몰랐습니다. `data/`는 이미 파이프라인 시드와 팀원 랩이 있어서, 웹 조사 원문을 넣기엔 지저분해집니다.

그래서 수집만 따로 둡니다.

```text
raw/      받은 그대로 (깃에 안 올림)
notes/    한 장 정리 (마크다운)
sources/  출처 표 (라이선스·지연·look-ahead)
```

그다음 단계는 여기가 아닙니다.

- 후보 표 → [`../notebooks/pizza-hunt.md`](../notebooks/pizza-hunt.md)
- 실험 한 장 → [`../../docs/experiments/`](../../docs/experiments/README.md)
- 시계열 시드 → [`../data/pizza/`](../data/pizza/README.md)

규칙의 정본은 [`../INTAKE.md`](../INTAKE.md).

## 사람이 할 일

1. 파일을 받으면 `raw/`에 날짜 폴더로 둡니다.
2. `_TEMPLATE.md`를 복사해 `notes/`에 한 장을 씁니다.
3. 새 출처면 `sources/REGISTRY.md`에 한 줄.
4. 후보가 보이면 `pizza-hunt.md`에 한 줄. 없으면 표를 비웁니다.
5. 살아남으면 실험 `001-` 카드를 만듭니다.

## 하지 말 것

- 인베스팅닷컴 스크래핑
- 아웃샘플로 고르기
- 없는 샤프/MDD를 노트에 적기
- 팀원 랩 폴더를 여기로 옮기기
