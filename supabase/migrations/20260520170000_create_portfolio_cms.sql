create extension if not exists pgcrypto;

drop table if exists public.project_technologies cascade;
drop table if exists public.experiences cascade;
drop table if exists public.certificates cascade;
drop table if exists public.projects cascade;
drop table if exists public.technologies cascade;
drop table if exists public.profiles cascade;
drop table if exists public.admin_users cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.set_updated_at() cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  title text,
  bio text,
  avatar_url text,
  github_url text,
  linkedin_url text,
  whatsapp_url text,
  email text,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  short_description text,
  description text,
  cover_url text,
  github_url text,
  deploy_url text,
  status text default 'finalizado',
  featured boolean default false,
  active boolean default true,
  display_order integer default 0,
  started_at date,
  completed_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  level text,
  icon_url text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.project_technologies (
  project_id uuid references public.projects(id) on delete cascade,
  technology_id uuid references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  institution text,
  category text,
  certificate_url text,
  image_url text,
  workload text,
  completed_at date,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text,
  start_date date,
  end_date date,
  current boolean default false,
  description text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_active_idx on public.profiles (active);
create index projects_active_order_idx on public.projects (active, display_order);
create index technologies_active_order_idx on public.technologies (active, display_order);
create index certificates_active_order_idx on public.certificates (active, display_order);
create index experiences_active_order_idx on public.experiences (active, display_order);
create index project_technologies_project_idx on public.project_technologies (project_id);
create index project_technologies_technology_idx on public.project_technologies (technology_id);

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

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger technologies_set_updated_at
before update on public.technologies
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
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.certificates enable row level security;
alter table public.experiences enable row level security;

create policy "public can read active profiles"
on public.profiles
for select
to anon, authenticated
using (active = true);

create policy "admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active projects"
on public.projects
for select
to anon, authenticated
using (active = true);

create policy "admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active technologies"
on public.technologies
for select
to anon, authenticated
using (active = true);

create policy "admins can manage technologies"
on public.technologies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active project technologies"
on public.project_technologies
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_technologies.project_id
      and projects.active = true
  )
  and exists (
    select 1
    from public.technologies
    where technologies.id = project_technologies.technology_id
      and technologies.active = true
  )
);

create policy "admins can manage project technologies"
on public.project_technologies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active certificates"
on public.certificates
for select
to anon, authenticated
using (active = true);

create policy "admins can manage certificates"
on public.certificates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active experiences"
on public.experiences
for select
to anon, authenticated
using (active = true);

create policy "admins can manage experiences"
on public.experiences
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
