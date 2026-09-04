# 2026-09-04 — 060 CODC 공개자료 수집 시도

## 목적

`BAMLH0A0HYM2` (ICE BofA US High Yield Index Option-Adjusted Spread) 공식 FRED CSV와 사용자가 제공한 `CL=F`를 결합해 060 CODC의 point-in-time IS/OOS 변동성 검정을 시작한다.

## 실제 시도

공식 URL: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2`

| 방법 | 결과 | 조치 |
| --- | --- | --- |
| PowerShell `Invoke-WebRequest` | 서버가 연결을 강제로 종료 | CSV 미저장 |
| `curl --http1.1 -L` | `Recv failure: Connection was reset` | CSV 미저장 |

## 결론

이 환경에서 2026-09-04 현재 공식 FRED 원시 응답을 수집하지 못했다. 난수 데모·스크린샷·다른 시계열을 HY OAS로 대체하지 않았고, 따라서 **IS/OOS 수치·상관·t-stat·R²는 보고하지 않는다.**

## 재개 조건

1. FRED 원시 CSV 또는 재현 가능한 공식 API 응답을 확보한다.
2. 다운로드 시각·URL·해시·관측 범위를 gitignored `gathering/raw/2026-09-04-codc-probe/`에 보관한다.
3. 카드의 point-in-time·거래일·비중첩 RV 사양으로 새 실행을 수행한다.
