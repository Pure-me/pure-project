-- ============================================================
-- Pure Project — Initial Supabase Schema
-- Compatible with: PostgreSQL 15+ (Supabase)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for full-text search

-- ─── Helper: updated_at trigger ──────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─── Short-ID counters ────────────────────────────────────────
create table if not exists counters (
  prefix text primary key,
  value  integer not null default 0
);

insert into counters (prefix, value) values
  ('PRJ', 0), ('MES', 0), ('ACT', 0), ('TSK', 0), ('MIL', 0),
  ('NC', 0), ('IMP', 0), ('AUD', 0), ('CAPA', 0), ('KPI', 0),
  ('CAT', 0), ('BCM', 0), ('CAPAF', 0)
on conflict (prefix) do nothing;

create or replace function next_short_id(prefix text)
returns text as $$
declare
  next_val integer;
begin
  update counters set value = value + 1 where counters.prefix = next_short_id.prefix
  returning value into next_val;
  return next_short_id.prefix || '-' || lpad(next_val::text, 3, '0');
end;
$$ language plpgsql;

-- ─── Profiles (extends Supabase auth.users) ──────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        text not null default 'member' check (role in ('admin', 'manager', 'member')),
  avatar_url  text,
  language    text not null default 'nl' check (language in ('nl', 'en')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Row Level Security
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ─── Categories ───────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  short_id    text unique,
  name        text not null,
  type        text not null default 'other' check (type in ('workstream', 'department', 'other')),
  color       text not null default '#6366f1',
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

alter table categories enable row level security;
create policy "Authenticated users can read categories" on categories for select using (auth.role() = 'authenticated');
create policy "Admins/managers can write categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'manager'))
);

-- ─── Projects ─────────────────────────────────────────────────
create table if not exists projects (
  id           uuid primary key default uuid_generate_v4(),
  short_id     text unique,
  name         text not null,
  description  text not null default '',
  status       text not null default 'planning' check (status in ('planning','active','on_hold','completed','cancelled')),
  priority     text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category_id  uuid references categories(id) on delete set null,
  owner_id     uuid references profiles(id) on delete set null,
  team_members uuid[] not null default '{}',
  start_date   date,
  end_date     date,
  progress     integer not null default 0 check (progress >= 0 and progress <= 100),
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

alter table projects enable row level security;
create policy "Authenticated users can read projects" on projects for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write projects" on projects for all using (auth.role() = 'authenticated');

-- ─── Work Items (Measures / Actions / Tasks / Milestones) ─────
create table if not exists work_items (
  id             uuid primary key default uuid_generate_v4(),
  short_id       text unique,
  type           text not null check (type in ('measure','action','task','milestone')),
  title          text not null,
  description    text not null default '',
  status         text not null default 'todo' check (status in ('todo','in_progress','review','done','blocked')),
  priority       text not null default 'medium' check (priority in ('low','medium','high','critical')),
  project_id     uuid references projects(id) on delete cascade,
  parent_type    text check (parent_type in ('project','measure','action','non_conformity','bcm')),
  parent_id      uuid,
  linked_to_type text check (linked_to_type in ('non_conformity','bcm')),
  linked_to_id   uuid,
  category_id    uuid references categories(id) on delete set null,
  assignee_id    uuid references profiles(id) on delete set null,
  due_date       date,
  completed_at   timestamptz,
  tags           text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on work_items (project_id);
create index on work_items (parent_id);
create index on work_items (status);
create index on work_items (type);

create trigger work_items_updated_at
  before update on work_items
  for each row execute function set_updated_at();

alter table work_items enable row level security;
create policy "Authenticated users can read work_items" on work_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write work_items" on work_items for all using (auth.role() = 'authenticated');

-- ─── Quality Items ────────────────────────────────────────────
create table if not exists quality_items (
  id                   uuid primary key default uuid_generate_v4(),
  short_id             text unique,
  type                 text not null check (type in ('non_conformity','improvement','audit_finding','capa','kpi')),
  title                text not null,
  description          text not null default '',
  status               text not null default 'open' check (status in ('open','in_progress','closed','verified')),
  priority             text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category_id          uuid references categories(id) on delete set null,
  project_id           uuid references projects(id) on delete set null,
  owner_id             uuid references profiles(id) on delete set null,
  due_date             date,
  closed_at            timestamptz,
  root_cause           text,
  corrective_action    text,
  preventive_action    text,
  tags                 text[] not null default '{}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index on quality_items (type);
create index on quality_items (status);
create index on quality_items (project_id);

create trigger quality_items_updated_at
  before update on quality_items
  for each row execute function set_updated_at();

alter table quality_items enable row level security;
create policy "Authenticated users can read quality_items" on quality_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write quality_items" on quality_items for all using (auth.role() = 'authenticated');

-- ─── BCM Items ────────────────────────────────────────────────
create table if not exists bcm_items (
  id               uuid primary key default uuid_generate_v4(),
  short_id         text unique,
  type             text not null check (type in ('risk','threat','continuity_plan','recovery_plan','exercise','bcp_action')),
  title            text not null,
  description      text not null default '',
  status           text not null default 'identified' check (status in ('identified','assessed','mitigated','accepted','closed')),
  priority         text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category_id      uuid references categories(id) on delete set null,
  owner_id         uuid references profiles(id) on delete set null,
  probability      integer check (probability between 1 and 5),
  impact           integer check (impact between 1 and 5),
  rto_hours        integer,   -- Recovery Time Objective in hours
  rpo_hours        integer,   -- Recovery Point Objective in hours
  due_date         date,
  review_date      date,
  tags             text[] not null default '{}',
  link             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index on bcm_items (type);
create index on bcm_items (status);

create trigger bcm_items_updated_at
  before update on bcm_items
  for each row execute function set_updated_at();

alter table bcm_items enable row level security;
create policy "Authenticated users can read bcm_items" on bcm_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write bcm_items" on bcm_items for all using (auth.role() = 'authenticated');

-- ─── CAPAs ────────────────────────────────────────────────────
create table if not exists capas (
  id                            uuid primary key default uuid_generate_v4(),
  short_id                      text unique,
  stage                         text not null default 'initiation' check (stage in ('initiation','risk_assessment','correction','rca','action_plan','verification','closure')),
  status                        text not null default 'open' check (status in ('open','in_progress','verification','closed','unsuccessful')),
  -- Part 1
  initiation_date               date not null default current_date,
  initiated_by                  uuid references profiles(id) on delete set null,
  initiated_by_name             text not null default '',
  initiated_by_job_title        text not null default '',
  department                    text not null default '',
  scope                         text not null default '',
  category_id                   uuid references categories(id) on delete set null,
  source                        text not null default 'internal_audit' check (source in ('customer_complaint','external_audit','external_supplier','incident','internal_audit','management_review','process_issue','reportable_event','other')),
  source_reference              text not null default '',
  source_other_description      text,
  nonconformity_description     text not null default '',
  owner_name                    text not null default '',
  owner_job_title               text not null default '',
  assignment_date               date,
  plan_due_date                 date,
  capa_team                     text not null default '',
  -- Part 2
  risk_customer                 text not null default '',
  risk_company                  text not null default '',
  risk_process                  text not null default '',
  correction                    text not null default '',
  correction_due_date           date,
  rca_methods                   text[] not null default '{}',
  rca_method_other              text,
  rca_description               text not null default '',
  root_cause                    text not null default '',
  action_plan_type              text not null default '' check (action_plan_type in ('corrective','preventive','')),
  -- Part 3
  verification_plan             text not null default '',
  verification_responsible_name text not null default '',
  verification_start_date       date,
  -- Part 4
  conclusion                    text not null default '',
  validation_confirmed          boolean not null default false,
  is_successful                 boolean,
  new_capa_id                   uuid references capas(id) on delete set null,
  closure_date                  date,
  closed_by_name                text,
  closed_by_job_title           text,
  -- Cross-link
  linked_quality_item_id        uuid references quality_items(id) on delete set null,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

create index on capas (status);
create index on capas (stage);

create trigger capas_updated_at
  before update on capas
  for each row execute function set_updated_at();

alter table capas enable row level security;
create policy "Authenticated users can read capas" on capas for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write capas" on capas for all using (auth.role() = 'authenticated');

-- ─── CAPA Actions ─────────────────────────────────────────────
create table if not exists capa_actions (
  id               uuid primary key default uuid_generate_v4(),
  capa_id          uuid not null references capas(id) on delete cascade,
  description      text not null default '',
  owner_name       text not null default '',
  owner_job_title  text,
  due_date         date,
  completed_date   date,
  status           text not null default 'open' check (status in ('open','in_progress','completed')),
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index on capa_actions (capa_id);

create trigger capa_actions_updated_at
  before update on capa_actions
  for each row execute function set_updated_at();

alter table capa_actions enable row level security;
create policy "Authenticated users can read capa_actions" on capa_actions for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write capa_actions" on capa_actions for all using (auth.role() = 'authenticated');

-- ─── CAPA Verification Checks ─────────────────────────────────
create table if not exists capa_verification_checks (
  id            uuid primary key default uuid_generate_v4(),
  capa_id       uuid not null references capas(id) on delete cascade,
  check_number  integer not null check (check_number in (1, 2, 3)),
  description   text not null default '',
  method        text not null default 'meeting',
  method_other  text,
  date_done     date,
  verdict       text check (verdict in ('ok','not_ok')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(capa_id, check_number)
);

create index on capa_verification_checks (capa_id);

alter table capa_verification_checks enable row level security;
create policy "Authenticated users can read capa_verification_checks" on capa_verification_checks for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write capa_verification_checks" on capa_verification_checks for all using (auth.role() = 'authenticated');

-- ─── Comments (polymorphic) ───────────────────────────────────
create table if not exists comments (
  id          uuid primary key default uuid_generate_v4(),
  entity_type text not null check (entity_type in ('project','work_item','quality_item','bcm_item','capa')),
  entity_id   uuid not null,
  author_id   uuid references profiles(id) on delete set null,
  author_name text not null default '',
  text        text not null,
  type        text not null default 'comment' check (type in ('comment','status_change','attachment')),
  created_at  timestamptz not null default now()
);

create index on comments (entity_type, entity_id);
create index on comments (created_at);

alter table comments enable row level security;
create policy "Authenticated users can read comments" on comments for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write comments" on comments for all using (auth.role() = 'authenticated');

-- ─── Attachments (polymorphic) ────────────────────────────────
create table if not exists attachments (
  id               uuid primary key default uuid_generate_v4(),
  entity_type      text not null check (entity_type in ('project','work_item','quality_item','bcm_item','capa')),
  entity_id        uuid not null,
  filename         text not null,
  stored_name      text not null,
  mime_type        text not null,
  size_bytes       bigint not null default 0,
  storage_path     text not null,   -- Supabase Storage path
  url              text not null,   -- public URL
  uploaded_by      uuid references profiles(id) on delete set null,
  uploaded_by_name text not null default '',
  created_at       timestamptz not null default now()
);

create index on attachments (entity_type, entity_id);

alter table attachments enable row level security;
create policy "Authenticated users can read attachments" on attachments for select using (auth.role() = 'authenticated');
create policy "Authenticated users can write attachments" on attachments for all using (auth.role() = 'authenticated');

-- ─── Notifications ────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text not null default '',
  entity_type text,
  entity_id   uuid,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index on notifications (user_id, read);
create index on notifications (created_at);

alter table notifications enable row level security;
create policy "Users can read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert with check (true);

-- ─── Supabase Storage bucket (run via dashboard or CLI) ───────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- ─── Realtime publications ────────────────────────────────────
-- Enable realtime for key tables
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table work_items;
alter publication supabase_realtime add table notifications;

-- ─── Profile auto-creation on signup ─────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
