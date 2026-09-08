# Singapore Tanker Arrival Watch — 접근 차단 해소 영수증

- 후보: ALT-20260907-26. 요청 시작 기록: 2026-09-08T05:54:11.450337+00:00 / 05:54:12.195862+00:00 (UTC). 최초 코드가 이를 retrieved_at으로 잘못 명명했다. 해당 원본 영수증은 보존하며 실제 응답 완료시각은 미기록이다. 이후 collector는 requested_at과 완료 retrieved_at을 분리한다.
- 결론: **COLLECTED / NOT_RUN / KEEP 제안(E2 관측 구성)**. 월별 dataset ID 미확보 차단은 해소. 12개월 작은 관측 표본만 수집했으며 WTI 관계·예측력은 미검증이다.
- [공식 tanker breakdown](https://data.gov.sg/datasets/d_c9dcfd8b85990669d1e74dd7ad71eb8b/view), [공식 tanker total](https://data.gov.sg/datasets/d_9adb5ace517591edd9a8c88291ac1f1c/view), [정확한 collection 392](https://data.gov.sg/collections/392/view).
- 제공자 설명은 월간 >75 GT tanker arrivals이며, breakdown은 Oil / Chemical / LNG & LPG Tankers로 구분한다. 벙커 판매(후보21/44), 전체 선박 입항, 화물량으로 대체하지 않는다. Oil Tankers도 원유 전용 선박으로 단정하지 않는다. Gross tonnage는 이번 계산에 쓰지 않는다(정확한 단위 배율 미감사).
- [Singapore Open Data Licence 1.0](https://data.gov.sg/open-data-licence)의 접근·다운로드·분석·파생물 공개 허용 및 출처표시 조건 확인(2026-09-08). MPA/data.gov.sg 자료를 이용한 자체 분석이며 기관 보증·공식 지수가 아니다. 개인/선박별 정보는 수집하지 않았다.

## 시점과 관측의 한계

- observed_at: 2025-08~2026-07 월 집계. 일별·주별로 복제하지 않는다.
- available_at: **미확인**. 공식 페이지의 dataset 갱신일 2026-09-07은 각 월의 최초 공표일이 아니다. 조회 시각도 공개일로 사용하지 않는다.
- 최신 월 잠정치라는 제공자 안내가 있다. current-vintage 소표본이며 과거 개정·당시 이용 가능성 미복원.
- 이번 2024+ 활동값은 최신 관측 시연 목적으로 열람. OOS 미열람 주장 금지. WTI 다운로드·결합·상관·lag·placebo 모두 NOT_RUN.
- 가설: 탱커 입항이 해운 활동의 일부를 설명할 수 있다. 척수만으로 적재량·대기시간·벙커 소비·WTI 방향을 추정할 수 있다는 증거는 없다.

## 구성과 품질 (repo empirical only)

원단위 A_m = category가 Oil Tankers인 number_of_tankers. 가중·정규화·보간 없음. 세 category 합계는 별도 total 데이터와 대사하며 Oil 값으로 혼합하지 않는다. null/비정수/중복/유형 변화/불완전 바스켓/대사 불일치는 중단한다. 0은 유효 정수로 보존한다.

| 항목 | 결과 |
| --- | --- |
| 수집 범위 | 2025-08~2026-07, 12개월 |
| breakdown / total 행 | 36 / 12 |
| 중복키 / count 결측 / 합계 불일치 | 0 / 0 / 0 |
| 2026-07 Oil / Chemical / LNG & LPG | 1568 / 468 / 231 arrivals |
| 2026-07 합계 | 1568 + 468 + 231 = 2267, 공식 total 일치 |

[기계 판독 대사](quality.json) · [원단위 그림](oil-tanker-arrivals.svg)

시나리오: (1) tanker 수가 같아도 선박 크기·적재율이 다르면 수송량은 다를 수 있다(가설적 측정 한계). (2) 최신월 수정 시 새 UTC raw 빈티지를 만들고 합계 대사를 다시 한다. (3) total/breakdown 공개월이 어긋나면 코드가 실패하며 0 보정하지 않는다. 이들은 계산된 수익률 시나리오가 아니다.

## 실행과 재생

Python 3.13.15, 표준 라이브러리만. 환경변수/키 없음. Git f16b13564ebef842864528c7143bd7ac1243bde4 + 이 collector 신규 작업본. 최초 소규모 탐침은 breakdown API limit=9 정상 HTTP 200(저장하지 않은 접근확인)였고, 이후 아래 소표본 2요청 모두 HTTP 200. 재시도/대체경로/차단우회 없음.

실제 수집 명령은 `--collect --run 20260908T113500Z`로 실행했으나 수동 run 입력의 UTC 오류를 확인해 세 새 폴더를 실제 첫 요청시각 `20260908T055411Z`로 바로잡았다. 응답 bytes는 변경하지 않았고 requests.json의 UTC는 요청 시작시각의 정본이다(완료시각 아님). 신규 수집은 현재 UTC를 사용한다.

```bash
python3 research/notebooks/ALT-20260907-26/collect.py --self-test
python3 research/notebooks/ALT-20260907-26/collect.py --run 20260908T055411Z
# 새 수집(기존 raw 덮어쓰기 금지)
python3 research/notebooks/ALT-20260907-26/collect.py --collect
```

self-test: 정상/중복/null/유형 drift/합계 불일치 및 원본 변조·출력 덮어쓰기 방지 검사 PASS. replay는 requests.json의 원수집 SHA를 대조하고, 기존 파생물과 다른 bytes이면 새 run/version을 요구하며 중단한다. 자동 UTC run은 신규 수집 기본값이다. 로컬 raw 재생 exit0, output hash 동일. 제3자 동일 bytes 재취득·독립 재현은 아직 미검증.

| 역할 | 경로 | SHA-256 |
| --- | --- | --- |
| raw | research/gathering/raw/ALT-20260907-26/20260908T055411Z/breakdown.json | 9255c463dc32abbc3c30886032a0bb2ece1eb6c851d602182114b1c032c834f9 |
| raw | research/gathering/raw/ALT-20260907-26/20260908T055411Z/total.json | 1bcec76dcbda961afb65c70620dd41095a0490f2a89f84bde74424ca72ca1941 |
| 정제 표 | research/data/processed/ALT-20260907-26/20260908T055411Z/arrivals.csv | 889fe2efaefea0afd07c780071d027d9d9a5e0cb0aa25ff28f5b6721cd085120 |
| 코드 | research/notebooks/ALT-20260907-26/collect.py | ce921f07900ab7e49cf40fd8d89763394a970efa03e41a8e0d4ea9a8af69f679 |

raw와 processed는 gitignored, 공개 Git에는 영수증·작은 그림·코드만 남긴다. signed URL은 사용하지 않았다.

## 다음 행동

오태환(Noah): 월별 공식 발표/개정 이력을 확인해 관측 카드에 정확한 갱신 안내를 붙일 수 있는지 판단(담당 제안, 수락 미확인). 손성찬: Oil Tankers 척수가 우리가 보여주려는 활동을 설명하는지 판단. 사람 검토·대시보드 연결·WTI 검정은 미실행. 실시간 신호가 아니라 월간 관측 후보이다.

## Root 독립 확인

생산코드를import하지않고2개JSON에서36유형행/12총계행을읽어12개월합계를다시대사했고원본SHA가quality.json과일치했다. `--self-test` 및고정run replay를root가직접실행해PASS. 외부팀원의동일빈티지재취득까지확인한것은아니다.

공식 total 웹페이지의검색/열람표면은2026-05까지/갱신2026-06-17로표시됐지만, 이run 실제API응답은2026-07을포함한다. API원문을표본의정본으로보존하며웹catalog표시를월별최초공표일로사용하지않는다. 두표면의갱신차이원인은미확인이다.
