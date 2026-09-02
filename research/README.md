# research

두 층이다.

1. **부엌** — Yahoo `CL=F` + RSI + Investing.com 태그 + Oil Slice 초안
2. **피자 찾기** — 크립토의 뭐 × 뉴스의 무슨. 레시피는 아직 없음

조사물을 어디에 둘지는 [`INTAKE.md`](INTAKE.md)가 정본이다. 짧은 안내: [`docs/research-gathering.md`](../docs/research-gathering.md).

## 지도 (어디다 두나)

```text
INTAKE.md              수집 규칙 (덤프→노트→피자 표→실험 카드)
gathering/raw/         받은 그대로. 깃 안 올림
gathering/notes/       한 장 정리
gathering/sources/     출처 표
notebooks/pizza-hunt.md  피자 후보 표 (실후보 없으면 비움)
data/pizza/            사람이 고른 시계열 시드
data/                  파이프라인 시드 + 팀원 랩 드롭 (이사하지 않음)
src/ls_crude/          돌아가는 코드. 이 PR에서 건드리지 않음
tests/                 테스트. 그대로
```

`docs/experiments/`는 승격된 실험 카드다. 조사 원문을 그곳에 바로 쓰지 않는다.

이 모양이 나은 이유: `data/`는 이미 시드·빌드 산출·팀원 드롭이 섞일 수 있는 자리라, 웹 조사 덤프를 넣으면 다음 사람이 못 찾는다. 수집은 `gathering/` 한 갈때기로 모은다.

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
| 조사 규칙 | [`INTAKE.md`](INTAKE.md) |
| 덤프 / 노트 / 출처 | [`gathering/`](gathering/README.md) |
| 피자 후보 표 | [`notebooks/pizza-hunt.md`](notebooks/pizza-hunt.md) |
| 실험 한 장 | [`docs/experiments/`](../docs/experiments/README.md) |
| 후보 시드 | [`data/pizza/`](data/pizza/README.md) |
| 부엌 시드 뉴스 | [`data/event_calendar.csv`](data/event_calendar.csv) |
| `data/` 안에 뭐가 있나 | [`data/README.md`](data/README.md) |

인샘플 2015-01-01~2023-12-31, 아웃샘플 2024-01-01~. 설계 정본은 `docs/research-design.md`.
