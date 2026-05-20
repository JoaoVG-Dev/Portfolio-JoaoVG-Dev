create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  headline text not null,
  summary text not null,
  bio text[] not null default '{}',
  email text not null,
  location text not null,
  whatsapp_url text not null,
  github_url text not null,
  linkedin_url text not null,
  instagram_url text not null,
  cv_url text not null,
  avatar_url text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text not null,
  category text not null,
  sort_order integer not null default 0,
  is_featured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  description text not null,
  image_url text not null,
  live_url text,
  repository_url text,
  sort_order integer not null default 0,
  is_featured boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issued_at date,
  credential_url text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  location text not null,
  start_date date not null,
  end_date date,
  description text not null,
  type text not null default 'personal' check (type in ('full-time', 'freelance', 'study', 'personal')),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_public_idx on public.profiles (is_published);
create index if not exists technologies_featured_idx on public.technologies (is_featured, sort_order);
create index if not exists projects_public_idx on public.projects (is_published, sort_order);
create index if not exists certificates_public_idx on public.certificates (is_published, sort_order);
create index if not exists experiences_public_idx on public.experiences (is_published, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger technologies_set_updated_at
before update on public.technologies
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger certificates_set_updated_at
before update on public.certificates
for each row execute function public.set_updated_at();

create trigger experiences_set_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.technologies enable row level security;
alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.experiences enable row level security;

create policy "admins can view admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

create policy "public can read published profiles"
on public.profiles
for select
to anon, authenticated
using (is_published = true);

create policy "admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read featured technologies"
on public.technologies
for select
to anon, authenticated
using (is_featured = true);

create policy "admins can manage technologies"
on public.technologies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published projects"
on public.projects
for select
to anon, authenticated
using (is_published = true);

create policy "admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published certificates"
on public.certificates
for select
to anon, authenticated
using (is_published = true);

create policy "admins can manage certificates"
on public.certificates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published experiences"
on public.experiences
for select
to anon, authenticated
using (is_published = true);

create policy "admins can manage experiences"
on public.experiences
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

