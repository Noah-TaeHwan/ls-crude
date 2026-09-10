import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { nbiBridgesInspectedInYear, nbiBridgesOn, readCushingNbi } from "../app/lib/cushing-nbi.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091NBIZ/cushing_nbi_bridges.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091NBIZ/cushing_nbi_bridges.csv", base), "utf8");

const ROW_COUNT = 384;
const FIRST_STRUCT = "183920000000000";
const FIRST_YM = "2022-03";
const LAST_STRUCT = "315630000000000";
const LAST_YM = "2024-01";

test("cushing nbi keeps dated payne bridge log, not busy", () => {
  const series = readCushingNbi(frozen);
  assert.equal(series.runId, "20260910T091NBIZ");
  assert.equal(series.inventoryYear, "2024");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].structureNumber, FIRST_STRUCT);
  assert.equal(series.rows[0].inspectionYm, FIRST_YM);
  assert.equal(series.rows[0].inspectionRaw, "0322");
  assert.equal(series.rows[ROW_COUNT - 1].structureNumber, LAST_STRUCT);
  assert.equal(series.rows[ROW_COUNT - 1].inspectionYm, LAST_YM);
  for (const row of series.rows) {
    assert.equal(row.countyCode, "119");
    assert.match(row.inspectionYm, /^\d{4}-\d{2}$/);
    assert.equal(row.inspectionRaw, row.inspectionYm.slice(5, 7) + row.inspectionYm.slice(2, 4));
  }
  // 연간 점검 수: 결측 연도는 채우지 않고 세기만 한다.
  assert.equal(nbiBridgesInspectedInYear(series, 2023), 283);
  assert.equal(nbiBridgesInspectedInYear(series, 2024), 74);
  assert.equal(nbiBridgesInspectedInYear(series, 2022), 27);
  assert.equal(nbiBridgesInspectedInYear(series, 2021), 0);
  // 2022-04는 한 건; 2023-11은 두 건이다.
  assert.deepEqual(
    nbiBridgesOn(series, "2022-04").map((r) => r.structureNumber),
    ["185420000000000"],
  );
  assert.deepEqual(
    nbiBridgesOn(series, "2023-11").map((r) => r.structureNumber),
    ["314670000000000", "315130000000000"],
  );
  assert.deepEqual(nbiBridgesOn(series, "2021-06"), []);
});

test("cushing nbi csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "structure_number,county_code,place_code,facility,location,latitude,longitude,year_built,year_reconstructed,inspection_mmyy,inspection_ym,inspection_frequency_months,deck,superstructure,substructure,channel,culvert,adt,adt_year",
  );
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingNbi(frozen);
  for (const line of lines.slice(1)) {
    const [structureNumber, countyCode, , , , , , , , inspectionRaw, inspectionYm] = line.split(",");
    const rows = nbiBridgesOn(series, inspectionYm);
    const row = rows.find((r) => r.structureNumber === structureNumber);
    assert.ok(row);
    assert.equal(row.countyCode, countyCode);
    assert.equal(row.inspectionRaw, inspectionRaw);
  }
});

test("cushing nbi fails closed on damage", () => {
  assert.ok(readCushingNbi(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingNbi(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[ROW_COUNT - 1].inspectionYm = "2024-02";
  // 마지막 행 점검월을 바꾸면 고정값이 깨진다.
  assert.equal(readCushingNbi(redated), null);
  const filled = structuredClone(frozen);
  filled.rows[10].deck = "9";
  assert.equal(readCushingNbi(filled), null);
  const edited = structuredClone(frozen);
  edited.rows[15].countyCode = "109";
  assert.equal(readCushingNbi(edited), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingNbi(relabeled), null);
  const statewide = structuredClone(frozen);
  statewide.source = "FHWA NBI 2024 ASCII US.txt";
  assert.equal(readCushingNbi(statewide), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingNbi(dropped), null);
  const invented = structuredClone(frozen);
  invented.rows.push({
    structureNumber: "999990000000000",
    countyCode: "119",
    placeCode: "00000",
    facility: "TEST",
    location: "TEST",
    latitude: "36000000",
    longitude: "097000000",
    yearBuilt: "2000",
    yearReconstructed: "0000",
    inspectionRaw: "0126",
    inspectionYm: "2026-01",
    inspectionFrequencyMonths: "24",
    deck: "7",
    superstructure: "7",
    substructure: "7",
    channel: "7",
    culvert: "N",
    adt: 100,
    adtYear: "2022",
  });
  assert.equal(readCushingNbi(invented), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[10].inspectionYm = "07/2023";
  assert.equal(readCushingNbi(reportDated), null);
  assert.equal(readCushingNbi(null), null);
  assert.deepEqual(nbiBridgesOn(null, "2023-09"), []);
  assert.equal(nbiBridgesInspectedInYear(null, 2023), 0);
  assert.deepEqual(nbiBridgesOn(readCushingNbi(frozen), "2021-06"), []);
});
