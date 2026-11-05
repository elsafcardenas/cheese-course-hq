-- The Cheese Course HQ: operations, finance, customers, Madrid, documents and content review.
-- Generated from lib/schema.ts by scripts/gen-migration.ts. Run after 0001_init.sql.

create table if not exists public.stores (
  id text primary key default gen_random_uuid()::text,
  name text,
  status text,
  address text,
  phone text,
  email text,
  manager text,
  hours text,
  order_url text,
  maps_url text,
  sort_order numeric,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.stores enable row level security;
create policy "read stores" on public.stores for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
  or (public.my_role() = 'store_manager' and (name is null or name = 'Both stores' or name = public.my_store()))
);
create policy "write stores" on public.stores for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write stores" on public.stores for all using (public.my_role() = 'store_manager' and name = public.my_store()) with check (public.my_role() = 'store_manager' and name = public.my_store());

create table if not exists public.staff (
  id text primary key default gen_random_uuid()::text,
  name text,
  role text,
  store text,
  status text,
  phone text,
  email text,
  start_date date,
  availability text,
  emergency_contact text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;
create policy "read staff" on public.staff for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write staff" on public.staff for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write staff" on public.staff for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.shifts (
  id text primary key default gen_random_uuid()::text,
  staff_id text,
  store text,
  date date,
  start_time text,
  end_time text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.shifts enable row level security;
create policy "read shifts" on public.shifts for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write shifts" on public.shifts for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write shifts" on public.shifts for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.checklists (
  id text primary key default gen_random_uuid()::text,
  name text,
  frequency text,
  store text,
  items text,
  sort_order numeric,
  created_at timestamptz not null default now()
);
alter table public.checklists enable row level security;
create policy "read checklists" on public.checklists for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write checklists" on public.checklists for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.checklist_runs (
  id text primary key default gen_random_uuid()::text,
  checklist_id text,
  store text,
  date date,
  done text,
  completed_by text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.checklist_runs enable row level security;
create policy "read checklist_runs" on public.checklist_runs for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write checklist_runs" on public.checklist_runs for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write checklist_runs" on public.checklist_runs for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.maintenance (
  id text primary key default gen_random_uuid()::text,
  title text,
  store text,
  area text,
  priority text,
  status text,
  reported_on date,
  reported_by text,
  vendor text,
  cost numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.maintenance enable row level security;
create policy "read maintenance" on public.maintenance for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write maintenance" on public.maintenance for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write maintenance" on public.maintenance for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.catering_orders (
  id text primary key default gen_random_uuid()::text,
  customer text,
  status text,
  store text,
  event_date date,
  pickup_time text,
  guests numeric,
  items text,
  total numeric(12,2),
  deposit numeric(12,2),
  payment text,
  phone text,
  email text,
  source text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.catering_orders enable row level security;
create policy "read catering_orders" on public.catering_orders for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write catering_orders" on public.catering_orders for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write catering_orders" on public.catering_orders for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.suppliers (
  id text primary key default gen_random_uuid()::text,
  name text,
  category text,
  contact text,
  phone text,
  email text,
  order_days text,
  lead_time_days numeric,
  min_order numeric(12,2),
  terms text,
  website text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.suppliers enable row level security;
create policy "read suppliers" on public.suppliers for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and true)
);
create policy "write suppliers" on public.suppliers for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.inventory_items (
  id text primary key default gen_random_uuid()::text,
  name text,
  category text,
  store text,
  supplier_id text,
  unit text,
  on_hand numeric,
  par numeric,
  reorder_qty numeric,
  unit_cost numeric(12,2),
  last_counted date,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.inventory_items enable row level security;
create policy "read inventory_items" on public.inventory_items for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write inventory_items" on public.inventory_items for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write inventory_items" on public.inventory_items for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.purchase_orders (
  id text primary key default gen_random_uuid()::text,
  reference text,
  supplier_id text,
  store text,
  status text,
  order_date date,
  expected_date date,
  items text,
  total numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.purchase_orders enable row level security;
create policy "read purchase_orders" on public.purchase_orders for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write purchase_orders" on public.purchase_orders for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write purchase_orders" on public.purchase_orders for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.waste_log (
  id text primary key default gen_random_uuid()::text,
  date date,
  store text,
  item text,
  quantity text,
  reason text,
  cost numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.waste_log enable row level security;
create policy "read waste_log" on public.waste_log for select using (
  public.my_role() in ('admin', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write waste_log" on public.waste_log for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));
create policy "managers write waste_log" on public.waste_log for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.menu_items (
  id text primary key default gen_random_uuid()::text,
  name text,
  section text,
  category text,
  price numeric(12,2),
  food_cost numeric(12,2),
  serves text,
  size text,
  code text,
  status text,
  availability text,
  market text,
  description text,
  recipe text,
  allergens text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.menu_items enable row level security;
create policy "read menu_items" on public.menu_items for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
  or (public.my_role() = 'store_manager' and true)
);
create policy "write menu_items" on public.menu_items for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.expenses (
  id text primary key default gen_random_uuid()::text,
  date date,
  vendor text,
  category text,
  store text,
  amount numeric(12,2),
  recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "read expenses" on public.expenses for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write expenses" on public.expenses for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.budget_lines (
  id text primary key default gen_random_uuid()::text,
  month date,
  category text,
  store text,
  amount numeric(12,2),
  created_at timestamptz not null default now()
);
alter table public.budget_lines enable row level security;
create policy "read budget_lines" on public.budget_lines for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write budget_lines" on public.budget_lines for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.sales_monthly (
  id text primary key default gen_random_uuid()::text,
  month date,
  store text,
  net_sales numeric(12,2),
  orders numeric,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.sales_monthly enable row level security;
create policy "read sales_monthly" on public.sales_monthly for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write sales_monthly" on public.sales_monthly for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.reviews (
  id text primary key default gen_random_uuid()::text,
  date date,
  source text,
  store text,
  type text,
  rating numeric,
  author text,
  text text,
  status text,
  response text,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "read reviews" on public.reviews for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write reviews" on public.reviews for all using (public.my_role() in ('admin', 'editor')) with check (public.my_role() in ('admin', 'editor'));
create policy "managers write reviews" on public.reviews for all using (public.my_role() = 'store_manager' and store = public.my_store()) with check (public.my_role() = 'store_manager' and store = public.my_store());

create table if not exists public.madrid_locations (
  id text primary key default gen_random_uuid()::text,
  area text,
  status text,
  address text,
  link text,
  size_m2 numeric,
  rent numeric,
  licence text,
  pros text,
  cons text,
  sort_order numeric,
  created_at timestamptz not null default now()
);
alter table public.madrid_locations enable row level security;
create policy "read madrid_locations" on public.madrid_locations for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write madrid_locations" on public.madrid_locations for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.madrid_milestones (
  id text primary key default gen_random_uuid()::text,
  title text,
  phase text,
  due date,
  status text,
  owner text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.madrid_milestones enable row level security;
create policy "read madrid_milestones" on public.madrid_milestones for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write madrid_milestones" on public.madrid_milestones for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.madrid_budget (
  id text primary key default gen_random_uuid()::text,
  item text,
  category text,
  estimate numeric,
  actual numeric,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.madrid_budget enable row level security;
create policy "read madrid_budget" on public.madrid_budget for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write madrid_budget" on public.madrid_budget for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.madrid_contacts (
  id text primary key default gen_random_uuid()::text,
  name text,
  role text,
  status text,
  company text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.madrid_contacts enable row level security;
create policy "read madrid_contacts" on public.madrid_contacts for select using (
  public.my_role() in ('admin', 'viewer')
);
create policy "write madrid_contacts" on public.madrid_contacts for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.docs (
  id text primary key default gen_random_uuid()::text,
  title text,
  category text,
  market text,
  store text,
  url text,
  body text,
  owner text,
  updated_on date,
  created_at timestamptz not null default now()
);
alter table public.docs enable row level security;
create policy "read docs" on public.docs for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
  or (public.my_role() = 'store_manager' and (store is null or store = 'Both stores' or store = public.my_store()))
);
create policy "write docs" on public.docs for all using (public.my_role() in ('admin', 'editor')) with check (public.my_role() in ('admin', 'editor'));

create table if not exists public.initiatives (
  id text primary key default gen_random_uuid()::text,
  name text,
  kind text,
  status text,
  owner text,
  start_date date,
  end_date date,
  market text,
  goal text,
  audience text,
  channels text,
  measure text,
  budget numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.initiatives enable row level security;
create policy "read initiatives" on public.initiatives for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
);
create policy "write initiatives" on public.initiatives for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.initiative_steps (
  id text primary key default gen_random_uuid()::text,
  title text,
  initiative text,
  parent text,
  owner text,
  status text,
  start_date date,
  end_date date,
  sort_order numeric,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.initiative_steps enable row level security;
create policy "read initiative_steps" on public.initiative_steps for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
);
create policy "write initiative_steps" on public.initiative_steps for all using (public.my_role() in ('admin')) with check (public.my_role() in ('admin'));

create table if not exists public.content_reviews (
  id text primary key default gen_random_uuid()::text,
  title text,
  kind text,
  format text,
  status text,
  market text,
  submitted_by text,
  due date,
  version numeric,
  preview_url text,
  asset_url text,
  copy text,
  post_id text,
  created_at timestamptz not null default now()
);
alter table public.content_reviews enable row level security;
create policy "read content_reviews" on public.content_reviews for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
);
create policy "write content_reviews" on public.content_reviews for all using (public.my_role() in ('admin', 'editor')) with check (public.my_role() in ('admin', 'editor'));

create table if not exists public.review_comments (
  id text primary key default gen_random_uuid()::text,
  review_id text,
  author text,
  action text,
  body text,
  created_at text,
  created_at timestamptz not null default now()
);
alter table public.review_comments enable row level security;
create policy "read review_comments" on public.review_comments for select using (
  public.my_role() in ('admin', 'editor', 'viewer')
);
create policy "write review_comments" on public.review_comments for all using (public.my_role() in ('admin', 'editor', 'viewer')) with check (public.my_role() in ('admin', 'editor', 'viewer'));

