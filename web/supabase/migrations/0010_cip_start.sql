-- Let Report: when the current CIP started.
-- A lot can be finished with an end time earlier than now (recorded late). The CIP after it starts
-- at that end time, so its countdown and progress bar count from there, not from when it was typed in.
alter table public.production_lines
  add column if not exists cip_started_at timestamptz;   -- start of the current CIP (status = cleaning)
