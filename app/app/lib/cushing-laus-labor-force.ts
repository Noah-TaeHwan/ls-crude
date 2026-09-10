/** Payne County 월간 LAUS 민간 노동력 한 점. 결측 월은 null이며 0으로 채우지 않는다. */
export interface PayneLausLaborForceMonthRow {
  period: string;
  labor_force: number | null;
}
/** Payne County 고정 월간 LAUS 민간 노동력 시계열. 카운티 노동시장 인원수이지 실업률·취업자수·Cushing 시·현장 바쁨이 아니다. */
export interface PayneLausLaborForceMonthlySeries {
  runId: string;
  areaFips: string;
  geography: string;
  frequency: string;
  rows: PayneLausLaborForceMonthRow[];
}

const RUN_ID = "20260910T091LAUFZ";
const AREA_FIPS = "40119";
const GEOGRAPHY = "Payne County, Oklahoma";
const FREQUENCY = "monthly LAUS civilian labor force";
/** 고정 월 순서와 공개 민간 노동력 [period YYYY-MM, labor force persons]. null은 BLS가 미공개한 월이다. */
const EXPECTED: Array<[string, number | null]> = [
  ["2015-01", 37394],
  ["2015-02", 37693],
  ["2015-03", 37921],
  ["2015-04", 38273],
  ["2015-05", 38742],
  ["2015-06", 38382],
  ["2015-07", 38326],
  ["2015-08", 38415],
  ["2015-09", 38734],
  ["2015-10", 38605],
  ["2015-11", 38485],
  ["2015-12", 38006],
  ["2016-01", 37632],
  ["2016-02", 37722],
  ["2016-03", 37794],
  ["2016-04", 37880],
  ["2016-05", 37757],
  ["2016-06", 37942],
  ["2016-07", 37940],
  ["2016-08", 38376],
  ["2016-09", 38488],
  ["2016-10", 38498],
  ["2016-11", 38459],
  ["2016-12", 37680],
  ["2017-01", 38580],
  ["2017-02", 38153],
  ["2017-03", 38160],
  ["2017-04", 38105],
  ["2017-05", 38128],
  ["2017-06", 37095],
  ["2017-07", 37328],
  ["2017-08", 37544],
  ["2017-09", 37714],
  ["2017-10", 38439],
  ["2017-11", 38400],
  ["2017-12", 38117],
  ["2018-01", 37839],
  ["2018-02", 38699],
  ["2018-03", 38732],
  ["2018-04", 38212],
  ["2018-05", 38294],
  ["2018-06", 36963],
  ["2018-07", 37019],
  ["2018-08", 37165],
  ["2018-09", 37709],
  ["2018-10", 37774],
  ["2018-11", 37770],
  ["2018-12", 37386],
  ["2019-01", 36839],
  ["2019-02", 37515],
  ["2019-03", 37750],
  ["2019-04", 37335],
  ["2019-05", 37419],
  ["2019-06", 37098],
  ["2019-07", 37272],
  ["2019-08", 36703],
  ["2019-09", 37011],
  ["2019-10", 37915],
  ["2019-11", 37698],
  ["2019-12", 37028],
  ["2020-01", 36921],
  ["2020-02", 37220],
  ["2020-03", 36870],
  ["2020-04", 35407],
  ["2020-05", 36216],
  ["2020-06", 37057],
  ["2020-07", 36945],
  ["2020-08", 36795],
  ["2020-09", 36846],
  ["2020-10", 37756],
  ["2020-11", 37638],
  ["2020-12", 37023],
  ["2021-01", 37055],
  ["2021-02", 37439],
  ["2021-03", 36925],
  ["2021-04", 37653],
  ["2021-05", 37438],
  ["2021-06", 36743],
  ["2021-07", 37454],
  ["2021-08", 37046],
  ["2021-09", 37917],
  ["2021-10", 37819],
  ["2021-11", 38075],
  ["2021-12", 37641],
  ["2022-01", 37988],
  ["2022-02", 38515],
  ["2022-03", 38758],
  ["2022-04", 38386],
  ["2022-05", 38048],
  ["2022-06", 38173],
  ["2022-07", 38212],
  ["2022-08", 39003],
  ["2022-09", 39084],
  ["2022-10", 39188],
  ["2022-11", 39083],
  ["2022-12", 38651],
  ["2023-01", 38969],
  ["2023-02", 39700],
  ["2023-03", 39889],
  ["2023-04", 40091],
  ["2023-05", 39929],
  ["2023-06", 39833],
  ["2023-07", 39650],
  ["2023-08", 40403],
  ["2023-09", 40784],
  ["2023-10", 40605],
  ["2023-11", 40630],
  ["2023-12", 39889],
  ["2024-01", 40093],
  ["2024-02", 40842],
  ["2024-03", 41211],
  ["2024-04", 41042],
  ["2024-05", 40672],
  ["2024-06", 40763],
  ["2024-07", 40961],
  ["2024-08", 41546],
  ["2024-09", 41328],
  ["2024-10", 41160],
  ["2024-11", 41137],
  ["2024-12", 40815],
  ["2025-01", 40655],
  ["2025-02", 41133],
  ["2025-03", 41353],
  ["2025-04", 41737],
  ["2025-05", 41023],
  ["2025-06", 41065],
  ["2025-07", 41068],
  ["2025-08", 41646],
  ["2025-09", 41758],
  ["2025-10", null],
  ["2025-11", 40757],
  ["2025-12", 40235],
  ["2026-01", 40118],
  ["2026-02", 41154],
  ["2026-03", 40880],
  ["2026-04", 40912],
  ["2026-05", 41082],
  ["2026-06", 40517],
  ["2026-07", 40352],
];

/**
 * 고정 Payne County 월간 LAUS 민간 노동력 시계열을 검사한다. 결측 월을 0으로 채우지 않는다.
 * @param value 091-LAUFZ 런 JSON.
 * @returns 검증된 카운티 민간 노동력 시계열 또는 오류 상태.
 */
export function readPayneLausLaborForceMonthly(value: unknown): PayneLausLaborForceMonthlySeries | null {
  const v = value as { runId?: unknown; areaFips?: unknown; geography?: unknown; frequency?: unknown; rows?: PayneLausLaborForceMonthRow[] };
  if (!v || v.runId !== RUN_ID || v.areaFips !== AREA_FIPS || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneLausLaborForceMonthRow & { unemployment_rate?: unknown; employed?: unknown };
    const [period, laborForce] = EXPECTED[i];
    if (!row || row.period !== period) return null;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period)) return null;
    // 실업률·취업자수-노동력 뒤바뀜 방지: 다른 지표 키가 섞인 행은 거부한다.
    if ("unemployment_rate" in (row as object)) return null;
    if ("employed" in (row as object)) return null;
    if (laborForce === null) {
      if (row.labor_force !== null) return null;
    } else {
      if (typeof row.labor_force !== "number" || !Number.isInteger(row.labor_force)) return null;
      if (row.labor_force < 1000 || row.labor_force > 1000000) return null;
      if (row.labor_force !== laborForce) return null;
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneLausLaborForceMonthRow;
      if (prev.period >= row.period) return null;
    }
  }
  return v as PayneLausLaborForceMonthlySeries;
}

/**
 * 시계열에서 한 월의 민간 노동력을 꺼낸다. 미공개 월은 null 행을 돌려준다.
 * @param series 검증된 Payne County 월간 시계열.
 * @param period 조회 월 (YYYY-MM, 예: 2025-03).
 * @returns 해당 월 행 또는 없으면 null.
 */
export function monthLaborForce(
  series: PayneLausLaborForceMonthlySeries | null,
  period: string,
): PayneLausLaborForceMonthRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.period === period);
  return row ?? null;
}
