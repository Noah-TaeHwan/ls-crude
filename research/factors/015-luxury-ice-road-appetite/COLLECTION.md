# 015 — 수집·검증 기록

- 원시 보관: gitignored `research/gathering/raw/2026-09-03-public-series-completion-probe/`
- 무료 입력: FHWA Traffic Volume Trends `M12MTVUSM227NFWA` 전국 월간 VMT
- 사양: 전월 변화의 36개월 z-score, 관측월 +75일 뒤 공개된 것으로 보수 정렬, 이후 21거래일 `CL=F` 실현변동성
- 결과: IS `r=+0.197`, n=108 / OOS `r=-0.192`, n=31
- 경계: 전체 미국 주행거리일 뿐 슈퍼카·구형 대배기량차·대형 픽업·유조차를 구분하지 않는다. 부호 반전으로 거래 가중치는 `0.0`이다.
