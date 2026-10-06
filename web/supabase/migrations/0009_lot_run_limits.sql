-- Let Report: how long a lot may run on a line, and CIP filling in the middle of a lot.
--
-- A lot normally runs 24, 28, 32 or 36 hours. 36 hours is each line's maximum; a special case may
-- run longer, and the app then asks for the reason when the lot is finished.
-- Some lines (UHT line 1) can only fill for 24 hours at a time: the filler then needs a CIP
-- ("CIP filling") and the same lot carries on afterwards.

-- ───────────── Line settings and the lot's plan ─────────────
alter table public.production_lines
  add column if not exists max_run_hours        integer not null default 36 check (max_run_hours > 0),  -- longest normal run of a lot
  add column if not exists fill_cip_every_hours integer check (fill_cip_every_hours > 0),               -- CIP filling needed after this many hours (null = never)
  add column if not exists lot_plan_hours       numeric(5,1) check (lot_plan_hours > 0),                -- planned run of the lot now running
  add column if not exists fill_since           timestamptz,                                            -- start of the current filling run (lot start, or end of the last CIP filling)
  add column if not exists fill_cips            integer not null default 0 check (fill_cips >= 0);      -- CIP fillings done during the lot now running

-- A CIP can now also be a CIP filling, which keeps the lot on the line.
alter table public.production_lines drop constraint if exists production_lines_cip_reason_check;
alter table public.production_lines add constraint production_lines_cip_reason_check
  check (cip_reason in ('', 'standard', 'maintenance', 'error', 'other', 'filling'));

-- ───────────── What the lot record keeps ─────────────
alter table public.line_lots
  add column if not exists plan_hours numeric(5,1),                                       -- planned run when the lot started
  add column if not exists fill_cips  integer not null default 0 check (fill_cips >= 0),  -- CIP fillings during the lot
  add column if not exists over_note  text not null default '';                           -- why it ran past the line's maximum (special case)

-- UHT line 1 fills for 24 hours, then needs a CIP filling before the same lot continues.
update public.production_lines set fill_cip_every_hours = 24
  where fill_cip_every_hours is null and type = 'UHT' and name ~* '^\s*uht\s*-?\s*line\s*0?1\s*$';
