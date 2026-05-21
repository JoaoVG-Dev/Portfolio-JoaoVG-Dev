# Portfolio JoãoVG CMS

Portfólio em React com vitrine pública inspirada no projeto estático original e um mini CMS pessoal preparado para Supabase. A página pública tenta buscar dados reais do Supabase e mantém fallback local para não quebrar quando o banco ainda não estiver configurado ou estiver vazio.

## Stack

- React + TypeScript + Vite
- Supabase Auth, Database e RLS
- CMS para projetos, tecnologias, certificados e experiências
- Assets originais em `public/assets`

## Ambiente

Crie um `.env` local com base em `.env.example`:

```bash
VITE_SUPABASE_URL=https://wmzmzfjgzdhdtnhybsrz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vwBEDMiMPYE_UUdHZl55vA_xwsPkOif
```

Use apenas a publishable key/anon key no frontend. Nunca exponha `service_role` no bundle, em `.env.example` ou em arquivos commitados. O `.env` real está no `.gitignore`.

## Rodando Localmente

```bash
npm install
npm run dev
```

Outros comandos:

```bash
npm run build
npm run preview
npm run typecheck
```

## Banco Supabase

Execute a migration no projeto Supabase:

```sql
-- supabase/migrations/20260520170000_create_portfolio_cms.sql
```

Você pode aplicar pelo SQL Editor do Supabase copiando o conteúdo do arquivo, ou via Supabase CLI se o projeto estiver linkado e você tiver as credenciais de banco:

```bash
npx supabase db push
```

A migration cria:

- `profiles`
- `projects`
- `technologies`
- `project_technologies`
- `certificates`
- `experiences`
- função `is_admin()`
- triggers de `updated_at`
- RLS e policies sem escrita pública

Visitantes leem apenas registros com `active = true`. Escrita é permitida apenas para usuários autenticados cujo profile tenha `role = 'admin'`.

## Seed Inicial

Depois da migration, execute:

```sql
-- supabase/seed.sql
```

O seed popula tecnologias, projetos, relações, certificados e experiências com os dados atuais do portfólio.

O registro de `profiles` depende de `auth.users`, porque `profiles.id` referencia o usuário autenticado. Portanto:

1. Crie o usuário admin em Supabase Auth com o e-mail `devjoaog@outlook.com`.
2. Execute `supabase/seed.sql`.
3. O seed encontrará esse usuário e criará/atualizará o profile com `role = 'admin'`.

Se o usuário Auth ainda não existir, o seed não quebra; apenas não insere o profile. Nesse caso, crie o usuário e rode o seed novamente.

## CMS

O painel fica em:

```text
/admin
```

Após login com o usuário admin, o painel gerencia:

- Projetos
- Tecnologias
- Certificados
- Experiências

## Fallback

Se o Supabase estiver sem tabelas, vazio, offline ou com erro de permissão, a página pública usa `src/data/fallbackPortfolio.ts`. Isso mantém o portfólio online enquanto o banco é configurado.
