/** ECHO Cushing 유해폐기물 취급자 한 건. 점검일은 RCRA 최종 점검 일자이며 미공개는 null로 두고 0으로 채우지 않는다. TRI 파운드가 아니다. */
export interface CushingRcraHandler {
  facilityName: string;
  sourceId: string;
  registryId: string;
  city: string;
  /** filed 그대로(Payne 50 + Lincoln 1). */
  county: string;
  /** filed 그대로. */
  status: string;
  /** filed 그대로(SQG/VSQG/Transporter/Other). */
  universe: string;
  /** 마지막 RCRA 점검 일자(ISO). 미공개는 null이며 0이나 임의 날짜로 채우지 않는다. */
  lastInspectionDate: string | null;
  /** 마지막 비공식 조치 일자(ISO). 미공개는 null이다. */
  lastIeaDate: string | null;
  /** 마지막 공식 조치 일자(ISO). 미공개는 null이다. */
  lastFeaDate: string | null;
  /** DFR 창구간(2021-09-05..2026-09-30) 공개 점검 횟수. DFR이 공개한 0은 그대로 둔다. */
  inspectionCount: number;
  /** DFR 창구간 공개 공식 조치 수. DFR이 공개한 0은 그대로 둔다. */
  formalActions: number;
  /** DFR 공개 과징금 표기. 미공개는 null이다. */
  totalPenalties: string | null;
  /** DFR 폐기물 이력 공개값(원문 문자열, 단위 미공개). 미공개는 null이다. */
  waste: {
    hazardous: { y2023: string | null; y2024: string | null; y2025: string | null; y2026: string | null };
    acute: { y2023: string | null; y2024: string | null; y2025: string | null; y2026: string | null };
    pharma: { y2023: string | null; y2024: string | null; y2025: string | null; y2026: string | null };
  };
}
/** ECHO Cushing 유해폐기물 취급자 날짜 목록. 바쁨·WTI·TRI·VOC·처리량·대기 FCE·수질 점검이 아니다. */
export interface CushingRcraSeries {
  runId: string;
  geography: string;
  windowStart: string;
  windowEnd: string;
  rows: CushingRcraHandler[];
}

const RUN_ID = "20260910T091RCRAZ";
const GEOGRAPHY = "Cushing city, Oklahoma (ECHO RCRACity=CUSHING, state OK)";
const WINDOW_START = "2021-09-05";
const WINDOW_END = "2026-09-30";
const CITY = "CUSHING";
/** 고정 취급자 순서 [lastInspectionDate, sourceId, registryId, county, status, universe, lastIeaDate, lastFeaDate, inspectionCount, formalActions, totalPenalties, HW23..26, acute23..26, pharma23..26]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string | null, string, string, string, string, string, string | null, string | null, number, number, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null]> = [
  ["1985-08-28", "OKD065436784", "110007730492", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["1994-07-27", "OKD987071768", "110000454614", "PAYNE", "Inactive (     )", "Other", "1994-09-09", null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["1994-12-19", "OKD082471988", "110009305616", "PAYNE", "Inactive (     )", "Other", "1989-02-01", "1987-09-30", 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2001-10-11", "OKD987098605", "110007735139", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2005-03-03", "OKD980812721", "110007161588", "PAYNE", "Active (H    )", "SQG", "2008-09-17", null, 0, 0, "$0", "200", "442", "966", "8,051", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["2008-10-17", "OKR000023135", "110032658158", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2010-05-19", "OKR000001859", "110031514644", "PAYNE", "Active (H    )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2010-09-14", "OKD987071875", "110007733943", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", "68", "1,724", null, null, "0", "0", null, null, "0", "0", null, null],
  ["2011-02-28", "OKD987083193", "110004763051", "PAYNE", "Active (H    )", "VSQG", "2011-03-22", null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2013-04-23", "OKR000026922", "110044922108", "LINCOLN", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, "181", null, null, null, "0", null, null, null, "0", null, null],
  ["2013-06-05", "OKR000026674", "110044989787", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2013-12-17", "OKD987083987", "110004763435", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2014-12-03", "OKD077338473", "110007730839", "PAYNE", "Active (H    )", "VSQG", "2008-10-28", null, 0, 0, "$0", "36", "119", null, null, "0", "0", null, null, "0", "0", null, null],
  ["2017-02-17", "OKR000026393", "110043553650", "PAYNE", "Active (H    )", "SQG", "2017-02-17", null, 0, 0, "$0", "1,928", "680", "1,157", "408", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["2017-02-17", "OKR000031955", "110071192774", "PAYNE", "Active (H    )", "VSQG", "2017-03-02", null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2017-02-17", "OKR000032847", "110069636264", "PAYNE", "Inactive (     )", "Other", "2017-03-17", null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  ["2021-07-15", "OKR000027912", "110054858472", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OK0000888628", "110004743537", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000733360", "110007724454", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000757906", "110007725729", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000757989", "110007725774", "PAYNE", "Active (H    )", "SQG", null, null, 0, 0, "$0", "7", null, null, null, "0", null, null, null, "0", null, null, null],
  [null, "OKD000758631", "110007726283", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000758797", "110007726416", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000764407", "110022404423", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000764712", "110007727512", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000789883", "110007729002", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD000829481", "110007729217", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD007192289", "110004745642", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD007780240", "110004746446", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD020730776", "110004746801", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD042550772", "110007729805", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD074288168", "110004750591", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD980864060", "110007732329", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD987071883", "110007733952", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKD987073772", "110004761428", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKP000040428", "110071381018", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", "2,259", null, null, null, "0", null, null, null, "0", null, null, null],
  [null, "OKP000044404", "110072053870", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, "3,972", null, null, null, "0", null, null, null, "0", null],
  [null, "OKP410179821", "110067677071", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000004093", "110007388683", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000016121", "110012275830", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000016501", "110012276198", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000016519", "110012276205", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000019612", "110007385935", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000023333", "110033156484", "PAYNE", "Active (H    )", "VSQG", null, null, 0, 0, "$0", "161 - 167", "191 - 194", "0 - 3", null, "0", "0 - 1", "0", null, "0 - 7", "0 - 3", "0 - 3", null],
  [null, "OKR000025544", "110039592170", "PAYNE", "Active (H    )", "Transporter", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000026690", "110043859740", "PAYNE", "Active (H    )", "SQG", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000038547", "110071139715", "PAYNE", "Active (H    )", "SQG", null, null, 0, 0, "$0", null, null, "0 - 227", null, null, null, "0 - 227", null, null, null, "0 - 227", null],
  [null, "OKR000038745", "110071139726", "PAYNE", "Active (H    )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKR000039883", "110071307856", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, "183,161", null, null, null, "0", null, null, null, "0", null, null],
  [null, "OKR000042895", "110071843293", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],
  [null, "OKT410010680", "110004772238", "PAYNE", "Inactive (     )", "Other", null, null, 0, 0, "$0", null, null, null, null, null, null, null, null, null, null, null, null],];

const WASTE_KEYS = ["hazardous", "acute", "pharma"] as const;
const WASTE_YEARS = ["y2023", "y2024", "y2025", "y2026"] as const;

/**
 * 고정 ECHO Cushing 유해폐기물 취급자 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않고 TRI·대기·수질 행을 섞지 않는다.
 * @param value 091-RCRAZ 런 JSON.
 * @returns 검증된 취급자 목록 또는 오류 상태.
 */
export function readCushingRcra(value: unknown): CushingRcraSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; windowStart?: unknown; windowEnd?: unknown; rows?: CushingRcraHandler[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (v.windowStart !== WINDOW_START || v.windowEnd !== WINDOW_END) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  let seenUndated = false;
  let prevKey = "";
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingRcraHandler;
    const [lastInspectionDate, sourceId, registryId, county, status, universe, lastIeaDate, lastFeaDate, inspectionCount, formalActions, totalPenalties, ...waste] = EXPECTED[i];
    if (!row || row.lastInspectionDate !== lastInspectionDate || row.sourceId !== sourceId) return null;
    if (row.registryId !== registryId || row.county !== county) return null;
    if (row.status !== status || row.universe !== universe) return null;
    if (row.lastIeaDate !== lastIeaDate || row.lastFeaDate !== lastFeaDate) return null;
    if (row.inspectionCount !== inspectionCount || row.formalActions !== formalActions) return null;
    if (row.totalPenalties !== totalPenalties) return null;
    if (typeof row.facilityName !== "string" || row.facilityName.length === 0) return null;
    if (row.city !== CITY) return null;
    if (!/^OK/.test(row.sourceId)) return null;
    if (row.lastInspectionDate !== null && !isoDate.test(row.lastInspectionDate)) return null;
    if (row.lastIeaDate !== null && !isoDate.test(row.lastIeaDate)) return null;
    if (row.lastFeaDate !== null && !isoDate.test(row.lastFeaDate)) return null;
    if (!Number.isInteger(row.inspectionCount) || row.inspectionCount < 0) return null;
    if (!Number.isInteger(row.formalActions) || row.formalActions < 0) return null;
    if (!row.waste) return null;
    let k = 0;
    for (const wk of WASTE_KEYS) {
      const group = (row.waste as Record<string, Record<string, unknown>>)[wk];
      if (!group) return null;
      for (const y of WASTE_YEARS) {
        const want = waste[k++];
        const got = group[y] ?? null;
        if (got !== want) return null;
        if (got !== null && typeof got !== "string") return null;
      }
    }
    // 날짜 있는 행이 먼저 날짜순, 미공개 행은 뒤에 sourceId순. 결측을 채우지 않는다.
    const key = row.lastInspectionDate === null ? `~${row.sourceId}` : `${row.lastInspectionDate}|${row.sourceId}`;
    if (row.lastInspectionDate === null) seenUndated = true;
    else if (seenUndated) return null;
    if (i > 0 && prevKey >= key) return null;
    prevKey = key;
  }
  return v as CushingRcraSeries;
}

/**
 * 지정 날짜에 마지막 RCRA 점검을 받은 Cushing 취급자를 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 ECHO Cushing 유해폐기물 취급자 목록.
 * @param lastInspectionDate 날짜 (예: 2017-02-17).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function rcraHandlersOn(series: CushingRcraSeries | null, lastInspectionDate: string): CushingRcraHandler[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.lastInspectionDate === lastInspectionDate);
}
