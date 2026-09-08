# KPX 제주 공개 파일 영수증

[공식 파일](https://www.data.go.kr/data/15069334/fileData.do) · [공식 메타·이용조건](https://www.data.go.kr/catalog/15069334/fileData.json) · [구성·재현](../../../../indexes/ALT-20260908-20/20260908T073402Z/README.md).

`python3 research/notebooks/ALT-20260908-20/collect.py` 실제 실행. catalog GET → 공개 다운로드 metadata POST → check-limit POST(needCaptcha=false) → fileDownload GET. 모든HTTP200. 파일획득2026-09-08T07:34:02.693488+00:00,51,362bytes.

jeju-original.bin은ZIP이며 LNG·유류 CP949 CSV2개를 포함한다. SHA256 `33dd370821581a6d817afd25454d95394e691de6d8f0bb5bf8a027b751a04a90`. 원본·requests.json·메타/한도응답은gitignored. 공개 식별자는 API키가 아니며 인증정보 수집 없음.

공식 이용조건 무료·제한없음. 관측2023-05-01~2024-03-31, 등록2024-04-15/수정2025-06-12를 최초 시간별 공개일로 사용하지 않는다. 사람 팀원의 동일빈티지 재현은 미검증이다.
