# Portfolio JoaoVG CMS

Portfolio em React com vitrine publica inspirada no projeto estatico original e um mini CMS pessoal preparado para Supabase. Quando as consultas ao Supabase funcionam, o banco e a fonte principal do conteudo. O fallback local so entra quando o Supabase estiver indisponivel, sem tabelas ou com erro real de conexao/permissao.

## Stack

- React + TypeScript + Vite
- Supabase Auth, Database e RLS
- CMS para projetos, tecnologias, certificados e experiencias
- Assets originais em `public/assets`

## Ambiente

Crie um `.env` local com base em `.env.example`:

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_SUPABASE_PUBLISHABLE_KEY
```

Use apenas a publishable key/anon key no frontend. Mantenha os valores reais somente no `.env` local e nas variáveis da Vercel. Nunca exponha `service_role` no bundle, em `.env.example` ou em arquivos commitados. O `.env` real deve continuar no `.gitignore`.

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

Aplique as migrations no projeto Supabase:

```sql
-- supabase/migrations/20260520170000_create_portfolio_cms.sql
-- supabase/migrations/20260521120000_improve_admin_role_provisioning.sql
-- supabase/migrations/20260522120000_add_certificate_featured.sql
-- supabase/migrations/20260525120000_limit_public_profile_columns.sql
```

Voce pode aplicar pelo SQL Editor do Supabase copiando o conteudo dos arquivos, ou via Supabase CLI se o projeto estiver linkado e voce tiver as credenciais de banco:

```bash
npx supabase db push
```

As migrations criam:

- `profiles`
- `projects`
- `technologies`
- `project_technologies`
- `certificates`
- `experiences`
- coluna `certificates.featured`
- funcao `is_admin()`
- triggers de `updated_at`
- trigger `handle_new_auth_user()` para criar profile automaticamente quando um usuario nasce em `auth.users`
- RLS e policies sem escrita publica
- leitura publica de `profiles` limitada às colunas usadas pelo portfólio

Visitantes leem apenas registros com `active = true`. Escrita e permitida apenas para usuarios autenticados cujo profile tenha `role = 'admin'`.

## Seed Real Do Portfolio

O conteudo inicial do portfolio nao deve ficar apenas no `fallbackPortfolio.ts`. Para transformar os dados iniciais em registros reais no Supabase, aplique:

```sql
-- supabase/seed-portfolio-content.sql
```

Esse seed e idempotente:

- pode ser executado mais de uma vez;
- nao usa `truncate`;
- nao apaga cadastros feitos pelo painel;
- nao remove relacoes manuais;
- nao duplica os registros iniciais quando executado novamente;
- preenche projetos, tecnologias, relacoes `project_technologies`, certificados e experiencias iniciais.

O arquivo `supabase/seed.sql` tambem contem o seed inicial, mas para sincronizar conteudo real sem sobrescrever edicoes do admin prefira `supabase/seed-portfolio-content.sql`.

## Fallback Local

`src/data/fallbackPortfolio.ts` existe apenas como rede de seguranca. Ele deve ser usado quando:

- o Supabase estiver indisponivel;
- as tabelas ainda nao existirem;
- houver erro real de conexao;
- houver erro de permissao/policy impedindo a leitura publica.

Se o Supabase responder com sucesso e uma tabela retornar array vazio, o app respeita o banco vazio em vez de misturar automaticamente dados do fallback. Portanto, aplique `supabase/seed-portfolio-content.sql` no banco remoto para que os itens iniciais aparecam junto dos novos cadastros.

## Usuario Admin

Para acessar o painel, o usuario precisa existir em Supabase Auth e tambem ter uma linha em `public.profiles` com `role = 'admin'` e `active = true`.

Fluxo recomendado:

1. Aplique as migrations.
2. Crie o usuario `devjoaog@outlook.com` em Supabase Auth.
3. Execute `supabase/promote-devjoaog-admin.sql` no SQL Editor do Supabase.
4. Execute `supabase/seed-portfolio-content.sql` para popular o conteudo real inicial.

Se o painel mostrar `Seu usuario ainda nao possui permissao de administrador.`, confirme no Supabase:

- o usuario `devjoaog@outlook.com` existe em Auth;
- a tabela `public.profiles` possui a coluna `role`;
- existe uma linha em `public.profiles` para esse usuario com `role = 'admin'`;
- se a coluna `active` existir, ela esta como `true`;
- as policies de escrita continuam usando `public.is_admin()` e nao ha policy de escrita publica.

## CMS

O painel fica em:

```text
/admin
```

Apos login com o usuario admin, o painel gerencia:

- Projetos
- Tecnologias
- Certificados
- Experiencias
- Perfil/configuracoes

### Projetos

Projetos usam o campo `cover_url`, mas o admin nao pede URL livre. O formulario oferece uma lista de imagens locais servidas a partir de `public/assets/projects`.

Para adicionar uma nova imagem de projeto:

1. Rode o projeto com `npm run dev`.
2. Abra `/admin/projects` e clique em `Novo projeto` ou edite um projeto.
3. No campo `Imagem local do projeto`, use `Adicionar nova imagem local`.
4. O Vite dev server salva o arquivo em `public/assets/projects` e preenche o `cover_url` automaticamente.

Esse upload local funciona no ambiente de desenvolvimento porque o Vite consegue escrever no workspace. Em deploy estatico, o navegador nao consegue gravar arquivos dentro do repositorio; nesse caso, adicione a imagem no projeto antes do build ou use um backend/storage dedicado.

`src/data/projectImages.ts` continua existindo como lista inicial/fallback, mas em desenvolvimento o painel tambem lista automaticamente os arquivos encontrados em `public/assets/projects`.

Novos projetos entram no final da lista automaticamente usando o maior `display_order` atual + 1.

As tecnologias de um projeto sao gerenciadas pela relacao `project_technologies`. Cadastre tecnologias primeiro, depois selecione os chips no formulario de projeto. Ao salvar, o CMS sincroniza as relacoes marcadas, incluindo remocoes.

### Tecnologias

Tecnologias preservam icones pelo campo `icon_url`. Use uma URL SVG/PNG servida pelo app ou por uma CDN confiavel, como devicons. O admin mostra preview do icone; se o icone estiver vazio ou quebrado, o site usa um fallback visual profissional.

### Perfil

O campo `Imagem de avatar` aceita URL externa ou caminho local dentro de `public`, por exemplo:

```text
/assets/images/DevJoaoG.png
```

Para imagens salvas como string no Supabase, prefira arquivos dentro de `public/assets`. Assim o navegador consegue carregar o asset tanto no desenvolvimento quanto na Vercel.

### Certificados

Certificados nao pedem imagem manual no admin. A secao publica usa um visual padrao com icone e tema dark red.

Campos importantes:

- `active`: controla se o certificado pode aparecer no publico.
- `featured`: marca o certificado como destaque.
- `certificate_url`: habilita o botao `Ver certificado`.

Regra publica:

- certificados com `active = false` nao aparecem;
- se houver certificados `active = true` e `featured = true`, a secao mostra os destacados;
- se nao houver destacados, a secao mostra os certificados ativos;
- se nao houver certificados ativos, a secao exibe um estado vazio discreto.

## Validacao

Antes de publicar alteracoes:

```bash
npm run typecheck
npm run build
```

Nunca commite `.env` real, tokens privados ou `service_role`.
