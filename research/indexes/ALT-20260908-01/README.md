# ALT-20260908-01 — execution receipt

## 실행 정의

이 후보에는 합성 인덱스가 없다. 세 외부 문맥 신호를 각각 실제 이용가능일 이후의 EIA 쿠싱 재고 미래 28일 창에 연결하는 재현 실행이다.

| 입력 | 고정 신호 | 원본 위치 |
| --- | --- | --- |
| 052W | `z_mean` | `gathering/raw/2026-09-07-wikipedia-factor-probe/052W_WTI_panel.csv` |
| 086 | `harvest_pace_surprise_pct_pt` | `gathering/raw/2026-09-07-harvest-combine/results/harvest_combine_ho_events.csv` |
| 090 | `total_ice_anomaly_0814` | `gathering/raw/2026-09-07-great-lakes-icebreaker/great_lakes_icebreaker_event_panel.csv` |
| 타깃 | EIA Cushing future 28-day inventory state | `gathering/raw/091-cushing-cfam/bg2023/eia_cushing_inventory_weekly.csv` |

- 코드: [`run_context_bridge.py`](../../notebooks/091-cushing-operations-nowcasting/run_context_bridge.py)
- 실행: `python notebooks/091-cushing-operations-nowcasting/run_context_bridge.py`
- 파생물: `data/processed/091-cushing-cfam/context_bridge_2015_2023/` (gitignored 재생성 경로)
- 결과 보고서: [2026-09-08-cushing-context-bridge-test.md](../../reports/2026-09-08-cushing-context-bridge-test.md)

## 시간 경계

분석은 2015-01-01~2023-12-31 신호 이용가능일로 동결했다. 각 EIA 타깃은 신호 날짜보다 엄격히 뒤의 주간 관측만 쓴다. 희소 신호는 28일 간격으로 선택한다. 2024+는 이미 다른 탐색에서 열람됐으므로 OOS 인증에 사용하지 않는다.

## 실행 결과와 판정

세 단변량 결과와 조합 교집합은 위 보고서의 표와 같다. 086과 090의 동시 관측이 0건이라 합성 점수·가중치·경보를 생성하지 않았으며, 후보 판정은 KILL이다.
