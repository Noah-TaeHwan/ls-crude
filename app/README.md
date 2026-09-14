# app

React Router로 만든 공개 대시보드입니다. **1차 프로젝트는 2026-09-14 18:00 KST부로 공식 종료했습니다.** [종료 기록·인계 상태](../docs/cai/CLOSEOUT.md)를 먼저 확인하세요.

`/`에서는 실험용 CAI v0.1의 과거 날짜별 값과 Yahoo Finance `CL=F` 가격을, `/research`에서는 자료 탐색·후보 선별·실험·한계의 기록을 확인합니다. CAI는 2023-12-29 기준 43.1점인 회고 지수이며 현재 활동이나 유가 상승 확률이 아닙니다. 지수 표시 데이터는 `app/data/cai-public-view.json`, 시장 관측값은 `public/wti-market-snapshot.json`, 연구용 인샘플은 `public/baseline-snapshot.json`에 둡니다. 웹에서 백테스트를 실행하지 않으며 `/backtest`는 `/research`로 이동합니다.

아래는 보관본을 로컬에서 확인하는 방법입니다. 후속 연구와 운영 정책 변경은 별도 요청에 따릅니다.

```bash
cd app
npm install
npm run dev -- --port 5173
```

5173 포트에 개발 서버가 이미 떠 있으면 그 서버를 그대로 쓰거나 다른 포트를 지정합니다. 스키마는 `supabase/migrations/`에 있습니다.
