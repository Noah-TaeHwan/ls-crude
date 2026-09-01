# LS CRUDE

**원유 기본 + 오일 슬라이스 한 스품.**

AI �트 4기 팀 프로젝트. 야후파이낸스로 WTI 선물 가격과 인/아웃샘플을 잡고, 인베스팅닷컴 뉴스(RSI·호르무즈·미국 인플레/정책)를 서사로 쓴다. 펜타곤 피자처럼 호가가 아닌 **부엉 열기**를 보는 대안 지표가 Oil Slice다.

작업의 기본 입구는 AI 스킬이다. 대시보드는 그 결과를 보여 주는 면이다.

| 항목 | 내용 |
| --- | --- |
| 기간 | 2026-09-01 ~ 2026-09-15 |
| 발표 | koreaIT 노원 B 강의실 |
| 레포 | 비공개 (오태환 × 손성찬) |
| 가격 | Yahoo Finance `CL=F` |
| 뉴스 | Investing.com CSV (정본), Yahoo news (보조) |

## 팀

| 이름 | GitHub | 역할 |
| --- | --- | --- |
| 오태환 | [@Noah-TaeHwan](https://github.com/Noah-TaeHwan) | 데이터, 피처, 대안지표, 해석, 대시보드 |
| 손성찬 | [@Liam-Son](https://github.com/Liam-Son) | 진입·청산, ML, 백테스트, 성과 |

## 고정 규칙

1. 시세 API는 Yahoo. 인샘플 `2015-01-01`~`2023-12-31`, 아웃샘플 `2024-01-01`~
2. 뉴스 정본은 Investing.com. 사이트를 스크래핑하지 않고 CSV로 넣는다.
3. 기본 오버레이는 RSI(14). 확장 한 스품은 Oil Slice (`2*호르무즈 + 1*인플레/정책`).
4. 아웃샘플은 후보를 고른 뒤 한 번만 열다.

## 에이전트 입구

| 상황 | 스킬 |
| --- | --- |
| 야후 가격 | `.cursor/skills/collecting-yahoo-crude` |
| 인베스팅 뉴스 | `.cursor/skills/tagging-investing-news` |
| Oil Slice | `.cursor/skills/building-slice-index` |
| 인/아웃샘플 | `.cursor/skills/running-sample-splits` |

자세한 설계: [`docs/research-design.md`](docs/research-design.md), [`docs/slice-index.md`](docs/slice-index.md). 맥락: [`docs/context.md`](docs/context.md). 아이디어 메모: [`docs/ideation.md`](docs/ideation.md). 에이전트: [`AGENTS.md`](AGENTS.md)

## 저장소

```text
.cursor/skills/   에이전트 스킬 (메인 워크플로)
docs/             설계·실험 기록
research/         Yahoo · RSI · Slice · 백테스트 (Python)
app/              React Router 대시보드
supabase/         테이블·RLS
```

## 연구

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
pytest
python -m ls_crude.build
```

## 대시보드

```bash
cd app
cp ../.env.example .env
npm install
npm run dev -- --port 5173
```

로더는 Supabase가 있으면 실제 테이블을 읽고, 없으면 `app/public/baseline-snapshot.json`을 읽는다. 뉴스 CRUD는 loader/action으로만 한다.
