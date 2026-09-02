# app

React Router 대시보드입니다. 로더는 Supabase `daily_features` / `news_events`를 읽고, 키가 없으면 `public/baseline-snapshot.json`을 읽습니다. 뉴스는 loader/action으로만 넣고 고칩니다. `/backtest`는 시드·테스트 CSV·식과 잠긴 아웃샘플 자리입니다. `?sample=1`로 칸 모양만 채웁니다. 샘플은 실험 기록에 남기지 않습니다.

```bash
cd app
npm install
npm run dev -- --port 5173
```

로컬에서 5173을 이미 쓰고 있으면 이 명령을 다시 켜지 마세요. 스키마는 `supabase/migrations/`.
