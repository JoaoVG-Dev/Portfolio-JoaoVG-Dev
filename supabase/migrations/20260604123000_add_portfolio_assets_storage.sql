insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read portfolio assets" on storage.objects;
create policy "public can read portfolio assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-assets');

drop policy if exists "admins can upload portfolio assets" on storage.objects;
create policy "admins can upload portfolio assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-assets'
  and name like 'projects/%'
  and public.is_admin()
);

drop policy if exists "admins can update portfolio assets" on storage.objects;
create policy "admins can update portfolio assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-assets'
  and public.is_admin()
)
with check (
  bucket_id = 'portfolio-assets'
  and name like 'projects/%'
  and public.is_admin()
);

drop policy if exists "admins can delete portfolio assets" on storage.objects;
create policy "admins can delete portfolio assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-assets'
  and public.is_admin()
);
