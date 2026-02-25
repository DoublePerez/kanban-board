-- ============================================================
-- Kanban Board — Supabase Schema
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- ── Profiles (per-user preferences) ─────────────────────────
create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  accent_color  text        not null default 'green'
                            check (accent_color in ('green', 'orange', 'blue', 'red', 'lime')),
  user_initials text        not null default 'ME'
                            check (char_length(user_initials) between 1 and 3),
  active_project_id uuid,   -- FK added after projects table exists
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Projects (boards) ───────────────────────────────────────
create table public.projects (
  id                    uuid        primary key default uuid_generate_v4(),
  user_id               uuid        not null references auth.users(id) on delete cascade,
  name                  text        not null check (char_length(name) <= 50),
  columns               jsonb       not null default '[
    {"id": "todo",        "title": "To Do"},
    {"id": "in-progress", "title": "In Progress"},
    {"id": "done",        "title": "Done"}
  ]'::jsonb,
  background_image_path text,       -- Supabase Storage path, not base64
  position              integer     not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_projects_user_id on public.projects(user_id);

-- Now add the FK from profiles → projects
alter table public.profiles
  add constraint fk_profiles_active_project
  foreign key (active_project_id)
  references public.projects(id)
  on delete set null;

-- ── Tasks (kanban cards) ────────────────────────────────────
create table public.tasks (
  id          uuid        primary key default uuid_generate_v4(),
  project_id  uuid        not null references public.projects(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null check (char_length(title) <= 200),
  description text        not null default '' check (char_length(description) <= 1000),
  priority    text        not null default 'Medium'
                          check (priority in ('High', 'Medium', 'Low')),
  date        text        not null,           -- display date e.g. "Feb 24"
  due_date    date,                           -- ISO date, nullable
  column_id   text        not null default 'todo',
  subtasks    jsonb       not null default '[]'::jsonb,
  position    integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_tasks_project_id on public.tasks(project_id);
create index idx_tasks_user_id    on public.tasks(user_id);
create index idx_tasks_column     on public.tasks(project_id, column_id);

-- ── Deleted Tasks (undo buffer) ─────────────────────────────
create table public.deleted_tasks (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  original_project_id uuid,       -- may be null if project was also deleted
  task_snapshot       jsonb       not null,
  deleted_at          timestamptz not null default now()
);

create index idx_deleted_tasks_user_id on public.deleted_tasks(user_id);

-- ── Deleted Projects (undo buffer) ──────────────────────────
create table public.deleted_projects (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  project_snapshot jsonb       not null,
  deleted_at       timestamptz not null default now()
);

create index idx_deleted_projects_user_id on public.deleted_projects(user_id);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at();

-- ============================================================
-- TRIGGER — auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.projects         enable row level security;
alter table public.tasks            enable row level security;
alter table public.deleted_tasks    enable row level security;
alter table public.deleted_projects enable row level security;

-- ── Profiles ────────────────────────────────────────────────
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- ── Projects ────────────────────────────────────────────────
create policy "Users can read own projects"
  on public.projects for select
  using (user_id = auth.uid());

create policy "Users can insert own projects"
  on public.projects for insert
  with check (user_id = auth.uid());

create policy "Users can update own projects"
  on public.projects for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own projects"
  on public.projects for delete
  using (user_id = auth.uid());

-- ── Tasks ───────────────────────────────────────────────────
create policy "Users can read own tasks"
  on public.tasks for select
  using (user_id = auth.uid());

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (user_id = auth.uid());

create policy "Users can update own tasks"
  on public.tasks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (user_id = auth.uid());

-- ── Deleted Tasks ───────────────────────────────────────────
create policy "Users can read own deleted tasks"
  on public.deleted_tasks for select
  using (user_id = auth.uid());

create policy "Users can insert own deleted tasks"
  on public.deleted_tasks for insert
  with check (user_id = auth.uid());

create policy "Users can delete own deleted tasks"
  on public.deleted_tasks for delete
  using (user_id = auth.uid());

-- ── Deleted Projects ────────────────────────────────────────
create policy "Users can read own deleted projects"
  on public.deleted_projects for select
  using (user_id = auth.uid());

create policy "Users can insert own deleted projects"
  on public.deleted_projects for insert
  with check (user_id = auth.uid());

create policy "Users can delete own deleted projects"
  on public.deleted_projects for delete
  using (user_id = auth.uid());

-- ============================================================
-- STORAGE — background images bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', false);

-- Users can upload to their own folder: backgrounds/{user_id}/*
create policy "Users can upload own backgrounds"
  on storage.objects for insert
  with check (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own backgrounds"
  on storage.objects for select
  using (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own backgrounds"
  on storage.objects for update
  using (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own backgrounds"
  on storage.objects for delete
  using (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
