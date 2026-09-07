# ALT-20260907-18 PortWatch Hormuz tanker weekly

run `run-20260907T063658Z` · 인샘플만 · 원본 `research/gathering/raw/ALT-20260907-18/20260907T063658Z/hormuz.json` sha256 `0ce69800fa8b25c688b81ab113bb79664810085f433a25cb47a8ebbdff97ef74`

## 사전 정의
- 활동: IMF PortWatch `chokepoint6` 일별 `n_tanker`의 주(월–일) 평균.
- 공개: 공식 FAQ 매주 화 09:00 ET. 주 종료일 다음 화요일을 `available_at`으로 두고 그 날 이후 첫 CL 거래일에 결합.
- 타깃: 그 거래일의 `f1`(다음 1거래일 수익률), `rv5`(다음 5거래일 실현변동성, r_t 제외).
- placebo: Bering `n_total` 동일 레시피. 보조: Suez/Malacca tanker.
- 선택 구간: 2019-01-01(원천 시작)~2023-12-31. 2015–2018 없음.
- OOS: 이 실행에서 계산하지 않음 (`UNSEEN` 주장 아님 — 파일에 2024+ 행이 있으나 통계에 미사용).

## 실행 결과 (IS)
            name   n   pearson  spearman  signal_mean  target_mean
  hormuz_d_vs_f1 259  0.086476  0.146181     0.023534     0.001849
 hormuz_d_vs_rv5 259  0.005522  0.014606     0.023534    41.363962
hormuz_lvl_vs_f1 260 -0.038202 -0.015160    50.010623     0.002041
  bering_d_vs_f1 259  0.002103 -0.039872    -0.012227     0.001849
    suez_d_vs_f1 259 -0.026494 -0.023756     0.025740     0.001849
 malacca_d_vs_f1 259  0.000863  0.018246     0.060765     0.001849

이중축 그림은 단위가 다르다. 크기를 같은 효과로 읽지 말 것.
주장 가능: 이 원본으로 주간 유조선 척수 지수를 구성할 수 있다. 주장 불가: 알파·인과·거래 성과.

## 강건성 (repo empirical only)
- 2020 제외: hormuz_d vs f1 n=207 r=+0.159 rho=+0.132 (부호 유지).
- 동행 r1: r=-0.019. 단순 동행으로 설명되지 않음.
- 사건창은 미실행. 사건 목록 미동결.
- 두 번째 산식 `analyze_wti_checks.py`(전주 평균 vs 다음 주 로그수익률): Pearson +0.051, Spearman +0.003, n=260, Suez placebo +0.039. 카드 정본은 `build_and_test.py`의 단순수익률 f1이다. 둘 다 약한 탐색값이며 알파가 아니다.
