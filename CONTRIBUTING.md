# 협업 규칙

짧은 스프린트이므로 `main`은 항상 실행 가능한 상태를 유지합니다.

## 브랜치

- `main` — 공유 기준선
- `feat/<topic>` — 기능·실험
- `fix/<topic>` — 버그

```bash
git checkout main
git pull
git checkout -b feat/<topic>
```

## 데이터

- 가격: Yahoo `CL=F`만 프로그램으로 받습니다.
- 뉴스: Investing.com CSV. 스크래핑 금지.
- 아웃샘플(2024-01-01~)로 하이퍼파라미터를 돌리지 않습니다.
- 원천 parquet/대용량 파일/키는 커밋하지 않습니다.

## 역할 경계

| 경로 | 주로 |
| --- | --- |
| `research/src/ls_crude/data`, `features` | 오태환 |
| `research/notebooks/`, `docs/experiments/`, `research/data/pizza/` | 오태환 (조사) |
| `research/src/ls_crude/models`, `backtest` | 손성찬 |
| `app/` | 오태환 |
| `.cursor/skills/`, `docs/` | 공동 |
