import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { Award, ChevronLeft, ChevronRight, Code2, ExternalLink, ImageIcon, UserRound } from 'lucide-react';
import {
  ALL_CERTIFICATE_CATEGORY,
  CERTIFICATE_CATEGORIES,
  type CertificateCategory,
  type CertificateCategoryFilter,
  normalizeCertificateCategory,
} from '../config/certificateCategories';
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
const certificatesPerPage = 6;

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pageSet = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = Array.from(pageSet)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second);

  return pages.reduce<Array<number | 'ellipsis'>>((items, page) => {
    const previousItem = items.at(-1);

    if (typeof previousItem === 'number' && page - previousItem > 1) {
      items.push('ellipsis');
    }

    items.push(page);
    return items;
  }, []);
}

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
  const [selectedCertificateCategory, setSelectedCertificateCategory] =
    useState<CertificateCategoryFilter>(ALL_CERTIFICATE_CATEGORY);
  const [certificatePage, setCertificatePage] = useState(1);
  const { content, isLoading } = usePortfolioContent();

  const publishedProjects = useMemo(
    () =>
      content
        ? [...content.projects]
            .filter((project) => project.active === true)
            .sort(compareFeaturedFirst)
        : [],
    [content],
  );

  const visibleCertificates = useMemo(
    () =>
      content
        ? [...content.certificates]
            .filter((certificate) => certificate.active === true)
            .sort(compareCertificates)
        : [],
    [content],
  );

  const certificateCategoryCounts = useMemo(() => {
    const counts = CERTIFICATE_CATEGORIES.reduce<Record<CertificateCategory, number>>((categoryCounts, category) => {
      categoryCounts[category] = 0;
      return categoryCounts;
    }, {} as Record<CertificateCategory, number>);

    visibleCertificates.forEach((certificate) => {
      counts[normalizeCertificateCategory(certificate.category)] += 1;
    });

    return counts;
  }, [visibleCertificates]);

  const activeCertificateCategoryFilters = useMemo<CertificateCategoryFilter[]>(
    () => [
      ALL_CERTIFICATE_CATEGORY,
      ...CERTIFICATE_CATEGORIES.filter((category) => certificateCategoryCounts[category] > 0),
    ],
    [certificateCategoryCounts],
  );

  const filteredCertificates = useMemo(
    () =>
      selectedCertificateCategory === ALL_CERTIFICATE_CATEGORY
        ? visibleCertificates
        : visibleCertificates.filter(
            (certificate) => normalizeCertificateCategory(certificate.category) === selectedCertificateCategory,
          ),
    [selectedCertificateCategory, visibleCertificates],
  );

  const totalCertificatePages = Math.max(1, Math.ceil(filteredCertificates.length / certificatesPerPage));
  const certificatePaginationItems = useMemo(
    () => getPaginationItems(certificatePage, totalCertificatePages),
    [certificatePage, totalCertificatePages],
  );
  const paginatedCertificates = useMemo(() => {
    const startIndex = (certificatePage - 1) * certificatesPerPage;

    return filteredCertificates.slice(startIndex, startIndex + certificatesPerPage);
  }, [certificatePage, filteredCertificates]);
  const shouldShowCertificatePagination = filteredCertificates.length > certificatesPerPage;
  const projectAnimationKey = publishedProjects.map((project) => project.id).join('|');
  const certificateAnimationKey = paginatedCertificates.map((certificate) => certificate.id).join('|');

  useEffect(() => {
    if (!content) {
      return undefined;
    }

    const projectCards = document.querySelectorAll('.card-project, .certificate-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.18 },
    );

    projectCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [content, projectAnimationKey, certificateAnimationKey]);

  useEffect(() => {
    setCertificatePage(1);
  }, [selectedCertificateCategory]);

  useEffect(() => {
    if (!activeCertificateCategoryFilters.includes(selectedCertificateCategory)) {
      setSelectedCertificateCategory(ALL_CERTIFICATE_CATEGORY);
    }
  }, [activeCertificateCategoryFilters, selectedCertificateCategory]);

  useEffect(() => {
    if (certificatePage > totalCertificatePages) {
      setCertificatePage(totalCertificatePages);
    }
  }, [certificatePage, totalCertificatePages]);

  useEffect(() => {
    if (!content || window.location.hash.length <= 1) {
      return;
    }

    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' });
    });
  }, [content]);

  if (!content) {
    return (
      <div className="portfolio-page portfolio-page-loading" aria-busy="true">
        <div className="public-loading" role="status">
          Carregando portfolio...
        </div>
      </div>
    );
  }

  const { profile, technologies } = content;
  const featuredTechnologies = technologies.filter((technology) => technology.isFeatured);
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
  const selectCertificateCategory = (category: CertificateCategoryFilter) => {
    setSelectedCertificateCategory(category);
    setCertificatePage(1);
  };

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

            <div className="certificate-filter-bar" role="group" aria-label="Filtrar certificados por categoria">
              {activeCertificateCategoryFilters.map((category) => {
                const isActive = selectedCertificateCategory === category;
                const count =
                  category === ALL_CERTIFICATE_CATEGORY
                    ? visibleCertificates.length
                    : certificateCategoryCounts[category];

                return (
                  <button
                    className={`certificate-filter-button${isActive ? ' is-active' : ''}`}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${category}: ${count} certificados`}
                    key={category}
                    onClick={() => selectCertificateCategory(category)}
                  >
                    {category}
                    <span className="certificate-filter-count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="certificates-grid" aria-live="polite">
              {filteredCertificates.length === 0 && (
                <p className="certificates-empty">Certificações em atualização.</p>
              )}

              {paginatedCertificates.map((certificate, index) => {
                const completedAt = formatDate(certificate.completedAt);
                const certificateHref = toSafeExternalUrl(certificate.certificateUrl);
                const certificateCategory = normalizeCertificateCategory(certificate.category);

                return (
                  <article
                    className="certificate-card"
                    key={certificate.id}
                    style={
                      {
                        '--certificate-reveal-delay': `${Math.min(index * 55, 275)}ms`,
                      } as CSSProperties
                    }
                  >
                    <div className="certificate-media">
                      <CertificateImage />
                    </div>
                    <div className="certificate-content">
                      <div>
                        <p className="certificate-kicker">{certificateCategory}</p>
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

            {shouldShowCertificatePagination && (
              <nav className="certificates-pagination" aria-label="Paginação de certificados">
                <button
                  className="certificate-page-control"
                  type="button"
                  disabled={certificatePage === 1}
                  onClick={() => setCertificatePage((currentPage) => Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft size={17} />
                  <span>Anterior</span>
                </button>

                <div className="certificate-page-list">
                  {certificatePaginationItems.map((pageItem, index) =>
                    pageItem === 'ellipsis' ? (
                      <span className="certificate-page-ellipsis" key={`ellipsis-${index}`}>
                        ...
                      </span>
                    ) : (
                      <button
                        className={`certificate-page-button${certificatePage === pageItem ? ' is-active' : ''}`}
                        type="button"
                        aria-current={certificatePage === pageItem ? 'page' : undefined}
                        aria-label={`Ir para página ${pageItem}`}
                        key={pageItem}
                        onClick={() => setCertificatePage(pageItem)}
                      >
                        {pageItem}
                      </button>
                    ),
                  )}
                </div>

                <button
                  className="certificate-page-control"
                  type="button"
                  disabled={certificatePage === totalCertificatePages}
                  onClick={() => setCertificatePage((currentPage) => Math.min(totalCertificatePages, currentPage + 1))}
                >
                  <span>Próxima</span>
                  <ChevronRight size={17} />
                </button>
              </nav>
            )}
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
