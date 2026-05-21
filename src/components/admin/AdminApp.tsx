import { useEffect, useMemo, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { cmsResourceConfigs } from '../../config/cmsResources';
import { useAuthSession } from '../../hooks/useAuthSession';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AdminDashboard } from './AdminDashboard';
import { AdminLayout, type AdminRouteKey } from './AdminLayout';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminProfileSettings } from './AdminProfileSettings';
import { AdminResourcePage } from './AdminResourcePage';
import '../../styles/admin.css';

function getRouteFromPath(pathname: string): AdminRouteKey | 'login' {
  if (pathname === '/admin/login') {
    return 'login';
  }

  if (pathname === '/admin/projects') {
    return 'projects';
  }

  if (pathname === '/admin/technologies') {
    return 'technologies';
  }

  if (pathname === '/admin/certificates') {
    return 'certificates';
  }

  if (pathname === '/admin/experiences') {
    return 'experiences';
  }

  if (pathname === '/admin/profile' || pathname === '/admin/settings') {
    return 'profile';
  }

  return 'dashboard';
}

export function AdminApp() {
  const { session, isAdmin, isLoading, authError, signIn, signOut } = useAuthSession();
  const [path, setPath] = useState(window.location.pathname);

  const route = getRouteFromPath(path);

  const resourceConfig = useMemo(() => {
    if (route === 'login' || route === 'dashboard' || route === 'profile') {
      return null;
    }

    return cmsResourceConfigs.find((config) => config.key === route) ?? null;
  }, [route]);

  function navigate(href: string, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', href);
    } else {
      window.history.pushState({}, '', href);
    }

    setPath(window.location.pathname);
  }

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session && route !== 'login') {
      navigate('/admin/login', true);
    }

    if (session && isAdmin && route === 'login') {
      navigate('/admin', true);
    }
  }, [isLoading, isAdmin, route, session]);

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <KeyRound size={32} />
            <h1>Configuração do Supabase pendente</h1>
            <p>
              Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em um `.env`
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

  if (isLoading) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <ShieldCheck size={34} />
            <p className="admin-eyebrow">Validando sessão</p>
            <h1>Conferindo permissões do CMS</h1>
            <p>Estamos confirmando se o usuário atual tem acesso administrativo.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!session || route === 'login') {
    return <AdminLoginPage authError={authError} isLoading={isLoading} onSignIn={signIn} />;
  }

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-auth-copy">
            <ShieldCheck size={34} />
            <h1>Acesso administrativo não liberado</h1>
            <p>
              Este usuário existe no Auth, mas precisa estar cadastrado em `public.profiles`
              com `role = 'admin'`.
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

  const activeRoute = route;

  return (
    <AdminLayout
      activeRoute={activeRoute}
      userEmail={session.user.email ?? 'admin'}
      onSignOut={signOut}
      onNavigate={navigate}
    >
      {activeRoute === 'dashboard' && <AdminDashboard onNavigate={navigate} />}
      {activeRoute === 'profile' && <AdminProfileSettings />}
      {resourceConfig && <AdminResourcePage config={resourceConfig} />}
    </AdminLayout>
  );
}
