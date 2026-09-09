import { data, redirect } from "react-router";
import type { Route } from "./+types/empties";

/** @returns 기존 주소의 검색 설명. */
export function meta({}: Route.MetaArgs) { return [{ title: "LA항 빈 컨테이너 연구 사례 — LS CRUDE" }]; }
/** @returns 기존 공유 주소를 과거 연구 사례의 정식 위치로 연결한다. */
export function loader({}: Route.LoaderArgs) { return redirect("/?sample=empties#research-sample", 308); }
/** @returns 읽기 전용 주소는 쓰기를 허용하지 않는다. */
export function action({}: Route.ActionArgs) { return data({ ok: false }, { status: 405 }); }
