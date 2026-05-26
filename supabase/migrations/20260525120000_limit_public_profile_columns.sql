-- Limit public profile reads to fields intentionally rendered by the portfolio.
-- Admin status remains checked through public.is_admin(), not through client-side role data.

revoke select on public.profiles from anon, authenticated;

grant select (
  id,
  name,
  title,
  bio,
  avatar_url,
  github_url,
  linkedin_url,
  whatsapp_url,
  email,
  active,
  updated_at
) on public.profiles to anon, authenticated;
