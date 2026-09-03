# 041 — U.S. Refinery Utilization Proxy

**상태**: ⏸️ **HOLD — coker 원안의 공개 프록시, OOS 미통과**  
**원안 연결**: 새 아이디어 #3. 특정 Gulf Coast coker run rate의 무료 장기 시계열은 확인하지 못해, EIA 전국 정유 설비 가동률로 한정했다.  
**타깃**: 공개 가정일 뒤 다음 5거래일 `CL=F` 실현변동성.

## 실제 실행 결과 (2026-09-03)

| 구간 | r | n | 판정 |
| --- | ---: | ---: | --- |
| IS 2015–2023 | `-0.206` | 418 | 단순 높은 가동률 → 낮은 변동성 관계 |
| OOS 2024–2026 | `-0.011` | 137 | 관계 소멸 |

특정 coker의 독립 알파를 증명한 결과가 아니다. 공개 프록시는 IS에서만 음수였고 OOS에서 사라졌다. **0.1% 재현 관계 없음.**

## 데이터·재현

- EIA `WPULEUS3`, 무료 공개 API
- 원본·코드: gitignored `research/gathering/raw/2026-09-03-eia-weekly-core-probe/`

