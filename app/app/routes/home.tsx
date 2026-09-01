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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { readSnapshotFile, normalizeFeatureRow, normalizeNewsRow } from "~/lib/snapshot.server";
import { getSupabaseServerClient } from "~/lib/supabase.server";
import type { ActionResult, DailyFeatureRow, NewsEventRow } from "~/lib/types";

type NewsIntent = "create-news" | "update-news" | "delete-news";
type NewsTag = "hormuz" | "inflation_policy" | "other";

const TAG_LABELS: Record<NewsTag, string> = {
  hormuz: "호르무즈",
  inflation_policy: "인플레/정책",
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

function formatNumber(value: number | null, digits = 2): string {
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LS CRUDE — WTI · RSI · Oil Slice" },
    {
      name: "description",
      content: "Yahoo WTI 가격, RSI, Investing.com 뉴스, 호르무즈·인플레 Oil Slice 대시보드",
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
    return fail("Supabase 환경변수가 없어 뉴스 CRUD를 저장할 수 없습니다.");
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

async function createNews(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  formData: FormData,
) {
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

async function updateNews(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  formData: FormData,
) {
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

async function deleteNews(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  formData: FormData,
) {
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
  const recent = loaderData.rows.slice(-12).reverse();

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-col gap-2 border-b pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">LS CRUDE</p>
        <h1 className="text-3xl font-semibold">WTI 기본 + Oil Slice 한 스푼</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          가격은 Yahoo Finance <code>CL=F</code>, 기본 지표는 RSI, 서사는
          Investing.com 뉴스(호르무즈·미국 인플레/정책). 피자인덱스처럼 호가가
          아니라 부엌 열기를 보는 값이 Oil Slice입니다.
        </p>
        <p className="text-xs text-muted-foreground">
          데이터 소스: {loaderData.source === "supabase" ? "Supabase" : "로컬 스냅샷"} · 티커{" "}
          {loaderData.ticker}
        </p>
      </header>

      {actionData ? (
        <Alert variant={actionData.ok ? "default" : "destructive"}>
          <AlertDescription>{actionData.message}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="종가" value={formatNumber(latest?.close ?? null)} hint="Yahoo CL=F" />
        <MetricCard
          label="RSI(14)"
          value={formatNumber(latest?.rsi_14 ?? null)}
          hint={latest?.rsi_position ?? "flat"}
        />
        <MetricCard
          label="Slice z"
          value={formatNumber(latest?.slice_z ?? null)}
          hint="호르무즈 2 + 인플레 1"
        />
        <MetricCard
          label="샘플"
          value={latest?.sample === "out" ? "OUT" : "IN"}
          hint="인샘플 ~2023 / 아웃 2024~"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>최근 세션</CardTitle>
            <CardDescription>Yahoo 일봉 + RSI + Oil Slice</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>종가</TableHead>
                  <TableHead>RSI</TableHead>
                  <TableHead>Slice z</TableHead>
                  <TableHead>샘플</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-6 text-muted-foreground" colSpan={5}>
                      스냅샷이 비어 있습니다. research에서 `python -m ls_crude.build`를 실행하세요.
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((row) => <PriceRow key={row.date} row={row} />)
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investing.com 헤드라인 입력</CardTitle>
            <CardDescription>스크래핑하지 않고 CSV/폼으로만 넣습니다.</CardDescription>
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
                <Input
                  id="url"
                  name="url"
                  placeholder="https://www.investing.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tag">태그</Label>
                <select
                  id="tag"
                  name="tag"
                  defaultValue="hormuz"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm dark:bg-input/30"
                >
                  <option value="hormuz">호르무즈</option>
                  <option value="inflation_policy">인플레/정책</option>
                  <option value="other">기타</option>
                </select>
              </div>
              <Button className="w-full" type="submit">
                헤드라인 추가
              </Button>
            </Form>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>뉴스 북 (CRUD)</CardTitle>
          <CardDescription>
            정본은 Investing.com. 피자인덱스처럼 호르무즈가 오븐, 연준/CPI는 점심 수요입니다.
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
    </main>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardDescription className="uppercase tracking-wide">{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function PriceRow({ row }: { row: DailyFeatureRow }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{row.date}</TableCell>
      <TableCell>{formatNumber(row.close)}</TableCell>
      <TableCell>{formatNumber(row.rsi_14)}</TableCell>
      <TableCell>{formatNumber(row.slice_z)}</TableCell>
      <TableCell className="uppercase text-muted-foreground">{row.sample}</TableCell>
    </TableRow>
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
        {item.tags.map((tag) => {
          const parsed = parseNewsTag(tag) ?? "other";
          return (
            <Badge key={`${item.id ?? item.title}-${tag}`} variant="secondary">
              {TAG_LABELS[parsed]}
            </Badge>
          );
        })}
      </div>
      <p className="mt-1 text-sm">{item.title}</p>
      {item.id ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Form method="post" className="flex flex-1 gap-2">
            <input type="hidden" name="intent" value="update-news" />
            <input type="hidden" name="id" value={item.id} />
            <Input name="title" defaultValue={item.title} className="h-8 text-xs" />
            <select
              name="tag"
              defaultValue={currentTag}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-xs dark:bg-input/30"
            >
              <option value="hormuz">호르무즈</option>
              <option value="inflation_policy">인플레/정책</option>
              <option value="other">기타</option>
            </select>
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
