# 20260909T091BOARDZ — 쿠싱 보드에 붙인 날짜 있는 문맥

바쁨 점수가 아니다. 091 프로그램의 합성 관문은 그대로다.

| 파일 | 관측 | 범위 |
| --- | --- | --- |
| [기존 EIA CSV](../20260909T091EIAZ/cushing_stocks_weekly.csv) | 주간 Cushing 상업원유 재고 kbbl | 2004-04-09~2026-08-28, 1,169주 |
| `aadt-east-main.json` | ODOT East Main `600645` 연간 AADT | 2015–2025. 상시관측 아님. 2025에야 트럭 분리 |
| `bps-cushing-monthly.csv` | Census BPS Cushing place 주거 허가 호수 | 2024-01~2026-07 31개월. 산업 공사 아님 |
| `deq-events.json` | DEQ 공개 검토 상태 | 확인한 3건. 접수일이 있는 행만 날짜 |

KCUH METAR는 고정 파일이 아니라 AWC JSON을 화면 로더가 읽는다.
