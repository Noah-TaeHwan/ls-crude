import { Lock } from "lucide-react";
import { data, Form, Link } from "react-router";

import type { Route } from "./+types/backtest";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  SAMPLE_EQUITY,
  SAMPLE_IS_METRICS,
  SAMPLE_LABEL,
  SAMPLE_OS_METRICS,
  SAMPLE_TRADES,
  historyRowsForPreview,
  isSamplePreviewOn,
  samplePreviewHref,
  type BacktestHistoryRow,
  type SampleEquityPoint,
  type SampleMetrics,
  type SampleTradeRow,
} from "~/lib/backtest-sample";
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
        "WTI 선물 CL=F 백테스트 칸입니다. 규칙은 아직 없어서 성과 숫자는 비워 둡니다.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const seed = await readClfPriceSeedMeta();
  const samplePreview = isSamplePreviewOn(new URL(request.url));
  return {
    seed,
    samplePreview,
    history: historyRowsForPreview(samplePreview),
  };
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
  const { seed, history, samplePreview } = loaderData;
  const dateRange = seed.lastDate
    ? `${seed.firstDate} ~ ${seed.lastDate}`
    : `${seed.firstDate} ~`;

  return (
    <main
      className="min-h-screen"
      data-sample-preview={samplePreview ? "on" : "off"}
    >
      <DeskHeader
        source="seed"
        ticker={seed.ticker}
        samplePreview={samplePreview}
      />

      <div className="mx-auto max-w-[1180px] space-y-3 px-3 py-3 sm:px-4">
        <SamplePreviewToggle on={samplePreview} />

        {samplePreview ? (
          <section
            role="status"
            className="border border-heading/40 bg-heading/10 px-4 py-3"
          >
            <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
              {SAMPLE_LABEL}
            </p>
            <p className="mt-1 text-sm">
              샘플 미리보기입니다. 칸이 어떻게 생겼는지만 채운 것이고, 실제
              백테스트가 아닙니다.
            </p>
          </section>
        ) : null}

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
              {seed.relativePath}입니다. 컬럼은 date, Open, High, Low, Close,
              Volume, sample입니다. 내려받기 버튼은 없고, 종가를 손익으로
              바꾸지도 않습니다.
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
                {samplePreview
                  ? "이 버튼으로는 계산하지 않습니다. 아래 숫자는 샘플입니다."
                  : "버튼을 눌러도 계산하지 않습니다. 규칙이 없습니다."}
              </p>
            </section>

            {samplePreview ? null : <OutSampleLockedPane />}
          </section>
        </section>

        {samplePreview ? (
          <section className="grid gap-3 md:grid-cols-2">
            <OutSampleLockedPane sampleBadge />
            <OutSampleFilledPane metrics={SAMPLE_OS_METRICS} />
          </section>
        ) : null}

        <EquityPane samplePreview={samplePreview} />

        <section className="border border-border bg-card/30 px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            성과 숫자
            {samplePreview ? ` · ${SAMPLE_LABEL}` : ""}
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetricSlot
              label="Sharpe"
              value={samplePreview ? SAMPLE_IS_METRICS.sharpe : undefined}
              isSample={samplePreview}
            />
            <MetricSlot
              label="최대낙폭"
              value={samplePreview ? SAMPLE_IS_METRICS.maxDrawdown : undefined}
              isSample={samplePreview}
            />
            <MetricSlot
              label="적중률"
              value={samplePreview ? SAMPLE_IS_METRICS.hitRate : undefined}
              isSample={samplePreview}
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            {samplePreview
              ? "인샘플 칸에 넣는 가짜 숫자입니다. 검증한 성과가 아닙니다."
              : "적중률은 다음 날 CL=F 방향입니다. 보합일은 분모에서 뺍니다. 규칙이 없어서 값은 비웁니다."}
          </p>
        </section>

        <TradeList samplePreview={samplePreview} trades={SAMPLE_TRADES} />

        <ComparePane samplePreview={samplePreview} />

        <HistoryLog rows={history} samplePreview={samplePreview} />

        <section className="border border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            2주짜리 수업 과제입니다. 투자 권유가 아닙니다. 후보는 아직 안
            골랐습니다. 규칙이 생기기 전까지 성과 숫자는 비워 둡니다.
            {samplePreview
              ? " 샘플 숫자는 칸 모양을 보는 용도입니다."
              : ""}
          </p>
        </section>
      </div>

      <DeskFooter />
    </main>
  );
}

function SampleTag() {
  return (
    <span className="font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
      {SAMPLE_LABEL}
    </span>
  );
}

function SamplePreviewToggle({ on }: { on: boolean }) {
  return (
    <section className="flex flex-wrap items-center gap-3 border border-border bg-card/30 px-4 py-3">
      <Button variant={on ? "default" : "outline"} size="sm" asChild>
        <Link
          to={samplePreviewHref(!on)}
          preventScrollReset
          aria-pressed={on}
        >
          샘플 미리보기
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        {on
          ? "켜져 있습니다. 숫자는 칸 모양을 보는 용도고, 실제 성과가 아닙니다."
          : "꺼져 있습니다. 켜면 그래프와 칸이 어떻게 생겼는지만 채웁니다."}
      </p>
    </section>
  );
}

function OutSampleLockedPane({ sampleBadge = false }: { sampleBadge?: boolean }) {
  return (
    <section
      className="border border-border bg-muted/40 px-4 py-3 text-muted-foreground"
      aria-disabled="true"
    >
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
        <Lock className="size-3" aria-hidden />
        아웃샘플 · 잠김
        {sampleBadge ? <SampleTag /> : null}
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
        {sampleBadge
          ? "잠긴 모습의 샘플입니다. 아웃샘플을 연 것이 아닙니다."
          : "후보를 고른 뒤에 한 번만 엽니다. 결제가 아닙니다."}
      </p>
    </section>
  );
}

function OutSampleFilledPane({ metrics }: { metrics: SampleMetrics }) {
  return (
    <section className="border border-heading/40 bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        아웃샘플 · 채워 본 모습 · {SAMPLE_LABEL}
      </p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        <MetricSlot label="Sharpe" value={metrics.sharpe} isSample />
        <MetricSlot label="최대낙폭" value={metrics.maxDrawdown} isSample />
        <MetricSlot label="적중률" value={metrics.hitRate} isSample />
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        칸 모양만 채운 것입니다. 아웃샘플을 연 것이 아닙니다.
      </p>
    </section>
  );
}

function EquityPane({ samplePreview }: { samplePreview: boolean }) {
  return (
    <section className="border border-border bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        자산곡선
        {samplePreview ? ` · ${SAMPLE_LABEL}` : ""}
      </p>
      {samplePreview ? (
        <SampleEquityChart points={SAMPLE_EQUITY} />
      ) : (
        <div
          className="mt-3 flex h-40 items-center justify-center border border-dashed border-heading/40 bg-background/50"
          role="img"
          aria-label="자산곡선 자리. 아직 없습니다."
        >
          <p className="font-mono text-sm text-muted-foreground">아직 없음</p>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {samplePreview
          ? "인샘플은 녹색, 아웃샘플은 붉은 선입니다. 종가가 아닙니다."
          : "빈 자리입니다. 관측 데스크의 종가 선을 자산곡선으로 쓰지 않습니다."}
      </p>
    </section>
  );
}

function SampleEquityChart({
  points,
}: {
  points: readonly SampleEquityPoint[];
}) {
  const width = 640;
  const height = 160;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const xOf = (index: number) =>
    points.length < 2 ? 0 : (index / (points.length - 1)) * width;
  const yOf = (value: number) => height - ((value - min) / span) * height;
  const splitIndex = points.findIndex((point) => point.sample === "out");
  const toPath = (
    slice: readonly SampleEquityPoint[],
    startIndex: number,
  ) =>
    slice
      .map((point, offset) => {
        const index = startIndex + offset;
        const command = offset === 0 ? "M" : "L";
        return `${command}${xOf(index).toFixed(1)} ${yOf(point.value).toFixed(1)}`;
      })
      .join(" ");

  const inPoints = splitIndex === -1 ? points : points.slice(0, splitIndex);
  const outStartIndex = splitIndex <= 0 ? 0 : splitIndex - 1;
  const outPoints = splitIndex === -1 ? [] : points.slice(outStartIndex);
  const splitX = splitIndex === -1 ? width : xOf(splitIndex);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-40 w-full"
      role="img"
      aria-label="샘플 자산곡선. 인샘플과 아웃샘플을 색으로 나눕니다. 실제 성과가 아닙니다."
    >
      {splitIndex !== -1 ? (
        <line
          x1={splitX}
          x2={splitX}
          y1={0}
          y2={height}
          className="stroke-heading/50"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ) : null}
      <g className="text-watching">
        <path
          d={toPath(inPoints, 0)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <text x="8" y="14" fill="currentColor" className="font-mono text-[10px]">
          인샘플
        </text>
      </g>
      {outPoints.length > 1 ? (
        <g className="text-spike">
          <path
            d={toPath(outPoints, outStartIndex)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <text
            x={splitX + 8}
            y="14"
            fill="currentColor"
            className="font-mono text-[10px]"
          >
            아웃샘플
          </text>
        </g>
      ) : null}
      <text
        x={width - 8}
        y={height - 8}
        textAnchor="end"
        className="fill-heading font-mono text-[10px]"
      >
        {SAMPLE_LABEL}
      </text>
    </svg>
  );
}

function TradeList({
  samplePreview,
  trades,
}: {
  samplePreview: boolean;
  trades: readonly SampleTradeRow[];
}) {
  const rows = samplePreview ? trades : [];
  return (
    <section className="overflow-x-auto border border-border bg-card/30">
      <p className="px-4 pt-3 font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        체결 목록
        {samplePreview ? ` · ${SAMPLE_LABEL}` : ""}
      </p>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">
          {samplePreview
            ? "샘플 체결 목록입니다. 실제 체결이 아닙니다."
            : "백테스트 체결 목록. 행이 없습니다."}
        </caption>
        <thead>
          <tr className="border-y border-border font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
            <th className="px-4 py-2 font-medium">날짜</th>
            <th className="px-4 py-2 font-medium">방향 (롱/숏)</th>
            <th className="px-4 py-2 font-medium">다음날 방향</th>
            <th className="px-4 py-2 font-medium">적중?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date} className="border-b border-border">
              <td className="px-4 py-2 font-mono text-sm">{row.date}</td>
              <td className="px-4 py-2 font-mono text-sm">{row.side}</td>
              <td className="px-4 py-2 font-mono text-sm">{row.nextDay}</td>
              <td className="px-4 py-2 font-mono text-sm">
                {row.hit} <SampleTag />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          아직 없음
        </p>
      ) : null}
    </section>
  );
}

function ComparePane({ samplePreview }: { samplePreview: boolean }) {
  if (!samplePreview) {
    return (
      <section className="border border-dashed border-heading/40 bg-card/30 px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
          비교
        </p>
        <p className="mt-2 font-mono text-3xl leading-none">아직 없음</p>
        <p className="mt-3 text-xs text-muted-foreground">
          기준선과 후보를 나란히 둘 자리입니다. 지금은 비웁니다.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-dashed border-heading/40 bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        비교 · {SAMPLE_LABEL}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="border border-border px-3 py-2">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            인샘플 · {SAMPLE_LABEL}
          </p>
          <p className="mt-1 font-mono text-2xl leading-none">
            {SAMPLE_IS_METRICS.sharpe} <SampleTag />
          </p>
        </div>
        <div className="border border-border px-3 py-2">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            아웃샘플 · {SAMPLE_LABEL}
          </p>
          <p className="mt-1 font-mono text-2xl leading-none">
            {SAMPLE_OS_METRICS.sharpe} <SampleTag />
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        나란히 두는 칸의 모습만입니다. 순위가 아닙니다.
      </p>
    </section>
  );
}

function HistoryLog({
  rows,
  samplePreview,
}: {
  rows: readonly BacktestHistoryRow[];
  samplePreview: boolean;
}) {
  const isEmpty = rows.length === 0;
  return (
    <section
      id="experiment-history"
      className="overflow-x-auto border border-border bg-card/30"
      data-history-empty={isEmpty ? "true" : "false"}
    >
      <p className="px-4 pt-3 font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        실험 기록
        {samplePreview ? ` · ${SAMPLE_LABEL}` : ""}
      </p>
      <p className="px-4 pt-2 text-xs text-muted-foreground">
        순위가 아닙니다. 어떤 후보를 언제 인샘플에서 돌렸는지, 한 줄 메모와
        함께 적습니다. 성과 숫자는 규칙이 생긴 뒤에 적습니다. 나중에 CSV로
        넣을 수 있고, 그때 컬럼은 date, value만 둡니다.
      </p>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">
          {isEmpty
            ? "백테스트 실험 기록. 후보, 언제, 구간, 메모. 행이 없습니다."
            : "샘플 실험 기록입니다. 실제 실행이 아닙니다. 열은 후보, 언제, 구간, 메모입니다."}
        </caption>
        <thead>
          <tr className="border-y border-border font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
            <th className="px-4 py-2 font-medium">후보</th>
            <th className="px-4 py-2 font-medium">언제</th>
            <th className="px-4 py-2 font-medium">구간</th>
            <th className="px-4 py-2 font-medium">메모</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.candidate}-${row.ranAt}`}
              className="border-b border-border"
            >
              <td className="px-4 py-2 font-mono text-sm">
                {row.candidate} {samplePreview ? <SampleTag /> : null}
              </td>
              <td className="px-4 py-2 font-mono text-sm">{row.ranAt}</td>
              <td className="px-4 py-2 font-mono text-sm">{row.window}</td>
              <td className="max-w-[18rem] px-4 py-2 text-sm">
                {row.memo ? (
                  <>
                    {row.memo} {samplePreview ? <SampleTag /> : null}
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isEmpty ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          아직 돌린 기록이 없습니다.
        </p>
      ) : null}
    </section>
  );
}

function MetricSlot({
  label,
  value,
  isSample = false,
}: {
  label: string;
  value?: string;
  isSample?: boolean;
}) {
  const filled = value != null;
  return (
    <div className="border border-border px-3 py-2">
      <dt className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
        {isSample && filled ? ` · ${SAMPLE_LABEL}` : ""}
      </dt>
      <dd
        className={`mt-1 font-mono text-3xl leading-none ${filled ? "tabular-nums" : "text-muted-foreground"}`}
      >
        {filled ? value : EMPTY}
        {isSample && filled ? (
          <span className="ml-2 font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
            {SAMPLE_LABEL}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
