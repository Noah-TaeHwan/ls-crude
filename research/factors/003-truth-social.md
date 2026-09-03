# 003 — Trump Temper & Oil Policy Index

**상태**: 📋 **HOLD** — 공개 게시물의 시간·텍스트는 측정 가능하지만, 첫 인샘플 규칙 탐색은 방향성·변동성 알파를 입증하지 못함.
**Oil Pizza 가중치**: `0.0`.

## 가설

트럼프의 강한 공개 발언 자체가 아니라, 다음 네 요소가 함께 높은 새 게시물이 이후 WTI 리스크와 관계가 있을 수 있다.

```text
Temper × Oil relevance × Policy actionability × Supply/Demand channel
```

| 요소 | 측정 질문 |
| --- | --- |
| Temper | 공격·위협 표현, 과도한 대문자·느낌표 등 언어 강도는 높은가? |
| Oil relevance | 원유·OPEC·정유·휘발유 등 직접적 원유 경로, 또는 구체 정책행동을 동반한 산유국 이슈인가? |
| Policy actionability | 제재·관세·SPR 방출·증산/감산·규제·공격처럼 실행 가능한 행위가 있는가? |
| Supply/Demand channel | 공급 제약(+), 공급 확대(-), 수요 훼손(-) 중 어느 채널이 문장에 명시되는가? |

`temper`만으로 유가 방향을 정하지 않는다. 강한 제재는 공급 제약일 수 있고, 강한 관세는 수요 훼손일 수 있다. 방향이 불명인 글은 점수에 넣지 않는다.

## 2026-09-03 규칙 기반 인샘플 탐색

사전 탐색용으로 Twitter·Truth Social의 공개 아카이브에서 2015-01-01~2023-12-31만 사용했다. 당일 가격 반응을 사용하지 않기 위해 게시일보다 **엄격히 뒤의 다음 거래일**부터 CL=F 결과를 계산했다.

| 그룹 | 이벤트 날짜 수 | 다음 1일 평균 | 다음 5일 평균 | 다음 5일 실현변동성 |
| --- | ---: | ---: | ---: | ---: |
| 전체 인샘플 거래일 | 2,252 | -0.101% | 0.159% | 6.002% |
| 엄격 규칙 이벤트 | 40 | 0.551% | 1.201% | 4.809% |
| high temper (2–3) | 24 | 0.622% | 0.622% | 5.003% |
| low temper (1) | 16 | 0.445% | 2.070% | 4.518% |

이 숫자는 **탐색 결과일 뿐 통과 기준이나 백테스트 성과가 아니다.** 특히 엄격 이벤트 40일 중 공급 확대·수요 훼손 채널은 2일뿐이고, 36개 Truth Social 게시물이 2022–2023에 집중됐다. high temper가 low temper보다 더 큰 5일 수익률·변동성을 보인다는 증거도 없다. 그러므로 현재 결과는 가중치·매매 규칙·ML/DL 학습에 쓰지 않는다.

## 데이터·시간 경계

- CNN Truth Social 아카이브에는 `created_at` UTC 시각이 있으나, 2022-04-01부터 시작한다.
- 공개 Twitter 아카이브는 2021-01까지의 텍스트·시각을 제공하지만, 원본 시간대·삭제·플랫폼 차이는 별도 검증이 필요하다.
- Twitter와 Truth Social은 게시량·재게시·문체가 다르므로 점수를 합산 표준화하지 않는다. 플랫폼 더미 또는 별도 표준화를 사전에 고정해야 한다.
- 게시 당일 일봉을 쓰지 않는다. 장기 분봉 WTI 자료가 없으므로 “즉시 시장 반응”은 이 탐색에서 주장하지 않는다.

## 다음에만 할 일

1. 유가 관련 게시물 300~500개를 블라인드 라벨링해 `temper`, `actionability`, `channel`의 기준을 고정한다.
2. 플랫폼별로 라벨 품질·시간대·재게시 처리를 확인한다.
3. 하나의 단순·정규화 모델만 인샘플에서 정하고 동결한다. 이 표본 크기에서는 LSTM·Transformer를 사용하지 않는다.
4. 2024년 이후는 동결 뒤 한 번만 OOS로 연다.

## UI

```text
😡 Trump Temper Index
Temper: RESEARCH ONLY
Oil-policy channel: LABEL REQUIRED
Oil Pizza: 0.0%
```

## 참고 출처

- [CNN Truth Social archive](https://ix.cnn.io/data/truth-social/truth_archive.json)
- [Complete Trump Tweets Archive](https://github.com/MarkHershey/CompleteTrumpTweetsArchive)
