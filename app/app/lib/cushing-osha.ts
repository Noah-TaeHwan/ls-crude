/** OSHA Cushing 현장 점검 한 건. 날짜는 Date Opened 일자이며 결측 연도는 0으로 채우지 않는다. */
export interface CushingOshaInspection {
  inspectionDate: string;
  activityId: string;
  reportId: string;
  inspectionType: string;
  scope: string;
  sic: string;
  naics: string;
  /** 공개된 violations 수. 미공개는 null이며 0으로 채우지 않는다. */
  violations: number | null;
  establishmentName: string;
}
/** OSHA Cushing 현장 점검 날짜 목록. 바쁨·WTI·QCEW·처리량이 아니다. */
export interface CushingOshaSeries {
  runId: string;
  geography: string;
  rows: CushingOshaInspection[];
}

const RUN_ID = "20260910T091OSHAZ";
const GEOGRAPHY = "Cushing, Oklahoma (OSHA IMIS site ZIP 74023, state OK)";
/** 고정 점검 순서 [inspectionDate, activityId, inspectionType, violations]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string, string, string, number | null]> = [
  ["1973-04-25", "17066754", "Accident", null],
  ["1973-10-24", "17069725", "Accident", null],
  ["1974-10-02", "17052838", "Planned", 2],
  ["1974-11-29", "17053000", "Planned", null],
  ["1975-07-09", "17007386", "Planned", 8],
  ["1975-07-09", "17007394", "Planned", 8],
  ["1975-09-25", "17018300", "Planned", 6],
  ["1975-09-25", "17018318", "Planned", 14],
  ["1975-09-25", "17054024", "FollowUp", null],
  ["1975-10-07", "17018326", "Planned", 6],
  ["1975-10-29", "17018458", "FollowUp", null],
  ["1975-10-29", "17018466", "Planned", 14],
  ["1975-11-04", "17018508", "FollowUp", null],
  ["1975-11-11", "17018516", "Planned", null],
  ["1975-11-11", "17018524", "Planned", null],
  ["1975-11-11", "17018532", "Planned", null],
  ["1975-11-11", "17018540", "Planned", null],
  ["1975-11-11", "17018557", "Planned", null],
  ["1975-11-18", "17008061", "Planned", 8],
  ["1975-11-19", "17008095", "Planned", 4],
  ["1975-11-19", "17008103", "Planned", 11],
  ["1975-12-02", "17018680", "Planned", null],
  ["1975-12-02", "17018698", "Planned", 9],
  ["1975-12-02", "17018706", "Planned", null],
  ["1975-12-02", "17018714", "Planned", null],
  ["1975-12-02", "17018722", "Planned", null],
  ["1975-12-02", "17018730", "Planned", null],
  ["1976-01-08", "17008350", "FollowUp", 2],
  ["1976-01-13", "17038142", "Planned", 5],
  ["1976-01-13", "17038167", "Planned", 4],
  ["1976-01-14", "17030198", "FollowUp", 4],
  ["1976-03-12", "17030297", "FollowUp", null],
  ["1976-04-15", "17052713", "FollowUp", 4],
  ["1976-05-27", "17018946", "FollowUp", null],
  ["1976-07-12", "17019043", "FollowUp", null],
  ["1977-04-19", "17012071", "Complaint", null],
  ["1979-02-21", "17083866", "Complaint", null],
  ["1979-02-26", "17011271", "Complaint", 51],
  ["1979-03-15", "17047622", "Complaint", 7],
  ["1979-03-27", "17011313", "Complaint", 1],
  ["1979-03-27", "17011321", "FollowUp", null],
  ["1979-05-04", "17041757", "FollowUp", null],
  ["1980-04-24", "17031907", "Planned", 4],
  ["1980-07-10", "17035262", "Planned", 2],
  ["1980-09-11", "17080979", "Complaint", 4],
  ["1980-12-17", "17022401", "Planned", 1],
  ["1981-04-20", "17077348", "Planned", 3],
  ["1981-11-04", "17024241", "Planned", null],
  ["1981-11-30", "17081340", "Complaint", null],
  ["1982-12-16", "16879694", "Planned", 1],
  ["1982-12-17", "16879702", "Planned", 7],
  ["1983-11-03", "16917536", "Planned", 1],
  ["1983-11-03", "16917544", "Planned", 2],
  ["1983-11-04", "16917551", "Planned", 2],
  ["1983-11-04", "16917569", "Planned", null],
  ["1983-11-10", "16926883", "Planned", 1],
  ["1983-11-10", "16926891", "Planned", 3],
  ["1983-11-10", "16926909", "Planned", 1],
  ["1983-11-10", "16926917", "Planned", 2],
  ["1983-11-10", "16926925", "Planned", 1],
  ["1983-11-10", "16926933", "Planned", 1],
  ["1985-11-04", "101802759", "Accident", 1],
  ["1985-11-26", "101802668", "Planned", null],
  ["1986-12-05", "103642914", "Prog Other", null],
  ["1987-03-24", "101801496", "Planned", 8],
  ["1987-08-19", "102246220", "Planned", null],
  ["1987-10-08", "100699784", "Planned", 3],
  ["1987-11-17", "102417425", "Planned", 3],
  ["1987-11-17", "102417433", "Planned", 4],
  ["1987-12-10", "100787845", "Planned", null],
  ["1988-10-20", "100583020", "Planned", 14],
  ["1989-06-06", "102310117", "Complaint", null],
  ["1989-08-24", "102252954", "Planned", 1],
  ["1989-09-13", "106644610", "Referral", 2],
  ["1990-01-08", "102254885", "Planned", 2],
  ["1990-01-08", "102423969", "Planned", 3],
  ["1990-01-08", "102423985", "Planned", 1],
  ["1990-05-08", "106652761", "Planned", null],
  ["1990-08-23", "107503872", "Planned", 5],
  ["1990-08-23", "107503880", "Planned", 1],
  ["1990-08-23", "107503898", "Planned", 5],
  ["1990-08-24", "107503914", "Planned", 8],
  ["1990-08-24", "107503922", "Planned", 6],
  ["1990-09-12", "107504144", "FollowUp", 1],
  ["1991-05-22", "107498453", "Planned", null],
  ["1991-06-14", "107498784", "Planned", null],
  ["1992-01-15", "107523466", "Planned", null],
  ["1992-01-15", "107523474", "Planned", null],
  ["1992-01-15", "107523482", "Planned", null],
  ["1992-05-28", "108743923", "Planned", null],
  ["1992-08-13", "107529265", "Planned", 3],
  ["1993-03-10", "102247822", "Planned", 3],
  ["1993-03-10", "109058792", "Planned", null],
  ["1993-08-17", "108737990", "Planned", null],
  ["1993-08-17", "108738048", "Planned", 1],
  ["1993-08-17", "108738055", "Planned", 1],
  ["1993-08-20", "109059428", "Complaint", 2],
  ["1994-04-14", "109063545", "Planned", 2],
  ["1996-09-06", "300471356", "Planned", null],
  ["1996-12-04", "109064576", "Complaint", 3],
  ["1997-02-12", "300473394", "Planned", null],
  ["1997-09-25", "301870911", "Planned", 1],
  ["1997-09-26", "301870887", "Planned", 1],
  ["1998-02-24", "301875423", "Planned", 3],
  ["1998-06-02", "301876827", "Planned", 4],
  ["1998-06-02", "301876835", "Planned", null],
  ["1998-06-02", "301876843", "Planned", 4],
  ["1998-08-05", "301878161", "Planned", null],
  ["2000-11-18", "303639298", "Other", 1],
  ["2002-07-24", "304964299", "Planned", 9],
  ["2002-11-21", "304966450", "Referral", 1],
  ["2003-05-15", "304969678", "Complaint", 1],
  ["2003-07-02", "306638131", "Complaint", 1],
  ["2003-07-02", "306638412", "Complaint", null],
  ["2003-09-11", "306641804", "Planned", null],
  ["2003-11-17", "306640996", "Complaint", 3],
  ["2004-02-03", "306642463", "Planned", null],
  ["2004-08-18", "306646662", "Planned", 1],
  ["2004-08-18", "306646670", "Planned", null],
  ["2004-08-18", "306646688", "Planned", 1],
  ["2004-08-18", "306646696", "Planned", 3],
  ["2004-08-18", "306646704", "Planned", null],
  ["2005-05-11", "308063478", "Planned", 1],
  ["2005-05-11", "308063486", "Planned", 2],
  ["2005-05-11", "308063494", "Planned", 1],
  ["2005-05-11", "308063551", "Prog Related", null],
  ["2006-06-30", "309786663", "Complaint", 3],
  ["2008-08-27", "312376908", "Accident", 4],
  ["2008-11-20", "312379761", "Planned", null],
  ["2008-11-20", "312379779", "Planned", null],
  ["2008-11-20", "312379787", "Planned", null],
  ["2008-12-05", "312379969", "Planned", null],
  ["2009-04-15", "312383300", "Planned", null],
  ["2009-04-16", "312383425", "Planned", 4],
  ["2012-04-11", "331255.015", "Planned", 3],
  ["2013-10-30", "945251.015", "Planned", 7],
  ["2013-11-06", "948393.015", "Complaint", null],
  ["2014-07-28", "987677.015", "Referral", null],
  ["2014-07-28", "987703.015", "Planned", null],
  ["2016-11-01", "1191387.015", "Referral", 3],
  ["2017-03-14", "1217429.015", "Planned", null],
  ["2017-03-14", "1217434.015", "Prog Related", null],
  ["2017-03-14", "1217441.015", "Prog Related", null],
  ["2018-09-05", "1342680.015", "Complaint", null],
  ["2019-05-09", "1399183.015", "Referral", 1],
  ["2019-06-07", "1411795.015", "Complaint", null],
  ["2019-06-20", "1409975.015", "Complaint", 2],
  ["2022-06-21", "1603116.015", "Referral", null],
  ["2022-06-21", "1603120.015", "Planned", null],
  ["2022-06-21", "1603123.015", "Planned", null],
  ["2023-07-28", "1686664.015", "Referral", 1],
  ["2023-08-03", "1688704.015", "Planned", null],
  ["2024-07-01", "1759567.015", "Fat/Cat", 1],
  ["2024-07-01", "1760054.015", "Unprog Rel", null],
  ["2024-07-01", "1760066.015", "Unprog Rel", null],
  ["2024-07-01", "1760067.015", "Planned", null],
  ["2024-07-01", "1761677.015", "Planned", null],
  ["2024-07-02", "1760056.015", "Planned", null],
  ["2025-01-22", "1799318.015", "Complaint", null],
  ["2025-01-22", "1799321.015", "Prog Related", null],
  ["2026-08-14", "1911485.015", "Fat/Cat", null],
  ["2026-08-14", "1911490.015", "Unprog Rel", null],
];

/**
 * 고정 OSHA Cushing 점검 날짜 목록을 검사한다. 주 전체를 Cushing으로 바꾸지 않는다.
 * @param value 091-OSHA-Z 런 JSON.
 * @returns 검증된 점검 목록 또는 오류 상태.
 */
export function readCushingOsha(value: unknown): CushingOshaSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; rows?: CushingOshaInspection[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingOshaInspection;
    const [inspectionDate, activityId, inspectionType, violations] = EXPECTED[i];
    if (!row || row.inspectionDate !== inspectionDate || row.activityId !== activityId) return null;
    if (row.inspectionType !== inspectionType || row.violations !== violations) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.inspectionDate)) return null;
    if (typeof row.establishmentName !== "string" || row.establishmentName.length === 0) return null;
    if (row.violations !== null && (!Number.isInteger(row.violations) || row.violations < 0)) return null;
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingOshaInspection;
      if (prev.inspectionDate > row.inspectionDate) return null;
      if (prev.inspectionDate === row.inspectionDate && prev.activityId >= row.activityId) return null;
    }
  }
  return v as CushingOshaSeries;
}

/**
 * 지정 날짜의 Cushing 점검을 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 OSHA Cushing 점검 목록.
 * @param inspectionDate 날짜 (예: 2024-07-02).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function oshaInspectionsOn(series: CushingOshaSeries | null, inspectionDate: string): CushingOshaInspection[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.inspectionDate === inspectionDate);
}
