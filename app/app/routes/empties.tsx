import { data, Link } from "react-router";
import type { Route } from "./+types/empties";
import { DeskHeader, DeskFooter } from "~/components/desk-chrome";
import { EmptiesObservation } from "~/components/empties-observation";
import { readEmptiesView } from "~/lib/empties.server";

/** @returns 월간 빈 컨테이너 관측 화면의 검색 설명. */
export function meta({}: Route.MetaArgs) { return [{ title: "빈 컨테이너는 얼마나 돌아갈까? — LS CRUDE" }, { name: "description", content: "LA항 수출 TEU 중 빈 컨테이너 비중의 월별 관측. 기준 월·분모·격리와 한계를 확인합니다." }]; }
/** @returns 동결 빈티지의 월별 관측. 런타임 조회가 없다. */
export function loader({}: Route.LoaderArgs) { return { empties: readEmptiesView() }; }
/** @returns 읽기 전용 화면의 응답. */
export function action({}: Route.ActionArgs) { return data({ ok: false, message: "관측 화면은 읽기 전용입니다." }, { status: 405 }); }
/**
 * 월별 자료를 주기와 원 단위에 맞게 보여준다.
 * @param props 라우트 데이터.
 * @returns 빈 컨테이너 관측 상세 화면.
 */
export default function Empties({ loaderData }: Route.ComponentProps) {
  return <><DeskHeader source="Port of Los Angeles" ticker="LA · 월간 컨테이너" /><main id="main-content" tabIndex={-1} className="desk-shell"><Link className="secondary-link mt-7 inline-flex min-h-11 items-center" to="/#observations">← 관측 데스크</Link><EmptiesObservation view={loaderData.empties} detail /></main><DeskFooter /></>;
}
