import { data, Link } from "react-router";
import type { Route } from "./+types/cushing-busy";
import { DeskHeader, DeskFooter } from "~/components/desk-chrome";
import board from "./cushing-busy-board.json";

type LaneRow = {
  id: string;
  name?: string;
  status?: string;
  last_observation?: string | null;
  note?: string;
  reason?: string;
};

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
  return { board, checkedAt: new Date().toISOString() };
}

export function action({}: Route.ActionArgs) {
  return data({ ok: false, message: "관측 화면은 읽기 전용입니다." }, { status: 405 });
}

export default function CushingBusy({ loaderData }: Route.ComponentProps) {
  const { board: view, checkedAt } = loaderData;
  const activity = (view.lanes.activity_forward ?? []) as LaneRow[];
  const context = (view.lanes.physical_context ?? []) as LaneRow[];
  const excluded = (view.lanes.excluded ?? []) as LaneRow[];
  return (
    <>
      <DeskHeader source="091 CFAM / cushing-busy" ticker="Cushing, OK" contextLabel="현장 활동 보드 · 점수 없음" />
      <main id="main-content" tabIndex={-1} className="desk-shell">
        <Link className="secondary-link mt-7 inline-flex min-h-11 items-center" to="/">
          ← 관측 데스크
        </Link>
        <section className="mt-8 max-w-3xl">
          <p className="text-sm text-muted-foreground">as of {view.as_of_utc} · checked {checkedAt}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{view.question}</h1>
          <p className="mt-4 text-lg">
            {view.verdict}
            <span className="block text-base font-normal text-muted-foreground">{view.verdict_note}</span>
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-medium">전향 활동 관측</h2>
          <ul className="mt-4 space-y-4">
            {activity.map((row) => (
              <li key={row.id} className="border-t border-border pt-4">
                <p className="font-medium">
                  {row.id} · {row.name}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{row.status}</span>
                </p>
                <p className="mt-1 text-sm">{row.last_observation ?? "아직 날짜 있는 행 없음"}</p>
                {"venues" in row && Array.isArray((row as {venues?: string[]}).venues) ? (
                  <p className="mt-1 text-sm">{((row as {venues?: string[]}).venues ?? []).join(" · ")}</p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-medium">물리 문맥 — 바쁨이 아님</h2>
          <ul className="mt-4 space-y-4">
            {context.map((row) => (
              <li key={row.id} className="border-t border-border pt-4">
                <p className="font-medium">
                  {row.id} · {row.name}
                </p>
                <p className="mt-1 text-sm">{row.last_observation}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-10 mb-16">
          <h2 className="text-xl font-medium">이 대시에서 뺀 것</h2>
          <ul className="mt-4 space-y-3">
            {excluded.map((row) => (
              <li key={row.id} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{row.id}</span> — {row.reason}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <DeskFooter />
    </>
  );
}
