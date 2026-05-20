import { useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Send,
  X,
} from 'lucide-react';
import '../styles/public.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Skills', href: '#skills' },
  { label: 'Sobre', href: '#about' },
  { label: 'Projetos', href: '#projects' },
  { label: 'Contato', href: '#contact' },
];

const skills = [
  {
    name: 'HTML5',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  },
  {
    name: 'CSS3',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  },
  {
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  },
  {
    name: 'TypeScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  },
  {
    name: 'React',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  },
  {
    name: 'PHP',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  },
  {
    name: 'Laravel',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
  },
  {
    name: 'MySQL',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  },
  {
    name: 'Figma',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  },
];

const projects = [
  {
    title: 'KiTenis',
    category: 'E-commerce',
    image: '/assets/projects/E-commerce _ KiTenis.png',
    href: 'https://github.com/DevJoao-G/KiTenis',
  },
  {
    title: 'KiCorte',
    category: 'SaaS para barbearias',
    image: '/assets/projects/Saas _ KiCorte.png',
    href: '#contact',
  },
  {
    title: 'Loja Meteora',
    category: 'Alura',
    image: '/assets/projects/Loja Virtual _ Meteora.png',
    href: 'https://devjoao-g.github.io/Alura-Meteora/',
  },
  {
    title: 'Estante Virtual',
    category: 'Alura',
    image: '/assets/projects/Estante Virtual _ Alura.png',
    href: 'https://devjoao-g.github.io/Alura-Metodos-DE-array/',
  },
  {
    title: 'ToDo List',
    category: 'Alura',
    image: '/assets/projects/To-Do List _ Alura.png',
    href: 'https://devjoao-g.github.io/Alura-ToDoList/',
  },
  {
    title: 'Portfólio Pessoal',
    category: 'Alura',
    image: '/assets/projects/Portfolio _ Alura.png',
    href: 'https://devjoao-g.github.io/Alura-HTML-CSS-Portfolio/',
  },
];

const stats = [
  { value: '21', label: 'anos' },
  { value: 'Full stack', label: 'formação em andamento' },
  { value: 'Remoto', label: 'disponibilidade' },
];

export function PublicPortfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="portfolio-page">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Voltar para o início">
          <span>JoãoVG</span>
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="admin-link" href="/admin">
          CMS
        </a>

        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {isMenuOpen && (
        <nav className="mobile-nav" aria-label="Menu mobile">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a href="/admin" onClick={closeMenu}>
            CMS
          </a>
        </nav>
      )}

      <main>
        <section id="home" className="hero-section" aria-labelledby="hero-title">
          <div className="hero-content">
            <p className="eyebrow">Software engineer</p>
            <h1 id="hero-title">
              João Vitor Guidoti constrói produtos digitais limpos, rápidos e
              funcionais.
            </h1>
            <p className="hero-copy">
              Desenvolvimento front-end e full stack com React, PHP e Laravel,
              conectando design, código e entrega com atenção real à experiência.
            </p>
            <div className="hero-actions">
              <a className="button primary-button" href="#projects">
                Ver projetos
                <ArrowUpRight size={18} />
              </a>
              <a
                className="button ghost-button"
                href="/assets/cv/Joao_Vitor_Guidoti_CV.pdf"
                download
              >
                <Download size={18} />
                Baixar CV
              </a>
            </div>
            <div className="social-row" aria-label="Redes sociais">
              <a href="https://github.com/JoaoXG-Dev" target="_blank" rel="noreferrer">
                <Github size={19} />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/devjoaog"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={19} />
                LinkedIn
              </a>
            </div>
          </div>

          <div className="hero-media" aria-hidden="true">
            <img src="/assets/images/DevJoaoG.png" alt="" />
          </div>
        </section>

        <section id="skills" className="skills-section" aria-labelledby="skills-title">
          <div className="section-heading">
            <p className="eyebrow">Stack</p>
            <h2 id="skills-title">Tecnologias que uso para construir</h2>
          </div>
          <div className="skills-track">
            {[...skills, ...skills].map((skill, index) => (
              <div className="skill-pill" key={`${skill.name}-${index}`}>
                <img src={skill.icon} alt="" width={24} height={24} />
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="about-section" aria-labelledby="about-title">
          <div className="about-copy">
            <p className="eyebrow">Sobre</p>
            <h2 id="about-title">Desenvolvedor focado em interfaces modernas e sistemas úteis.</h2>
            <p>
              Tenho formação em Análise e Desenvolvimento de Sistemas pela Estácio e
              sigo aprofundando minha prática em desenvolvimento full stack. Gosto de
              transformar ideias em produtos digitais com código claro, design sólido e
              uma experiência que faça sentido para quem usa.
            </p>
            <p>
              Trabalho com HTML, CSS, JavaScript, React, PHP e Laravel, criando desde
              landing pages até aplicações com painel administrativo e integrações.
            </p>
          </div>

          <div className="stats-grid" aria-label="Resumo profissional">
            {stats.map((stat) => (
              <div className="stat-item" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="projects-section" aria-labelledby="projects-title">
          <div className="section-heading centered">
            <p className="eyebrow">Projetos</p>
            <h2 id="projects-title">Trabalhos selecionados</h2>
          </div>

          <div className="projects-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <img src={project.image} alt={`Preview do projeto ${project.title}`} />
                <div className="project-body">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <a href={project.href} target={project.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    Ver projeto
                    <ArrowUpRight size={17} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-panel">
            <div>
              <p className="eyebrow">Contato</p>
              <h2 id="contact-title">Vamos construir algo com presença e propósito.</h2>
              <p>
                Aberto a oportunidades remotas, projetos freelance e colaborações em
                produtos digitais.
              </p>
            </div>

            <div className="contact-actions">
              <a className="contact-card" href="mailto:devjoaog@outlook.com">
                <Mail size={20} />
                <span>devjoaog@outlook.com</span>
              </a>
              <a
                className="contact-card"
                href="https://wa.me/55219793824423"
                target="_blank"
                rel="noreferrer"
              >
                <Send size={20} />
                <span>WhatsApp</span>
              </a>
              <div className="contact-card">
                <MapPin size={20} />
                <span>Brasil, remoto</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} João Vitor Guidoti</span>
        <a href="#home">Voltar ao topo</a>
      </footer>
    </div>
  );
}

