/** Payne County NOAA 폭풍 기록 한 건. 날짜는 BEGIN_DATE_TIME의 일자이며 결측 월·연은 0으로 채우지 않는다. */
export interface CushingStormEvent {
  beginDate: string;
  eventId: string;
  episodeId: string;
  eventType: string;
  beginDateTime: string;
  beginLocation: string;
  endLocation: string;
  /** 공개된 규모(우박 인치·풍속). 미공개는 null이며 0으로 채우지 않는다. */
  magnitude: string | null;
  magnitudeType: string | null;
  torFScale: string | null;
  injuriesDirect: number;
  injuriesIndirect: number;
  deathsDirect: number;
  deathsIndirect: number;
  damageProperty: string;
  damageCrops: string;
  source: string;
  wfo: string;
}
/** Payne County NOAA 폭풍 날짜 목록. 바쁨·WTI·GHCN 강수·KCUH 기온이 아니다. */
export interface CushingStormSeries {
  runId: string;
  geography: string;
  rows: CushingStormEvent[];
}

const RUN_ID = "20260910T091STMZ";
const GEOGRAPHY = "Payne County, Oklahoma (STATE=OKLAHOMA, CZ_NAME=PAYNE as filed)";
/** 고정 폭풍 순서 [beginDate, eventId, eventType, magnitude, magnitudeType, torFScale]. 날짜를 지어 내지 않는다. */
const EXPECTED: Array<[string, string, string, string | null, string | null, string | null]> = [
  ["2024-01-13", "1150786", "Cold/Wind Chill", null, null, null],
  ["2024-01-14", "1150747", "Extreme Cold/Wind Chill", null, null, null],
  ["2024-01-15", "1150815", "Cold/Wind Chill", null, null, null],
  ["2024-01-19", "1152280", "Cold/Wind Chill", null, null, null],
  ["2024-01-21", "1152422", "Winter Weather", null, null, null],
  ["2024-04-01", "1167487", "Hail", "1.00", null, null],
  ["2024-04-01", "1167488", "Hail", "1.00", null, null],
  ["2024-04-01", "1167489", "Hail", "0.75", null, null],
  ["2024-04-27", "1173321", "Hail", "0.75", null, null],
  ["2024-04-27", "1174433", "Tornado", null, null, "EF0"],
  ["2024-05-06", "1178540", "Thunderstorm Wind", "51.00", "MG", null],
  ["2024-05-06", "1178543", "Thunderstorm Wind", "61.00", "EG", null],
  ["2024-05-06", "1185057", "Flash Flood", null, null, null],
  ["2024-05-06", "1185242", "Thunderstorm Wind", "61.00", "EG", null],
  ["2024-05-20", "1180523", "Hail", "0.75", null, null],
  ["2024-05-20", "1180524", "Flash Flood", null, null, null],
  ["2024-05-25", "1181262", "Hail", "0.75", null, null],
  ["2024-06-02", "1189953", "High Wind", "56.00", "MG", null],
  ["2024-06-23", "1190041", "Excessive Heat", null, null, null],
  ["2024-06-25", "1190116", "Excessive Heat", null, null, null],
  ["2024-06-25", "1194040", "Thunderstorm Wind", "53.00", "MG", null],
  ["2024-06-28", "1190386", "Excessive Heat", null, null, null],
  ["2024-06-29", "1190434", "Excessive Heat", null, null, null],
  ["2024-07-01", "1201007", "Heat", null, null, null],
  ["2024-07-02", "1201088", "Heat", null, null, null],
  ["2024-07-03", "1201129", "Heat", null, null, null],
  ["2024-07-04", "1201163", "Heat", null, null, null],
  ["2024-07-14", "1201557", "Heat", null, null, null],
  ["2024-07-15", "1201611", "Excessive Heat", null, null, null],
  ["2024-07-29", "1201691", "Heat", null, null, null],
  ["2024-07-30", "1201731", "Heat", null, null, null],
  ["2024-07-31", "1201787", "Excessive Heat", null, null, null],
  ["2024-08-01", "1209430", "Excessive Heat", null, null, null],
  ["2024-08-06", "1209687", "Heat", null, null, null],
  ["2024-08-07", "1209721", "Heat", null, null, null],
  ["2024-08-13", "1209828", "Excessive Heat", null, null, null],
  ["2024-08-14", "1209877", "Excessive Heat", null, null, null],
  ["2024-08-15", "1208358", "Hail", "1.00", null, null],
  ["2024-08-15", "1209917", "Excessive Heat", null, null, null],
  ["2024-08-16", "1209966", "Excessive Heat", null, null, null],
  ["2024-08-17", "1210006", "Heat", null, null, null],
  ["2024-08-18", "1210099", "Excessive Heat", null, null, null],
  ["2024-08-23", "1210178", "Heat", null, null, null],
  ["2024-08-24", "1210252", "Excessive Heat", null, null, null],
  ["2024-08-25", "1210272", "Heat", null, null, null],
  ["2024-09-20", "1216115", "Heat", null, null, null],
  ["2024-09-25", "1216086", "Dense Fog", null, null, null],
  ["2024-11-01", "1220443", "Drought", null, null, null],
  ["2025-01-05", "1227273", "Cold/Wind Chill", null, null, null],
  ["2025-01-09", "1226064", "Heavy Snow", null, null, null],
  ["2025-01-20", "1229581", "Cold/Wind Chill", null, null, null],
  ["2025-02-12", "1240698", "Cold/Wind Chill", null, null, null],
  ["2025-02-18", "1240776", "Extreme Cold/Wind Chill", null, null, null],
  ["2025-02-20", "1240893", "Cold/Wind Chill", null, null, null],
  ["2025-03-14", "1243274", "Wildfire", null, null, null],
  ["2025-03-14", "1244049", "Wildfire", null, null, null],
  ["2025-03-14", "1249654", "High Wind", "57.00", "MG", null],
  ["2025-03-14", "1249656", "High Wind", "60.00", "MG", null],
  ["2025-03-14", "1249658", "High Wind", "51.00", "MG", null],
  ["2025-04-02", "1254298", "Thunderstorm Wind", "52.00", "MG", null],
  ["2025-04-18", "1254538", "Hail", "0.75", null, null],
  ["2025-05-19", "1260025", "Hail", "1.75", null, null],
  ["2025-05-19", "1260399", "Hail", "0.75", null, null],
  ["2025-05-22", "1260430", "Hail", "1.75", null, null],
  ["2025-05-22", "1260432", "Hail", "0.75", null, null],
  ["2025-05-22", "1260434", "Hail", "1.00", null, null],
  ["2025-05-22", "1260454", "Hail", "1.75", null, null],
  ["2025-05-24", "1260870", "Hail", "1.25", null, null],
  ["2025-05-24", "1260884", "Thunderstorm Wind", "50.00", "MG", null],
  ["2025-05-24", "1260885", "Thunderstorm Wind", "56.00", "MG", null],
  ["2025-06-07", "1270529", "Thunderstorm Wind", "56.00", "MG", null],
  ["2025-06-17", "1270848", "Thunderstorm Wind", "57.00", "MG", null],
  ["2025-06-17", "1271256", "Hail", "1.00", null, null],
  ["2025-06-17", "1271257", "Thunderstorm Wind", "52.00", "EG", null],
  ["2025-06-17", "1271258", "Thunderstorm Wind", "56.00", "MG", null],
  ["2025-06-17", "1271280", "Thunderstorm Wind", "66.00", "MG", null],
  ["2025-07-18", "1281648", "Heat", null, null, null],
  ["2025-07-19", "1281841", "Heat", null, null, null],
  ["2025-07-20", "1281881", "Heat", null, null, null],
  ["2025-07-21", "1281938", "Excessive Heat", null, null, null],
  ["2025-07-24", "1281985", "Heat", null, null, null],
  ["2025-07-26", "1282062", "Heat", null, null, null],
  ["2025-07-27", "1282099", "Heat", null, null, null],
  ["2025-07-28", "1282131", "Heat", null, null, null],
  ["2025-07-29", "1282157", "Heat", null, null, null],
  ["2025-07-30", "1282195", "Heat", null, null, null],
  ["2025-08-07", "1286413", "Heat", null, null, null],
  ["2025-08-08", "1286526", "Heat", null, null, null],
  ["2025-08-09", "1286559", "Heat", null, null, null],
  ["2025-08-10", "1286591", "Heat", null, null, null],
  ["2025-08-15", "1286693", "Excessive Heat", null, null, null],
  ["2025-08-16", "1286706", "Heat", null, null, null],
  ["2025-08-17", "1286752", "Heat", null, null, null],
  ["2025-08-18", "1286809", "Heat", null, null, null],
  ["2025-08-19", "1286852", "Heat", null, null, null],
  ["2025-10-14", "1297276", "Drought", null, null, null],
  ["2025-11-19", "1297331", "Hail", "1.75", null, null],
  ["2025-11-19", "1297332", "Hail", "1.50", null, null],
  ["2025-11-19", "1297333", "Hail", "1.50", null, null],
  ["2025-11-19", "1297337", "Hail", "3.50", null, null],
  ["2026-01-08", "1303205", "Thunderstorm Wind", "52.00", "EG", null],
  ["2026-01-08", "1303210", "Thunderstorm Wind", "56.00", "EG", null],
  ["2026-01-23", "1312598", "Winter Storm", null, null, null],
  ["2026-03-01", "1314687", "Hail", "0.75", null, null],
  ["2026-03-24", "1325643", "Drought", null, null, null],
  ["2026-04-01", "1334627", "Drought", null, null, null],
  ["2026-04-15", "1333996", "Hail", "1.25", null, null],
  ["2026-04-17", "1334560", "Thunderstorm Wind", "52.00", "EG", null],
  ["2026-04-23", "1329608", "Hail", "1.00", null, null],
  ["2026-05-01", "1342494", "Drought", null, null, null],
  ["2026-05-08", "1336271", "Hail", "1.75", null, null],
  ["2026-05-08", "1336273", "Hail", "1.00", null, null]
 ];

/**
 * 고정 Payne County NOAA 폭풍 날짜 목록을 검사한다. 주 전체를 Payne으로 바꾸지 않는다.
 * @param value 091-STM-Z 런 JSON.
 * @returns 검증된 폭풍 목록 또는 오류 상태.
 */
export function readCushingStorm(value: unknown): CushingStormSeries | null {
  const v = value as { runId?: unknown; geography?: unknown; rows?: CushingStormEvent[] };
  if (!v || v.runId !== RUN_ID || v.geography !== GEOGRAPHY) return null;
  if (!Array.isArray(v.rows) || v.rows.length !== EXPECTED.length) return null;
  for (let i = 0; i < EXPECTED.length; i++) {
    const row = v.rows[i] as CushingStormEvent;
    const [beginDate, eventId, eventType, magnitude, magnitudeType, torFScale] = EXPECTED[i];
    if (!row || row.beginDate !== beginDate || row.eventId !== eventId) return null;
    if (row.eventType !== eventType || row.magnitude !== magnitude) return null;
    if (row.magnitudeType !== magnitudeType || row.torFScale !== torFScale) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.beginDate)) return null;
    if (typeof row.beginDateTime !== "string" || row.beginDateTime.length === 0) return null;
    if (typeof row.episodeId !== "string" || row.episodeId.length === 0) return null;
    if (typeof row.source !== "string" || row.source.length === 0) return null;
    if (typeof row.wfo !== "string" || row.wfo.length === 0) return null;
    for (const n of [row.injuriesDirect, row.injuriesIndirect, row.deathsDirect, row.deathsIndirect]) {
      if (!Number.isInteger(n) || n < 0) return null;
    }
    for (const d of [row.damageProperty, row.damageCrops]) {
      if (typeof d !== "string" || !/^[0-9.]*[KMB]?$/.test(d)) return null;
    }
    if (i > 0) {
      const prev = v.rows[i - 1] as CushingStormEvent;
      if (prev.beginDate > row.beginDate) return null;
      if (prev.beginDate === row.beginDate && prev.eventId >= row.eventId) return null;
    }
  }
  return v as CushingStormSeries;
}

/**
 * 지정 날짜의 Payne County 폭풍을 꺼낸다. 하루에 여러 건이 있을 수 있다.
 * @param series 검증된 NOAA Payne County 폭풍 목록.
 * @param beginDate 날짜 (예: 2025-05-24).
 * @returns 해당 날짜 행 목록 또는 없으면 빈 배열.
 */
export function stormEventsOn(series: CushingStormSeries | null, beginDate: string): CushingStormEvent[] {
  if (!series || series.runId !== RUN_ID) return [];
  return series.rows.filter((r) => r.beginDate === beginDate);
}
