-- Let Report: push notifications (Web Push) for alerts, chat messages and trouble changes.
--
-- How it works:
--   1. Each browser that turns notifications on saves a row in push_subscriptions.
--   2. A new row in notifications or messages calls the Edge Function "push" (via pg_net),
--      which works out who should get it and sends the push to their browsers.
--   3. Trouble changes that had no alert yet (new report, assigned, action done, sent back,
--      closed) now create an alert row here, so they show in Alerts and are pushed too.
--
-- One-time setup after running this file (SQL Editor), with your project's URL:
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
-- The VAPID keys are created by the "push" function the first time it runs.

create extension if not exists pg_net with schema extensions;

-- ───────────── Browsers that get notifications ─────────────
create table public.push_subscriptions (
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  user_agent  text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, endpoint)
);
create index push_subscriptions_endpoint_idx on public.push_subscriptions (endpoint);
alter table public.push_subscriptions enable row level security;
create policy "push: own" on public.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ───────────── Public app settings (the VAPID public key) ─────────────
create table public.app_settings (
  key    text primary key,
  value  text not null
);
alter table public.app_settings enable row level security;
create policy "settings: read" on public.app_settings for select to authenticated using (true);

-- ───────────── Secrets for the push function (server only) ─────────────
-- A random secret so only this database can ask the function to send pushes.
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'push_webhook_secret')
where not exists (select 1 from vault.secrets where name = 'push_webhook_secret');

-- What the push function reads and writes (service role only).
create or replace function public.push_config() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'webhook_secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_webhook_secret'),
    'vapid_private',  (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_private_key'),
    'vapid_public',   (select value from public.app_settings where key = 'vapid_public_key'))
$$;
create or replace function public.push_save_keys(pub text, priv text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from vault.secrets where name = 'vapid_private_key') then return; end if;
  perform vault.create_secret(priv, 'vapid_private_key');
  insert into public.app_settings (key, value) values ('vapid_public_key', pub) on conflict (key) do update set value = excluded.value;
end $$;
revoke execute on function public.push_config() from public, anon, authenticated;
revoke execute on function public.push_save_keys(text, text) from public, anon, authenticated;
grant execute on function public.push_config() to service_role;
grant execute on function public.push_save_keys(text, text) to service_role;

-- ───────────── New alert or chat message → push ─────────────
create or replace function private.push_dispatch() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url');
  secret text := (select decrypted_secret from vault.decrypted_secrets where name = 'push_webhook_secret');
begin
  if base is null or secret is null then return null; end if;
  perform net.http_post(
    url := rtrim(base, '/') || '/functions/v1/push',
    body := jsonb_build_object('table', tg_table_name, 'id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', secret),
    timeout_milliseconds := 8000);
  return null;
end $$;
revoke execute on function private.push_dispatch() from public, anon, authenticated;

create trigger notifications_push after insert on public.notifications for each row execute function private.push_dispatch();
create trigger messages_push after insert on public.messages for each row execute function private.push_dispatch();

-- ───────────── Trouble changes → alert (which is then pushed) ─────────────
create or replace function private.report_events() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid;
  last_step text := coalesce(new.tl -> -1 ->> 0, '');
  me uuid := auth.uid();
  reporter_role public.app_role;
  people uuid[];
begin
  if tg_op = 'INSERT' then
    -- critical and escalated reports already send their own alert from the app
    select role into reporter_role from public.profiles where id = new.by_id;
    if new.status = 'open' and new.sev < 3 and new.level::text = reporter_role::text then
      insert into public.notifications (report_id, icon, tone, text, roles, created_by)
      values (new.id, 'file-plus', 'blue', 'New report from ' || new.by_name || ': ' || new.title, array['qa', 'supervisor']::public.app_role[], me);
    end if;
    return null;
  end if;

  if new.status is not distinct from old.status then return null; end if;
  if new.capa ? 'owner' then
    select id into owner_id from public.profiles where name = new.capa ->> 'owner' and active order by created_at limit 1;
  end if;

  if new.status = 'action' and old.status = 'open' and owner_id is not null then
    insert into public.notifications (report_id, icon, tone, text, roles, user_ids, created_by)
    values (new.id, 'user-plus', 'blue', 'Corrective action assigned to you: ' || new.title, '{}', array[owner_id], me);
  elsif new.status = 'action' and old.status = 'verify' and owner_id is not null then
    insert into public.notifications (report_id, icon, tone, text, roles, user_ids, created_by)
    values (new.id, 'rotate-ccw', 'amber', 'Not fixed, sent back to you: ' || new.title, '{}', array[owner_id], me);
  elsif new.status = 'verify' and old.status = 'action' and not new.needs_approval then
    insert into public.notifications (report_id, icon, tone, text, roles, created_by)
    values (new.id, 'shield-check', 'green', 'Corrective action done, please verify: ' || new.title, array['qa']::public.app_role[], me);
  elsif new.status = 'closed' and last_step <> 'closedBy' then
    -- tell the reporter and the action owner ("Close trouble" already alerts everyone from the app)
    people := array_remove(array_remove(array[new.by_id, owner_id], null), me);
    if cardinality(people) > 0 then
      insert into public.notifications (report_id, icon, tone, text, roles, user_ids, created_by)
      values (new.id, 'circle-check', 'green', 'Completed and closed: ' || new.title, '{}', people, me);
    end if;
  end if;
  return null;
end $$;
revoke execute on function private.report_events() from public, anon, authenticated;

create trigger reports_events after insert or update of status on public.reports for each row execute function private.report_events();
