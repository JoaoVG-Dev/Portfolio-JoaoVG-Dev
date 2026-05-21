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
- trigger `handle_new_auth_user()` para criar profile automaticamente quando um usuário nasce em `auth.users`
- RLS e policies sem escrita pública

Visitantes leem apenas registros com `active = true`. Escrita é permitida apenas para usuários autenticados cujo profile tenha `role = 'admin'`.

Para bancos que já foram criados antes do fluxo automático de permissões, aplique também a migration incremental:

```sql
-- supabase/migrations/20260521120000_improve_admin_role_provisioning.sql
```

Essa migration garante a coluna `role`, cria a trigger de novos usuários e mantém a regra segura: o primeiro usuário Auth vira `admin`; usuários criados depois começam como `viewer` e precisam de promoção manual.

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

## Usuário Admin

Para acesso ao painel, o usuário precisa existir em Supabase Auth e também ter uma linha em `public.profiles` com `role = 'admin'` e `active = true`.

Fluxo recomendado para configuração inicial:

1. Aplique `supabase/migrations/20260520170000_create_portfolio_cms.sql`.
2. Aplique `supabase/migrations/20260521120000_improve_admin_role_provisioning.sql`.
3. Crie o usuário `devjoaog@outlook.com` em Supabase Auth.
4. Execute `supabase/promote-devjoaog-admin.sql` no SQL Editor do Supabase.
5. Execute `supabase/seed.sql` para popular o conteúdo inicial, se ainda não tiver populado.

O arquivo obrigatório para promover o usuário principal é:

```sql
-- supabase/promote-devjoaog-admin.sql
```

Ele executa:

```sql
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
```

Se o painel mostrar `Seu usuário ainda não possui permissão de administrador.`, confirme no Supabase:

- o usuário `devjoaog@outlook.com` existe em Auth;
- a tabela `public.profiles` possui a coluna `role`;
- existe uma linha em `public.profiles` para esse usuário com `role = 'admin'`;
- se a coluna `active` existir, ela está como `true`;
- as policies de escrita continuam usando `public.is_admin()` e não há policy de escrita pública.

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

### Uso do CMS

Projetos usam `cover_url` como URL da imagem de capa. O formulário mostra preview da imagem e mantém um fallback visual quando a URL estiver vazia ou quebrada. O upload real de arquivos não foi habilitado nesta etapa; use uma URL pública ou um caminho de asset já servido pelo app.

As tecnologias de um projeto são gerenciadas pela relação `project_technologies`. Cadastre tecnologias primeiro, depois selecione os chips no formulário de projeto. Ao salvar, o CMS sincroniza as relações marcadas, incluindo remoções.

O campo `display_order` não aparece mais como input comum no cadastro. Novos projetos, tecnologias, certificados e experiências entram automaticamente no fim da lista usando o maior `display_order` atual + 1.

Certificados cadastrados com `active = true` aparecem na seção pública `#certifications`. Use `image_url` para capa do certificado e `certificate_url` para o botão `Ver certificado`.

## Fallback

Se o Supabase estiver sem tabelas, vazio, offline ou com erro de permissão, a página pública usa `src/data/fallbackPortfolio.ts`. Isso mantém o portfólio online enquanto o banco é configurado.
