import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingAadt, readCushingBps, readCushingDeq, readCushingMonthlyStocks, readCushingStocks } from "../app/lib/cushing-context.ts";
import { datedCushingEvents, readCushingNews } from "../app/lib/cushing-news.ts";
import { marchEmployment, readPayneQcew } from "../app/lib/cushing-qcew.ts";
import { quarterEmployment, readPayneQcewQuarterly } from "../app/lib/cushing-qcew-quarterly.ts";
import { readCushingEnrollment } from "../app/lib/cushing-enrollment.ts";
import { readKushMonthly } from "../app/lib/cushing-kush.ts";
import { readKcuhDaily } from "../app/lib/cushing-kcuh.ts";
import { readMesonetDaily } from "../app/lib/cushing-mesonet.ts";
import { daySoil, readMesonetSoilDaily } from "../app/lib/cushing-mesonet-soil.ts";
import { readCushingPhmsa } from "../app/lib/cushing-phmsa.ts";
import { readCushingFra } from "../app/lib/cushing-fra.ts";
import { readCushingNhtsa } from "../app/lib/cushing-nhtsa.ts";
import { readCushingOsha } from "../app/lib/cushing-osha.ts";
import { readCushingEcho } from "../app/lib/cushing-echo.ts";
import { readCushingEchoCwa } from "../app/lib/cushing-echo-cwa.ts";
import { readCushingRcra } from "../app/lib/cushing-rcra.ts";
import { readCushingSdwis } from "../app/lib/cushing-sdwis.ts";
import { readCushingStorm } from "../app/lib/cushing-storm.ts";
import { readCushingFema } from "../app/lib/cushing-fema.ts";
import { readCushingAqs, yearAqsMean } from "../app/lib/cushing-aqs.ts";
import { readCushingIrsSoi, yearIrsSoi } from "../app/lib/cushing-irs-soi.ts";
import { nbiBridgesInspectedInYear, nbiBridgesOn, readCushingNbi } from "../app/lib/cushing-nbi.ts";
import { readPayneLodesAnnual, yearWorkplaceJobs } from "../app/lib/cushing-lodes.ts";
import { readPayneDroughtWeekly, weekDrought } from "../app/lib/cushing-drought.ts";
import { readCushingWqp, wqpSamplesOn } from "../app/lib/cushing-wqp.ts";
import { parseCushingWeather } from "../app/lib/cushing-weather.ts";
import { readCushingWeather } from "../app/lib/cushing-weather.server.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const stocks = await readFile(new URL("20260909T091EIAZ/cushing_stocks_weekly.csv", base), "utf8");
const monthly = await readFile(new URL("20260909T091EIAMZ/cushing_stocks_monthly.csv", base), "utf8");
const bps = await readFile(new URL("20260909T091BOARDZ/bps-cushing-monthly.csv", base), "utf8");
const aadt = JSON.parse(await readFile(new URL("20260909T091BOARDZ/aadt-east-main.json", base), "utf8"));
const deq = JSON.parse(await readFile(new URL("20260909T091BOARDZ/deq-events.json", base), "utf8"));
const qcew = JSON.parse(await readFile(new URL("20260909T091QCEWZ/payne_qcew_2025q1.json", base), "utf8"));
const qcewQ = JSON.parse(await readFile(new URL("20260909T091QCEWQZ/payne_qcew_quarterly.json", base), "utf8"));
const news = JSON.parse(await readFile(new URL("20260909T091ZBOARDZ/events.json", base), "utf8"));
const enroll = JSON.parse(await readFile(new URL("20260910T091PENRZ/cushing_hs_enrollment.json", base), "utf8"));
const kush = JSON.parse(await readFile(new URL("20260910T091KUSHZ/kush_operational_attention_monthly.json", base), "utf8"));
const kcuh = JSON.parse(await readFile(new URL("20260910T091KCUHZ/kcuh_daily_weather.json", base), "utf8"));
const mesonet = JSON.parse(await readFile(new URL("20260910T091MESOZ/mesonet_oilt_daily.json", base), "utf8"));
const soil = JSON.parse(await readFile(new URL("20260910T091SOILZ/mesonet_oilt_soil_daily.json", base), "utf8"));
const phmsa = JSON.parse(await readFile(new URL("20260910T091PHMSAZ/cushing_phmsa_incidents.json", base), "utf8"));
const fra = JSON.parse(await readFile(new URL("20260910T091FRAZ/cushing_fra_incidents.json", base), "utf8"));
const nhtsa = JSON.parse(await readFile(new URL("20260910T091NHTSAZ/cushing_nhtsa_crashes.json", base), "utf8"));
const osha = JSON.parse(await readFile(new URL("20260910T091OSHAZ/cushing_osha_inspections.json", base), "utf8"));
const echo = JSON.parse(await readFile(new URL("20260910T091ECHOZ/cushing_echo_air_inspections.json", base), "utf8"));
const cwa = JSON.parse(await readFile(new URL("20260910T091CWAZ/cushing_echo_cwa_inspections.json", base), "utf8"));
const rcra = JSON.parse(await readFile(new URL("20260910T091RCRAZ/cushing_rcra_handlers.json", base), "utf8"));
const sdwis = JSON.parse(await readFile(new URL("20260910T091SDWISZ/cushing_sdwis_violations.json", base), "utf8"));
const storm = JSON.parse(await readFile(new URL("20260910T091STMZ/cushing_storm_events.json", base), "utf8"));
const fema = JSON.parse(await readFile(new URL("20260910T091FEMAZ/cushing_fema_declarations.json", base), "utf8"));
const aqs = JSON.parse(await readFile(new URL("20260910T091AQSZ/payne_pm25_stillwater_annual.json", base), "utf8"));
const soi = JSON.parse(await readFile(new URL("20260910T091SOIZ/zip_74023_income_tax_annual.json", base), "utf8"));
const nbi = JSON.parse(await readFile(new URL("20260910T091NBIZ/cushing_nbi_bridges.json", base), "utf8"));
const lodes = JSON.parse(await readFile(new URL("20260910T091LODEZ/payne_lodes_annual.json", base), "utf8"));
const drought = JSON.parse(await readFile(new URL("20260910T091DRTZ/payne_drought_weekly.json", base), "utf8"));
const wqp = JSON.parse(await readFile(new URL("20260910T091WQPZ/cushing_wqp_ph.json", base), "utf8"));

test("cushing board context keeps stocks, annual traffic and housing units without filling gaps", () => {
  const weekly = readCushingStocks(stocks);
  assert.equal(weekly.length, 1169);
  assert.equal(weekly[0].date, "2004-04-09");
  assert.equal(weekly.at(-1).stockKbbl, 22508);
  assert.equal(weekly.reduce((n, row) => n + row.stockKbbl, 0), 40862385);
  const months = readCushingMonthlyStocks(monthly);
  assert.equal(months.length, 270);
  assert.equal(months[0].month, "2004-01");
  assert.equal(months.at(-1).month, "2026-06");
  assert.equal(months.at(-1).stockKbbl, 19515);
  assert.equal(months.reduce((n, row) => n + row.stockKbbl, 0), 9427093);
  const roads = readCushingAadt(aadt);
  assert.equal(roads.length, 11);
  assert.equal(roads.at(-1).trucks, 291);
  assert.equal(roads.filter((row) => row.trucks === null).length, 10);
  const permits = readCushingBps(bps);
  assert.equal(permits.length, 31);
  assert.equal(permits.reduce((n, row) => n + row.units, 0), 29);
  assert.equal(permits.at(-1).month, "2026-07");
  const events = readCushingDeq(deq);
  assert.equal(events.length, 3);
  assert.equal(events.filter((row) => row.receiptDate).length, 1);
  const county = readPayneQcew(qcew);
  assert.equal(county.geography, "Payne County, Oklahoma");
  assert.equal(marchEmployment(county, "0", "10"), 35418);
  assert.equal(marchEmployment(county, "5", "211"), null);
  const quarters = readPayneQcewQuarterly(qcewQ);
  assert.equal(quarters.rows.length, 45);
  assert.equal(quarterEmployment(quarters, 2026, 1).totalCovered, 35001);
  assert.equal(quarterEmployment(quarters, 2025, 1).totalCovered, 35418);
  const cues = datedCushingEvents(readCushingNews(news));
  assert.equal(cues.length, 1);
  assert.equal(cues[0].publishedAt, "2026-09-07T15:59:45+00:00");
});

test("cushing board context keeps enrollment gap and kush zeros without inventing values", () => {
  const school = readCushingEnrollment(enroll);
  assert.equal(school.rows.length, 5);
  assert.equal(school.rows.reduce((n, row) => n + row.enrollment, 0), 2532);
  assert.equal(school.rows.at(-1).schoolYear, "2024-25");
  assert.equal(school.rows.at(-1).enrollment, 529);
  assert.equal(school.rows.some((row) => row.schoolYear === "2023-24"), false);
  const attention = readKushMonthly(kush);
  assert.equal(attention.rows.length, 221);
  assert.equal(attention.rows.reduce((n, row) => n + row.articleCount, 0), 101);
  assert.equal(attention.rows.at(-1).month, "2026-06-01");
  assert.equal(attention.rows.at(-1).articleCount, 1);
});

test("cushing board context keeps phmsa annual incident counts without filling gaps", () => {
  const series = readCushingPhmsa(phmsa);
  assert.equal(series.rows.length, 141);
  assert.equal(series.rows[0].incidentDate, "2010-01-11");
  assert.equal(series.rows.at(-1).incidentDate, "2025-12-08");
  const counts = {};
  let fatalities = 0;
  let injuries = 0;
  for (const row of series.rows) {
    const year = row.incidentDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
    fatalities += row.fatalities;
    injuries += row.injuries;
  }
  assert.deepEqual(counts, {
    2010: 8, 2011: 13, 2012: 12, 2013: 14, 2014: 12, 2015: 10, 2016: 11, 2017: 8,
    2018: 9, 2019: 8, 2020: 6, 2021: 8, 2022: 9, 2023: 6, 2024: 4, 2025: 3,
  });
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 141);
  assert.equal(fatalities, 0);
  assert.equal(injuries, 0);
});

test("cushing board context keeps fra annual incident counts without filling gaps", () => {
  const series = readCushingFra(fra);
  assert.equal(series.rows.length, 3);
  assert.equal(series.rows[0].incidentDate, "1976-10-15");
  assert.equal(series.rows.at(-1).incidentDate, "1982-05-11");
  const counts = {};
  let killed = 0;
  let injured = 0;
  for (const row of series.rows) {
    const year = row.incidentDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
    killed += row.killed;
    injured += row.injured;
  }
  assert.deepEqual(counts, { 1976: 1, 1980: 1, 1982: 1 });
  assert.equal(Object.keys(counts).length, 3);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 3);
  assert.equal(killed, 0);
  assert.equal(injured, 1);
});

test("cushing board context keeps nhtsa annual crash counts without filling gaps", () => {
  const series = readCushingNhtsa(nhtsa);
  assert.equal(series.rows.length, 129);
  assert.equal(series.rows[0].crashDate, "1993-01-27");
  assert.equal(series.rows.at(-1).crashDate, "2025-10-06");
  const counts = {};
  let fatalities = 0;
  let injuries = 0;
  for (const row of series.rows) {
    const year = row.crashDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
    fatalities += row.fatalities;
    injuries += row.injuries;
  }
  assert.deepEqual(counts, {
    1993: 2, 1997: 1, 1999: 1, 2000: 2, 2001: 2, 2002: 1, 2003: 1, 2005: 3,
    2006: 1, 2007: 3, 2008: 2, 2009: 1, 2010: 2, 2011: 1, 2012: 9, 2013: 16,
    2014: 17, 2015: 8, 2016: 5, 2017: 7, 2018: 4, 2019: 5, 2020: 5, 2021: 10,
    2022: 4, 2023: 3, 2024: 5, 2025: 8,
  });
  assert.equal(Object.keys(counts).length, 28);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 129);
  assert.equal(counts["1994"], undefined);
  assert.equal(counts["2004"], undefined);
  assert.equal(fatalities, 5);
  assert.equal(injuries, 99);
});

test("cushing board context keeps osha annual inspection counts without filling gaps", () => {
  const series = readCushingOsha(osha);
  assert.equal(series.rows.length, 162);
  assert.equal(series.rows[0].inspectionDate, "1973-04-25");
  assert.equal(series.rows.at(-1).inspectionDate, "2026-08-14");
  const counts = {};
  let disclosed = 0;
  let violationsSum = 0;
  for (const row of series.rows) {
    const year = row.inspectionDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
    if (row.violations === null) continue;
    disclosed += 1;
    violationsSum += row.violations;
  }
  assert.deepEqual(counts, {
    1973: 2, 1974: 2, 1975: 23, 1976: 8, 1977: 1, 1979: 6, 1980: 4, 1981: 3,
    1982: 2, 1983: 10, 1985: 2, 1986: 1, 1987: 6, 1988: 1, 1989: 3, 1990: 10,
    1991: 2, 1992: 5, 1993: 6, 1994: 1, 1996: 2, 1997: 3, 1998: 5, 2000: 1,
    2002: 2, 2003: 5, 2004: 6, 2005: 4, 2006: 1, 2008: 5, 2009: 2, 2012: 1,
    2013: 2, 2014: 2, 2016: 1, 2017: 3, 2018: 1, 2019: 3, 2022: 3, 2023: 2,
    2024: 6, 2025: 2, 2026: 2,
  });
  assert.equal(Object.keys(counts).length, 43);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 162);
  for (const missing of ["1978", "1984", "1995", "1999", "2001", "2007", "2010", "2011", "2015", "2020", "2021"]) {
    assert.equal(counts[missing], undefined);
  }
  assert.equal(disclosed, 86);
  assert.equal(violationsSum, 354);
});

test("cushing board context keeps echo last-fce annual counts without filling gaps", () => {
  const series = readCushingEcho(echo);
  assert.equal(series.runId, "20260910T091ECHOZ");
  assert.equal(series.rows.length, 44);
  assert.equal(series.rows[0].inspectionDate, "1998-11-19");
  assert.equal(series.rows[28].inspectionDate, "2026-05-05");
  assert.equal(series.rows.at(-1).inspectionDate, null);
  const counts = {};
  let dated = 0;
  let payne = 0;
  let lincoln = 0;
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    if (row.county === "Payne") payne += 1;
    else if (row.county === "Lincoln") lincoln += 1;
    else assert.fail(`unexpected county ${row.county}`);
    if (row.inspectionDate === null) continue;
    dated += 1;
    const year = row.inspectionDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
  }
  assert.deepEqual(counts, {
    1998: 1, 2005: 2, 2006: 2, 2010: 1, 2015: 1, 2020: 3, 2022: 1,
    2023: 3, 2024: 5, 2025: 6, 2026: 4,
  });
  assert.equal(Object.keys(counts).length, 11);
  assert.equal(dated, 29);
  assert.equal(series.rows.length - dated, 15);
  assert.equal(payne + lincoln, 44);
  assert.equal(payne, 33);
  assert.equal(lincoln, 11);
  for (const missing of ["1999", "2007", "2016", "2021"]) {
    assert.equal(counts[missing], undefined);
  }
});

test("cushing board context keeps echo cwa last-inspection annual counts without filling gaps", () => {
  const series = readCushingEchoCwa(cwa);
  assert.equal(series.runId, "20260910T091CWAZ");
  assert.equal(series.rows.length, 18);
  assert.equal(series.rows[0].lastInspectionDate, "2025-04-10");
  assert.equal(series.rows[3].lastInspectionDate, "2026-01-06");
  assert.equal(series.rows.at(-1).lastInspectionDate, null);
  const counts = {};
  let dated = 0;
  let countSum = 0;
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    assert.ok(!row.sourceId.startsWith("OK0000004"));
    countSum += row.inspectionCount;
    if (row.lastInspectionDate === null) continue;
    assert.equal(row.lastInspectionType, "Base Program - Evaluation");
    dated += 1;
    const year = row.lastInspectionDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
  }
  assert.deepEqual(counts, { 2025: 3, 2026: 1 });
  assert.equal(Object.keys(counts).length, 2);
  assert.equal(dated, 4);
  assert.equal(series.rows.length - dated, 14);
  assert.equal(countSum, 19);
  assert.equal(counts["2024"], undefined);
});

test("cushing board context keeps rcra last-inspection annual counts without filling gaps", () => {
  const series = readCushingRcra(rcra);
  assert.equal(series.runId, "20260910T091RCRAZ");
  assert.equal(series.rows.length, 51);
  assert.equal(series.rows[0].lastInspectionDate, "1985-08-28");
  assert.equal(series.rows[16].lastInspectionDate, "2021-07-15");
  assert.equal(series.rows.at(-1).lastInspectionDate, null);
  const counts = {};
  let dated = 0;
  let countSum = 0;
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    assert.match(row.sourceId, /^OK/);
    assert.ok(!row.sourceId.startsWith("OK0026701"));
    assert.ok(!row.sourceId.startsWith("OK0000004"));
    countSum += row.inspectionCount;
    if (row.lastInspectionDate === null) continue;
    dated += 1;
    const year = row.lastInspectionDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
  }
  assert.deepEqual(counts, {
    1985: 1, 1994: 2, 2001: 1, 2005: 1, 2008: 1, 2010: 2,
    2011: 1, 2013: 3, 2014: 1, 2017: 3, 2021: 1,
  });
  assert.equal(Object.keys(counts).length, 11);
  assert.equal(dated, 17);
  assert.equal(series.rows.length - dated, 34);
  assert.equal(countSum, 0);
  for (const missing of ["1986", "2000", "2015", "2020"]) {
    assert.equal(counts[missing], undefined);
  }
});

test("cushing board context keeps sdwis annual violation counts without filling gaps", () => {
  const series = readCushingSdwis(sdwis);
  assert.equal(series.runId, "20260910T091SDWISZ");
  assert.equal(series.pwsId, "OK2006061");
  assert.equal(series.rows.length, 23);
  assert.equal(series.rows[0].complianceBeginDate, "2017-01-01");
  assert.equal(series.rows.at(-1).complianceBeginDate, "2024-10-17");
  const counts = {};
  let enforcementSum = 0;
  for (const row of series.rows) {
    assert.equal(row.pwsId, "OK2006061");
    assert.equal(row.systemName, "CUSHING");
    assert.ok(!row.federalRule.includes("Clean Water Act"));
    enforcementSum += row.enforcementCount;
    const year = row.complianceBeginDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
  }
  assert.deepEqual(counts, { 2017: 21, 2024: 2 });
  assert.equal(Object.keys(counts).length, 2);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 23);
  assert.equal(enforcementSum, 4);
  assert.equal(counts["2018"], undefined);
  assert.equal(counts["2023"], undefined);
});

test("cushing board context keeps payne county storm monthly counts without filling gaps", () => {
  const series = readCushingStorm(storm);
  assert.equal(series.runId, "20260910T091STMZ");
  assert.equal(series.rows.length, 112);
  assert.equal(series.rows[0].beginDate, "2024-01-13");
  assert.equal(series.rows.at(-1).beginDate, "2026-05-08");
  const counts = {};
  let injuries = 0;
  let deaths = 0;
  let magnitudeDisclosed = 0;
  for (const row of series.rows) {
    const month = row.beginDate.slice(0, 7);
    counts[month] = (counts[month] ?? 0) + 1;
    injuries += row.injuriesDirect + row.injuriesIndirect;
    deaths += row.deathsDirect + row.deathsIndirect;
    if (row.magnitude !== null) magnitudeDisclosed += 1;
  }
  assert.deepEqual(counts, {
    "2024-01": 5, "2024-04": 5, "2024-05": 7, "2024-06": 6, "2024-07": 9,
    "2024-08": 13, "2024-09": 2, "2024-11": 1, "2025-01": 3, "2025-02": 3,
    "2025-03": 5, "2025-04": 2, "2025-05": 9, "2025-06": 6, "2025-07": 10,
    "2025-08": 9, "2025-10": 1, "2025-11": 4, "2026-01": 3, "2026-03": 2,
    "2026-04": 4, "2026-05": 3,
  });
  assert.equal(Object.keys(counts).length, 22);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 112);
  for (const missing of ["2024-02", "2024-03", "2024-10", "2024-12", "2025-09", "2025-12", "2026-02"]) {
    assert.equal(counts[missing], undefined);
  }
  assert.equal(injuries, 10);
  assert.equal(deaths, 0);
  assert.equal(magnitudeDisclosed, 44);
});

test("cushing board context keeps payne county fema annual designation counts without filling gaps", () => {
  const series = readCushingFema(fema);
  assert.equal(series.runId, "20260910T091FEMAZ");
  assert.equal(series.rows.length, 39);
  assert.equal(series.rows[0].declarationDate, "1974-06-10");
  assert.equal(series.rows[0].femaDeclarationString, "DR-441-OK");
  assert.equal(series.rows.at(-1).declarationDate, "2025-05-21");
  assert.equal(series.rows.at(-1).femaDeclarationString, "DR-4866-OK");
  const counts = {};
  const mix = { DR: 0, EM: 0, FM: 0 };
  for (const row of series.rows) {
    const year = row.declarationDate.slice(0, 4);
    counts[year] = (counts[year] ?? 0) + 1;
    mix[row.declarationType] += 1;
  }
  assert.deepEqual(counts, {
    1974: 2, 1975: 1, 1982: 1, 1984: 1, 1986: 1, 1990: 1, 1993: 1,
    1996: 1, 1999: 1, 2001: 2, 2002: 1, 2003: 1, 2005: 1, 2006: 2,
    2007: 4, 2009: 2, 2010: 2, 2011: 1, 2012: 2, 2019: 1, 2020: 3,
    2021: 2, 2023: 1, 2024: 1, 2025: 3,
  });
  assert.equal(Object.keys(counts).length, 25);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), 39);
  assert.deepEqual(mix, { DR: 24, EM: 8, FM: 7 });
  for (const missing of ["1976", "2000", "2015", "2022"]) {
    assert.equal(counts[missing], undefined);
  }
});

test("cushing board context keeps payne stillwater annual pm2.5 without filling gaps", () => {
  const series = readCushingAqs(aqs);
  assert.equal(series.geography, "Payne County, Oklahoma (Stillwater monitor 40-119-0614)");
  assert.equal(series.rows.length, 5);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [1999, 2000, 2001, 2002, 2003],
  );
  assert.deepEqual(
    series.rows.map((row) => row.obs_count),
    [39, 54, 60, 60, 2],
  );
  const sum = series.rows.reduce((n, row) => n + row.annual_mean_ug_m3, 0);
  assert.ok(Math.abs(sum - 46.525954) < 1e-9);
  assert.equal(yearAqsMean(series, 2000).annual_mean_ug_m3, 10.635185);
  assert.equal(yearAqsMean(series, 2003).annual_mean_ug_m3, 6.7);
  assert.equal(yearAqsMean(series, 2004), null);
  const relabeled = structuredClone(aqs);
  relabeled.geography = "Cushing city, Oklahoma";
  assert.equal(readCushingAqs(relabeled), null);
});

test("cushing board context keeps zip 74023 irs soi annual tax stats without filling gaps", () => {
  const series = readCushingIrsSoi(soi);
  assert.equal(series.geography, "ZIP 74023, Oklahoma (Cushing)");
  assert.equal(series.zipCode, "74023");
  assert.equal(series.frequency, "annual");
  assert.equal(series.rows.length, 7);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2016, 2017, 2018, 2019, 2020, 2021, 2022],
  );
  assert.equal(
    series.rows.reduce((n, row) => n + row.returns_n1, 0),
    29330,
  );
  assert.equal(
    series.rows.reduce((n, row) => n + row.agi_thousands_dollars, 0),
    1634370,
  );
  assert.deepEqual(yearIrsSoi(series, 2022), {
    year: 2022,
    returns_n1: 4190,
    agi_thousands_dollars: 250763,
  });
  assert.equal(yearIrsSoi(series, 2023), null);
  const countyRelabeled = structuredClone(soi);
  countyRelabeled.geography = "Payne County, Oklahoma";
  countyRelabeled.zipCode = "40119";
  assert.equal(readCushingIrsSoi(countyRelabeled), null);
});

test("cushing board context keeps payne county nbi annual inspection counts without filling gaps", () => {
  const series = readCushingNbi(nbi);
  assert.equal(series.runId, "20260910T091NBIZ");
  assert.equal(series.inventoryYear, "2024");
  assert.equal(series.rows.length, 384);
  assert.equal(series.rows[0].inspectionYm, "2022-03");
  assert.equal(series.rows.at(-1).inspectionYm, "2024-01");
  for (const row of series.rows) {
    assert.equal(row.countyCode, "119");
    assert.notEqual(row.placeCode, "18850");
  }
  assert.equal(nbiBridgesInspectedInYear(series, 2022), 27);
  assert.equal(nbiBridgesInspectedInYear(series, 2023), 283);
  assert.equal(nbiBridgesInspectedInYear(series, 2024), 74);
  assert.equal(nbiBridgesInspectedInYear(series, 2021), 0);
  assert.deepEqual(nbiBridgesOn(series, "2021-06"), []);
  // ADT는 교량별 filed 값 그대로이며 시계열이 아니다.
  assert.deepEqual([...new Set(series.rows.map((row) => row.adtYear))], ["2022"]);
});

test("cushing board context keeps payne county lodes annual workplace jobs without filling gaps", () => {
  const series = readPayneLodesAnnual(lodes);
  assert.equal(series.runId, "20260910T091LODEZ");
  assert.equal(series.areaFips, "40119");
  assert.equal(series.geography, "Payne County, Oklahoma");
  assert.equal(series.segment, "S000");
  assert.equal(series.jobType, "JT00");
  assert.equal(series.column, "C000");
  assert.equal(series.rows.length, 22);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
  );
  assert.equal(
    series.rows.reduce((n, row) => n + row.jobs, 0),
    713340,
  );
  assert.deepEqual(yearWorkplaceJobs(series, 2023), { year: 2023, blocks: 701, jobs: 35589 });
  assert.deepEqual(yearWorkplaceJobs(series, 2022), { year: 2022, blocks: 675, jobs: 33401 });
  assert.equal(yearWorkplaceJobs(series, 2024), null);
  // 2022 WAC 33401은 091-I OD 32543과 다른 공시 표이므로 섞지 않는다.
  assert.notEqual(yearWorkplaceJobs(series, 2022).jobs, 32543);
  const relabeled = structuredClone(lodes);
  relabeled.geography = "Cushing, Oklahoma";
  assert.equal(readPayneLodesAnnual(relabeled), null);
  const qcewCopy = structuredClone(lodes);
  qcewCopy.rows[21].jobs = 35001;
  assert.equal(readPayneLodesAnnual(qcewCopy), null);
  const filled = structuredClone(lodes);
  filled.rows.push({ year: 2024, blocks: 700, jobs: 0 });
  assert.equal(readPayneLodesAnnual(filled), null);
});

test("cushing board context keeps payne county drought weekly d0 area without filling gaps", () => {
  const series = readPayneDroughtWeekly(drought);
  assert.equal(series.runId, "20260910T091DRTZ");
  assert.equal(series.fips, "40119");
  assert.equal(series.county, "Payne County");
  assert.equal(series.rows.length, 610);
  assert.equal(series.rows[0].mapDate, "2014-12-30");
  assert.equal(series.rows.at(-1).mapDate, "2026-09-01");
  assert.equal(series.rows.reduce((n, row) => n + Math.round(row.d0 * 100), 0), 3342984);
  assert.equal(weekDrought(series, "2019-12-03").d0, 0);
  assert.equal(weekDrought(series, "2026-09-01").d0, 100);
  assert.equal(weekDrought(series, "2026-09-02"), null);
  const city = structuredClone(drought);
  city.county = "Cushing";
  assert.equal(readPayneDroughtWeekly(city), null);
  const mesonetCopy = structuredClone(drought);
  mesonetCopy.label = "Mesonet OILT daily rainfall";
  assert.equal(readPayneDroughtWeekly(mesonetCopy), null);
});

test("cushing board context keeps wqp sand1 ph samples as filed without filling gaps", () => {
  const series = readCushingWqp(wqp);
  assert.equal(series.runId, "20260910T091WQPZ");
  assert.equal(series.siteId, "IOWATROK_WQX-SND1");
  assert.equal(series.characteristic, "pH");
  assert.equal(series.rows.length, 366);
  assert.equal(series.rows[0].date, "2005-09-01");
  assert.equal(series.rows.at(-1).date, "2021-09-17");
  assert.equal(new Set(series.rows.map((row) => row.date)).size, 283);
  assert.equal(series.rows.reduce((n, row) => n + Math.round(row.ph * 100), 0), 297220);
  assert.equal(series.rows.filter((row) => row.activityType !== "Field Msr/Obs").length, 14);
  const zero = series.rows.filter((row) => row.ph === 0);
  assert.equal(zero.length, 1);
  assert.equal(zero[0].date, "2009-05-05");
  assert.equal(wqpSamplesOn(series, "2011-01-27").length, 3);
  assert.deepEqual(wqpSamplesOn(series, "2020-06-15"), []);
  const relabeled = structuredClone(wqp);
  relabeled.siteId = "USGS-07161450";
  assert.equal(readCushingWqp(relabeled), null);
  const filled = structuredClone(wqp);
  filled.rows.push({ date: "2021-09-18", time: null, activityId: "X", activityType: "Field Msr/Obs", ph: 0, status: "Final" });
  assert.equal(readCushingWqp(filled), null);
});

test("cushing board context keeps kcuh daily temperature gaps without filling", () => {
  const series = readKcuhDaily(kcuh);
  assert.equal(series.runId, "20260910T091KCUHZ");
  assert.equal(series.station, "CUH");
  assert.equal(series.rows.length, 4269);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows.at(-1).date, "2026-09-08");
  let maxSum = 0;
  let nullTemp = 0;
  let nullPrecip = 0;
  for (const row of series.rows) {
    if (row.maxTempF === null || row.minTempF === null) {
      assert.equal(row.maxTempF, null);
      assert.equal(row.minTempF, null);
      nullTemp += 1;
    } else {
      assert.ok(row.maxTempF >= row.minTempF);
      maxSum += Math.round(row.maxTempF);
    }
    if (row.precipIn === null) nullPrecip += 1;
    else assert.ok(row.precipIn >= 0);
  }
  assert.equal(maxSum, 307313);
  assert.equal(nullTemp, 38);
  assert.equal(nullPrecip, 3406);
});

test("cushing board context keeps mesonet oilt daily max temperature gaps without filling", () => {
  const series = readMesonetDaily(mesonet);
  assert.equal(series.runId, "20260910T091MESOZ");
  assert.equal(series.station, "OILT");
  assert.notEqual(series.station, "CUH");
  assert.equal(mesonet.distanceKm, 24.3);
  assert.equal(series.rows.length, 4269);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows.at(-1).date, "2026-09-08");
  let tmaxSum = 0;
  let nullTemp = 0;
  let disclosed = 0;
  let rainSum = 0;
  let nullRain = 0;
  let disclosedRain = 0;
  for (const row of series.rows) {
    if (row.tmaxF === null) {
      assert.equal(row.tminF, null);
      assert.equal(row.tavgF, null);
      nullTemp += 1;
    } else {
      assert.ok(row.tmaxF >= row.tminF);
      tmaxSum += Math.round(row.tmaxF * 100);
      disclosed += 1;
    }
    if (row.rainIn === null) {
      nullRain += 1;
    } else {
      assert.ok(row.rainIn >= 0);
      rainSum += Math.round(row.rainIn * 100);
      disclosedRain += 1;
    }
  }
  assert.equal(tmaxSum, 30206129);
  assert.equal(nullTemp, 110);
  assert.equal(disclosed, 4159);
  assert.equal(rainSum, 48232);
  assert.equal(nullRain, 127);
  assert.equal(disclosedRain, 4142);
  assert.equal(series.rows.at(-1).rainIn, 0);
});

test("cushing board context keeps mesonet oilt daily soil temperature gaps without filling", () => {
  const series = readMesonetSoilDaily(soil);
  assert.equal(series.runId, "20260910T091SOILZ");
  assert.equal(series.station, "OILT");
  assert.notEqual(series.station, "CUH");
  assert.equal(series.rows.length, 4269);
  assert.equal(series.rows[0].date, "2015-01-01");
  assert.equal(series.rows.at(-1).date, "2026-09-08");
  let savgSum = 0;
  let nullSoil = 0;
  let disclosed = 0;
  for (const row of series.rows) {
    assert.deepEqual(Object.keys(row).sort(), ["date", "savgF"]);
    if (row.savgF === null) {
      nullSoil += 1;
    } else {
      assert.ok(row.savgF > -40 && row.savgF < 130);
      savgSum += Math.round(row.savgF * 100);
      disclosed += 1;
    }
  }
  assert.equal(savgSum, 25436779);
  assert.equal(nullSoil, 188);
  assert.equal(disclosed, 4081);
  assert.deepEqual(daySoil(series, "2015-01-01"), { date: "2015-01-01", savgF: 39.08 });
  assert.deepEqual(daySoil(series, "2026-09-08"), { date: "2026-09-08", savgF: 84.51 });
  assert.deepEqual(daySoil(series, "2016-02-15"), { date: "2016-02-15", savgF: null });
  const filled = structuredClone(soil);
  filled.rows[filled.rows.findIndex((r) => r.savgF === null)].savgF = 0;
  assert.equal(readMesonetSoilDaily(filled), null);
  const copied = structuredClone(soil);
  copied.rows[5].tmaxF = 90;
  assert.equal(readMesonetSoilDaily(copied), null);
});

test("cushing board context fails closed on swapped rows or invented dates", () => {
  const badStocks = stocks.replace("2026-08-28,22508", "2026-08-28,0");
  assert.equal(readCushingStocks(badStocks), null);
  const badAadt = structuredClone(aadt);
  badAadt.points[0].year = 2014;
  assert.equal(readCushingAadt(badAadt), null);
  const filled = bps.replace("2026-07,0,0,0,0,0\n", "2026-07,0,0,0,0,0\n2026-08,0,0,0,0,0\n");
  assert.equal(readCushingBps(filled), null);
  assert.equal(readCushingMonthlyStocks(monthly.replace("2026-06,19515\n", "2026-06,19515\n2026-07,0\n")), null);
  assert.equal(readCushingMonthlyStocks(monthly.replace("2026-06,19515", "2026-06,22508")), null);
  const badDeq = structuredClone(deq);
  badDeq.events[1].receiptDate = "2025-01-01";
  assert.equal(readCushingDeq(badDeq), null);
  const cityQcew = structuredClone(qcew);
  cityQcew.geography = "Cushing, Oklahoma";
  assert.equal(readPayneQcew(cityQcew), null);
  const filledQ = structuredClone(qcewQ);
  filledQ.rows.push({ year: 2026, qtr: 2, month: 6, totalCovered: 0, privateMining21: 0 });
  assert.equal(readPayneQcewQuarterly(filledQ), null);
  const extraNews = structuredClone(news);
  extraNews.events.push({ ...news.events[0], publishedAt: "2026-09-08T00:00:00+00:00" });
  assert.equal(readCushingNews(extraNews), null);
  assert.equal(readCushingStocks(null), null);
});

const now = new Date("2026-09-09T08:00:00Z");
const row = {
  icaoId: "KCUH",
  obsTime: Date.parse("2026-09-09T07:55:00Z") / 1000,
  receiptTime: "2026-09-09T07:58:22.993Z",
  reportTime: "2026-09-09T08:00:00.000Z",
  temp: 26.8,
  wspd: 0,
  visib: "10+",
  cover: "CLR",
  rawOb: "METAR KCUH 090755Z AUTO 00000KT 10SM CLR 27/18 A3004 RMK AO2 T02680180",
};

test("cushing weather keeps latest KCUH report and rejects other stations", () => {
  const parsed = parseCushingWeather([row], now);
  assert.equal(parsed.observedAt, "2026-09-09T07:55:00.000Z");
  assert.equal(parsed.visib, "10+");
  assert.equal(parsed.windKt, 0);
  assert.equal(parsed.temperatureC, 26.8);
  assert.throws(() => parseCushingWeather([{ ...row, icaoId: "KGLS" }], now));
  assert.throws(() => parseCushingWeather([{ ...row, rawOb: "METAR KGLS" }], now));
});

test("cushing weather server has no fabricated fallback and preserves last-good", async () => {
  assert.equal((await readCushingWeather(async () => { throw new Error("network"); }, now)).data, null);
  let calls = 0;
  const good = async (url, options) => {
    calls++;
    assert.match(url, /ids=KCUH&format=json$/);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json([row]);
  };
  const saved = await readCushingWeather(good, now);
  assert.equal(saved.data.visib, "10+");
  assert.equal(calls, 1);
  await readCushingWeather(good, now);
  assert.equal(calls, 1);
  const later = new Date("2026-09-09T08:20:00Z");
  const failed = await readCushingWeather(async () => new Response(null, { status: 500 }), later);
  assert.equal(failed.data.observedAt, saved.data.observedAt);
  assert.match(failed.error, /실패/);
});
