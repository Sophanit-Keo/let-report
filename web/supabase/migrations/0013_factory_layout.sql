-- Let Report: the factory layout, read by the UHT milk plant simulation's Factory board.
--
-- Each production line now says which UHT plant feeds it, its filler, the filler's speed and the
-- pack size; the production plan keeps the list of UHT plants with their capacity. People correct
-- them in Edit line info and the Plan sheet; the board follows over the realtime feed (both tables
-- are already in it). The starting layout below is written once and never overwrites an edit.
-- Changes to the UHT list are written to the plan's change log (migration 0011) as readable text.
-- Run after 0012.

-- ───────────── The line's place in the factory ─────────────
alter table public.production_lines
  add column if not exists uht                text not null default '',   -- the UHT that feeds the line, a name from uht_units ('' = none)
  add column if not exists filler             text not null default '',   -- filler model: TFA, TBA/19, TBA/22, A3/Speed or another ('' = none)
  add column if not exists filler_packs_per_h integer,                    -- the filler's speed (null = not known)
  add column if not exists pack_ml            integer;                    -- pack size (null = not known)

-- ───────────── The UHT plants (production plan) ─────────────
alter table public.factory_settings
  add column if not exists uht_units jsonb not null default '[]'::jsonb;   -- [{ "name": "UHT 1", "capacityLph": 4000 }, …]

-- ───────────── Checks, added only if missing ─────────────
do $$
declare c record;
begin
  for c in select * from (values
    ('production_lines', 'production_lines_uht_check',                'check (char_length(uht) <= 40)'),
    ('production_lines', 'production_lines_filler_check',             'check (char_length(filler) <= 40)'),
    ('production_lines', 'production_lines_filler_packs_per_h_check', 'check (filler_packs_per_h > 0)'),
    ('production_lines', 'production_lines_pack_ml_check',            'check (pack_ml > 0)'),
    ('factory_settings', 'factory_settings_uht_units_check',          'check (jsonb_typeof(uht_units) = ''array'')')
  ) as t (tbl, name, def) loop
    if not exists (select 1 from pg_constraint where conrelid = ('public.' || c.tbl)::regclass and conname = c.name) then
      execute format('alter table public.%I add constraint %I %s', c.tbl, c.name, c.def);
    end if;
  end loop;
end $$;

-- ───────────── Change log: the UHT list as text ─────────────
-- "UHT 1 · 4000 L/h, UHT 2 · 8000 L/h" ('' for an empty list), so the plan's log shows it as it is.
create or replace function private.uht_units_text(u jsonb) returns text
language sql immutable set search_path = '' as $$
  select coalesce(string_agg(
           coalesce(e ->> 'name', '?') || ' · '
           || case when jsonb_typeof(e -> 'capacityLph') = 'number' then trim_scale((e -> 'capacityLph')::numeric)::text   -- 8000.0 reads 8000
                   else coalesce(e ->> 'capacityLph', '?') end
           || ' L/h', ', ' order by i), '')
  from jsonb_array_elements(case when jsonb_typeof(u) = 'array' then u else '[]'::jsonb end) with ordinality as t (e, i)
$$;
revoke execute on function private.uht_units_text(jsonb) from public, anon, authenticated;

-- As in 0011, except that the plan's uht_units is compared and logged as that text.
create or replace function private.log_lot_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  o jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  n jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  r jsonb;
  ch jsonb := '{}';
  k text;
  -- bookkeeping columns are not shown as changes (who did it is kept in by_name)
  skip text[] := array['id', 'created_at', 'updated_at', 'by_id', 'by_name', 'ended_by', 'started_by_name', 'ended_by_name', 'updated_by_name', 'lot_id'];
  ent text; lid bigint; lotno text := ''; lname text := ''; who text := '';
begin
  -- the UHT list is compared and logged as text: an edit that keeps the same names and capacities is not a change
  if tg_table_name = 'factory_settings' then
    if o ? 'uht_units' then o := o || jsonb_build_object('uht_units', private.uht_units_text(o -> 'uht_units')); end if;
    if n ? 'uht_units' then n := n || jsonb_build_object('uht_units', private.uht_units_text(n -> 'uht_units')); end if;
  end if;
  r := coalesce(n, o);
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
  -- no signed-in person (SQL editor, this migration): by_id stays empty and by_name ''
  select p.name into who from public.profiles p where p.id = auth.uid();
  insert into public.lot_log (lot_id, lot, line_name, entity, entity_id, event_kind, action, changes, by_id, by_name)
  values (lid, coalesce(lotno, ''), coalesce(lname, ''), ent, (r->>'id')::bigint,
          case when ent = 'event' then coalesce(r->>'kind', '') else '' end,
          case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'edit' else 'delete' end,
          ch, auth.uid(), coalesce(who, ''));
  return null;
end $$;
revoke execute on function private.log_lot_change() from public, anon, authenticated;

-- ───────────── Starting layout (written once) ─────────────
-- The UHT plants, while the list is still empty. The plan's log records this as an edit by nobody.
update public.factory_settings
   set uht_units = '[{"name": "UHT 1", "capacityLph": 4000}, {"name": "UHT 2", "capacityLph": 8000}, {"name": "UHT 3", "capacityLph": 4000}]'::jsonb
 where id = 1 and uht_units = '[]'::jsonb;

-- Each "UHT line N" by its number (the names are written "UHT-line 1", "UHT- line 2", "UHT line 4"…),
-- only while none of its layout has been filled in. There is no line 5; SCM and Yogurt lines are left alone.
update public.production_lines l
   set uht = s.uht, filler = s.filler, filler_packs_per_h = s.packs_per_h, pack_ml = s.pack_ml
  from (values
    (1, 'UHT 1', 'TFA',       3600, 100),
    (6, 'UHT 1', 'TBA/22',   20000, 100),
    (2, 'UHT 2', 'TBA/19',    7500, 100),
    (3, 'UHT 2', 'A3/Speed', 24000, 100),
    (4, 'UHT 2', 'A3/Speed', 24000, 100),
    (7, 'UHT 3', 'A3/Speed', 24000, 100)
  ) as s (line_no, uht, filler, packs_per_h, pack_ml)
 where l.uht = '' and l.filler = '' and l.filler_packs_per_h is null and l.pack_ml is null
   and (regexp_match(l.name, '^\s*uht\s*-?\s*line\s*0*(\d{1,3})\s*$', 'i'))[1]::int = s.line_no;
