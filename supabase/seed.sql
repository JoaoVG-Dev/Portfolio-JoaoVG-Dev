-- Seed inicial do mini CMS do portfolio.
-- Crie primeiro o usuario admin em Supabase Auth com o e-mail abaixo.
-- Se o usuario ainda nao existir, o profile sera ignorado sem quebrar o seed.

alter table public.certificates
add column if not exists featured boolean default false;

with admin_user as (
  select id
  from auth.users
  where email = 'devjoaog@outlook.com'
  order by created_at
  limit 1
)
insert into public.profiles (
  id,
  name,
  title,
  bio,
  avatar_url,
  github_url,
  linkedin_url,
  whatsapp_url,
  email,
  role,
  active
)
select
  id,
  'João Vitor Guidoti',
  'Software engineer',
  'I''m a 21-year-old software developer passionate about building modern, functional web experiences. I hold a degree in Systems Analysis and Development from Estácio and I''m currently pursuing a Post-Graduate degree in Full Stack Development — always pushing forward and deepening my knowledge of the technologies shaping the digital future. I work with HTML, CSS, JavaScript, React, PHP, and Laravel, building projects from scratch with a focus on clean code, solid design, and great user experience. I''m open to remote opportunities and ready to collaborate on challenging projects that make a real impact.',
  '/assets/images/DevJoaoG.png',
  'https://github.com/DevJoao-G',
  'https://www.linkedin.com/in/devjoaog',
  'https://wa.me/5521979382423',
  'devjoaog@outlook.com',
  'admin',
  true
from admin_user
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url,
  github_url = excluded.github_url,
  linkedin_url = excluded.linkedin_url,
  whatsapp_url = excluded.whatsapp_url,
  email = excluded.email,
  role = excluded.role,
  active = excluded.active;

insert into public.technologies (
  id,
  name,
  category,
  level,
  icon_url,
  active,
  featured,
  display_order
) values
  ('10000000-0000-4000-8000-000000000001', 'HTML5', 'front-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', true, 10),
  ('10000000-0000-4000-8000-000000000002', 'CSS3', 'front-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', true, 20),
  ('10000000-0000-4000-8000-000000000003', 'JavaScript', 'front-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', true, 30),
  ('10000000-0000-4000-8000-000000000004', 'Bootstrap', 'front-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg', true, 40),
  ('10000000-0000-4000-8000-000000000005', 'React', 'front-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', true, 50),
  ('10000000-0000-4000-8000-000000000006', 'PHP', 'back-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', true, 60),
  ('10000000-0000-4000-8000-000000000007', 'Laravel', 'back-end', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg', true, 70),
  ('10000000-0000-4000-8000-000000000008', 'MySQL', 'database', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', true, 80),
  ('10000000-0000-4000-8000-000000000009', 'Figma', 'design', 'intermediate', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', true, 90)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  level = excluded.level,
  icon_url = excluded.icon_url,
  active = excluded.active,
  display_order = excluded.display_order;

insert into public.projects (
  id,
  title,
  slug,
  short_description,
  description,
  cover_url,
  github_url,
  deploy_url,
  status,
  featured,
  active,
  display_order
) values
  (
    '20000000-0000-4000-8000-000000000001',
    'KiTenis',
    'kitenis',
    'E-commerce',
    'Loja virtual para venda de tênis com experiência de catálogo e compra.',
    '/assets/projects/E-commerce _ KiTenis.png',
    'https://github.com/DevJoao-G/KiTenis',
    null,
    'finalizado',
    true,
    true,
    10
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'KiCorte',
    'kicorte',
    'SaaS para barbearias',
    'Produto SaaS para gestão de agenda, clientes e serviços de barbearias.',
    '/assets/projects/Saas _ KiCorte.png',
    null,
    null,
    'em desenvolvimento',
    true,
    true,
    20
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Loja Meteora',
    'loja-meteora',
    'Alura',
    'Loja virtual responsiva construída durante estudos na Alura.',
    '/assets/projects/Loja Virtual _ Meteora.png',
    null,
    'https://devjoao-g.github.io/Alura-Meteora/',
    'finalizado',
    true,
    true,
    30
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'Estante virtual de Livros',
    'estante-virtual',
    'Alura',
    'Estante de livros usando métodos de array em JavaScript.',
    '/assets/projects/Estante Virtual _ Alura.png',
    null,
    'https://devjoao-g.github.io/Alura-Metodos-DE-array/',
    'finalizado',
    true,
    true,
    40
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'ToDo-List',
    'todo-list',
    'Alura',
    'Lista de tarefas com interações essenciais de produtividade.',
    '/assets/projects/To-Do List _ Alura.png',
    null,
    'https://devjoao-g.github.io/Alura-ToDoList/',
    'finalizado',
    true,
    true,
    50
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    'Portfólio Pessoal',
    'portfolio-alura',
    'Alura',
    'Projeto de portfólio pessoal construído com HTML e CSS.',
    '/assets/projects/Portfolio _ Alura.png',
    null,
    'https://devjoao-g.github.io/Alura-HTML-CSS-Portfolio/',
    'finalizado',
    true,
    true,
    60
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  cover_url = excluded.cover_url,
  github_url = excluded.github_url,
  deploy_url = excluded.deploy_url,
  status = excluded.status,
  featured = excluded.featured,
  active = excluded.active,
  display_order = excluded.display_order;

insert into public.project_technologies (project_id, technology_id)
select p.id, t.id
from public.projects p
join public.technologies t on t.name in ('HTML5', 'CSS3', 'JavaScript')
where p.slug in ('loja-meteora', 'estante-virtual', 'todo-list', 'portfolio-alura')
on conflict do nothing;

insert into public.project_technologies (project_id, technology_id)
select p.id, t.id
from public.projects p
join public.technologies t on t.name in ('React', 'PHP', 'Laravel', 'MySQL')
where p.slug in ('kitenis', 'kicorte')
on conflict do nothing;

insert into public.certificates (
  id,
  title,
  institution,
  category,
  certificate_url,
  image_url,
  workload,
  completed_at,
  active,
  featured,
  display_order
) values (
  '30000000-0000-4000-8000-000000000001',
  'Análise e Desenvolvimento de Sistemas',
  'Estácio',
  'Graduação',
  null,
  null,
  'Graduação tecnológica',
  null,
  true,
  true,
  10
)
on conflict (id) do update set
  title = excluded.title,
  institution = excluded.institution,
  category = excluded.category,
  certificate_url = excluded.certificate_url,
  image_url = excluded.image_url,
  workload = excluded.workload,
  completed_at = excluded.completed_at,
  active = excluded.active,
  featured = excluded.featured,
  display_order = excluded.display_order;

insert into public.experiences (
  id,
  role,
  company,
  start_date,
  end_date,
  current,
  description,
  active,
  display_order
) values (
  '40000000-0000-4000-8000-000000000001',
  'Desenvolvedor Full Stack',
  'Projetos próprios e formação contínua',
  '2024-01-01',
  null,
  true,
  'Construção de interfaces, portfólios, e-commerces e produtos com React, PHP, Laravel e bancos relacionais.',
  true,
  10
)
on conflict (id) do update set
  role = excluded.role,
  company = excluded.company,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  current = excluded.current,
  description = excluded.description,
  active = excluded.active,
  display_order = excluded.display_order;
