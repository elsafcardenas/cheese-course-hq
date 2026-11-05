-- The Cheese Course HQ: schema, roles and row level security.
-- Run once in the Supabase SQL editor (or with `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- People and roles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null default '',
  name text not null default '',
  -- null = signed up without an invite: no access until an admin gives them a role.
  role text check (role in ('admin', 'editor', 'viewer', 'store_manager')),
  store text check (store in ('Weston', 'Pinecrest')),
  created_at timestamptz not null default now()
);

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.my_store() returns text
language sql stable security definer set search_path = public as $$
  select store from public.profiles where id = auth.uid()
$$;

-- New sign-ups get a profile. The very first person becomes admin; invited people get the
-- role, name and store that were set on the invite; anyone else gets no role (no access).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;
  insert into public.profiles (id, email, name, role, store)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    case when first_user then 'admin' else nullif(new.raw_user_meta_data ->> 'role', '') end,
    nullif(new.raw_user_meta_data ->> 'store', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Work tables
-- ---------------------------------------------------------------------------
create table if not exists public.meetings (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  date date,
  attendees text[] not null default '{}',
  type text not null default '',
  market text not null default 'Both',
  key_decisions text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  owner text not null default 'Elsa',
  market text not null default 'Miami',
  workstream text not null default 'Miami content',
  priority text not null default 'Medium',
  status text not null default 'To do',
  deadline date,
  notes text not null default '',
  store text,
  source_meeting text references public.meetings (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  market text not null default 'Miami',
  store text,
  date date,
  format text not null default 'Reel',
  pillar text not null default 'Menu & food',
  platforms text[] not null default '{}',
  owner text not null default 'Elsa',
  status text not null default 'Idea',
  hook text not null default '',
  footage text not null default '',
  asset_url text not null default '',
  dad_comments text not null default '',
  unlocks_at text,
  created_at timestamptz not null default now()
);

create table if not exists public.platforms (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  market text not null,
  sort_order int not null default 0,
  status text not null default 'Not created',
  access text not null default '',
  priority text not null default '',
  role text not null default '',
  handle_url text not null default '',
  opens text not null default '',
  cadence text not null default '',
  purpose text not null default '',
  checklist text not null default ''
);

create table if not exists public.decisions (
  id text primary key default gen_random_uuid()::text,
  decision text not null,
  date date,
  decided_by text not null default '',
  market text not null default 'Both',
  area text not null default '',
  status text not null default 'Open',
  source text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  market text not null,
  phase text not null default '',
  status text not null default 'Planning',
  start_date date,
  end_date date,
  goal text not null default ''
);

create table if not exists public.kpis (
  id text primary key default gen_random_uuid()::text,
  market text not null,
  platform text not null default '',
  metric text not null,
  baseline text not null default '',
  baseline_value numeric,
  target3 text not null default '',
  target3_value numeric,
  target6 text not null default '',
  target6_value numeric,
  why text not null default '',
  sort int not null default 0
);

create table if not exists public.kpi_entries (
  id text primary key default gen_random_uuid()::text,
  kpi_id text not null references public.kpis (id) on delete cascade,
  month date not null,
  value numeric not null,
  note text not null default '',
  unique (kpi_id, month)
);

create table if not exists public.video_log (
  id text primary key default gen_random_uuid()::text,
  platform text not null default 'Instagram',
  title text not null default '',
  posted_on date,
  views int not null default 0,
  likes int,
  comments int,
  saves int,
  shares int,
  pillar text,
  source text not null default 'manual' check (source in ('manual', 'meta', 'tiktok')),
  external_id text unique,
  note text not null default ''
);

create table if not exists public.assets (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  store text,
  kind text not null default 'Link',
  url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.sales_by_store (
  store text not null,
  period text not null,
  net_sales_k numeric not null,
  primary key (store, period)
);

-- ---------------------------------------------------------------------------
-- Integration data (written only by the server with the service role key)
-- ---------------------------------------------------------------------------
create table if not exists public.integrations (
  provider text primary key check (provider in ('square', 'meta', 'google', 'tiktok')),
  status text not null default 'disconnected',
  account_label text,
  connected_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  token_expires_at timestamptz
);

-- OAuth tokens. RLS is on with no policies, so no signed-in user can read them; only the
-- service role (server code) can.
create table if not exists public.integration_tokens (
  provider text primary key references public.integrations (provider) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.metrics_daily (
  provider text not null,
  entity text not null,
  metric text not null,
  date date not null,
  value numeric not null,
  primary key (provider, entity, metric, date)
);

create table if not exists public.square_item_sales (
  location text not null,
  month date not null,
  item text not null,
  quantity numeric not null default 0,
  gross_sales numeric not null default 0,
  primary key (location, month, item)
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.meetings enable row level security;
alter table public.tasks enable row level security;
alter table public.posts enable row level security;
alter table public.platforms enable row level security;
alter table public.decisions enable row level security;
alter table public.campaigns enable row level security;
alter table public.kpis enable row level security;
alter table public.kpi_entries enable row level security;
alter table public.video_log enable row level security;
alter table public.assets enable row level security;
alter table public.sales_by_store enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_tokens enable row level security;
alter table public.metrics_daily enable row level security;
alter table public.square_item_sales enable row level security;

-- Profiles: everyone on the team can see the team; only admins change roles.
create policy "team can read profiles" on public.profiles for select using (auth.uid() is not null);
create policy "admins update profiles" on public.profiles for update using (public.my_role() = 'admin') with check (public.my_role() = 'admin');
create policy "admins delete profiles" on public.profiles for delete using (public.my_role() = 'admin');

-- Read access for the whole team (store managers are narrowed on tasks and posts below).
do $$
declare t text;
begin
  foreach t in array array['meetings','platforms','decisions','campaigns','kpis','kpi_entries','video_log','assets','sales_by_store','integrations','metrics_daily','square_item_sales']
  loop
    execute format('create policy "team can read %1$s" on public.%1$I for select using (public.my_role() is not null)', t);
  end loop;
end $$;

create policy "read tasks" on public.tasks for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
  or (public.my_role() = 'store_manager' and (store = public.my_store() or store = 'Both stores'))
);
create policy "read posts" on public.posts for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
  or (public.my_role() = 'store_manager' and (store = public.my_store() or store = 'Both stores'))
);

-- Admin and editor write tasks, posts, assets, the video log and KPI entries.
do $$
declare t text;
begin
  foreach t in array array['tasks','posts','assets','video_log','kpi_entries']
  loop
    execute format('create policy "editors write %1$s" on public.%1$I for all using (public.my_role() in (''admin'',''editor'')) with check (public.my_role() in (''admin'',''editor''))', t);
  end loop;
  foreach t in array array['platforms','decisions','meetings','campaigns','kpis','sales_by_store']
  loop
    execute format('create policy "admins write %1$s" on public.%1$I for all using (public.my_role() = ''admin'') with check (public.my_role() = ''admin'')', t);
  end loop;
end $$;

-- Store managers update their own store's tasks and add footage links for their store.
create policy "store managers update their tasks" on public.tasks for update
  using (public.my_role() = 'store_manager' and (store = public.my_store() or store = 'Both stores'))
  with check (public.my_role() = 'store_manager' and (store = public.my_store() or store = 'Both stores'));
create policy "store managers add assets" on public.assets for insert
  with check (public.my_role() = 'store_manager' and store = public.my_store());

-- Ricardo (viewer) answers open decisions.
create policy "viewers answer decisions" on public.decisions for update
  using (public.my_role() = 'viewer') with check (public.my_role() = 'viewer');

-- Viewers may write one field on a post: Ricardo's comments. Done through a function so the
-- rest of the post stays read-only for them.
create or replace function public.set_dad_comment(post_id text, body text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.my_role() not in ('admin', 'editor', 'viewer') then
    raise exception 'not allowed';
  end if;
  update public.posts set dad_comments = body where id = post_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: footage uploads (private bucket)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('footage', 'footage', false)
on conflict (id) do nothing;

create policy "team can read footage" on storage.objects for select
  using (bucket_id = 'footage' and public.my_role() is not null);
create policy "uploaders add footage" on storage.objects for insert
  with check (bucket_id = 'footage' and public.my_role() in ('admin', 'editor', 'store_manager'));
create policy "admins remove footage" on storage.objects for delete
  using (bucket_id = 'footage' and public.my_role() in ('admin', 'editor'));
