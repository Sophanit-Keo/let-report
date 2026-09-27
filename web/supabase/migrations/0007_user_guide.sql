-- Let Report: the "How to use Let Report" guide shows once for each person (on any device),
-- until they finish or skip it. They can open it again from their account.
alter table public.profiles add column if not exists guide_seen_at timestamptz;
