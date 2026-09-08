# 과거 연구 사례 표시 데이터 v2

수박409날짜·제주336일은 v1과 바이트가 같다. CPC 도일108개월은 검토된 v2 CSV에서 원단위와 자체/제공기관 전년차를 추가했다. 월자료를 일별로 복제하지 않는다. 첫12개월 자체차는 null이며 제공값과 별개다. 새 WTI 검정은 없다.

`manifest.json`에 CSV·quality·표시파일 경로/SHA·행수를 기록했다. CSV 원본은 gitignored, 표시 사본은 Git에 포함한다. 공식 자료 정의와 권리·한계는 각 원천의 연구 기록을 따른다. CPC는 연구팀의 파생 시각화이며 NOAA 공식 예측이 아니다.

```bash
# 검토된 processed CSV가 있을 때만 생성; 내용이 다르면 새 버전 필요
python3 research/scripts/export_observation_charts.py --write
# 원본이 없는 깨끗한 체크아웃/CI에서도 검증
python3 research/scripts/export_observation_charts.py --check
```

[도일 v2](../../ALT-20260907-45/20260908T120546Z/v2/README.md) · [감독 검토](../../../../docs/reviews/2026-09-08-degree-days-closeout.md). 기존 v1은 보존했다.
