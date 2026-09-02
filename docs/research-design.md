# 연구 설계

에이전트와 사람이 같은 규칙을 쓰도록, 데이터 출처와 샘플 분할을 여기에 고정한다.

## 한 줄

원유 기본(야후 가격 + RSI) + 뉴스 서사(인베스팅닷컴) + **오일 슬라이스 한 스푼**.

오일 슬라이스는 펜타곤 피자 지수와 같은 역할의 **부엌 초안**이다. 호가가 아니라, 호르무즈·미국 인플레/정책 뉴스가 갑자기 붐비는지(부엌이 바빠졌는지)를 본다. 찾을 피자(크립토의 뭐 × 뉴스의 무슨)는 [`notebooks/pizza-hunt.md`](../research/notebooks/pizza-hunt.md)와 [`docs/experiments/`](experiments/README.md)에 적는다. 조사 덤프·노트·출처 표는 [`research/INTAKE.md`](../research/INTAKE.md), 짧은 안내 [`research-gathering.md`](research-gathering.md).

## 역할

| 레이어 | 담당 | 도구 |
| --- | --- | --- |
| AI 스킬 | 둘 다, 에이전트 작업의 기본 입구 | `.cursor/skills/` |
| 가격·인/아웃샘플 | 오태환 파이프라인 → 손성찬 모델 | Yahoo Finance `CL=F` |
| RSI | 기본 오버레이 | Wilder 14 |
| 뉴스 서사 | 오태환 수집·태그 | Investing.com CSV가 정본, Yahoo news는 보조 |
| 미국 인플레·정책 방향 | 숫자=FRED/야후 매크로, 서사=인베스팅 뉴스 | CPI, Fed funds, 5y BEI, DXY |
| 호르무즈 | 뉴스 태그 + Slice 가중 | 해협·유조선·이란·홍해 |
| ML·백테스트 | 손성찬 | 인샘플에서만 적합, 아웃샘플은 한 번 |

## 가격 (Yahoo Finance API)

- 티커: `CL=F` (WTI 연속 선물)
- 라이브러리: `yfinance.download(..., interval="1d", auto_adjust=True)`
- 인샘플: 2015-01-01 ~ 2023-12-31
- 아웃샘플: 2024-01-01 ~ 데이터 마지막 날
- 모델 선택·피처 선택·Walk-forward 튜닝은 **인샘플만**
- 아웃샘플은 후보를 고른 뒤 **한 번만** 연다

야후가 무료라서 기본 시세를 여기서 가져온다. 인베스팅닷컴 시세는 사람이 대조할 때만 쓴다.

## 뉴스 (Investing.com이 정본)

역사적으로도 뉴스 위주다. 프로그램이 인베스팅닷컴을 긁지 않는다. CSV로 넣는다.

```text
published_at,title,url,source
2024-04-13,Strait of Hormuz tanker traffic in focus,...,https://www.investing.com/...,investing.com
```

태그:

- `hormuz` — 호르무즈, 유조선, 홍해, 이란 리스크
- `inflation_policy` — CPI, 연준, 금리, 달러, 물가
- `other`

야후 `Search(query).news`는 최근 헤드라인 보조다. 역사 서사는 인베스팅 CSV와 `research/data/event_calendar.csv` 시드.

## 오일 슬라이스 (피자 한 스푼)

```text
slice_score = 2 * hormuz_count + 1 * inflation_count
slice_z     = 20일 롤링 z-score
```

호르무즈에 가중치를 더 주는 이유: 원유 체급에서 해협 리스크가 피자 오븐에 가깝다. 인플레/연준은 수요·달러 방향이다.

기준모형은 RSI + 정통 가격만. 확장모형은 여기에 Slice를 얹는다. Slice가 Sharpe/MDD/적중률을 실제로 개선하는지 보는 것이 이 한 스푼의 실험이다.

## RSI 기본 오버레이

손성찬 모델이 들어오기 전 대시보드용 라벨:

- RSI ≤ 30 → long
- RSI ≥ 70 → short
- 그 외 → flat

이 오버레이를 ML 결과라고 쓰지 않는다.

## 실행

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
pytest
python -m ls_crude.build
```

`python -m ls_crude.build`가 `research/data/processed/`와 `app/public/baseline-snapshot.json`을 갱신한다. 원천 parquet는 Git에 올리지 않는다.
