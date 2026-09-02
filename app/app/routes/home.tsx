import type { ReactNode } from "react";
import { data } from "react-router";

import type { Route } from "./+types/home";
import { DeskFooter, DeskHeader } from "~/components/desk-chrome";
import { NewsDesk, parseNewsTag, tagLabel } from "~/components/news-desk";
import { WatchGauge } from "~/components/watch-gauge";
import { readSnapshotFile, normalizeFeatureRow, normalizeNewsRow } from "~/lib/snapshot.server";
import { getSupabaseServerClient } from "~/lib/supabase.server";
import type { ActionResult, DailyFeatureRow } from "~/lib/types";

type NewsIntent = "create-news" | "update-news" | "delete-news";
type DbClient = NonNullable<ReturnType<typeof getSupabaseServerClient>>;

const RSI_POSITION_LABEL: Record<NonNullable<DailyFeatureRow["rsi_position"]>, string> = {
  long: "롱",
  flat: "중립",
  short: "숏",
};

const CLOSE_SPIKE_ABS = 0.04;

function isNewsIntent(value: string): value is NewsIntent {
  return value === "create-news" || value === "update-news" || value === "delete-news";
}

function formatNumber(value: number | null, digits = 2) {
  if (value == null) return "—";
  return value.toFixed(digits);
}

function formatSigned(value: number, digits = 2) {
  const abs = value.toFixed(digits);
  return value > 0 ? `+${abs}` : abs;
}

function fail(message: string) {
  return data({ ok: false, message } satisfies ActionResult, { status: 400 });
}

function ok(message: string) {
  return { ok: true, message } satisfies ActionResult;
}

function sparklinePath(values: number[]) {
  if (values.length < 2) return "";
  const width = 320;
  const height = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — 관측 데스크" },
    {
      name: "description",
      content:
        "WTI 선물 CL=F를 보는 수업용 화면입니다. 펜타곤 피자 인덱스처럼 유가 옆의 공개 신호를 찾습니다.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const [featuresResult, newsResult] = await Promise.all([
      supabase
        .from("daily_features")
        .select("*")
        .order("date", { ascending: false })
        .limit(180),
      supabase
        .from("news_events")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(50),
    ]);

    if (!featuresResult.error && !newsResult.error) {
      const rows = (featuresResult.data ?? []).map((row) =>
        normalizeFeatureRow(row as Record<string, unknown>),
      );
      const news = (newsResult.data ?? []).map((row) =>
        normalizeNewsRow(row as Record<string, unknown>),
      );
      return {
        source: "supabase" as const,
        ticker: rows[0]?.ticker ?? "CL=F",
        rows: rows.slice().reverse(),
        news,
      };
    }
  }

  const snapshot = await readSnapshotFile();
  return {
    source: "snapshot" as const,
    ticker: snapshot.ticker,
    rows: snapshot.rows,
    news: snapshot.news,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawIntent = String(formData.get("intent") ?? "");
  if (!isNewsIntent(rawIntent)) {
    return fail("알 수 없는 요청입니다.");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return fail("Supabase 환경 변수가 없어서 뉴스를 저장하지 못했습니다.");
  }

  const intent: NewsIntent = rawIntent;
  switch (intent) {
    case "create-news":
      return createNews(supabase, formData);
    case "update-news":
      return updateNews(supabase, formData);
    case "delete-news":
      return deleteNews(supabase, formData);
    default: {
      const exhaustive: never = intent;
      throw new Error(`Unhandled intent: ${exhaustive}`);
    }
  }
}

async function createNews(supabase: DbClient, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const tag = parseNewsTag(String(formData.get("tag") ?? ""));
  if (!title || !publishedAt || !tag) {
    return fail("날짜, 제목, 태그는 필수입니다.");
  }
  const { error } = await supabase.from("news_events").insert({
    published_at: publishedAt,
    title,
    url: url || null,
    source: "investing.com",
    tags: [tag],
  });
  if (error) {
    return fail(error.message);
  }
  return data(ok("헤드라인을 추가했습니다."), { status: 201 });
}

async function updateNews(supabase: DbClient, formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const tag = parseNewsTag(String(formData.get("tag") ?? ""));
  if (!id || !title || !tag) {
    return fail("고칠 항목이 맞지 않습니다.");
  }
  const { error } = await supabase
    .from("news_events")
    .update({
      title,
      tags: [tag],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    return fail(error.message);
  }
  return ok("헤드라인을 수정했습니다.");
}

async function deleteNews(supabase: DbClient, formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return fail("삭제할 항목이 없습니다.");
  }
  const { error } = await supabase.from("news_events").delete().eq("id", id);
  if (error) {
    return fail(error.message);
  }
  return ok("헤드라인을 삭제했습니다.");
}

export default function Home({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const latest = loaderData.rows.at(-1) ?? null;
  const previous = loaderData.rows.at(-2) ?? null;
  const closes = loaderData.rows
    .map((row) => row.close)
    .filter((value): value is number => value != null);
  const hormuzCount = loaderData.news.filter((item) => item.tags.includes("hormuz")).length;
  const policyCount = loaderData.news.filter((item) =>
    item.tags.includes("inflation_policy"),
  ).length;
  const closeDelta =
    latest?.close != null && previous?.close != null ? latest.close - previous.close : null;
  const closePct =
    closeDelta != null && previous?.close ? closeDelta / previous.close : null;
  const hasCloseSpike = closePct != null && Math.abs(closePct) >= CLOSE_SPIKE_ABS;
  const rsiLabel = latest?.rsi_position
    ? RSI_POSITION_LABEL[latest.rsi_position]
    : "—";

  return (
    <main className="min-h-screen">
      <DeskHeader source={loaderData.source} ticker={loaderData.ticker} />

      <div className="mx-auto max-w-[1180px] space-y-3 px-3 py-3 sm:px-4">
        <WatchGauge sliceZ={latest?.slice_z ?? null} />

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_minmax(12rem,0.7fr)]">
          <QuoteCell
            ticker={loaderData.ticker}
            date={latest?.date ?? "—"}
            close={latest?.close ?? null}
            delta={closeDelta}
            pct={closePct}
            hasSpike={hasCloseSpike}
          />
          <SparkCell closes={closes} />
          <RsiQuoteCell rsi={latest?.rsi_14 ?? null} position={rsiLabel} />
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <HubCard kicker="RSI 상태" title={formatNumber(latest?.rsi_14 ?? null)}>
            <p className="font-mono text-xs text-heading">{rsiLabel}</p>
            <p className="text-xs text-muted-foreground">
              RSI 14입니다. 가격 옆에 두는 기존 지표고, 지금 찾는 후보는 아닙니다.
            </p>
          </HubCard>
          <HubCard
            kicker="Oil Slice 초안"
            title={formatNumber(latest?.slice_z ?? null)}
            badge="초안"
          >
            <p className="font-mono text-[11px] text-heading">
              2 × 호르무즈 + 1 × 인플레/정책
            </p>
            <p className="text-xs text-muted-foreground">
              호르무즈 {hormuzCount} · 인플레/정책 {policyCount}. 가중치는 초안입니다.
            </p>
          </HubCard>
          <HubCard kicker="대안 후보" title="아직 없음" dashed>
            <p className="text-xs text-muted-foreground">
              확정한 공개 신호가 없습니다. 빈 칸으로 둡니다.
            </p>
          </HubCard>
        </section>

        <section className="overflow-hidden border border-border bg-card/30 py-2.5">
          <p className="px-4 pb-2 font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
            뉴스 테이프 · Investing.com
          </p>
          {loaderData.news.length === 0 ? (
            <p className="px-4 text-sm text-muted-foreground">헤드라인이 없습니다.</p>
          ) : (
            <div className="flex overflow-hidden">
              <div className="news-tape flex min-w-max gap-8 pr-8">
                {[...loaderData.news, ...loaderData.news].map((item, index) => (
                  <span
                    key={`${item.id ?? item.title}-${index}`}
                    className="font-mono text-xs whitespace-nowrap"
                  >
                    <span className="text-heading">
                      {tagLabel(item.tags[0] ?? "other")}
                    </span>{" "}
                    {item.published_at} · {item.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <PinMap hormuzCount={hormuzCount} policyCount={policyCount} />

        <section className="border border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            2주짜리 수업 과제입니다. WTI 선물 CL=F를 보면서 유가 옆의 공개 신호를
            찾고 있습니다. 상관은 인과가 아니고, 투자 권유도 아닙니다. 후보는
            아직 안 골랐습니다.
          </p>
        </section>

        {actionData ? (
          <div className="border border-border px-4 py-3">
            <p className={`font-mono text-xs ${actionData.ok ? "text-watching" : "text-spike"}`}>
              {actionData.message}
            </p>
          </div>
        ) : null}

        <NewsDesk
          news={loaderData.news}
          actionData={actionData}
          source={loaderData.source}
        />
      </div>
      <DeskFooter />
    </main>
  );
}

function QuoteCell({
  ticker,
  date,
  close,
  delta,
  pct,
  hasSpike,
}: {
  ticker: string;
  date: string;
  close: number | null;
  delta: number | null;
  pct: number | null;
  hasSpike: boolean;
}) {
  return (
    <section className="border border-border bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        Yahoo {ticker} · 최근 종가
      </p>
      <p className="mt-1 font-mono text-5xl leading-none font-medium tracking-tight tabular-nums">
        {formatNumber(close)}
      </p>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        {date}
        {delta != null && pct != null ? (
          <span className={hasSpike ? "ml-2 text-spike" : "ml-2"}>
            {formatSigned(delta)} ({formatSigned(pct * 100, 1)}%)
          </span>
        ) : null}
      </p>
    </section>
  );
}

function SparkCell({ closes }: { closes: number[] }) {
  return (
    <section className="border border-border bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        종가 스파크
      </p>
      {closes.length > 1 ? (
        <svg
          viewBox="0 0 320 64"
          className="mt-3 h-16 w-full text-watching"
          aria-label="최근 종가 흐름"
        >
          <path
            d={sparklinePath(closes)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">가격 스냅샷이 없습니다.</p>
      )}
    </section>
  );
}

function RsiQuoteCell({ rsi, position }: { rsi: number | null; position: string }) {
  return (
    <section className="border border-border bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        RSI 14
      </p>
      <p className="mt-1 font-mono text-5xl leading-none font-medium tabular-nums">
        {formatNumber(rsi, 1)}
      </p>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">{position}</p>
    </section>
  );
}

function HubCard({
  kicker,
  title,
  badge,
  dashed,
  children,
}: {
  kicker: string;
  title: string;
  badge?: string;
  dashed?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`border bg-card/30 px-4 py-3 ${dashed ? "border-dashed border-heading/40" : "border-border"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
          {kicker}
        </p>
        {badge ? (
          <span className="font-mono text-[10px] tracking-[0.16em] text-heading uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-3xl leading-none tabular-nums">{title}</p>
      <div className="mt-3 space-y-1.5">{children}</div>
    </section>
  );
}

function PinMap({
  hormuzCount,
  policyCount,
}: {
  hormuzCount: number;
  policyCount: number;
}) {
  return (
    <section className="border border-border bg-card/30 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.2em] text-heading uppercase">
        지도 자리
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        핀만 적습니다. 실시간 AIS가 아닙니다.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <PinRegion region="해협 권역" label="호르무즈" count={hormuzCount} />
        <PinRegion region="정책 권역" label="인플레/정책" count={policyCount} />
      </div>
    </section>
  );
}

function PinRegion({
  region,
  label,
  count,
}: {
  region: string;
  label: string;
  count: number;
}) {
  const pins = Math.max(count, 0);
  return (
    <div className="border border-border px-3 py-3">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {region}
      </p>
      <div className="mt-3 grid h-16 grid-cols-8 gap-1">
        {Array.from({ length: 16 }, (_, index) => (
          <span
            key={`${label}-${index}`}
            className={`size-2 justify-self-center rounded-full ${index < pins ? "bg-heading" : "bg-foreground/15"}`}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-xs">
        {label} · {count}핀
      </p>
    </div>
  );
}
