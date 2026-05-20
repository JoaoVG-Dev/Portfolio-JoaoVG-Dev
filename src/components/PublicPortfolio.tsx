import { useState } from 'react';
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Code2,
  Download,
  Mail,
  MapPin,
  Menu,
  Send,
  X,
} from 'lucide-react';
import { usePortfolioContent } from '../hooks/usePortfolioContent';
import '../styles/public.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Skills', href: '#skills' },
  { label: 'Sobre', href: '#about' },
  { label: 'Jornada', href: '#journey' },
  { label: 'Projetos', href: '#projects' },
  { label: 'Contato', href: '#contact' },
];

export function PublicPortfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { content, isLoading } = usePortfolioContent();
  const { profile, technologies, projects } = content;
  const featuredTechnologies = technologies.filter((technology) => technology.isFeatured);
  const publishedProjects = projects.filter((project) => project.isPublished);
  const publishedExperiences = content.experiences.filter((experience) => experience.isPublished);
  const publishedCertificates = content.certificates.filter((certificate) => certificate.isPublished);
  const stats = [
    { value: String(publishedProjects.length).padStart(2, '0'), label: 'projetos publicados' },
    { value: String(featuredTechnologies.length).padStart(2, '0'), label: 'tecnologias' },
    { value: 'Remoto', label: 'disponibilidade' },
  ];

  const closeMenu = () => setIsMenuOpen(false);
  const formatDate = (date: string | null) => {
    if (!date) {
      return 'Atual';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(date));
  };

  return (
    <div className="portfolio-page" aria-busy={isLoading}>
      <a className="skip-link" href="#home">
        Pular para conteúdo
      </a>

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
            <p className="eyebrow">{profile.role}</p>
            <h1 id="hero-title">{profile.headline}</h1>
            <p className="hero-copy">{profile.summary}</p>
            <div className="hero-actions">
              <a className="button primary-button" href="#projects">
                Ver projetos
                <ArrowUpRight size={18} />
              </a>
              <a
                className="button ghost-button"
                href={profile.cvUrl}
                download
              >
                <Download size={18} />
                Baixar CV
              </a>
            </div>
            <div className="social-row" aria-label="Redes sociais">
              <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                <Code2 size={19} />
                GitHub
              </a>
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                <BriefcaseBusiness size={19} />
                LinkedIn
              </a>
            </div>
          </div>

          <div className="hero-media" aria-hidden="true">
            <img src={profile.avatarUrl} alt="" />
          </div>
        </section>

        <section id="skills" className="skills-section" aria-labelledby="skills-title">
          <div className="section-heading">
            <p className="eyebrow">Stack</p>
            <h2 id="skills-title">Tecnologias que uso para construir</h2>
          </div>
          <div className="skills-track">
            {[...featuredTechnologies, ...featuredTechnologies].map((skill, index) => (
              <div className="skill-pill" key={`${skill.name}-${index}`}>
                <img src={skill.iconUrl} alt="" width={24} height={24} />
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="about-section" aria-labelledby="about-title">
          <div className="about-copy">
            <p className="eyebrow">Sobre</p>
            <h2 id="about-title">Desenvolvedor focado em interfaces modernas e sistemas úteis.</h2>
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
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

        <section id="journey" className="journey-section" aria-labelledby="journey-title">
          <div className="section-heading">
            <p className="eyebrow">Jornada</p>
            <h2 id="journey-title">Experiências e formação em evolução constante</h2>
          </div>

          <div className="journey-grid">
            <div className="timeline-list">
              {publishedExperiences.map((experience) => (
                <article className="timeline-item" key={experience.id}>
                  <CalendarDays size={20} />
                  <div>
                    <span>
                      {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                    </span>
                    <h3>{experience.role}</h3>
                    <strong>{experience.company}</strong>
                    <p>{experience.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="certificate-list">
              {publishedCertificates.map((certificate) => (
                <article className="certificate-item" key={certificate.id}>
                  <Award size={22} />
                  <div>
                    <span>{certificate.issuer}</span>
                    <h3>{certificate.title}</h3>
                    {certificate.credentialUrl && (
                      <a href={certificate.credentialUrl} target="_blank" rel="noreferrer">
                        Ver credencial
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="projects-section" aria-labelledby="projects-title">
          <div className="section-heading centered">
            <p className="eyebrow">Projetos</p>
            <h2 id="projects-title">Trabalhos selecionados</h2>
          </div>

          <div className="projects-grid">
            {publishedProjects.map((project) => {
              const projectHref = project.liveUrl ?? project.repositoryUrl ?? '#contact';
              const isExternal = projectHref.startsWith('http');

              return (
              <article className="project-card" key={project.title}>
                <img src={project.imageUrl} alt={`Preview do projeto ${project.title}`} />
                <div className="project-body">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <a href={projectHref} target={isExternal ? '_blank' : undefined} rel="noreferrer">
                    Ver projeto
                    <ArrowUpRight size={17} />
                  </a>
                </div>
              </article>
              );
            })}
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
              <a className="contact-card" href={`mailto:${profile.email}`}>
                <Mail size={20} />
                <span>{profile.email}</span>
              </a>
              <a
                className="contact-card"
                href={profile.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Send size={20} />
                <span>WhatsApp</span>
              </a>
              <div className="contact-card">
                <MapPin size={20} />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href="#home">Voltar ao topo</a>
      </footer>
    </div>
  );
}
