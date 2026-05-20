# Portfolio JoãoVG CMS

Portfólio em React com vitrine pública e painel administrativo protegido por Supabase Auth. O conteúdo público usa Supabase quando as variáveis de ambiente estão configuradas e cai para dados locais de fallback quando não há conexão.

## Stack

- React + TypeScript + Vite
- Supabase Auth, Database e RLS
- CSS modular por experiência pública/admin
- Assets migrados do portfólio estático original

## Rodando localmente

```bash
npm install
npm run dev
```

Crie um arquivo `.env` com base em `.env.example`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Sem essas variáveis, a vitrine pública continua funcionando com fallback local e o painel `/admin` exibe o estado de configuração pendente.

## Supabase

1. Crie um projeto no Supabase.
2. Execute a migration em `supabase/migrations/20260520170000_create_portfolio_cms.sql`.
3. Execute `supabase/seed.sql` para popular o conteúdo inicial.
4. Crie um usuário em Authentication.
5. Libere o usuário como admin:

```sql
insert into public.admin_users (user_id)
values ('UUID_DO_USUARIO_AUTH');
```

As policies RLS permitem leitura pública apenas para conteúdo publicado/destacado e restringem CRUD a usuários presentes em `public.admin_users`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

## CMS

O painel fica em `/admin` e permite gerenciar:

- Projetos
- Tecnologias
- Certificados
- Experiências

Imagens e PDFs podem ser referenciados por URL. Os assets originais ficam em `public/assets`.
