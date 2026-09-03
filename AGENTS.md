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

## 서브에이전트 위임

- 기본은 메인 에이전트가 직접 수행합니다. 자동 위임은 다수 파일·긴 로그·다수 출처 조사, 서로 독립적인 조사·검증, 구현 후 독립 검증에만 사용합니다.
- 단일 파일 변경, 단순 명령, 순차 의존 작업은 위임하지 않습니다. 읽기·조사·검증은 병렬화할 수 있지만, 쓰기는 파일 소유권을 명시하고 같은 파일을 동시에 수정하지 않습니다.
- 위임 요청에는 목적, 범위와 소유 파일, 금지사항, 요구 증거, 완료 기준을 포함합니다. 동시에 실행하는 서브에이전트는 기본 2개 이하로 시작합니다.
- 자동 역할은 `Trend Researcher`(대안 데이터·시장 조사), `Evidence Collector`(증거 수집), `Reality Checker`(완료 주장 검증)로 제한합니다.
- `Data Engineer`, `Frontend Developer`, `API Tester`는 범위와 파일 소유권을 지정한 경우에만 사용합니다. `Agents Orchestrator`는 자동 호출하지 않습니다.
- 서브에이전트의 보고만으로 완료를 판정하지 않습니다. 메인 에이전트가 파일, 명령, 브라우저, API 등 해당 증거 표면을 직접 재검증합니다.
