-- Harden admin provisioning without exposing service_role keys.
-- First Auth user becomes admin automatically; later users start as viewer.

alter table public.profiles
add column if not exists role text default 'admin';

alter table public.profiles
add column if not exists active boolean default true;

update public.profiles
set role = 'admin'
where role is null;

update public.profiles
set active = true
where active is null;

alter table public.profiles
alter column role set not null;

alter table public.profiles
alter column active set not null;

alter table public.profiles
alter column role set default 'viewer';

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  is_first_profile boolean;
begin
  select not exists (
    select 1
    from public.profiles
  )
  into is_first_profile;

  insert into public.profiles (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    case when is_first_profile then 'admin' else 'viewer' end,
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;
