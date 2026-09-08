# 091 — 실제 공개 관측값 표본

아래는 합성값이 아니라 2026-09-08에 수집한 공개 원시자료에서 읽은 값이다. 전 세계 야간광 COG 전체나 EIA 원시 응답은 재배포하지 않고, 재현에 필요한 URL·수집 manifest·작은 확인 표본만 남긴다.

## 1) 쿠싱 도심권 월간 야간광

단위는 VIIRS radiance의 5×5 격자 **중앙값**이다. `도심-대조 로그`는 `log(1 + 도심) - log(1 + 농촌 대조 중앙값)`이다. 이는 모텔 조명·객실점유율이 아니라 도시권 활동의 매우 거친 관측치다.

| 관측월 | 쿠싱 도심 | 농촌 대조 | 도심-대조 로그 | 실제 COG |
| --- | ---: | ---: | ---: | --- |
| 2023-01 | 24.87 | 0.73 | 2.708 | [COG](https://globalnightlight.s3.amazonaws.com/composites/npp_202301_ops/DNB_npp_20230101-20230131_global_ecm-slcorr_v10_ops.avg_rade9.tif) |
| 2023-02 | 18.16 | 0.66 | 2.446 | [COG](https://globalnightlight.s3.amazonaws.com/composites/npp_202302_ops/DNB_npp_20230201-20230228_global_ecm-slcorr_v10_ops.avg_rade9.tif) |
| 2023-03 | 30.14 | 0.72 | 2.896 | [COG](https://globalnightlight.s3.amazonaws.com/composites/npp_202303_ops/DNB_npp_20230301-20230331_global_ecm-slcorr_v10_ops.avg_rade9.tif) |
| 2023-04 | 26.96 | 0.75 | 2.771 | [COG](https://globalnightlight.s3.amazonaws.com/composites/npp_202304_ops/DNB_npp_20230401-20230430_global_ecm-slcorr_v10_ops.avg_rade9.tif) |
| 2023-05 | 19.29 | 0.91 | 2.360 | [COG](https://globalnightlight.s3.amazonaws.com/composites/npp_202305_ops/DNB_npp_20230501-20230531_global_ecm-slcorr_v10_ops.avg_rade9.tif) |
| 2023-06 | 23.67 | 0.87 | 2.582 | [COG](https://globalnightlight.s3.amazonaws.com/composites/npp_202306_ops/DNB_npp_20230601-20230630_global_ecm-slcorr_v10_ops.avg_rade9.tif) |

## 2) 공식 EIA 쿠싱 재고 확인 표본

단위는 천 배럴(kbbl)이며, [공식 EIA 이력표](https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=W_EPC0_SAX_YCUOK_MBBL)의 값이다.

| 주 종료일 | 쿠싱 재고 (kbbl) | 전주 대비 (kbbl) |
| --- | ---: | ---: |
| 2023-03-03 | 39,828 | -890 |
| 2023-03-10 | 37,912 | -1,916 |
| 2023-03-17 | 36,849 | -1,063 |
| 2023-03-24 | 35,217 | -1,632 |
| 2023-03-31 | 34,247 | -970 |
| 2023-04-07 | 33,838 | -409 |
| 2023-04-14 | 32,750 | -1,088 |
| 2023-04-21 | 33,069 | +319 |
| 2023-04-28 | 33,610 | +541 |

## 재현·한계

- 전체 2015-01~2023-12 표본은 [`CFAM 실행 영수증`](../../indexes/091-cushing-operations-nowcasting/20260908T110000Z/README.md)과 수집 manifest에서 재현한다.
- 야간광 월합성은 월말 +45일에야 쓸 수 있다고 보수적으로 가정했다. 따라서 위 표의 2023-03 광도는 2023-05-15 이후에만 분석 입력으로 허용된다.
- 이 실제 관측값들은 유효한 ‘쿠싱이 바쁘냐’의 **관찰 대리값**이지만, 재고 예측력은 검증에서 나오지 않았다.
