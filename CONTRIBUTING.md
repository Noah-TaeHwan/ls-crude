# 협업 규칙

짧은 스프린트(2주)이므로 브랜치를 짧게 가져가고, `main`은 항상 실행 가능한 상태를 유지합니다.

## 브랜치

- `main` — 공유 기준선
- `feat/<topic>` — 기능·실험 (예: `feat/wti-ohlcv`, `feat/rf-baseline`)
- `fix/<topic>` — 버그 수정

작업 시작 전 `main`을 최신으로 맞춘 뒤 브랜치를 팝니다.

```bash
git checkout main
git pull
git checkout -b feat/<topic>
```

## 커밋 / PR

- 커밋 메시지는 무엇을 바꿨는지 한 줄로 적습니다.
- PR은 작게. 실험 하나, 데이터 파이프라인 하나 단위가 이상적입니다.
- 대안 데이터 실험은 `docs/experiments/`에 가설·데이터 출처·시점 정합성·결측·결과 지표를 남깁니다.
- 원천 시세·대용량 파일·API 키는 커밋하지 않습니다.

## 역할 경계

| 경로 | 주로 |
| --- | --- |
| `research/src/data`, `research/src/features` | 오태환 |
| `research/src/models`, `research/src/backtest` | 손성찬 |
| `app/` | 오태환 |
| `docs/` | 공동 |

겹치는 파일은 PR에서 먼저 맞춥니다. 전략 파라미터(진입·청산 규칙)는 손성찬 쪽 정의를 기준으로 합니다.
