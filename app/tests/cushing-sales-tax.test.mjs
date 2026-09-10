import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { periodSalesTax, readCushingSalesTax } from "../app/lib/cushing-sales-tax.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091STAXZ/cushing_city_sales_tax_monthly.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091STAXZ/cushing_city_sales_tax_monthly.csv", base), "utf8");

const TOTAL_CENTS = 229231800;

test("cushing city sales tax keeps monthly city series with dated rows", () => {
  const series = readCushingSalesTax(frozen);
  assert.equal(series.geography, "Cushing city, Oklahoma");
  assert.equal(series.frequency, "monthly OTC distribution (sparse, printed months only)");
  assert.equal(series.unit, "US dollars (OTC printed distribution amount)");
  assert.deepEqual(
    series.rows.map((row) => row.period),
    ["2025-08", "2025-09", "2026-08", "2026-09"],
  );
  for (const row of series.rows) {
    assert.ok(Number.isFinite(row.sales_tax_usd) && row.sales_tax_usd > 0);
    assert.equal(row.tax_rate, 0.04);
  }
  assert.equal(
    Math.round(series.rows.reduce((n, row) => n + row.sales_tax_usd, 0) * 100),
    TOTAL_CENTS,
  );
  // Latest distribution agrees with the frozen September 2026 OTC release, not county.
  assert.deepEqual(periodSalesTax(series, "2026-09"), {
    period: "2026-09",
    sales_tax_usd: 577814.84,
    tax_rate: 0.04,
    source_release: "STS-Current-September-2026-current-column",
  });
});

test("cushing city sales tax csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "period,sales_tax_usd,tax_rate,source_release");
  assert.equal(lines.length, 5);
  let totalCents = 0;
  for (const line of lines.slice(1)) {
    const [period, salesTaxUsd, taxRate, sourceRelease] = line.split(",");
    const row = periodSalesTax(readCushingSalesTax(frozen), period);
    assert.ok(row);
    assert.equal(Number(salesTaxUsd), row.sales_tax_usd);
    assert.equal(Number(taxRate), row.tax_rate);
    assert.equal(sourceRelease, row.source_release);
    totalCents += Math.round(Number(salesTaxUsd) * 100);
  }
  assert.equal(totalCents, TOTAL_CENTS);
});

test("cushing city sales tax fails closed on damage", () => {
  assert.ok(readCushingSalesTax(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ period: "2026-10", sales_tax_usd: 0, tax_rate: 0.04, source_release: "filled" });
  assert.equal(readCushingSalesTax(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingSalesTax(swapped), null);
  const periodSwapped = structuredClone(frozen);
  periodSwapped.rows[2].period = "2025-09";
  assert.equal(readCushingSalesTax(periodSwapped), null);
  const copied = structuredClone(frozen);
  copied.rows[3] = structuredClone(copied.rows[2]);
  copied.rows[3].period = "2026-09";
  assert.equal(readCushingSalesTax(copied), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Payne County, Oklahoma";
  assert.equal(readCushingSalesTax(relabeled), null);
  const hotelRelabeled = structuredClone(frozen);
  hotelRelabeled.geography = "Cushing hotel tax";
  assert.equal(readCushingSalesTax(hotelRelabeled), null);
  const busyRelabeled = structuredClone(frozen);
  busyRelabeled.geography = "Cushing field busy";
  assert.equal(readCushingSalesTax(busyRelabeled), null);
  const edited = structuredClone(frozen);
  edited.rows[0].sales_tax_usd = 558762.95;
  assert.equal(readCushingSalesTax(edited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingSalesTax(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ period: "2026-10", sales_tax_usd: 580000, tax_rate: 0.04, source_release: "invented" });
  assert.equal(readCushingSalesTax(invented), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[1].sales_tax_usd = 0;
  assert.equal(readCushingSalesTax(zeroed), null);
  const rateChanged = structuredClone(frozen);
  rateChanged.rows[0].tax_rate = 0.05;
  assert.equal(readCushingSalesTax(rateChanged), null);
  assert.equal(readCushingSalesTax(null), null);
  assert.equal(periodSalesTax(null, "2026-09"), null);
  assert.equal(periodSalesTax(readCushingSalesTax(frozen), "2026-07"), null);
});
