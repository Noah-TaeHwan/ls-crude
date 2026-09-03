# 2026-09-03 — Behavioral Signals 30개 원안 병합 장부

| 칸 | 값 |
| --- | --- |
| 상태 | 1개 반증 완료 / 나머지는 보존 병합 |
| 작성 | Codex |
| 원문 | gitignored `gathering/raw/2026-09-03-behavioral-signals-30/` |

## 결론

원안의 예시 수익률(+2.0%~+2.6%)은 출처·표본·공개시점이 없는 서사이므로 실증으로 취급하지 않는다. 관찰자 로그, 매장 내부 운영, 개인 행동·사진, 직원 대화는 장기·재현·익명 공개 데이터가 아니며 수집하지 않는다.

## 046으로 병합·실제 시험

**Urban Mobility Tempo**: Bus Depot Windshield Wiper Replacement, Taxi Meter Idle Time, Bicycle Tire Pump Usage, Bus Fare Coin Jam, Train Platform Tile Wear.

검증 가능한 최소 공통분모는 시카고 CTA의 익명 일별 시스템 탑승량이었다. IS `r=-0.267`, OOS `r=+0.005`로 재현 실패해 046은 0.0 가중치다.

## 042 Asia Financial Hub Pulse의 도시 활동 보존 맥락

Park Bench Occupancy at Dawn, Public Library Return Cart Overflow, Tumbler Refill at Co-working Hubs, Oppo Phone Charging Cycle, Public Wi-Fi Login Surge, Academy Profit Surge, Gym Locker Rekeying, ATM Receipt Stack Height, Recycle Bin Overflow, Streetlight Bulb Burnout, Public Bench Graffiti Refresh.

이들은 공공·익명·장기 도시 집계가 있을 때만 042의 소비/활동 맥락으로 재개한다. 벤치·도서·카페·ATM·건물·개인을 감시하거나 이미지로 추론하지 않는다.

## 043 Overtime Latte / 소비·식음료 밈으로 보존

Street Vendor Thermos Refill, Market Scale Calibration, McDonald’s Combo Menu Sales, School Canteen Tray Return, Public Toilet Soap Refill, Street Food Skewer Pile, Street Dog Feeding Turnover, Public Fountain Coin Toss, Market Umbrella Sales, Cinema Popcorn Empty Rate, Laundry Folding Table Turnover, Laundry Line Fullness, Pet Food Bowl Refill.

이 그룹은 음식·생활·비공식 경제라는 서사는 있으나, 공개 매출·거래량·공개시점·장기 역사가 없다. 판매·소비 대신 검색 추세나 관세 무역을 넣어 가짜 시계열을 만들지 않는다.

## 명시적 분석 제외

Public Payphone Charging Cable Wear는 개인 기기 사용·시설 훼손을, Street Dog Feeding은 특정 동물·장소 행동을, 나머지 현장 관찰형은 개별 위치·직원·고객에 기대므로 거래 데이터로 쓰지 않는다.

## 체크

| 항목 | 값 |
| --- | --- |
| 가격 출처 | 제공 `CL=F` CSV |
| 무료 데이터 | Chicago Data Portal CTA daily boarding totals |
| 라이선스·범위 | 시카고시 공개 시스템 합계; 개인 식별·승하차 기록 미수집 |
| look-ahead | 운행일 종료 뒤, 다음 거래일부터 변동성 타깃 |
| IS / OOS | 2015–2023에서 사양 고정, 2024+ 한 번 실행 |
| 성과 숫자 | 046 실제 Pearson r만 기록. 원안의 예시 퍼센트는 미검증 |
