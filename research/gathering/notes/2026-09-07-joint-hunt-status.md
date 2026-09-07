# 2026-09-07 공동 헌트 상태

| 항목 | 값 |
| --- | --- |
| 날짜 / 작성자 | 2026-09-07 / 오태환 |
| 후보 ID | ALT-20260907-18 … 29 |
| 상태 | 이 헌트 12행(원장 번호 18–29). 우승 지수 없음 |
| 연결 출처 | REGISTRY 및 각 카드 |

## 한 줄

피자급 공개 시계열을 **구성할 수 있는지**를 12개에서 갈랐다. KEEP은 18 호르무즈 유조선 척수와 21 싱가포르 벙커뿐이다. 둘 다 알파가 아니다. 작업 중 ID는 01–12였으나 main의 활동 proxy 01–08·다른 작업나무 09–17과 겹치지 않게 18–29로 옮겼다.

## 실행 명령

```bash
cd research
.venv/bin/python notebooks/hunt-20260907/collect_candidates.py
.venv/bin/python notebooks/hunt-20260907/build_and_test.py
```

인샘플만. `python -m ls_crude.build` 사용 안 함.

## 숫자 (repo empirical only, IS 2015–2023 또는 원천 교집합)

상세: [indexes/HUNT-20260907-is-stats.csv](../../indexes/HUNT-20260907-is-stats.csv), [robustness](../../indexes/HUNT-20260907-robustness.csv).

## 사람 판단

- OpenSky 연구기관 신청: 손성찬/Noah
- 싱가포르 탱커 데이터셋 ID 화면 복사: 손성찬
- ERCOT 403 우회 URL: 손성찬
- 01 사건 목록 동결: 오태환 초안 후 손성찬 검토
