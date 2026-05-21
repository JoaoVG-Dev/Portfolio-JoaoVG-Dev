import { useEffect, useState } from 'react';
import {
  Award,
  BriefcaseBusiness,
  FolderKanban,
  Plus,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { fetchDashboardSummary, type DashboardSummary } from '../../lib/adminRepository';

type AdminDashboardProps = {
  onNavigate: (href: string) => void;
};

const shortcuts = [
  { label: 'Novo projeto', href: '/admin/projects?new=1', icon: FolderKanban },
  { label: 'Nova tecnologia', href: '/admin/technologies?new=1', icon: Sparkles },
  { label: 'Novo certificado', href: '/admin/certificates?new=1', icon: Award },
  { label: 'Nova experiência', href: '/admin/experiences?new=1', icon: BriefcaseBusiness },
];

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchDashboardSummary()
      .then((nextSummary) => {
        if (isMounted) {
          setSummary(nextSummary);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totals = summary?.totals ?? {
    projects: 0,
    technologies: 0,
    certificates: 0,
    experiences: 0,
  };

  const totalContent = totals.projects + totals.technologies + totals.certificates + totals.experiences;

  return (
    <section className="admin-page-stack">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Dashboard protegido</p>
        <h1>CMS do portfólio</h1>
        <p>Gerencie o conteúdo principal do portfólio sem tocar no código da vitrine pública.</p>
      </header>

      {errorMessage && (
        <div className="admin-alert">
          <TriangleAlert size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isLoading && !errorMessage && totalContent === 0 && (
        <div className="admin-alert">
          <TriangleAlert size={20} />
          <span>O Supabase ainda não tem dados publicados. Rode o seed inicial ou crie itens pelo CMS.</span>
        </div>
      )}

      <section className="admin-summary-grid" aria-label="Resumo do conteúdo">
        <article className="admin-summary-card">
          <FolderKanban size={20} />
          <strong>{isLoading ? '...' : totals.projects}</strong>
          <span>Projetos</span>
        </article>
        <article className="admin-summary-card">
          <Sparkles size={20} />
          <strong>{isLoading ? '...' : totals.technologies}</strong>
          <span>Tecnologias</span>
        </article>
        <article className="admin-summary-card">
          <Award size={20} />
          <strong>{isLoading ? '...' : totals.certificates}</strong>
          <span>Certificados</span>
        </article>
        <article className="admin-summary-card">
          <BriefcaseBusiness size={20} />
          <strong>{isLoading ? '...' : totals.experiences}</strong>
          <span>Experiências</span>
        </article>
      </section>

      <section className="admin-shortcut-grid" aria-label="Atalhos">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;

          return (
            <button
              className="admin-shortcut-card"
              type="button"
              key={shortcut.href}
              onClick={() => onNavigate(shortcut.href)}
            >
              <Icon size={22} />
              <span>{shortcut.label}</span>
              <Plus size={18} />
            </button>
          );
        })}
      </section>

      <section className="admin-panel">
        <header className="admin-section-header">
          <div>
            <p className="admin-eyebrow">Atividade</p>
            <h2>Últimos itens cadastrados</h2>
          </div>
        </header>

        <div className="admin-recent-list">
          {isLoading && <p className="cms-empty-state">Carregando últimos itens...</p>}
          {!isLoading && summary?.recentItems.length === 0 && (
            <p className="cms-empty-state">Nenhum item cadastrado ainda.</p>
          )}
          {!isLoading &&
            summary?.recentItems.map((item) => (
              <article className="admin-recent-row" key={`${item.type}-${item.id}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.type}</span>
                </div>
                <time>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : 'Sem data'}</time>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}
