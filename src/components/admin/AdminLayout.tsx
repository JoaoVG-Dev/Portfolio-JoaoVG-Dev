import { ReactNode, useState } from 'react';
import {
  Award,
  BriefcaseBusiness,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

export type AdminRouteKey =
  | 'dashboard'
  | 'projects'
  | 'technologies'
  | 'certificates'
  | 'experiences'
  | 'profile';

export type AdminNavItem = {
  key: AdminRouteKey;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const adminNavItems: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'projects', label: 'Projetos', href: '/admin/projects', icon: FolderKanban },
  { key: 'technologies', label: 'Tecnologias', href: '/admin/technologies', icon: Sparkles },
  { key: 'certificates', label: 'Certificados', href: '/admin/certificates', icon: Award },
  { key: 'experiences', label: 'Experiências', href: '/admin/experiences', icon: BriefcaseBusiness },
  { key: 'profile', label: 'Perfil', href: '/admin/profile', icon: Settings },
];

type AdminLayoutProps = {
  activeRoute: AdminRouteKey;
  userEmail: string;
  onSignOut: () => Promise<void>;
  onNavigate: (href: string) => void;
  children: ReactNode;
};

export function AdminLayout({
  activeRoute,
  userEmail,
  onSignOut,
  onNavigate,
  children,
}: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleNavigate(href: string) {
    setIsMenuOpen(false);
    onNavigate(href);
  }

  const nav = (
    <nav className="admin-nav" aria-label="Navegação do CMS">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeRoute === item.key;

        return (
          <a
            className={isActive ? 'is-active' : undefined}
            href={item.href}
            key={item.key}
            onClick={(event) => {
              event.preventDefault();
              handleNavigate(item.href);
            }}
          >
            <Icon size={18} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/" aria-label="Voltar ao portfólio">
          JoãoVG
        </a>
        {nav}
        <a className="admin-portfolio-link" href="/">
          <Home size={18} />
          Ver portfólio
        </a>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="admin-user-meta">
            <span>Administrador</span>
            <strong>{userEmail}</strong>
          </div>

          <button className="admin-logout-button" type="button" onClick={onSignOut}>
            <LogOut size={18} />
            Sair
          </button>
        </header>

        {isMenuOpen && (
          <div className="admin-mobile-overlay" role="presentation">
            <aside className="admin-mobile-drawer" aria-label="Menu mobile do CMS">
              <div className="admin-drawer-header">
                <span className="admin-logo">JoãoVG</span>
                <button type="button" aria-label="Fechar menu" onClick={() => setIsMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {nav}
            </aside>
          </div>
        )}

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

