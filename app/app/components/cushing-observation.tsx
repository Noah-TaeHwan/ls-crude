import { useState } from "react";
import { Link } from "react-router";
import { ResearchChart } from "~/components/research-chart";
import { readCushingAadt, readCushingBps, readCushingDeq, readCushingMonthlyStocks, readCushingStocks } from "~/lib/cushing-context";
import { datedCushingEvents, readCushingNews } from "~/lib/cushing-news";
import { readPayneQcew } from "~/lib/cushing-qcew";
import { readPayneQcewQuarterly } from "~/lib/cushing-qcew-quarterly";
import { readCushingEnrollment } from "~/lib/cushing-enrollment";
import { readKushMonthly } from "~/lib/cushing-kush";
import { readKcuhDaily } from "~/lib/cushing-kcuh";
import { readMesonetDaily } from "~/lib/cushing-mesonet";
import { readMesonetSoilDaily } from "~/lib/cushing-mesonet-soil";
import { readMesonetHumidityDaily } from "~/lib/cushing-mesonet-humidity";
import { readMesonetWindDaily } from "~/lib/cushing-mesonet-wind";
import { readMesonetPressureDaily } from "~/lib/cushing-mesonet-pressure";
import { readCushingPopulation } from "~/lib/cushing-population";
import { readPayneCountyHousing } from "~/lib/cushing-county-housing";
import { readPayneCountyComponents } from "~/lib/cushing-pep-components";
import { readPayneCountyIncome } from "~/lib/cushing-bea-income";
import { readCushingVoc } from "~/lib/cushing-voc";
import { readCushingTri } from "~/lib/cushing-tri";
import { readCushingGhg } from "~/lib/cushing-ghg";
import { readCushingFra } from "~/lib/cushing-fra";
import { readCushingNhtsa } from "~/lib/cushing-nhtsa";
import { readCushingOsha } from "~/lib/cushing-osha";
import { readCushingAqs } from "~/lib/cushing-aqs";
import { readCushingEcho } from "~/lib/cushing-echo";
import { readCushingEchoCwa } from "~/lib/cushing-echo-cwa";
import { readCushingEchoDmr } from "~/lib/cushing-echo-dmr";
import { readCushingRcra } from "~/lib/cushing-rcra";
import { readCushingPhmsa } from "~/lib/cushing-phmsa";
import { readPayneLausMonthly } from "~/lib/cushing-laus";
import { readPayneLausEmployedMonthly } from "~/lib/cushing-laus-employed";
import { readPayneLausLaborForceMonthly } from "~/lib/cushing-laus-labor-force";
import { readCushingWorkingStorage } from "~/lib/cushing-working-storage";
import { readCushingPrecipMonthly } from "~/lib/cushing-precip";
import { readCushingSalesTax } from "~/lib/cushing-sales-tax";
import { readCushingStorm } from "~/lib/cushing-storm";
import { readCushingUsgsDaily } from "~/lib/cushing-usgs";
import { readCushingUsgsGwDaily } from "~/lib/cushing-usgs-gw";
import { readCushingFema } from "~/lib/cushing-fema";
import { readCushingNfip } from "~/lib/cushing-nfip";
import { readCushingNfipPolicies } from "~/lib/cushing-nfip-policies";
import { readCushingSdwis } from "~/lib/cushing-sdwis";
import { readCushingIrsSoi } from "~/lib/cushing-irs-soi";
import { readCushingNbi } from "~/lib/cushing-nbi";
import { readPayneLodesAnnual } from "~/lib/cushing-lodes";
import { readPayneDroughtWeekly } from "~/lib/cushing-drought";
import { readCushingWqp } from "~/lib/cushing-wqp";
import type { CushingWeatherView } from "~/lib/cushing-weather";
import eiaCsv from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091EIAZ/cushing_stocks_weekly.csv?raw";
import eiaMonthlyCsv from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091EIAMZ/cushing_stocks_monthly.csv?raw";
import bpsCsv from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091BOARDZ/bps-cushing-monthly.csv?raw";
import aadtInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091BOARDZ/aadt-east-main.json";
import deqInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091BOARDZ/deq-events.json";
import qcewInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWZ/payne_qcew_2025q1.json";
import qcewQuarterlyInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091QCEWQZ/payne_qcew_quarterly.json";
import enrollInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091PENRZ/cushing_hs_enrollment.json";
import kushInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091KUSHZ/kush_operational_attention_monthly.json";
import kcuhInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091KCUHZ/kcuh_daily_weather.json";
import mesonetInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091MESOZ/mesonet_oilt_daily.json";
import soilInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091SOILZ/mesonet_oilt_soil_daily.json";
import humidityInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091HUMZ/mesonet_oilt_humidity_daily.json";
import windInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091WSPDZ/mesonet_oilt_wind_daily.json";
import pressureInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091PRESZ/mesonet_oilt_pressure_daily.json";
import popInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091POPZ/cushing_city_population_annual.json";
import housingInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091HUCZ/payne_county_housing_units_annual.json";
import pepInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091COCZ/payne_county_population_components_annual.json";
import incomeInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091INCZ/payne_county_personal_income_annual.json";
import vocInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091VOCYZ/cushing_terminal_voc_annual.json";
import triInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091TRIZ/cushing_city_tri_onsite_annual.json";
import ghgInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091GHGZ/cushing_city_ghg_annual.json";
import fraInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091FRAZ/cushing_fra_incidents.json";
import nhtsaInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091NHTSAZ/cushing_nhtsa_crashes.json";
import oshaInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091OSHAZ/cushing_osha_inspections.json";
import aqsInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091AQSZ/payne_pm25_stillwater_annual.json";
import echoInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091ECHOZ/cushing_echo_air_inspections.json";
import echoCwaInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091CWAZ/cushing_echo_cwa_inspections.json";
import dmrInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091DMRZ/cushing_echo_dmr_flow.json";
import rcraInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091RCRAZ/cushing_rcra_handlers.json";
import phmsaInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091PHMSAZ/cushing_phmsa_incidents.json";
import lausInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091LAUSZ/payne_laus_monthly.json";
import lausEmployedInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091LAUEZ/payne_laus_employed_monthly.json";
import laufInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091LAUFZ/payne_laus_labor_force_monthly.json";
import capInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091CAPZ/cushing_working_storage_capacity.json";
import precipInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091PRCPZ/cushing_precip_monthly.json";
import staxInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091STAXZ/cushing_city_sales_tax_monthly.json";
import stormInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091STMZ/cushing_storm_events.json";
import usgsInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091USGSZ/cushing_streamflow_daily.json";
import gwInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091GWZ/cushing_groundwater_daily.json";
import femaInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091FEMAZ/cushing_fema_declarations.json";
import nfipInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091NFIPZ/cushing_nfip_claims.json";
import nfppInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091NFPPZ/cushing_nfip_policies.json";
import sdwisInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091SDWISZ/cushing_sdwis_violations.json";
import soiInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091SOIZ/zip_74023_income_tax_annual.json";
import nbiInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091NBIZ/cushing_nbi_bridges.json";
import lodesInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091LODEZ/payne_lodes_annual.json";
import droughtInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091DRTZ/payne_drought_weekly.json";
import wqpInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260910T091WQPZ/cushing_wqp_ph.json";
import newsInput from "../../../research/indexes/091-cushing-operations-nowcasting/20260909T091ZBOARDZ/events.json";

/** 고정 EIA 주간 재고. 검증 실패는 결측. */
const STOCKS = readCushingStocks(eiaCsv);
/** 고정 EIA 월간 재고. 주간 표와 섞지 않는다. */
const MONTHLY = readCushingMonthlyStocks(eiaMonthlyCsv);
/** 고정 East Main 연간 AADT. */
const AADT = readCushingAadt(aadtInput);
/** 고정 BPS 주거 허가 호수. */
const BPS = readCushingBps(bpsCsv);
/** 고정 DEQ 공개 검토 사건. */
const DEQ = readCushingDeq(deqInput);
/** 고정 Payne County QCEW. Cushing 시 고용이 아니다. */
const QCEW = readPayneQcew(qcewInput);
/** 고정 Payne County QCEW 분기 시계열. */
const QCEW_Q = readPayneQcewQuarterly(qcewQuarterlyInput);
/** 고정 Cushing High School 연간 재적. 2023-24는 결측이며 0으로 채우지 않는다. */
const ENROLL = readCushingEnrollment(enrollInput);
/** 고정 KUSH 월간 운영-관심. 0은 관측된 값이며 결측이 아니다. */
const KUSH = readKushMonthly(kushInput);
/** 고정 KCUH 일별 공항 기온. 교란변수이며 바쁨이 아니다. 결측은 null이며 0으로 채우지 않는다. */
const KCUH = readKcuhDaily(kcuhInput);
/** 고정 Mesonet OILT 일별 최고기온. 쿠싱에서 24.3 km 떨어진 Oilton 관측이며 KCUH 공항 기온이 아니고 바쁨이 아니다. 결측은 null이며 0으로 채우지 않는다. */
const MESO = readMesonetDaily(mesonetInput);
/** MESO 공개 행만 그린 순서. 110일 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const MESO_ROWS = MESO ? MESO.rows.filter((row) => row.tmaxF !== null) : null;
/** MESO 강수 공개 행만 그린 순서. 127일 결측은 점을 찍지 않으며 0으로 채우지 않고, 관측된 건조 0.00은 그대로 둔다. */
const MESO_RAIN_ROWS = MESO ? MESO.rows.filter((row) => row.rainIn !== null) : null;
/** 고정 Mesonet OILT 일별 토양온도. 쿠싱에서 24.3 km 떨어진 Oilton 10cm 잔디 밑 지온이며 공기 최고기온·강수가 아니고 바쁨이 아니다. 결측은 null이며 0으로 채우지 않는다. */
const SOIL = readMesonetSoilDaily(soilInput);
/** SOIL 공개 행만 그린 순서. 188일 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const SOIL_ROWS = SOIL ? SOIL.rows.filter((row) => row.savgF !== null) : null;
/** 고정 Mesonet OILT 일별 평균상대습도. 쿠싱에서 24.3 km 떨어진 Oilton 일평균 상대습도이며 공기 최고기온·강수·지온이 아니고 바쁨이 아니다. 결측은 null이며 0으로 채우지 않는다. */
const HUM = readMesonetHumidityDaily(humidityInput);
/** HUM 공개 행만 그린 순서. 114일 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const HUM_ROWS = HUM ? HUM.rows.filter((row) => row.havgPct !== null) : null;
/** 고정 Mesonet OILT 일별 평균풍속. 쿠싱에서 24.3 km 떨어진 Oilton 일평균 풍속이며 공기 최고기온·강수·지온·습도가 아니고 바쁨이 아니다. 결측은 null이며 0으로 채우지 않는다. */
const WIND = readMesonetWindDaily(windInput);
/** WIND 공개 행만 그린 순서. 272일 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const WIND_ROWS = WIND ? WIND.rows.filter((row) => row.wspdMph !== null) : null;
/** 고정 Mesonet OILT 일별 평균기압. 쿠싱에서 24.3 km 떨어진 Oilton 일평균 정지기압이며 공기 최고기온·강수·지온·습도·풍속이 아니고 바쁨이 아니다. 결측은 null이며 0으로 채우지 않는다. */
const PRES = readMesonetPressureDaily(pressureInput);
/** PRES 공개 행만 그린 순서. 104일 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const PRES_ROWS = PRES ? PRES.rows.filter((row) => row.pavgInhg !== null) : null;
/** 고정 쿠싱 시 연간 인구. 도시 규모이며 현장 바쁨이 아니다. 2020 단차는 빈티지 교체이며 0으로 채우지 않는다. */
const POP = readCushingPopulation(popInput);
/** 고정 Payne County 연간 Census 주택 호수. 카운티 주택 재고이지 쿠싱 시가 아니고 허가 건수가 아니며 바쁨이 아니다. 2019→2020은 빈티지 단절이며 메우지 않는다. */
const HOUSING = readPayneCountyHousing(housingInput);
/** 고정 Payne County 연간 Census PEP 인구. 카운티 인구 통계이지 쿠싱 시·주택 호수·현장 바쁨이 아니다. 2019→2020은 빈티지 단절이며 메우지 않는다. */
const PEP = readPayneCountyComponents(pepInput);
/** 고정 Payne County 연간 BEA CAINC1 개인소득. 카운티 소득이지 쿠싱 시 소득·인구·1인당이 아니고 바쁨이 아니다. 단위는 파일 그대로 천 달러이며 달러로 바꾸지 않는다. */
const INCOME = readPayneCountyIncome(incomeInput);
/** 고정 쿠싱 시 터미널 연간 VOC. 대기 질 지수가 아니고 바쁨이 아니다. 2024는 기존 091-WENVZ와 같다. */
const VOC = readCushingVoc(vocInput);
/** 고정 쿠싱 시 연간 TRI 현장 배출. 독성 배출 신고이지 바쁨이 아니다. 2004–2023은 결측이며 0으로 채우지 않는다. */
const TRI = readCushingTri(triInput);
/** 고정 쿠싱 시 EPA GHGRP 연간 CO2e. 시설 배출 기록이지 TRI 파운드·VOC 톤·바쁨이 아니다. 행이 없는 해는 0으로 채우지 않는다. */
const GHG = readCushingGhg(ghgInput);
/** 고정 FRA 쿠싱 철도건널목 사고 날짜 목록. 처리량·PHMSA·바쁨·WTI가 아니다. */
const FRA = readCushingFra(fraInput);
/** 고정 FMCSA 쿠싱 시 신고 상용차 사고 날짜 목록. FARS 사망자·전체 사고·바쁨·WTI·AADT가 아니다. */
const NHTSA = readCushingNhtsa(nhtsaInput);
/** 고정 쿠싱 시 ZIP 74023 OSHA 점검 날짜 목록. 고용·벌금·바쁨·WTI가 아니다. */
const OSHA = readCushingOsha(oshaInput);
/** 고정 Payne County Stillwater 모니터 연간 PM2.5. 주변 대기 교란변수이며 쿠싱 시 대기가 아니고 VOC·TRI·바쁨이 아니다. 2004년 이후는 모니터가 없어 0으로 채우지 않는다. */
const AQS = readCushingAqs(aqsInput);
/** 고정 쿠싱 시 EPA ECHO 대기 시설 최근 FCE 날짜 목록. TRI·VOC·바쁨·WTI·주 전체가 아니다. */
const ECHO = readCushingEcho(echoInput);
/** 고정 쿠싱 시 EPA ECHO 수질(NPDES) 시설 최근 점검 날짜 목록. 대기 FCE·TRI·VOC·바쁨·WTI·주 전체가 아니다. */
const ECHO_CWA = readCushingEchoCwa(echoCwaInput);
/** 고정 쿠싱 시 EPA ECHO DMR 유량 신고 날짜 목록. 방류 기록이지 점검 횟수·대기 FCE·바쁨·WTI·주 전체가 아니다. MGD와 gal/d를 한 축에 더하지 않는다. */
const DMR = readCushingEchoDmr(dmrInput);
/** 고정 쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 날짜 목록. 폐기물 기록이지 TRI 파운드·대기 FCE·수질 점검·바쁨·WTI·주 전체가 아니다. */
const RCRA = readCushingRcra(rcraInput);
/** 고정 PHMSA 쿠싱 위험액체 사고 날짜 목록. 처리량·바쁨·WTI가 아니다. */
const PHMSA = readCushingPhmsa(phmsaInput);
/** 고정 Payne County 월간 LAUS 실업률. 카운티 노동시장이지 쿠싱 시·QCEW 고용·바쁨이 아니다. 2025-10은 BLS 미공개 결측이며 0으로 채우지 않는다. */
const LAUS = readPayneLausMonthly(lausInput);
/** LAUS 공개 행만 그린 순서. 2025-10 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const LAUS_ROWS = LAUS ? LAUS.rows.filter((row) => row.unemployment_rate !== null) : null;
/** 고정 Payne County 월간 LAUS 취업자 수. 카운티 인원수이지 실업률·쿠싱 시·바쁨이 아니다. 2025-10은 BLS 미공개 결측이며 0으로 채우지 않는다. */
const LAUE = readPayneLausEmployedMonthly(lausEmployedInput);
/** LAUE 공개 행만 그린 순서. 2025-10 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const LAUE_ROWS = LAUE ? LAUE.rows.filter((row) => row.employed !== null) : null;
/** 고정 Payne County 월간 LAUS 경제활동인구. 카운티 인원수이지 실업률·취업자 수·쿠싱 시·바쁨이 아니다. 2025-10은 BLS 미공개 결측이며 0으로 채우지 않는다. */
const LAUF = readPayneLausLaborForceMonthly(laufInput);
/** LAUF 공개 행만 그린 순서. 2025-10 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const LAUF_ROWS = LAUF ? LAUF.rows.filter((row) => row.labor_force !== null) : null;
/** 고정 쿠싱 시 GHCN 월간 강수량. 교란변수이며 공항 기온·바쁨이 아니다. 부분월은 결측이며 0으로 채우지 않는다. 2021-09 = 0.000은 관측된 건조다. */
const PRCP = readCushingPrecipMonthly(precipInput);
/** PRCP 공개 행만 그린 순서. 8개 부분월 결측은 점을 찍지 않으며 0으로 채우지 않는다. */
const PRCP_ROWS = PRCP ? PRCP.rows.filter((row) => row.precipIn !== null) : null;
/** 고정 쿠싱 시 OTC 월간 판매세 분배액. 호텔세가 아니고 바쁨이 아니다. 공개된 4개월만 그리며 사이 빈 달을 채우지 않는다. */
const STAX = readCushingSalesTax(staxInput);
/** 고정 쿠싱 허브 EIA 탱크 작업 저장 용량. 재고가 아니고 바쁨이 아니다. 보고는 2024-03 이후 중단이며 이후 점을 지어 내지 않는다. */
const CAP = readCushingWorkingStorage(capInput);
/** PHMSA incidentDate 연도별 건수. 범위 안 연도에 행이 없으면 관측된 0이며 결측 메우기가 아니다. */
const PHMSA_YEARS = (() => {
  if (!PHMSA) return null;
  const counts = new Map<number, number>();
  for (const row of PHMSA.rows) {
    const year = Number(row.incidentDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  const years = [...counts.keys()].sort((a, b) => a - b);
  const first = years[0];
  const last = years[years.length - 1];
  const out: Array<{ year: number; count: number }> = [];
  for (let year = first; year <= last; year++) out.push({ year, count: counts.get(year) ?? 0 });
  return out;
})();
/** FRA incidentDate 연도별 건수. 공개 행이 있는 연도만 두며 1983년 이후를 0으로 채우지 않는다. */
const FRA_YEARS = (() => {
  if (!FRA) return null;
  const counts = new Map<number, number>();
  for (const row of FRA.rows) {
    const year = Number(row.incidentDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** NHTSA crashDate 연도별 건수. 공개 행이 있는 연도만 두며 행이 없는 해를 0으로 채우지 않는다. */
const NHTSA_YEARS = (() => {
  if (!NHTSA) return null;
  const counts = new Map<number, number>();
  for (const row of NHTSA.rows) {
    const year = Number(row.crashDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** OSHA inspectionDate 연도별 건수. 공개 행이 있는 연도만 두며 행이 없는 해를 0으로 채우지 않는다. */
const OSHA_YEARS = (() => {
  if (!OSHA) return null;
  const counts = new Map<number, number>();
  for (const row of OSHA.rows) {
    const year = Number(row.inspectionDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** ECHO inspectionDate(최근 FCE) 연도별 건수. 날짜 있는 행이 있는 연도만 두며 날짜 없는 15곳은 그리지 않고 행이 없는 해를 0으로 채우지 않는다. */
const ECHO_YEARS = (() => {
  if (!ECHO) return null;
  const counts = new Map<number, number>();
  for (const row of ECHO.rows) {
    if (row.inspectionDate === null) continue;
    const year = Number(row.inspectionDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** ECHO CWA lastInspectionDate(최근 점검) 연도별 건수. 날짜 있는 행이 있는 연도만 두며 날짜 없는 14곳은 그리지 않고 행이 없는 해는 0으로 채우지 않는다. */
const ECHO_CWA_YEARS = (() => {
  if (!ECHO_CWA) return null;
  const counts = new Map<number, number>();
  for (const row of ECHO_CWA.rows) {
    if (row.lastInspectionDate === null) continue;
    const year = Number(row.lastInspectionDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** DMR monitoringPeriodEnd 월별 신고 행 건수. 날짜 있는 달만 두며 행이 없는 달을 0으로 채우지 않는다. NODI 무방류 행은 건수에 들어가며 0 유량으로 바꾸지 않는다. */
const DMR_MONTHS = (() => {
  if (!DMR) return null;
  const counts = new Map<string, number>();
  for (const row of DMR.rows) {
    const period = row.monitoringPeriodEnd.slice(0, 7);
    counts.set(period, (counts.get(period) ?? 0) + 1);
  }
  return [...counts.keys()].sort().map((period) => ({ period, count: counts.get(period) ?? 0 }));
})();
/** RCRA lastInspectionDate(최근 점검) 연도별 건수. 날짜 있는 행이 있는 연도만 두며 날짜 없는 34곳은 그리지 않고 행이 없는 해는 0으로 채우지 않는다. */
const RCRA_YEARS = (() => {
  if (!RCRA) return null;
  const counts = new Map<number, number>();
  for (const row of RCRA.rows) {
    if (row.lastInspectionDate === null) continue;
    const year = Number(row.lastInspectionDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** 고정 Payne County NOAA 폭풍 날짜 목록. 날씨 교란변수이며 GHCN 강수·KCUH 기온·바쁨이 아니다. */
const STORM = readCushingStorm(stormInput);
/** 고정 Cimarron River near Ripley 일평균 유량. 수문 교란변수이며 GHCN 강수·NOAA 폭풍·바쁨이 아니다. 결측일은 행 자체가 없으며 0으로 채우지 않는다. */
const USGS = readCushingUsgsDaily(usgsInput);
/** 고정 Payne County USGS 우물 일평균 지하수위. 수문 교란변수이며 유량·바쁨이 아니다. 결측일은 행 자체가 없으며 0으로 채우지 않는다. */
const GW = readCushingUsgsGwDaily(gwInput);
/** 고정 Payne County FEMA 재난선포 날짜 목록. 재난 기록이지 NOAA 폭풍·바쁨·WTI가 아니다. */
const FEMA = readCushingFema(femaInput);
/** 고정 Payne County NFIP 홍수보험 청구 날짜 목록. 보험 기록이지 재난선포·폭풍·바쁨·WTI가 아니다. 지급액 null은 건수와 무관하다. */
const NFIP = readCushingNfip(nfipInput);
/** 고정 Payne County NFIP 유효 증권 월별 건수. 증권 잔량이지 청구·재난선포·폭풍·바쁨·WTI가 아니다. 행이 없는 달은 0으로 채우지 않는다. */
const NFPP = readCushingNfipPolicies(nfppInput);
/** 고정 쿠싱 시 상수도(PWS OK2006061) SDWIS 위반 날짜 목록. 음용수 규제 기록이지 CWA 점검·VOC 톤수·TRI·바쁨·WTI가 아니다. */
const SDWIS = readCushingSdwis(sdwisInput);
/** 고정 ZIP 74023 연간 IRS SOI 개인소득세. ZIP 세금 통계이지 Payne County BEA 소득·쿠싱 시·현장 바쁨이 아니다. 신고 건수는 filed count 그대로이며 행이 없는 해는 0으로 채우지 않는다. */
const SOI = readCushingIrsSoi(soiInput);
/** 고정 Payne County FHWA NBI 교량 점검 로그. 교량 기록이지 AADT·바쁨이 아니다. Cushing 시 단독이 아니며 행이 없는 해는 0으로 채우지 않는다. */
const NBI = readCushingNbi(nbiInput);
/** 고정 Payne County 연간 LODES 직장 일자리. 카운티 고용 구조이지 쿠싱 시·QCEW·바쁨이 아니다. 결측 연도는 행 자체가 없으며 0으로 채우지 않는다. */
const LODES = readPayneLodesAnnual(lodesInput);
/** 고정 Payne County 주간 US Drought Monitor D0 이상 면적 비율. 기상 교란변수이며 쿠싱 시·Mesonet 강수·바쁨이 아니다. 결측 주는 null이며 0으로 채우지 않는다. */
const DRT = readPayneDroughtWeekly(droughtInput);
/** 고정 Iowa Tribe Sand1 하천 pH 시료. 쿠싱에서 16.71 km Payne County 하천 화학이며 USGS 유량·지하수위·DMR·바쁨이 아니다. 제출 행만 그리며 결측일을 0으로 채우지 않는다. */
const WQP = readCushingWqp(wqpInput);
/** STORM beginDate 월별 건수. 행이 있는 달만 두며 행이 없는 달을 0으로 채우지 않는다. */
const STORM_MONTHS = (() => {
  if (!STORM) return null;
  const counts = new Map<string, number>();
  for (const row of STORM.rows) {
    const period = row.beginDate.slice(0, 7);
    counts.set(period, (counts.get(period) ?? 0) + 1);
  }
  return [...counts.keys()].sort().map((period) => ({ period, count: counts.get(period) ?? 0 }));
})();
/** FEMA declarationDate 연도별 건수. 선포 행이 있는 연도만 두며 행이 없는 해를 0으로 채우지 않는다. */
const FEMA_YEARS = (() => {
  if (!FEMA) return null;
  const counts = new Map<number, number>();
  for (const row of FEMA.rows) {
    const year = Number(row.declarationDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** NFIP dateOfLoss 연도별 건수. 청구가 있는 연도만 두며 청구가 없는 해를 0으로 채우지 않는다. 지급액 null은 건수와 무관하다. */
const NFIP_YEARS = (() => {
  if (!NFIP) return null;
  const counts = new Map<number, number>();
  for (const row of NFIP.rows) {
    const year = Number(row.dateOfLoss.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** SDWIS complianceBeginDate 연도별 건수. 시작일이 있는 연도만 두며 시작일이 없는 해를 0으로 채우지 않는다. 2017년 21건은 VOC 모니터링 행이 같은 시작일을 공유하며 펼치지 않는다. */
const SDWIS_YEARS = (() => {
  if (!SDWIS) return null;
  const counts = new Map<number, number>();
  for (const row of SDWIS.rows) {
    const year = Number(row.complianceBeginDate.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** NBI inspectionYm 연도별 건수. 점검 행이 있는 연도만 두며 행이 없는 해를 0으로 채우지 않는다. */
const NBI_YEARS = (() => {
  if (!NBI) return null;
  const counts = new Map<number, number>();
  for (const row of NBI.rows) {
    const year = Number(row.inspectionYm.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => a - b).map((year) => ({ year, count: counts.get(year) ?? 0 }));
})();
/** 고정 091-Z 날짜 큐. 기사 수는 활동이 아니다. */
const NEWS = datedCushingEvents(readCushingNews(newsInput));

/** 점수 전제·제외 목록의 정본(프로그램 원문). */
const PROGRAM_URL =
  "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/programs/cushing-busy/PROGRAM.md";
/** 관측 정의·증거의 정본(팩터 원장). */
const LEDGER_URL =
  "https://github.com/Noah-TaeHwan/ls-crude/blob/main/research/factors/091-cushing-motel-lights-index/README.md";

/** 보드 JSON의 한 행. */
export type CushingLane = {
  id: string;
  name?: string;
  status?: string;
  last_observation?: string | null;
  note?: string;
  reason?: string;
  venues?: string[];
};

/** 쿠싱 보드 JSON의 화면 표시용 구조. */
export type CushingBoard = {
  question: string;
  verdict: string;
  verdict_note: string;
  as_of_utc: string;
  lanes: {
    activity_forward: CushingLane[];
    physical_context: CushingLane[];
    excluded: CushingLane[];
  };
};

/** 관측 종류별 한국어 표시. 주화면에는 코드·영문 메모를 반복하지 않는다. */
const KIND: Record<string, { label: string; known: string; limit: string }> = {
  "091-U": { label: "구인 공고", known: "공개된 구인 목록", limit: "현장 인원 수가 아님" },
  "091-Y": { label: "주유소 가격판", known: "게시된 가격", limit: "판매량이 아님" },
  "091-Z": { label: "지역 산업 소식", known: "확인 대기 중인 소식 목록", limit: "기사 수가 활동량이 아님" },
  "091-V": { label: "인허가 상태 기록", known: "인허가 상태 확인 기록", limit: "공사량이 아님" },
};

/**
 * UTC ISO 시각을 KST(UTC+9) 일·시·분으로 표시한다.
 * @param value ISO 시각 문자열.
 * @returns "YYYY-MM-DD HH:mm KST" 또는 해석 불가 시 원문.
 */
function kst(value: string) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return `${new Date(time + 9 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ")} KST`;
}

/**
 * 쿠싱 현장 관측을 질문→판단 보류→흔적/없음/다음 확인 구조로 보여준다. 점수·합성·추세를 만들지 않는다.
 * @param props 보드 정본, 상세 화면 여부, 선택적 KCUH 날씨.
 * @returns 홈 카드와 상세 화면이 공유하는 관측 영역.
 */
export function CushingObservation({ board, detail = false, weather = null }: { board: CushingBoard; detail?: boolean; weather?: CushingWeatherView | null }) {
  const Heading = detail ? "h1" : "h3";
  const Sub = detail ? "h2" : "h4";
  const hold = board.verdict === "INSUFFICIENT";
  const traces = board.lanes.activity_forward.filter((row) => row.id !== "091-S");
  const restaurant = board.lanes.activity_forward.find((row) => row.id === "091-S");
  const venueCount = restaurant?.venues?.length;
  const verbatim = [...board.lanes.activity_forward, ...board.lanes.physical_context];
  return (
    <div className="min-w-0">
      <div className="section-heading">
        <div>
          <p className="section-kicker">쿠싱 · 현장 관측</p>
          <Heading id="cushing-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            쿠싱 현장은 지금 바쁜가?
          </Heading>
        </div>
        <span className="status-stamp">{hold ? "판단 보류" : "원문 확인 필요"}</span>
      </div>
      <p className="mt-4 text-sm leading-7">
        {hold
          ? "아직 판단할 수 없습니다. 식당 혼잡도 등 독립적으로 검증된 현장 관측이 아직 부족합니다."
          : "판정 형식이 달라 원문 확인이 필요합니다. 아래 원문 기록과 프로그램 원문을 확인하세요."}
      </p>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">보드 정리 시각 {kst(board.as_of_utc)} · 고정 기록</p>
      <Sub className="mt-6 text-sm font-medium">확보한 흔적</Sub>
      <ul className="mt-2 space-y-2 text-sm leading-7">
        {traces.map((row) => {
          const kind = KIND[row.id] ?? { label: row.name ?? row.id, known: "전향 관측", limit: row.note ?? "" };
          return (
            <li key={row.id} className="border-t border-border pt-2">
              <strong>{kind.label}</strong> · {kind.known}. <span className="text-muted-foreground">{kind.limit}</span>
            </li>
          );
        })}
      </ul>
      <Sub className="mt-6 text-sm font-medium">아직 없는 관측</Sub>
      <div className="mt-2 rounded-sm border border-border p-4 text-sm leading-7">
        <p>
          <strong>식당가 붐빔 라벨</strong> · 관측 기록 아직 없음 ·{" "}
          {typeof venueCount === "number" ? `관측 대상 식당 ${venueCount}곳` : "관측 대상 수 확인 필요"}
        </p>
        <p className="mt-1 text-muted-foreground">
          기록 방식: 한산함(quieter) · 평소(usual) · 붐빔(busier) · 표시 없음(not shown). 표시 없음은 표시 자체가
          없었던 기록이며, 빠짐이나 0이 아닙니다.
        </p>
      </div>
      <Sub className="mt-6 text-sm font-medium">다음 확인</Sub>
      <p className="mt-2 text-sm leading-7">
        날짜가 적힌 식당 관측부터 쌓습니다. 1행이 모여도 점수를 매기지 않습니다. 점수 전제(90일 관측, 예정 슬롯 80%
        이상, 다른 독립 현장 자료 검증, 사전 가중 최대 3개)는{" "}
        <a className="source-link" href={PROGRAM_URL}>
          프로그램 원문
        </a>
        에서 확인하세요.
      </p>
      <Sub className="mt-6 text-sm font-medium">날짜가 있는 문맥 — 바쁨 측정이 아님</Sub>
      <p className="mt-2 text-sm leading-7">
        주간·월간 재고·탱크 작업 저장 용량·연간 교통량·주거 허가·페이네 카운티 고용 표·페이네 카운티 분기 고용·Payne County 연간 LODES 직장 일자리·Payne County 월간 실업률·Payne County 월간 취업자 수·Payne County 월간 경제활동인구·쿠싱 시 월간 강수량·Payne County NOAA 폭풍 사건 월간 건수·Payne County FEMA 재난선포 연간 건수·Payne County NFIP 홍수보험 청구 연간 건수·Payne County NFIP 유효 증권 월별 건수·Cimarron River near Ripley 일평균 유량(USGS 07161450)·Payne County USGS 우물 일평균 지하수위(관정 360339096450201, 지표 아래 피트)·Iowa Tribe Sand1 하천 pH 시료·쿠싱 시 OTC 월간 판매세 분배액·학교 연간 재적·쿠싱 시 연간 인구·Payne County 연간 Census 주택 호수·Payne County 연간 Census PEP 인구·Payne County 연간 BEA CAINC1 개인소득·ZIP 74023 연간 IRS SOI 신고 건수·쿠싱 시 터미널 연간 VOC·쿠싱 시 TRI 현장 배출·쿠싱 시 EPA GHGRP 연간 CO2e·PHMSA 위험액체 사고 연간 건수·FRA 철도건널목 사고 연간 건수·쿠싱 시 신고 상용차(FMCSA) 사고 연간 건수·쿠싱 시 ZIP 74023 OSHA 점검 연간 건수·쿠싱 시 EPA ECHO 대기 시설 최근 FCE 연간 건수·쿠싱 시 EPA ECHO 수질(NPDES) 시설 최근 점검 연간 건수·쿠싱 시 EPA ECHO DMR 유량 신고 월간 건수·쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 연간 건수·쿠싱 시 상수도(PWS OK2006061) SDWIS 위반 연간 건수·Payne County Stillwater 모니터 연간 PM2.5·Payne County FHWA NBI 교량 점검 연간 건수·KUSH 월간 제목 관심·공항 일별 기온·Mesonet OILT 일최고기온·Mesonet OILT 일강수량·Mesonet OILT 일토양온도·Mesonet OILT 일평균 상대습도·Mesonet OILT 일평균 풍속·Mesonet OILT 일평균 정지기압·페이네 카운티 미국 가뭄모니터 주간 D0 이상 면적 비율·날짜 있는 산업 소식·인허가 사건·공항 날씨를 각각 원래 단위로 둡니다. 주간과 월간 재고는 정의가 달라 한 축에 섞지 않습니다.
        카운티 고용은 쿠싱 시 인원이 아닙니다. 실업률은 카운티 노동시장이며 쿠싱 시·바쁨이 아닙니다. 기사 1건은 현장이 바쁜 증거가 아닙니다. 수치·기준 주는 아래 원문 기록에서 확인하세요.
      </p>
      <CushingDatedContext weather={weather} />
      <details className="mt-6 border-t border-border">
        <summary className="min-h-11 cursor-pointer py-3 text-sm text-primary">관측별 기록과 출처 펼치기</summary>
        <ul className="space-y-3 pb-2 text-sm leading-7">
          {verbatim.map((row) => (
            <li key={row.id} className="border-t border-border pt-3">
              <p className="font-medium">
                {row.id} · {row.name} <span className="font-normal text-muted-foreground">{row.status}</span>
              </p>
              <p className="mt-1">{row.last_observation ?? "아직 날짜 있는 행 없음"}</p>
              {row.id === "091-S" && Array.isArray(row.venues) ? (
                <p className="mt-1">관측 대상: {row.venues.join(" · ")}</p>
              ) : null}
              {row.note ? <p className="mt-1 text-muted-foreground">{row.note}</p> : null}
            </li>
          ))}
        </ul>
        <p className="py-2 text-sm text-muted-foreground">원문 판정: {board.verdict} — {board.verdict_note}</p>
        <ul className="space-y-2 pb-2 text-sm text-muted-foreground">
          {board.lanes.excluded.map((row) => (
            <li key={row.id}>
              <span className="font-medium text-foreground">{row.id}</span> — {row.reason}
            </li>
          ))}
        </ul>
      </details>
      <div className="mt-5 flex flex-wrap gap-5 border-t border-border pt-4 text-sm">
        {!detail ? (
          <Link className="source-link" to="/observations/cushing-busy">
            전체 보드 →
          </Link>
        ) : null}
        <a className="source-link" href={PROGRAM_URL}>
          프로그램 원문
        </a>
        <a className="source-link" href={LEDGER_URL}>
          관측 정의·증거 원장
        </a>
      </div>
    </div>
  );
}

/** DEQ 상태 표시. 원문 상태를 번역만 한다. */
const DEQ_STATUS: Record<string, string> = { issued: "발급", "technical review": "기술 검토" };

/** QCEW 산업코드 한국어 표시. 쿠싱 시가 아니라 카운티 분류명이다. */
const QCEW_LABEL: Record<string, string> = {
  "10": "총커버",
  "21": "민간 광업·석유가스 추출",
  "211": "민간 석유가스 추출",
  "212": "민간 광업(석유가스 제외)",
  "213": "민간 광업 지원",
  "213112": "민간 석유가스 운영 지원",
  "721": "민간 숙박",
};

/**
 * QCEW 산업코드를 화면 라벨로 바꾼다. 없는 코드는 코드를 그대로 둔다.
 * @param industryCode BLS 산업 코드.
 * @returns 한국어 분류명 또는 원문 코드.
 */
function qcewLabel(industryCode: string) {
  return QCEW_LABEL[industryCode] ?? industryCode;
}

/**
 * 날짜 있는 문맥 관측을 나란히 보여준다. 합성 점수나 WTI 축을 만들지 않는다.
 * @param props 선택적 실시간 날씨.
 * @returns 재고·교통·주거허가·카운티 고용·인허가·날씨 영역.
 */
function CushingDatedContext({ weather }: { weather: CushingWeatherView | null }) {
  const [stockIndex, setStockIndex] = useState(STOCKS ? STOCKS.length - 1 : 0);
  const [monthlyIndex, setMonthlyIndex] = useState(MONTHLY ? MONTHLY.length - 1 : 0);
  const [aadtIndex, setAadtIndex] = useState(AADT ? AADT.length - 1 : 0);
  const [bpsIndex, setBpsIndex] = useState(BPS ? BPS.length - 1 : 0);
  const [qcewIndex, setQcewIndex] = useState(QCEW_Q ? QCEW_Q.rows.length - 1 : 0);
  const [enrollIndex, setEnrollIndex] = useState(ENROLL ? ENROLL.rows.length - 1 : 0);
  const [kushIndex, setKushIndex] = useState(KUSH ? KUSH.rows.length - 1 : 0);
  const [kcuhIndex, setKcuhIndex] = useState(KCUH ? KCUH.rows.length - 1 : 0);
  const [mesoIndex, setMesoIndex] = useState(MESO_ROWS ? MESO_ROWS.length - 1 : 0);
  const [mesoRainIndex, setMesoRainIndex] = useState(MESO_RAIN_ROWS ? MESO_RAIN_ROWS.length - 1 : 0);
  const [soilIndex, setSoilIndex] = useState(SOIL_ROWS ? SOIL_ROWS.length - 1 : 0);
  const [humIndex, setHumIndex] = useState(HUM_ROWS ? HUM_ROWS.length - 1 : 0);
  const [windIndex, setWindIndex] = useState(WIND_ROWS ? WIND_ROWS.length - 1 : 0);
  const [presIndex, setPresIndex] = useState(PRES_ROWS ? PRES_ROWS.length - 1 : 0);
  const [popIndex, setPopIndex] = useState(POP ? POP.rows.length - 1 : 0);
  const [housingIndex, setHousingIndex] = useState(HOUSING ? HOUSING.rows.length - 1 : 0);
  const [pepIndex, setPepIndex] = useState(PEP ? PEP.rows.length - 1 : 0);
  const [incomeIndex, setIncomeIndex] = useState(INCOME ? INCOME.rows.length - 1 : 0);
  const [vocIndex, setVocIndex] = useState(VOC ? VOC.rows.length - 1 : 0);
  const [triIndex, setTriIndex] = useState(TRI ? TRI.rows.length - 1 : 0);
  const [ghgIndex, setGhgIndex] = useState(GHG ? GHG.rows.length - 1 : 0);
  const [fraIndex, setFraIndex] = useState(FRA_YEARS ? FRA_YEARS.length - 1 : 0);
  const [nhtsaIndex, setNhtsaIndex] = useState(NHTSA_YEARS ? NHTSA_YEARS.length - 1 : 0);
  const [oshaIndex, setOshaIndex] = useState(OSHA_YEARS ? OSHA_YEARS.length - 1 : 0);
  const [aqsIndex, setAqsIndex] = useState(AQS ? AQS.rows.length - 1 : 0);
  const [echoIndex, setEchoIndex] = useState(ECHO_YEARS ? ECHO_YEARS.length - 1 : 0);
  const [echoCwaIndex, setEchoCwaIndex] = useState(ECHO_CWA_YEARS ? ECHO_CWA_YEARS.length - 1 : 0);
  const [dmrIndex, setDmrIndex] = useState(DMR_MONTHS ? DMR_MONTHS.length - 1 : 0);
  const [rcraIndex, setRcraIndex] = useState(RCRA_YEARS ? RCRA_YEARS.length - 1 : 0);
  const [phmsaIndex, setPhmsaIndex] = useState(PHMSA_YEARS ? PHMSA_YEARS.length - 1 : 0);
  const [lausIndex, setLausIndex] = useState(LAUS_ROWS ? LAUS_ROWS.length - 1 : 0);
  const [laueIndex, setLaueIndex] = useState(LAUE_ROWS ? LAUE_ROWS.length - 1 : 0);
  const [laufIndex, setLaufIndex] = useState(LAUF_ROWS ? LAUF_ROWS.length - 1 : 0);
  const [prcpIndex, setPrcpIndex] = useState(PRCP_ROWS ? PRCP_ROWS.length - 1 : 0);
  const [stormIndex, setStormIndex] = useState(STORM_MONTHS ? STORM_MONTHS.length - 1 : 0);
  const [femaIndex, setFemaIndex] = useState(FEMA_YEARS ? FEMA_YEARS.length - 1 : 0);
  const [nfipIndex, setNfipIndex] = useState(NFIP_YEARS ? NFIP_YEARS.length - 1 : 0);
  const [nfppIndex, setNfppIndex] = useState(NFPP ? NFPP.rows.length - 1 : 0);
  const [sdwisIndex, setSdwisIndex] = useState(SDWIS_YEARS ? SDWIS_YEARS.length - 1 : 0);
  const [soiIndex, setSoiIndex] = useState(SOI ? SOI.rows.length - 1 : 0);
  const [nbiIndex, setNbiIndex] = useState(NBI_YEARS ? NBI_YEARS.length - 1 : 0);
  const [lodesIndex, setLodesIndex] = useState(LODES ? LODES.rows.length - 1 : 0);
  const [drtIndex, setDrtIndex] = useState(DRT ? DRT.rows.length - 1 : 0);
  const [wqpIndex, setWqpIndex] = useState(WQP ? WQP.rows.length - 1 : 0);
  const [usgsIndex, setUsgsIndex] = useState(USGS ? USGS.rows.length - 1 : 0);
  const [gwIndex, setGwIndex] = useState(GW ? GW.rows.length - 1 : 0);
  const [staxIndex, setStaxIndex] = useState(STAX ? STAX.rows.length - 1 : 0);
  const [capIndex, setCapIndex] = useState(CAP ? CAP.rows.length - 1 : 0);
  const stock = STOCKS?.[stockIndex];
  const monthly = MONTHLY?.[monthlyIndex];
  const aadt = AADT?.[aadtIndex];
  const bps = BPS?.[bpsIndex];
  const qcewQ = QCEW_Q?.rows[qcewIndex];
  const enroll = ENROLL?.rows[enrollIndex];
  const kush = KUSH?.rows[kushIndex];
  const kcuh = KCUH?.rows[kcuhIndex];
  const meso = MESO_ROWS?.[mesoIndex];
  const mesoRain = MESO_RAIN_ROWS?.[mesoRainIndex];
  const soil = SOIL_ROWS?.[soilIndex];
  const hum = HUM_ROWS?.[humIndex];
  const wind = WIND_ROWS?.[windIndex];
  const pres = PRES_ROWS?.[presIndex];
  const pop = POP?.rows[popIndex];
  const house = HOUSING?.rows[housingIndex];
  const pep = PEP?.rows[pepIndex];
  const income = INCOME?.rows[incomeIndex];
  const voc = VOC?.rows[vocIndex];
  const tri = TRI?.rows[triIndex];
  const ghg = GHG?.rows[ghgIndex];
  const fra = FRA_YEARS?.[fraIndex];
  const nhtsa = NHTSA_YEARS?.[nhtsaIndex];
  const osha = OSHA_YEARS?.[oshaIndex];
  const aqs = AQS?.rows[aqsIndex];
  const echo = ECHO_YEARS?.[echoIndex];
  const echoCwa = ECHO_CWA_YEARS?.[echoCwaIndex];
  const dmr = DMR_MONTHS?.[dmrIndex];
  const rcra = RCRA_YEARS?.[rcraIndex];
  const phmsa = PHMSA_YEARS?.[phmsaIndex];
  const laus = LAUS_ROWS?.[lausIndex];
  const laue = LAUE_ROWS?.[laueIndex];
  const lauf = LAUF_ROWS?.[laufIndex];
  const prcp = PRCP_ROWS?.[prcpIndex];
  const storm = STORM_MONTHS?.[stormIndex];
  const fema = FEMA_YEARS?.[femaIndex];
  const nfip = NFIP_YEARS?.[nfipIndex];
  const nfpp = NFPP?.rows[nfppIndex];
  const sdwis = SDWIS_YEARS?.[sdwisIndex];
  const soi = SOI?.rows[soiIndex];
  const nbi = NBI_YEARS?.[nbiIndex];
  const lodes = LODES?.rows[lodesIndex];
  const drt = DRT?.rows[drtIndex];
  const wqp = WQP?.rows[wqpIndex];
  const usgs = USGS?.rows[usgsIndex];
  const gw = GW?.rows[gwIndex];
  const stax = STAX?.rows[staxIndex];
  const cap = CAP?.rows[capIndex];
  const metar = weather?.data;
  return (
    <div className="mt-4 space-y-8">
      {STOCKS && stock ? (
        <div>
          <ResearchChart
            id="cushing-stocks-plot"
            title="쿠싱 상업원유 재고"
            dates={STOCKS.map((row) => row.date)}
            series={[{ label: "주간 기말 재고", color: "#edb958", values: STOCKS.map((row) => row.stockKbbl) }]}
            minimum={0}
            maximum={70000}
            unit="천 배럴"
            selected={stockIndex}
            onSelect={setStockIndex}
            description="EIA Cushing 주간 상업원유 재고 1169주. 2004년4월9일부터 2026년8월28일. 현장 활동이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{stock.date} · {stock.stockKbbl.toLocaleString("en-US")} 천 배럴</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Lincoln·Payne·Creek 탱크팜 합계. 주 종료 2026-08-28이 이 표본의 마지막 발표 주입니다.</p>
        </div>
      ) : (
        <p role="status">재고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {MONTHLY && monthly ? (
        <div>
          <ResearchChart
            id="cushing-monthly-stocks-plot"
            title="쿠싱 상업원유 월간 재고"
            dates={MONTHLY.map((row) => `${row.month}-01`)}
            series={[{ label: "월말 재고", color: "#edb958", values: MONTHLY.map((row) => row.stockKbbl) }]}
            minimum={0}
            maximum={80000}
            unit="천 배럴"
            selected={monthlyIndex}
            onSelect={setMonthlyIndex}
            description="EIA Cushing 월간 상업원유 재고 270개월. 2004년1월부터 2026년6월. 주간 표와 다릅니다. 현장 활동이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{monthly.month} · {monthly.stockKbbl.toLocaleString("en-US")} 천 배럴</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">MCRST_YCUOK_1. 발표 2026-08-31. 2026년 7월 이후 빈 칸은 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">월간 재고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {CAP && cap ? (
        <div>
          <ResearchChart
            id="cushing-working-storage-plot"
            title="쿠싱 허브 탱크 작업 저장 용량"
            dates={CAP.rows.map((row) => row.period)}
            series={[{ label: "작업 저장 용량", color: "#78b7ed", values: CAP.rows.map((row) => row.workingStorageKbbl), dots: true }]}
            minimum={0}
            maximum={80000}
            unit="천 배럴"
            selected={capIndex}
            onSelect={setCapIndex}
            description="쿠싱 허브 EIA 탱크 작업 저장 용량 23점. 2011-03-31부터 2024-03-01. 재고가 아니고 바쁨이 아닙니다. 보고는 2024-03 이후 중단."
          />
          <p className="mt-3 font-mono text-sm">{cap.period} · {cap.workingStorageKbbl.toLocaleString("en-US")} 천 배럴</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 허브 EIA 탱크 작업 저장 용량(천 배럴). 재고가 아니고 바쁨이 아닙니다. 보고는 2024-03 이후 중단.</p>
        </div>
      ) : (
        <p role="status">작업 저장 용량 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {AADT && aadt ? (
        <div>
          <ResearchChart
            id="cushing-aadt-plot"
            title="이스트 메인 연간 교통량"
            dates={AADT.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 AADT", color: "#78b7ed", values: AADT.map((row) => row.aadt), dots: true }]}
            minimum={0}
            maximum={14000}
            unit="대/일"
            selected={aadtIndex}
            onSelect={setAadtIndex}
            start="2015-01-01"
            end="2025-12-31"
            description="ODOT East Main 지점 600645 연간 AADT 11개. 일별 트럭 수가 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">
            {aadt.year} · {aadt.aadt.toLocaleString("en-US")} 대/일
            {aadt.trucks !== null ? ` · 트럭 ${aadt.trucks.toLocaleString("en-US")}` : " · 트럭 분리 없음"}
          </p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱으로 표시된 상시관측소는 0곳입니다. 연간 값을 일별로 펼치지 않습니다.</p>
        </div>
      ) : (
        <p role="status">연간 교통량 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {BPS && bps ? (
        <div>
          <ResearchChart
            id="cushing-bps-plot"
            title="쿠싱 시 주거 건축허가"
            dates={BPS.map((row) => `${row.month}-01`)}
            series={[{ label: "허가 호수", color: "#edb958", values: BPS.map((row) => row.units), dots: true }]}
            minimum={0}
            maximum={5}
            unit="호"
            selected={bpsIndex}
            onSelect={setBpsIndex}
            description="Census BPS Cushing 시 월별 주거 허가 31개월. 탱크·산업 공사가 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{bps.month} · {bps.units}호</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">2024년 1월부터 2026년 7월 현재월 파일. 빠진 달을 0으로 채우지 않았고, 2026년 8월 파일은 아직 없습니다.</p>
        </div>
      ) : (
        <p role="status">주거 허가 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {QCEW_Q && qcewQ ? (
        <div>
          <ResearchChart
            id="cushing-qcew-quarterly-plot"
            title="페이네 카운티 분기 총커버 고용"
            dates={QCEW_Q.rows.map((row) => `${row.year}-${String(row.month).padStart(2, "0")}-01`)}
            series={[{ label: "총커버", color: "#edb958", values: QCEW_Q.rows.map((row) => row.totalCovered) }]}
            minimum={0}
            maximum={40000}
            unit="명"
            selected={qcewIndex}
            onSelect={setQcewIndex}
            description="BLS QCEW Payne County 총커버 고용 45분기. 2015년1분기부터 2026년1분기. 쿠싱 시 인원이 아닙니다."
          />
          <div className="mt-7">
            <ResearchChart
              id="cushing-qcew-mining-plot"
              title="페이네 카운티 민간 광업 고용"
              dates={QCEW_Q.rows.map((row) => `${row.year}-${String(row.month).padStart(2, "0")}-01`)}
              series={[{ label: "민간 NAICS 21", color: "#78b7ed", values: QCEW_Q.rows.map((row) => row.privateMining21) }]}
              minimum={0}
              maximum={1200}
              unit="명"
              selected={qcewIndex}
              onSelect={setQcewIndex}
              description="BLS QCEW Payne County 민간 광업 45분기. 쿠싱 탱크팜 인원이 아닙니다."
            />
          </div>
          <p className="mt-3 font-mono text-sm">
            {qcewQ.year}-Q{qcewQ.qtr} · 총커버 {qcewQ.totalCovered?.toLocaleString("en-US") ?? "공시제한"}명
            {" · "}
            민간 광업 {qcewQ.privateMining21?.toLocaleString("en-US") ?? "공시제한"}명
          </p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            지역 40119. Stillwater·OSU가 카운티를 지배합니다. 2026-Q2는 404라 채우지 않았습니다. 쿠싱 현장 바쁨이 아닙니다.
          </p>
        </div>
      ) : (
        <p role="status">페이네 카운티 분기 고용 시계열 검증 실패. 원문을 확인하세요.</p>
      )}
      {LODES && lodes ? (
        <div>
          <ResearchChart
            id="cushing-lodes-plot"
            title="페이네 카운티 연간 LODES 직장 일자리"
            dates={LODES.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 직장 일자리", color: "#edb958", values: LODES.rows.map((row) => row.jobs), dots: true }]}
            minimum={0}
            maximum={40000}
            unit="명"
            selected={lodesIndex}
            onSelect={setLodesIndex}
            description="페이네 카운티 Census LODES 연간 직장 일자리 22년. 2002부터 2023. 쿠싱 시가 아니고 QCEW가 아니며 바쁨이 아닙니다. 결측 연도는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{lodes.year} · {lodes.jobs.toLocaleString("en-US")}명</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">페이네 카운티 Census LODES 연간 직장 일자리(S000/JT00/C000, FIPS 40119). 쿠싱 시가 아니고 QCEW가 아니며 바쁨이 아닙니다. 결측 연도는 0으로 채우지 않았습니다. 마지막 공개 연도 2023은 35,589명(701 블록)입니다. 2022 WAC 33,401은 091-I OD 32,543과 다른 공시 표이므로 섞지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">카운티 LODES 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {LAUS_ROWS && laus ? (
        <div>
          <ResearchChart
            id="cushing-laus-plot"
            title="페이네 카운티 월간 실업률"
            dates={LAUS_ROWS.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 실업률", color: "#78b7ed", values: LAUS_ROWS.map((row) => row.unemployment_rate) }]}
            minimum={0}
            maximum={12}
            unit="%"
            selected={lausIndex}
            onSelect={setLausIndex}
            description="Payne County 월간 LAUS 실업률 138개월 공개. 2015-01부터 2026-07. 쿠싱 시가 아니고 QCEW 고용이 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다."
          />
          <p className="mt-3 font-mono text-sm">{laus.period} · {laus.unemployment_rate}%</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County 월간 LAUS 실업률. 쿠싱 시가 아니고 QCEW 고용이 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다. 마지막 공개월 2026-07은 4.5% 예비치입니다.</p>
        </div>
      ) : (
        <p role="status">카운티 실업률 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {LAUE_ROWS && laue ? (
        <div>
          <ResearchChart
            id="cushing-laus-employed-plot"
            title="페이네 카운티 월간 취업자 수"
            dates={LAUE_ROWS.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 취업자 수", color: "#edb958", values: LAUE_ROWS.map((row) => row.employed) }]}
            minimum={0}
            maximum={45000}
            unit="명"
            selected={laueIndex}
            onSelect={setLaueIndex}
            description="Payne County 월간 LAUS 취업자 수 138개월 공개. 2015-01부터 2026-07. 실업률 차트와 다르고 쿠싱 시가 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다."
          />
          <p className="mt-3 font-mono text-sm">{laue.period} · {laue.employed!.toLocaleString("en-US")}명</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County 월간 LAUS 취업자 수. 실업률 차트와 다르고 쿠싱 시가 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다. 마지막 공개월 2026-07은 38,543명 예비치입니다.</p>
        </div>
      ) : (
        <p role="status">카운티 취업자 수 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {LAUF_ROWS && lauf ? (
        <div>
          <ResearchChart
            id="cushing-laus-labor-force-plot"
            title="페이네 카운티 월간 경제활동인구"
            dates={LAUF_ROWS.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 경제활동인구", color: "#78b7ed", values: LAUF_ROWS.map((row) => row.labor_force) }]}
            minimum={0}
            maximum={45000}
            unit="명"
            selected={laufIndex}
            onSelect={setLaufIndex}
            description="Payne County 월간 LAUS 경제활동인구 138개월 공개. 2015-01부터 2026-07. 실업률·취업자 수 차트와 다르고 쿠싱 시가 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다."
          />
          <p className="mt-3 font-mono text-sm">{lauf.period} · {lauf.labor_force!.toLocaleString("en-US")}명</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County 월간 LAUS 경제활동인구. 실업률·취업자 수 차트와 다르고 쿠싱 시가 아니며 바쁨이 아닙니다. 2025-10은 BLS 미공개로 비워 두었습니다. 마지막 공개월 2026-07은 40,352명 예비치입니다.</p>
        </div>
      ) : (
        <p role="status">카운티 경제활동인구 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {PRCP_ROWS && prcp ? (
        <div>
          <ResearchChart
            id="cushing-precip-plot"
            title="쿠싱 시 월간 강수량"
            dates={PRCP_ROWS.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 강수량", color: "#78b7ed", values: PRCP_ROWS.map((row) => row.precipIn) }]}
            minimum={0}
            maximum={18}
            unit="인치"
            selected={prcpIndex}
            onSelect={setPrcpIndex}
            description="쿠싱 시 GHCN 월간 강수량(인치). 공항 기온이 아니고 바쁨이 아닙니다. 부분월은 비워 두었습니다."
          />
          <p className="mt-3 font-mono text-sm">{prcp.period} · {prcp.precipIn}인치</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 GHCN 월간 강수량(인치). 공항 기온이 아니고 바쁨이 아닙니다. 부분월은 비워 두었습니다. 2017-05부터 2021-11까지 55개월 중 47개월 공개, 마지막 공개월 2021-10은 9.031인치입니다. 2021-09 = 0.000은 관측된 건조이며 8개 부분월은 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">강수 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {STORM && STORM_MONTHS && storm ? (
        <div>
          <ResearchChart
            id="cushing-storm-plot"
            title="Payne County NOAA 폭풍 사건 월간 건수"
            dates={STORM_MONTHS.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 폭풍 사건", color: "#78b7ed", values: STORM_MONTHS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={15}
            unit="건"
            selected={stormIndex}
            onSelect={setStormIndex}
            description="Payne County NOAA 폭풍 사건 월간 건수 22개월. 2024-01부터 2026-05. 합계 112건. 강수·기온이 아니고 바쁨이 아닙니다. 쿠싱 시 전용이 아니며 행이 없는 달은 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{storm.period} · {storm.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County NOAA Storm Events 월간 건수. 강수·기온이 아니고 바쁨이 아닙니다. 쿠싱 시 전용이 아니며 행이 없는 달은 0으로 채우지 않았습니다. 112건 모두 Payne County 기록이며 2024-01-13부터 2026-05-08 날짜 기록이다. CUSHING 입지는 3건만이며 별도 시계열로 분리하지 않았습니다. 부상 10·사망 0.</p>
        </div>
      ) : (
        <p role="status">폭풍 사건 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {FEMA && FEMA_YEARS && fema ? (
        <div>
          <ResearchChart
            id="cushing-fema-plot"
            title="Payne County FEMA 재난선포 연간 건수"
            dates={FEMA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 재난선포", color: "#edb958", values: FEMA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={5}
            unit="건"
            selected={femaIndex}
            onSelect={setFemaIndex}
            description="Payne County FEMA 재난선포 연간 건수 25년. 1974부터 2025. 합계 39건. 폭풍 건수가 아니고 바쁨이 아닙니다. 쿠싱 시 전용이 아니며 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{fema.year} · {fema.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County FEMA 재난선포 연간 건수. 폭풍 건수가 아니고 바쁨이 아닙니다. 쿠싱 시 전용이 아니며 행이 없는 해는 0으로 채우지 않았습니다. 39건 모두 Payne County 지정이며 1974-06-10부터 2025-05-21 날짜 기록이다. DR 24·EM 8·FM 7.</p>
        </div>
      ) : (
        <p role="status">재난선포 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {NFIP && NFIP_YEARS && nfip ? (
        <div>
          <ResearchChart
            id="cushing-nfip-plot"
            title="Payne County NFIP 홍수보험 청구 연간 건수"
            dates={NFIP_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 홍수보험 청구", color: "#edb958", values: NFIP_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={40}
            unit="건"
            selected={nfipIndex}
            onSelect={setNfipIndex}
            description="Payne County NFIP 홍수보험 청구 연간 건수. 쿠싱 시가 아니고 재난선포·폭풍 건수가 아니며 바쁨이 아닙니다. 청구가 없는 해는 0으로 채우지 않았습니다. 시 이름은 원문이 비공개입니다."
          />
          <p className="mt-3 font-mono text-sm">{nfip.year} · {nfip.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County NFIP 홍수보험 청구 연간 건수. 쿠싱 시가 아니고 재난선포·폭풍 건수가 아니며 바쁨이 아닙니다. 청구가 없는 해는 0으로 채우지 않았습니다. 시 이름은 원문이 비공개입니다. 100건 모두 Payne County 신고(countyCode 40119)이며 1980-06-19부터 2021-06-27 날짜 기록이다. 차트는 청구 건수이며 지급액이 아니므로 지급 없이 종결된 21건도 건수에 들어간다.</p>
        </div>
      ) : (
        <p role="status">홍수보험 청구 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {NFPP && nfpp ? (
        <div>
          <ResearchChart
            id="cushing-nfip-policies-plot"
            title="Payne County NFIP 유효 증권 월별 건수"
            dates={NFPP.rows.map((row) => `${row.yearMonth}-01`)}
            series={[{ label: "월별 유효 증권", color: "#edb958", values: NFPP.rows.map((row) => row.policies) }]}
            minimum={0}
            maximum={50}
            unit="건"
            selected={nfppIndex}
            onSelect={setNfppIndex}
            description="Payne County NFIP 유효 증권 월별 건수 214개월. 2009-01부터 2026-10. 합계 4039건. 청구 건수가 아니고 바쁨이 아닙니다. 행이 없는 기간은 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{nfpp.yearMonth} · {nfpp.policies}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County NFIP 유효 증권 건수. 청구 건수가 아니고 바쁨이 아닙니다. 행이 없는 기간은 0으로 채우지 않았습니다. 쿠싱 시 전용이 아니며 시 이름은 원문이 비공개입니다. 4039건 모두 Payne County 신고(censusGeoid 40119)이며 2009-01부터 2026-10 유효월 기록이다. 차트는 증권 건수이며 청구·지급액이 아니다. 최고월 2010-08은 44건이다.</p>
        </div>
      ) : (
        <p role="status">유효 증권 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {USGS && usgs ? (
        <div>
          <ResearchChart
            id="cushing-usgs-plot"
            title="Cimarron River near Ripley 일평균 유량"
            dates={USGS.rows.map((row) => row.date)}
            series={[{ label: "일평균 유량", color: "#78b7ed", values: USGS.rows.map((row) => row.dischargeCfs) }]}
            minimum={0}
            maximum={140000}
            unit="cfs"
            selected={usgsIndex}
            onSelect={setUsgsIndex}
            description="Cimarron River near Ripley (USGS 07161450) 일평균 유량. Payne County 게이지이며 쿠싱 시 전용이 아니고 바쁨이 아닙니다. 결측일을 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{usgs.date} · {usgs.dischargeCfs.toLocaleString("en-US")}cfs</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Cimarron River near Ripley (USGS 07161450) 일평균 유량. Payne County 게이지이며 쿠싱 시내 게이지가 아니고 쿠싱에서 12.8km 떨어져 있으며 바쁨이 아닙니다. 결측일을 0으로 채우지 않았습니다. 1987-10-01부터 2026-09-09까지 14224일, NWIS 공개 그대로이며 빠진 날을 지어 내지 않았습니다. 1993-05-10 최대 137,000cfs.</p>
        </div>
      ) : (
        <p role="status">유량 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {GW && gw ? (
        <div>
          <ResearchChart
            id="cushing-usgs-gw-plot"
            title="Payne County USGS 우물 일평균 지하수위"
            dates={GW.rows.map((row) => row.date)}
            series={[{ label: "일평균 지하수위", color: "#78b7ed", values: GW.rows.map((row) => row.depthToWaterFt) }]}
            minimum={0}
            maximum={10}
            unit="피트"
            selected={gwIndex}
            onSelect={setGwIndex}
            description="Payne County USGS 우물 일평균 지하수위(지표 아래 피트). 쿠싱 시 우물이 아니고 유량(07161450)이 아니며 바쁨이 아닙니다. 2018-10-22 이후는 관측이 없어 0으로 채우지 않았습니다. 관정 360339096450201, Cushing에서 8.7 km."
          />
          <p className="mt-3 font-mono text-sm">{gw.date} · {gw.depthToWaterFt.toLocaleString("en-US")}피트</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County USGS 우물(관정 360339096450201, Cimarron3) 일평균 지하수위(지표 아래 피트). 쿠싱 시 우물이 아니고 Cushing에서 8.7 km 떨어져 있으며 유량(07161450)이 아니고 바쁨이 아닙니다. 값이 클수록 수면이 깊습니다. 2017-06-29부터 2018-10-22까지 481일, NWIS 공개 그대로이며 2018-10-22 이후는 관측이 없어 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">지하수위 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {WQP && wqp ? (
        <div>
          <ResearchChart
            id="cushing-wqp-plot"
            title="Iowa Tribe Sand1 하천 pH 시료"
            dates={WQP.rows.map((row) => row.date)}
            series={[{ label: "시료 pH", color: "#78b7ed", values: WQP.rows.map((row) => row.ph), dots: true }]}
            minimum={0}
            maximum={14}
            unit="pH"
            selected={wqpIndex}
            onSelect={setWqpIndex}
            description="쿠싱에서 16.71 km Payne County Iowa Tribe Sand1(IOWATROK_WQX-SND1) 하천 pH 시료 366행. 2005-09-01부터 2021-09-17까지 283일 제출 그대로. USGS 유량·지하수위가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{wqp.date} · {wqp.ph}pH</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 16.71 km 떨어진 Payne County Iowa Tribe Sand1(IOWATROK_WQX-SND1) 하천 pH 시료 366행. 2005-09-01부터 2021-09-17까지 283일 제출 그대로 그리며, 2009-05-05 제출 0.0도 그대로 둡니다. USGS 07161450 Cimarron 방류·지하수위가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">하천 pH 시료 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {STAX && stax ? (
        <div>
          <ResearchChart
            id="cushing-sales-tax-plot"
            title="쿠싱 시 OTC 월간 판매세 분배액"
            dates={STAX.rows.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 판매세 분배액", color: "#edb958", values: STAX.rows.map((row) => row.sales_tax_usd), dots: true }]}
            minimum={0}
            maximum={600000}
            unit="USD"
            selected={staxIndex}
            onSelect={setStaxIndex}
            description="쿠싱 시 OTC 월간 판매세 분배액. 호텔세가 아니고 바쁨이 아닙니다. 공개된 4개월만 그렸습니다."
          />
          <p className="mt-3 font-mono text-sm">{stax.period} · {stax.sales_tax_usd} USD</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 OTC 월간 판매세 분배액. 호텔세가 아니고 바쁨이 아닙니다. 공개된 4개월만 그렸습니다. 2025-09와 2026-08 사이 빈 달을 0으로 채우지 않았습니다. 마지막 공개월 2026-09는 577814.84 USD입니다. OTC 배분월이며 영업월로 바꾸지 않았습니다. 사용세(STU)가 아닙니다.</p>
        </div>
      ) : (
        <p role="status">판매세 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {ENROLL && enroll ? (
        <div>
          <ResearchChart
            id="cushing-enrollment-plot"
            title="쿠싱 고등학교 연간 재적"
            dates={ENROLL.rows.map((row) => `${row.schoolYear.slice(0, 4)}-07-01`)}
            series={[{ label: "연간 재적", color: "#78b7ed", values: ENROLL.rows.map((row) => row.enrollment), dots: true }]}
            minimum={0}
            maximum={600}
            unit="명"
            selected={enrollIndex}
            onSelect={setEnrollIndex}
            description="Cushing High School 연간 재적 5개 학년도. 2019-20부터 2024-25. 2023-24는 결측이며 0으로 채우지 않았습니다. 학교 인원이지 현장 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{enroll.schoolYear} · {enroll.enrollment.toLocaleString("en-US")}명</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">재적은 학교 인원이며 바쁨이 아닙니다. 2023-24 학년도는 결측입니다. 마지막 공개 학년도 2024-25는 529명입니다.</p>
        </div>
      ) : (
        <p role="status">학교 재적 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {KUSH && kush ? (
        <div>
          <ResearchChart
            id="cushing-kush-plot"
            title="KUSH 월간 운영 관심"
            dates={KUSH.rows.map((row) => row.month)}
            series={[{ label: "월간 관심 기사", color: "#edb958", values: KUSH.rows.map((row) => row.articleCount) }]}
            minimum={0}
            maximum={3}
            unit="건"
            selected={kushIndex}
            onSelect={setKushIndex}
            description="KUSH Radio 공개 제목의 월간 운영-관심 221개월. 2008년2월부터 2026년6월. 합계 101건. 0은 관측된 값입니다. 제목 관심이지 현장 인원이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{kush.month} · {kush.articleCount}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">KUSH는 제목 관심이며 현장 인원이 아닙니다. 바쁨이 아닙니다. 마지막 달 2026-06-01은 1건입니다.</p>
        </div>
      ) : (
        <p role="status">KUSH 관심 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {POP && pop ? (
        <div>
          <ResearchChart
            id="cushing-population-plot"
            title="쿠싱 시 연간 인구"
            dates={POP.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 인구", color: "#78b7ed", values: POP.rows.map((row) => row.population), dots: true }]}
            minimum={0}
            maximum={12000}
            unit="명"
            selected={popIndex}
            onSelect={setPopIndex}
            description="쿠싱 시 연간 인구(Census PEP). 현장 바쁨 아님. 2010–2019와 2020–2024 빈티지가 이어져 있으며 2020 단차는 빈티지 교체다. 15년 2010..2024, 마지막 2024=8444명."
          />
          <p className="mt-3 font-mono text-sm">{pop.year} · {pop.population.toLocaleString("en-US")}명</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Census PEP place 4018850. 2019=7615명 다음 2020=8318명은 빈티지 교체 단차이며 메우지 않았습니다. 도시 규모이지 현장 바쁨이 아닙니다.</p>
        </div>
      ) : (
        <p role="status">도시 인구 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {HOUSING && house ? (
        <div>
          <ResearchChart
            id="cushing-county-housing-plot"
            title="페이네 카운티 연간 주택 호수"
            dates={HOUSING.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 주택 호수", color: "#78b7ed", values: HOUSING.rows.map((row) => row.housing_units), dots: true }]}
            minimum={0}
            maximum={40000}
            unit="호"
            selected={housingIndex}
            onSelect={setHousingIndex}
            description="Payne County 연간 Census 주택 호수. 쿠싱 시가 아니고 허가 건수가 아니며 바쁨이 아닙니다. 2019→2020은 빈티지 단절입니다. 15년 2010..2024, 마지막 2024=37437호."
          />
          <p className="mt-3 font-mono text-sm">{house.year} · {house.housing_units.toLocaleString("en-US")}호</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County 연간 Census 주택 호수. 쿠싱 시가 아니고 허가 건수가 아니며 바쁨이 아닙니다. 2019=36859호 다음 2020=36732호는 빈티지 단절이며 메우지 않았습니다. 마지막 공개 연도 2024는 37,437호입니다.</p>
        </div>
      ) : (
        <p role="status">카운티 주택 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {PEP && pep ? (
        <div>
          <ResearchChart
            id="cushing-pep-plot"
            title="Payne County 연간 Census PEP 인구"
            dates={PEP.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 인구", color: "#78b7ed", values: PEP.rows.map((row) => row.population), dots: true }]}
            minimum={0}
            maximum={100000}
            unit="명"
            selected={pepIndex}
            onSelect={setPepIndex}
            description="Payne County 연간 Census PEP 인구. 쿠싱 시 인구(8,444)가 아니고 주택 호수가 아니며 바쁨이 아닙니다. 2019→2020은 빈티지 단절이며 0으로 채우지 않았습니다. 마지막 2024=84,199명."
          />
          <p className="mt-3 font-mono text-sm">{pep.year} · {pep.population.toLocaleString("en-US")}명</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County 연간 Census PEP 인구. 쿠싱 시 인구(8,444)가 아니고 주택 호수가 아니며 바쁨이 아닙니다. 2019=81,784명 다음 2020=81,649명은 빈티지 단절이며 메우지 않았습니다. 마지막 공개 연도 2024는 84,199명입니다. 2010년과 2020년 이동 요소는 부분 기간 공시이며 차트 값은 7월 1일 population입니다.</p>
        </div>
      ) : (
        <p role="status">카운티 인구 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {INCOME && income ? (
        <div>
          <ResearchChart
            id="cushing-bea-income-plot"
            title="Payne County 연간 BEA CAINC1 개인소득"
            dates={INCOME.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 개인소득", color: "#78b7ed", values: INCOME.rows.map((row) => row.personal_income_thousands_dollars), dots: true }]}
            minimum={0}
            maximum={4500000}
            unit="천 달러"
            selected={incomeIndex}
            onSelect={setIncomeIndex}
            description="Payne County 연간 BEA CAINC1 개인소득. 단위는 파일 그대로 천 달러이며 쿠싱 시 소득이 아니고 바쁨이 아닙니다. 2024=4,121,797."
          />
          <p className="mt-3 font-mono text-sm">{income.year} · {income.personal_income_thousands_dollars.toLocaleString("en-US")}천 달러</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County 연간 BEA CAINC1 개인소득. 단위는 파일 그대로 천 달러이며 쿠싱 시 소득이 아니고 인구·1인당이 아니며 바쁨이 아닙니다. 마지막 공개 연도 2024는 4,121,797천 달러입니다. 1969부터 2024까지 56년 공시 그대로이며 달러로 바꾸지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">카운티 개인소득 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {SOI && soi ? (
        <div>
          <ResearchChart
            id="cushing-irs-soi-plot"
            title="ZIP 74023 연간 IRS SOI 신고 건수"
            dates={SOI.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 신고 건수", color: "#edb958", values: SOI.rows.map((row) => row.returns_n1), dots: true }]}
            minimum={0}
            maximum={5000}
            unit="건"
            selected={soiIndex}
            onSelect={setSoiIndex}
            description="ZIP 74023 연간 IRS SOI 신고 건수. Payne County BEA 개인소득이 아니고 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다. 2016..2022 7년 공시 그대로이며 파일 표기 단위 그대로입니다."
          />
          <p className="mt-3 font-mono text-sm">{soi.year} · {soi.returns_n1.toLocaleString("en-US")}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">ZIP 74023 IRS SOI 연간 신고 건수. Payne County BEA 개인소득이 아니고 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다. 과세연도 2016부터 2022까지 7년 공시 그대로이며 신고 건수는 filed count 그대로입니다. 마지막 공개 연도 2022는 4,190건이며 AGI는 수천 달러 그대로 별도 열에 둡니다.</p>
        </div>
      ) : (
        <p role="status">ZIP 세금 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {VOC && voc ? (
        <div>
          <ResearchChart
            id="cushing-voc-plot"
            title="쿠싱 시 터미널 연간 VOC"
            dates={VOC.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 VOC", color: "#edb958", values: VOC.rows.map((row) => row.vocTons), dots: true }]}
            minimum={0}
            maximum={2000}
            unit="톤"
            selected={vocIndex}
            onSelect={setVocIndex}
            description="쿠싱 시 터미널류 시설 연간 VOC. 대기 질 지수가 아니고 바쁨이 아닙니다. 2024는 기존 091-WENVZ 1,206.389톤과 같습니다."
          />
          <p className="mt-3 font-mono text-sm">{voc.year} · {voc.vocTons.toLocaleString("en-US")}톤</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 터미널류 시설 연간 VOC. 대기 질 지수가 아니고 바쁨이 아닙니다. 2024는 기존 091-WENVZ 1,206.389톤과 같습니다.</p>
        </div>
      ) : (
        <p role="status">터미널 VOC 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {TRI && tri ? (
        <div>
          <ResearchChart
            id="cushing-tri-plot"
            title="쿠싱 시 TRI 현장 배출"
            dates={TRI.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 현장 배출", color: "#edb958", values: TRI.rows.map((row) => row.on_site_release_lb), dots: true }]}
            minimum={0}
            maximum={200000}
            unit="lb"
            selected={triIndex}
            onSelect={setTriIndex}
            description="쿠싱 시 TRI 현장 배출(lb). 독성 배출 신고이지 바쁨이 아닙니다. 2004–2023은 결측입니다. 2024년 0lb는 공시된 값입니다."
          />
          <p className="mt-3 font-mono text-sm">{tri.year} · {tri.on_site_release_lb.toLocaleString("en-US")}lb</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 TRI 현장 배출(lb). 독성 배출 신고이지 바쁨이 아닙니다. 2004–2023은 결측입니다. 2024년 0lb는 공시된 값입니다. 1989–2003 Evans vs 2024 Batch Plant 도시 합계이며 단일 시설 추세가 아닙니다. DEQ VOC 대체가 아닙니다.</p>
        </div>
      ) : (
        <p role="status">TRI 현장 배출 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {GHG && ghg ? (
        <div>
          <ResearchChart
            id="cushing-ghg-plot"
            title="쿠싱 시 EPA GHGRP 연간 CO2e"
            dates={GHG.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 CO2e", color: "#edb958", values: GHG.rows.map((row) => row.co2e_metric_tons), dots: true }]}
            minimum={0}
            maximum={60000}
            unit="tCO2e"
            selected={ghgIndex}
            onSelect={setGhgIndex}
            description="쿠싱 시 EPA GHGRP 연간 CO2e. TRI 파운드·VOC 톤이 아니고 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{ghg.year} · {ghg.co2e_metric_tons.toLocaleString("en-US")}tCO2e</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 EPA GHGRP 연간 CO2e. TRI 파운드·VOC 톤이 아니고 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다. 2016–2019 4년 공시 그대로이며 2010–2015와 2020–2023은 결측입니다. Battle Ridge Plant 단일 직접 배출원이며 주 전체가 아닙니다.</p>
        </div>
      ) : (
        <p role="status">GHGRP CO2e 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {PHMSA && PHMSA_YEARS && phmsa ? (
        <div>
          <ResearchChart
            id="cushing-phmsa-plot"
            title="쿠싱 시 PHMSA 위험액체 사고 연간 건수"
            dates={PHMSA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 사고", color: "#edb958", values: PHMSA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={20}
            unit="건"
            selected={phmsaIndex}
            onSelect={setPhmsaIndex}
            description="쿠싱 시 PHMSA 위험액체 사고 연간 건수 16년. 2010부터 2025. 합계 141건. 처리량이 아니고 바쁨이 아닙니다. 사상자 0."
          />
          <p className="mt-3 font-mono text-sm">{phmsa.year} · {phmsa.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 PHMSA 위험액체 사고 연간 건수. 처리량이 아니고 바쁨이 아닙니다. 사상자 0. 141건 모두 위험액체(HL) 신고이며 2010-01-11부터 2025-12-08 날짜 기록이다.</p>
        </div>
      ) : (
        <p role="status">PHMSA 사고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {FRA && FRA_YEARS && fra ? (
        <div>
          <ResearchChart
            id="cushing-fra-plot"
            title="쿠싱 시 FRA 철도건널목 사고 연간 건수"
            dates={FRA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 사고", color: "#edb958", values: FRA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={3}
            unit="건"
            selected={fraIndex}
            onSelect={setFraIndex}
            description="쿠싱 시 FRA 철도건널목 사고 연간 건수 3점. 1976·1980·1982 각 1건. 합계 3건. 처리량이 아니고 PHMSA가 아니며 바쁨이 아닙니다. 1983년 이후는 공개 행이 없어 비워 두었습니다."
          />
          <p className="mt-3 font-mono text-sm">{fra.year} · {fra.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 FRA 철도건널목 사고 연간 건수. 처리량이 아니고 PHMSA가 아니며 바쁨이 아닙니다. 1983년 이후는 공개 행이 없어 비워 두었습니다. 3건 모두 Form 57 신고이며 1976-10-15부터 1982-05-11 날짜 기록이다. 사상자는 사망 0·부상 1.</p>
        </div>
      ) : (
        <p role="status">FRA 사고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {NHTSA && NHTSA_YEARS && nhtsa ? (
        <div>
          <ResearchChart
            id="cushing-nhtsa-plot"
            title="쿠싱 시 신고 상용차 사고 연간 건수"
            dates={NHTSA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 사고", color: "#edb958", values: NHTSA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={20}
            unit="건"
            selected={nhtsaIndex}
            onSelect={setNhtsaIndex}
            description="쿠싱 시 신고 상용차(FMCSA) 사고 연간 건수 28년. 1993·1997·1999–2003·2005–2025 sparse, 합계 129건. FARS 사망자가 아니고 전체 사고가 아니며 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{nhtsa.year} · {nhtsa.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 신고 상용차(FMCSA) 사고 연간 건수. FARS 사망자가 아니고 전체 사고가 아니며 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다. 129건 모두 FMCSA 신고이며 1993-01-27부터 2025-10-06 날짜 기록이다. 신고 기준 사망 5·부상 99.</p>
        </div>
      ) : (
        <p role="status">FMCSA 사고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {OSHA && OSHA_YEARS && osha ? (
        <div>
          <ResearchChart
            id="cushing-osha-plot"
            title="쿠싱 시 ZIP 74023 OSHA 점검 연간 건수"
            dates={OSHA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 점검", color: "#edb958", values: OSHA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={25}
            unit="건"
            selected={oshaIndex}
            onSelect={setOshaIndex}
            description="쿠싱 시 ZIP 74023 OSHA 점검 연간 건수 43년. 1973부터 2026. 합계 162건. 고용이 아니고 벌금이 아니며 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{osha.year} · {osha.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 ZIP 74023 OSHA 점검 연간 건수. 고용이 아니고 벌금이 아니며 바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다. 162건 모두 IMIS 신고이며 1973-04-25부터 2026-08-14 날짜 기록이다. 위반 공개 86행 합계 354이며 미공개 76행은 null이다.</p>
        </div>
      ) : (
        <p role="status">OSHA 점검 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {ECHO && ECHO_YEARS && echo ? (
        <div>
          <ResearchChart
            id="cushing-echo-plot"
            title="쿠싱 시 EPA ECHO 대기 시설 최근 FCE 연간 건수"
            dates={ECHO_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 최근 FCE", color: "#edb958", values: ECHO_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={10}
            unit="건"
            selected={echoIndex}
            onSelect={setEchoIndex}
            description="쿠싱 시 EPA ECHO 대기 시설 최근 FCE 연간 건수 11년. 1998·2005·2006·2010·2015·2020·2022·2023·2024·2025·2026 sparse, 합계 29건. TRI·VOC가 아니고 바쁨이 아닙니다. 날짜가 없는 15곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{echo.year} · {echo.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 EPA ECHO 대기 시설 최근 FCE 연간 건수. TRI·VOC가 아니고 바쁨이 아닙니다. 날짜가 없는 15곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다. 44곳 중 29곳의 마지막 Full Compliance Evaluation일 1998-11-19부터 2026-05-05 날짜 기록이다. 카운티는 신고 기준 Payne 33·Lincoln 11이며 주 전체가 아니다.</p>
        </div>
      ) : (
        <p role="status">ECHO 최근 FCE 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {ECHO_CWA && ECHO_CWA_YEARS && echoCwa ? (
        <div>
          <ResearchChart
            id="cushing-echo-cwa-plot"
            title="쿠싱 시 EPA ECHO 수질(NPDES) 시설 최근 점검 연간 건수"
            dates={ECHO_CWA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 최근 점검", color: "#edb958", values: ECHO_CWA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={5}
            unit="건"
            selected={echoCwaIndex}
            onSelect={setEchoCwaIndex}
            description="쿠싱 시 EPA ECHO 수질(NPDES) 시설 최근 점검 연간 건수 2년. 2025=3·2026=1, 합계 4건. 대기 FCE가 아니고 바쁨이 아닙니다. 날짜가 없는 14곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{echoCwa.year} · {echoCwa.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 EPA ECHO 수질(NPDES) 시설 최근 점검 연간 건수. 대기 FCE가 아니고 바쁨이 아닙니다. 날짜가 없는 14곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다. 18허가 중 4곳의 마지막 CWA Inspection/Evaluation일 2025-04-10부터 2026-01-06 날짜 기록이다. ZIP-74023 CRUSHING 오기재 1행은 쿠싱 시가 아니어서 제외했으며 주 전체가 아니다.</p>
        </div>
      ) : (
        <p role="status">ECHO 수질 최근 점검 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {DMR && DMR_MONTHS && dmr ? (
        <div>
          <ResearchChart
            id="cushing-echo-dmr-plot"
            title="쿠싱 시 EPA ECHO DMR 유량 신고 월간 건수"
            dates={DMR_MONTHS.map((row) => `${row.period}-01`)}
            series={[{ label: "월간 유량 신고", color: "#78b7ed", values: DMR_MONTHS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={20}
            unit="건"
            selected={dmrIndex}
            onSelect={setDmrIndex}
            description="쿠싱 시 EPA ECHO DMR 유량 신고 월간 건수. 점검 횟수가 아니고 바쁨이 아닙니다. MGD와 gal/d를 한 축에 더하지 않았고, NODI 무방류는 0 유량으로 바꾸지 않았으며 행이 없는 달은 그리지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{dmr.period} · {dmr.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 EPA ECHO DMR 유량 신고 월간 건수. 점검 횟수가 아니고 바쁨이 아닙니다. MGD와 gal/d를 한 축에 더하지 않았고, NODI 무방류는 0 유량으로 바꾸지 않았으며 행이 없는 달은 그리지 않았습니다. 1722행 모두 CUSHING 신고 2015-01-31부터 2026-07-31 감시 종료월 기록이며 6허가 880수치·842 NODI 무방류다. CWA 최근 점검 연간 건수가 아니고 대기 FCE가 아니며 주 전체가 아니다.</p>
        </div>
      ) : (
        <p role="status">ECHO DMR 유량 신고 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {SDWIS && SDWIS_YEARS && sdwis ? (
        <div>
          <ResearchChart
            id="cushing-sdwis-plot"
            title="쿠싱 시 상수도 SDWIS 위반 연간 건수"
            dates={SDWIS_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 위반", color: "#edb958", values: SDWIS_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={25}
            unit="건"
            selected={sdwisIndex}
            onSelect={setSdwisIndex}
            description="쿠싱 시 상수도(PWS OK2006061) SDWIS 위반 연간 건수 2년. 2017=21·2024=2, 합계 23건. CWA 점검이 아니고 바쁨이 아닙니다. 시작일이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{sdwis.year} · {sdwis.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 상수도(PWS OK2006061) SDWIS 위반 연간 건수. CWA 점검이 아니고 바쁨이 아닙니다. 시작일이 없는 해는 0으로 채우지 않았습니다. 2017년 21건은 VOC 모니터링 행이 같은 시작일을 공유합니다. 23건 모두 PWS OK2006061 신고이며 2017-01-01부터 2024-10-17 준수 시작일 기록이다. 주 전체가 아니다.</p>
        </div>
      ) : (
        <p role="status">SDWIS 위반 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {RCRA && RCRA_YEARS && rcra ? (
        <div>
          <ResearchChart
            id="cushing-rcra-plot"
            title="쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 연간 건수"
            dates={RCRA_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 최근 점검", color: "#edb958", values: RCRA_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={5}
            unit="건"
            selected={rcraIndex}
            onSelect={setRcraIndex}
            description="쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 연간 건수 11년. 1985·1994·2001·2005·2008·2010·2011·2013·2014·2017·2021 sparse, 합계 17건. TRI 파운드가 아니고 바쁨이 아닙니다. 날짜가 없는 34곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{rcra.year} · {rcra.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 시 EPA ECHO RCRA 취급자 최근 점검 연간 건수. TRI 파운드가 아니고 바쁨이 아닙니다. 날짜가 없는 34곳은 그리지 않았고 행이 없는 해는 0으로 채우지 않았습니다. 51곳 중 17곳의 마지막 RCRA 점검일 1985-08-28부터 2021-07-15 날짜 기록이다. 창구간(2021-09-05..2026-09-30) 점검 횟수 합계 0은 공개된 값이며 별도 계열로 그리지 않았습니다. 주 전체가 아니다.</p>
        </div>
      ) : (
        <p role="status">RCRA 최근 점검 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {AQS && aqs ? (
        <div>
          <ResearchChart
            id="cushing-aqs-plot"
            title="Payne County Stillwater 모니터 연간 PM2.5"
            dates={AQS.rows.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 평균", color: "#78b7ed", values: AQS.rows.map((row) => row.annual_mean_ug_m3), dots: true }]}
            minimum={0}
            maximum={12}
            unit="µg/m³"
            selected={aqsIndex}
            onSelect={setAqsIndex}
            description="Payne County Stillwater 모니터(40-119-0614) 연간 PM2.5 5년. 1999부터 2003. 쿠싱 시 대기가 아니고 VOC가 아니며 바쁨이 아닙니다. 2003년은 공시된 2-관측 부분 연도이며 2004년 이후는 모니터가 없어 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{aqs.year} · {aqs.annual_mean_ug_m3}µg/m³</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County Stillwater 모니터 연간 PM2.5. 쿠싱 시 대기가 아니고 VOC가 아니며 바쁨이 아닙니다. 2003년은 공시된 2-관측 부분 연도이며 2004년 이후는 모니터가 없어 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">Stillwater PM2.5 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {NBI && NBI_YEARS && nbi ? (
        <div>
          <ResearchChart
            id="cushing-nbi-plot"
            title="Payne County FHWA NBI 교량 점검 연간 건수"
            dates={NBI_YEARS.map((row) => `${row.year}-07-01`)}
            series={[{ label: "연간 점검", color: "#edb958", values: NBI_YEARS.map((row) => row.count), dots: true }]}
            minimum={0}
            maximum={300}
            unit="건"
            selected={nbiIndex}
            onSelect={setNbiIndex}
            description="Payne County FHWA NBI 교량 점검 연간 건수 3년. 2022=27·2023=283·2024=74, 합계 384곳. Cushing 시 단독이 아니고 AADT·바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{nbi.year} · {nbi.count}건</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">Payne County FHWA NBI 교량 점검 연간 건수. Cushing 시 단독이 아니고 AADT·바쁨이 아닙니다. 행이 없는 해는 0으로 채우지 않았습니다. 384곳 모두 Payne County 신고(county 119)이며 2022-03부터 2024-01 Item-90 점검월 기록이다. FHWA NBI 2024 제출본 한 해 분량이며 여러 해 접합이 아니다. ADT는 교량별 filed 값 그대로이며 시계열이 아니다.</p>
        </div>
      ) : (
        <p role="status">NBI 점검 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {KCUH && kcuh ? (
        <div>
          <ResearchChart
            id="cushing-kcuh-plot"
            title="쿠싱 공항 일별 기온"
            dates={KCUH.rows.map((row) => row.date)}
            series={[
              { label: "일최고", color: "#edb958", values: KCUH.rows.map((row) => row.maxTempF) },
              { label: "일최저", color: "#78b7ed", values: KCUH.rows.map((row) => row.minTempF) },
            ]}
            minimum={0}
            maximum={120}
            unit="°F"
            selected={kcuhIndex}
            onSelect={setKcuhIndex}
            description="KCUH/CUH 일별 최고·최저기온 4269일. 2015-01-01부터 2026-09-08. 38일은 결측이며 0으로 채우지 않았습니다. 교란변수이며 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">
            {kcuh.date} · 최고 {kcuh.maxTempF === null ? "결측" : `${kcuh.maxTempF}°F`} · 최저 {kcuh.minTempF === null ? "결측" : `${kcuh.minTempF}°F`}
          </p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱 공항 일별 기온. 교란변수. 바쁨 아님. trace 강수는 결측으로 둡니다. 마지막 공개일 2026-09-08은 최고 102°F입니다.</p>
        </div>
      ) : (
        <p role="status">일별 기온 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {MESO_ROWS && meso ? (
        <div>
          <ResearchChart
            id="cushing-mesonet-plot"
            title="Mesonet OILT 일최고기온"
            dates={MESO_ROWS.map((row) => row.date)}
            series={[{ label: "일최고기온", color: "#edb958", values: MESO_ROWS.map((row) => row.tmaxF) }]}
            minimum={0}
            maximum={120}
            unit="°F"
            selected={mesoIndex}
            onSelect={setMesoIndex}
            description="쿠싱에서 24.3 km Mesonet OILT(Oilton) 일최고기온 4159일 공개. 2015-01-01부터 2026-09-08. 110일은 결측이며 0으로 채우지 않았습니다. KCUH 공항 기온이 아니고 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{meso.date} · 최고 {meso.tmaxF}°F</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 24.3 km Mesonet OILT(Oilton) 일최고기온. KCUH 공항 기온이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다. 마지막 공개일 2026-09-08은 최고 103.8°F입니다.</p>
        </div>
      ) : (
        <p role="status">Mesonet 일최고기온 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {MESO_RAIN_ROWS && mesoRain ? (
        <div>
          <ResearchChart
            id="cushing-mesonet-rain-plot"
            title="Mesonet OILT 일강수량"
            dates={MESO_RAIN_ROWS.map((row) => row.date)}
            series={[{ label: "일강수량", color: "#78b7ed", values: MESO_RAIN_ROWS.map((row) => row.rainIn) }]}
            minimum={0}
            maximum={5}
            unit="인치"
            selected={mesoRainIndex}
            onSelect={setMesoRainIndex}
            description="쿠싱에서 24.3 km Mesonet OILT(Oilton) 일강수량 4142일 공개. 2015-01-01부터 2026-09-08. 127일은 결측이며 0으로 채우지 않았습니다. GHCN 월강수·KCUH 공항이 아니고 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{mesoRain.date} · {mesoRain.rainIn}인치</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 24.3 km Mesonet OILT(Oilton) 일강수량. GHCN 월강수·KCUH 공항이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았고, 관측된 건조 0.00은 그대로 둡니다.</p>
        </div>
      ) : (
        <p role="status">Mesonet 일강수량 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {SOIL_ROWS && soil ? (
        <div>
          <ResearchChart
            id="cushing-mesonet-soil-plot"
            title="Mesonet OILT 일토양온도"
            dates={SOIL_ROWS.map((row) => row.date)}
            series={[{ label: "일토양온도", color: "#edb958", values: SOIL_ROWS.map((row) => row.savgF) }]}
            minimum={0}
            maximum={100}
            unit="°F"
            selected={soilIndex}
            onSelect={setSoilIndex}
            description="쿠싱에서 24.3 km Mesonet OILT(Oilton) 10cm 잔디 밑 지온 4081일 공개. 2015-01-01부터 2026-09-08. 188일은 결측이며 0으로 채우지 않았습니다. 공기 최고기온·강수가 아니고 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{soil.date} · {soil.savgF}°F</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 24.3 km Mesonet OILT(Oilton) 10cm 잔디 밑 지온. 공기 최고기온·강수가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다. 토양수분이 아니며 .mts 경로에 수분 공개가 없습니다.</p>
        </div>
      ) : (
        <p role="status">Mesonet 일토양온도 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {HUM_ROWS && hum ? (
        <div>
          <ResearchChart
            id="cushing-mesonet-humidity-plot"
            title="Mesonet OILT 일평균 상대습도"
            dates={HUM_ROWS.map((row) => row.date)}
            series={[{ label: "일평균 상대습도", color: "#78b7ed", values: HUM_ROWS.map((row) => row.havgPct) }]}
            minimum={0}
            maximum={100}
            unit="%"
            selected={humIndex}
            onSelect={setHumIndex}
            description="쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 상대습도 4155일 공개. 2015-01-01부터 2026-09-08. 114일은 결측이며 0으로 채우지 않았습니다. 공기 최고기온·강수·지온이 아니고 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{hum.date} · {hum.havgPct}%</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 상대습도. 공기 최고기온·강수·지온이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">Mesonet 일평균 상대습도 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {WIND_ROWS && wind ? (
        <div>
          <ResearchChart
            id="cushing-mesonet-wind-plot"
            title="Mesonet OILT 일평균 풍속"
            dates={WIND_ROWS.map((row) => row.date)}
            series={[{ label: "일평균 풍속", color: "#78b7ed", values: WIND_ROWS.map((row) => row.wspdMph) }]}
            minimum={0}
            maximum={25}
            unit="mph"
            selected={windIndex}
            onSelect={setWindIndex}
            description="쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 풍속 3997일 공개. 2015-01-01부터 2026-09-08. 272일은 결측이며 0으로 채우지 않았습니다. 공기 최고기온·강수·지온·습도가 아니고 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{wind.date} · {wind.wspdMph}mph</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 풍속. 공기 최고기온·강수·지온·습도가 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">Mesonet 일평균 풍속 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {PRES_ROWS && pres ? (
        <div>
          <ResearchChart
            id="cushing-mesonet-pressure-plot"
            title="Mesonet OILT 일평균 정지기압"
            dates={PRES_ROWS.map((row) => row.date)}
            series={[{ label: "일평균 정지기압", color: "#78b7ed", values: PRES_ROWS.map((row) => row.pavgInhg) }]}
            minimum={28}
            maximum={30}
            unit="inHg"
            selected={presIndex}
            onSelect={setPresIndex}
            description="쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 정지기압 4165일 공개. 2015-01-01부터 2026-09-08. 104일은 결측이며 0으로 채우지 않았습니다. 공기 최고기온·강수·지온·습도·풍속이 아니고 바쁨이 아닙니다."
          />
          <p className="mt-3 font-mono text-sm">{pres.date} · {pres.pavgInhg}inHg</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">쿠싱에서 24.3 km Mesonet OILT(Oilton) 일평균 정지기압. 공기 최고기온·강수·지온·습도·풍속이 아니고 바쁨이 아닙니다. 결측일은 0으로 채우지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">Mesonet 일평균 정지기압 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {DRT && drt ? (
        <div>
          <ResearchChart
            id="cushing-drought-plot"
            title="페이네 카운티 미국 가뭄모니터 주간 D0 이상 면적 비율"
            dates={DRT.rows.map((row) => row.mapDate)}
            series={[{ label: "주간 D0 이상 면적 비율", color: "#edb958", values: DRT.rows.map((row) => row.d0) }]}
            minimum={0}
            maximum={100}
            unit="%"
            selected={drtIndex}
            onSelect={setDrtIndex}
            description="페이네 카운티 미국 가뭄모니터 주간 D0 이상 면적 비율 610주. 2014-12-30부터 2026-09-01. 쿠싱 시가 아니고 Mesonet 강수가 아니며 바쁨이 아닙니다. 결측 주는 0으로 채우지 않았습니다."
          />
          <p className="mt-3 font-mono text-sm">{drt.mapDate} · D0 이상 {drt.d0 === null ? "결측" : `${drt.d0}%`}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">페이네 카운티 미국 가뭄모니터 주간 D0 이상 면적 비율(카운티 면적 %). 쿠싱 시가 아니고 Mesonet 강수가 아니며 바쁨이 아닙니다. 결측 주는 0으로 채우지 않았습니다. 2014-12-30부터 2026-09-01까지 610주 화요일 mapDate 그대로이며 FIPS 40119입니다. 마지막 공개주 2026-09-01은 D0 이상 100%입니다.</p>
        </div>
      ) : (
        <p role="status">가뭄 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {QCEW ? (
        <div>
          <p className="text-sm font-medium">페이네 카운티 산업 분류 · 2025-Q1</p>
          <p className="mt-2 font-mono text-sm">2025-03</p>
          <ul className="mt-2 space-y-2 text-sm leading-7">
            {QCEW.rows.map((row) => (
              <li key={`${row.ownCode}-${row.industryCode}`} className="border-t border-border pt-2">
                <strong>{qcewLabel(row.industryCode)}</strong>
                {" · "}
                {row.month3 === null ? "공시제한" : `${row.month3.toLocaleString("en-US")}명`}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            BLS QCEW 지역 40119. 페이네 카운티 전체이며 쿠싱 시·탱크팜 인원이 아닙니다. Stillwater·OSU가 카운티를 지배합니다. 비공개 칸을 0으로 채우지 않았습니다.
          </p>
        </div>
      ) : (
        <p role="status">페이네 카운티 고용 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {NEWS ? (
        <div>
          <p className="text-sm font-medium">날짜 있는 산업 소식</p>
          <ul className="mt-2 space-y-2 text-sm leading-7">
            {NEWS.map((row) => (
              <li key={row.url} className="border-t border-border pt-2">
                <strong>{row.publishedAt.slice(0, 16).replace("T", " ")} UTC</strong>
                {" · "}
                {row.title}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            고정 감사 79행 중 Cushing 지명+산업 큐이면서 발표 시각이 있는 행만 둡니다. 지금 1건입니다. 기사 수는 활동량이 아닙니다.
          </p>
        </div>
      ) : (
        <p role="status">산업 소식 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      {DEQ ? (
        <div>
          <p className="text-sm font-medium">인허가 상태 사건</p>
          <ul className="mt-2 space-y-2 text-sm leading-7">
            {DEQ.map((row) => (
              <li key={row.permit} className="border-t border-border pt-2">
                <strong>{row.facility}</strong> · {row.permit} · {DEQ_STATUS[row.status] ?? row.status}
                {row.receiptDate ? ` · 접수 ${row.receiptDate}` : " · 접수일 미확인"}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">공사량·작업 시작일이 아닙니다. 없는 날짜를 채워 넣지 않았습니다.</p>
        </div>
      ) : (
        <p role="status">인허가 표시 자료 검증 실패. 원문을 확인하세요.</p>
      )}
      <div>
        <p className="text-sm font-medium">쿠싱 공항 날씨</p>
        {weather?.data || weather?.error ? (
          <>
            {metar ? (
              <p className="mt-2 font-mono text-sm">
                {metar.observedAt.slice(0, 16).replace("T", " ")} UTC · 시정 {metar.visib} SM · 바람 {metar.windKt ?? "—"} kt · {metar.cover || "운량 없음"}
                {metar.temperatureC !== null ? ` · ${metar.temperatureC}°C` : ""}
              </p>
            ) : null}
            {weather?.error ? <p className="mt-2 text-sm text-muted-foreground">{weather.error}</p> : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">날씨는 상세 보드에서 조회합니다.</p>
        )}
        <p className="mt-1 text-xs leading-6 text-muted-foreground">KCUH METAR. 교란요인이며 현장 인원·트럭·재고가 아닙니다.</p>
      </div>
    </div>
  );
}
