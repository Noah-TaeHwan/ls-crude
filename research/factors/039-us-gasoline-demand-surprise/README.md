# 039 — U.S. Gasoline Demand Surprise

**상태**: ❌ **SKIP — 실측상 관계 없음**  
**원안 연결**: 새 아이디어 #7.  
**신호**: EIA 주간 finished motor gasoline product supplied의 4주 평균 대비 52주 z-score.  
**타깃**: 공개 가정일 뒤 다음 5거래일 `CL=F` 실현변동성.

## 실제 실행 결과 (2026-09-03)

| 구간 | r | n | 판정 |
| --- | ---: | ---: | --- |
| IS 2015–2023 | `-0.005` | 415 | 사실상 0 |
| OOS 2024–2026 | `-0.009` | 137 | 사실상 0 |

**0.1%는 물론, 유의한 선형 관계도 찾지 못했다.** ‘수요 surprise’라는 이름은 시장 컨센서스가 아닌 자체 4주 평균을 쓴 제한적 프록시라는 점도 명시한다.

## 데이터·재현

- EIA `WGFUPUS2`, 무료 공개 API
- 원본·코드: gitignored `research/gathering/raw/2026-09-03-eia-weekly-core-probe/`

