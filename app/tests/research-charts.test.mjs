import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readWatermelon, readJeju, readDegreeDays, readPetroleumRail, nearestDateIndex, sampleShouldRevalidate } from "../app/lib/research-charts.ts";

const base = new URL("../../research/indexes/web-observations/v2/", import.meta.url);
const melon = JSON.parse(await readFile(new URL("watermelon.json", base), "utf8"));
const jeju = JSON.parse(await readFile(new URL("jeju.json", base), "utf8"));

test("frozen chart rows retain denominators, zero values and exact source coverage", () => {
  const rows = readWatermelon(melon), days = readJeju(jeju);
  assert.equal(rows.length,409);
  assert.equal(rows.filter(r=>r.date>="2022-01-01").length,50);
  assert.equal(rows.reduce((n,r)=>n+r.denominator,0),518);
  assert.equal(rows.reduce((n,r)=>n+r.numerator,0),140);
  assert.deepEqual(rows.at(-1),{date:"2025-10-14",denominator:2,numerator:1,fractional:1});
  assert.equal(days.length,336);
  assert.ok(days.some(r=>r.date==="2024-02-29"));
  assert.equal(days.at(-1).oilMwh,"3997.953");
  assert.equal(Number(days.at(-1).sharePct).toFixed(2),"39.34");
  assert.ok(Math.abs(days.reduce((n,r)=>n+Number(r.lngMwh),0)-1378812.390)<1e-6);
  assert.ok(Math.abs(days.reduce((n,r)=>n+Number(r.oilMwh),0)-1721806.582)<1e-6);
});

test("each case fails closed on malformed or duplicate data without replacing observations", () => {
  for (const mutate of [r=>{r.denominator=0;},r=>{r.numerator=999;},r=>{r.date="2025-02-30";},r=>{r.fractional=-1;}]) {
    const bad=structuredClone(melon); mutate(bad.points[0]); assert.equal(readWatermelon(bad),null);
  }
  const duplicate=structuredClone(melon); duplicate.points[1]=duplicate.points[0]; assert.equal(readWatermelon(duplicate),null);
  for (const mutate of [r=>{r.lngMwh="NaN";},r=>{r.oilMwh="-1";},r=>{r.sharePct="99";},r=>{r.date="2024-02-30";}]) {
    const bad=structuredClone(jeju); mutate(bad.points[0]); assert.equal(readJeju(bad),null);
  }
  assert.equal(readWatermelon(null),null); assert.equal(readJeju({points:[]}),null);
  assert.equal(readJeju(jeju).length,336);
});

test("calendar selection chooses actual dates across gaps and clamps endpoints", () => {
  const dates=["2024-01-01","2024-01-02","2024-01-31"];
  assert.equal(nearestDateIndex(dates,0,dates[0],dates[2]),0);
  assert.equal(nearestDateIndex(dates,1/30,dates[0],dates[2]),1);
  assert.equal(nearestDateIndex(dates,.5,dates[0],dates[2]),1);
  assert.equal(nearestDateIndex(dates,1,dates[0],dates[2]),2);
  assert.equal(nearestDateIndex(dates,-1,dates[0],dates[2]),0);
  assert.equal(nearestDateIndex(dates,2,dates[0],dates[2]),2);
  assert.equal(nearestDateIndex([dates[0]],.5,dates[0],dates[0]),0);
  assert.equal(nearestDateIndex([],0,dates[0],dates[2]),-1);
});

test("case-only navigation skips data reload but preserves refresh, other queries and actions", () => {
  const currentUrl = new URL("https://example.test/?sample=watermelon");
  assert.equal(sampleShouldRevalidate({currentUrl,nextUrl:new URL("https://example.test/?sample=jeju"),defaultShouldRevalidate:true}),false);
  assert.equal(sampleShouldRevalidate({currentUrl,nextUrl:currentUrl,defaultShouldRevalidate:true}),true);
  assert.equal(sampleShouldRevalidate({currentUrl,nextUrl:new URL("https://example.test/?sample=jeju&candidate=080"),defaultShouldRevalidate:true}),true);
  assert.equal(sampleShouldRevalidate({currentUrl,nextUrl:new URL("https://example.test/research?sample=jeju"),defaultShouldRevalidate:true}),true);
  assert.equal(sampleShouldRevalidate({currentUrl,nextUrl:new URL("https://example.test/?sample=jeju"),defaultShouldRevalidate:true,formMethod:"POST"}),true);
});

const degrees = JSON.parse(await readFile(new URL("degree-days.json", base), "utf8"));
test("degree days preserve monthly totals and distinguish provider from own differences", () => {
  const rows=readDegreeDays(degrees);
  assert.equal(rows.length,108);
  assert.equal(rows[0].hddYoy,null);
  assert.equal(rows[13].hddYoy,-223);
  assert.equal(rows[13].providerHDDYoy,-255);
  assert.equal(rows.at(-1).month,"2023-12");
  for (const mutate of [r=>{r.hdd=-1;},r=>{r.month="2015-02";},r=>{r.hddYoy=0;},r=>{r.providerHDDYoy="0";}]) {
    const bad=structuredClone(degrees); mutate(bad.points[0]); assert.equal(readDegreeDays(bad),null);
  }
  const bad=structuredClone(degrees); bad.points[13].hddYoy=-255;
  assert.equal(readDegreeDays(bad),null);
});

const rail = JSON.parse(await readFile(new URL("petroleum-rail.json", base), "utf8"));
test("petroleum rail preserves weekly originated counts for four U.S. railroads", () => {
  const rows=readPetroleumRail(rail);
  assert.equal(rows.length,493);
  assert.equal(rows[0].date,"2017-03-29");
  assert.deepEqual(rows.at(-1),{date:"2026-09-02",bnsf:5712,up:3351,csx:1504,ns:883});
  assert.equal(rows.reduce((n,r)=>n+r.bnsf,0),2381801);
  for (const mutate of [r=>{r.bnsf=0;},r=>{r.date="2017-03-30";},r=>{r.up=-1;},r=>{r.csx="1504";}]) {
    const bad=structuredClone(rail); mutate(bad.points[0]); assert.equal(readPetroleumRail(bad),null);
  }
});
