# 001 — Pentagon Uber Eats Index

**상태**: ❌ **SKIP** (데이터 접근 불가)  
**평가**: 창의성 9/10 | 구현 가능성 1/10

## 가설

군사 기지의 UberEats 주문량 ↑ → 군 활동 ↑ → 연료 소비 ↑ → 유가 ↑

## 데이터 전략

| 단계 | 데이터 | 상태 |
|------|--------|------|
| 1 | Pentagon 기지 목록 (위도/경도) | ✅ 공개 (ICBM 위치, 모합 기지 등) |
| 2 | UberEats 주문 데이터 | ❌ **접근 불가** |
| 3 | 대체 API (DoorDash, Grubhub) | ❌ **접근 불가** |
| 4 | 대체 신호 (GPS 활동 데이터) | ❌ **개인정보 침해** |

## 결론

- UberEats/DoorDash: API 없음, 기업 기밀
- 공개 데이터로는 복구 불가능
- **대안**: US military expenditure 시계열 (FRED) 사용

## 추천

**이 팩터는 SKIP**.  
대신 `financial_demand_ml`에서 방위산업 ETF (XAR, ITA) 신호 포함 검토.
