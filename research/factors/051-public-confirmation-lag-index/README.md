# 051 — Public Confirmation Lag Index (PCLI)

**상태**: ⏸️ **HOLD — 역사적 as-of 시각이 없어 유효한 IS/OOS 검증 불가**  
**별칭**: *“When the physical world is visible before the headline arrives.”*  
**Oil Pizza 가중치**: `0.0` — 018 위성 운영 맥락과 049 뉴스 주목도를 결합한 연구 프로토콜이며, 둘과 동시 가중하지 않는다.

## 질문

공개 위성에서 관측된 **권역 단위 물리 이상**이 시장에 공개된 시각과, 독립 뉴스 매체가 공급·운영 영향으로 처음 확인한 시각의 차이(confirmation lag)가 길 때, 그 불확실성 구간 뒤의 WTI 변동성이 높아지는가?

```text
공개 위성 이상 관측
  → 당시 실제 공개 가능 시각(t_available)
  → 독립 공개 보도·공식 확인(t_confirm)
  → lag = t_confirm - t_available
  → 이후 5거래일 CL=F 실현변동성
```

이는 ‘뉴스가 늦으면 은폐’라는 주장이 아니다. 위성 관측 실패·구름·알고리즘 처리·기자의 검증·사건의 무의미함 모두가 lag를 만들 수 있다. 따라서 PCLI는 억압·의도·특정 시설의 운영상태를 추론하지 않는다.

## 018·049와의 관계

PCLI는 독립 신호가 아니라 [018 Refinery Thermal & Flare](../018-refinery-thermal-flare/README.md)의 물리 관측과 [049 Geopolitical News Attention Shock](../049-geopolitical-news-attention-shock/README.md)의 공개 뉴스 시각을 맞추는 **교차 검증 층**이다. 018이나 049가 유효하다고 증명되지 않은 상태에서 PCLI만 따로 가중하면 같은 사건을 세 번 세게 된다.

## 사전 등록된 검증 사양

| 항목 | 고정 기준 |
| --- | --- |
| 분석 단위 | 개별 시설이 아니라 사전 지정된 정유·수출 권역의 공개·역사적 이상 사건 |
| 위성 시각 | 탐지 시각이 아니라 해당 탐지가 일반 사용자에게 공개된 **기록된** 시각 |
| 확인 시각 | Guardian 등 사전 지정 독립 매체의 첫 관련 보도 또는 공식 공개 공지 중 늦은 시각 |
| 타깃 | 확인시각 이후 다음 5거래일 Yahoo `CL=F` 실현변동성 |
| 분할 | 2015–2023에서 사건 정의·권역·lag 버킷을 고정, 2024+는 한 번만 OOS 평가 |
| 금지 | 현재 아카이브의 탐지시각을 과거 NRT 공개시각으로 대체, 기사 본문을 사후로 골라 사건을 정의, 방향성 매매 주장 |

## 무료 데이터 접근성 검증 — 2026-09-04

NASA FIRMS는 열 이상 탐지의 관측 시각을 제공하고, VIIRS S-NPP 역사 자료는 2012년 1월부터 존재한다. 그러나 역사 Archive Download는 Earthdata 로그인/이메일 요청이 필요하며, NASA는 NRT 자료가 2–5개월 뒤 과학품질 자료로 교체된다고 명시한다. 즉 현재 무료 역사 아카이브는 **당시 NRT/RT가 언제 공개되어 있었는지의 빈티지 로그를 보존하지 않는다.**

Guardian Content API는 제목·UTC 게시시각·URL 메타데이터를 제공하므로 `t_confirm` 후보가 될 수 있다. 하지만 `t_available`의 역사 로그가 없으므로 두 시각의 차이를 계산하면 미래에 정리된 관측자료를 과거에 이미 알았다고 가정하게 된다.

| 필요한 입력 | 무료 역사 접근성 | PCLI 백테스트 적격성 |
| --- | --- | --- |
| FIRMS 탐지 시각 | 접근 후보 있음 | 불충분 — 공개 가능 시각과 다름 |
| FIRMS 과거 NRT/RT 공개시각 빈티지 | 현재 공식 Archive에서 확인 불가 | 불가 |
| Guardian 최초 제목·게시시각 | Developer API 조건부 가능 | 단독으로는 불충분 |
| 공식 운영 확인 | 사건별 공개 공지 후보 | 사건 패널·공개시각 사전 등록 필요 |

**검증 결과**: IS 상관계수, OOS 상관계수, 사건 효과는 계산하지 않았다. 이것은 데이터가 없다는 뜻이 아니라, 현재 무료 역사 자료로 계산하면 look-ahead를 막을 수 없다는 뜻이다. 숫자를 만들지 않는 것이 올바른 검정 결과다.

## 다시 열 수 있는 조건

1. 타임스탬프가 보존된 NRT/RT 공개 빈티지 또는 독립적인 수집 로그를 확보한다.
2. 사전 지정 권역의 충분한 공개 사건 패널과 사건별 공식 확인 공지를 확보한다.
3. 위 사양을 동결해 IS에서만 평가하고, 그 뒤 OOS를 한 번 연다.

그때도 유효한 것은 ‘정보 불확실성의 변동성 맥락’일 뿐, 지연 자체가 원유 방향을 예측한다는 보장은 아니다.

## 참고

- [NASA FIRMS active fire data](https://firms.modaps.eosdis.nasa.gov/active_fire/)
- [NASA FIRMS archive download](https://firms.modaps.eosdis.nasa.gov/download/)
- [Guardian Content API search documentation](https://open-platform.theguardian.com/documentation/search)
- [조사 노트](../../gathering/notes/2026-09-04-public-confirmation-lag-index.md)
