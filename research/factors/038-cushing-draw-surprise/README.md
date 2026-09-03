# 038 — Cushing Draw Surprise

**상태**: ⏸️ **HOLD — 실측 후 OOS 미통과**  
**원안 연결**: 새 아이디어 #6.  
**신호**: EIA Cushing 원유 재고의 주간 변화(52주 z-score의 음수; 재고 감소가 양수).  
**타깃**: EIA 주 종료 +5일 뒤, 다음 5거래일 `CL=F` 실현변동성.

## 실제 실행 결과 (2026-09-03)

| 구간 | r | n | 판정 |
| --- | ---: | ---: | --- |
| IS 2015–2023 | `-0.142` | 417 | 가설(큰 draw → 더 높은 변동성)과 반대 |
| OOS 2024–2026 | `-0.074` | 137 | 약하고 같은 반대 방향 |

따라서 **0.1% 재현 관계는 없다.** EIA 주간 재고는 시장이 이미 주시하는 공용 정보라서, “surprise”를 별도 컨센서스 빈티지 없이 단순 재고변화로 부르면 안 된다.

## 데이터·재현

- EIA `W_EPC0_SAX_YCUOK_MBBL`, 무료 공개 API
- 원본 응답·실행 결과: gitignored `research/gathering/raw/2026-09-03-eia-weekly-core-probe/`
- 코드: 같은 위치의 `eia_weekly_core_probe.py`

