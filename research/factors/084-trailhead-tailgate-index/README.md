# 084 — Trailhead Tailgate Index (TTI)

**상태**: ❌ **REJECTED AS RBOB ALPHA**  
**가중치**: 0.0

> “When tailgates fill up, gasoline gets tighter.”

## 아이디어

미국의 드라이브형 국립공원 주차장·트레일헤드가 붐비면, 사람들이 실제로 차를 몰고 휴가를 가는 것이다. 이는 추상적인 소비심리 설문보다 훨씬 피자 인덱스답다.

예상 밖의 road-trip 방문 증가 → 휘발유 소비 압력 → RBOB gasoline 선물의 다음 달 수익률 또는 변동성

이것은 WTI 글로벌 공급 신호가 아니다. 물리적 전달경로가 가장 직접적인 RBOB (RB=F)만 타깃으로 한다. 공원 방문은 연료 구매량도 아니고, 혼잡한 주차장이 원유시장을 움직인다는 뜻도 아니다.

## 사전 고정한 공개 입력과 규칙

| 항목 | 사양 |
| --- | --- |
| 공개 입력 | National Park Service 월간 RecreationVisitors |
| 사전 고정 바스켓 | ACAD, ARCH, BRCA, CANY, CARE, DEVA, GLAC, GRCA, GRSM, JOTR, ROMO, YELL, YOSE, ZION |
| 신호 | 14개 공원이 모두 있는 월의 합계 방문자 YoY, 36개월 rolling z-score |
| 정보 가능일 | 관측월 말 + 15일 후 다음 미국 영업일 |
| 1차 타깃 | 그날부터 다음 21거래일 RBOB 수익률 |
| 2차 타깃 | 같은 창의 연율화 실현변동성 |
| IS/OOS | 정보 가능일 기준 IS: 2015–2023, OOS: 2024+ |

NPS는 월별 잠정 방문통계를 보통 다음 달 15일까지 제공한다고 설명한다. 이는 모델 입력의 실제 공개지연으로 사용한 보수적 규칙이다. 잠정값·공원별 계수 방식 변경·사후 개정은 남아 있는 위험이다.

## 한 번의 사전 고정 검정 — 2026-09-07

| 신호 ↔ 이후 RBOB | IS (n=108) | OOS (n=23) | 판정 |
| --- | ---: | ---: | --- |
| 다음 21거래일 수익률 Pearson r | -0.127 | +0.186 | 부호 반전 — 기각 |
| 다음 21거래일 RV Pearson r | -0.037 | -0.282 | OOS 23개월만의 탐색값 — 채택 금지 |

**결론**: road-trip 수요라는 이야기와 무료 공개 데이터의 적합성은 좋다. 그러나 이 사전 고정 바스켓에서는 RBOB 수익률 관계가 IS/OOS에서 재현되지 않았다. OOS RV의 -0.282는 표본이 작고 IS가 0 근처라서 변동성 규칙으로도 사용할 수 없다. 피자 인덱스 콘텐츠/대시보드 후보로는 남기되, 거래 팩터·가중치는 0.0이다.

## 재현

- 실행 스크립트·원시 NPS XML·Yahoo 가격·파생 panel·요약 JSON은 gitignored research/gathering/raw/2026-09-07-trailhead-tailgate/에 있다.
- 사후에 공원·창·타깃을 바꾸어 양의 결과를 찾지 않는다. 다른 바스켓 또는 연료 판매량을 시험하려면 새 팩터 번호와 별도 사전등록이 필요하다.

## 출처

- [NPS Visitor Use Statistics FAQ](https://home.nps.gov/subjects/socialscience/statistics-faq.htm)
- [NPS visitation statistics API](https://irmaservices.nps.gov/v3/rest/Stats/help)
- [NPS Visitor Use Statistics data package](https://catalog.data.gov/dataset/nps-visitor-use-statistics-data-package-2025)
- Yahoo Finance 연속선물 RB=F (재현용 가격 입력; 롤·수정 이력 한계)
