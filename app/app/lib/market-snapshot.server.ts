import marketSnapshotJson from "../../public/wti-market-snapshot.json";

import { isWtiMarketSnapshot, type WtiMarketView } from "~/lib/types";

/** 한 시간의 밀리초. */
const HOUR_MS = 60 * 60 * 1_000;
/** 하루의 밀리초. */
const DAY_MS = 24 * HOUR_MS;

/**
 * ISO 시각 또는 날짜를 밀리초로 읽는다.
 * @param value ISO 문자열.
 * @param dateOnly 날짜만 들어오는지 여부.
 * @returns 유효한 시각이면 밀리초, 아니면 null.
 */
function parseTime(value: string, dateOnly = false): number | null {
  const time = Date.parse(dateOnly ? `${value}T00:00:00Z` : value);
  return Number.isFinite(time) ? time : null;
}

/**
 * 번들에 포함된 WTI 관측치와 현재 시각 기준 신선도를 반환한다.
 * @param now 신선도를 계산할 현재 시각.
 * @returns 스냅샷과 fresh, stale 또는 unavailable 판정.
 */
export function readWtiMarketSnapshot(now = new Date()): WtiMarketView {
  const raw: unknown = marketSnapshotJson;
  if (!isWtiMarketSnapshot(raw)) {
    return {
      snapshot: null,
      freshness: "unavailable",
      freshnessReasons: ["시장 스냅샷 형식이 올바르지 않습니다."],
    };
  }

  const checkedAt = parseTime(raw.checkedAt);
  const asOf = parseTime(raw.asOf, true);
  if (checkedAt == null || asOf == null) {
    return {
      snapshot: null,
      freshness: "unavailable",
      freshnessReasons: ["시장 스냅샷 날짜를 읽지 못했습니다."],
    };
  }

  const reasons: string[] = [];
  const nowTime = now.getTime();
  if (nowTime - checkedAt > raw.freshnessPolicy.maxCheckAgeHours * HOUR_MS) {
    reasons.push(`마지막 확인 후 ${raw.freshnessPolicy.maxCheckAgeHours}시간이 지났습니다.`);
  }
  if (nowTime - asOf > raw.freshnessPolicy.maxBarAgeDays * DAY_MS) {
    reasons.push(`마지막 일봉 후 ${raw.freshnessPolicy.maxBarAgeDays}일이 지났습니다.`);
  }

  return {
    snapshot: raw,
    freshness: reasons.length === 0 ? "fresh" : "stale",
    freshnessReasons: reasons,
  };
}
