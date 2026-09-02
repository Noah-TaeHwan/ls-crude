import { Lock } from "lucide-react";
import { data, Form } from "react-router";

import type { Route } from "./+types/backtest";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { readClfPriceSeedMeta } from "~/lib/price-seed.server";
import type { ActionResult } from "~/lib/types";

const EMPTY = "—";
const NO_RULE_MESSAGE = "규칙이 없어 돌릴 수 없습니다.";

function fail(message: string) {
  return data({ ok: false, message } satisfies ActionResult, { status: 400 });
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — 백테스트" },
    {
      name: "description",
      content:
        "WTI 선물 CL=F 백테스트 자리입니다. 규칙은 아직 없고 성과 숫자는 비워 둡니다.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const seed = await readClfPriceSeedMeta();
  return { seed, history: [] as const };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  if (intent !== "run-in-sample") {
    return fail("알 수 없는 요청입니다.");
  }
  return { ok: false, message: NO_RULE_MESSAGE } satisfies ActionResult;
}

export default function Backtest({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { seed, history } = loaderData;
  const dateRange = seed.lastDate
    ? `${seed.firstDate} ~ ${seed.lastDate}`
    : `${seed.firstDate} ~`;

  return (
    <main className="min-h-screen">
      <DeskHeader source="seed" ticker={seed.ticker} />

      <div className="mx-auto max-w-[1180px] space-y-3 px-3 py-3 sm:px-4">
        <section className="grid gap-3 lg:grid-cols-3">
          <section className="border border-border bg-card/30 px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
              Yahoo {seed.ticker} · 시드
            </p>
            <p className="mt-2 font-mono text-3xl leading-none tabular-nums">
              {seed.loaded ? "적재됨" : "시드 경로"}
            </p>
            <p className="mt-3 font-mono text-[11px] text-heading">{dateRange}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              인샘플 {seed.inSampleStart} ~ {seed.inSampleEnd}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              아웃샘플 {seed.outSampleStart} ~
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {seed.relativePath} 입니다. 컬럼은 date, Open, High, Low, Close,
              Volume, sample 입니다. 내려받기 버튼은 없습니다. 종가를 손익으로
              바꾸지 않습니다.
            </p>
          </section>

          <section className="border border-dashed border-heading/40 bg-card/30 px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
              후보 시계열
            </p>
            <p className="mt-2 font-mono text-3xl leading-none">아직 없음</p>
            <p className="mt-3 text-xs text-muted-foreground">
              확정한 공개 신호가 없습니다. 자리만 둡니다.
            </p>
          </section>

          <section className="space-y-3">
            <section className="border border-border bg-card/30 px-4 py-3">
              <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
                인샘플 실행
              </p>
              <Form method="post" className="mt-3">
                <input type="hidden" name="intent" value="run-in-sample" />
                <Button type="submit" variant="outline" size="sm">
                  인샘플 2015–2023
                </Button>
              </Form>
              {actionData ? (
                <Alert className="mt-3 rounded-none">
                  <AlertDescription>{actionData.message}</AlertDescription>
                </Alert>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                버튼을 눌러도 계산하지 않습니다. 규칙이 없습니다.
              </p>
            </section>

            <section
              className="border border-border bg-muted/40 px-4 py-3 text-muted-foreground"
              aria-disabled="true"
            >
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
                <Lock className="size-3" aria-hidden />
                아웃샘플 · 잠김
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="mt-3"
              >
                <Lock aria-hidden />
                아웃샘플 · 잠김
              </Button>
              <p className="mt-3 text-xs">
                후보를 확정한 뒤에 한 번만 엽니다. 결제가 아닙니다.
              </p>
            </section>
          </section>
        </section>

        <section className="border border-border bg-card/30 px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            자산곡선
          </p>
          <div
            className="mt-3 flex h-40 items-center justify-center border border-dashed border-heading/40 bg-background/50"
            role="img"
            aria-label="자산곡선 자리. 아직 없습니다."
          >
            <p className="font-mono text-sm text-muted-foreground">아직 없음</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            빈 자리입니다. 관측 데스크 종가 선을 자산곡선으로 쓰지 않습니다.
          </p>
        </section>

        <section className="border border-border bg-card/30 px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            성과 숫자
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetricSlot label="Sharpe" />
            <MetricSlot label="최대낙폭" />
            <MetricSlot label="적중률" />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            적중률은 다음 날 CL=F 방향입니다. 보합일은 분모에서 뺍니다. 규칙이
            없어서 값은 비워 둡니다.
          </p>
        </section>

        <section className="overflow-x-auto border border-border bg-card/30">
          <p className="px-4 pt-3 font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            체결 목록
          </p>
          <table className="mt-2 w-full text-left">
            <caption className="sr-only">
              백테스트 체결 목록. 행이 없습니다.
            </caption>
            <thead>
              <tr className="border-y border-border font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
                <th className="px-4 py-2 font-medium">날짜</th>
                <th className="px-4 py-2 font-medium">방향 (롱/숏)</th>
                <th className="px-4 py-2 font-medium">다음날 방향</th>
                <th className="px-4 py-2 font-medium">적중?</th>
              </tr>
            </thead>
            <tbody />
          </table>
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            아직 없음
          </p>
        </section>

        <section className="border border-dashed border-heading/40 bg-card/30 px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            비교
          </p>
          <p className="mt-2 font-mono text-3xl leading-none">아직 없음</p>
          <p className="mt-3 text-xs text-muted-foreground">
            기준선과 후보를 나란히 둘 자리입니다. 지금은 비워 둡니다.
          </p>
        </section>

        <HistoryLog isEmpty={history.length === 0} />

        <section className="border border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            2주 수업 포트폴리오입니다. 투자 권유가 아닙니다. 후보는 아직
            확정하지 않았습니다. 규칙이 생기기 전까지 성과 숫자는 비워 둡니다.
          </p>
        </section>
      </div>

      <DeskFooter />
    </main>
  );
}

function MetricSlot({ label }: { label: string }) {
  return (
    <div className="border border-border px-3 py-2">
      <dt className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-3xl leading-none text-muted-foreground">
        {EMPTY}
      </dd>
    </div>
  );
}

function HistoryLog({ isEmpty }: { isEmpty: boolean }) {
  return (
    <section className="overflow-x-auto border border-border bg-card/30">
      <p className="px-4 pt-3 font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        실험 기록
      </p>
      <p className="px-4 pt-2 text-xs text-muted-foreground">
        순위가 아닙니다. 어떤 후보를 언제 인샘플에서 돌렸는지 적는 칸입니다.
        성과 숫자는 규칙이 생긴 뒤에 적습니다. 나중에 CSV 템플릿으로 넣을 수
        있습니다.
      </p>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">
          백테스트 실험 기록. 행이 없습니다. 구간은 인샘플입니다.
        </caption>
        <thead>
          <tr className="border-y border-border font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
            <th className="px-4 py-2 font-medium">후보</th>
            <th className="px-4 py-2 font-medium">언제</th>
            <th className="px-4 py-2 font-medium">구간</th>
          </tr>
        </thead>
        <tbody />
      </table>
      {isEmpty ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          아직 돌린 기록이 없습니다.
        </p>
      ) : null}
    </section>
  );
}
