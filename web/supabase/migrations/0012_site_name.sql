-- Let Report: the factory / site name shown on everyone's home screen ("Main kitchen" by default)
-- is part of the production plan, so line supervisors and the plant manager can change it.
-- Changes are written to the change log by the plan's trigger (migration 0011).
-- Run after 0011.
alter table public.factory_settings
  add column if not exists site_name text not null default '' check (char_length(site_name) <= 80);   -- '' = the default name
