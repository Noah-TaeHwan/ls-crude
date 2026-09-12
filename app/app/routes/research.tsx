import { data, redirect } from "react-router";
import { legacyCandidateRedirect, legacySampleRedirect, unsupportedSampleNotice } from "~/lib/cai-legacy-routing";

import type { Route } from "./+types/research";
import { ResearchRecord } from "~/components/research-record";
import { readResearchRecord } from "~/lib/research-record.server";
import type { ActionResult } from "~/lib/types";

/** @returns 통합 연구 기록의 검색 설명. */
export function meta({}: Route.MetaArgs) {
  return [{ title: "LS CRUDE — 연구 기록", name: "description", content: "연구는 이렇게 진행하고 있습니다. 여섯 단계의 결과와 이전 조사·보관 기록을 한 페이지에서 봅니다." }];
}

/**
 * 정본 연구 기록과 연결된 후보를 읽는다. 구 sample·candidate 주소는
 * 통합 연구 기록을 그리는 /history로 보내 query를 보존한다.
 * @param args 현재 URL.
 * @returns 연구 기록과 최초 검색어.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const sample = params.get("sample");
  const sampleTarget = legacySampleRedirect(url.pathname, params);
  if (sampleTarget) return redirect(sampleTarget, 308);
  const record = await readResearchRecord();
  const candidate = params.get("candidate");
  // 보관 기록 검색이 통합 화면으로 옮겨졌으므로 알려진 후보 ID는 history 원장으로 보낸다.
  const currentIds = record.ledger.records.map((item) => item.id);
  const oldTarget = legacyCandidateRedirect(candidate, currentIds, record.intake.records.map((item) => item.fields.candidate_id));
  if (oldTarget) return redirect(oldTarget, 308);
  if (candidate !== null && candidate.length > 0 && currentIds.includes(candidate)) {
    return redirect(`/history?candidate=${encodeURIComponent(candidate)}#ledger`, 308);
  }
  const unsupportedCandidate = candidate !== null && candidate.length > 0
    ? "이 후보 ID는 공개 원장에서 찾지 못했습니다. 보관 기록에서 검색해 보세요."
    : null;
  return { ...record, initialQuery: "", unsupportedSample: unsupportedSampleNotice(sample), unsupportedCandidate };
}

/** @returns 공개 연구 화면의 읽기 전용 응답. */
export function action({}: Route.ActionArgs) {
  return data({ ok: false, message: "공개 연구 장부는 읽기 전용입니다." } satisfies ActionResult, { status: 405 });
}

/**
 * 여섯 단계 결과와 이전 조사 기록을 한 화면으로 보여준다.
 * @param props 통합 연구 기록 데이터.
 * @returns 연구 기록 화면.
 */
export default function Research({ loaderData }: Route.ComponentProps) {
  return <ResearchRecord {...loaderData} />;
}
