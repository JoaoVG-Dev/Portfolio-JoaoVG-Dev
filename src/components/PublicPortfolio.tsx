import { useEffect, useState } from 'react';
import { Award, Code2, ExternalLink, ImageIcon, UserRound } from 'lucide-react';
import { usePortfolioContent } from '../hooks/usePortfolioContent';
import {
  toSafeExternalUrl,
  toSafeImageSrc,
  toSafeMailtoHref,
  toSafePublicPath,
} from '../lib/urlSafety';
import '../styles/public.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Skills', href: '#skills' },
  { label: 'About me', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];
const fallbackCvUrl = '/assets/cv/Joao_Vitor_Guidoti_CV.pdf';

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });
}

function compareFeaturedFirst<T extends { isFeatured: boolean; sortOrder: number }>(first: T, second: T) {
  const featuredDifference = Number(second.isFeatured) - Number(first.isFeatured);

  if (featuredDifference !== 0) {
    return featuredDifference;
  }

  return first.sortOrder - second.sortOrder;
}

function compareCertificates(
  first: { completedAt: string | null; isFeatured: boolean; sortOrder: number },
  second: { completedAt: string | null; isFeatured: boolean; sortOrder: number },
) {
  const orderDifference = compareFeaturedFirst(first, second);

  if (orderDifference !== 0) {
    return orderDifference;
  }

  return (second.completedAt ?? '').localeCompare(first.completedAt ?? '');
}

function ProjectImage({ src, title }: { src: string; title: string }) {
  const [hasError, setHasError] = useState(false);
  const safeSrc = toSafeImageSrc(src);
  const canShowImage = Boolean(safeSrc) && !hasError;

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!canShowImage) {
    return (
      <div className="project-media-fallback" aria-label={`Imagem indisponível para ${title}`}>
        <ImageIcon size={28} />
        <span>{title}</span>
      </div>
    );
  }

  return <img src={safeSrc} alt={title} loading="lazy" decoding="async" onError={() => setHasError(true)} />;
}

function TechnologyIcon({ src, name }: { src: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const safeSrc = toSafeImageSrc(src);

  if (!safeSrc || hasError) {
    return (
      <span className="tech-icon-fallback" aria-label={name}>
        <Code2 size={22} />
      </span>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={name}
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

function CertificateImage() {
  return (
    <div className="certificate-media-fallback">
      <Award size={30} />
    </div>
  );
}

function ProfileAvatar({ name, src }: { name: string; src: string }) {
  const [hasError, setHasError] = useState(false);
  const safeSrc = toSafeImageSrc(src);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!safeSrc || hasError) {
    return (
      <div className="about-avatar-fallback" aria-label={`Avatar indisponível para ${name}`}>
        <UserRound size={34} />
      </div>
    );
  }

  return <img src={safeSrc} alt={`Avatar de ${name}`} loading="lazy" decoding="async" onError={() => setHasError(true)} />;
}

export function PublicPortfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { content, isLoading } = usePortfolioContent();
  const projectAnimationCount = content?.projects.filter((project) => project.active === true).length ?? 0;
  const certificateAnimationCount =
    content?.certificates.filter((certificate) => certificate.active === true).length ?? 0;

  useEffect(() => {
    if (!content) {
      return undefined;
    }

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
  }, [content, projectAnimationCount, certificateAnimationCount]);

  if (!content) {
    return (
      <div className="portfolio-page portfolio-page-loading" aria-busy="true">
        <div className="public-loading" role="status">
          Carregando portfolio...
        </div>
      </div>
    );
  }

  const { profile, technologies, projects, certificates } = content;
  const featuredTechnologies = technologies.filter((technology) => technology.isFeatured);
  const publishedProjects = [...projects]
    .filter((project) => project.active === true)
    .sort(compareFeaturedFirst);
  const visibleCertificates = [...certificates]
    .filter((certificate) => certificate.active === true)
    .sort(compareCertificates);
  const githubUrl = toSafeExternalUrl(profile.githubUrl) ?? '#contact';
  const linkedinUrl = toSafeExternalUrl(profile.linkedinUrl) ?? '#contact';
  const instagramUrl = toSafeExternalUrl(profile.instagramUrl) ?? '#contact';
  const whatsappUrl = toSafeExternalUrl(profile.whatsappUrl) ?? '#contact';
  const cvUrl = toSafePublicPath(profile.cvUrl) ?? fallbackCvUrl;
  const emailHref = toSafeMailtoHref(profile.email) ?? '#contact';
  const hireHref = emailHref.startsWith('mailto:')
    ? `${emailHref}?subject=Let's%20work%20together`
    : '#contact';
  const githubIsExternal = githubUrl.startsWith('http');
  const linkedinIsExternal = linkedinUrl.startsWith('http');
  const instagramIsExternal = instagramUrl.startsWith('http');
  const whatsappIsExternal = whatsappUrl.startsWith('http');

  const closeMenu = () => setIsMenuOpen(false);

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
            <a className="home-button home-button-primary" href={cvUrl} download>
              Baixar CV
            </a>
            <a
              className="home-button home-button-secondary"
              href={githubUrl}
              target={githubIsExternal ? '_blank' : undefined}
              rel={githubIsExternal ? 'noopener noreferrer' : undefined}
            >
              GitHub
            </a>
            <a
              className="home-button home-button-secondary"
              href={linkedinUrl}
              target={linkedinIsExternal ? '_blank' : undefined}
              rel={linkedinIsExternal ? 'noopener noreferrer' : undefined}
            >
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
            <ProfileAvatar name={profile.name} src={profile.avatarUrl} />
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
              const projectHref =
                toSafeExternalUrl(project.liveUrl) ?? toSafeExternalUrl(project.repositoryUrl) ?? '#contact';
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
                      rel={isExternal ? 'noopener noreferrer' : undefined}
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
                const certificateHref = toSafeExternalUrl(certificate.certificateUrl);

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

                      {certificateHref && (
                        <a
                          className="certificate-link"
                          href={certificateHref}
                          target="_blank"
                          rel="noopener noreferrer"
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
                    Prefer email? Reach me at <a href={emailHref}>{profile.email}</a>.
                  </p>
                  <p>
                    Based in <span>Brazil</span> — open to remote opportunities.
                  </p>
                </div>
                <div className="contact-card">
                  <h3>Social</h3>
                  <ul className="contact-links">
                    <li>
                      <a
                        href={linkedinUrl}
                        target={linkedinIsExternal ? '_blank' : undefined}
                        rel={linkedinIsExternal ? 'noopener noreferrer' : undefined}
                      >
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a
                        href={githubUrl}
                        target={githubIsExternal ? '_blank' : undefined}
                        rel={githubIsExternal ? 'noopener noreferrer' : undefined}
                      >
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a
                        href={instagramUrl}
                        target={instagramIsExternal ? '_blank' : undefined}
                        rel={instagramIsExternal ? 'noopener noreferrer' : undefined}
                      >
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
                <a href={emailHref} rel="noopener">
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={linkedinUrl}
                  target={linkedinIsExternal ? '_blank' : undefined}
                  rel={linkedinIsExternal ? 'noopener noreferrer' : undefined}
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={githubUrl}
                  target={githubIsExternal ? '_blank' : undefined}
                  rel={githubIsExternal ? 'noopener noreferrer' : undefined}
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target={whatsappIsExternal ? '_blank' : undefined}
                  rel={whatsappIsExternal ? 'noopener noreferrer' : undefined}
                >
                  WhatsApp
                </a>
              </li>
            </ul>
            <div className="footer-cta">
              <a className="footer-btn" href={hireHref}>
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
