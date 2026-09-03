import { data } from "react-router";

import type { Route } from "./+types/backtest";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { HubCard } from "~/components/hub-card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  LOCAL_BACKTEST_NO_RUN,
  LOCAL_BACKTEST_STEPS,
  LOOKAHEAD_GUARD,
} from "~/lib/local-backtest-guide";
import { readClfPriceSeedMeta } from "~/lib/price-seed.server";
import type { ActionResult } from "~/lib/types";

/** @param message 웹에서 돌리려 할 때 보여줄 문장 */
function fail(message: string) {
  return data({ ok: false, message } satisfies ActionResult, { status: 400 });
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — 로컬 분석 준비 · 백테스트 인계" },
    {
      name: "description",
      content:
        "실행 가능한 백테스트 진입점은 아직 없습니다. Cursor에서 로컬 분석을 준비하고 구현 담당자에게 인계합니다.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const seed = await readClfPriceSeedMeta();
  return { seed };
}

export async function action({}: Route.ActionArgs) {
  return fail(LOCAL_BACKTEST_NO_RUN);
}

export default function Backtest({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { seed } = loaderData;
  const seedRange = seed.lastDate
    ? `${seed.firstDate} ~ ${seed.lastDate}`
    : `${seed.firstDate} ~`;

  return (
    <main className="min-h-screen">
      <DeskHeader source="guide" ticker={seed.ticker} />

      <div className="mx-auto max-w-[1180px] space-y-3 px-3 py-3 sm:px-4">
        {actionData?.message ? (
          <Alert variant={actionData.ok ? "default" : "destructive"}>
            <AlertDescription>{actionData.message}</AlertDescription>
          </Alert>
        ) : null}

        <section className="border border-border bg-card/30 px-4 py-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            로컬 분석 준비 · 백테스트 인계
          </p>
          <h1 className="mt-2 font-mono text-2xl text-heading">
            환경과 입력 규칙부터 준비합니다
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            이 사이트와 저장소에는 실행 가능한 백테스트 진입점이 아직 없습니다.
            환경과 입력 규칙을 확인해 구현 담당자에게 인계합니다. 같은 순서는{" "}
            <code className="font-mono text-xs">docs/local-backtest.md</code>
            에도 있습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{LOOKAHEAD_GUARD}</p>
        </section>

        <HubCard
          kicker="시드"
          title={seed.loaded ? "적재됨" : "없음"}
          badge={seed.ticker}
        >
          <p className="font-mono text-xs text-muted-foreground">{seedRange}</p>
          <p className="text-xs text-muted-foreground">
            {seed.relativePath}. 인샘플 {seed.inSampleStart}–
            {seed.inSampleEnd}. 아웃샘플 {seed.outSampleStart}~.
          </p>
        </HubCard>

        <ol className="space-y-3">
          {LOCAL_BACKTEST_STEPS.map((step, index) => (
            <li key={step.title}>
              <HubCard kicker={`${index + 1}`} title={step.title}>
                <p className="text-sm text-muted-foreground">{step.body}</p>
                {step.command ? (
                  <pre className="overflow-x-auto border border-border bg-background px-3 py-2 font-mono text-xs whitespace-pre-wrap">
                    {step.command}
                  </pre>
                ) : null}
              </HubCard>
            </li>
          ))}
        </ol>

        <HubCard kicker="아웃샘플" title="잠김" dashed>
          <p className="text-sm text-muted-foreground">
            후보를 고르기 전에 2024 이후를 보지 않습니다. 연 뒤에는 다시 고치지
            않습니다.
          </p>
        </HubCard>
      </div>

      <DeskFooter />
    </main>
  );
}
