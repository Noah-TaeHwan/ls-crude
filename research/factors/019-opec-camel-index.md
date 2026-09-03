# 019 — OPEC Camel Index / Desert Operational Stress

**상태**: 🐫 **MEME + HOLD** — Camel Index는 서사·UI 레이어, 실제 연구 후보는 Desert Heat & Operational Stress.
**Oil Pizza 가중치**: `0.0`.

## 밈 원안

> “When the camels are calm, watch out — the oil’s about to move.”

낙타가 조용하면 사막의 질서가 안정된 것이고, 낙타가 불안하면 더 큰 혼란이 시작된다는 발상은 시장이 보이지 않는 지정학 위험을 이야기로 이해하는 방식을 잘 보여 준다.

> “When the camels panic, you should too.”

이 문구와 OPEC Camel Index라는 이름은 UI의 개성과 연구 아이디어의 출발점으로 보존한다.

## 사실과 서사를 분리

Rystad Energy가 2023년에 Camel Index를 만들었다는 주장, 도하 냉각조끼 사진이 OPEC+ 감산 지연으로 이어졌다는 주장, 2024년 카타르 에너지 정상회의의 낙타 사건이 유가를 3% 떨어뜨렸다는 주장은 신뢰할 만한 출처로 확인하지 못했다. 이들은 **사실·백테스트 근거·인과 사례로 사용하지 않는다.**

낙타의 움직임·사진·소셜미디어는 실제 시장 신호가 아니다. 동물 복지·안전·개별 위치와 관련된 데이터를 수집하거나 추적하지 않는다.

## 실제 연구 후보: Desert Heat & Operational Stress

측정 가능한 질문은 다음이다.

```text
사막 수도권과 에너지 인프라 권역의 극한 열·열스트레스·바람 변화
  → 냉방 전력수요, 노동·물류·야외 운영의 부담
  → 산유국 운영·공급 리스크 또는 원유 변동성 레짐과 관계가 있는가?
```

기상 스트레스가 OPEC 정책을 예측하거나 유가를 올린다는 뜻은 아니다. 실제 공급·정책·수요 충격과 함께 나타나는 물리적 운영 부담을 탐색하는 **변동성 레짐 후보**다.

## 공개 입력과 역할

| 입력 | 역할 | 한계 |
| --- | --- | --- |
| NASA POWER 일별 기상 | 사막 수도권·인프라 권역의 기온·습도·풍속·복사열 배경 | 격자형 기상 자료이며 현장 운영 상태가 아님 |
| 공식 OPEC 발표 | 생산·회의·정책 이벤트의 시점 기록 | 발표는 예측 신호가 아니라 사건/통제 더미 |
| 사용자 제공 뉴스 CSV | 공개 발표 이후의 운영 차질 맥락 | Investing.com 사이트를 직접 스크래핑하지 않음 |
| 공개 전력·항만·항공 운영 통계 | 운영 부담의 보조 검증 | 국가별 범위·라이선스·지연이 불균일 |

## 최소 신호 정의

```text
Desert Operational Stress(t) =
    extreme_heat_anomaly(t)
  + heat-humidity / wind stress anomaly(t)
  + confirmed public operational-disruption context(t)
```

운영 차질 맥락이 없는 기상 이상은 기상 변수일 뿐이다. 도시·국가·인프라 권역을 무분별하게 합산하지 않고, 열·전력·물류·생산의 메커니즘을 하나씩 검증한다.

## UI 표기

```text
🐫 OPEC Camel Index
Camel sentiment: narrative only
Desert operational stress: DATA EXPLORATION
Oil Pizza: 0.0%
```

낙타 아이콘과 카피는 사용하되, 실제 점수는 “camel sentiment”가 아니라 출처와 공개시점이 기록된 기상·운영 변수만 표시한다.

## 검증·금지선

1. NASA POWER의 일별 자료는 UTC/LST 기준과 이후의 품질 대체·개정 가능성을 기록한다.
2. 인샘플 `2015-01-01`~`2023-12-31`에서만 권역·변환·임계값을 고정한다.
3. 타깃은 Yahoo `CL=F`의 미래 실현변동성을 우선으로 하고, 방향성 수익률은 별도 가설로 둔다.
4. 공식 OPEC 발표와 실제 기상 스트레스를 같은 원인으로 취급하지 않는다.
5. 낙타·동물·개인·실시간 보안 민감 인프라의 추적을 하지 않는다.

## 결론

019는 유머와 기억성을 가진 훌륭한 **스토리 팩터**다. 실증 후보는 낙타가 아니라 Desert Operational Stress이며, 데이터 적격성·발표시점·인샘플 검증 전까지 `HOLD`와 `0.0` 가중치다.

## 참고 출처

- [NASA POWER Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)
- [NASA POWER data FAQ](https://power.larc.nasa.gov/docs/faqs/data/)
- [OPEC official press releases](https://www.opec.org/pr-detail/604-16-june-2026.html)
