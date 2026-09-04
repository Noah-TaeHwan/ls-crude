# app

React Router로 만든 공개 대시보드입니다. `/`에서는 Yahoo Finance `CL=F`의 최근 완료 일봉으로 WTI 실현변동성을 보여주고 `/research`에서는 공개 신호 후보 51개의 검증 기록을 확인할 수 있습니다. 시장 관측값은 `public/wti-market-snapshot.json`, 연구용 인샘플은 `public/baseline-snapshot.json`에 따로 둡니다. 웹에서는 백테스트를 실행하지 않으며 `/backtest`는 `/research`로 이동합니다.

```bash
cd app
npm install
npm run dev -- --port 5173
```

5173 포트에 개발 서버가 이미 떠 있으면 그 서버를 그대로 쓰거나 다른 포트를 지정합니다. 스키마는 `supabase/migrations/`에 있습니다.
