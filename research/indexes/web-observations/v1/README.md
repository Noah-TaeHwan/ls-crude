# 반응형 연구 그래프 표시 데이터 v1

수박 ALT-20260907-36 / run20260908T065043Z와 제주 ALT-20260908-20 / run20260908T073402Z의 검증된 CSV에서 표시 필드만 내보냈다. 새로운 지수·관계 검정·원천 수집이 아니다. 원래 영수증과 PNG는 수정하지 않는다.

- watermelon.json:409개 실제 날짜와 정수 분자/분모/소수보고수. 기본 화면은2022년 이후50점, 전체는409점. 분모0·날짜 공백을 만들지 않는다.
- jeju.json:336일의 원단위 MWh와 조건부 비중 문자열. 원래 소수 정밀도를 보존하고 UI에서만 MWh3자리/비중2자리로 표시한다.
- manifest.json:원천/quality 경로·SHA·행수·표시파일 SHA. 원본 CSV는gitignored지만 이 표시 사본은Git에 포함해 깨끗한 체크아웃에서도 빌드한다.

```bash
# 기존 검증 CSV가 있을 때 전체 행·필드 재생성/대사. 같은 내용만 허용.
python3 research/scripts/export_observation_charts.py --write
# 원본 CSV가 없는 CI도 표시파일·quality·추적표/그림 해시·집계를 검사
python3 research/scripts/export_observation_charts.py --check
```

Agency가 원 CSV와 JSON을 별도 비교해 수박1,636개/제주1,344개 필드 불일치0을 확인했다. Main도 재생성·해시·집계 검사를 직접 실행했다. 고정 빈티지 변경은 별도 버전·새 검토가 필요하다. 현재 판정/담당/다음행동은 앱의 후보 원장에서 별도로 읽는다.
