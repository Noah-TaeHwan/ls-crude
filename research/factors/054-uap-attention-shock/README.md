# 054 — UAP Attention Shock

**상태**: 🛸 **MEME DISCOVERY — 알파 아님, OOS 미개봉**  
**밈**: *“When UFO attention spikes, Bitcoin and GME get weird.”*  
**가중치**: `0.0`

## 이 팩터가 하는 일

영문 위키백과 `Unidentified_flying_object` 문서의 일별 조회수를 공개 관심도 입력으로 고정했다. 관심도는 90일 롤링 z-score로 표준화하고, 당일 조회수는 다음 달력일에야 알 수 있다고 보수적으로 처리했다. 이 입력과 자산별 **그 뒤 5거래일 실현변동성**의 단순 상관을 넓은 자산 바스켓에서 비교했다.

이것은 원유 가격 예측 가설이 아니다. 사용자가 의도한 대로, 넓게 훑어 우연한 연결도 이야기로 남겨 보는 **Meme Discovery**다.

## 1단계 결과 — 인샘플 발견용 스캔

| 고정 항목 | 값 |
| --- | --- |
| 관심도 원천 | Wikimedia Pageviews API, `en.wikipedia`, `Unidentified_flying_object`, user traffic |
| 기간 | 2015-07-01~2023-12-22 (5거래일 타깃이 인샘플 안에 끝나는 행만) |
| 자산 | 주식·ETF·원자재·크립토·방산·우주·밈 종목 등 사전 고정 62개 |
| 점수 | `attention_z90` vs 다음 5거래일 자산 실현변동성의 Pearson `r` 절댓값 순위 |
| 상위 결과 | `BTC-USD`와 `GME` 동률 `r=+0.081`, 그 다음 `ETH-USD` `+0.073`, `RIOT` `+0.061`, `UNG` `+0.060` |
| 가격방향 | 상위 둘의 다음 5일 수익률 상관은 BTC `-0.032`, GME `+0.012` — 방향 신호 없음 |

## 해석 경계

- 62개를 동시에 보고 최고값을 고른 만큼 `+0.081`은 **우연 발견이 예상되는 크기**다. p값·거래 규칙·유의성 배지를 붙이지 않는다.
- 자산의 상장·거래 이력과 시장 거래일이 달라 상관 비교에는 구조적 한계가 있다. 원시 패널 행 수는 3,037로 기록했지만, 그것이 자산별 동등한 경제적 역사라는 뜻은 아니다.
- UAP 조회수 급등은 뉴스·엔터테인먼트·사회적 관심이 섞인 결과다. 원인, 투자자 의도, 원유 수급을 추론하지 않는다.
- 따라서 이 결과는 **콘텐츠/대시보드용 밈 후보**일 뿐, 투자·거래·리스크 판단에 쓰지 않는다.

## 다음 단계 (아직 실행하지 않음)

1. BTC 또는 GME 중 하나를 단 하나의 “Meme Badge” 대상으로 선택한다.
2. 문서·입력·90일 z-score·5일 변동성·부호까지 동결한다.
3. 그 뒤 2024+ OOS를 **한 번만** 연다. 발견 단계에서 OOS를 최적화하지 않는다.
4. 사전 고정 OOS에서도 보존되지 않으면 이 카드는 재미있는 기록으로만 남긴다.

## 재현과 보관

- 수집 스크립트: `research/gathering/raw/2026-09-04-uap-meme-discovery/uap_meme_discovery.py` (gitignored)
- 원시 API 응답·자산 패널·전체 순위: 같은 gitignored `raw/` 경로
- 결과 요약과 방법: [수집 노트](../../gathering/notes/2026-09-04-uap-meme-discovery.md)
- 팀 공유용 상관표: [054 별도 Meme Discovery 매트릭스](../../reports/2026-09-03-factor-validation-share.md#054-별도-meme-discovery-상관-매트릭스--uap-관심도--자산-변동성)
- 원천 API: [Wikimedia Pageviews API](https://wikimedia.org/api/rest_v1/), [접근 정책](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/access-policy.html)
