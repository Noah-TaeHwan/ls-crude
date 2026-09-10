/** Payne County 월간 LAUS 취업자 수 한 점. 결측 월은 null이며 0으로 채우지 않는다. */
export interface PayneLausEmployedMonthRow {
  period: string;
  employed: number | null;
}
/** Payne County 고정 월간 LAUS 취업자 수 시계열. 카운티 노동시장 인원수이지 실업률·Cushing 시·현장 바쁨이 아니다. */
export interface PayneLausEmployedMonthlySeries {
  runId: string;
  areaFips: string;
  geography: string;
  frequency: string;
  rows: PayneLausEmployedMonthRow[];
}

const RUN_ID = "20260910T091LAUEZ";
const AREA_FIPS = "40119";
const GEOGRAPHY = "Payne County, Oklahoma";
const FREQUENCY = "monthly LAUS employment level";
/** 고정 월 순서와 공개 취업자 수 [period YYYY-MM, employed persons]. null은 BLS가 미공개한 월이다. */
const EXPECTED: Array<[string, number | null]> = [
  ["2015-01", 36075],
  ["2015-02", 36366],
  ["2015-03", 36669],
  ["2015-04", 37058],
  ["2015-05", 37261],
  ["2015-06", 36761],
  ["2015-07", 36913],
  ["2015-08", 37075],
  ["2015-09", 37498],
  ["2015-10", 37380],
  ["2015-11", 37315],
  ["2015-12", 36841],
  ["2016-01", 36244],
  ["2016-02", 36223],
  ["2016-03", 36396],
  ["2016-04", 36637],
  ["2016-05", 36401],
  ["2016-06", 36254],
  ["2016-07", 36428],
  ["2016-08", 36981],
  ["2016-09", 37092],
  ["2016-10", 37214],
  ["2016-11", 37222],
  ["2016-12", 36438],
  ["2017-01", 37130],
  ["2017-02", 36690],
  ["2017-03", 36881],
  ["2017-04", 36987],
  ["2017-05", 36814],
  ["2017-06", 35495],
  ["2017-07", 35920],
  ["2017-08", 36158],
  ["2017-09", 36390],
  ["2017-10", 37354],
  ["2017-11", 37232],
  ["2017-12", 37010],
  ["2018-01", 36509],
  ["2018-02", 37400],
  ["2018-03", 37568],
  ["2018-04", 37172],
  ["2018-05", 37191],
  ["2018-06", 35657],
  ["2018-07", 35882],
  ["2018-08", 36135],
  ["2018-09", 36739],
  ["2018-10", 36910],
  ["2018-11", 36909],
  ["2018-12", 36418],
  ["2019-01", 35582],
  ["2019-02", 36341],
  ["2019-03", 36669],
  ["2019-04", 36483],
  ["2019-05", 36328],
  ["2019-06", 35856],
  ["2019-07", 36146],
  ["2019-08", 35672],
  ["2019-09", 36039],
  ["2019-10", 37056],
  ["2019-11", 36778],
  ["2019-12", 36190],
  ["2020-01", 35844],
  ["2020-02", 36185],
  ["2020-03", 35706],
  ["2020-04", 31507],
  ["2020-05", 32866],
  ["2020-06", 33970],
  ["2020-07", 34542],
  ["2020-08", 35002],
  ["2020-09", 35134],
  ["2020-10", 36242],
  ["2020-11", 36101],
  ["2020-12", 35450],
  ["2021-01", 35331],
  ["2021-02", 35691],
  ["2021-03", 35480],
  ["2021-04", 36238],
  ["2021-05", 36070],
  ["2021-06", 35144],
  ["2021-07", 36144],
  ["2021-08", 35832],
  ["2021-09", 36935],
  ["2021-10", 36876],
  ["2021-11", 37182],
  ["2021-12", 36826],
  ["2022-01", 36860],
  ["2022-02", 37332],
  ["2022-03", 37774],
  ["2022-04", 37520],
  ["2022-05", 37062],
  ["2022-06", 36890],
  ["2022-07", 37017],
  ["2022-08", 37663],
  ["2022-09", 37987],
  ["2022-10", 38099],
  ["2022-11", 38059],
  ["2022-12", 37727],
  ["2023-01", 37697],
  ["2023-02", 38352],
  ["2023-03", 38770],
  ["2023-04", 39212],
  ["2023-05", 38853],
  ["2023-06", 38516],
  ["2023-07", 38423],
  ["2023-08", 39013],
  ["2023-09", 39569],
  ["2023-10", 39367],
  ["2023-11", 39490],
  ["2023-12", 38841],
  ["2024-01", 38700],
  ["2024-02", 39348],
  ["2024-03", 40012],
  ["2024-04", 39969],
  ["2024-05", 39512],
  ["2024-06", 39264],
  ["2024-07", 39502],
  ["2024-08", 40213],
  ["2024-09", 40184],
  ["2024-10", 40064],
  ["2024-11", 39992],
  ["2024-12", 39670],
  ["2025-01", 39348],
  ["2025-02", 39793],
  ["2025-03", 40239],
  ["2025-04", 40756],
  ["2025-05", 39769],
  ["2025-06", 39599],
  ["2025-07", 39644],
  ["2025-08", 40217],
  ["2025-09", 40387],
  ["2025-10", null],
  ["2025-11", 39209],
  ["2025-12", 38759],
  ["2026-01", 38394],
  ["2026-02", 39451],
  ["2026-03", 39582],
  ["2026-04", 39430],
  ["2026-05", 39282],
  ["2026-06", 38633],
  ["2026-07", 38543],
];

/**
 * 고정 Payne County 월간 LAUS 취업자 수 시계열을 검사한다. 결측 월을 0으로 채우지 않는다.
 * @param value 091-LAUEZ 런 JSON.
 * @returns 검증된 카운티 취업자 수 시계열 또는 오류 상태.
 */
export function readPayneLausEmployedMonthly(value: unknown): PayneLausEmployedMonthlySeries | null {
  const v = value as { runId?: unknown; areaFips?: unknown; geography?: unknown; frequency?: unknown; rows?: PayneLausEmployedMonthRow[] };
  if (!v || v.runId !== RUN_ID || v.areaFips !== AREA_FIPS || v.geography !== GEOGRAPHY || v.frequency !== FREQUENCY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as PayneLausEmployedMonthRow & { unemployment_rate?: unknown };
    const [period, employed] = EXPECTED[i];
    if (!row || row.period !== period) return null;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period)) return null;
    // 실업률-인원수 뒤바뀜 방지: 실업률 키가 섞인 행은 거부한다.
    if ("unemployment_rate" in (row as object)) return null;
    if (employed === null) {
      if (row.employed !== null) return null;
    } else {
      if (typeof row.employed !== "number" || !Number.isInteger(row.employed)) return null;
      if (row.employed < 1000 || row.employed > 1000000) return null;
      if (row.employed !== employed) return null;
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as PayneLausEmployedMonthRow;
      if (prev.period >= row.period) return null;
    }
  }
  return v as PayneLausEmployedMonthlySeries;
}

/**
 * 시계열에서 한 월의 취업자 수를 꺼낸다. 미공개 월은 null 행을 돌려준다.
 * @param series 검증된 Payne County 월간 시계열.
 * @param period 조회 월 (YYYY-MM, 예: 2025-03).
 * @returns 해당 월 행 또는 없으면 null.
 */
export function monthEmployed(
  series: PayneLausEmployedMonthlySeries | null,
  period: string,
): PayneLausEmployedMonthRow | null {
  if (!series || series.runId !== RUN_ID) return null;
  const row = series.rows.find((r) => r.period === period);
  return row ?? null;
}
