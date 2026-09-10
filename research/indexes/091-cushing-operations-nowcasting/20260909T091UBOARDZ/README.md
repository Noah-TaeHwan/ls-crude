# 091-U — Dated job events gate (2026-09-09, fail closed)

**판정: 날짜 있는 행 없음. 이벤트 로그를 동결하지 않았다.**

## 감사한 원천 (전부 in-repo 동결분)

- `research/indexes/091-cushing-operations-nowcasting/20260908T091UZ/091u_public_snapshot_2026-09-08.csv` — 1회성 공개 적격 감사, 4행.
- `research/indexes/091-cushing-operations-nowcasting/20260908T091UZ/README.md` — "displayed posting ages are not publication archives", "not yet a weekly time-series value".
- `research/gathering/sources/REGISTRY.md`의 `Plains·ONEOK·Enterprise·South Bow public career pages` 행 — "보이는 공고 시간은 실제 게시일이 아닐 수 있음".
- `research/indexes/091-cushing-operations-nowcasting/20260908T091INSZ/091m_city_open_positions_snapshot.csv` — 날짜 없음.

## 날짜가 없는 이유

1. 4행의 `observed_at_kst`는 모두 같은 감사 시각(`2026-09-08T00:00:00+09:00`)이다. 공고별 사건일이 아니다.
2. `posting_age_label`(`6 days`, `1 month`, `23 hours`, `1 day`)은 상대 표시 문구다. 여기서 날짜를 역산하면 날짜를 지어 내는 것이 되므로 금지된다.
3. 90일 파일럿이 시작되지 않아 고정 관측망의 주간 스냅샷이 0회다. 최소 12회 요건을 충족하지 않는다.
4. 채용 목록 존재는 현장 투입(crew-on-site)이 아니다. 단일 단면에 날짜를 붙이면 바쁨 증거처럼 오독된다.

## 동결하지 않은 것

- `events.json`을 만들지 않았다. 빈 배열도 만들지 않았다. 결측을 0건으로 읽히는 일을 막기 위해서다.
- `app/app/lib/cushing-jobs.ts`와 `app/tests/cushing-jobs.test.mjs`를 만들지 않았다. 날짜 있는 행이 생기기 전에는 리더가 읽을 것이 없다.

## 다음 게이트

고정 주간 관측(목 01:00 KST)이 12회 쌓이고 각 행에 `observed_at_ct`가 찍히면 이 게이트를 다시 연다. 그 전까지 091-U는 보드 밖 연구 원장에만 둔다.
