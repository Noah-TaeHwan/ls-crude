# app

React Router 대시보드입니다. 로더는 Supabase `daily_features` / `news_events`를 읽고, 키가 없으면 `public/baseline-snapshot.json`을 읽습니다. 뉴스는 loader/action으로만 넣고 고칩니다. `/` 는 관측 데스크입니다. 실행 가능한 백테스트 진입점은 아직 없으며, `/backtest`는 로컬 분석 준비·백테스트 인계 안내입니다.

```bash
cd app
npm install
npm run dev -- --port 5173
```

로컬에서 5173을 이미 쓰고 있으면 이 명령을 다시 켜지 마세요. 스키마는 `supabase/migrations/`.
