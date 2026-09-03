# 015 — Luxury ICE Road Appetite Index

**상태**: 💡 **IDEA / SKIP as alpha** — 원안은 보존한다. 측정 가능한 프록시도 고유 거래 알파로는 채택하지 않는다.
**변동성 기준 (2026-09-03)**: 미래 5거래일 WTI 실현변동성. 차종·연식·화물별 공개 장기 활동 시계열이 없어 미검증.

## 원안: 밈이지만 남길 가치가 있는 질문

“슈퍼카, 1990년대식 대배기량 차, 큰 픽업트럭, 유조차가 도로에 많이 보이면 사람들이 기름을 더 태우고 있는 것 아닐까?”

이 아이디어의 매력은 석유 수요를 설문·거시 발표가 아니라 **도로 위의 과시적·물리적 연료소비**에서 먼저 보려는 데 있다. 원안은 철회하지 않으며, 데이터가 생길 때까지 창의적 관측 목록으로 남긴다.

## 원안과 측정 가능 후보를 분리

| 하위 후보 | 원래 질문 | 현재 데이터 판정 | 상태 |
| --- | --- | --- | --- |
| 015A Supercar Road Sightings | 슈퍼카가 실제로 얼마나 도로를 달리는가 | 무료·전국·재현 가능한 모델별 교통량 API 미확인 | 💡 IDEA / UNMEASURABLE |
| 015B Gas-Guzzler Road Sightings | 오래된 대배기량 SUV·픽업이 얼마나 달리는가 | 차종 검지기는 가능해도 연식·연비·모델은 식별 불가 | 💡 IDEA / UNMEASURABLE |
| 015C Fuel-Tanker Traffic | 유조차가 얼마나 도로를 달리는가 | 일반 대형 트럭과 구분되는 무료 공개 교통량 데이터 미확인 | 💡 IDEA / UNMEASURABLE |
| 015D Luxury ICE Registration & Consumption | 고가·고배기량 내연기관을 사람들이 얼마나 사는가 | 국가별 월간 등록·판매 집계 가능성을 조사할 가치 있음 | ⏸️ HOLD |
| 015E Heavy Road Activity | 대형 상용차 흐름이 비정상적으로 늘었는가 | 한국 AVC와 미국 차종 분류 자료로 연구 가능 | ⏸️ HOLD |
| 015F Elite Visibility Suppression | 고유가·생활비 압박 때 부자들이 과시적 연료소비를 덜 드러내는가 | 직접·재현 가능한 공개 관측값 미확인 | 💡 IDEA / UNMEASURABLE |

`UNMEASURABLE`은 아이디어가 나쁘다는 뜻이 아니다. 현 시점에 공개·합법·재현 가능한 관측값이 없다는 뜻이다.

## 015D — Luxury ICE Registration & Consumption

### 가설

고가·고배기량 **내연기관** 신규등록 또는 판매의 변화는 상위 소비자의 소비 자신감·리스크 선호·과시적 연료소비 레짐을 보여 주는 매우 약한 보조 신호일 수 있다.

이는 실제 주행거리나 연료소비량이 아니다. EV 럭셔리 소비와 분리하고, 자동차 판매가 WTI를 선행한다고 가정하지 않는다.

```text
Luxury ICE registration / sales surprise
  → high-end discretionary-consumption regime candidate
  → WTI demand regime: exploratory, not presumed directional alpha
```

### 최소 측정 규칙

- 한국: 공개·재사용 가능한 월간 브랜드/모델별 **신규등록** 자료가 있을 때만 사용한다. 현재 장기 역사·라이선스·발표일은 `모름`이다.
- 미국: 무료 전국 모델별 등록 시계열은 확인 전이다. NHTSA API는 차량 메타데이터 용도이며 등록·교통량 자료로 간주하지 않는다.
- 브랜드 총판매만 있을 때는 ICE/EV·지역·법인차 비중을 분리하지 못하므로 보조 맥락으로만 둔다.
- 슈퍼카·대배기량의 절대 대수는 작아서 계절성·한두 건의 법인 구매·모델 출시 효과에 매우 취약하다.

### UI 표기

```text
Luxury ICE Appetite
상태: 데이터 탐색 중
최근값: —
해석: 소비 레짐 후보 · 유가 예측 신호 아님
```

UI에서 `1.0%`는 **가설 예산 표시**로만 허용한다. 실거래 또는 백테스트 가중치는 데이터 적격성·인샘플 검증 전까지 `0.0`이다.

## 015F — Elite Visibility Suppression

### 심리 가설

고유가·생활비 압박·정치적 긴장 국면에는 부유층이 비용 부담 때문이 아니라 대중의 반감, 언론 노출, 사회적 분위기를 의식해 슈퍼카·대배기량 내연기관의 **보이는 소비**를 자제할 수 있다.

이것은 “부자들이 기름값을 감당하지 못한다”는 가설이 아니다. 고유가가 사회적으로 얼마나 민감한 문제가 되었는지 보여 주는 **가시성·옵틱스 레짐** 가설이다.

```text
high fuel-price salience / cost-of-living pressure
  → elite conspicuous ICE visibility suppression
  → social-pressure regime tag
```

### 왜 알파로 바로 쓰지 않는가

가장 자연스러운 인과는 유가와 생활비 압박이 먼저 오고, 과시적 소비 억제가 나중에 오는 것이다. 따라서 이 관측값은 WTI를 예측하는 선행 신호라기보다 이미 진행 중인 고유가·사회 압력 레짐의 동행 또는 후행 확인일 가능성이 크다.

또한 슈퍼카 목격 감소는 날씨, 계절, 행사 일정, 지역별 표본, 카메라 노출 변화, 차량 보관·이동 같은 수많은 교란을 받는다. 단순 목격 수나 소셜미디어 게시물 수만으로 점수를 만들지 않는다.

### 허용되는 미래 측정 경로

- 공개·허가된 월간 럭셔리 ICE 등록·판매 집계
- 공식 공개 자료 또는 사용자가 제공한 뉴스 CSV에서의 고유가·생활비·과시소비 관련 담화
- 공개된 브랜드 행사·마케팅 변경의 사후 정책·커뮤니케이션 맥락

위 항목은 모두 가설을 직접 측정하는 값이 아니며, 개인·차량·위치 추적이나 무허가 영상·소셜미디어 스크래핑으로 보완하지 않는다.

### UI 표기와 가중치

```text
Elite Visibility Suppression
상태: IDEA / 측정 불가
해석: 고유가 사회 압력의 확인 태그
가설 예산: 최대 0.1%
실제 백테스트·거래 가중치: 0.0%
```

`0.1%`는 창의적 가설을 UI에서 보존하는 예산일 뿐, 가격 방향 알파 또는 포트폴리오 비중이 아니다. 사전 지정한 시계열과 공개 가능 시점이 확보되기 전에는 수치화하지 않는다.

## 015E — Heavy Road Activity

한국도로공사 AVC는 고속도로 검지기 기준의 시간·차로·차종별 교통량을 제공한다. 미국에서는 FHWA 체계가 차종 분류 교통량을 다루며, 연방 표준 분류는 차체·축수·길이 기준이다. 둘 다 유조차, 슈퍼카, 연식 또는 브랜드를 직접 구분하지 않는다.

```text
Heavy Road Activity = classed heavy-vehicle volume
                      / same-location, same-calendar baseline
```

이 지표는 물류·디젤 수요의 **보조 관측** 후보이며, 한국 고속도로의 변화가 세계 WTI 수요를 대표한다는 주장은 하지 않는다.

## 데이터 윤리·금지선

- 번호판, 개별 차량의 위치, 운전자 또는 고객 식별 자료를 수집하지 않는다.
- 유조차의 실시간 위치·운송물·경로를 추적하거나 표시하지 않는다.
- 공개 카메라 영상에서 브랜드·개인 차량을 검출하는 무허가 스크래핑을 하지 않는다.
- 국가별 집계와 실시간 도로 관측은 별도의 허가·라이선스·보존 규칙을 따른다.

## 검증 설계

1. 각 하위 후보를 별도 시계열로 만들고 공개일을 기록한다.
2. `CL=F`의 미래 수익률과 미래 실현변동성을 혼합하지 않고 사전 지정한다.
3. 2015-01-01~2023-12-31 인샘플에서만 후보 선택·변환·임계값을 정한다.
4. 높은 노이즈와 낮은 표본 문제를 먼저 보고한다. 성과 수치를 지어 내지 않는다.
5. 하나라도 통과하더라도 015A~C·015F의 창의적 원안과 015D~E의 측정 가능한 프록시를 같은 팩터로 중복 계산하지 않는다.

## 현재 결론

015는 **기록할 가치가 있는 밈 팩터**다. 다만 현재 검증 결론은 명확하다: 슈퍼카·대배기량차·유조차 목격량은 공개·재현 가능한 시계열이 없고, 럭셔리 ICE 등록은 느린 소비 프록시이며, 대형차 교통량은 006과 같은 느린 물류·연료수요 프록시다. 따라서 **0.1% 이상의 독립적·재현 가능한 WTI 알파는 없으며**, UI·창의적 관측 원안으로만 보존한다.

## 참고 출처

- [한국도로공사 AVC 원시자료](https://www.data.go.kr/data/15066742/openapi.do?recommendDataYn=Y)
- [FHWA Traffic Monitoring Guide — vehicle classification](https://www.fhwa.dot.gov/policyinformation/tmguide/tmg_2022/traffic-monitoring-program.cfm)
- [FHWA Traffic Monitoring Guide — classification formats](https://www.fhwa.dot.gov/policyinformation/tmguide/tmg_2022/traffic-data-formats.cfm)
- [NHTSA datasets and APIs](https://www.nhtsa.gov/nhtsa-datasets-and-apis)
- [BTS Freight Analysis Framework](https://www.bts.gov/faf/faf5)
