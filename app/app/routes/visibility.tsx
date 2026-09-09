import { useEffect } from "react";
import { data, Link, useRevalidator } from "react-router";
import type { Route } from "./+types/visibility";
import { DeskHeader, DeskFooter } from "~/components/desk-chrome";
import { VisibilityObservation } from "~/components/visibility-observation";
import { readVisibility } from "~/lib/visibility.server";

/** @returns 시정 관측 페이지의 검색 설명. */
export function meta({}: Route.MetaArgs) { return [{ title: "항로 앞이 잘 보일까? — LS CRUDE" }, { name: "description", content: "갤버스턴 KGLS 공항의 실제 시정 보고와 관측 한계. WTI 예측이나 항만 운영 상태를 뜻하지 않습니다." }]; }
/** @returns 검증된 실제 관측과 화면의 기준 시각. */
export async function loader({}: Route.LoaderArgs) { return { visibility: await readVisibility(), checkedAt: new Date().toISOString() }; }
/** @returns 읽기 전용 화면의 응답. */
export function action({}: Route.ActionArgs) { return data({ ok: false, message: "관측 화면은 읽기 전용입니다." }, { status: 405 }); }
/**
 * 원 관측과 해석 범위를 자세히 보여준다.
 * @param props 라우트 관측 데이터.
 * @returns 시정 상세 화면.
 */
export default function Visibility({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();
  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === "visible" && revalidator.state === "idle") void revalidator.revalidate(); }, 5 * 60000);
    return () => window.clearInterval(timer);
  }, [revalidator]);
  return <><DeskHeader source="NOAA/NWS AWC" ticker="KGLS" contextLabel="KGLS · 시정 관측" /><main id="main-content" tabIndex={-1} className="desk-shell"><Link className="secondary-link mt-7 inline-flex min-h-11 items-center" to="/?sample=visibility#research-sample">← 관측 데스크</Link><VisibilityObservation view={loaderData.visibility} checkedAt={loaderData.checkedAt} detail /></main><DeskFooter /></>;
}
