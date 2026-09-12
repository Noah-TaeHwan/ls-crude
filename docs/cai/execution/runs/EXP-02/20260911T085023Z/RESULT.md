# 실행 결과 — EXP-02 (연구 모드 분리·비교 도구·주말 공동 배치 준비)

```yaml
unit_id: EXP-02
status: DONE
executed_at_kst: "2026-09-11 17:45 .. 18:00"
program: cai-exp/0.1.0 (research/src/ls_crude/experiment/)
runs: research/data/processed/091-cai-exp-tw/{20260911T085005Z, 20260911T085007Z, 20260911T085023Z}
final_oos: 잠금·미실행
```

## 1. 연구 모드 분리 (최소 계약 변경, 테스트 포함)

- 스펙에 `mode` 추가(기본 `RETROSPECTIVE_RESEARCH`), `POINT_IN_TIME_FORECAST`는
  모든 입력에 `availability_basis`가 없으면 **설정 검증 단계에서 거부**.
- provenance/export에 `mode`와 해석 문구 기록:
  - 회고: "observation-date aligned retrospective exploration; not a real-time forecast"
  - PIT: "availability basis recorded per input"
- 기존 엄격 검사(라벨 경계 교차 제외, 학습구간 한정 전처리, 누출 온라인 검사,
  OOS 잠금)는 그대로 유지. 테스트 `test_mode_contract_and_point_in_time_gate` 포함
  12/12 통과.

## 2. 비교 도구 (`compare`)

`python -m ls_crude.experiment.cli compare --left <run> --right <run>` — spec_hash·
price_sha·target·eval 창·mode 일치 검사 + 설정별 상태/로그손실 비교 표.
같은 shared config 재실행(캐시 hit)과 비교: **MATCH true** (metrics_match 포함).
타깃 변조 테스트에서 MISMATCH 검출(테스트 포함).

## 3. 주말 공동 배치 (설정 묶음·재현)

config 목록(모두 RETROSPECTIVE_RESEARCH, 결과 확인 전 사전 등록 시각 명기):
- `weekend_shared.config.json` — 양쪽 공통 재현(2설정: 기준선·시장정보)
- `weekend_taehwan.config.json` — 기준선·시장정보·동일가중 CAI(3설정)
- `weekend_seongchan.config.json` — 기준선·동일가중·학습가중 CAI(3설정)

공동 합계 상한 12개 기준: 현재 5개 실행(shared 2 + tw 3), sc 3은 수락 후 실행 → 8/12.
공유 기준: 입력 manifest/hash·타깃(다음 5거래일 상승)·학습/내부검증 구간·성분 순서·
전처리·평가 지표·설정 목록·코드 버전 — 모두 config·provenance에 고정.

## 4. 태환 측 실행 기록 (실측)

| run | config | 설정 | 소요 | 결과 |
| --- | --- | --- | ---: | --- |
| 20260911T085005Z | shared | 2 | 1.9s | baseline acc .5628/ll .6872, market acc .5053/ll .6894 |
| 20260911T085007Z | taehwan | 3 | 2.3s | 위와 동일 + cai_equal **blocked**(적격 컴포넌트 없음) |
| 20260911T085023Z | shared 재실행 | 2 | 즉시 | **캐시 hit**(동일 입력·설정 재계산 없음) |

- 배치 프로세스는 수 초 내 완료 — **주말 내내 실행 중인 작업 없음**. 장기 실행 없음.
- 중단·재개: `run --resume <run_dir>`, 상태 `status --run-dir <run_dir>`, 한도
  `--max-seconds`, 실패 재시도는 `--retry-failed`(1회 한정).

## 5. 한계

- CAI 두 모델은 여전히 blocked: TMAS 공개시각 규칙 미확정, LAUE 약관 미확인.
- 2023 한 해 교통 데이터만으로 기존 전체 학습·검증 구간(2015–2023)을 재현했다고
  주장하지 않음. 단일 성분이어도 가중치 학습은 강제하지 않음(코드·테스트로 고정).
- 로컬 검사 PASS는 원격 CI PASS가 아님(GitHub Actions는 결제/한도로 job 미시작).
