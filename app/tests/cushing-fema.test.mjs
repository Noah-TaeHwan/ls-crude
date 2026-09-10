import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { femaDeclarationsOn, readCushingFema } from "../app/lib/cushing-fema.ts";

const base = new URL("../../research/indexes/091-cushing-operations-nowcasting/", import.meta.url);
const frozen = JSON.parse(
  await readFile(new URL("20260910T091FEMAZ/cushing_fema_declarations.json", base), "utf8"),
);
const frozenCsv = await readFile(new URL("20260910T091FEMAZ/cushing_fema_declarations.csv", base), "utf8");

const ROW_COUNT = 39;
const FIRST_DATE = "1974-06-10";
const LAST_DATE = "2025-05-21";

test("cushing fema keeps dated payne declaration list, not busy", () => {
  const series = readCushingFema(frozen);
  assert.equal(series.runId, "20260910T091FEMAZ");
  assert.equal(series.rows.length, ROW_COUNT);
  assert.equal(series.rows[0].declarationDate, FIRST_DATE);
  assert.equal(series.rows[0].femaDeclarationString, "DR-441-OK");
  assert.equal(series.rows[38].declarationDate, LAST_DATE);
  assert.equal(series.rows[38].femaDeclarationString, "DR-4866-OK");
  const mix = { DR: 0, EM: 0, FM: 0 };
  for (const row of series.rows) {
    assert.match(row.declarationDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(row.incidentBeginDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.femaDeclarationString.length > 0);
    assert.ok(row.declarationTitle.length > 0);
    assert.ok(Number.isInteger(row.disasterNumber) && row.disasterNumber > 0);
    mix[row.declarationType] += 1;
  }
  assert.deepEqual(mix, { DR: 24, EM: 8, FM: 7 });
  assert.deepEqual(
    femaDeclarationsOn(series, "2012-08-04").map((r) => r.femaDeclarationString),
    ["FM-5002-OK", "FM-5003-OK"],
  );
  assert.deepEqual(femaDeclarationsOn(series, "2015-01-01"), []);
});

test("cushing fema csv agrees with frozen json", () => {
  const lines = frozenCsv.trim().split(/\r?\n/);
  assert.equal(lines[0], "declaration_date,fema_declaration_string,disaster_number,declaration_type,incident_type,declaration_title,incident_begin_date,incident_end_date,incident_id,pa_declared,ia_declared,ih_declared,hm_declared");
  assert.equal(lines.length, ROW_COUNT + 1);
  const series = readCushingFema(frozen);
  for (const line of lines.slice(1)) {
    const [declarationDate, femaDeclarationString, , declarationType] = line.split(",");
    const rows = femaDeclarationsOn(series, declarationDate);
    const row = rows.find((r) => r.femaDeclarationString === femaDeclarationString);
    assert.ok(row);
    assert.equal(row.declarationType, declarationType);
  }
});

test("cushing fema fails closed on filled years and statewide relabel", () => {
  assert.ok(readCushingFema(frozen));
  const swapped = structuredClone(frozen);
  [swapped.rows[0], swapped.rows[1]] = [swapped.rows[1], swapped.rows[0]];
  assert.equal(readCushingFema(swapped), null);
  const redated = structuredClone(frozen);
  redated.rows[38].declarationDate = "2025-05-20";
  // Redating the last row breaks the frozen value.
  assert.equal(readCushingFema(redated), null);
  const filled = structuredClone(frozen);
  filled.rows.push({
    declarationDate: "2015-06-15",
    femaDeclarationString: "DR-9999-OK",
    disasterNumber: 9999,
    declarationType: "DR",
    incidentType: "Severe Storm",
    declarationTitle: "INVENTED FILL",
    incidentBeginDate: "2015-06-10",
    incidentEndDate: null,
    incidentId: "invented",
    paDeclared: true,
    iaDeclared: false,
    ihDeclared: false,
    hmDeclared: false,
  });
  assert.equal(readCushingFema(filled), null);
  const retyped = structuredClone(frozen);
  retyped.rows[0].declarationType = "EM";
  assert.equal(readCushingFema(retyped), null);
  const relabeled = structuredClone(frozen);
  relabeled.geography = "Oklahoma";
  assert.equal(readCushingFema(relabeled), null);
  const city = structuredClone(frozen);
  city.geography = "Cushing city, Oklahoma";
  assert.equal(readCushingFema(city), null);
  const dropped = structuredClone(frozen);
  dropped.rows.pop();
  assert.equal(readCushingFema(dropped), null);
  const reportDated = structuredClone(frozen);
  reportDated.rows[0].declarationDate = "06/10/1974";
  assert.equal(readCushingFema(reportDated), null);
  assert.equal(readCushingFema(null), null);
  assert.deepEqual(femaDeclarationsOn(null, "2012-08-04"), []);
  assert.deepEqual(femaDeclarationsOn(readCushingFema(frozen), "1999-01-01"), []);
});
