# 루트 링크 추가 제안 (미적용)

루트 README.md·AGENTS.md는 수정하지 않았다. 이유: 로컬(`b981ceb`)과
원격 main(`cecf1cf`)의 내용이 다르다. 차이는 각 파일 끝의 빈 줄 1개뿐이며,
로컬 사용자 변경은 없다(tracked clean). 그래도 낡은 기준에서 루트를 고치면
병합 잡음이 생기므로 추가문만 제안한다. 동기화 후 적용 여부를 결정한다.

## README.md 끝에 추가 (제안)

```markdown
## CAI 개편 제안·실행 준비 문서

CAI(쿠싱 액티비티 인덱스) 웹 개편 제안과 실행 준비 문서는 [docs/cai/README.md](docs/cai/README.md)에 있습니다. 팀 합의 전 초안이며 운영 반영이 아닙니다.
```

## AGENTS.md 끝에 추가 (제안)

```markdown
## CAI 개편 실행 입구

CAI 개편 제안·실행 준비 문서는 [docs/cai/README.md](docs/cai/README.md), 실행 규칙은 [docs/cai/execution/CORE_RULES.md](docs/cai/execution/CORE_RULES.md)를 읽습니다. 기존 스킬·ego·원장 규칙은 그대로 유지합니다.
```

적용 조건: 원격 동기화 후 위 블록을 각 파일 끝에 추가하고, 기존 설명·연구 기록·
ego 규칙·권한 규칙을 삭제·변경하지 않는다. 적용 자체가 별도 승인 사항이다.
