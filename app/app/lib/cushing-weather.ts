/** 검증된 KCUH METAR 한 건. 활동량이 아니다. */
export interface CushingWeatherSnapshot {
  observedAt: string;
  receivedAt: string;
  reportAt: string;
  temperatureC: number | null;
  windKt: number | null;
  visib: string;
  cover: string;
  rawOb: string;
  fetchedAt: string;
}
/** 마지막 정상 관측과 이번 조회 오류를 분리한다. */
export interface CushingWeatherView { data: CushingWeatherSnapshot | null; error: string | null }

/**
 * 명시적인 시간대가 있는 ISO 시각만 받는다.
 * @param input AWC 수신·보고 시각.
 * @param now 조회 기준 밀리초.
 * @returns 정규화한 UTC 시각.
 */
function parseTime(input: unknown, now: number): string {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(input)) throw new Error("시각 형식 오류");
  if (new Date(`${input.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== input.slice(0, 10) || Number(input.slice(11, 13)) > 23) throw new Error("달력 시각 오류");
  const time = Date.parse(input);
  if (!Number.isFinite(time) || time <= 0 || time > now) throw new Error("미래 또는 잘못된 시각");
  return new Date(time).toISOString();
}

/**
 * 숫자 관측만 받는다. 없는 값은 null로 남긴다.
 * @param input AWC 온도 또는 풍속.
 * @returns 유한 숫자 또는 null.
 */
function optionalNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input !== "number" || !Number.isFinite(input)) throw new Error("숫자 관측 오류");
  return input;
}

/**
 * KCUH METAR 배열에서 가장 최근 한 건만 남긴다. 오류 행을 조용히 제외하지 않는다.
 * @param payload AWC JSON 배열.
 * @param now 조회 기준 시각.
 * @returns 검증된 최신 관측.
 */
export function parseCushingWeather(payload: unknown, now = new Date()): CushingWeatherSnapshot {
  const current = now.getTime();
  if (!Number.isFinite(current) || !Array.isArray(payload) || !payload.length || payload.length >= 400) throw new Error("AWC 관측 배열 오류");
  let latest: CushingWeatherSnapshot | null = null;
  for (const row of payload) {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("AWC 관측 행 오류");
    const record = row as Record<string, unknown>;
    if (record.icaoId !== "KCUH" || typeof record.obsTime !== "number" || !Number.isSafeInteger(record.obsTime) || record.obsTime <= 0 || record.obsTime * 1000 > current) throw new Error("AWC 관측소·관측 시각 오류");
    if (typeof record.visib !== "string" || !record.visib.trim() || typeof record.cover !== "string" || typeof record.rawOb !== "string" || !record.rawOb.includes("KCUH")) throw new Error("AWC 시정·운량 오류");
    const observedAt = new Date(record.obsTime * 1000).toISOString();
    const receivedAt = parseTime(record.receiptTime, current);
    const reportAt = parseTime(record.reportTime, current);
    if (Date.parse(receivedAt) < Date.parse(observedAt)) throw new Error("AWC 수신 시각 역행");
    const next = {
      observedAt,
      receivedAt,
      reportAt,
      temperatureC: optionalNumber(record.temp),
      windKt: optionalNumber(record.wspd),
      visib: record.visib.trim(),
      cover: record.cover,
      rawOb: record.rawOb,
      fetchedAt: now.toISOString(),
    };
    if (!latest || next.observedAt > latest.observedAt) latest = next;
  }
  if (!latest) throw new Error("AWC 최신 관측 없음");
  return latest;
}
