/** Cushing 상업 원유 허브 탱크 작업 저장 용량 한 점. 재고·셸·가동률이 아니다. */
export interface CushingWorkingStorageRow {
  period: string;
  workingStorageKbbl: number;
  shellKbbl: number;
}
/** Cushing 고정 탱크 작업 저장 용량 시계열. 바쁨도 WTI도 아니다. */
export interface CushingWorkingStorageSeries {
  runId: string;
  geography: string;
  frequency: string;
  unit: string;
  rows: CushingWorkingStorageRow[];
}

const RUN_ID = "20260910T091CAPZ";
const GEOGRAPHY = "Cushing, Oklahoma (EIA commercial crude oil market center)";
const FREQUENCY = "semiannual March/September 2011-2019, annual March from 2020 (report discontinued)";
const UNIT = "thousand barrels (EIA printed unit)";
/** 고정 기간 순서와 공개 용량 [period, workingStorageKbbl, shellKbbl]. 기간은 워크북 셀 날짜 그대로이며 월말로 바꾸지 않는다. */
const EXPECTED: Array<[string, number, number]> = [
  ["2011-03-31", 48001, 57750],
  ["2011-09-30", 55010, 66403],
  ["2012-03-31", 61928, 74846],
  ["2012-09-30", 63788, 77182],
  ["2013-03-31", 64972, 79656],
  ["2013-09-30", 66996, 79966],
  ["2014-03-31", 67294, 81419],
  ["2014-09-30", 70812, 85116],
  ["2015-03-31", 71278, 86408],
  ["2015-09-01", 72688, 87984],
  ["2016-03-01", 76921, 90981],
  ["2016-09-30", 77049, 91299],
  ["2017-03-01", 76946, 91306],
  ["2017-09-30", 78037, 92299],
  ["2018-03-01", 75294, 92065],
  ["2018-09-01", 75075, 91579],
  ["2019-03-01", 76415, 92579],
  ["2019-09-01", 76114, 94846],
  ["2020-03-01", 76342, 93321],
  ["2021-03-01", 76603, 94009],
  ["2022-03-01", 78449, 98599],
  ["2023-03-01", 77990, 98695],
  ["2024-03-01", 78410, 97742],
];

/**
 * 고정 Cushing 탱크 작업 저장 용량 시계열을 검사한다. 재고로 바꾼 입력은 runId가 달라 탈락한다.
 * @param value 091-CAPZ 런 JSON.
 * @returns 검증된 용량 시계열 또는 오류 상태.
 */
export function readCushingWorkingStorage(value: unknown): CushingWorkingStorageSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; frequency?: unknown; unit?: unknown; rows?: CushingWorkingStorageRow[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY || v.unit !== UNIT) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingWorkingStorageRow;
    const [period, workingStorageKbbl, shellKbbl] = EXPECTED[i];
    if (!row || row.period !== period) return null;
    if (!Number.isSafeInteger(row.workingStorageKbbl) || row.workingStorageKbbl !== workingStorageKbbl) return null;
    if (!Number.isSafeInteger(row.shellKbbl) || row.shellKbbl !== shellKbbl) return null;
    if (row.workingStorageKbbl > row.shellKbbl) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingWorkingStorageRow;
      if (prev.period >= row.period) return null;
    }
  }
  return v as CushingWorkingStorageSeries;
}

/**
 * 시계열에서 한 기간의 용량 행을 꺼낸다. 없는 기간은 null이며 0으로 채우지 않는다.
 * @param series 검증된 Cushing 작업 저장 용량 시계열.
 * @param period 기간 (예: "2024-03-01").
 * @returns 해당 기간 행 또는 없으면 null.
 */
export function periodWorkingStorage(
  series: CushingWorkingStorageSeries | null,
  period: string,
): CushingWorkingStorageRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.period === period);
  return row ?? null;
}
