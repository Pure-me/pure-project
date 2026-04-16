-- ============================================================
-- Pure Project — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";


-- ── 1. PROFILES (users) ─────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text,
  role          text not null default 'member' check (role in ('admin','manager','member')),
  avatar        text,
  language      text default 'nl' check (language in ('nl','en')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- ── 2. CATEGORIES ───────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  short_id    text not null unique,
  name        text not null,
  type        text not null default 'workstream' check (type in ('workstream','department','other')),
  color       text not null default '#3b82f6',
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ── 3. PROJECTS ─────────────────────────────────────────────
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  short_id     text not null unique,
  name         text not null,
  description  text,
  status       text not null default 'active' check (status in ('planning','active','on_hold','completed','cancelled')),
  priority     text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category_id  uuid references categories(id) on delete set null,
  owner_id     uuid references profiles(id) on delete set null,
  team_members text[] not null default '{}',
  start_date   timestamptz,
  end_date     timestamptz,
  progress     integer not null default 0 check (progress >= 0 and progress <= 100),
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- ── 4. WORK ITEMS (tasks / measures / actions / milestones) ─
create table if not exists work_items (
  id           uuid primary key default gen_random_uuid(),
  short_id     text not null unique,
  project_id   uuid not null references projects(id) on delete cascade,
  parent_id    uuid references work_items(id) on delete cascade,
  type         text not null default 'task' check (type in ('measure','action','task','milestone')),
  title        text not null,
  description  text,
  status       text not null default 'todo' check (status in ('todo','in_progress','review','done','blocked')),
  priority     text not null default 'medium' check (priority in ('low','medium','high','critical')),
  assignee_id  uuid references profiles(id) on delete set null,
  due_date     timestamptz,
  start_date   timestamptz,
  progress     integer not null default 0 check (progress >= 0 and progress <= 100),
  tags         text[] not null default '{}',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- ── 5. QUALITY ITEMS ────────────────────────────────────────
create table if not exists quality_items (
  id               uuid primary key default gen_random_uuid(),
  short_id         text not null unique,
  type             text not null default 'non_conformity' check (type in ('non_conformity','improvement','audit_finding','kpi')),
  title            text not null,
  description      text,
  status           text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority         text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category_id      uuid references categories(id) on delete set null,
  assignee_id      uuid references profiles(id) on delete set null,
  due_date         timestamptz,
  root_cause       text,
  corrective_action text,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);


-- ── 6. BCM ITEMS (Business Continuity) ──────────────────────
create table if not exists bcm_items (
  id              uuid primary key default gen_random_uuid(),
  short_id        text not null unique,
  type            text not null default 'risk' check (type in ('risk','measure','scenario','asset')),
  title           text not null,
  description     text,
  status          text not null default 'identified' check (status in ('identified','assessing','mitigating','accepted','resolved')),
  probability     integer not null default 3 check (probability >= 1 and probability <= 5),
  impact          integer not null default 3 check (impact >= 1 and impact <= 5),
  category_id     uuid references categories(id) on delete set null,
  assignee_id     uuid references profiles(id) on delete set null,
  due_date        timestamptz,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ── 7. CAPAS (Corrective & Preventive Actions) ──────────────
create table if not exists capas (
  id                  uuid primary key default gen_random_uuid(),
  short_id            text not null unique,
  title               text not null,
  description         text,
  type                text not null default 'corrective' check (type in ('corrective','preventive','improvement')),
  status              text not null default 'open' check (status in ('open','in_progress','verification','closed','cancelled')),
  priority            text not null default 'medium' check (priority in ('low','medium','high','critical')),
  source              text,
  source_ref          text,
  root_cause          text,
  category_id         uuid references categories(id) on delete set null,
  assignee_id         uuid references profiles(id) on delete set null,
  due_date            timestamptz,
  closed_at           timestamptz,
  effectiveness_score integer check (effectiveness_score >= 1 and effectiveness_score <= 5),
  tags                text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists capa_actions (
  id          uuid primary key default gen_random_uuid(),
  capa_id     uuid not null references capas(id) on delete cascade,
  title       text not null,
  description text,
  status      text not null default 'todo' check (status in ('todo','in_progress','done')),
  assignee_id uuid references profiles(id) on delete set null,
  due_date    timestamptz,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists capa_verification_checks (
  id           uuid primary key default gen_random_uuid(),
  capa_id      uuid not null references capas(id) on delete cascade,
  check_number integer not null default 1,
  description  text not null,
  passed       boolean,
  checked_at   timestamptz,
  checked_by   uuid references profiles(id) on delete set null,
  notes        text,
  created_at   timestamptz not null default now()
);


-- ── 8. COMMENTS ─────────────────────────────────────────────
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,   -- 'project' | 'work_item' | 'quality_item' | 'bcm_item' | 'capa'
  entity_id   uuid not null,
  author_id   uuid references profiles(id) on delete set null,
  author_name text not null,
  text        text not null,
  type        text not null default 'comment' check (type in ('comment','status_change','attachment')),
  created_at  timestamptz not null default now()
);

create index if not exists comments_entity_idx on comments(entity_type, entity_id);


-- ── 9. ATTACHMENTS ──────────────────────────────────────────
create table if not exists attachments (
  id               uuid primary key default gen_random_uuid(),
  entity_type      text not null,
  entity_id        uuid not null,
  filename         text not null,
  stored_name      text not null,
  mime_type        text not null,
  size             bigint not null default 0,
  url              text not null,
  uploaded_by      uuid references profiles(id) on delete set null,
  uploaded_by_name text not null,
  created_at       timestamptz not null default now()
);

create index if not exists attachments_entity_idx on attachments(entity_type, entity_id);


-- ── 10. NOTIFICATIONS ───────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text,
  entity_type text,
  entity_id   uuid,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications(user_id, read);


-- ── 11. ROW LEVEL SECURITY (optioneel maar aanbevolen) ──────
-- Zet RLS uit voor intern gebruik (geen public signup):
alter table profiles               disable row level security;
alter table categories             disable row level security;
alter table projects               disable row level security;
alter table work_items             disable row level security;
alter table quality_items          disable row level security;
alter table bcm_items              disable row level security;
alter table capas                  disable row level security;
alter table capa_actions           disable row level security;
alter table capa_verification_checks disable row level security;
alter table comments               disable row level security;
alter table attachments            disable row level security;
alter table notifications          disable row level security;


-- ── 12. EERSTE ADMIN GEBRUIKER ──────────────────────────────
-- Pas naam/email aan naar jouw gegevens, wachtwoord via Supabase Auth
insert into profiles (id, name, email, role)
values (gen_random_uuid(), 'Admin', 'joltenfreiter@gmail.com', 'admin')
on conflict (email) do nothing;


-- ============================================================
-- Klaar! Alle 10 tabellen aangemaakt.
-- ============================================================
