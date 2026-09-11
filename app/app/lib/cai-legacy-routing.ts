import { SAMPLE_LINKS } from "./research-charts.ts";

/**
 * 현재 SAMPLE_LINKS 값에서 지원 sample 종류를 파생한다.
 * 값을 하드코딩하지 않으므로 지원 sample이 늘면 함께 늘어난다.
 */
const SAMPLE_KINDS = Object.values(SAMPLE_LINKS)
  .map((href) => new URL(href, "https://ls-crude.local").searchParams.get("sample"))
  .filter((value): value is string => value !== null && value.length > 0);

/** URL_COMPAT 계약이 지원하는 sample 값 목록(중복 제거). */
export const SUPPORTED_SAMPLES: readonly string[] = [...new Set(SAMPLE_KINDS)];

/**
 * 정적 research/ 디렉터리 때문에 붙을 수 있는 끝 슬래시를 정규화한다.
 * @param pathname 현재 경로.
 * @returns 비교용 경로.
 */
function normalizedPath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * 지원 sample이면 root·research 진입을 history 주소로 바꾼다.
 * 미지원·빈 값과 다른 경로는 redirect하지 않는다.
 * @param pathname 현재 경로.
 * @param search 현재 query.
 * @returns history 주소 또는 이동이 필요 없으면 null.
 */
export function legacySampleRedirect(pathname: string, search: URLSearchParams): string | null {
  const path = normalizedPath(pathname);
  if (path !== "/" && path !== "/research") return null;
  const sample = search.get("sample");
  if (sample === null || !SUPPORTED_SAMPLES.includes(sample)) return null;
  const next = new URLSearchParams(search);
  next.set("sample", sample);
  return `/history?${next.toString()}#research-sample`;
}

/**
 * hash만 있는 구주소를 history로 보낸다. fragment는 서버에 오지 않으므로
 * 클라이언트에서 replace로 처리할 때 쓴다.
 * @param pathname 현재 경로.
 * @param hash 현재 fragment.
 * @returns 이동할 주소 또는 이동이 필요 없으면 null.
 */
export function legacyHashRedirect(pathname: string, hash: string): string | null {
  const path = normalizedPath(pathname);
  if (path === "/" && hash === "#research-sample") return "/history#research-sample";
  if (path === "/research" && (hash === "#ledger" || hash === "#history")) return `/history${hash}`;
  return null;
}

/**
 * research?candidate=의 옛 ID 목적지를 결정한다. 여기서는 옛 후보 원장에만
 * 있는 ID를 history로 보낸다. 현행/미지원 분류는 호출측 정책이 정한다.
 * @param candidate query의 candidate 값.
 * @param currentIds 현행 공개 manifest ID 목록.
 * @param oldIds 옛 후보 원장에만 있는 ID 목록.
 * @returns history 주소 또는 현행 유지면 null.
 */
export function legacyCandidateRedirect(
  candidate: string | null,
  currentIds: readonly string[],
  oldIds: readonly string[],
): string | null {
  if (candidate === null || candidate.length === 0) return null;
  if (currentIds.includes(candidate)) return null;
  if (oldIds.includes(candidate)) return `/history?candidate=${encodeURIComponent(candidate)}#ledger`;
  return null;
}

/**
 * 지원하지 않는 sample 값의 안내 문구를 만든다. 값을 그대로 되비추지 않는다.
 * @param sample query의 sample 값.
 * @returns 안내 문구 또는 없으면 null.
 */
export function unsupportedSampleNotice(sample: string | null): string | null {
  if (sample === null || sample.length === 0 || SUPPORTED_SAMPLES.includes(sample)) return null;
  return "지원하지 않는 사례 값입니다.";
}
