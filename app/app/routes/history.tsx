import { data } from "react-router";
export { sampleShouldRevalidate as shouldRevalidate } from "~/lib/research-charts";
import type { Route } from "./+types/history";
import { ResearchRecord } from "~/components/research-record";
import { readResearchRecord } from "~/lib/research-record.server";
import { unsupportedSampleNotice } from "~/lib/cai-legacy-routing";
import type { ActionResult } from "~/lib/types";

/** @returns 통합 연구 기록 고정 주소의 검색 설명. */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — 연구 기록 · 과거 기록" },
    {
      name: "description",
      content: "현재 자료·실험과 과거 기록을 한 페이지에서 엽니다. 보관 기록과 결정 타임라인은 접기와 검색으로 확인합니다.",
    },
  ];
}

/**
 * /research와 같은 통합 연구 기록 데이터를 읽는다.
 * 직접 진입·새로고침·뒤로가기를 위해 redirect하지 않고 200으로 그린다.
 * @param args 현재 URL.
 * @returns 통합 연구 기록 데이터와 최초 검색어.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const record = await readResearchRecord();
  return {
    ...record,
    initialQuery: params.get("candidate") ?? "",
    unsupportedSample: unsupportedSampleNotice(params.get("sample")),
    unsupportedCandidate: null,
  };
}

/** @returns 공개 연구 기록 화면의 읽기 전용 응답. */
export function action({}: Route.ActionArgs) {
  return data(
    { ok: false, message: "공개 연구 기록 화면은 읽기 전용입니다." } satisfies ActionResult,
    { status: 405 },
  );
}

/**
 * /history 고정 주소로 직접 들어와도 통합 연구 기록을 그린다.
 * 보관 기록(#ledger)과 결정 타임라인(#history), 사례(#research-sample)가 같은 페이지에 있다.
 * @param props 통합 연구 기록 데이터.
 * @returns 연구 기록 화면.
 */
export default function History({ loaderData }: Route.ComponentProps) {
  return <ResearchRecord {...loaderData} />;
}
