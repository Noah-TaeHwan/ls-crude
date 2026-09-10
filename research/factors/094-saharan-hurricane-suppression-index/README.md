# 094 — Saharan Hurricane Suppression Index (SHSI)

**상태:** PARK / E1 — Stage 0 storms + Stage 1 AERONET Capo Verde proxy FAIL (r≈0). Registered MERRA MDR still unopened.  
**후보:** [ALT-20260909-01](../../candidates/ALT-20260909-01.md)  
**가중치:** 0.0

우리는 아프리카 흙으로 원유를 예측하지 않는다. 걸프 공급 리스크 프리미엄이 스톰 **앞단** 대기 정보로 과대·과소 가격되고 있는지를 본다.

```text
Saharan Dust → Atlantic Hurricane Risk → Gulf Oil Disruption Risk
```

먼지 → WTI 직행은 1차 검정이 아니다. Stage 1이 죽으면 팩터는 죽는다.

## 정의 (사전 등록)

고정 상자: 10°N–25°N, 20°W–60°W.

- `Dust_t = mean(DUEXTTAU_MDR,t)` — MERRA-2 550 nm dust extinction AOD
- `DustShock_t = (Dust_t − μ_DOY) / σ_DOY`
- `SHSI_t = z(DustAOD_t)` 단순판. DOY 보정 없는 raw AOD를 알파로 쓰지 않음
- `HSS_t = DustShock_t × HurricaneBackgroundRisk_t` — 배경 리스크는 SST·전단·습도·AEW가 우호적일 때만. Stage 1 통과 전 가중치 금지
- `GHR_t = f(−Dust, SST, −Shear, Humidity, StormPresence, GulfTrackProbability)` — 나중

쓰지 않는 필드: `DUAERIDX` (NASA 알려진 이슈).

시즌 창만: 6월 1일–11월 30일.

## 단계

| Stage | 질문 | 죽이는 관찰 |
| --- | --- | --- |
| 1 | DustShock가 형성 t+1..+7, 강화 ΔVmax t+1..+3을 낮추는가 | 계절·날씨 통제 후 관계 없음 → KILL |
| 2 | 걸프 진입·BSEE 셧인·EIA 정제투입이 움직이는가 | 스톰은 늘지만 차질이 없으면 PARK |
| 3 | RB−CL, HO−CL, WTI M1−M2 | Stage 1–2 실패 시 실행하지 않음. CL 방향은 부차 |

걸프 허리케인은 동시에 해상 생산↓(원유 강세)와 정제↓(원유 약세·제품 강세)를 만든다. 타깃 우선순위는 크랙·캘린더가 CL보다 앞이다.

## 분할

아이디어 메모가 Ida/Laura/Delta/Harvey를 인용했다. 그 사례 연도는 새 OOS 인증으로 쓰지 않는다.

계획 초안: discovery 1986–2005, validation 2006–2015, OOS 2016–2021, final 2022–2026은 **열람됨**. 프로젝트 공통 규칙(선택 2015–2023, 2024+ 한 번)과 맞출 때 discovery 경계를 카드에 다시 적는다.

## 무료 경로 (미수집)

| 변수 | 출처 |
| --- | --- |
| Saharan dust AOD | NASA MERRA-2 DUEXTTAU |
| 스톰 위치·풍속 | NOAA HURDAT2 |
| SST·전단 | NOAA / NCEP |
| 걸프 생산·셧인 | EIA, BSEE |
| 정제투입·재고 | EIA |
| CL, RB, HO | 프로젝트 시장 정본 |

## 다음

Earthdata로 MDR 상자 일별 DUEXTTAU 한 시즌과 같은 창 HURDAT2 형성 사건을 맞춰 Stage 1만 돌릴 수 있는지 확인한다. 대시보드·0–100·CL 결합은 그 전 금지.

## Visualization status (2026-09-09)

No chart this pass. DustAOD grid was not downloaded. Drawing a fake SAL map would violate the card.

See [STAGE0.md](STAGE0.md) (20260910T094S0Z).

See [STAGE1_PROXY.md](STAGE1_PROXY.md).
