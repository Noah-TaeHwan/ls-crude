# 실행 패키지 검증 결과

2026-09-11 · 대상은 생성한 문서와 로컬 패킷 생성 도구다.

| 검사 | 실제 결과 |
|---|---|
| v0.5 원문 보존 | 원본 MD와 바이트 단위 일치 |
| catalog·카드·계약·선행조건 | 14개 단위, 내부 의존성 DAG/누락/해시 검사 통과 |
| 로컬 Markdown 링크 | 36개 확인, 끊긴 로컬 링크 없음 |
| 패킷 생성기 자동 검사 | 16개 unittest 통과; 모든 14개 단위 출력 포함 |
| 잘못된 입력 방어 | 미등록 ID·누락·중복·순환 의존성·경로 이탈·소스 변조 거절 확인 |
| 쓰기 부작용 | 패킷 생성 전후 패키지 내용 불변 확인 |
| 실제 모델 평가 | **NOT_RUN**; 12개 평가 사례만 준비 |
| 실제 repo/app 테스트·CI·운영 | **NOT_RUN**; 이 세션에서 원격 수정/새 감사 없음 |

실행 명령은 패키지 루트에서 다음과 같다.

```bash
python3 -S docs/cai/execution/make_packet.py --check
python3 -S docs/cai/execution/tests/test_make_packet.py
```

표준 라이브러리만 쓰는 도구의 격리 테스트에서 Python site 초기화를 생략했다. 실제 앱의 Python 실행에 -S를 적용하라는 지침이 아니다.

[자동 검사 로그](verification/packet-tests.txt) · [구조 검사 로그](verification/structure-check.txt)

모델 평가 성공률·비용 절감률·프론티어 대비 동등성을 측정했다는 뜻이 아니다. 문서/카드가 존재한다고 실제 구현 task를 DONE으로 처리하지 않는다.
