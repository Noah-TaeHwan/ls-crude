# LS CRUDE agent notes

AI 스킬이 이 레포의 기본 입구입니다. 코드 생성 전에 해당 스킬을 읽습니다.

| 상황 | 스킬 |
| --- | --- |
| WTI 가격, Yahoo, `CL=F` | collecting-yahoo-crude |
| 인베스팅닷컴 뉴스, 호르무즈, 연준/CPI | tagging-investing-news |
| 펜타곤 피자 인덱스, Oil Slice, 대안 데이터 후보 | building-slice-index |
| 대안 데이터 후보(크립토의 뭐 × 뉴스의 무슨) | `research/notebooks/pizza-hunt.md`, `docs/experiments/` |
| 조사 덤프·노트·출처 표 | gathering-research-intake, `research/INTAKE.md` |
| 인샘플/아웃샘플, walk-forward | running-sample-splits |

조사 출력 위치:

- 덤프 → `research/gathering/raw/` (깃 안 올림)
- 한 장 노트 → `research/gathering/notes/` (`_TEMPLATE.md` 복사)
- 출처 → `research/gathering/sources/REGISTRY.md`
- 실험 카드 → `docs/experiments/` (승격만, `001-`부터)

고정 규칙:

- 가격 API는 Yahoo Finance
- 뉴스 정본은 Investing.com CSV (스크래핑 금지)
- 아웃샘플은 후보 확정 후 한 번만
- 대시보드는 React Router loader/action + Supabase CRUD
- 페이지는 `loader`, `action`, `meta`를 내보내고 `useLoaderData` / `useActionData`를 쓰지 않습니다
- 조사 원문을 `docs/experiments/`에 바로 쓰지 않습니다. 성과 숫자를 지어 내지 않습니다
