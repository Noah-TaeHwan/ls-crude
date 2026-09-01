# LS CRUDE

**전통·대안 데이터 기반 원유 선물 롱숏 전략 연구**

AI 퀀트 4기 팀 프로젝트. 정통 원유·시장 데이터로 WTI 선물 롱·중립·숏 기준모형을 만들고, 대안 데이터 후보를 시험해 예측력과 성과가 실제로 개선되는지 검증합니다.

| 항목 | 내용 |
| --- | --- |
| 기간 | 2026-09-01 ~ 2026-09-15 |
| 발표 | koreaIT 노원 B 강의실 |
| 레포 | 비공개 협업 (오태환 × 손성찬) |

## 팀

| 이름 | GitHub | 역할 |
| --- | --- | --- |
| 오태환 | [@Noah-TaeHwan](https://github.com/Noah-TaeHwan) | 데이터 수집·전처리, Feature Engineering, 대안지표 제안, 성과·피처 해석, 웹 대시보드 |
| 손성찬 | [@Liam-Son](https://github.com/Liam-Son) | 투자전략 설계(진입·청산), ML 구축, 백테스팅, 성과 수치 분석 |

## 목표

1. 정통 데이터 기반 WTI 원유 선물 롱·중립·숏 기준모형 구축
2. 비정형·대안 데이터 후보의 수집·전처리·활용 가능성 시험
3. 기준모형과 대안 데이터 추가모형의 예측력·성과 비교
4. Walk-forward 백테스트로 수익성·위험 검증 (수익률, Sharpe, MDD, 적중률)

## 저장소 구조

```text
docs/          프로젝트 계획·실험 기록
research/      데이터·피처·모델·백테스트 (Python)
app/           전략 분석 웹 대시보드 (React Router)
```

- 연구 파이프라인: [`research/README.md`](research/README.md)
- 대시보드: [`app/README.md`](app/README.md)
- 원본 계획서 정리: [`docs/project-plan.md`](docs/project-plan.md)
- 협업 규칙: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## 빠르게 시작

### 연구 (Python)

```bash
cd research
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

원천 데이터는 `research/data/`에 두고 Git에 올리지 않습니다.

### 대시보드

대시보드는 React Router + TypeScript + shadcn/ui + Supabase로 붙일 예정입니다. 세팅은 `app/`에서 진행합니다.

## 산출물

- 원유 선물 롱숏 전략 분석 웹
- 대안 데이터 실험 기록
- 기준모형 vs 확장모형 비교 결과
