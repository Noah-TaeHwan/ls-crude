# IMF PortWatch 호르무즈 통과 척수

| 칸 | 값 |
| --- | --- |
| 날짜 | 2026-09-02 |
| 상태 | 조사 중 |
| 작성 | 에이전트 |
| 관련 출처 | IMF PortWatch (Hormuz `chokepoint6`) |

## 한 줄 가설

호르무즈 해협을 지나는 선박의 공개 통과 척수가 평소와 다르면, WTI 선물(`CL=F`)이 반영하는 공급 차질 가능성과 같은 축에 붙을 수 있습니다. 가격 자체가 아니라 해협 활동 옆의 공개 관측입니다.

## 크립토의 뭐 × 뉴스의 무슨

| 쪽 | 내용 | 아직 없음 |
| --- | --- | --- |
| 크립토의 뭐 | PortWatch는 위성 AIS 집계입니다. 크립토가 아닙니다. | 예 |
| 뉴스의 무슨 | 뉴스 헤드라인이 아니라 일별 통과 척수 시계열입니다. | 예 |

둘 다 채워지기 전에는 [`pizza-hunt.md`](../../notebooks/pizza-hunt.md)에 행을 만들지 않습니다.

## 본문

팀 채팅 2026-09-02 (금고 잠금 아님, 노트만). 호금 튜터(LS CRUDE 아님)가 펜타곤 피자 인덱스형 조건으로 걸렀습니다. 가격 자체는 아니고, 활동 옆의 공개 관측이며, 이례적 시점이고, 2015–2023 walk-forward 시계열이 있어야 합니다. 호르무즈 통과 척수는 IMF PortWatch이고 공개이며 주간 배포입니다. 팀 채팅은 지연을 2–9일로 적었습니다. 공개 확인 한 번은 일봉 유가와 무관하다고 했습니다. 인샘플이 짧을 수 있습니다. 2주 안에 돌릴 수 있는 후보는 이 축뿐입니다. 후보는 아직 얼리지 않습니다.

### 본 것 (링크)

- 공식 홈: [https://portwatch.imf.org/](https://portwatch.imf.org/). 공개 플랫폼입니다. UN Global Platform(UNGP) AIS를 씁니다. 홈은 Daily Trade Data Since **2019**라고 적습니다. 호르무즈 통과 해상 원유 비중을 약 25%로 적습니다. 조회 시점에는 이번 주 데이터 배포가 기술적 이유로 지연된다는 공지가 있었습니다.
- 호르무즈 페이지: [https://portwatch.imf.org/pages/cb5856222a5b4105adc6ee7e880a1730](https://portwatch.imf.org/pages/cb5856222a5b4105adc6ee7e880a1730). 식별자는 `chokepoint6`, 이름은 Strait of Hormuz입니다. GPS 재밍, AIS 스푸핑, 선박 going dark가 있으면 척수가 실제 통행을 낮게 잡을 수 있다고 적습니다.
- FAQ: [https://portwatch.imf.org/pages/faqs](https://portwatch.imf.org/pages/faqs). 항구·초크포인트 활동은 **매주 화요일 09:00 ET**에 갱신됩니다. 날짜는 UTC입니다. 인용은 `Sources: Kpler; UN Global Platform; IMF PortWatch (portwatch.imf.org).` 입니다. 상업 재배포는 `copyright@imf.org`에 묻습니다. 플랫폼 공개는 2023-11-15 베타입니다. UNGP 원천 AIS는 2018-12부터라고 적습니다. 개정은 AIS 원천·방법·커버리지 때문에 일어납니다.
- Data & Methodology: [https://portwatch.imf.org/pages/19b92a4413c34407878791299acde8d7](https://portwatch.imf.org/pages/19b92a4413c34407878791299acde8d7). 데이터셋 이름은 Daily Chokepoint Transit Calls and Trade Volume Estimates입니다. 갱신은 매주 화요일 09:00 ET입니다. 저작권은 [https://www.imf.org/external/terms.htm](https://www.imf.org/external/terms.htm)를 가리킵니다. 2026-03에 `chokepoint6` 경계가 고쳐졌고, 2026-07·2026-08에 AIS 스푸핑·불완전 통과 검사가 들어가 시계열이 개정되었습니다.
- 공개 ArcGIS REST: `Daily_Chokepoints_Data`. FAQ 예시와 같은 서비스입니다. `portid='chokepoint6'`로 조회하면 `portname`은 Strait of Hormuz이고, 가장 이른 `date`는 **2019-01-01**입니다. 원본 CSV 덤프는 깃에 올리지 않습니다.

### 안 본 것

- IMF Copyright & Usage 전문. 이 환경에서 `imf.org/external/terms.htm`은 500, `imf.org/en/about/copyright-and-terms`는 Access Denied였습니다. 라이선스는 PortWatch 푸터·FAQ만 확정합니다. CC-BY로 단정하지 않습니다.
- 화요일 09:00 ET가 실제로 찍힌 배포 시각 로그. 공식 FAQ는 주기를 적고, 최신 행이 통과일로부터 며칠 늦은지는 일 단위로 적지 않습니다.
- 인샘플 2019–2023 통과 척수와 `CL=F`의 통제 비교. 성과 숫자를 만들지 않습니다.
- Investing.com 사이트. 스크래핑하지 않습니다.

### 기존 Oil Slice(`000`)와 다른 점

Oil Slice는 Investing.com CSV의 호르무즈·인플레/정책 헤드라인 횟수입니다. 식 `2 * hormuz + 1 * inflation_policy`와 `CL=F`는 그대로 둡니다. PortWatch는 헤드라인이 아니라 해협 통과 척수입니다. 크립토 × 뉴스가 아니므로 후보 표에 넣지 않습니다.

### look-ahead

지연이 있으면 **통과일이 아니라 발표 시점**으로 시계열을 밀어야 합니다. `date`가 월요일이어도 그 값이 화요일 09:00 ET 이후에야 공개되면, 월요일 `CL=F` 봉에 붙이는 것은 look-ahead입니다. 주말·타임존은 UTC 날짜와 ET 발표 시각을 `CL=F` 거래일에 맞춥니다. 배포가 미뤄지면 더 늦춥니다. 같은 봉으로 몰래 쓰지 않습니다.

## 체크

| 항목 | 값 (모르면 «모름») |
| --- | --- |
| 가격 출처 | Yahoo `CL=F` (타겟만. PortWatch는 가격이 아님) |
| 뉴스 출처 | 해당 없음. Investing.com을 긁지 않음. 본 출처는 IMF PortWatch |
| 라이선스 | 사이트 푸터는 © 2022 IMF, All Rights Reserved. FAQ 인용은 Kpler·UNGP·IMF PortWatch. 상업 재배포는 copyright@imf.org. 이용약관 전문은 이 환경에서 미확인 |
| 발표 지연 | 공식: 매주 화요일 09:00 ET. 일 단위 2–9일은 공식 FAQ에 없음. 팀 채팅 2026-09-02가 2–9일이라고 함 |
| look-ahead | 있음. 통과일 봉에 붙이면 발표 전 정보를 쓰게 됨. 발표 시점으로 시프트 |
| 본 기간 | 공개 시계열 시작은 2019-01-01. 인샘플 `2015-01-01`~`2018-12-31`은 없음. 고르기는 `2019-01-01`~`2023-12-31`만 가능 |
| 아웃샘플을 봤나 | 후보 고르기·성과 비교에는 쓰지 않음. 공개 API에서 시작일·조회 시점의 최신 `date`만 커버리지·배포 공지 확인용으로 봄 |
| 성과 숫자 | 없음 (지어 내지 않음). 팀 채팅의 «일봉 유가와 무관»은 공개 확인 한 줄이며 샤프·MDD·적중률이 아님 |

## 다음 한 가지

발표 시각(화요일 09:00 ET, 지연 공지 가능)을 as-of로 고정하는 방법만 이어서 적습니다. 후보 표와 실험 `001`은 만들지 않습니다.
