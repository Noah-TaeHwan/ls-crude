/** FRA Cushing 건널목 사고 한 건. 날짜는 date의 일자이며 신고연월과 일치한다. */
export interface CushingFraIncident {
  incidentDate: string;
  form: string;
  reportKey: string;
  railroad: string;
  county: string;
  filedCity: string;
  highwayUser: string;
  trainSpeedMph: number;
  killed: number;
  injured: number;
}
/** FRA Cushing 건널목 사고 날짜 목록. 처리량·바쁨·WTI·PHMSA가 아니다. */
export interface CushingFraSeries {
  runId: string;
  geography: string;
  form: string;
  rows: CushingFraIncident[];
}

const RUN_ID = "20260910T091FRAZ";
const GEOGRAPHY = "Cushing, Oklahoma (CITYNAME as filed, statecode 40)";
const FORM = "57";
/** 고정 사고 순서 [incidentDate, reportKey, railroad, county, highwayUser, trainSpeedMph, killed, injured]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string, string, string, string, string, number, number, number]> = [
  ["1976-10-15", "ATSF24106210197610", "ATSF", "PAWNEE", "Truck", 30, 0, 0],
  ["1980-02-25", "ATSF140280206198002", "ATSF", "PAWNEE", "Auto", 38, 0, 1],
  ["1982-05-11", "ATSF140582203198205", "ATSF", "PAYNE", "Truck-trailer", 20, 0, 0],
];

/**
 * 고정 FRA Cushing 사고 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않는다.
 * @param value 091-FRA-Z 런 JSON.
 * @returns 검증된 사고 목록 또는 오류 상태.
 */
export function readCushingFra(value: unknown): CushingFraSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; form?: unknown; rows?: CushingFraIncident[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY || v.form !== FORM) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingFraIncident;
    const [incidentDate, reportKey, railroad, county, highwayUser, trainSpeedMph, killed, injured] = EXPECTED[i];
    if (!row || row.incidentDate !== incidentDate || row.reportKey !== reportKey) return null;
    if (row.form !== FORM || row.railroad !== railroad || row.county !== county) return null;
    if (row.filedCity !== "CUSHING" || row.highwayUser !== highwayUser) return null;
    if (row.trainSpeedMph !== trainSpeedMph || row.killed !== killed || row.injured !== injured) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.incidentDate)) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingFraIncident;
      if (prev.incidentDate > row.incidentDate) return null;
      if (prev.incidentDate === row.incidentDate && prev.reportKey >= row.reportKey) return null;
    }
  }
  return v as CushingFraSeries;
}

/**
 * 지정 날짜의 Cushing 사고를 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 FRA Cushing 사고 목록.
 * @param incidentDate 날짜 (예: 1980-02-25).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function fraIncidentsOn(series: CushingFraSeries | null, incidentDate: string): CushingFraIncident[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.incidentDate === incidentDate);
}
