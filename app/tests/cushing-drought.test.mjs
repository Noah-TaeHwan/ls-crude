import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readPayneDroughtWeekly, weekDrought } from "../app/lib/cushing-drought.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091DRTZ/payne_drought_weekly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091DRTZ/payne_drought_weekly.csv", base), "utf8");

const WEEK_COUNT = 610;
const NONE_SUM = 2757016;
const D0_SUM = 3342984;
const D1_SUM = 2050380;
const D2_SUM = 1035269;
const D3_SUM = 362456;
const D4_SUM = 5;

test("payne drought keeps dated weekly county series with weeks left as filed", () => {
  const series = readPayneDroughtWeekly(frozen);
  assert.equal(series.runId, "20260910T091DRTZ");
  assert.equal(series.fips, "40119");
  assert.equal(series.county, "Payne County");
  assert.equal(series.state, "OK");
  assert.equal(series.label, "Payne County US Drought Monitor, weekly confounder, not activity");
  assert.equal(series.rows.length, WEEK_COUNT);
  assert.equal(series.rows[0].mapDate, "2014-12-30");
  assert.equal(series.rows[609].mapDate, "2026-09-01");
  const sums = { none: 0, d0: 0, d1: 0, d2: 0, d3: 0, d4: 0 };
  for (let i = 0; i < series.rows.length; i++) {
    const row = series.rows[i];
    assert.match(row.mapDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${row.mapDate}T00:00:00Z`).getUTCDay(), 2);
    if (i > 0) {
      const step =
        Date.parse(`${row.mapDate}T00:00:00Z`) -
        Date.parse(`${series.rows[i - 1].mapDate}T00:00:00Z`);
      assert.equal(step, 7 * 86400000);
    }
    for (const k of ["none", "d0", "d1", "d2", "d3", "d4"]) {
      const v = row[k];
      assert.ok(typeof v === "number" && v >= 0 && v <= 100);
      sums[k] += Math.round(v * 100);
    }
    assert.ok(Math.abs(row.none + row.d0 - 100) <= 0.011);
    assert.ok(row.d0 >= row.d1 && row.d1 >= row.d2 && row.d2 >= row.d3 && row.d3 >= row.d4);
  }
  assert.equal(sums.none, NONE_SUM);
  assert.equal(sums.d0, D0_SUM);
  assert.equal(sums.d1, D1_SUM);
  assert.equal(sums.d2, D2_SUM);
  assert.equal(sums.d3, D3_SUM);
  assert.equal(sums.d4, D4_SUM);
  // Spot checks: first week, a drought-free week, the all-D3 week,
  // the max-D4 week, and the last week — county rows, never Cushing city.
  assert.deepEqual(weekDrought(series, "2014-12-30"), {
    mapDate: "2014-12-30", none: 0, d0: 100, d1: 100, d2: 0, d3: 0, d4: 0,
  });
  assert.deepEqual(weekDrought(series, "2019-12-03"), {
    mapDate: "2019-12-03", none: 100, d0: 0, d1: 0, d2: 0, d3: 0, d4: 0,
  });
  assert.deepEqual(weekDrought(series, "2023-02-07"), {
    mapDate: "2023-02-07", none: 0, d0: 100, d1: 100, d2: 100, d3: 100, d4: 0,
  });
  assert.deepEqual(weekDrought(series, "2022-11-08"), {
    mapDate: "2022-11-08", none: 0, d0: 100, d1: 100, d2: 100, d3: 100, d4: 0.03,
  });
  assert.deepEqual(weekDrought(series, "2026-09-01"), {
    mapDate: "2026-09-01", none: 0, d0: 100, d1: 100, d2: 82.12, d3: 0, d4: 0,
  });
  assert.equal(weekDrought(series, "2026-09-02"), null);
});

test("payne drought csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "map_date,none,d0,d1,d2,d3,d4");
  assert.equal(lines.length, WEEK_COUNT + 1);
  const series = readPayneDroughtWeekly(frozen);
  assert.ok(series);
  for (let i = 0; i < series.rows.length; i++) {
    const cells = lines[i + 1].split(",");
    assert.equal(cells[0], series.rows[i].mapDate);
    for (const [j, k] of ["none", "d0", "d1", "d2", "d3", "d4"].entries()) {
      assert.equal(Number(cells[j + 1]), series.rows[i][k]);
    }
  }
});

test("payne drought fails closed on relabel or edited values", () => {
  assert.equal(readPayneDroughtWeekly({ ...frozen, fips: "40109" }), null);
  assert.equal(readPayneDroughtWeekly({ ...frozen, county: "Cushing" }), null);
  assert.equal(
    readPayneDroughtWeekly({ ...frozen, label: "Cushing busy drought index" }),
    null,
  );
  const edited = structuredClone(frozen);
  edited.rows[600].d2 = 0;
  assert.equal(readPayneDroughtWeekly(edited), null);
  const redated = structuredClone(frozen);
  redated.rows[600].mapDate = "2026-08-26";
  assert.equal(readPayneDroughtWeekly(redated), null);
});
