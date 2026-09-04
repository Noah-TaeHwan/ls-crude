# 2026-09-03 — AI Burn Rate Index 조사·실측 노트

## 한 줄 결론

AI monetization은 무료 공개 장기 패널로 측정하지 못했지만, AI/데이터센터의 **물리적 buildout**은 Census Data center construction spending으로 측정 가능하다. 첫 WTI 변동성 테스트는 IS 음수·OOS 0 근처로 통과하지 못했다.

## 출처와 역할

| 출처 | 역할 | 한계 |
| --- | --- | --- |
| U.S. Census Value of Construction Put in Place | 2014년부터의 월간 사설 `Data center` 건설지출 | AI 전용이 아니며 현재 vintage의 과거 개정 가능 |
| SEC EDGAR XBRL | hyperscaler capex의 공개 공시 후보 | 기업 회계 태그·회계기간이 이질적. 아직 합성하지 않음 |
| EIA STEO/AEO | 데이터센터 전력수요·전력/가스 전달경로의 거시 근거 | 예측/연간 전망은 거래 시그널 원본이 아님 |

## 첫 테스트

공식 Census XLSX에서 `Data center` 열을 추출했다. 전월 변화 36개월 z-score를 신호로 만들고, 관측월 말+62일 이후 다음 21거래일 `CL=F` 실현변동성과 연결했다.

| 구간 | r | n |
| --- | ---: | ---: |
| IS 2015–2023 | `-0.181` | 83 |
| OOS 2024–2026 | `-0.041` | 29 |

## 재현

- 원본 XLSX·출력: gitignored `research/gathering/raw/2026-09-03-ai-burn-rate-probe/`
- 수집/구조 확인: `inspect_census_data_center.py`
- 계산: `ai_burn_rate_probe.py`

## 해석 경계

EIA는 데이터센터 수요가 전력·천연가스에 영향을 줄 수 있음을 설명하지만, 그것이 WTI 변동성 알파라는 뜻은 아니다. ABRI는 지금 `0.0` 가중치이며, 실측 결과는 가설을 지지하지 않는다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` / 해당 없음 |
| 뉴스 출처 | 해당 없음 (Investing.com 스크래핑 아님) |
| 라이선스 | «모름» |
| 발표 지연 | «모름» |
| look-ahead | «모름» — 공개일 미확보 시 같은 봉으로 쓰지 않음 |
| 본 기간 | 인샘플 `2015-01-01`~`2023-12-31`에서 사양 고정. 이후는 확인/반증 |
| 아웃샘플을 봤나 | 예 — 첫 테스트 표에 OOS r. 채택 근거 아님 |
| 성과 숫자 | 본문 r는 반증·감사 기록. 새 샤프/MDD를 짓지 않음 |
