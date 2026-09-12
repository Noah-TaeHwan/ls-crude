import { useEffect } from "react";
import { data, Link, useRevalidator } from "react-router";
import type { Route } from "./+types/tankers";
import { DeskHeader, DeskFooter } from "~/components/desk-chrome";
import { TankerObservation } from "~/components/tanker-observation";
import { readTankerArrivals } from "~/lib/tanker-arrivals.server";

/** @returns 월간 탱커 관측 화면의 검색 설명. */
export function meta({}: Route.MetaArgs) { return [{ title: "탱커는 얼마나 드나들까? — LS CRUDE" }, { name: "description", content: "싱가포르 석유 탱커 월별 입항 건수와 유형별 공식 총계 대사. 자료 기준 월·잠정치·갱신 상태를 확인합니다." }]; }
/** @returns 검증된 두 원천의 월간 관측과 화면 확인시각. */
export async function loader({}: Route.LoaderArgs) { return { tankers: await readTankerArrivals(), checkedAt: new Date().toISOString() }; }
/** @returns 읽기 전용 화면의 응답. */
export function action({}: Route.ActionArgs) { return data({ ok: false, message: "관측 화면은 읽기 전용입니다." }, { status: 405 }); }
/**
 * 월별 자료를 주기와 원 단위에 맞게 보여준다.
 * @param props 라우트 데이터.
 * @returns 탱커 관측 상세 화면.
 */
export default function Tankers({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();
  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === "visible" && revalidator.state === "idle") void revalidator.revalidate(); }, 5 * 60000);
    return () => window.clearInterval(timer);
  }, [revalidator]);
  return <><DeskHeader source="MPA / data.gov.sg" ticker="Singapore" contextLabel="MPA · 월간 입항" /><main id="main-content" tabIndex={-1} className="desk-shell"><Link className="secondary-link mt-7 inline-flex min-h-11 items-center" to="/history?sample=tankers#research-sample">← 연구 기록</Link><TankerObservation view={loaderData.tankers} checkedAt={loaderData.checkedAt} detail /></main><DeskFooter /></>;
}
