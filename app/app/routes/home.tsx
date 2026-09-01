import { Form, data } from "react-router";

import type { Route } from "./+types/home";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { readSnapshotFile, normalizeFeatureRow, normalizeNewsRow } from "~/lib/snapshot.server";
import { getSupabaseServerClient } from "~/lib/supabase.server";
import type { ActionResult, DailyFeatureRow, NewsEventRow } from "~/lib/types";

type NewsIntent = "create-news" | "update-news" | "delete-news";
type NewsTag = "hormuz" | "inflation_policy" | "other";
type DbClient = NonNullable<ReturnType<typeof getSupabaseServerClient>>;

const TAG_LABELS: Record<NewsTag, string> = {
  hormuz: "오븐 · 호르무즈",
  inflation_policy: "점심 · 연준/CPI",
  other: "기타",
};

function isNewsIntent(value: string): value is NewsIntent {
  return value === "create-news" || value === "update-news" || value === "delete-news";
}

function parseNewsTag(value: string): NewsTag | null {
  if (value === "hormuz" || value === "inflation_policy" || value === "other") {
    return value;
  }
  return null;
}

function tagLabel(tag: string) {
  return TAG_LABELS[parseNewsTag(tag) ?? "other"];
}

function TagSelect({
  id,
  name,
  defaultValue,
  className,
}: {
  id?: string;
  name: string;
  defaultValue?: NewsTag;
  className: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className={className}>
      {(Object.keys(TAG_LABELS) as NewsTag[]).map((value) => (
        <option key={value} value={value}>
          {TAG_LABELS[value]}
        </option>
      ))}
    </select>
  );
}

function formatNumber(value: number | null, digits = 2) {
  if (value == null) {
    return "—";
  }
  return value.toFixed(digits);
}

function fail(message: string) {
  return data({ ok: false, message } satisfies ActionResult, { status: 400 });
}

function ok(message: string) {
  return { ok: true, message } satisfies ActionResult;
}

function sparklinePath(values: number[]) {
  if (values.length < 2) {
    return "";
  }
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
    { title: "LS CRUDE — 부엌이 바빠졌는가" },
    {
      name: "description",
      content: "유가 타겟. 피자인덱스처럼 부엌 열기를 보는 웹 틀.",
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
    return fail("Supabase 환경변수가 없어서 뉴스를 저장할 수 없습니다.");
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
    return fail("수정할 항목이 올바르지 않습니다.");
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
  const closes = loaderData.rows
    .map((row) => row.close)
    .filter((value): value is number => value != null);
  const ovenCount = loaderData.news.filter((item) => item.tags.includes("hormuz")).length;
  const lunchCount = loaderData.news.filter((item) =>
    item.tags.includes("inflation_policy"),
  ).length;
  const heatTotal = ovenCount + lunchCount || 1;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_15%_0%,rgba(232,168,72,0.16),transparent_55%),radial-gradient(70%_50%_at_90%_10%,rgba(120,80,40,0.18),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-6xl space-y-10 px-4 py-10">
        <header className="space-y-4">
          <p className="text-xs tracking-[0.28em] text-primary uppercase">
            LS CRUDE · 늦은 밤 부엌
          </p>
          <h1 className="font-serif max-w-3xl text-4xl leading-tight font-medium sm:text-5xl">
            호가가 아니라, 부엌이 바빠졌는지.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            타겟은 유가입니다. 한 스푼으로 Oil Slice 초안을 깔아 두었고, 찾을
            피자는 크립토의 뭐 × 뉴스의 무슨입니다. 레시피는 아직 없습니다.
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {loaderData.source === "supabase" ? "supabase" : "snapshot"} · {loaderData.ticker} ·
            in 2015–2023 · out 2024~
          </p>
        </header>

        {actionData ? (
          <Alert variant={actionData.ok ? "default" : "destructive"}>
            <AlertDescription>{actionData.message}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden border-primary/20 bg-card/80">
            <CardHeader className="gap-1">
              <CardDescription>타겟 · Yahoo {loaderData.ticker}</CardDescription>
              <CardTitle className="font-serif text-6xl font-medium tracking-tight">
                {formatNumber(latest?.close ?? null)}
              </CardTitle>
              <p className="font-mono text-xs text-muted-foreground">
                {latest?.date ?? "—"} · RSI {formatNumber(latest?.rsi_14 ?? null)} · {latest?.rsi_position ?? "flat"}
              </p>
            </CardHeader>
            <CardContent className="pb-2">
              {closes.length > 1 ? (
                <svg
                  viewBox="0 0 320 64"
                  className="h-20 w-full text-primary"
                  aria-label="최근 종가 흐름"
                >
                  <path
                    d={sparklinePath(closes)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              ) : (
                <p className="text-sm text-muted-foreground">가격 스냅샷이 없습니다.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-amber-700/40">
              <CardHeader className="gap-1">
                <CardDescription>초안 스푼 · Oil Slice</CardDescription>
                <CardTitle className="font-serif text-4xl">
                  {formatNumber(latest?.slice_z ?? null)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>2 × 호르무즈 + 1 × 인플레/정책. 최종 피자가 아닙니다.</p>
                <HeatBar label="오븐 호르무즈" count={ovenCount} total={heatTotal} />
                <HeatBar label="점심 연준/CPI" count={lunchCount} total={heatTotal} />
              </CardContent>
            </Card>
            <Card className="border-dashed border-primary/35 bg-transparent">
              <CardHeader className="gap-1">
                <CardDescription>찾을 피자</CardDescription>
                <CardTitle className="font-serif text-2xl">크립토의 뭐 × 뉴스의 무슨</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  아직 비어 있습니다. 후보가 없으면 없다고 적는 것도 과제입니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-primary/15 bg-card/60 py-3">
          <p className="px-4 pb-2 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
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
                    <span className="text-primary">
                      {tagLabel(item.tags[0] ?? "other")}
                    </span>{" "}
                    {item.published_at} · {item.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-6">
          {loaderData.rows.slice(-6).reverse().map((row) => (
            <SessionChip key={row.date} row={row} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>헤드라인 넣기</CardTitle>
              <CardDescription>
                사이트를 긁지 않습니다. CSV나 폼만 받습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-3">
                <input type="hidden" name="intent" value="create-news" />
                <div className="space-y-1.5">
                  <Label htmlFor="published_at">날짜</Label>
                  <Input id="published_at" type="date" name="published_at" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Strait of Hormuz tanker ..."
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="url">URL</Label>
                  <Input id="url" name="url" placeholder="https://www.investing.com/..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tag">태그</Label>
                  <TagSelect
                    id="tag"
                    name="tag"
                    defaultValue="hormuz"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm dark:bg-input/30"
                  />
                </div>
                <Button className="w-full" type="submit">
                  부엌에 넣기
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>부엌 장부</CardTitle>
              <CardDescription>
                뉴스를 추가·수정·삭제합니다. 스냅샷일 때는 수정 칸이 없습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {loaderData.news.length === 0 ? (
                  <li className="text-sm text-muted-foreground">아직 헤드라인이 없습니다.</li>
                ) : (
                  loaderData.news.map((item) => (
                    <NewsItem key={item.id ?? `${item.published_at}-${item.title}`} item={item} />
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function HeatBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const width = Math.max(6, Math.round((count / total) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SessionChip({ row }: { row: DailyFeatureRow }) {
  return (
    <div className="rounded-lg border border-border/80 bg-card/70 px-3 py-2">
      <p className="font-mono text-[10px] text-muted-foreground">{row.date}</p>
      <p className="font-serif text-lg">{formatNumber(row.close)}</p>
      <p className="font-mono text-[10px] text-muted-foreground">
        RSI {formatNumber(row.rsi_14)}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase">{row.sample}</p>
    </div>
  );
}

function NewsItem({ item }: { item: NewsEventRow }) {
  const currentTag = parseNewsTag(item.tags[0] ?? "other") ?? "other";
  return (
    <li className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          {item.published_at} · {item.source}
        </span>
        {item.tags.map((tag) => (
          <Badge key={`${item.id ?? item.title}-${tag}`} variant="secondary">
            {tagLabel(tag)}
          </Badge>
        ))}
      </div>
      <p className="mt-1 text-sm">{item.title}</p>
      {item.id ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Form method="post" className="flex flex-1 gap-2">
            <input type="hidden" name="intent" value="update-news" />
            <input type="hidden" name="id" value={item.id} />
            <Input name="title" defaultValue={item.title} className="h-8 text-xs" />
            <TagSelect
              name="tag"
              defaultValue={currentTag}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-xs dark:bg-input/30"
            />
            <Button size="sm" variant="outline" type="submit">
              수정
            </Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="delete-news" />
            <input type="hidden" name="id" value={item.id} />
            <Button size="sm" variant="destructive" type="submit">
              삭제
            </Button>
          </Form>
        </div>
      ) : null}
    </li>
  );
}
