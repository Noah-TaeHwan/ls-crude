# raw — 받은 그대로

검색 결과, 보낸 CSV, zip, parquet, 복사한 원문을 둡니다. **정리하지 않은 것**만.

## 규칙

- 신규 폴더: 후보 ID/수집시각 (예: `ALT-YYYYMMDD-NN/YYYYMMDDTHHMMSSZ/`). 기존 날짜 폴더는 보존
- README에 출처 URL·수집시각/시간대·파일명·SHA-256·행 수/기간·명령/수동 단계·권한·재취득 방법 기록
- 원본 불변: 정제 결과로 덮어쓰지 않음. 재수집은 새 시각 폴더, 파생물은 `research/data/processed/<candidate_id>/<run>/`
- 인베스팅닷컴은 스크래핑하지 않습니다. 사람이 보낸 CSV만
- 큰 파일·비밀키는 깃에 올리지 않습니다. 이 폴더의 덤프는 `.gitignore`

깃에 남는 것은 이 README, `.gitkeep`, 그리고 날짜 폴더의 URL 안내 README뿐입니다. CSV·zip·원문은 올리지 않습니다.

정리한 내용은 [`../notes/`](../notes/README.md)로 옮깁니다. 원본은 여기 둡니다.
