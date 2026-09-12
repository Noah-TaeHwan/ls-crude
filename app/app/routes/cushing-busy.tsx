import { useEffect } from "react";
import { data, Link, useRevalidator } from "react-router";
import type { Route } from "./+types/cushing-busy";
import { DeskHeader, DeskFooter } from "~/components/desk-chrome";
import { CushingObservation } from "~/components/cushing-observation";
import { readCushingWeather } from "~/lib/cushing-weather.server";
import board from "./cushing-busy-board.json";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "쿠싱이 지금 바쁜가 — LS CRUDE" },
    {
      name: "description",
      content: "쿠싱 현장 활동 보드. 합성 점수는 없고, 전향 관측과 재고 문맥만 나란히 둔다.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return { board, weather: await readCushingWeather() };
}

export function action({}: Route.ActionArgs) {
  return data({ ok: false, message: "관측 화면은 읽기 전용입니다." }, { status: 405 });
}

/**
 * 쿠싱 현장 관측 보드를 질문→판단 보류→흔적/없음/다음 확인 구조로 보여준다.
 * @param props 라우트 관측 데이터.
 * @returns 쿠싱 상세 화면.
 */
export default function CushingBusy({ loaderData }: Route.ComponentProps) {
  const { board: view, weather } = loaderData;
  const revalidator = useRevalidator();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") void revalidator.revalidate();
    }, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [revalidator]);
  return (
    <>
      <DeskHeader source="091 CFAM / cushing-busy" ticker="Cushing, OK" contextLabel="현장 활동 보드 · 점수 없음" />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <Link className="secondary-link mt-7 inline-flex min-h-11 items-center" to="/history?sample=cushing-busy#research-sample">
          ← 연구 기록
        </Link>
        <section className="mt-8 max-w-4xl" aria-labelledby="cushing-title">
          <CushingObservation board={view} weather={weather} detail />
        </section>
        <div className="mb-16" />
      </main>
      <DeskFooter />
    </>
  );
}
