# LS CRUDE

**WTI 변동성을 관측하고 먼저 움직일 수 있는 공개 신호를 검증합니다.**

LS CRUDE는 Yahoo Finance의 WTI 연속선물(`CL=F`) 일봉으로 최근 실현변동성을 보여주는 AI 퀀트 4기 팀 프로젝트입니다. 펜타곤 피자 인덱스에서 착안해 주문, 공시, 물류, 기상처럼 먼저 드러날 수 있는 공개 흔적을 조사합니다. 유가 방향을 맞히는 프로젝트가 아니며 관계가 없거나 가설이 틀린 결과도 연구 장부에 남깁니다.

| 항목 | 내용 |
| --- | --- |
| 기간 | 2026-09-01 ~ 2026-09-15 |
| 발표 | koreaIT 노원 B 강의실 |
| 레포 | 비공개 (오태환 × 손성찬) |
| 공개 데모 | [ls-crude.vercel.app](https://ls-crude.vercel.app) · Supabase 환경변수 없는 읽기 전용 스냅샷 |
| 가격 | Yahoo Finance `CL=F` |
| 연구 뉴스 | Investing.com CSV (정본), Yahoo news (보조) |
| 시장 관측 | 최근 완료 일봉의 5일·20일 연환산 실현변동성 |
| 연구 장부 | 후보 46개 · 통과 0개 |

## 팀

| 이름 | GitHub | 역할 |
| --- | --- | --- |
| 오태환 | [@Noah-TaeHwan](https://github.com/Noah-TaeHwan) | 데이터, 피처, 대안지표, 해석, 대시보드 |
| 손성찬 | [@Liam-Son](https://github.com/Liam-Son) | 진입·청산, ML, 백테스트, 성과 |

## 고정 규칙

1. 가격은 Yahoo Finance `CL=F`만 프로그램으로 받습니다.
2. 메인 게이지는 최근 5거래일 실현변동성의 `2015-01-01`~`2023-12-31` 분포 백분위입니다.
3. RSI(14)와 Oil Slice (`2*호르무즈 + 1*인플레/정책`)는 연구 후보로만 다룹니다. 검증 전 값은 WTI 변동성 게이지에 섞지 않습니다.
4. 연구 뉴스의 정본은 Investing.com CSV입니다. 사이트를 스크래핑하지 않습니다.
5. 인샘플에서 규칙을 동결한 뒤 아웃샘플을 한 번만 확인합니다. 이미 확인한 2024–2026 구간은 다시 튜닝에 쓰지 않습니다.

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
research/         Yahoo · 변동성 · 대안 신호 검증 (Python)
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
python -m ls_crude.market_snapshot
python -m ls_crude.build
```

## 대시보드

```bash
cd app
cp ../.env.example .env
npm install
npm run dev -- --port 5173
```

`/`에서는 `app/public/wti-market-snapshot.json`에 담긴 최근 완료 일봉으로 WTI 변동성을 보여줍니다. `/research`에는 공개 신호 후보 46개와 현재 판정을 공개합니다. 연구용 인샘플 데이터는 `app/public/baseline-snapshot.json`에 따로 둡니다. 웹에서는 백테스트를 실행하지 않으며 `/backtest`는 `/research`로 이동합니다. 로컬 분석 절차는 [`docs/local-backtest.md`](docs/local-backtest.md)에 있습니다.

`CL=F`는 현물이 아닌 연속선물이라 만기 교체 때 생기는 롤 갭을 포함할 수 있습니다. 이 프로젝트는 투자 권유가 아닙니다.
