import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { readCushingVoc, yearVoc } from "../app/lib/cushing-voc.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091VOCYZ/cushing_terminal_voc_annual.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091VOCYZ/cushing_terminal_voc_annual.csv", base), "utf8");

const VOC_CHECKSUM = 6470.934;
const HAP_SUM = 106.384;

test("cushing terminal voc keeps annual city series with dated rows", () => {
  const series = readCushingVoc(frozen);
  assert.equal(series.geography.includes("Cushing city"), true);
  assert.equal(series.frequency, "annual, DEQ Year_Emissions_Reported");
  assert.equal(series.rows.length, 5);
  assert.deepEqual(
    series.rows.map((row) => row.year),
    [2020, 2021, 2022, 2023, 2024],
  );
  assert.deepEqual(
    series.rows.map((row) => row.layerId),
    [5, 7, 6, 1, 8],
  );
  for (const row of series.rows) {
    assert.ok(Number.isSafeInteger(row.terminalLikeOperatingRows) && row.terminalLikeOperatingRows > 0);
    assert.ok(typeof row.vocTons === "number" && row.vocTons > 0);
    assert.ok(typeof row.hapTons === "number" && row.hapTons >= 0);
  }
});

test("cushing terminal voc 2024 matches frozen wenvz checksum", () => {
  assert.deepEqual(yearVoc(readCushingVoc(frozen), 2024), {
    year: 2024,
    layerId: 8,
    terminalLikeOperatingRows: 17,
    vocTons: 1206.389,
    hapTons: 19.715,
  });
});

test("cushing terminal voc csv agrees with frozen json and checksum", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "year,layer_id,terminal_like_operating_rows,voc_tons,hap_tons");
  assert.equal(lines.length, 6);
  let vocSum = 0;
  let hapSum = 0;
  for (const line of lines.slice(1)) {
    const [year, layerId, rows, vocTons, hapTons] = line.split(",");
    const row = yearVoc(readCushingVoc(frozen), Number(year));
    assert.ok(row);
    assert.equal(Number(layerId), row.layerId);
    assert.equal(Number(rows), row.terminalLikeOperatingRows);
    assert.equal(Number(vocTons), row.vocTons);
    assert.equal(Number(hapTons), row.hapTons);
    vocSum += Number(vocTons);
    hapSum += Number(hapTons);
  }
  assert.ok(Math.abs(vocSum - VOC_CHECKSUM) < 1e-6);
  assert.ok(Math.abs(hapSum - HAP_SUM) < 1e-6);
});

test("cushing terminal voc fails closed on damage", () => {
  assert.ok(readCushingVoc(frozen));
  const filled = structuredClone(frozen);
  filled.rows.push({ year: 2019, layerId: 5, terminalLikeOperatingRows: 17, vocTons: 0, hapTons: 0 });
  assert.equal(readCushingVoc(filled), null);
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingVoc(swapped), null);
  const yearSwapped = structuredClone(frozen);
  yearSwapped.rows[2].year = 2021;
  assert.equal(readCushingVoc(yearSwapped), null);
  const layerSwapped = structuredClone(frozen);
  layerSwapped.rows[0].layerId = 7;
  assert.equal(readCushingVoc(layerSwapped), null);
  const edited = structuredClone(frozen);
  edited.rows[4].vocTons = 1206.39;
  assert.equal(readCushingVoc(edited), null);
  const hapEdited = structuredClone(frozen);
  hapEdited.rows[4].hapTons = 19.72;
  assert.equal(readCushingVoc(hapEdited), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingVoc(dropped), null);
  const zeroed = structuredClone(frozen);
  zeroed.rows[1].vocTons = 0;
  assert.equal(readCushingVoc(zeroed), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Cushing field busy";
  assert.equal(readCushingVoc(relabeled), null);
  const agraMerged = structuredClone(frozen);
  agraMerged.geography = "Cushing hub radius including Agra, terminal-like, Status = Operating";
  assert.equal(readCushingVoc(agraMerged), null);
  const invented = structuredClone(frozen);
  invented.rows.push({ year: 2025, layerId: 8, terminalLikeOperatingRows: 17, vocTons: 1200, hapTons: 19 });
  assert.equal(readCushingVoc(invented), null);
  assert.equal(readCushingVoc(null), null);
  assert.equal(yearVoc(null, 2024), null);
  assert.equal(yearVoc(readCushingVoc(frozen), 2019), null);
});
