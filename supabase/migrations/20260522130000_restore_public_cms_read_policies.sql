alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.certificates enable row level security;
alter table public.experiences enable row level security;

drop policy if exists "public can read active profiles" on public.profiles;
create policy "public can read active profiles"
on public.profiles
for select
to anon, authenticated
using (active = true);

drop policy if exists "public can read active projects" on public.projects;
create policy "public can read active projects"
on public.projects
for select
to anon, authenticated
using (active = true);

drop policy if exists "public can read active technologies" on public.technologies;
create policy "public can read active technologies"
on public.technologies
for select
to anon, authenticated
using (active = true);

drop policy if exists "public can read active project technologies" on public.project_technologies;
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

drop policy if exists "public can read active certificates" on public.certificates;
create policy "public can read active certificates"
on public.certificates
for select
to anon, authenticated
using (active = true);

drop policy if exists "public can read active experiences" on public.experiences;
create policy "public can read active experiences"
on public.experiences
for select
to anon, authenticated
using (active = true);
