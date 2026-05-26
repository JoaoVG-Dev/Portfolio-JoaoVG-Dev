update public.profiles
set whatsapp_url = 'https://wa.me/5521979382423',
    updated_at = now()
where email = 'devjoaog@outlook.com'
   or whatsapp_url is not null;
