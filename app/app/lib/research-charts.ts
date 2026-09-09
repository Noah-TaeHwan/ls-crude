/** 수박 보고의 실제 날짜별 분자·분모. */
export interface WatermelonPoint { date: string; numerator: number; denominator: number; fractional: number }
/** 제주 원단위 표시값. 소수 문자열은 원래 정밀도를 보존한다. */
export interface JejuPoint { date: string; lngMwh: string; oilMwh: string; sharePct: string }
/** 월 합계와 서로 다른 정의의 전년차. 첫해 자체 차분은 결측이다. */
export interface DegreePoint { month: string; hdd:number; cdd:number; hddYoy:number|null; cddYoy:number|null; providerHDDYoy:number|null; providerCDDYoy:number|null }
/** 미국 4사 주간 originated 차종. 결측을 0으로 바꾸지 않는다. */
export interface RailPoint { date: string; bnsf: number; up: number; csx: number; ns: number }
/** 접수 카드에서 해당 연구 사례로 이동하는 고정 연결. */
export const SAMPLE_LINKS: Record<string, string> = { "ALT-20260908-16":"/?sample=visibility#research-sample", "ALT-20260907-26":"/?sample=tankers#research-sample", "ALT-20260907-02":"/?sample=empties#research-sample", "ALT-20260907-36": "/?sample=watermelon#research-sample", "ALT-20260908-20": "/?sample=jeju#research-sample", "ALT-20260907-45":"/?sample=degree-days#research-sample", "ALT-20260907-43":"/?sample=petroleum-rail#research-sample", "091-CFAM":"/?sample=cushing-busy#research-sample" };

/** @param args 현재·다음 URL과 라우터 기본 판단. @returns 사례 선택만 바뀌면 시장 재조회 없이 전환하며 수동·주기 갱신은 유지한다. */
export function sampleShouldRevalidate({currentUrl,nextUrl,defaultShouldRevalidate,formMethod}:{currentUrl:URL;nextUrl:URL;defaultShouldRevalidate:boolean;formMethod?:string}): boolean {
  if (formMethod || currentUrl.pathname !== nextUrl.pathname || currentUrl.searchParams.get("sample") === nextUrl.searchParams.get("sample")) return defaultShouldRevalidate;
  const before = new URL(currentUrl), after = new URL(nextUrl);
  before.searchParams.delete("sample"); after.searchParams.delete("sample");
  before.searchParams.sort(); after.searchParams.sort();
  return before.search === after.search ? false : defaultShouldRevalidate;
}

/** @param value 날짜 값. @returns UTC 달력 날짜가 유효한지 여부. */
function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+"T00:00:00Z")) && new Date(value+"T00:00:00Z").toISOString().slice(0,10) === value;
}
/** @param rows 날짜 배열. @returns 중복 없이 시간순인지 여부. */
function ordered(rows: {date:string}[]): boolean { return rows.every((r,i) => validDate(r.date) && (!i || rows[i-1].date < r.date)); }

/** @param value 표시용 원본. @returns 검증된 수박 관측 또는 오류 상태. */
export function readWatermelon(value: unknown): WatermelonPoint[] | null {
  const v = value as {candidateId?:unknown;runId?:unknown;points?:WatermelonPoint[]};
  if (!v || v.candidateId !== "ALT-20260907-36" || v.runId !== "20260908T065043Z" || !Array.isArray(v.points) || v.points.length !== 409) return null;
  if (!v.points.every(r => r && Number.isSafeInteger(r.denominator) && r.denominator > 0 && Number.isSafeInteger(r.numerator) && r.numerator >= 0 && r.numerator <= r.denominator && Number.isSafeInteger(r.fractional) && r.fractional >= 0 && r.fractional <= r.denominator) || !ordered(v.points)) return null;
  if (v.points[0].date !== "2000-05-09" || v.points.at(-1)!.date !== "2025-10-14" || v.points.filter(r=>r.date >= "2022-01-01").length !== 50) return null;
  return v.points;
}
/** @param value 표시용 원본. @returns 검증된 제주 관측 또는 오류 상태. */
export function readJeju(value: unknown): JejuPoint[] | null {
  const v = value as {candidateId?:unknown;runId?:unknown;points?:JejuPoint[]};
  if (!v || v.candidateId !== "ALT-20260908-20" || v.runId !== "20260908T073402Z" || !Array.isArray(v.points) || v.points.length !== 336) return null;
  if (!v.points.every(r => {
    if (!r || ![r.lngMwh,r.oilMwh,r.sharePct].every(n => typeof n === "string" && /^\d+(?:\.\d+)?$/.test(n) && Number.isFinite(Number(n)))) return false;
    const gas = Number(r.lngMwh), oil = Number(r.oilMwh);
    return gas+oil > 0 && Math.abs(Number(r.sharePct)-100*oil/(gas+oil)) < 1e-9;
  }) || !ordered(v.points)) return null;
  if (v.points[0].date !== "2023-05-01" || v.points.at(-1)!.date !== "2024-03-31") return null;
  return v.points;
}
/** @param value 고정 표시 원본. @returns 월 순서·합계·자체 차분을 검사한 관측 또는 오류 상태. */
export function readDegreeDays(value:unknown): DegreePoint[]|null {
  const v=value as {candidateId?:unknown;runId?:unknown;revision?:unknown;points?:DegreePoint[]};
  if (!v || v.candidateId!=="ALT-20260907-45" || v.runId!=="20260908T120546Z" || v.revision!=="v2" || !Array.isArray(v.points) || v.points.length!==108) return null;
  const rows=v.points;
  if (!rows.every((r,i)=>r && r.month===`${2015+Math.floor(i/12)}-${String(i%12+1).padStart(2,"0")}` && [r.hdd,r.cdd].every(n=>Number.isSafeInteger(n)&&n>=0) && [r.providerHDDYoy,r.providerCDDYoy].every(n=>n===null||Number.isSafeInteger(n)))) return null;
  if (!rows.every((r,i)=>i<12 ? r.hddYoy===null&&r.cddYoy===null : r.hddYoy===r.hdd-rows[i-12].hdd && r.cddYoy===r.cdd-rows[i-12].cdd)) return null;
  if (rows.reduce((n,r)=>n+r.hdd,0)!==36249 || rows.reduce((n,r)=>n+r.cdd,0)!==12720) return null;
  const mismatches=rows.slice(12).reduce((n,r)=>n+Number(r.providerHDDYoy!==null&&r.hddYoy!==r.providerHDDYoy)+Number(r.providerCDDYoy!==null&&r.cddYoy!==r.providerCDDYoy),0);
  return mismatches===20 ? rows : null;
}
/** @param value 고정 표시 원본. @returns 미국 4사 주간 차종 또는 오류 상태. */
export function readPetroleumRail(value: unknown): RailPoint[] | null {
  const v = value as {candidateId?:unknown;runId?:unknown;points?:RailPoint[]};
  if (!v || v.candidateId !== "ALT-20260907-43" || v.runId !== "20260909T003038Z" || !Array.isArray(v.points) || v.points.length !== 493) return null;
  if (!v.points.every(r => r && ["bnsf","up","csx","ns"].every(k => Number.isSafeInteger(r[k as keyof RailPoint]) && (r[k as keyof RailPoint] as number) > 0)) || !ordered(v.points)) return null;
  if (v.points[0].date !== "2017-03-29" || v.points.at(-1)!.date !== "2026-09-02") return null;
  if (!v.points.every(r => new Date(r.date+"T00:00:00Z").getUTCDay() === 3)) return null;
  if (v.points.reduce((n,r)=>n+r.bnsf,0) !== 2381801 || v.points.reduce((n,r)=>n+r.up,0) !== 1434967 || v.points.reduce((n,r)=>n+r.csx,0) !== 665175 || v.points.reduce((n,r)=>n+r.ns,0) !== 440741) return null;
  return v.points;
}
/**
 * 실제 관측 날짜 중 포인터에 가장 가까운 것을 찾는다. 달력 공백에 값을 만들지 않는다.
 * @param dates 정렬된 실제 날짜.
 * @param fraction 그래프 안의 상대 위치.
 * @param start 표시 시작 날짜.
 * @param end 표시 종료 날짜.
 * @returns 가장 가까운 실제 관측 인덱스. 동률은 앞 날짜.
 */
export function nearestDateIndex(dates: string[], fraction: number, start: string, end: string): number {
  if (!dates.length) return -1;
  const at = Date.parse(start) + Math.max(0,Math.min(1,fraction))*(Date.parse(end)-Date.parse(start));
  let best = 0;
  for (let i=1;i<dates.length;i++) if (Math.abs(Date.parse(dates[i])-at) < Math.abs(Date.parse(dates[best])-at)) best=i;
  return best;
}
