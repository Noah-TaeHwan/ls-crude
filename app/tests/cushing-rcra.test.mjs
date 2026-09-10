import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { rcraHandlersOn, readCushingRcra } from "../app/lib/cushing-rcra.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091RCRAZ/cushing_rcra_handlers.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091RCRAZ/cushing_rcra_handlers.csv", base), "utf8");

const ROW_COUNT = 51;
const FIRST_DATE = "1985-08-28";
const LAST_DATED = "2021-07-15";
const DATED = 17;
const WASTE_HANDLERS = 11;

test("cushing rcra keeps dated hazardous-waste handler list, not tri", () => {
  const series = readCushingRcra(frozen);
  assert.equal(series.runId, "20260910T091RCRAZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.windowStart, "2021-09-05");
  assert.equal(series.windowEnd, "2026-09-30");
  assert.equal(series.rows[0].lastInspectionDate, FIRST_DATE);
  assert.equal(series.rows[DATED - 1].lastInspectionDate, LAST_DATED);
  assert.equal(series.rows[ROW_COUNT - 1].lastInspectionDate, null);
  let dated = 0;
  let inspSum = 0;
  let formalSum = 0;
  let wasteHandlers = 0;
  for (const row of series.rows) {
    assert.equal(row.city, "CUSHING");
    assert.ok(row.facilityName.length > 0);
    assert.match(row.sourceId, /^OK/);
    assert.ok(!row.sourceId.startsWith("OK0026701"));
    assert.ok(!row.sourceId.startsWith("OK0000004"));
    if (row.lastInspectionDate !== null) {
      assert.match(row.lastInspectionDate, /^\d{4}-\d{2}-\d{2}$/);
      dated += 1;
    }
    if (row.lastIeaDate !== null) assert.match(row.lastIeaDate, /^\d{4}-\d{2}-\d{2}$/);
    if (row.lastFeaDate !== null) assert.match(row.lastFeaDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isInteger(row.inspectionCount) && row.inspectionCount >= 0);
    inspSum += row.inspectionCount;
    assert.ok(Number.isInteger(row.formalActions) && row.formalActions >= 0);
    formalSum += row.formalActions;
    const cells = [
      ...Object.values(row.waste.hazardous),
      ...Object.values(row.waste.acute),
      ...Object.values(row.waste.pharma),
    ];
    assert.equal(cells.length, 12);
    if (cells.some((c) => c !== null)) wasteHandlers += 1;
  }
  assert.equal(dated, DATED);
  assert.equal(wasteHandlers, WASTE_HANDLERS);
  // DFR 창구간(2021-09-05..2026-09-30)에는 Cushing 취급자 점검·공식 조치가 공개되지 않았다(공개 0 그대로).
  assert.equal(inspSum, 0);
  assert.equal(formalSum, 0);
  assert.equal(rcraHandlersOn(series, "2017-02-17").length, 3);
  assert.deepEqual(rcraHandlersOn(series, "2020-06-15"), []);
});

test("cushing rcra csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    "facility_name,source_id,registry_id,city,county,status,universe,last_inspection_date,last_iea_date,last_fea_date,inspection_count,formal_actions,total_penalties,waste_hazardous_2023,waste_hazardous_2024,waste_hazardous_2025,waste_hazardous_2026,waste_acute_2023,waste_acute_2024,waste_acute_2025,waste_acute_2026,waste_pharma_2023,waste_pharma_2024,waste_pharma_2025,waste_pharma_2026",
  );
  assert.equal(lines.length, ROW_COUNT + 1);
  // Facility names contain commas, so split rows quote-aware.
  const parseRow = (line) => {
    const cols = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            quoted = false;
          }
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ",") {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    return cols;
  };
  const series = readCushingRcra(frozen);
  for (const line of lines.slice(1)) {
    const cols = parseRow(line);
    assert.equal(cols.length, 25);
    const inspectionDate = cols[7] === "" ? null : cols[7];
    const sourceId = cols[1];
    const rows = rcraHandlersOn(series, inspectionDate ?? "");
    if (inspectionDate === null) {
      assert.ok(series.rows.find((r) => r.sourceId === sourceId && r.lastInspectionDate === null));
    } else {
      assert.ok(rows.find((r) => r.sourceId === sourceId));
    }
  }
});

test("cushing rcra fails closed on damage", () => {
  assert.ok(readCushingRcra(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingRcra(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[DATED - 1].lastInspectionDate = "2021-07-14";
  // Redating the last dated row breaks the frozen value.
  assert.equal(readCushingRcra(redated), null);
  const filledDate = structuredClone(frozen);
  const nullDateIdx = filledDate.rows.findIndex((r) => r.lastInspectionDate === null);
  assert.ok(nullDateIdx >= 0);
  filledDate.rows[nullDateIdx].lastInspectionDate = "2020-06-15";
  // Filling an undisclosed date breaks the freeze.
  assert.equal(readCushingRcra(filledDate), null);
  const filledWaste = structuredClone(frozen);
  const nullWaste = filledWaste.rows.find((r) => r.waste.hazardous.y2023 === null);
  assert.ok(nullWaste);
  nullWaste.waste.hazardous.y2023 = "0";
  // Filling an undisclosed waste quantity with "0" breaks the freeze.
  assert.equal(readCushingRcra(filledWaste), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingRcra(relabeled), null);
  const cwaRow = structuredClone(frozen);
  cwaRow.rows.push({
    facilityName: "Copied cwa row",
    sourceId: "OK0026701",
    registryId: "110011008765",
    city: "CUSHING",
    county: "Payne",
    status: "Effective",
    universe: "Other",
    lastInspectionDate: "2026-01-06",
    lastIeaDate: null,
    lastFeaDate: null,
    inspectionCount: 8,
    formalActions: 3,
    totalPenalties: "$35,000",
    waste: {
      hazardous: { y2023: null, y2024: null, y2025: null, y2026: null },
      acute: { y2023: null, y2024: null, y2025: null, y2026: null },
      pharma: { y2023: null, y2024: null, y2025: null, y2026: null },
    },
  });
  // A copied CWA water row breaks the freeze.
  assert.equal(readCushingRcra(cwaRow), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingRcra(dropped), null);
  assert.equal(readCushingRcra(null), null);
  assert.deepEqual(rcraHandlersOn(null, FIRST_DATE), []);
  assert.deepEqual(rcraHandlersOn(readCushingRcra(frozen), "1999-01-01"), []);
});
