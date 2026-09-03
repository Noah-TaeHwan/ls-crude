# LS CRUDE

**원유 기본 + Oil Slice 대안 데이터 후보.**

AI 퀀트 4기 팀 프로젝트입니다. 야후파이낸스에서 WTI 선물(`CL=F`) 가격을 받고 인/아웃샘플을 가릅니다. 인베스팅닷컴 뉴스(RSI·호르무즈·미국 인플레/정책)로 배경을 잡습니다. Oil Slice는 펜타곤 피자 인덱스처럼, 호가가 아니라 **공개 신호**를 보는 대안 지표입니다.

작업은 AI 스킬부터 시작합니다. 대시보드에서 그 결과를 봅니다.

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
2. 뉴스 정본은 Investing.com. 사이트를 스크래핑하지 않고 CSV로 넣습니다.
3. 기본 오버레이는 RSI(14). 확장 대안 데이터 후보는 Oil Slice (`2*호르무즈 + 1*인플레/정책`).
4. 아웃샘플은 후보를 고른 뒤 한 번만 엽니다.

## 에이전트 입구

| 상황 | 스킬 |
| --- | --- |
| 야후 가격 | `.cursor/skills/collecting-yahoo-crude` |
| 인베스팅 뉴스 | `.cursor/skills/tagging-investing-news` |
| Oil Slice | `.cursor/skills/building-slice-index` |
| 인/아웃샘플 | `.cursor/skills/running-sample-splits` |
| 조사 덤프·노트·출처 | `.cursor/skills/gathering-research-intake`, [`research/INTAKE.md`](research/INTAKE.md) |

자세한 설계: [`docs/research-design.md`](docs/research-design.md), [`docs/slice-index.md`](docs/slice-index.md). 수집 흐름: [`docs/research-gathering.md`](docs/research-gathering.md), [`research/INTAKE.md`](research/INTAKE.md). 조사: [`research/notebooks/pizza-hunt.md`](research/notebooks/pizza-hunt.md), [`docs/experiments/`](docs/experiments/README.md). 로컬 분석 준비·백테스트 인계: [`docs/local-backtest.md`](docs/local-backtest.md). 맥락: [`docs/context.md`](docs/context.md). 아이디어 메모: [`docs/ideation.md`](docs/ideation.md). 에이전트: [`AGENTS.md`](AGENTS.md)

## 저장소

```text
.cursor/skills/   에이전트 스킬 (메인 워크플로)
docs/             설계·실험 기록 (승격된 카드는 experiments/)
research/         Yahoo · RSI · Slice · 백테스트 (Python)
research/gathering/  조사 덤프·노트·출처 표
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

로더는 Supabase가 있으면 실제 테이블을 읽고, 없으면 `app/public/baseline-snapshot.json`을 읽습니다. 뉴스는 loader/action으로만 넣고 고칩니다. `/` 는 공개 신호 관측 데스크입니다. 웹과 저장소에는 실행 가능한 백테스트 진입점이 아직 없습니다. 준비·인계 순서: [`docs/local-backtest.md`](docs/local-backtest.md), 화면 안내는 `/backtest`.
