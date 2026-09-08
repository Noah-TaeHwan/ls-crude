# 091 — Cushing Field Activity Monitor (CFAM)

공개 월간 야간광과 공식 주간 EIA 쿠싱 재고를 연결하는 재현 랩이다. 모텔·개별 사업체·근로자·차량을 식별하지 않는다.

## 고정된 1차 검정

- **신호**: 쿠싱 도심 5×5 VIIRS 격자의 중앙값에서 고정 농촌 대조점 4개의 중앙값을 뺀 뒤, 월별 계절성을 제거한 이상치. 공개 자료의 `rp2`(2015–17)와 `ops`(2018–23) 처리버전은 원수준으로 이어붙이지 않고, 각 버전 안에서 따로 계절 정규화한다.
- **시점**: 야간광 월합성은 월말 +45일에만 이용 가능하다고 보수적으로 처리.
- **1차 타깃**: 그 뒤 28일의 EIA 쿠싱 재고 순변화와 주간 변화 절대값.
- **IS**: 2015-01~2023-12, Suomi-NPP만. 2024년 이후 NOAA-20 자료는 센서 브리지 전까지 열지 않는다.
- **금지 주장**: 모텔 점유율, 인력 투입, WTI 방향 또는 수익성.

## 실행

`rasterio`는 로컬 환경에만 설치한다. 원본·정제 패널은 Git에 올리지 않고 `research/gathering/raw/` 및 `research/data/processed/`에 남긴다.

```powershell
python research/notebooks/091-cushing-operations-nowcasting/run_cfam.py --end 2023-12
```

실행 영수증은 `research/indexes/091-cushing-operations-nowcasting/<run-id>/`에 기록한다.
