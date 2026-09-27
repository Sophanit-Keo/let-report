-- Let Report: live chat (team room + 1-to-1) and discussion comments on troubles.

-- ───────────── Chat messages ─────────────
-- room is 'team' (everyone) or 'dm:<uuid>:<uuid>' (the two people's ids, sorted).
create table public.messages (
  id          bigint generated always as identity primary key,
  room        text not null check (room = 'team' or room ~ '^dm:[0-9a-f-]{36}:[0-9a-f-]{36}$'),
  sender_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body        text not null default '' check (char_length(body) <= 4000),
  photo_path  text,                                    -- storage: photos bucket, chat/…
  created_at  timestamptz not null default now(),
  check (body <> '' or photo_path is not null)
);
create index messages_room_created_idx on public.messages (room, created_at desc);
create index messages_sender_idx on public.messages (sender_id);

-- Is the signed-in person in this room?
create or replace function private.in_room(r text) returns boolean
language sql stable set search_path = '' as $$
  select r = 'team' or (r like 'dm:%' and (select auth.uid())::text = any (string_to_array(substr(r, 4), ':')))
$$;
grant execute on function private.in_room(text) to authenticated;

alter table public.messages enable row level security;
create policy "chat: read my rooms" on public.messages for select to authenticated using (private.in_room(room));
create policy "chat: send as self" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and private.in_room(room));
create policy "chat: delete own" on public.messages for delete to authenticated using (sender_id = (select auth.uid()));
create policy "active only: chat" on public.messages as restrictive for all to authenticated
  using (private.is_active()) with check (private.is_active());

-- When each person last read each room (for unread badges).
create table public.chat_reads (
  user_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  room     text not null,
  read_at  timestamptz not null default now(),
  primary key (user_id, room)
);
alter table public.chat_reads enable row level security;
create policy "chat reads: own" on public.chat_reads for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ───────────── Discussion comments on a trouble ─────────────
create table public.report_comments (
  id           bigint generated always as identity primary key,
  report_id    text not null references public.reports (id) on delete cascade,
  author_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body         text not null default '' check (char_length(body) <= 4000),
  photo_path   text,
  created_at   timestamptz not null default now(),
  check (body <> '' or photo_path is not null)
);
create index report_comments_report_idx on public.report_comments (report_id, created_at);
create index report_comments_author_idx on public.report_comments (author_id);

alter table public.report_comments enable row level security;
create policy "comments: read" on public.report_comments for select to authenticated using (true);
create policy "comments: add as self" on public.report_comments for insert to authenticated with check (author_id = (select auth.uid()));
create policy "comments: delete own or manager" on public.report_comments for delete to authenticated
  using (author_id = (select auth.uid()) or private.my_role() = 'manager');
create policy "active only: comments" on public.report_comments as restrictive for all to authenticated
  using (private.is_active()) with check (private.is_active());

-- ───────────── Alerts can also go to specific people ─────────────
alter table public.notifications add column if not exists user_ids uuid[] not null default '{}';
drop policy if exists "alerts: read for my role" on public.notifications;
create policy "alerts: read for my role or me" on public.notifications for select to authenticated
  using (private.my_role() = any (roles) or (select auth.uid()) = any (user_ids) or created_by = (select auth.uid()));

-- ───────────── Live updates (Supabase Realtime) ─────────────
alter publication supabase_realtime add table public.messages, public.report_comments, public.reports, public.notifications, public.production_lines;
