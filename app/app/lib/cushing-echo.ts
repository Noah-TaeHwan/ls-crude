/** ECHO Cushing 대기 점검 한 건. 점검일은 Full Compliance Evaluation 일자이며 미공개는 null로 두고 0으로 채우지 않는다. */
export interface CushingEchoInspection {
  facilityName: string;
  sourceId: string;
  registryId: string;
  city: string;
  county: string;
  status: string;
  classification: string;
  /** 마지막 FCE 일자(ISO). 미공개는 null이며 0이나 임의 날짜로 채우지 않는다. */
  inspectionDate: string | null;
  /** 공개된 FCE 횟수. 미공개는 null이며 0으로 채우지 않는다. */
  fceCount: number | null;
  /** 마지막 평가 일자(ISO). 미공개는 null이다. */
  lastEvalDate: string | null;
  /** 공개된 평가 횟수. 미공개는 null이며 0으로 채우지 않는다. */
  evalCount: number | null;
  /** 마지막 위반 일자(ISO). 미공개는 null이다. */
  lastViolDate: string | null;
  recentViolations: number;
  complianceStatus: string;
}
/** ECHO Cushing 대기 점검 날짜 목록. 바쁨·WTI·TRI·VOC·처리량이 아니다. */
export interface CushingEchoSeries {
  runId: string;
  geography: string;
  rows: CushingEchoInspection[];
}

const RUN_ID = "20260910T091ECHOZ";
const GEOGRAPHY = "Cushing city, Oklahoma (ECHO AIRCity=CUSHING, state OK)";
const CITY = "CUSHING";
/** 고정 시설 순서 [inspectionDate, sourceId, registryId, county, status, classification, fceCount, lastEvalDate, evalCount, lastViolDate, recentViolations, complianceStatus]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string | null, string, string, string, string, string, number | null, string | null, number | null, string | null, number, string]> = [
  ["1998-11-19", "OK0000004011900042", "110007388638", "Payne", "Operating", "Minor Emissions", null, "1998-11-19", null, null, 0, "No Violation Identified"],
  ["2005-02-10", "OK0000004011900001", "110007385935", "Payne", "Operating", "Minor Emissions", null, "2005-02-10", 1, null, 0, "No Violation Identified"],
  ["2005-03-10", "OK0000004011900002", "110007394685", "Payne", "Operating", "Minor Emissions", null, "2005-03-10", null, null, 0, "No Violation Identified"],
  ["2006-01-06", "OK0000004011900015", "110007388683", "Payne", "Operating", "Minor Emissions", null, "2006-01-06", null, null, 0, "No Violation Identified"],
  ["2006-01-12", "OK0000004011900027", "110024420009", "Payne", "Operating", "Minor Emissions", null, "2006-01-12", 1, null, 0, "No Violation Identified"],
  ["2010-05-12", "OK0000004011900026", "110031514644", "Payne", "Permanently Closed", "Synthetic Minor Emissions", null, "2010-05-12", null, null, 0, "No Violation Identified"],
  ["2015-01-21", "OK0000004011900308", "110022404423", "Payne", "Operating", "Synthetic Minor Emissions", null, "2015-01-21", 3, null, 0, "No Violation Identified"],
  ["2020-02-21", "OK0000004011900080", "110063223818", "Payne", "Permanently Closed", "Synthetic Minor Emissions", null, "2020-02-21", 1, "2020-05-21", 0, "No Violation Identified"],
  ["2020-06-12", "OK0000004011900073", "110058903575", "Payne", "Permanently Closed", "Synthetic Minor Emissions", null, "2020-06-12", null, "2015-04-13", 0, "No Violation Identified"],
  ["2020-06-22", "OK0000004011900099", "110064026405", "Payne", "Permanently Closed", "Synthetic Minor Emissions", null, "2023-10-23", 7, "2020-09-20", 0, "No Violation Identified"],
  ["2022-01-31", "OK0000004008100103", "110070205376", "Lincoln", "Permanently Closed", "Major Emissions", 1, "2022-01-31", 1, null, 0, "No Violation Identified"],
  ["2023-03-28", "OK0000004008100050", "110039620782", "Lincoln", "Operating", "Minor Emissions", 1, "2023-03-28", 3, "2023-05-04", 0, "No Violation Identified"],
  ["2023-06-19", "OK0000004008100059", "110043685615", "Lincoln", "Permanently Closed", "Synthetic Minor Emissions", 1, "2023-06-19", 2, null, 0, "No Violation Identified"],
  ["2023-12-21", "OK0000004011900045", "110055588065", "Payne", "Operating", "80% Synthetic Minor Emissions", 1, "2023-12-21", 1, "2019-08-14", 0, "No Violation Identified"],
  ["2024-08-20", "OK0000004008100011", "110007162514", "Lincoln", "Operating", "Major Emissions", 2, "2026-02-16", 14, "2024-11-18", 0, "No Violation Identified"],
  ["2024-08-26", "OK0000004008100056", "110040757384", "Lincoln", "Operating", "Major Emissions", 2, "2026-01-30", 8, null, 0, "No Violation Identified"],
  ["2024-10-17", "OK0000004008100057", "110042147593", "Lincoln", "Operating", "80% Synthetic Minor Emissions", 1, "2024-10-17", 4, "2020-02-04", 0, "No Violation Identified"],
  ["2024-10-28", "OK0000004008100037", "110016686273", "Lincoln", "Operating", "80% Synthetic Minor Emissions", 1, "2024-10-28", 4, "2020-12-28", 0, "No Violation Identified"],
  ["2024-10-28", "OK0000004011900093", "110010359076", "Payne", "Operating", "80% Synthetic Minor Emissions", 1, "2024-10-28", 3, "2020-05-04", 0, "No Violation Identified"],
  ["2025-01-14", "OK0000004011990003", "110007161588", "Payne", "Operating", "Major Emissions", 2, "2025-10-23", 24, "2025-02-27", 0, "No Violation Identified"],
  ["2025-03-13", "OK0000004008100099", "110070943445", "Lincoln", "Operating", "Major Emissions", 2, "2025-03-13", 9, "2024-04-24", 0, "No Violation Identified"],
  ["2025-03-17", "OK0000004011900054", "110041345826", "Payne", "Operating", "Major Emissions", 2, "2025-11-17", 20, "2023-06-09", 0, "No Violation Identified"],
  ["2025-06-18", "OK0000004011900095", "110007388674", "Payne", "Operating", "Major Emissions", 2, "2025-11-17", 19, "2023-09-08", 0, "No Violation Identified"],
  ["2025-07-22", "OK0000004011900101", "110007733943", "Payne", "Operating", "Major Emissions", 3, "2025-11-11", 8, null, 0, "No Violation Identified"],
  ["2025-09-23", "OK0000004011900030", "110040631144", "Payne", "Operating", "80% Synthetic Minor Emissions", 1, "2025-09-23", 3, null, 0, "No Violation Identified"],
  ["2026-01-16", "OK0000004011900004", "110021359340", "Payne", "Operating", "Major Emissions", 3, "2026-01-16", 13, "2022-06-03", 0, "No Violation Identified"],
  ["2026-02-23", "OK0000004011900087", "110007730839", "Payne", "Operating", "Major Emissions", 3, "2026-02-23", 9, "2022-02-17", 0, "No Violation Identified"],
  ["2026-02-26", "OK0000004008100058", "110043180116", "Lincoln", "Operating", "80% Synthetic Minor Emissions", 1, "2026-02-26", 2, "2016-01-29", 0, "No Violation Identified"],
  ["2026-05-05", "OK0000004011900057", "110043287813", "Payne", "Operating", "Major Emissions", 3, "2026-05-05", 7, "2018-03-20", 0, "No Violation Identified"],
  [null, "OK0000004008100073", "110056285522", "Lincoln", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004008100101", "110070083460", "Lincoln", "Permanently Closed", "Major Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900046", "110040506011", "Payne", "Permanently Closed", "Synthetic Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900053", "110040757446", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900061", "110045947240", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900064", "110056285559", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900075", "110061085249", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900104", "110062687506", "Payne", "Permanently Closed", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900107", "110055604902", "Payne", "Permanently Closed", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900124", "110070063892", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900125", "110070132821", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900135", "110070624549", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900142", "110070936844", "Payne", "Operating", "Minor Emissions", null, null, null, "2021-04-15", 0, "No Violation Identified"],
  [null, "OK0000004011900146", "110071073173", "Payne", "Operating", "Minor Emissions", null, null, null, null, 0, "No Violation Identified"],
  [null, "OK0000004011900170", "110072129430", "Payne", "Operating", "80% Synthetic Minor Emissions", null, null, null, null, 0, "No Violation Identified"],];

/**
 * 고정 ECHO Cushing 대기 점검 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않는다.
 * @param value 091-ECHOZ 런 JSON.
 * @returns 검증된 점검 목록 또는 오류 상태.
 */
export function readCushingEcho(value: unknown): CushingEchoSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; rows?: CushingEchoInspection[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  let seenUndated = false;
  let prevKey = "";
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingEchoInspection;
    const [inspectionDate, sourceId, registryId, county, status, classification, fceCount, lastEvalDate, evalCount, lastViolDate, recentViolations, complianceStatus] = EXPECTED[i];
    if (!row || row.inspectionDate !== inspectionDate || row.sourceId !== sourceId) return null;
    if (row.registryId !== registryId || row.county !== county) return null;
    if (row.status !== status || row.classification !== classification) return null;
    if (row.fceCount !== fceCount || row.lastEvalDate !== lastEvalDate) return null;
    if (row.evalCount !== evalCount || row.lastViolDate !== lastViolDate) return null;
    if (row.recentViolations !== recentViolations || row.complianceStatus !== complianceStatus) return null;
    if (typeof row.facilityName !== "string" || row.facilityName.length === 0) return null;
    if (row.city !== CITY) return null;
    for (const d of [row.inspectionDate, row.lastEvalDate, row.lastViolDate]) {
      if (d !== null && !isoDate.test(d)) return null;
    }
    for (const c of [row.fceCount, row.evalCount]) {
      if (c !== null && (!Number.isInteger(c) || c < 0)) return null;
    }
    if (!Number.isInteger(row.recentViolations) || row.recentViolations < 0) return null;
    // 날짜 있는 행이 먼저 날짜순, 미공개 행은 뒤에 sourceId순. 결측을 채우지 않는다.
    const key = row.inspectionDate === null ? `~${row.sourceId}` : `${row.inspectionDate}|${row.sourceId}`;
    if (row.inspectionDate === null) seenUndated = true;
    else if (seenUndated) return null;
    if (i > 0 && prevKey >= key) return null;
    prevKey = key;
  }
  return v as CushingEchoSeries;
}

/**
 * 지정 날짜의 Cushing 대기 점검 시설을 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 ECHO Cushing 점검 목록.
 * @param inspectionDate 날짜 (예: 2025-01-14).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function echoInspectionsOn(series: CushingEchoSeries | null, inspectionDate: string): CushingEchoInspection[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.inspectionDate === inspectionDate);
}
