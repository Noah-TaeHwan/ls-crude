# 원본 영수증 — ALT-20260907-09 (CFTC Disaggregated COT, NYMEX physical WTI)

- 출처 URL: `https://www.cftc.gov/files/dea/history/fut_disagg_txt_YYYY.zip` (2015–2023, 연도별)
- 수집시각: 2026-09-07 06:49–06:51 UTC (2026-09-07 15:49–15:51 KST)
- 파일: `fut_disagg_txt_2015.zip` … `fut_disagg_txt_2023.zip` (연도별 주간 화요일 포지션, 텍스트 CSV 내장 `f_year.txt`)
- SHA-256:
  - 2015 `36aacb4389831a89996ba5366c91eedeaa32a55abca8265325bc52d74b06ca34`
  - 2016 `50f52674fd924d24c794b921c29342be7d35cbe0a241ac823925ccf43ca1a6d2`
  - 2017 `6fc467b989df527a4fbea4ba07185e8951f35cb72563f156488904a37c100e43`
  - 2018 `df4bf7d72e8984d6ea04087f793c9f2bf3503ea8c2149f4b01eedeef4fbe40a8`
  - 2019 `942a438bcc6f66e65aaf594a1a1fdb8c1505fe4a0feece77a1fd97270317e753`
  - 2020 `0aa03c0fd6360f56b6897b6eaff30e8dba774c826bf93cac61598312e19bd1cd`
  - 2021 `12d5d49a8963367fd3439050e3e20e6a5338757dfa083432795c5556827ff8ae`
  - 2022 `74205d75d4d7b75a9f4159ef2e6abed53eeb4771a74e5a4bf78bc0451410ab7f`
  - 2023 `9fe75dba0256819d476bb0d01f9e8e5ac6ec2c4390f609a7e3259e85796b79ce`
- 행 수/기간: 연도별 52주(2022년 개명 주 경계 포함). 사용 계약 코드 `067651`(NYMEX physical WTI).
  2022년까지 `CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE`, 2022년 5주 후부터
  `WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE`로 개명. 동일 코드이므로 연결 사용.
- 명령: `research/.venv/bin/python` + `urllib` 직접 GET (기본 UA, 인증/우회 없음).
  분석 재현: `research/.venv/bin/python research/notebooks/ALT-20260907-09/run_cot.py`
- 권한: 미국 CFTC 공개 데이터. 원본 zip은 Git에 올리지 않음(gitignored). 재배포하지 않고 분석용으로만 사용.
- 재취득: 위 URL 패턴으로 동일 연도 zip 재다운로드. 2024+는 이번 실행에서 수집하지 않음(OOS 미열람 유지).
