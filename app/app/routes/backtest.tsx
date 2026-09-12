import { data, isRouteErrorResponse, Link, redirect } from "react-router";

import type { Route } from "./+types/backtest";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import type { ActionResult } from "~/lib/types";

/** 더는 공개 기능이 아닌 이전 백테스트 주소의 검색 결과 설명. */
export function meta({}: Route.MetaArgs) {
  return [{ title: "LS CRUDE — 연구 기록으로 이동" }];
}

/**
 * 이전 백테스트 주소를 연구 장부로 영구 이동한다.
 * @returns 308 영구 이동 응답.
 */
export function loader({}: Route.LoaderArgs) {
  return redirect("/research", 308);
}

/**
 * 실행 엔진이 없는 이전 주소의 쓰기 요청을 거절한다.
 * @returns 백테스트 미제공 오류 응답.
 */
export function action({}: Route.ActionArgs) {
  throw data(
    {
      ok: false,
      message: "이 웹사이트에서는 백테스트를 실행할 수 없습니다. 현재 검증 기록은 연구 기록에서 확인해 주세요.",
    } satisfies ActionResult,
    { status: 400 },
  );
}

/**
 * GET은 loader에서 이동하고 POST는 action에서 거절한다.
 * @returns 렌더링할 화면 없음.
 */
export default function Backtest() {
  return null;
}

/**
 * 이전 백테스트 주소의 거절 사유를 사람에게 읽을 수 있게 보여준다.
 * @param props React Router가 전달한 오류.
 * @returns 상태 코드 400을 유지하는 안내 화면.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message =
    isRouteErrorResponse(error) &&
    error.data != null &&
    typeof error.data === "object" &&
    "message" in error.data
      ? String(error.data.message)
      : "이 웹사이트에서는 백테스트를 실행할 수 없습니다.";

  return (
    <>
      <DeskHeader source="연구 장부" ticker="CL=F" />
      <main id="main-content" tabIndex={-1} className="mx-auto min-h-[70vh] max-w-3xl px-5 py-14 sm:px-8">
        <h1 className="text-3xl font-semibold text-foreground">백테스트는 로컬에서 진행합니다.</h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground">{message}</p>
        <Link className="text-link mt-6 inline-block" to="/research">
          연구 장부 보기
        </Link>
      </main>
      <DeskFooter />
    </>
  );
}
