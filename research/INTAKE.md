# 연구 수집 규칙

이 파일이 **정본**입니다. AI와 사람이 같은 칸에 넣습니다. 짧은 안내만 필요하면 [`docs/research-gathering.md`](../docs/research-gathering.md)를 봅니다.

타겟은 Yahoo `CL=F` (WTI **선물**, 현물 아님). Oil Slice는 공개 신호 초안일 뿐, 최종 대안 데이터 후보가 아닙니다.

## 한 줄

**덤프 → 노트 → (선택) 후보 표 → 실험 한 장.**

섞지 않습니다. 덤프를 실험 카드에 바로 올리지 않습니다.

## 어디에 넣나

| 이것 | 여기 | 깃에 |
| --- | --- | --- |
| PDF·CSV·zip·스크래핑하면 안 되는 메모·검색 결과 원문 | [`gathering/raw/`](gathering/raw/README.md) | 올리지 않음 |
| 한 장으로 정리한 조사 노트 | [`gathering/notes/`](gathering/notes/README.md) | 마크다운만 |
| 출처 한 줄 (URL, 라이선스, 지연, look-ahead) | [`gathering/sources/REGISTRY.md`](gathering/sources/REGISTRY.md) | 표만 |
| 대안 데이터 후보 한 줄 | [`notebooks/pizza-hunt.md`](notebooks/pizza-hunt.md) | 표만. 실후보 없으면 비움 |
| 살아남은 실험 카드 | [`docs/experiments/NNN-….md`](../docs/experiments/README.md) | `001-`부터 |
| 후보 시계열 시드 (사람이 고른 CSV) | [`data/pizza/`](data/pizza/README.md) | 시드만. 덤프는 안 됨 |
| 팀원이 통째로 넣은 랩(코드·노트북) | [`data/`](data/README.md) 아래 원래 폴더 | 옮기지 않음 |
| Yahoo 빌드 산출 | `data/processed/` | 올리지 않음 |

## 넣지 않는 것

- 인베스팅닷컴 **스크래핑**. 뉴스는 사람이 받은 CSV만.
- 아웃샘플(`2024-01-01` 이후)로 후보를 고르거나 가중치를 만지는 일.
- 없는 성과 숫자(샤프, MDD, 적중률)를 지어 내기.
- 비밀키, `.env`, 대용량 parquet/zip/원본 CSV를 깃에 올리기.
- `research/src/`, `app/`, `research/tests/` 안의 돌아가는 코드를 이 수집 작업으로 지우기.
- 팀원 드롭(`TTS scrapper`, `iran whale tracker` 같은)을 `gathering/`으로 이사하기.

## 단계

### 1. 덤프 (`gathering/raw/`)

받은 파일·복사한 원문을 날짜 폴더에 둡니다. 예: `gathering/raw/2026-09-02-hormuz-csv/`.

여기에 적습니다(README 한 줄이면 됨):

- 어디서 왔는지
- 받은 날짜
- 인베스팅을 긁지 않았다는 확인

큰 파일은 깃에 올리지 않습니다. `.gitignore`가 `gathering/raw/` 안 덤프를 막습니다.

### 2. 노트 (`gathering/notes/`)

[`notes/_TEMPLATE.md`](gathering/notes/_TEMPLATE.md)를 복사합니다. 파일 이름: `YYYY-MM-DD-짧은-슬러그.md`.

노트는 **사람이 읽을 한 장**입니다. 원문 붙여넣기가 아닙니다. 링크만 남기고, 가설·리스크·다음에 할 일을 적습니다.

### 3. 출처 표 (`gathering/sources/REGISTRY.md`)

새 데이터 출처면 표에 한 줄 추가합니다. 칸이 길면 [`sources/_TEMPLATE.md`](gathering/sources/_TEMPLATE.md)로 상세 장을 만들고, 표의 «상세» 칸에 링크합니다.

이미 있는 출처(Yahoo `CL=F`, Investing.com CSV, FRED)를 중복으로 넣지 않습니다.

### 4. (선택) 후보 표

크립토의 **뭐** × 뉴스의 **무슨**이 한 줄로 말해질 때만 [`notebooks/pizza-hunt.md`](notebooks/pizza-hunt.md)에 행을 넣습니다.

둘 중 하나라도 없으면 행을 만들지 않습니다. Oil Slice는 이미 실험 `000`에 있으므로 후보 표에 다시 넣지 않습니다.

실후보가 없으면 표를 **비워 둡니다**.

### 5. 승격 — 실험 한 장

노트와 후보 행이 아래 체크를 통과하면 `docs/experiments/001-짧은-슬러그.md`를 만듭니다. 번호는 폴더 README가 정한 다음 번호입니다.

이 단계 전에는 `docs/experiments/`에 쓰지 않습니다. `000`은 공개 신호 초안(비교군)입니다.

### 6. (선택) 시계열 시드

사람이 고른 작은 CSV만 `data/pizza/`에 둡니다. 원본 덤프는 계속 `gathering/raw/`에 둡니다.

## 매번 체크 (노트·실험 카드 공통)

답을 모르면 «모름»이라고 씁니다. 추측으로 채우지 않습니다.

| 체크 | 통과 기준 |
| --- | --- |
| 타겟 | WTI 선물 `CL=F`. 현물·`BZ=F`를 몰래 바꾸지 않음 |
| 가격 | Yahoo Finance만 프로그램으로 받음 |
| 뉴스 | Investing.com은 CSV. 사이트 스크래핑 없음 |
| 라이선스 | 재배포·저장 가능 여부를 출처 표에 적음 |
| look-ahead | 발표 지연·주말·타임존을 적음. 같은 봉으로 몰래 쓰지 않음 |
| 인샘플 | 고르기·튜닝은 `2015-01-01`~`2023-12-31`만 |
| 아웃샘플 | `2024-01-01`~ 은 후보를 **언 뒤** 한 번만 |
| 숫자 | 백테스트 숫자를 지어 내지 않음 |
| 메커니즘 | «유가 공개 신호와 왜 붙는지»가 없으면 폐기 |

## 승격 / 보류 / 폐기

- **승격**: 체크 통과 + 후보 한 줄이 있음 + 실험 `NNN` 작성.
- **보류**: 출처·지연이 덜 밝혀짐. 노트만 남기고 실험 카드는 안 만듦.
- **폐기**: 메커니즘 없음, 맵/히트맵이 메인 신호, 인베스팅 스크래핑이 필요, 아웃샘플을 봐야만 살아 보임.

폐기도 노트에 한 줄로 남깁니다. 조용히 지우지 않습니다.

## 에이전트에게

코드를 건드리기 전에 이 파일과 해당 스킬을 읽습니다. 조사 결과는 `gathering/notes/`에 씁니다. `docs/experiments/`는 승격만. 성과 숫자를 만들지 말고, 인베스팅닷컴을 긁지 말고, 아웃샘플로 고르지 않습니다.
