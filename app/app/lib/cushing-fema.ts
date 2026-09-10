/** FEMA Payne County 재난선포 한 건. 날짜는 declarationDate의 일자이며 결측 연은 0으로 채우지 않는다. */
export interface CushingFemaDeclaration {
  declarationDate: string;
  femaDeclarationString: string;
  disasterNumber: number;
  declarationType: string;
  incidentType: string;
  declarationTitle: string;
  incidentBeginDate: string;
  /** 공개되지 않은 종료일은 null이며 채우지 않는다. */
  incidentEndDate: string | null;
  incidentId: string;
  paDeclared: boolean;
  iaDeclared: boolean;
  ihDeclared: boolean;
  hmDeclared: boolean;
}
/** FEMA Payne County 재난선포 날짜 목록. 바쁨·WTI·NOAA 폭풍 건수가 아니다. */
export interface CushingFemaSeries {
  runId: string;
  geography: string;
  rows: CushingFemaDeclaration[];
}

const RUN_ID = "20260910T091FEMAZ";
const GEOGRAPHY = "Payne County, Oklahoma (state OK, fipsStateCode 40, fipsCountyCode 119, designatedArea as filed)";
/** 고정 선포 순서 [declarationDate, femaDeclarationString, declarationType, incidentType]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string, string, string, string]> = [
  ["1974-06-10", "DR-441-OK", "DR", "Flood"],
  ["1974-11-26", "DR-453-OK", "DR", "Flood"],
  ["1975-07-09", "DR-474-OK", "DR", "Severe Storm"],
  ["1982-06-18", "DR-662-OK", "DR", "Flood"],
  ["1984-05-03", "DR-704-OK", "DR", "Tornado"],
  ["1986-10-14", "DR-778-OK", "DR", "Flood"],
  ["1990-05-18", "DR-866-OK", "DR", "Severe Storm"],
  ["1993-05-12", "DR-991-OK", "DR", "Severe Storm"],
  ["1996-02-27", "EM-3118-OK", "EM", "Fire"],
  ["1999-05-04", "DR-1272-OK", "DR", "Tornado"],
  ["2001-01-05", "DR-1355-OK", "DR", "Severe Ice Storm"],
  ["2001-06-29", "DR-1384-OK", "DR", "Severe Storm"],
  ["2002-02-01", "DR-1401-OK", "DR", "Severe Ice Storm"],
  ["2003-02-04", "DR-1452-OK", "DR", "Severe Ice Storm"],
  ["2005-09-05", "EM-3219-OK", "EM", "Hurricane"],
  ["2006-01-10", "DR-1623-OK", "DR", "Fire"],
  ["2006-01-19", "FM-2623-OK", "FM", "Fire"],
  ["2007-01-14", "EM-3272-OK", "EM", "Severe Ice Storm"],
  ["2007-07-07", "DR-1712-OK", "DR", "Severe Storm"],
  ["2007-12-10", "EM-3280-OK", "EM", "Severe Ice Storm"],
  ["2007-12-18", "DR-1735-OK", "DR", "Severe Ice Storm"],
  ["2009-04-10", "FM-2813-OK", "FM", "Fire"],
  ["2009-06-19", "DR-1846-OK", "DR", "Fire"],
  ["2010-01-30", "EM-3308-OK", "EM", "Severe Storm"],
  ["2010-02-25", "DR-1876-OK", "DR", "Severe Storm"],
  ["2011-02-02", "EM-3316-OK", "EM", "Severe Storm"],
  ["2012-08-04", "FM-5002-OK", "FM", "Fire"],
  ["2012-08-04", "FM-5003-OK", "FM", "Fire"],
  ["2019-06-01", "DR-4438-OK", "DR", "Severe Storm"],
  ["2020-03-13", "EM-3462-OK", "EM", "Biological"],
  ["2020-04-05", "DR-4530-OK", "DR", "Biological"],
  ["2020-12-21", "DR-4575-OK", "DR", "Severe Ice Storm"],
  ["2021-02-17", "EM-3555-OK", "EM", "Severe Ice Storm"],
  ["2021-02-24", "DR-4587-OK", "DR", "Severe Ice Storm"],
  ["2023-07-19", "DR-4721-OK", "DR", "Severe Storm"],
  ["2024-10-30", "FM-5543-OK", "FM", "Fire"],
  ["2025-03-14", "FM-5558-OK", "FM", "Fire"],
  ["2025-03-15", "FM-5566-OK", "FM", "Fire"],
  ["2025-05-21", "DR-4866-OK", "DR", "Fire"],
];

/**
 * 고정 FEMA Payne County 선포 날짜 목록을 검사한다. 주 전체를 Payne으로 바꾸지 않는다.
 * @param value 091-FEMA-Z 런 JSON.
 * @returns 검증된 선포 목록 또는 오류 상태.
 */
export function readCushingFema(value: unknown): CushingFemaSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; rows?: CushingFemaDeclaration[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingFemaDeclaration;
    const [declarationDate, femaDeclarationString, declarationType, incidentType] = EXPECTED[i];
    if (!row || row.declarationDate !== declarationDate) return null;
    if (row.femaDeclarationString !== femaDeclarationString) return null;
    if (row.declarationType !== declarationType || row.incidentType !== incidentType) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.declarationDate)) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.incidentBeginDate)) return null;
    if (row.incidentEndDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(row.incidentEndDate)) return null;
    if (typeof row.declarationTitle !== "string" || row.declarationTitle.length === 0) return null;
    if (typeof row.incidentId !== "string" || row.incidentId.length === 0) return null;
    if (!Number.isInteger(row.disasterNumber) || row.disasterNumber <= 0) return null;
    for (const b of [row.paDeclared, row.iaDeclared, row.ihDeclared, row.hmDeclared]) {
      if (typeof b !== "boolean") return null;
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingFemaDeclaration;
      if (prev.declarationDate > row.declarationDate) return null;
      if (prev.declarationDate === row.declarationDate && prev.femaDeclarationString >= row.femaDeclarationString) return null;
    }
  }
  return v as CushingFemaSeries;
}

/**
 * 지정 날짜의 Payne County 선포를 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 FEMA Payne County 선포 목록.
 * @param declarationDate 날짜 (예: 2012-08-04).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function femaDeclarationsOn(series: CushingFemaSeries | null, declarationDate: string): CushingFemaDeclaration[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.declarationDate === declarationDate);
}
