import { useEffect, useState } from 'react';
import { Award, Code2, ExternalLink, ImageIcon } from 'lucide-react';
import { usePortfolioContent } from '../hooks/usePortfolioContent';
import '../styles/public.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Skills', href: '#skills' },
  { label: 'About me', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });
}

function ProjectImage({ src, title }: { src: string; title: string }) {
  const [hasError, setHasError] = useState(false);
  const canShowImage = Boolean(src) && !hasError;

  if (!canShowImage) {
    return (
      <div className="project-media-fallback" aria-label={`Imagem indisponível para ${title}`}>
        <ImageIcon size={28} />
        <span>{title}</span>
      </div>
    );
  }

  return <img src={src} alt={title} onError={() => setHasError(true)} />;
}

function TechnologyIcon({ src, name }: { src: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <span className="tech-icon-fallback" aria-label={name}>
        <Code2 size={22} />
      </span>
    );
  }

  return <img src={src} alt={name} width={24} height={24} onError={() => setHasError(true)} />;
}

function CertificateImage() {
  return (
    <div className="certificate-media-fallback">
      <Award size={30} />
    </div>
  );
}

export function PublicPortfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { content, isLoading } = usePortfolioContent();
  const { profile, technologies, projects, certificates } = content;
  const featuredTechnologies = technologies.filter((technology) => technology.isFeatured);
  const publishedProjects = projects.filter((project) => project.isPublished);
  const activeCertificates = certificates.filter((certificate) => certificate.isPublished);
  const featuredCertificates = activeCertificates.filter((certificate) => certificate.isFeatured);
  const visibleCertificates = featuredCertificates.length > 0 ? featuredCertificates : activeCertificates;

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const projectCards = document.querySelectorAll('.card-project, .certificate-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('show', entry.isIntersecting);
        });
      },
      { threshold: 0.35 },
    );

    projectCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [publishedProjects.length, visibleCertificates.length]);

  return (
    <div className="portfolio-page" aria-busy={isLoading}>
      <a className="skip-link" href="#home">
        Pular para conteúdo
      </a>

      <header className="site-header">
        <nav className="site-nav" aria-label="Navegação principal">
          <div className="nav-links">
            {navItems.map((item) => (
              <a className="nav-link" key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <button
            className={`hamburger${isMenuOpen ? ' is-open' : ''}`}
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobileMenu"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <nav
        className={`mobile-menu${isMenuOpen ? ' is-open' : ''}`}
        id="mobileMenu"
        aria-label="Menu de navegação mobile"
      >
        <button className="mobile-menu-close" type="button" aria-label="Fechar menu" onClick={closeMenu}>
          ×
        </button>
        <div className="mobile-menu-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main>
        <section id="home" className="Home">
          <div>
            <h1>
              Hi, it's<strong> João</strong>
              <br />
              I'm a <strong>Software engineer </strong>
            </h1>
            <p>{profile.summary}</p>
            <a className="home-button home-button-primary" href={profile.cvUrl} download>
              Baixar CV
            </a>
            <a className="home-button home-button-secondary" href={profile.githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="home-button home-button-secondary" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </section>

        <section id="skills" className="skills-section">
          <div className="carousel">
            {featuredTechnologies.slice(0, 9).map((skill) => (
              <div className="carousel-card" key={skill.id}>
                <p className="carousel-card-image">
                  <TechnologyIcon src={skill.iconUrl} name={skill.name} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="about-me">
          <div className="img">
            <img src={profile.avatarUrl} alt="DevJoaoG Animado" />
          </div>
          <div>
            <h1>About me</h1>
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section id="projects" className="projects">
          <h1>My Projects</h1>
          <div className="list-card-project">
            {publishedProjects.map((project) => {
              const projectHref = project.liveUrl ?? project.repositoryUrl ?? '#contact';
              const isExternal = projectHref.startsWith('http');

              return (
                <div className="card-project" key={project.id}>
                  <div className="project">
                    <div className="project-media">
                      <ProjectImage src={project.imageUrl} title={project.title} />
                    </div>
                    <div className="project-body">
                      <p>
                        {project.title} | {project.category}
                      </p>
                      {project.technologies.length > 0 && (
                        <div className="project-tech-list" aria-label="Tecnologias usadas">
                          {project.technologies.map((technology) => (
                            <span key={`${project.id}-${technology.id}`}>{technology.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <a
                      className="project-button"
                      href={projectHref}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noreferrer' : undefined}
                    >
                      View project
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="certifications" className="certifications-section" aria-labelledby="certifications-title">
          <div className="certifications-inner">
            <header className="certifications-header">
              <p>Credentials</p>
              <h1 id="certifications-title">Certifications</h1>
            </header>

            <div className="certificates-grid">
              {visibleCertificates.length === 0 && (
                <p className="certificates-empty">Certificações em atualização.</p>
              )}

              {visibleCertificates.map((certificate) => {
                const completedAt = formatDate(certificate.completedAt);

                return (
                  <article className="certificate-card" key={certificate.id}>
                    <div className="certificate-media">
                      <CertificateImage />
                    </div>
                    <div className="certificate-content">
                      <div>
                        <p className="certificate-kicker">{certificate.category ?? 'Certificate'}</p>
                        <h2>{certificate.title}</h2>
                        {certificate.institution && <p>{certificate.institution}</p>}
                      </div>

                      <div className="certificate-meta">
                        {certificate.workload && <span>{certificate.workload}</span>}
                        {completedAt && <span>{completedAt}</span>}
                      </div>

                      {certificate.certificateUrl && (
                        <a
                          className="certificate-link"
                          href={certificate.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver certificado
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-container">
            <header className="contact-header">
              <h2 id="contact-title">Let's work together</h2>
              <p>
                Have a project in mind, a role to fill, or just want to say hi? Send me a message
                and I'll get back to you as soon as possible.
              </p>
            </header>

            <div className="contact-content">
              <form className="contact-form" action="#" method="post" autoComplete="on">
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" placeholder="Your name" required />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <input id="subject" name="subject" type="text" placeholder="What is this about?" />
                </div>
                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>
                <button type="submit" className="contact-submit">
                  Send message
                </button>
              </form>

              <aside className="contact-aside" aria-label="Contact details">
                <div className="contact-card">
                  <h3>Contact</h3>
                  <p>
                    Prefer email? Reach me at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
                  </p>
                  <p>
                    Based in <span>Brazil</span> — open to remote opportunities.
                  </p>
                </div>
                <div className="contact-card">
                  <h3>Social</h3>
                  <ul className="contact-links">
                    <li>
                      <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a href={profile.instagramUrl} target="_blank" rel="noreferrer">
                        Instagram
                      </a>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#home" className="footer-logo" aria-label="Back to top">
              <span className="footer-name">{profile.name}</span>
            </a>
            <p className="footer-tagline">
              Front-end Developer • Building clean, fast, accessible web experiences.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label.replace('About me', 'About')}
              </a>
            ))}
          </nav>

          <div className="footer-contact">
            <h2 className="footer-title">Let's talk</h2>
            <ul className="footer-links">
              <li>
                <a href={`mailto:${profile.email}`} rel="noopener">
                  {profile.email}
                </a>
              </li>
              <li>
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href={profile.whatsappUrl} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
            </ul>
            <div className="footer-cta">
              <a className="footer-btn" href={`mailto:${profile.email}?subject=Let's%20work%20together`}>
                Hire me
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <small>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
}
