import { Form } from "react-router";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { ActionResult, NewsEventRow } from "~/lib/types";

export type NewsTag = "hormuz" | "inflation_policy" | "other";

export const TAG_LABELS: Record<NewsTag, string> = {
  hormuz: "호르무즈",
  inflation_policy: "인플레/정책",
  other: "기타",
};

export function parseNewsTag(value: string): NewsTag | null {
  if (value === "hormuz" || value === "inflation_policy" || value === "other") {
    return value;
  }
  return null;
}

export function tagLabel(tag: string) {
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

export function NewsDesk({
  news,
  actionData,
  source,
}: {
  news: NewsEventRow[];
  actionData?: ActionResult;
  source: "supabase" | "snapshot";
}) {
  return (
    <details className="border border-border bg-card/20">
      <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-heading uppercase select-none">
        데스크 · 뉴스 장부
      </summary>
      <div className="space-y-4 border-t border-border px-4 py-4">
        <p className="text-xs text-muted-foreground">
          접힌 뉴스 장부입니다. Investing.com을 긁지 않습니다. CSV나 이 폼으로만
          넣습니다. {source === "supabase" ? "Supabase에 저장합니다." : "지금은 스냅샷이라 저장할 수 없습니다."}
        </p>
        {actionData ? (
          <Alert variant={actionData.ok ? "default" : "destructive"}>
            <AlertDescription>{actionData.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              헤드라인 추가
            </p>
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
                  className="h-9 w-full rounded-none border border-input bg-transparent px-3 font-mono text-sm dark:bg-input/30"
                />
              </div>
              <Button className="w-full rounded-none" type="submit">
                헤드라인 추가
              </Button>
            </Form>
          </div>
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              목록
            </p>
            <ul className="space-y-2">
              {news.length === 0 ? (
                <li className="text-sm text-muted-foreground">아직 헤드라인이 없습니다.</li>
              ) : (
                news.map((item) => (
                  <NewsItem key={item.id ?? `${item.published_at}-${item.title}`} item={item} />
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </details>
  );
}

function NewsItem({ item }: { item: NewsEventRow }) {
  const currentTag = parseNewsTag(item.tags[0] ?? "other") ?? "other";
  return (
    <li className="border border-border px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span>
          {item.published_at} · {item.source}
        </span>
        {item.tags.map((tag) => (
          <Badge
            key={`${item.id ?? item.title}-${tag}`}
            variant="outline"
            className="rounded-none font-mono text-[10px]"
          >
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
            <Input name="title" defaultValue={item.title} className="h-8 rounded-none text-xs" />
            <TagSelect
              name="tag"
              defaultValue={currentTag}
              className="h-8 rounded-none border border-input bg-transparent px-2 font-mono text-xs dark:bg-input/30"
            />
            <Button size="sm" variant="outline" type="submit" className="rounded-none">
              수정
            </Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="delete-news" />
            <input type="hidden" name="id" value={item.id} />
            <Button size="sm" variant="destructive" type="submit" className="rounded-none">
              삭제
            </Button>
          </Form>
        </div>
      ) : null}
    </li>
  );
}
