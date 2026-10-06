-- Let Report: lot details with events, a change log, and an editable production plan.
--
-- 1. A lot record now exists from the moment the lot starts (ended_at stays empty while it runs),
--    and the line points to it (current_lot_id).
-- 2. lot_events: what happened during a lot (start, status changes, CIP filling, continue, finish, notes).
--    Everyone can add, edit and delete events.
-- 3. lot_log: every create, edit and delete of a lot, an event or the production plan is written here
--    by the database itself (triggers). Nobody can change or delete the log.
-- 4. factory_settings: the production plan (run choices, maximum run, CIP times) is editable in the app
--    by supervisors and the plant manager.

-- ───────────── 1. Lot record from the start ─────────────
alter table public.line_lots alter column ended_at drop not null;
alter table public.line_lots alter column ended_at drop default;
alter table public.line_lots add column if not exists started_by_name text not null default '';
alter table public.line_lots add column if not exists updated_at timestamptz not null default now();
alter table public.production_lines add column if not exists current_lot_id bigint references public.line_lots (id) on delete set null;

-- ───────────── 2. Events in a lot ─────────────
create table if not exists public.lot_events (
  id          bigint generated always as identity primary key,
  lot_id      bigint not null references public.line_lots (id) on delete cascade,
  kind        text not null check (kind in ('start', 'status', 'fill_cip', 'continue', 'finish', 'note')),
  at          timestamptz not null default now(),
  hours       numeric(5,1) check (hours >= 0),            -- CIP filling time, or the CIP after the lot (finish)
  detail      text not null default '',                   -- new status (status), CIP reason (finish)
  note        text not null default '',
  by_id       uuid default auth.uid() references public.profiles (id) on delete set null,
  by_name     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists lot_events_lot_at_idx on public.lot_events (lot_id, at);

create or replace function private.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists lot_events_touch on public.lot_events;
create trigger lot_events_touch before update on public.lot_events for each row execute function private.touch_updated_at();
drop trigger if exists line_lots_touch on public.line_lots;
create trigger line_lots_touch before update on public.line_lots for each row execute function private.touch_updated_at();

alter table public.lot_events enable row level security;
create policy "lot events: read" on public.lot_events for select to authenticated using (true);
create policy "lot events: add" on public.lot_events for insert to authenticated with check (true);
create policy "lot events: edit" on public.lot_events for update to authenticated using (true) with check (true);
create policy "lot events: delete" on public.lot_events for delete to authenticated using (true);
create policy "active only: lot events" on public.lot_events as restrictive for all to authenticated
  using (private.is_active()) with check (private.is_active());

-- ───────────── 4. Production plan ─────────────
create table if not exists public.factory_settings (
  id               integer primary key default 1 check (id = 1),   -- one row for the whole factory
  run_choices      integer[] not null default '{24,28,32,36}',      -- planned run choices (hours)
  run_max_hours    integer not null default 36 check (run_max_hours > 0),          -- normal maximum, used for new lines
  cip_hours        numeric(4,1) not null default 4 check (cip_hours > 0),          -- standard CIP after a lot
  fill_cip_hours   numeric(4,1) not null default 2 check (fill_cip_hours > 0),     -- usual CIP filling time
  fill_every_hours integer not null default 24 check (fill_every_hours > 0),       -- usual filling limit before a CIP filling
  updated_by_name  text not null default '',
  updated_at       timestamptz not null default now()
);
insert into public.factory_settings (id) values (1) on conflict (id) do nothing;
drop trigger if exists factory_settings_touch on public.factory_settings;
create trigger factory_settings_touch before update on public.factory_settings for each row execute function private.touch_updated_at();

alter table public.factory_settings enable row level security;
create policy "plan: read" on public.factory_settings for select to authenticated using (true);
create policy "plan: supervisor or manager edits" on public.factory_settings for update to authenticated
  using (private.my_role()::text in ('supervisor', 'manager')) with check (private.my_role()::text in ('supervisor', 'manager'));
create policy "active only: plan" on public.factory_settings as restrictive for all to authenticated
  using (private.is_active()) with check (private.is_active());

-- ───────────── 3. Change log (written only by the triggers below) ─────────────
create table if not exists public.lot_log (
  id          bigint generated always as identity primary key,
  lot_id      bigint,                  -- no foreign key: the log stays after a lot is deleted
  lot         text not null default '',
  line_name   text not null default '',
  entity      text not null check (entity in ('lot', 'event', 'plan')),
  entity_id   bigint,
  event_kind  text not null default '',
  action      text not null check (action in ('create', 'edit', 'delete')),
  changes     jsonb not null default '{}',   -- { field: [before, after] }
  by_id       uuid,
  by_name     text not null default '',
  at          timestamptz not null default now()
);
create index if not exists lot_log_lot_idx on public.lot_log (lot_id, at desc);
create index if not exists lot_log_at_idx on public.lot_log (at desc);
alter table public.lot_log enable row level security;
create policy "log: read" on public.lot_log for select to authenticated using (true);
create policy "active only: log" on public.lot_log as restrictive for all to authenticated
  using (private.is_active()) with check (private.is_active());
-- No insert, update or delete policies: people cannot write the log; only the trigger function can.

create or replace function private.log_lot_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  o jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  n jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  r jsonb := coalesce(n, o);
  ch jsonb := '{}';
  k text;
  -- bookkeeping columns are not shown as changes (who did it is kept in by_name)
  skip text[] := array['id', 'created_at', 'updated_at', 'by_id', 'by_name', 'ended_by', 'started_by_name', 'ended_by_name', 'updated_by_name', 'lot_id'];
  ent text; lid bigint; lotno text := ''; lname text := ''; who text := '';
begin
  if tg_table_name = 'line_lots' then
    ent := 'lot'; lid := (r->>'id')::bigint; lotno := r->>'lot'; lname := r->>'line_name';
  elsif tg_table_name = 'lot_events' then
    ent := 'event'; lid := (r->>'lot_id')::bigint;
    select l.lot, l.line_name into lotno, lname from public.line_lots l where l.id = lid;
    -- the lot itself was just deleted (its events go with it): take its number from the log
    if lotno is null then select g.lot, g.line_name into lotno, lname from public.lot_log g where g.lot_id = lid and g.lot <> '' order by g.id desc limit 1; end if;
  else
    ent := 'plan'; lid := null;
  end if;
  for k in select jsonb_object_keys(r) loop
    if k = any (skip) then continue; end if;
    if tg_op = 'UPDATE' and (o -> k) is not distinct from (n -> k) then continue; end if;
    -- a new or deleted row: list only the fields that hold something
    if tg_op <> 'UPDATE' and (r -> k) in ('null'::jsonb, '""'::jsonb, '0'::jsonb, '[]'::jsonb) then continue; end if;
    ch := ch || jsonb_build_object(k, jsonb_build_array(o -> k, n -> k));
  end loop;
  if tg_op = 'UPDATE' and ch = '{}'::jsonb then return null; end if;
  select p.name into who from public.profiles p where p.id = auth.uid();
  insert into public.lot_log (lot_id, lot, line_name, entity, entity_id, event_kind, action, changes, by_id, by_name)
  values (lid, coalesce(lotno, ''), coalesce(lname, ''), ent, (r->>'id')::bigint,
          case when ent = 'event' then coalesce(r->>'kind', '') else '' end,
          case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'edit' else 'delete' end,
          ch, auth.uid(), coalesce(who, ''));
  return null;
end $$;
revoke execute on function private.log_lot_change() from public, anon, authenticated;

drop trigger if exists line_lots_log on public.line_lots;
create trigger line_lots_log after insert or update or delete on public.line_lots for each row execute function private.log_lot_change();
drop trigger if exists lot_events_log on public.lot_events;
create trigger lot_events_log after insert or update or delete on public.lot_events for each row execute function private.log_lot_change();
drop trigger if exists factory_settings_log on public.factory_settings;
create trigger factory_settings_log after update on public.factory_settings for each row execute function private.log_lot_change();

-- Live updates
alter publication supabase_realtime add table public.lot_events, public.lot_log, public.factory_settings;
