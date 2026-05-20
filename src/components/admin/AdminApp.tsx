import { FormEvent, useMemo, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  FileBadge2,
  FolderKanban,
  KeyRound,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cmsResourceConfigs } from '../../config/cmsResources';
import { useAuthSession } from '../../hooks/useAuthSession';
import { usePortfolioContent } from '../../hooks/usePortfolioContent';
import { isSupabaseConfigured } from '../../lib/supabase';
import { CmsResourceManager } from './CmsResourceManager';
import '../../styles/admin.css';
import type { CmsResourceKey } from '../../types/cms';

const resourceIcons: Record<CmsResourceKey, LucideIcon> = {
  projects: FolderKanban,
  technologies: Sparkles,
  certificates: FileBadge2,
  experiences: BriefcaseBusiness,
};

export function AdminApp() {
  const { session, isAdmin, isLoading, authError, signIn, signOut } = useAuthSession();
  const { content } = usePortfolioContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dashboardStats = useMemo(
    () => [
      { label: 'Projetos', value: content.projects.length },
      { label: 'Tecnologias', value: content.technologies.length },
      { label: 'Certificados', value: content.certificates.length },
      { label: 'Experiências', value: content.experiences.length },
    ],
    [content],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await signIn({ email, password });
    setIsSubmitting(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <KeyRound size={32} />
            <h1>Configuração do Supabase pendente</h1>
            <p>
              Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em um `.env`
              local para ativar autenticação e CMS.
            </p>
          </div>
          <a className="admin-secondary-link" href="/">
            Voltar ao portfólio
          </a>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <ShieldCheck size={34} />
            <p className="admin-eyebrow">Portfolio CMS</p>
            <h1>Entrar no painel administrativo</h1>
            <p>Use o e-mail autorizado no Supabase para editar o conteúdo público.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {authError && <p className="admin-form-error">{authError}</p>}
            <button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? 'Validando...' : 'Entrar'}
            </button>
          </form>

          <a className="admin-secondary-link" href="/">
            Voltar ao portfólio
          </a>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <ShieldCheck size={34} />
            <h1>Acesso administrativo não liberado</h1>
            <p>
              Este usuário existe no Auth, mas precisa estar cadastrado em
              `public.admin_users`.
            </p>
          </div>
          {authError && <p className="admin-form-error">{authError}</p>}
          <button className="admin-danger-button" type="button" onClick={signOut}>
            Sair
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/">
          JoãoVG
        </a>
        <nav aria-label="Navegação do CMS">
          {cmsResourceConfigs.map((config) => {
            const Icon = resourceIcons[config.key];

            return (
              <a key={config.key} href={`#${config.key}`}>
                <Icon size={18} />
                {config.title}
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Dashboard protegido</p>
            <h1>CMS do portfólio</h1>
          </div>
          <button type="button" onClick={signOut}>
            <LogOut size={18} />
            Sair
          </button>
        </header>

        <section className="admin-summary-grid" aria-label="Resumo do conteúdo">
          {dashboardStats.map((stat) => (
            <article className="admin-summary-card" key={stat.label}>
              <BarChart3 size={20} />
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <div className="cms-resource-stack">
          {cmsResourceConfigs.map((config) => (
            <CmsResourceManager config={config} key={config.key} />
          ))}
        </div>
      </main>
    </div>
  );
}
