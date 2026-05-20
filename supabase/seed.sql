insert into public.profiles (
  name,
  role,
  headline,
  summary,
  bio,
  email,
  location,
  whatsapp_url,
  github_url,
  linkedin_url,
  instagram_url,
  cv_url,
  avatar_url,
  is_published
) values (
  'João Vitor Guidoti',
  'Software engineer',
  'João Vitor Guidoti constrói produtos digitais limpos, rápidos e funcionais.',
  'Desenvolvimento front-end e full stack com React, PHP e Laravel, conectando design, código e entrega com atenção real à experiência.',
  array[
    'Tenho formação em Análise e Desenvolvimento de Sistemas pela Estácio e sigo aprofundando minha prática em desenvolvimento full stack. Gosto de transformar ideias em produtos digitais com código claro, design sólido e uma experiência que faça sentido para quem usa.',
    'Trabalho com HTML, CSS, JavaScript, React, PHP e Laravel, criando desde landing pages até aplicações com painel administrativo e integrações.'
  ],
  'devjoaog@outlook.com',
  'Brasil, remoto',
  'https://wa.me/55219793824423',
  'https://github.com/JoaoXG-Dev',
  'https://www.linkedin.com/in/devjoaog',
  'https://instagram.com/joao.dev__',
  '/assets/cv/Joao_Vitor_Guidoti_CV.pdf',
  '/assets/images/DevJoaoG.png',
  true
);

insert into public.technologies (name, icon_url, category, sort_order, is_featured) values
  ('HTML5', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', 'front-end', 10, true),
  ('CSS3', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', 'front-end', 20, true),
  ('JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', 'front-end', 30, true),
  ('TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', 'front-end', 40, true),
  ('React', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', 'front-end', 50, true),
  ('PHP', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', 'back-end', 60, true),
  ('Laravel', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg', 'back-end', 70, true),
  ('MySQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', 'database', 80, true),
  ('Figma', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', 'design', 90, true);

insert into public.projects (
  title,
  slug,
  category,
  description,
  image_url,
  live_url,
  repository_url,
  sort_order,
  is_featured,
  is_published
) values
  ('KiTenis', 'kitenis', 'E-commerce', 'Loja virtual para venda de tênis com experiência de catálogo e compra.', '/assets/projects/E-commerce _ KiTenis.png', null, 'https://github.com/DevJoao-G/KiTenis', 10, true, true),
  ('KiCorte', 'kicorte', 'SaaS para barbearias', 'Produto SaaS para gestão de agenda, clientes e serviços de barbearias.', '/assets/projects/Saas _ KiCorte.png', null, null, 20, true, true),
  ('Loja Meteora', 'loja-meteora', 'Alura', 'Loja virtual responsiva construída durante estudos na Alura.', '/assets/projects/Loja Virtual _ Meteora.png', 'https://devjoao-g.github.io/Alura-Meteora/', null, 30, true, true),
  ('Estante Virtual', 'estante-virtual', 'Alura', 'Estante de livros usando métodos de array em JavaScript.', '/assets/projects/Estante Virtual _ Alura.png', 'https://devjoao-g.github.io/Alura-Metodos-DE-array/', null, 40, true, true),
  ('ToDo List', 'todo-list', 'Alura', 'Lista de tarefas com interações essenciais de produtividade.', '/assets/projects/To-Do List _ Alura.png', 'https://devjoao-g.github.io/Alura-ToDoList/', null, 50, true, true),
  ('Portfólio Pessoal', 'portfolio-alura', 'Alura', 'Projeto de portfólio pessoal construído com HTML e CSS.', '/assets/projects/Portfolio _ Alura.png', 'https://devjoao-g.github.io/Alura-HTML-CSS-Portfolio/', null, 60, true, true);

insert into public.certificates (title, issuer, issued_at, credential_url, image_url, sort_order, is_published) values
  ('Análise e Desenvolvimento de Sistemas', 'Estácio', null, null, null, 10, true);

insert into public.experiences (
  company,
  role,
  location,
  start_date,
  end_date,
  description,
  type,
  sort_order,
  is_published
) values (
  'Projetos próprios e formação contínua',
  'Desenvolvedor Full Stack',
  'Remoto',
  '2024-01-01',
  null,
  'Construção de interfaces, portfólios, e-commerces e produtos com React, PHP, Laravel e bancos relacionais.',
  'personal',
  10,
  true
);

