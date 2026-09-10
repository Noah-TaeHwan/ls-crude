# 091-Z — Dated Cushing industry cues (2026-09-09)

**이벤트 목록 1건. 기사 수는 활동이 아니다. 바쁨 점수 없음.**

## 감사한 원천 (동결분만, 라이브 수집 없음)

- `research/indexes/091-cushing-operations-nowcasting/20260908T091ZNEWSZ/headline_audit.csv` — 79행, SHA-256 `2215c32ad8af1ca10b51d90772e43d7ef5ee3bbee8aa94e5d64b15d04c5620f6`.
- 판정 기준: `published_at`이 비어 있지 않고 `is_cushing_context=true`이며 `is_industry_cue=true`인 행만 동결.

## 감사 결과

| 구분 | 행 수 |
| --- | --- |
| 감사 전체 | 79 |
| `true`/`true` + 날짜 있음 (동결) | **1** |
| Cushing 지명 있으나 `is_industry_cue=false` (제외) | 19 |
| 둘 다 `false` (시장 맥락·기타, 제외) | 59 |

## 동결한 이벤트

| published_at | title | lanes |
| --- | --- | --- |
| 2026-09-07T15:59:45+00:00 | South Bow, Bridger to Develop New Oil Pipeline From Wyoming to Cushing, Oklahoma - EnergyNow | physical (pipeline) |

출처: Google News RSS. URL·원문 제목은 `events.json`·`events.csv`에 그대로 둔다.

## 동결하지 않은 것

- 날짜 없는 행의 날짜 메우기 금지. 날짜를 지어 내야 하면 이 게이트를 닫는다.
- 시장 맥락 전용 행(`lanes=market_context`)과 Cushing's Syndrome 의료 기사는 제외한다.
- `is_industry_cue=false` 행을 큐로 승격하지 않는다.
- 합성 0–100 점수, WTI 겹침, "N건 = 바쁨" 해석을 만들지 않았다.

## 다음 게이트

고정 감사 CSV가 새로 동결되고 같은 기준으로 날짜 있는 `true`/`true` 행이 생기면
이 폴더가 아니라 새 `BOARDZ` 런으로 다시 동결한다. 이 폴더의 1건은 다시 세어도 1건이다.
