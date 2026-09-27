-- Let Report: production lines ("Lines now" on the home screen).
-- Every signed-in person can update a line's status, output and note; only a plant manager adds or removes lines.

create table public.production_lines (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique check (length(trim(name)) > 0),
  type             text not null default 'UHT',            -- UHT, SCM, Yogurt, Other
  product          text not null default '',
  qty              integer not null default 0 check (qty >= 0),
  target           integer not null default 100 check (target > 0),
  status           text not null default 'idle'
                   check (status in ('running', 'stopped', 'cleaning', 'changeover', 'maintenance', 'idle')),
  note             text not null default '',
  sort             integer not null default 0,
  status_since     timestamptz not null default now(),
  updated_by_name  text not null default '',
  updated_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- Keep updated_at / status_since correct.
create or replace function public.touch_line() returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then new.status_since = now(); end if;
  return new;
end $$;
revoke execute on function public.touch_line() from public, anon, authenticated;

create trigger production_lines_touch before update on public.production_lines
  for each row execute function public.touch_line();

alter table public.production_lines enable row level security;

create policy "lines: read" on public.production_lines for select to authenticated using (true);
create policy "lines: update" on public.production_lines for update to authenticated using (true) with check (true);
create policy "lines: manager add" on public.production_lines for insert to authenticated with check (private.my_role() = 'manager');
create policy "lines: manager remove" on public.production_lines for delete to authenticated using (private.my_role() = 'manager');

-- Starting lines (from the design).
insert into public.production_lines (name, type, product, qty, target, status, sort) values
  ('SCM line 1',    'SCM',    'Commander',    80, 120, 'running',  1),
  ('UHT line 2',    'UHT',    'ADCaMg 100ml', 42, 100, 'stopped',  2),
  ('Yogurt line 3', 'Yogurt', 'Yogurt Sweet', 35,  60, 'running',  3),
  ('UHT line 4',    'UHT',    'Bestcows',      0,  90, 'cleaning', 4)
on conflict (name) do nothing;
