-- Let Report: team management (managers) and profile pictures (everyone).

-- ───────────── Profiles: email + active flag ─────────────
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists active boolean not null default true;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email = '';

-- New accounts: copy the email too, and take the role/name the manager chose when they created it.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  wanted text := new.raw_app_meta_data ->> 'role';   -- only settable by the admin API (manager "Add person")
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    case
      when not exists (select 1 from public.profiles) then 'manager'::public.app_role
      when wanted in ('qc', 'qa', 'supervisor', 'manager') then wanted::public.app_role
      else 'qc'::public.app_role
    end
  );
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- A turned-off account has no role (so a turned-off manager can't manage anything).
create or replace function private.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

-- Signed-in and not turned off by a manager.
create or replace function private.is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select active from public.profiles where id = auth.uid()), false)
$$;
revoke execute on function private.is_active() from public, anon;
grant execute on function private.is_active() to authenticated;

-- An account that is turned off can still read its own profile (to see the message) but nothing else.
create policy "active only: reports" on public.reports as restrictive for all to authenticated using (private.is_active()) with check (private.is_active());
create policy "active only: alerts" on public.notifications as restrictive for all to authenticated using (private.is_active()) with check (private.is_active());
create policy "active only: reads" on public.notification_reads as restrictive for all to authenticated using (private.is_active()) with check (private.is_active());
create policy "active only: ticks" on public.checklist_ticks as restrictive for all to authenticated using (private.is_active()) with check (private.is_active());
create policy "active only: lines" on public.production_lines as restrictive for all to authenticated using (private.is_active()) with check (private.is_active());
create policy "active only: profiles" on public.profiles as restrictive for select to authenticated using (private.is_active() or id = (select auth.uid()));

-- ───────────── Only managers change role / active / email, and the last manager stays ─────────────
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active or new.email is distinct from old.email)
     and coalesce(private.my_role()::text, '') <> 'manager'
     and auth.uid() is not null then   -- people using the app; admin tools (no signed-in user) may change anything
    raise exception 'Only a plant manager can change roles or turn accounts on and off';
  end if;
  if old.role = 'manager' and old.active and (new.role <> 'manager' or not new.active)
     and not exists (select 1 from public.profiles where role = 'manager' and active and id <> old.id) then
    raise exception 'Keep at least one active plant manager';
  end if;
  return new;
end $$;
revoke execute on function public.guard_role_change() from public, anon, authenticated;

create or replace function public.guard_last_manager_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'manager' and old.active
     and not exists (select 1 from public.profiles where role = 'manager' and active and id <> old.id) then
    raise exception 'Keep at least one active plant manager';
  end if;
  return old;
end $$;
revoke execute on function public.guard_last_manager_delete() from public, anon, authenticated;

drop trigger if exists profiles_guard_delete on public.profiles;
create trigger profiles_guard_delete before delete on public.profiles
  for each row execute function public.guard_last_manager_delete();

-- ───────────── Profile pictures ─────────────
-- Public bucket (pictures are shown to all staff); file names are random, uploads are limited to your own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars: upload own or manager" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.my_role() = 'manager'));
create policy "avatars: replace own or manager" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.my_role() = 'manager'))
  with check (bucket_id = 'avatars');
create policy "avatars: delete own or manager" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.my_role() = 'manager'));
