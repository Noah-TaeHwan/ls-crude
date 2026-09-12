# 성찬님 전달 메시지 (2026-09-11, 최신 — 발송하지 않음)

---
태환입니다. 최신 공유 마감했습니다.

1) 연구 공유본: 브랜치 `share/cai-exp-0.1.0`, commit `55ab480` (기존 private 저장소).
   재현 안내 `research/experiments/cai/REPRODUCE_SENS.md` 한 파일에서 시작하시면 됩니다.
   - 민감도 설정: `sens_dmr62.config.json`(62일), `sens_dmr31.config.json`(31일), `sens_dmr0.config.json`(당일·미학습 진단)
   - 참조 결과: `reference/sens_20260911T132949Z`(A_62), `reference/sens_20260911T132951Z`(B_31)
     — provenance의 validity(62/31)로 대응을 확인했습니다.
   - 기존 파일럿 참조 `reference/pilot_20260911T130235Z|130219Z`도 그대로 유지됩니다.
   - 입력 CSV 2종은 **포함되지 않았습니다**(재배포 조건 미확인). 문서의 공식 원출처 취득·정제 절차(경로 B)를 참고해 주세요.

2) 지금 하실 수 있는 것과 나중에 할 것:
   - 지금: 코드·설정·방법 검토(가용일 정렬 규칙, DMR DAILY MX 의미, 반복 사용), 5거래일 중첩 해석 검토.
   - 입력 확보 후: 두 성분 파일럿과 62/31일 run/compare 수치 재현.

3) 회고 실험 요약은 로컬과 최신 Vercel Preview에 반영되어 있습니다
   (Preview: https://ls-crude-git-work-ui-05-s2a-noah-tae-hwan-s-projects.vercel.app).
   현재 공식 지수·다음 기간 예측·운영 전환은 아직 아니며, 성찬님의 Preview 접근과 수치 재현은 **별도 대기**입니다.
   Preview는 현재 접근 보호가 걸려 있어, 필요하시면 공식 Share 방식으로 접근을 맞추겠습니다.

4) 부탁 세 가지: ① 입력 확보 후 최신 파일럿·62/31일 재현 ② DMR 측정 의미·접수일·반복 사용 해석 검토
   ③ 발표 문장이 과장되지 않는지 확인(구간은 원래 거래일 번호 기준, '독립성 증명' 표현은 쓰지 않기).
---

## 2019 보강 검토 요청 (2026-09-12, 초안·미발송)

- 2019년 교통 12개월 보강 전후: train 507→753, 평가는 2023 동일 245행.
- 결과(market 대비 CAI Δlog_loss): equal +0.005668→+0.002401, learned +0.013792→+0.004177 — **여전히 악화, 이득 없음 유지**.
- 부탁: ① 전후 결과와 DAILY MX·가중치 해석 검토 ② 추가 실험(다른 연도 보강 등)이 정말 필요한지 의견.
- 화면: http://127.0.0.1:5173/research#local-status (로컬), /research#experiments (보강 전후 블록) — Preview에는 아직 미반영.
