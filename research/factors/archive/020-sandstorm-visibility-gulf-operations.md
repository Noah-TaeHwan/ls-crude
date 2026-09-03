# Archive — 이전 020: Sandstorm Visibility & Gulf Operations Index (SSI)

> **정리 후 위치**: 현재 [016 Desert Operational Stress](../016-desert-operational-stress.md)의 모래폭풍·시정 하위 사례다. 이 문서는 이전 번호의 원안을 보존한다.

**상태**: 🌪️ **MEME + HOLD** — 모래폭풍 그 자체가 아니라, 공개적으로 확인된 가시성·운영 차질의 변동성 레짐 가설.
**Oil Pizza 가중치**: `0.0`.

## 밈 원안

> “When the dust flies, the oil trades.”

Sandstorm Sentiment Index라는 이름과 이 카피는 UI·커뮤니케이션의 출발점으로 보존한다. 그러나 “사막이 숨기고 있으니 유가가 오른다”는 식의 서사는 실증 결론이 아니다.

## 사실과 서사를 분리

2025년 4월 14일 쿠웨이트 기상당국은 모래폭풍, 시속 최대 70km의 북풍, 일부 지역의 500m 미만 수평 시야를 공지했다. 이는 **실제 가시성·운송 위험 사건의 예시**일 뿐이다.

다음 주장은 신뢰 가능한 출처로 확인하지 못했으므로 사용하지 않는다.

- 2025년 쿠웨이트에서 36시간 위성 관측이 끊겼다는 주장
- Mina Al-Ahmadi의 미확인 정유시설 셧다운과 그 인과관계
- 해당 사건으로 유가가 배럴당 $7 올랐다는 주장
- 당시 SSI가 88로 이를 선행 포착했을 것이라는 주장

광학 위성 영상은 먼지로 판독이 어려워질 수 있지만, AIS 송신 누락은 기상만으로 설명할 수 없다. 수신망·위성 커버리지·장비·의도적 비송신 등의 가능성과 분리되지 않은 AIS blackout은 신호로 사용하지 않는다.

## 실제 연구 질문

```text
걸프 산유·물류 권역의 공개 확인 모래폭풍과 가시성 저하
  + 공개 확인된 공항·항만·정유/물류 운영 차질
  → 이후 WTI 선물의 실현변동성 레짐에 추가 설명력이 있는가?
```

이는 공급 차질이나 유가 상승을 자동으로 뜻하지 않는다. 기상 사건과 운영 차질이 동반될 때의 **리스크·변동성 후보**이며, 방향성 매수 신호가 아니다.

## 최소 측정 설계

| 층 | 최초 사용 가능 입력 | 역할 | 제외/한계 |
| --- | --- | --- |
| Storm exposure | 공개 기상당국의 폭풍·풍속·시정 공지, 기상 격자자료 | 사전 지정된 걸프 권역의 사건 플래그 | Dust RGB 지도·스크린샷만으로 점수를 만들지 않음 |
| Operations confirmation | 공항·항만·정부·사업자의 공개 운영 공지 | 실제 지연·폐쇄·제한 여부의 확인 | 발표 뒤 확인되는 자료일 수 있어 선행 신호로 부르지 않음 |
| Observation quality | 광학 관측의 판독 제한 여부 | 데이터 품질 플래그 | AIS 누락·광학 영상 공백을 공급 차질로 환산하지 않음 |
| Controls | 공식 OPEC 발표·사전 정의된 지정학 사건 더미 | 동시 정책·사건 효과와 분리 | 정책 발표를 예측 입력으로 쓰지 않음 |

초기 프로토타입은 유료 Kpler, X·Telegram 직접 수집, 개인·선박 단위 위치 데이터 없이 공공·집계 발표만 사용한다. 데이터 접근·라이선스·역사적 공개시점이 확인되기 전에는 국가·공항·항만을 점수에 추가하지 않는다.

## 점수의 올바른 형태

제안된 `storm area × AIS loss × social panic`은 채택하지 않는다. AIS 결측이 커버리지 오류일 수 있고, 소셜 반응은 봇·시차·접근권 문제가 있으며, 폭풍 면적과 기계적으로 곱하면 해석이 불가능해진다.

대신 각 층을 분리해 공개시점을 기록한다.

```text
SSI research record(t) = {
  storm_exposure_flag,
  official_operational_disruption_flag,
  observation_quality_flag,
  published_at
}
```

향후 수치화가 가능해져도, 각 플래그의 지역 정의·임계값·가중치는 인샘플에서 한 번 정해 동결한다. OVX나 같은 시점의 WTI 가격·변동성을 입력으로 넣지 않는다. 그것들은 예측 대상 또는 사후 검증값이지 입력이 아니다.

## UI 표기

```text
🌪️ Sandstorm Sentiment Index
Storm exposure: DATA EXPLORATION
Public operations confirmation: DATA EXPLORATION
Observation quality: FLAG ONLY
Oil Pizza: 0.0%
```

`SSI > 60 buy OVX`, `SSI > 80 long Brent` 같은 문구는 UI·백테스트·운용 규칙에 넣지 않는다. 프로젝트 타깃은 Yahoo `CL=F`이며, SSI는 그 미래 실현변동성을 시험하는 보류 상태의 리스크 게이트다.

## 검증·금지선

1. 후보 선정·권역·변환·임계값 고정은 인샘플 `2015-01-01`~`2023-12-31`에서만 한다.
2. OOS `2024-01-01` 이후는 동결 뒤 한 번만 연다.
3. 타깃은 Yahoo Finance `CL=F`의 미래 실현변동성이다. 성과·선행성·매매 임계값은 검증 전 주장하지 않는다.
4. 뉴스는 사용자가 제공한 CSV만 쓰며, Investing.com·소셜 플랫폼을 직접 스크래핑하지 않는다.
5. 개별 선박·근로자·동물·보안 민감 인프라를 추적하지 않는다.

## 결론

020은 강한 밈을 갖고 있지만, 실증 후보는 “모래가 난다”가 아니라 **공개 기상 사건과 공개 운영 차질이 동시에 확인된 경우**다. 현재는 데이터 적격성과 시간 정렬을 확인하는 `HOLD`, Oil Pizza `0.0`이다.

## 참고 출처

- [Kuwait Government Online — Dust storm reaches Kuwaiti border (2025-04-14)](https://e.gov.kw/sites/kgoenglish/Pages/ApplicationPages/NewsDetail.aspx?nid=34663288)
- [NASA POWER Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)
- [OPEC official press releases](https://www.opec.org/pr-detail/604-16-june-2026.html)
