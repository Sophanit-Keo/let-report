-- Let Report: production lots on each line, CIP after a lot, and the record of every lot that ended.
--
-- A running line carries the lot it is producing (e.g. "UHT line 2 · running lot 270706-K2").
-- When the lot is finished the line goes into CIP (cleaning in place) for 4 hours by default;
-- maintenance or a system error can take longer, so the CIP end time and reason are stored on the
-- line. The details of the lot that ended are kept in line_lots.

-- ───────────── Current lot and CIP on the line ─────────────
alter table public.production_lines
  add column if not exists lot            text not null default '',   -- lot number now running ('' = none)
  add column if not exists lot_started_at timestamptz,                -- when this lot started
  add column if not exists cip_until      timestamptz,                -- planned end of the current CIP (status = cleaning)
  add column if not exists cip_reason     text not null default ''    -- '', standard, maintenance, error, other
    check (cip_reason in ('', 'standard', 'maintenance', 'error', 'other'));

-- ───────────── Record of lots that ended ─────────────
create table public.line_lots (
  id             bigint generated always as identity primary key,
  line_id        uuid references public.production_lines (id) on delete set null,
  line_name      text not null default '',                     -- kept so the record survives a removed line
  product        text not null default '',
  lot            text not null default '' check (length(trim(lot)) > 0),
  started_at     timestamptz,                                  -- when the lot started (may be unknown)
  ended_at       timestamptz not null default now(),
  qty            integer not null default 0 check (qty >= 0),  -- output of this lot (pallets)
  target         integer not null default 0 check (target >= 0),
  cip_hours      numeric(5,1) not null default 4 check (cip_hours >= 0),
  cip_reason     text not null default 'standard' check (cip_reason in ('standard', 'maintenance', 'error', 'other')),
  note           text not null default '',
  ended_by       uuid default auth.uid() references public.profiles (id) on delete set null,
  ended_by_name  text not null default '',
  created_at     timestamptz not null default now()
);
create index line_lots_line_ended_idx on public.line_lots (line_id, ended_at desc);
create index line_lots_ended_idx on public.line_lots (ended_at desc);

alter table public.line_lots enable row level security;
-- Everyone signed in can see the lot records and record a lot end as themselves; only a manager can delete one.
create policy "lots: read" on public.line_lots for select to authenticated using (true);
create policy "lots: record as self" on public.line_lots for insert to authenticated with check (ended_by = (select auth.uid()));
create policy "lots: update" on public.line_lots for update to authenticated using (true) with check (true);
create policy "lots: manager delete" on public.line_lots for delete to authenticated using (private.my_role() = 'manager');
create policy "active only: lots" on public.line_lots as restrictive for all to authenticated
  using (private.is_active()) with check (private.is_active());

-- Live updates for the lot records too.
alter publication supabase_realtime add table public.line_lots;
