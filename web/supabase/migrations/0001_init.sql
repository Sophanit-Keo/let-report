-- Let Report: database schema for Supabase (Postgres).
-- Run once on a new Supabase project (SQL editor, or the Supabase connector/CLI).

-- ───────────── Profiles: one row per signed-in person ─────────────
create type public.app_role as enum ('qc', 'qa', 'supervisor', 'manager');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  role        public.app_role not null default 'qc',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- The signed-in user's role (used by the security rules below).
create or replace function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- New account → profile. The very first account becomes the plant manager; everyone else starts as QC.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    case when exists (select 1 from public.profiles) then 'qc'::public.app_role else 'manager'::public.app_role end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only a manager may change someone's role.
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and coalesce(public.my_role()::text, '') <> 'manager' then
    raise exception 'Only a plant manager can change roles';
  end if;
  return new;
end $$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_role_change();

-- ───────────── Reports ─────────────
create sequence public.report_no start 1043;

create table public.reports (
  id              text primary key default 'TR-' || nextval('public.report_no'),
  title           text not null,
  cat             text not null,                       -- temperature, hygiene, foreign, pest, equipment, allergen, labelling, cleaning, custom
  sev             smallint not null check (sev between 0 and 3),   -- 0 low … 3 critical
  status          text not null default 'open' check (status in ('open', 'action', 'verify', 'closed')),
  level           public.app_role not null default 'qc',           -- who handles it now (escalation ladder)
  loc             text not null default '',
  by_id           uuid references public.profiles (id) on delete set null default auth.uid(),
  by_name         text not null default '',
  photo_path      text,                                -- storage: photos bucket
  signature_path  text,
  signed_at       timestamptz,
  ptype           text not null default '',
  pname           text not null default '',
  lot             text not null default '',
  qty             text not null default '',
  unit            text not null default 'pcs',
  hold            boolean not null default false,
  hold_check      jsonb,                               -- {type, days, owner, status, dueAt, history[], note, decider}
  urgent          boolean not null default false,
  support         text[] not null default '{}',
  description     text not null default '',
  action          text not null default '',
  suggestion      text not null default '',
  voice           boolean not null default false,
  capa            jsonb,                               -- corrective action {root, text, owner, due, overdue}
  needs_approval  boolean not null default false,
  tl              jsonb not null default '[]',         -- activity: [[kind, who, isoTime, detail?], …]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index reports_created_at_idx on public.reports (created_at desc);
create index reports_status_idx on public.reports (status);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger reports_touch before update on public.reports
  for each row execute function public.touch_updated_at();

-- ───────────── Alerts (notifications) ─────────────
create table public.notifications (
  id          bigint generated always as identity primary key,
  report_id   text references public.reports (id) on delete cascade,
  icon        text not null default 'bell',
  tone        text not null default 'blue' check (tone in ('red', 'blue', 'green', 'amber')),
  text        text not null,
  roles       public.app_role[] not null,              -- who sees it
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now()
);
create index notifications_created_at_idx on public.notifications (created_at desc);

create table public.notification_reads (
  user_id          uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  notification_id  bigint not null references public.notifications (id) on delete cascade,
  read_at          timestamptz not null default now(),
  primary key (user_id, notification_id)
);

-- ───────────── Daily checklist ticks (per person, per day) ─────────────
create table public.checklist_ticks (
  user_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day      date not null default current_date,
  item     smallint not null,
  primary key (user_id, day, item)
);

-- ───────────── Row-level security ─────────────
alter table public.profiles           enable row level security;
alter table public.reports            enable row level security;
alter table public.notifications      enable row level security;
alter table public.notification_reads enable row level security;
alter table public.checklist_ticks    enable row level security;

-- profiles: staff can see each other; you edit your own; managers edit anyone (role change guarded above)
create policy "profiles: read" on public.profiles for select to authenticated using (true);
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid() or public.my_role() = 'manager') with check (id = auth.uid() or public.my_role() = 'manager');

-- reports: all staff read and work on reports; you can only file a report as yourself; managers delete
create policy "reports: read" on public.reports for select to authenticated using (true);
create policy "reports: create as self" on public.reports for insert to authenticated with check (by_id = auth.uid());
create policy "reports: update" on public.reports for update to authenticated using (true) with check (true);
create policy "reports: manager delete" on public.reports for delete to authenticated using (public.my_role() = 'manager');

-- alerts: you see the ones for your role (or that you sent)
create policy "alerts: read for my role" on public.notifications for select to authenticated
  using (public.my_role() = any (roles) or created_by = auth.uid());
create policy "alerts: create" on public.notifications for insert to authenticated with check (created_by = auth.uid());

create policy "reads: own" on public.notification_reads for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ticks: own" on public.checklist_ticks for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ───────────── Photo + signature storage (private bucket) ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "photos: staff read" on storage.objects for select to authenticated using (bucket_id = 'photos');
create policy "photos: staff upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
