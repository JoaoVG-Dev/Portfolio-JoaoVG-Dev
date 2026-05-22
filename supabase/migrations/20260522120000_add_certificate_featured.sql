alter table public.certificates
add column if not exists featured boolean default false;

update public.certificates
set featured = false
where featured is null;

update public.certificates
set featured = true
where id = '30000000-0000-4000-8000-000000000001'
  and not exists (
    select 1
    from public.certificates
    where featured = true
  );

alter table public.certificates
alter column featured set default false;
