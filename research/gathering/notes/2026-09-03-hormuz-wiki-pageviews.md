# 영어 위키 호르무즈 조회수

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-03 |
| 상태 | 보류 |
| 작성 | 에이전트 |
| 관련 출처 | Wikimedia Pageviews (`Strait_of_Hormuz`) |

## 한 줄 가설

잠근 회고 정의: 달력일 D 조회수가 **D 이전 20일 중앙값의 2배**를 넘으면 급증. CL 거래일 T는 달력 T-1 급증만 붙이고, 손익은 T 종가 대비 **다음 거래일** 종가로 센다. 이 D-1 정렬은 당시 가용 시점을 증명하지 않는다. 이 숫자는 같은 날 다시 고치지 않는다.

**`NOT_PROVEN as-of-safe`**. 연구 전용이며, 보수적 가용성 계약이나 당시 빈티지 영수증이 생기기 전에는 후보 점수 산정에 쓰지 않습니다.

## 크립토의 뭐 × 뉴스의 무슨

| 쪽 | 내용 | 아직 없음 |
| --- | --- | --- |
| 크립토의 뭐 | 위키 조회수는 크립토가 아닙니다. | 예 |
| 뉴스의 무슨 | Investing.com 헤드라인이 아니라 위키 조회수입니다. 뉴스가 있을 때 같이 움직일 수는 있습니다. | 예 |

둘 다 채워지기 전에는 [`pizza-hunt.md`](../../notebooks/pizza-hunt.md)에 행을 만들지 않습니다.

## 본문

펜타곤 피자(Uber Eats 주문)는 공개 시계열이 없어 **철회**했습니다. 이 축은 주문 대신, 누구나 받을 수 있는 위키 조회수로 「사람들이 해협을 찾아 보는가」만 봅니다.

### 본 것 (링크)

- Pageviews API: [page-views 레퍼런스](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html). 일별 시작일은 **2015-07-01**.
- 접근 정책: [access-policy](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/access-policy.html). API 데이터는 **CC0 1.0**. 요청에 `User-Agent`가 필요합니다.
- 2015-01-01~2015-01-07 조회는 HTTP 404. 인샘플 전반기(2015-01-01~2015-06-30)는 이 API에 없습니다.
- 2015-07-01~2015-07-07 `agent=user` 조회수는 날짜마다 수백 건대가 있었습니다. 이 숫자는 커버리지 확인용이며 성과가 아닙니다.
- 인샘플 사건 한 주(2018-05-06~2018-05-12, 미국이 JCPOA에서 빠지던 주): 6일 439, 7일 521, **8일 965**, 9일 914. 사건 정의는 시드 뉴스 `event_calendar.csv`의 2018-05-08 행입니다. 유가와의 상관·샤프는 계산하지 않았습니다.
- 인샘플 정렬 CSV(깃 안 올림): `research/data/processed/hormuz-wiki-views-in-sample.csv`. CL 거래일 **2137**행, 전부 `sample=in`, 전부 전날 조회수 있음. 첫 봉 **2015-07-02**, 마지막 **2023-12-29**(2023-12-31은 일요일이라 시드에 없음). 2024 행 **0**. 조회 달력일은 API **2015-07-01~2023-12-31** **3106**일.
- 같은 주 점검: CL **2018-05-08**의 `hormuz_wiki_views_prior` = **521**(5/7). CL **2018-05-09** = **965**(5/8). 5/8 조회수 965를 5/8 종가에 붙이지 않았습니다.
- 잠근 급증(20일 중앙값 ×2, N 고정) 인샘플 횟수: 거래일 2137, 급증 **124**, 다음날 방향 있는 급증 **123**, 다음날 종가 상승 **66**, 하락 **57**, 창 안 2024행 **0**. 샤프·MDD·평균수익은 계산하지 않았습니다. 66과 57은 횟수이며 후보 승격 근거가 아닙니다.

### 재현 명령

새 checkout에서 연구 환경을 설치한 뒤 아래 명령 하나로 API 구간을 받고, 무시된 정렬 CSV와 횟수 영수증을 다시 만듭니다.

```bash
cd research
.venv/bin/python - <<'PY'
from pathlib import Path
import pandas as pd
from ls_crude.data.wiki_pageviews import fetch_hormuz_wiki_views, in_sample_wiki_window, count_in_sample_spike_next_up

prices = pd.read_csv("data/clf-daily-2015-2026.csv", parse_dates=["date"]).set_index("date")
views = fetch_hormuz_wiki_views("2015-07-01", "2023-12-31")
window = in_sample_wiki_window(prices, views)
Path("data/processed").mkdir(exist_ok=True)
window.to_csv("data/processed/hormuz-wiki-views-in-sample.csv", index_label="date")
print(len(views), views.index.min().date(), views.index.max().date())
print(len(window), window.index.min().date(), window.index.max().date(), count_in_sample_spike_next_up(prices, views))
PY
```

기대 커버리지: 조회수 **3106일** (`2015-07-01`~`2023-12-31`, 날짜 누락·중복 없음), 정렬 CL **2137행** (`2015-07-02`~`2023-12-29`, 전날 조회수 누락 없음), 횟수 `124 / 123 / 66 / 57 / 0`.

### 안 본 것

- 샤프·MDD·상관계수. 급증 배수 N을 본 뒤에 다시 고치는 일.
- `West_Texas_Intermediate` 등 다른 문서 조회수.
- 봇(`agent=all-agents`)과 사람(`user`)의 차이 전 구간.
- Investing.com 사이트. 스크래핑하지 않습니다.

### 기존 Oil Slice(`000`)와 다른 점

Oil Slice는 Investing.com CSV의 호르무즈·인플레 헤드라인 횟수입니다. 이 축은 헤드라인을 세지 않고, 해협 문서 조회수입니다. PortWatch 통과 척수와도 다릅니다. 크립토 × 뉴스가 아니므로 후보 표에 넣지 않습니다.

### look-ahead

회고 데이터에서는 달력 D 조회수를 CL 거래일 T=D+1에 붙이고, 손익은 그 다음 거래일 종가로 셌습니다. 그러나 Wikimedia 일별 값은 보통 기간 종료 뒤 수 시간 안에 적재되더라도 24시간 이상 늦을 수 있고, 2026년에 받은 최종값에는 당시 공개 시각이 없습니다. 따라서 D-1 정렬만으로 CL 종가 전 가용성을 증명할 수 없으며 **`NOT_PROVEN as-of-safe`**입니다. 보수적 가용성 계약이나 당시 빈티지 영수증 전에는 후보 점수 산정에 쓰지 않습니다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` (타겟만. 조회수는 가격이 아님) |
| 뉴스 출처 | 해당 없음. Investing.com을 긁지 않음. 본 출처는 Wikimedia Pageviews API |
| 라이선스 | API 데이터 CC0 1.0 (Wikimedia access-policy). 이용약관·UA 정책은 별도 |
| 발표 지연 | 일별. 보통 종료 뒤 수 시간이나 24시간 이상 늦을 수 있음. 당시 적재 시각 영수증 없음 |
| look-ahead | 회고 D-1 정렬만 확인. **`NOT_PROVEN as-of-safe`**, 후보 점수 산정 금지 |
| 본 기간 | API 시작 2015-07-01. 인샘플 `2015-01-01`~`2015-06-30` 없음. 정렬 CSV는 CL **2015-07-02**~**2023-12-29** (2137행) |
| 아웃샘플을 봤나 | 아니오. 2024 이후 조회수는 이 노트에서 받지 않음 |
| 성과 숫자 | 없음. 급증 횟수 124·방향 66/57만 기록. 샤프·MDD·적중률 공식이 아님 |

## 다음 한 가지

보류. 게이지는 WATCHING. `pizza-hunt` 행과 실험 카드는 만들지 않습니다. 보수적 가용성 계약이나 당시 빈티지 영수증 전에는 후보 점수 산정에 쓰지 않습니다. **N=2·창=20을 같은 날 고치지 않습니다.** 다음 조사는 2015부터 있는 **크립토 일별 공개 시계열**이지, 위키 재튜닝이 아닙니다.
