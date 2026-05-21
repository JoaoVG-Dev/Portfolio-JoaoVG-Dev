-- Run this in the Supabase SQL Editor after creating the Auth user
-- devjoaog@outlook.com. It does not require or expose service_role keys.

alter table public.profiles
add column if not exists role text default 'admin';

alter table public.profiles
add column if not exists active boolean default true;

insert into public.profiles (
  id,
  name,
  title,
  bio,
  email,
  role,
  active,
  created_at,
  updated_at
)
select
  id,
  'João Vitor Guidoti',
  'Desenvolvedor Full Stack',
  'Portfólio pessoal DevJoão.',
  email,
  'admin',
  true,
  now(),
  now()
from auth.users
where email = 'devjoaog@outlook.com'
on conflict (id) do update
set
  name = excluded.name,
  title = excluded.title,
  bio = excluded.bio,
  email = excluded.email,
  role = 'admin',
  active = true,
  updated_at = now();
