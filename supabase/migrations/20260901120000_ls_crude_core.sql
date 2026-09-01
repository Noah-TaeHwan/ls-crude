-- LS CRUDE core tables. Apply in the linked Supabase project.
-- Prices come from Yahoo; news narrative from Investing.com CSV.

create table if not exists public.daily_features (
  date date primary key,
  ticker text not null default 'CL=F',
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  volume numeric,
  rsi_14 numeric,
  slice_score numeric,
  slice_z numeric,
  hormuz_count numeric,
  inflation_count numeric,
  sample text not null check (sample in ('in', 'out')),
  rsi_position text check (rsi_position in ('long', 'flat', 'short')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_events (
  id uuid primary key default gen_random_uuid(),
  published_at date not null,
  title text not null,
  url text,
  source text not null default 'investing.com',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hypothesis text,
  notes text,
  used_out_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_events_published_at_idx
  on public.news_events (published_at desc);

alter table public.daily_features enable row level security;
alter table public.news_events enable row level security;
alter table public.experiments enable row level security;

create policy "public read daily_features"
  on public.daily_features
  for select
  to anon, authenticated
  using (true);

create policy "public read news_events"
  on public.news_events
  for select
  to anon, authenticated
  using (true);

create policy "public read experiments"
  on public.experiments
  for select
  to anon, authenticated
  using (true);

create policy "authenticated write news_events"
  on public.news_events
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated write experiments"
  on public.experiments
  for all
  to authenticated
  using (true)
  with check (true);

-- Server upserts of Yahoo panels use the service role, which bypasses RLS.
